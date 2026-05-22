"""Health check endpoint."""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health")
async def health_check() -> JSONResponse:
    """Return service liveness status."""
    return JSONResponse({"status": "ok", "service": "paadum-meen-backend"})
