"""Application configuration loaded from app.toml and environment variables."""

import logging
import tomllib
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load .env relative to the backend root (one level above src/)
_BACKEND_ROOT = Path(__file__).parent.parent
load_dotenv(_BACKEND_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    """Immutable application settings."""

    openai_api_key: str
    model: str
    voice: str
    system_prompt_path: str
    idle_timeout_seconds: int
    system_prompt: str


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the singleton Settings instance, loading files on first call."""
    import os

    toml_path = _BACKEND_ROOT / "app.toml"
    with toml_path.open("rb") as fh:
        config = tomllib.load(fh)

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        logger.warning("OPENAI_API_KEY is not set — realtime calls will fail")

    prompt_path = _BACKEND_ROOT / config["system_prompt_path"]
    system_prompt = prompt_path.read_text(encoding="utf-8")
    logger.info("Loaded system prompt from %s (%d chars)", prompt_path, len(system_prompt))

    return Settings(
        openai_api_key=api_key,
        model=config["model"],
        voice=config["voice"],
        system_prompt_path=config["system_prompt_path"],
        idle_timeout_seconds=int(config["idle_timeout_seconds"]),
        system_prompt=system_prompt,
    )
