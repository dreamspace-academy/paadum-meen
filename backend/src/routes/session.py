"""Session management endpoints."""

import logging
from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from prometheus_client import Counter
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

resets_total = Counter(
    "paadum_meen_resets_total",
    "Total number of session resets",
    ["reason"],
)

ResetReason = Literal["idle_timeout", "manual"]


class ResetRequest(BaseModel):
    """Optional body for reset endpoint."""

    reason: ResetReason = "manual"


@router.post("/session/reset")
async def reset_session(body: ResetRequest = ResetRequest()) -> JSONResponse:
    """Reset the current kiosk session and return a confirmation timestamp."""
    resets_total.labels(reason=body.reason).inc()
    reset_at = datetime.now(UTC).isoformat()
    logger.info("Session reset — reason=%s at=%s", body.reason, reset_at)
    return JSONResponse({"status": "ok", "reset_at": reset_at})
