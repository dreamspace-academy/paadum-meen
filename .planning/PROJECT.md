# Paadum Meen

## What This Is

Paadum Meen is a browser-based portrait-mode voice kiosk featuring an animated singing fish mascot placed at Batticaloa Public Library and MakerSpace by DreamSpace. Visitors hold the Space key to speak with the fish, which responds with AI-generated voice about MakerSpace, DreamSpace Academy, Batticaloa, and the Public Library. It runs locally on a kiosk machine and requires no login, no touch input, and no text input — just voice.

## Core Value

A child walks up, holds Space, speaks in Tamil or English, and the singing fish of Batticaloa answers with warmth and local identity — no setup, no confusion, no general-purpose chatbot behavior.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Portrait 9:16 kiosk UI that feels like a display, not a website
- [ ] Animated 2D layered singing fish mascot (body, tail, fins, eyes, mouth, music notes)
- [ ] Moonlit Batticaloa river background with Kallady Bridge, moon, stars, bubbles
- [ ] Hold-Space-to-talk visitor interaction (only control available to visitor)
- [ ] Direct speech-to-speech AI conversation via OpenAI Realtime API over WebRTC
- [ ] 6 fish animation states: idle, listening, thinking, speaking, returning, error
- [ ] Listening audio visualizer driven by microphone amplitude
- [ ] Fish mouth animation driven by output audio amplitude during speaking
- [ ] Music notes floating from fish mouth during idle and speaking
- [ ] Floating suggested-question bubbles (visual hints only, not clickable)
- [ ] Optional subtitles when transcript events are available
- [ ] 30-second idle timeout — clears conversation context, returns to idle
- [ ] Admin Reset Session button (mouse-only, for facilitator use)
- [ ] Multilingual UI: English, Tamil, Sinhala
- [ ] System-prompt-based topic control (DreamSpace-first, child-safe)
- [ ] FastAPI backend that creates OpenAI Realtime ephemeral sessions and hides API key
- [ ] Backend health, metrics, and reset endpoints
- [ ] No database, no auth, no audio proxy

### Out of Scope

- Text chat or text input — voice-only is the design intent
- Touch or mobile layout — desktop kiosk with keyboard only for MVP
- Library catalogue search or book recommendations — separate system concern
- Admin dashboard or CMS — system prompt file is the configuration mechanism
- Long-term memory or transcript storage — privacy and kiosk context reset requirements
- Output moderation layer — system prompt handles guardrails for MVP
- 3D fish rig — 2D layered SVG/PNG approach chosen for simplicity
- Camera, face recognition, or user identification — not appropriate for public kiosk MVP
- Prometheus/Grafana local deployment — `/metrics` endpoint only for MVP
- Separate STT/TTS pipeline — direct speech-to-speech model chosen

## Context

The mascot (Paadum Meen) is already designed in Figma and exported as layered PNG parts (body, tail, hair, eyes-mouth, top) in `tmp/assets/mascot-parts/` and a full SVG mockup in `tmp/assets/mascot-mockup.svg`. The system prompt is authored and ready at `tmp/system-pompt.md` — it defines mascot identity, DreamSpace facts, topic boundaries, child-safety rules, and multilingual behavior.

The kiosk will initially be deployed at Batticaloa Public Library, which opened recently. The experience should feel locally rooted — Kallady Bridge, the lagoon, the singing fish legend — not like a generic AI assistant.

The project is greenfield: React + TypeScript + Vite frontend, Python + FastAPI backend, connected via OpenAI Realtime ephemeral token WebRTC flow. Frontend runs at `localhost:5173`, backend at `localhost:8000`, no reverse proxy for MVP.

## Constraints

- **Tech Stack**: React + TypeScript + Vite (frontend), Python + FastAPI + uv (backend) — defined in architecture doc
- **AI Transport**: OpenAI Realtime API via WebRTC ephemeral token flow — decided in architecture; backend must not proxy live audio
- **Deployment**: Local-first, single kiosk machine, localhost — no cloud deployment required for MVP
- **Privacy**: No persistent visitor data, no audio storage, no long-term memory — public kiosk in a space used by children
- **Security**: Real OpenAI API key stays server-side only; frontend receives ephemeral client secret only
- **Safety**: Child-friendly, public-space safe, system prompt is the guardrail mechanism for MVP
- **Multilingual**: Must support English, Tamil, and Sinhala UI — Batticaloa is a Tamil-majority city with multilingual visitors

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| OpenAI Realtime API (WebRTC, ephemeral token flow) | Direct speech-to-speech avoids STT→LLM→TTS pipeline complexity; browser owns audio | — Pending |
| Frontend-heavy, thin-backend architecture | Browser owns WebRTC, audio, state, animation; backend only creates sessions and hides secrets | — Pending |
| Hold-to-talk (Space key) only | Public kiosk — no always-listening; explicit, safe, child-appropriate | — Pending |
| System prompt as only guardrail for MVP | Direct speech-to-speech output filtering adds complexity; acceptable for MVP | — Pending |
| 2D layered PNG/SVG mascot (no 3D) | Simpler to build, animate with CSS/Framer Motion; mascot already designed this way | — Pending |
| No database for MVP | No user accounts, no transcript storage, no CMS needed; kiosk resets after 30s | — Pending |
| Vitest + Playwright (frontend), pytest (backend) | Standard repeatable CLI-runnable tests; real OpenAI calls gated behind env flag | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-21 after initialization*
