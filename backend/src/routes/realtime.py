"""OpenAI Realtime session proxy endpoint."""

import logging

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from prometheus_client import Counter

from src.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter()

OPENAI_REALTIME_CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets"

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

    # GA API body: POST /v1/realtime/client_secrets.
    # - session.type = "realtime" (required, distinguishes speech-to-speech from transcription)
    # - voice lives at session.audio.output.voice
    # - turn_detection lives at session.audio.input.turn_detection
    # - input transcription lives at session.audio.input.transcription
    # - instructions remains at session.instructions
    # - Do NOT send an OpenAI-Beta header (beta API shape is disabled)
    payload = {
        "session": {
            "type": "realtime",
            "model": settings.model,
            "instructions": settings.system_prompt,
            "audio": {
                "input": {
                    "transcription": {"model": "gpt-4o-transcribe"},
                    "turn_detection": {"type": "server_vad"},
                },
                "output": {
                    "voice": settings.voice,
                },
            },
        }
    }

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = await client.post(OPENAI_REALTIME_CLIENT_SECRETS_URL, json=payload, headers=headers)
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
    # The GA /v1/realtime/client_secrets endpoint returns:
    #   { value, expires_at, session }
    # The frontend expects the legacy shape:
    #   { client_secret: { value, expires_at }, ...session_fields }
    # Reshape here so the frontend contract is preserved.
    raw = response.json()
    shaped = {
        **raw.get("session", {}),
        "client_secret": {
            "value": raw["value"],
            "expires_at": raw["expires_at"],
        },
    }
    return JSONResponse(shaped, status_code=200)
