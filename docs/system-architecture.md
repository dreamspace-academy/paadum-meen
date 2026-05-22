# Paadum Meen — System Architecture

**Version:** 0.1.0 **Status:** MVP draft **Date:** 2026-05-21 **Related documents:** `mvp-spec.md`, `api-contract.md`

---

## 1\. Purpose

This document defines the system architecture for the Paadum Meen MVP.

It translates the MVP product requirements and API contract into an implementation blueprint for a coding agent.

The goal is to build a simple, presentable, local-first kiosk app where visitors hold the **Space** key to speak with an animated Batticaloa mermaid mascot. The app uses a direct speech-to-speech AI model through OpenAI Realtime over WebRTC.

This document should guide:

* application structure  
* frontend/backend responsibilities  
* realtime voice flow  
* session lifecycle  
* state management  
* configuration ownership  
* deployment shape  
* logging and metrics  
* implementation boundaries

This document does not redefine the product scope or API contract.

---

## 2\. Architecture Summary

Paadum Meen MVP uses a **frontend-heavy, thin-backend architecture**.

The frontend owns the kiosk experience:

* visual UI  
* mermaid animation
* keyboard interaction  
* microphone lifecycle  
* WebRTC connection lifecycle  
* OpenAI realtime event handling  
* audio playback  
* subtitles  
* state machine  
* idle timeout  
* local reset behavior

The backend stays thin:

* creates OpenAI Realtime sessions  
* hides the real OpenAI API key  
* injects server-owned model/session configuration  
* injects the system prompt  
* records reset events  
* exposes health checks  
* exposes Prometheus-compatible metrics  
* writes useful terminal logs

The backend must not proxy live audio for the MVP.

---

## 3\. Fixed MVP Decisions

### 3.1 Frontend/backend deployment

For MVP, frontend and backend run as separate local processes.

```
Frontend: http://localhost:5173
Backend:  http://localhost:8000
```

No reverse proxy is required for MVP.

No Caddy, nginx, or unified app server is required for MVP.

A future version may serve the built React frontend through FastAPI or a reverse proxy, but the MVP should avoid this complexity.

### 3.2 Realtime transport

The MVP uses the **ephemeral token WebRTC flow**, not the unified interface.

The browser connects directly to OpenAI Realtime using WebRTC.

The backend does not create or own the browser WebRTC peer connection. The backend only creates the OpenAI Realtime session/client-secret configuration using the long-lived OpenAI API key, then returns a short-lived ephemeral client secret to the browser.

The unified interface is intentionally not used for MVP because it puts the application server in the session initialization path and is unnecessary for this local kiosk architecture.

```

React frontend
-> POST /api/realtime/session

FastAPI backend
-> creates OpenAI Realtime session/client secret
-> injects configured model, voice, and system prompt
-> returns ephemeral client secret and safe session metadata

React frontend
-> creates browser WebRTC peer connection
-> connects directly to OpenAI Realtime using ephemeral client secret

OpenAI Realtime
-> receives user audio over WebRTC
-> streams voice response/audio events

React frontend
-> plays audio and animates the mermaid
```

### 3.3 RTC lifecycle decision

The WebRTC connection should be kept warm while the kiosk app is running.

This improves kiosk responsiveness and avoids repeated session creation when users press Space frequently.

Important distinction:

```
Realtime connection lifecycle:
  long-lived while the kiosk app is running
  recreated on app start, expiry, connection failure, or manual reset

Audio capture lifecycle:
  short-lived
  active only while Space is held

Conversation context lifecycle:
  cleared on idle timeout or manual admin reset
```

The app must not become always-listening. Keeping RTC active does not mean microphone audio is continuously captured or sent.

### 3.4 Session reset decision

Idle timeout should clear conversation context and return the UI to idle.

Idle timeout does not need to destroy the RTC connection if it is still healthy and valid.

Manual admin reset should be stronger:

* stop microphone capture  
* stop AI audio playback  
* clear timers  
* clear subtitles  
* clear local session/conversation state  
* close or invalidate the current RTC connection  
* notify backend  
* create a fresh realtime session  
* return to idle

### 3.5 Safety decision

For MVP, safety and topic control rely on the server-owned system prompt.

No output filter, moderation layer, input classifier, transcript classifier, or custom response validator is required for MVP.

This is intentionally simple, but weaker than a production-grade public deployment.

---

## 4\. System Context

```
Visitor
  -> keyboard Space key
  -> browser kiosk UI
  -> microphone

Admin/facilitator
  -> mouse click Reset Session

Browser frontend
  -> FastAPI backend for session creation/reset/health/config-derived values
  -> OpenAI Realtime API over WebRTC for live speech interaction

FastAPI backend
  -> OpenAI API for ephemeral realtime session creation
  -> terminal logs
  -> /metrics endpoint
```

The system runs locally on a single kiosk computer.

No user accounts, database, cloud app server, or backend audio streaming service is required for MVP.

---

## 5\. Technology Stack

### 5.1 Frontend

Recommended stack:

```
React
TypeScript
Vite
CSS/SVG/HTML animation
Web Audio API
Browser MediaDevices API
WebRTC APIs
```

Optional frontend animation helper:

```
Framer Motion
```

Use Framer Motion only if it makes animation implementation simpler. Do not introduce a game engine unless needed.

Avoid PixiJS, Phaser, or full canvas-heavy rendering for MVP unless SVG/CSS proves insufficient.

### 5.2 Backend

Recommended stack:

```
Python
FastAPI
httpx.AsyncClient
pydantic / pydantic-settings
python-dotenv or equivalent env loading
prometheus-client
uvicorn
```

The backend should use async HTTP calls when creating OpenAI realtime sessions.

Avoid blocking `requests` calls inside async FastAPI handlers.

### 5.3 AI

The model must be backend-configured.

The frontend must never hardcode the model ID.

Configuration should allow changing the realtime model without frontend changes.

Example environment/config value:

```
OPENAI_REALTIME_MODEL=<configured realtime model>
```

The exact selected model may change. The architecture must support this.

---

## 6\. Runtime Components

### 6.1 Frontend app

Responsibilities:

* render portrait 9:16 kiosk UI  
* render Batticaloa river background  
* render animated Batticaloa mermaid mascot
* render floating suggested-question bubbles  
* render language selector  
* render admin reset button  
* handle Space keydown/keyup  
* request microphone permission  
* start/stop microphone capture  
* maintain WebRTC connection  
* send user audio to OpenAI Realtime only while Space is held  
* receive OpenAI realtime events  
* play streamed AI audio  
* drive mascot state and animations
* show subtitles if available  
* handle idle timeout  
* perform local reset  
* call backend reset endpoint  
* log useful development diagnostics

### 6.2 Backend app

Responsibilities:

* load `.env` secrets  
* load TOML configuration  
* load system prompt  
* create OpenAI Realtime ephemeral session/client-secret configuration  
* inject configured model, voice, and system prompt into the realtime session  
* return ephemeral client secret/session metadata to frontend  
* expose backend health endpoint    
* expose metrics endpoint  
* accept reset event logs  
* update reset/session metrics  
* write structured terminal logs

Backend must not:

* expose the real OpenAI API key  
* proxy live audio by default  
* store visitor conversations  
* store raw audio  
* own frontend animation state  
* implement text chat  
* implement library catalogue APIs  
* implement book recommendation APIs

### 6.3 OpenAI Realtime API

Responsibilities:

* receive browser microphone audio through WebRTC  
* process direct speech-to-speech interaction  
* stream response audio  
* emit transcript/subtitle events if available  
* emit response lifecycle events  
* emit errors if the realtime session fails

---

## 7\. Frontend Architecture

### 7.1 Suggested folder structure

```
frontend/
  src/
    app/
      App.tsx
      main.tsx
    components/
      KioskFrame.tsx
      MermaidMascot.tsx
      BackgroundScene.tsx
      SuggestedBubbles.tsx
      HoldToTalkInstruction.tsx
      ListeningVisualizer.tsx
      SubtitlePanel.tsx
      LanguageSelector.tsx
      AdminResetButton.tsx
      ErrorMessage.tsx
    state/
      kioskStateMachine.ts
      kioskTypes.ts
      useKioskController.ts
    realtime/
      openaiRealtimeClient.ts
      realtimeEvents.ts
      realtimeTypes.ts
    audio/
      microphone.ts
      audioPlayback.ts
      audioAmplitude.ts
      visualizer.ts
    animation/
      mascotAnimation.ts
      animationTypes.ts
    i18n/
      translations.ts
      useLanguage.ts
    config/
      frontendConfig.ts
    api/
      backendClient.ts
    logging/
      frontendLogger.ts
    styles/
      global.css
      kiosk.css
```

This structure is intentionally modular but not enterprise-heavy.

Avoid unnecessary class hierarchies. Prefer simple functions, React hooks, and typed objects.

### 7.2 State machine

The frontend state machine must use these states:

```
idle
listening
thinking
speaking
returning
error
```

Required transitions:

```
idle
  Space keydown -> listening

listening
  Space keyup -> thinking
  error -> error

thinking
  first AI audio event -> speaking
  error -> error

speaking
  response.done -> returning
  error -> error

returning
  Space keydown before idle timeout -> listening
  idle timeout reached -> idle + clear context

error
  admin reset -> idle after reset/recovery
```

The frontend owns state transitions. The backend must not send animation commands.

### 7.3 Keyboard rules

Visitor interaction is only:

```
Hold Space to talk. Release Space to stop talking.
```

Rules:

* Space keydown starts listening only from valid states.  
* Space keyup stops listening only if current state is `listening`.  
* Ignore repeated keydown events from key repeat.  
* Ignore stale keyup events after admin reset or error recovery.  
* Do not allow text input or other visitor controls.

Required defensive rule:

```ts
if (event.type === "keyup" && event.code === "Space") {
  if (state !== "listening") return;
  stopListeningAndCommitAudio();
}
```

### 7.4 Microphone lifecycle

Microphone capture must be explicit and short-lived.

```
Space keydown:
  request/use microphone stream
  start sending user audio
  enter listening

Space keyup:
  stop/commit user audio input
  keep RTC alive
  enter thinking
```

The app must not continuously stream microphone audio while idle.

If microphone permission is denied, enter `error` state and show the public error message.

### 7.5 WebRTC lifecycle

The WebRTC session should be created on app start and kept warm.

```
App start:
  call POST /api/realtime/session with reason=app_start
  receive ephemeral client secret
  establish WebRTC connection
  enter idle when ready
```

Before starting listening, the frontend should verify connection health:

```ts
if (!rtcSession.isConnected || rtcSession.isExpiredSoon()) {
  await recreateRealtimeSession("connection_recovery");
}
```

If RTC fails during interaction:

```
enter error
show public error
log details
allow admin reset
```

Optional auto-recovery may be added, but admin reset is enough for MVP if auto-recovery adds complexity.

### 7.6 Realtime event handling

The frontend must handle these OpenAI realtime event categories:

```
response.audio.delta
response.audio.done
response.audio_transcript.delta
response.audio_transcript.done
response.done
error
```

Behavior:

```
response.audio.delta:
  enter/keep speaking
  play audio
  animate mouth

response.audio_transcript.delta:
  append subtitle text if subtitles enabled

response.audio_transcript.done:
  finalize current subtitle text

response.done:
  enter returning
  start idle timer
  capture usage details if available

error:
  enter error
  show public error
  log technical detail
```

The frontend must continue working if transcript/subtitle events never arrive.

### 7.7 Audio playback and mouth animation

Voice response is mandatory.

Mermaid mouth animation should follow output audio amplitude where possible.

Fallback behavior:

```
If output amplitude is available:
  map amplitude to mouth open/close level

If output amplitude is not available:
  use simple speaking loop animation while audio is playing
```

Do not block MVP completion on perfect lip sync.

### 7.8 Listening visualizer

During listening:

* show a smooth audio visualizer  
* derive amplitude from microphone input  
* keep visual calm and readable  
* remove visualizer when listening stops

The visualizer is only a UI signal. It should not become a complex audio processing subsystem.

### 7.9 Suggested question bubbles

Suggested bubbles are visual hints only.

They must not be clickable buttons.

Behavior:

```
idle:
  visible and gently animated

listening/thinking/speaking:
  fade or dim

returning:
  remain dim until idle timeout or new speech

idle after reset:
  visible again
```

### 7.10 Language selector

Supported UI languages:

```
en = English
ta = Tamil
si = Sinhala
```

Language selector is frontend-only for MVP.

The backend does not need to receive selected UI language.

AI language behavior is controlled through the system prompt:

* respond in visitor's spoken language when possible  
* use simple English if uncertain  
* keep answers short and child-friendly

---

## 8\. Backend Architecture

### 8.1 Suggested folder structure

```
backend/
  app/
    main.py
    api/
      realtime.py
      reset.py
      health.py
      metrics.py
    core/
      config.py
      logging.py
      errors.py
    services/
      openai_realtime.py
      prompt_loader.py
      metrics_service.py
      reset_service.py
    models/
      realtime_models.py
      reset_models.py
      health_models.py
    config/
      app.toml
      system-prompt.md
  .env.example
  pyproject.toml
```

Use simple modules and functions.

Do not create unnecessary repository/service/entity layers unless they solve a real problem.

### 8.2 Backend endpoints

Required endpoints:

```
POST /api/realtime/session
POST /api/session/reset
GET  /health
GET  /metrics
```

Optional frontend static health file remains frontend-owned:

```
GET /health.json on frontend dev server
```

### 8.3 Realtime session creation

The MVP uses the **ephemeral token WebRTC flow**.

Backend flow:

```

1. Validate request body.
2. Load configured realtime model.
3. Load configured voice.
4. Load system prompt.
5. Use the long-lived OpenAI API key server-side to create an OpenAI Realtime session/client secret.
6. Inject configured model, voice, and system prompt during session/client-secret creation.
7. Return only the ephemeral client secret and safe session metadata to the frontend.
8. Log session creation without secrets.
9. Increment metrics.

````

The backend response should include:

```json
{
  "status": "ok",
  "session": {
    "id": "sess_abc123",
    "clientSecret": "ephemeral_secret_only",
    "expiresAt": "2026-05-21T08:30:00Z",
    "model": "configured-model",
    "voice": "configured-voice"
  },
  "config": {
    "idleTimeoutSeconds": 30,
    "subtitlesEnabled": true,
    "audioInputMode": "hold_to_talk"
  }
}
````

The browser uses `session.clientSecret` to create the WebRTC peer connection directly with OpenAI Realtime.

The backend must not create the browser WebRTC peer connection.

Never log or expose the long-lived OpenAI API key or ephemeral client secret.

### 8.4 Rejected integration path: unified interface

The OpenAI Realtime unified interface is not used for MVP.

Reason:

- The MVP already has a thin-backend architecture.
- The browser owns microphone capture, WebRTC, audio playback, and visual state.
- Live audio should not pass through the backend.
- The backend should only hide secrets and create ephemeral realtime credentials.
- Ephemeral token flow better matches the current API contract and kiosk architecture.

Future versions may reconsider the unified interface if server-side control over SDP/session initialization becomes useful.

### 8.5 Reset endpoint

The reset endpoint records reset events.

Backend does not forcibly close browser WebRTC.

Frontend owns local reset and RTC cleanup.

Backend flow:

```
1. Validate reset request.
2. Log clientSessionId, reason, previousState, openaiSessionId if provided.
3. Increment reset metrics.
4. Return accepted response.
```

If reset logging fails, frontend must still remain reset locally.

### 8.6 Health endpoint

Backend health should be cheap.

Do not create a real OpenAI session on every health check.

Required health checks:

```
processAlive
openaiApiKeyConfigured
openaiRealtimeConfigured
metricsEnabled
```

If OpenAI API key is missing, return degraded status.

### 8.7 Metrics endpoint

Expose Prometheus-compatible metrics at:

```
GET /metrics
```

MVP should expose metrics only.

Do not require Prometheus or Grafana to run locally for MVP.

Recommended metrics:

```
paadum_realtime_sessions_created_total{model}
paadum_realtime_session_create_errors_total{code}
paadum_session_resets_total{reason}
paadum_ai_response_done_total{model?}
paadum_ai_response_errors_total{code}
paadum_estimated_input_audio_seconds_total
paadum_estimated_output_audio_seconds_total
paadum_estimated_cost_usd_total{model}
```

Cost metrics may be estimated if exact provider usage is unavailable.

---

## 9\. Configuration Architecture

### 9.1 Secret configuration

Secrets live in `.env`.

Required:

```
OPENAI_API_KEY=
```

Optional:

```
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
```

Do not store secrets in TOML.

Do not expose `.env` values to frontend.

### 9.2 App configuration

Non-secret configuration lives in TOML.

Recommended file:

```
backend/app/config/app.toml
```

Recommended initial shape:

```
[app]
name = "Paadum Meen"
version = "0.1.0"
environment = "development"

[realtime]
model = "configured-realtime-model"
voice = "configured-voice"
subtitles_enabled = true
session_refresh_margin_seconds = 60

[interaction]
audio_input_mode = "hold_to_talk"
idle_timeout_seconds = 30

[ui]
default_language = "en"
supported_languages = ["en", "ta", "si"]

[logging]
level = "INFO"
structured = true

[metrics]
enabled = true
```

This schema may evolve. Keep it simple.

### 9.3 System prompt configuration

System prompt should live server-side.

Recommended file:

```
backend/app/config/system-prompt.md
```

The backend loads this file and injects it into the OpenAI Realtime session creation payload.

Frontend must not own the authoritative system prompt.

The system prompt should define:

* mascot identity  
* DreamSpace-first role  
* allowed topics  
* out-of-scope behavior  
* child-friendly tone  
* public-kiosk safety expectations  
* short answer style  
* multilingual behavior expectations

---

## 10\. Session and Context Lifecycle

### 10.1 App startup

```
1. Frontend loads.
2. Frontend initializes UI language and idle state.
3. Frontend calls POST /api/realtime/session with reason=app_start.
4. Backend creates realtime session and returns ephemeral secret.
5. Frontend establishes WebRTC connection.
6. Frontend enters idle state.
7. Suggested bubbles are visible.
```

### 10.2 Normal visitor interaction

```
1. Visitor holds Space.
2. Frontend checks RTC health.
3. Frontend starts microphone capture.
4. Frontend enters listening state.
5. Visitor speaks.
6. Visitor releases Space.
7. Frontend stops/commits audio input.
8. Frontend enters thinking state.
9. First AI audio event arrives.
10. Frontend enters speaking state.
11. Frontend plays audio and animates mermaid mouth.
12. Response completes.
13. Frontend enters returning state.
14. Frontend starts 30-second idle timer.
```

### 10.3 Idle timeout

```
1. AI response finishes.
2. Frontend enters returning.
3. Frontend starts 30-second timer.
4. If no Space keydown occurs:
   - clear local conversation context
   - clear subtitles
   - reset visual state
   - call POST /api/session/reset with reason=idle_timeout
   - enter idle
   - keep RTC warm if healthy and valid
```

### 10.4 New speech before idle timeout

```
1. User presses Space during returning state.
2. Frontend cancels idle timer.
3. Frontend checks RTC health.
4. Frontend enters listening.
5. Conversation may continue within same active realtime session if still valid.
```

### 10.5 Manual admin reset

```
1. Admin clicks Reset Session.
2. Frontend stops microphone capture.
3. Frontend stops AI audio playback.
4. Frontend clears timers.
5. Frontend clears subtitles/transcript.
6. Frontend clears local conversation/session state.
7. Frontend closes or invalidates current RTC connection.
8. Frontend ignores stale Space keyup events.
9. Frontend calls POST /api/session/reset with reason=manual_admin.
10. Frontend creates fresh realtime session.
11. Frontend returns mermaid to idle.
12. Suggested bubbles resume.
```

### 10.6 RTC expiry or failure

```
Before listening:
  if RTC expired or disconnected:
    recreate realtime session with reason=connection_recovery

During interaction:
  if RTC fails:
    enter error
    show public error
    log technical detail
    allow admin reset
```

---

## 11\. Error Architecture

### 11.1 Public error message

Visitors should see only:

```
Something went wrong. Please try again.
```

Do not show technical API errors to visitors.

### 11.2 Frontend errors

Examples:

```
MIC_PERMISSION_DENIED
MIC_NOT_AVAILABLE
AUDIO_PLAYBACK_FAILED
WEBRTC_CONNECTION_FAILED
REALTIME_EVENT_ERROR
UNKNOWN_ERROR
```

Frontend behavior:

```
enter error state
show public error
log technical detail
allow admin reset
```

### 11.3 Backend errors

Examples:

```
OPENAI_API_KEY_MISSING
OPENAI_SESSION_CREATE_FAILED
OPENAI_UNREACHABLE
INVALID_REQUEST
INTERNAL_ERROR
RESET_LOG_FAILED
```

Backend error response shape should follow the API contract.

### 11.4 Recovery strategy

MVP recovery is admin-reset-first.

Auto-recovery may be implemented only where simple:

* recreate RTC before listening if expired  
* recreate RTC if app start connection fails once

Do not overbuild complex retry orchestration.

---

## 12\. Logging Architecture

### 12.1 Backend logs

Backend should write structured logs to terminal.

Recommended fields:

```json
{
  "time": "2026-05-21T08:15:00Z",
  "level": "INFO",
  "event": "realtime_session_created",
  "clientSessionId": "pm_01HV7Y9N4S8M6QF5",
  "openaiSessionId": "sess_abc123",
  "model": "configured-model"
}
```

### 12.2 Frontend logs

Development logs should include:

```
state transitions
keyboard decisions
ignored stale keyup events
WebRTC connection state
OpenAI realtime event types
reset events
errors
```

Example:

```
[state] idle -> listening
[keyboard] ignored repeated Space keydown
[keyboard] ignored stale keyup because state=idle
[realtime:event] response.audio.delta
[reset] reason=manual_admin previousState=speaking
```

### 12.3 Sensitive logging rules

Logs must not include:

* raw OpenAI API key  
* ephemeral client secret  
* raw visitor audio  
* full long transcript history  
* unnecessary personally identifying information

Short error snippets and event types are acceptable.

---

## 13\. Privacy Architecture

MVP privacy expectations:

* no login  
* no visitor profile  
* no persistent visitor identity  
* no long-term memory  
* no database  
* no raw audio storage  
* no full transcript storage by default  
* hold-to-talk only  
* no always-listening behavior  
* context clears after idle timeout  
* context clears after manual admin reset

The system may keep short in-memory context inside the active realtime session.

That context must not be treated as long-term memory.

---

## 14\. Security Architecture

### 14.1 Secret boundary

The backend owns the OpenAI API key.

The frontend receives only an ephemeral realtime session secret/client token.

Never expose the long-lived API key to browser code.

### 14.2 Network boundary

MVP runs on localhost:

```
Frontend: http://localhost:5173
Backend:  http://localhost:8000
```

No authentication is required for MVP because the app is local-first and kiosk-bound.

Future public network deployment would require authentication/rate limiting for admin/backend endpoints.

### 14.3 Prompt boundary

The system prompt is server-owned.

The frontend must not contain the authoritative system prompt.

This prevents casual browser-side edits from changing mascot behavior.

---

## 15\. Visual Architecture

### 15.1 Rendering approach

Use layered 2D assets and simple programmatic animation.

Recommended:

```
SVG or PNG layers
CSS transforms
React state-driven class changes
optional Framer Motion
Web Audio amplitude for visualizer/mouth movement
```

Avoid full 3D.

Avoid complex game-engine architecture for MVP.

### 15.2 Mermaid layers

The mermaid should support separately animated layers:

```
body
tail
hair
eyes-mouth
top
shadow
music notes
```

The full mascot reference is `tmp/assets/mascot.svg`. The separate PNG parts used to construct the mascot are in `tmp/assets/mascot-parts/`: `body.png`, `tail.png`, `hair.png`, `eyes-mouth.png`, and `top.png`.

The mascot was assembled in Figma. The exact source file can be opened through the installed Figma MCP with `{"team": "Govarthenan Rajadurai's team", "project": "study", "design_file": "mermaid"}`.

### 15.3 State-driven animation mapping

```
idle:
  gentle bobbing
  subtle tail/hair movement
  bubbles and music notes
  suggested bubbles visible

listening:
  mermaid attentive / slightly forward
  visualizer visible
  suggested bubbles dim

thinking:
  mermaid forward
  small bubbles/dots/music-note thinking animation

speaking:
  mouth animation active
  music notes float from mouth
  body bobs subtly
  subtitles visible if available

returning:
  mermaid remains attentive briefly
  waits for idle timeout or new speech

error:
  simple recovery/error expression
  public error message visible
```

---

## 16\. Development Workflow

### 16.1 Local development commands

Frontend:

```shell
cd frontend
npm install
npm run dev
```

Backend:

```shell
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Exact package commands may differ, but the architecture assumes separate local processes.

### 16.2 Environment setup

Backend should include:

```
.env.example
config/app.toml
config/system-prompt.md
```

Frontend should include:

```
.env.example or Vite env config if needed
public/health.json
```

Frontend must know backend base URL.

Example:

```
VITE_BACKEND_BASE_URL=http://localhost:8000
```

This is not secret.

---
## 17. Test Strategy

The MVP should use standard repeatable test frameworks as the source of truth.

Browser MCP or Playwright MCP may be used for assisted development and QA, but MCP must not replace automated tests. A coding agent may use MCP to inspect browser logs, capture screenshots, observe UI state, and debug visual behavior. However, the project should still have CLI-runnable tests that can pass without human inspection or an AI-controlled browser.

### 17.1 Test tooling

Frontend unit and component tests:

```text
Vitest
React Testing Library
````

Frontend browser/E2E tests:

```text
Playwright
```

Backend tests:

```text
pytest
FastAPI TestClient for normal route tests
httpx.AsyncClient for async integration-style route tests where needed
```

Manual or assisted QA:

```text
Browser MCP / Playwright MCP
manual human inspection
```

### 17.2 Frontend tests

Use Vitest for fast tests covering:

* state machine transitions
* keyboard handling
* stale Space keyup behavior
* repeated Space keydown handling
* idle timer behavior
* language text selection
* subtitle append/clear logic
* backend client request/response handling

Use Playwright for browser-level tests covering:

* app loads in portrait kiosk layout
* idle state renders mermaid, background, instruction, and suggested bubbles
* Space keydown enters listening state
* Space keyup enters thinking state
* repeated Space keydown does not break state
* stale keyup after reset is ignored
* admin reset returns app to idle
* public error message appears on simulated backend/session failure
* browser console has no unexpected errors during basic flows
* screenshots can be captured for visual review

Mock OpenAI Realtime in automated tests.

Normal test runs must not require real OpenAI calls.

### 17.3 Backend tests

Use pytest for:

* `GET /health`
* degraded health when OpenAI API key is missing
* `POST /api/realtime/session` request validation
* successful realtime session creation with mocked OpenAI response
* OpenAI session creation failure handling
* `POST /api/session/reset`
* reset metrics increment
* `/metrics` response exists and uses Prometheus text format
* secrets are not included in logs or responses

### 17.4 Realtime testing boundary

Automated tests should not depend on a live OpenAI Realtime connection by default.

Use mocks/fakes for:

* OpenAI session creation
* ephemeral client secret response
* realtime event stream
* transcript events
* response completion events
* realtime error events

A real OpenAI smoke test may exist, but it should be optional and skipped unless explicitly enabled with environment configuration.

Example:

```text
RUN_OPENAI_SMOKE_TESTS=true
```

### 17.5 Visual QA

Human inspection is still required before demo.

Manual QA should verify:

* mermaid looks alive and locally appropriate
* mouth animation feels acceptable
* listening visualizer feels calm
* portrait 9:16 layout works on the actual kiosk screen
* Sinhala/Tamil/English UI text is readable
* public-space error behavior is understandable
* speaker and microphone work on the actual machine

MCP/browser inspection may help during this step by capturing screenshots and console logs, but final visual acceptance should remain human-reviewed.

---

## 18\. Definition of Done for Architecture Implementation

The architecture is implemented correctly when:

1. Frontend runs at `http://localhost:5173`.  
2. Backend runs at `http://localhost:8000`.  
3. Frontend can create a realtime session through backend.  
4. Backend never exposes the real OpenAI API key.  
5. Browser establishes WebRTC connection to OpenAI Realtime.  
6. Holding Space starts microphone capture and listening state.  
7. Releasing Space commits/stops input and enters thinking state.  
8. AI voice response plays through browser speaker.  
9. Mermaid enters speaking animation during audio response.
10. Subtitles appear only if reliable transcript events are available.  
11. Idle timeout clears context and returns UI to idle.  
12. RTC remains warm across idle timeout if healthy.  
13. Admin reset clears local state and creates a fresh realtime session.  
14. Stale Space keyup events after reset are ignored.  
15. Backend `/health` works.  
16. Frontend `/health.json` exists.  
17. Backend `/metrics` works.  
18. Logs avoid secrets, raw audio, and full transcript history.  
19. No database is required.  
20. Frontend unit/component tests run with Vitest.
21. Browser/E2E tests run with Playwright.
22. Backend tests run with pytest.
23. Normal automated tests do not require live OpenAI calls.
24. Optional real OpenAI smoke tests are gated behind explicit environment configuration.
25. Manual visual QA is completed on the target kiosk screen.
26. No auth is required.  
27. No backend audio proxy is implemented.  
28. No separate STT/TTS pipeline is implemented.

---

## 19\. Explicit Non-Goals

Do not implement these for MVP:

* user accounts  
* authentication  
* admin dashboard  
* database-backed CMS  
* library catalogue search  
* book recommendation engine  
* text chat  
* mobile layout  
* touch-first UI  
* multi-device sync  
* long-term memory  
* transcript storage  
* raw audio storage  
* output moderation service  
* input classification service  
* backend WebSocket audio proxy  
* separate STT/TTS pipeline  
* 3D mermaid rig
* camera interaction  
* face recognition  
* analytics dashboard  
* Prometheus/Grafana local deployment by default  
* reverse proxy by default

---

## 20\. Implementation Guidance for Coding Agent

Build the MVP directly.

Prefer:

* simple modules  
* clear function names  
* typed request/response objects  
* small React components  
* explicit state transitions  
* defensive keyboard handling  
* clear logging  
* minimal dependencies

Avoid:

* enterprise-style abstractions  
* unnecessary classes  
* generic framework layers  
* premature plugin systems  
* database setup  
* complex event buses  
* overbuilt animation engines  
* fake safety systems

The architecture should stay small enough for one developer or coding agent to understand fully.

---

## 21\. One-Line Architecture Definition

**Paadum Meen MVP is a local-first React \+ FastAPI kiosk app where the browser owns the animated voice interaction and connects directly to OpenAI Realtime over WebRTC, while a thin Python backend creates secure realtime sessions, owns configuration, logs resets, and exposes health/metrics.**  
