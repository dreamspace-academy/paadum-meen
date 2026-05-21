# Paadum Meen — Requirements

**Version:** v1 (MVP) **Date:** 2026-05-21

---

## v1 Requirements

### Kiosk UI

- [ ] **KIOSK-01**: User sees a portrait 9:16 kiosk layout that feels like a display, not a website
- [ ] **KIOSK-02**: User sees a moonlit Batticaloa river background with Kallady Bridge, full moon, twinkling stars, gentle water movement, and bubbles
- [ ] **KIOSK-03**: User sees floating suggested-question bubbles during idle state that gently fade and rotate (visual hints only, not clickable)
- [ ] **KIOSK-04**: User sees a "Hold Space to talk" instruction that clearly communicates the only available visitor interaction
- [ ] **KIOSK-05**: User sees subtitles during the speaking state when the AI model provides reliable transcript events
- [ ] **KIOSK-06**: User sees a short non-technical error message ("Something went wrong. Please try again.") when errors occur
- [ ] **KIOSK-07**: Admin can click a visible Reset Session button to reset the active session at any time

### Voice Interaction

- [ ] **VOICE-01**: User can hold the Space key to start talking to the fish
- [ ] **VOICE-02**: User can release the Space key to commit their speech and trigger the AI response
- [ ] **VOICE-03**: User hears the AI voice response played through the browser speaker with low perceived latency
- [ ] **VOICE-04**: App connects directly to OpenAI Realtime API over WebRTC using an ephemeral client secret from the backend
- [ ] **VOICE-05**: App keeps the WebRTC connection warm while running to avoid repeated session creation delay
- [ ] **VOICE-06**: App does not stream microphone audio unless the visitor is actively holding Space (no always-listening behavior)
- [ ] **VOICE-07**: App ignores repeated Space keydown events from key repeat while already in listening state
- [ ] **VOICE-08**: App ignores stale Space keyup events after admin reset or error recovery

### Mascot & Animation

- [ ] **MASCOT-01**: User sees an animated 2D layered singing fish mascot built from the designed Figma assets (body, tail, fins/hair, eyes, mouth)
- [ ] **MASCOT-02**: Fish gently bobs and moves tail/fins during idle state with music notes floating from its mouth
- [ ] **MASCOT-03**: Fish becomes visually attentive and a smooth audio visualizer appears during listening state
- [ ] **MASCOT-04**: Fish shows a thinking animation (bubbles, dots, or subtle music note animation) during thinking state
- [ ] **MASCOT-05**: Fish mouth animates during speaking state, loosely following output audio amplitude where possible
- [ ] **MASCOT-06**: Music notes float from the fish's mouth during speaking state
- [ ] **MASCOT-07**: Fish remains briefly attentive during returning state before returning to idle
- [ ] **MASCOT-08**: Fish shows a simple error/recovery expression during error state
- [ ] **MASCOT-09**: Listening audio visualizer is driven by microphone input amplitude and disappears when listening ends
- [ ] **MASCOT-10**: Suggested question bubbles fade or dim during listening/thinking/speaking and return during idle

### Session Lifecycle

- [ ] **SESSION-01**: App creates an OpenAI Realtime session on startup and enters idle state when ready
- [ ] **SESSION-02**: App automatically resets conversation context and returns fish to idle after 30 seconds of inactivity following a response
- [ ] **SESSION-03**: Admin manual reset stops microphone capture, stops AI audio, clears subtitles, clears conversation state, closes RTC connection, notifies backend, and creates a fresh session
- [ ] **SESSION-04**: New visitor speech before the 30-second idle timeout cancels the timer and resumes the conversation
- [ ] **SESSION-05**: App recreates the realtime session automatically when the session is expired or disconnected before a new interaction
- [ ] **SESSION-06**: App enters error state (not crash) when WebRTC connection fails during an active interaction

### Language

- [ ] **LANG-01**: User can switch the UI language between English, Tamil, and Sinhala using a visible language selector
- [ ] **LANG-02**: Suggested question bubbles display text in the selected UI language
- [ ] **LANG-03**: AI responds in the visitor's spoken language when possible (controlled by system prompt, not frontend)

### Backend

- [ ] **BACKEND-01**: Backend creates OpenAI Realtime ephemeral sessions with model, voice, and system prompt injected, and returns only the ephemeral client secret to the frontend
- [ ] **BACKEND-02**: Backend never exposes the real OpenAI API key to the frontend or in logs
- [ ] **BACKEND-03**: Backend exposes `GET /health` with status and configuration checks (processAlive, openaiApiKeyConfigured, openaiRealtimeConfigured, metricsEnabled)
- [ ] **BACKEND-04**: Backend exposes `GET /metrics` with Prometheus-compatible metrics (sessions created, resets, errors, estimated cost)
- [ ] **BACKEND-05**: Backend accepts `POST /api/session/reset` and logs reset reason, previous state, and session IDs
- [ ] **BACKEND-06**: Backend loads system prompt from a server-side file and injects it at session creation; frontend does not own the authoritative system prompt
- [ ] **BACKEND-07**: Backend loads non-secret configuration (model, voice, timeouts, language settings) from a TOML file

### Safety & Privacy

- [ ] **SAFETY-01**: AI mascot behavior, topic boundaries, child-safety rules, and multilingual behavior are controlled by the server-owned system prompt
- [ ] **SAFETY-02**: App does not store visitor conversations, raw audio, or full transcript history
- [ ] **SAFETY-03**: Conversation context clears automatically after idle timeout and after manual reset

### Testing

- [ ] **TEST-01**: Frontend state machine, keyboard handling, idle timer, and language logic are covered by Vitest unit tests
- [ ] **TEST-02**: Browser-level app flows (load, idle state, Space keydown/keyup, reset, error) are covered by Playwright E2E tests
- [ ] **TEST-03**: Backend endpoints (health, session creation, reset, metrics) are covered by pytest tests
- [ ] **TEST-04**: Automated tests do not require live OpenAI calls; real OpenAI smoke tests are gated behind `RUN_OPENAI_SMOKE_TESTS=true`

---

## v2 Requirements (Deferred)

- Admin dashboard for configuration changes without editing files
- Analytics dashboard with Prometheus/Grafana local deployment
- Output moderation layer beyond system prompt
- Touch/mobile layout for tablet deployments
- Library catalogue integration

---

## Out of Scope

- Text chat input — voice-only is the core interaction design
- Visitor-facing clickable buttons — Space key is the only visitor control
- Mobile or tablet layout — desktop kiosk portrait display only for MVP
- User accounts or authentication — public kiosk, no login required
- Database or persistent storage — no visitor data should be retained
- Separate STT/TTS pipeline — direct speech-to-speech model chosen
- 3D fish rig — 2D layered assets are sufficient and already designed
- Camera interaction, face recognition — not appropriate for public kiosk MVP
- Backend audio proxy — browser owns WebRTC and audio; backend stays thin
- Book recommendations or library catalogue search — separate system concern
- Long-term memory — privacy requirement: context resets after each idle timeout

---

## Traceability

| REQ-ID | Phase |
|--------|-------|
| KIOSK-01 to KIOSK-07 | TBD — roadmap |
| VOICE-01 to VOICE-08 | TBD — roadmap |
| MASCOT-01 to MASCOT-10 | TBD — roadmap |
| SESSION-01 to SESSION-06 | TBD — roadmap |
| LANG-01 to LANG-03 | TBD — roadmap |
| BACKEND-01 to BACKEND-07 | TBD — roadmap |
| SAFETY-01 to SAFETY-03 | TBD — roadmap |
| TEST-01 to TEST-04 | TBD — roadmap |
