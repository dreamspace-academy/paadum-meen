"""FastAPI application entry point for Paadum Meen backend."""

import logging
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.routes import health, metrics, realtime, session

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage shared resources across the application lifetime."""
    logger.info("Starting Paadum Meen backend")
    settings = get_settings()
    logger.info("Loaded config — model=%s voice=%s", settings.model, settings.voice)

    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    try:
        yield
    finally:
        await app.state.http_client.aclose()
        logger.info("Paadum Meen backend shut down")


app = FastAPI(
    title="Paadum Meen Backend",
    description="Voice kiosk API for the Paadum Meen mascot at Batticaloa Library",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def attach_request_id(request: Request, call_next):  # type: ignore[no-untyped-def]
    """Generate and log a unique request ID for every incoming request."""
    request_id = str(uuid.uuid4())
    logger.info("request_id=%s %s %s", request_id, request.method, request.url.path)
    response = await call_next(request)
    return response


# Routers without prefix
app.include_router(health.router)
app.include_router(metrics.router)

# Routers under /api
app.include_router(realtime.router, prefix="/api")
app.include_router(session.router, prefix="/api")
