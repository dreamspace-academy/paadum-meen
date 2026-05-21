# Paadum Meen — Project Guide

## What This Is

A voice-only kiosk with an animated singing fish mascot (Paadum Meen) for Batticaloa Public Library and MakerSpace by DreamSpace. Visitors hold the Space key to speak with the fish; the fish responds with AI-generated voice. Runs locally on a kiosk machine with no login, no touch input, no text input.

## Architecture

```
Frontend (React + TypeScript + Vite)   →   OpenAI Realtime API (WebRTC)
       ↕ HTTP                                        ↑ ephemeral secret
Backend (Python + FastAPI)             →   OpenAI API (session creation only)
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Frontend holds WebRTC connection directly to OpenAI Realtime
- Backend creates ephemeral client secrets; never proxies live audio

## Key Files

```
docs/mvp-spec.md            — Product requirements and scope
docs/system-architecture.md — Technical architecture decisions
docs/api-contract.md        — Backend API contract
tmp/system-pompt.md         — AI mascot system prompt (copy to backend/app/config/)
tmp/assets/mascot-parts/    — Layered fish PNG assets (body, tail, hair, eyes-mouth, top)
tmp/assets/mascot-mockup.svg — Full mascot SVG reference
.planning/PROJECT.md        — Living project context
.planning/REQUIREMENTS.md  — v1 requirements with REQ-IDs
.planning/ROADMAP.md        — 4-phase execution roadmap
```

## Development Commands

**Frontend:**
```bash
cd frontend
npm install
npm run dev
npm test              # Vitest unit tests
npx playwright test   # E2E browser tests
```

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
uv run pytest -v
```

## GSD Workflow

This project uses the GSD planning workflow. Phases execute in order:

1. **Phase 1: Working Voice** — Backend + WebRTC + fish talks back
2. **Phase 2: Animated Kiosk** — Full mascot, background, all 6 animation states
3. **Phase 3: Language & Admin Polish** — Multilingual UI, admin reset
4. **Phase 4: Tests & Production-Readiness** — Full test coverage, MCP-assisted QA

Commands:
- `/gsd:plan-phase 1` — Plan the next phase
- `/gsd:discuss-phase 1` — Discuss approach before planning
- `/gsd:progress` — Check project status

## Critical Architecture Rules

- **Never expose** the real OpenAI API key to the frontend or in logs
- **Frontend owns** WebRTC, audio, animation state, idle timeout, local reset
- **Backend owns** secrets, ephemeral session creation, system prompt, TOML config
- **No audio proxy** — backend must not relay live microphone or speaker audio
- **No always-listening** — microphone captures only while Space is held
- **System prompt** is the only guardrail for MVP (no output moderation layer)

## Fish State Machine

```
idle → [Space keydown] → listening
listening → [Space keyup] → thinking
thinking → [first AI audio] → speaking
speaking → [response.done] → returning
returning → [30s timeout] → idle (clear context)
returning → [Space keydown] → listening (cancel timer)
any → [error] → error
error → [admin reset] → idle
```

## Test Strategy

- **Vitest**: State machine, keyboard handling, idle timer, language logic
- **Playwright**: Browser E2E flows (load, Space key, reset, error)
- **pytest**: Backend endpoints, health, metrics, secret-not-exposed checks
- **Playwright MCP / Chrome DevTools MCP**: Live browser inspection, console log review, visual QA
- Normal test runs **must not** require live OpenAI calls
- Real OpenAI smoke tests gated behind `RUN_OPENAI_SMOKE_TESTS=true`

## Environment

```bash
# backend/.env
OPENAI_API_KEY=sk-...

# frontend (not secret)
VITE_BACKEND_BASE_URL=http://localhost:8000
```
