# Roadmap: Paadum Meen

## Overview

Four vertical MVP phases that each deliver observable, end-to-end value. Phase 1 proves the core voice loop — backend, WebRTC, and a talking fish. Phase 2 makes the kiosk visually alive with the full mascot, background, and all six animation states. Phase 3 adds language selection, multilingual content, and the fully wired admin reset. Phase 4 locks in test coverage and production-readiness so the kiosk can run unattended at Batticaloa Public Library.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Working Voice** - Backend, WebRTC, and OpenAI Realtime connected; fish talks back with a minimal kiosk shell
- [ ] **Phase 2: Animated Kiosk** - Full mascot, Batticaloa background, all six fish states, listening visualizer, and idle session lifecycle
- [ ] **Phase 3: Language & Admin Polish** - Language selector, multilingual bubbles, and fully wired admin reset
- [ ] **Phase 4: Tests & Production-Readiness** - Full Vitest, Playwright, and pytest coverage with gated smoke tests

## Phase Details

### Phase 1: Working Voice
**Goal:** A visitor can hold Space and hear the fish respond by voice, with the API key secured server-side and the WebRTC session kept warm
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** BACKEND-01, BACKEND-02, BACKEND-03, BACKEND-04, BACKEND-05, BACKEND-06, BACKEND-07, VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05, VOICE-06, VOICE-07, VOICE-08, SESSION-01, SESSION-05, SESSION-06, SAFETY-01, SAFETY-02, SAFETY-03, KIOSK-01, KIOSK-04, KIOSK-06
**Success Criteria** (what must be TRUE):
  1. Holding Space starts microphone capture and releasing Space triggers the fish to respond by voice through the browser speaker
  2. The frontend never receives or logs the real OpenAI API key — only the ephemeral client secret
  3. The kiosk UI renders in portrait 9:16 and shows the "Hold Space to talk" instruction in the center of the screen
  4. Backend `/health` and `/metrics` endpoints return valid responses and `/api/session/reset` accepts a POST without crashing
  5. When the WebRTC connection fails during an active interaction, the app enters error state and shows "Something went wrong. Please try again." instead of crashing
**Plans:** 4 plans

Plans:
- [ ] 01-01-PLAN.md — Walking skeleton: scaffold backend + frontend + one working voice round-trip
- [ ] 01-02-PLAN.md — Backend complete: /health, /metrics, /api/session/reset, TOML config, system prompt, Prometheus metrics
- [ ] 01-03-PLAN.md — Kiosk shell: KioskFrame, HoldToTalkInstruction, ListeningVisualizer, ErrorMessage, state machine, backend client
- [ ] 01-04-PLAN.md — Session lifecycle: keep-warm, reconnect, idle timeout, stale keyup guard, error recovery
**UI hint:** yes

### Phase 2: Animated Kiosk
**Goal:** The kiosk looks and feels alive — the fish animates through all six states driven by the voice interaction, with the Batticaloa background, music notes, listening visualizer, and 30-second idle reset
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** MASCOT-01, MASCOT-02, MASCOT-03, MASCOT-04, MASCOT-05, MASCOT-06, MASCOT-07, MASCOT-08, MASCOT-09, MASCOT-10, KIOSK-02, KIOSK-03, KIOSK-05, SESSION-02, SESSION-04
**Success Criteria** (what must be TRUE):
  1. The Batticaloa river background with Kallady Bridge, moon, twinkling stars, gentle water movement, and bubbles is visible on screen
  2. The fish mascot visibly transitions through idle, listening, thinking, speaking, returning, and error states in response to visitor interaction
  3. A smooth microphone-amplitude visualizer appears when Space is held and disappears when released
  4. Floating suggested-question bubbles are visible and gently animated during idle and fade or dim during listening, thinking, and speaking
  5. After the AI finishes speaking and no new speech occurs for 30 seconds, the fish returns to idle and conversation context is cleared
**Plans:** TBD
**UI hint:** yes

### Phase 3: Language & Admin Polish
**Goal:** Visitors can switch the UI between English, Tamil, and Sinhala, and the admin can fully reset the session at any time with a visible button
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** LANG-01, LANG-02, LANG-03, KIOSK-07, SESSION-03
**Success Criteria** (what must be TRUE):
  1. A visible language selector lets the visitor switch the UI between English, Tamil, and Sinhala and the suggested question bubbles update to the selected language
  2. The AI responds in the visitor's spoken language when possible (controlled by system prompt, not frontend code)
  3. The admin Reset Session button stops microphone capture, stops AI audio, clears subtitles, clears conversation state, closes the RTC connection, notifies the backend, and creates a fresh session — returning the fish to idle
**Plans:** TBD
**UI hint:** yes

### Phase 4: Tests & Production-Readiness
**Goal:** Automated tests cover frontend state machine logic, browser flows, and backend endpoints; Playwright MCP and Chrome DevTools MCP used for live browser inspection, console log review, and visual QA
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04
**Testing tools:**
  - Vitest (frontend unit/component tests — CLI)
  - Playwright (E2E browser tests — CLI)
  - pytest (backend tests — CLI)
  - Playwright MCP (live browser interaction, screenshot capture, network inspection during development)
  - Chrome DevTools MCP (browser console log inspection, JS error detection, performance profiling)
**Success Criteria** (what must be TRUE):
  1. Vitest unit tests cover state machine transitions, keyboard handling, stale keyup guard, idle timer, and language text selection — and all pass with `npm test`
  2. Playwright E2E tests cover app load, idle state render, Space keydown/keyup flow, admin reset, and error message display — and all pass with `npx playwright test`
  3. pytest tests cover `/health`, `/metrics`, session creation, reset endpoint, and secret-not-in-response checks — and all pass with `uv run pytest`
  4. Normal test runs complete without any live OpenAI API calls; real OpenAI smoke tests only run when `RUN_OPENAI_SMOKE_TESTS=true` is explicitly set
  5. Chrome DevTools MCP confirms zero unexpected JS errors in the browser console during the core visitor flow (idle → listening → thinking → speaking → returning → idle)
**Plans:** TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Working Voice | 0/4 | Not started | - |
| 2. Animated Kiosk | 0/TBD | Not started | - |
| 3. Language & Admin Polish | 0/TBD | Not started | - |
| 4. Tests & Production-Readiness | 0/TBD | Not started | - |
