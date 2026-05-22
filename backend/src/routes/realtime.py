"""OpenAI Realtime session proxy endpoint."""

import logging

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from prometheus_client import Counter

from src.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter()

OPENAI_REALTIME_SESSIONS_URL = "https://api.openai.com/v1/realtime/sessions"

sessions_created_total = Counter(
    "paadum_meen_sessions_created_total",
    "Total number of OpenAI Realtime sessions successfully created",
)

errors_total = Counter(
    "paadum_meen_errors_total",
    "Total number of errors by endpoint",
    ["endpoint"],
)


@router.post("/realtime/session")
async def create_realtime_session(request: Request) -> JSONResponse:
    """Create an OpenAI Realtime session and return the raw response to the client."""
    settings = get_settings()
    client: httpx.AsyncClient = request.app.state.http_client

    payload = {
        "model": settings.model,
        "voice": settings.voice,
        "instructions": settings.system_prompt,
        "input_audio_transcription": {"model": "whisper-1"},
        "turn_detection": {"type": "server_vad"},
    }

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = await client.post(OPENAI_REALTIME_SESSIONS_URL, json=payload, headers=headers)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.error(
            "OpenAI returned HTTP %s for realtime session: %s",
            exc.response.status_code,
            exc.response.text,
        )
        errors_total.labels(endpoint="/api/realtime/session").inc()
        return JSONResponse(
            {"error": "Failed to create realtime session"},
            status_code=exc.response.status_code,
        )
    except httpx.RequestError as exc:
        logger.error("Network error creating realtime session: %s", exc)
        errors_total.labels(endpoint="/api/realtime/session").inc()
        return JSONResponse({"error": "Failed to create realtime session"}, status_code=502)

    sessions_created_total.inc()
    return JSONResponse(response.json(), status_code=200)
