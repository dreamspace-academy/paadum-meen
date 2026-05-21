# Paadum Meen — API Contract

**Version:** 0.1.0 **Status:** MVP draft **Date:** 2026-05-21 **Related document:** `mvp-spec.md`

---

## 1\. Purpose

This document defines the API contract for the Paadum Meen MVP.

The MVP is a browser-based portrait kiosk experience where a visitor holds the **Space** key to speak with an animated Batticaloa singing fish mascot. The app uses a direct speech-to-speech AI model and avoids a separate speech-to-text → text-generation → text-to-speech pipeline.

This contract covers:

* Frontend/backend API boundaries  
* Realtime voice session creation  
* Health checks  
* Reset behavior  
* Telemetry and metrics  
* Frontend state expectations  
* Error behavior

This contract does **not** define the full system architecture, implementation stack internals, visual design details, deployment design, or final TOML configuration schema. Those belong in separate documents.

---

## 2\. MVP Scope

### 2.1 Included

The API contract supports:

* Creating an OpenAI realtime speech-to-speech session  
* Returning an ephemeral client secret/session token to the browser  
* Letting the browser connect directly to the OpenAI Realtime API using WebRTC  
* Manual session reset by admin  
* Idle timeout reset initiated by frontend  
* Backend health check  
* Frontend health check/static health file  
* Prometheus-compatible metrics endpoint  
* Terminal/server logs for debugging and cost tracking

### 2.2 Excluded

The API contract does not support:

* User accounts  
* Authentication  
* Admin dashboard  
* Database-backed content management  
* Library catalogue search  
* Book recommendation APIs  
* Text chat APIs  
* Long-term memory  
* Separate STT/TTS pipeline  
* Backend audio proxying by default  
* WebSocket audio streaming between frontend and backend  
* Output filtering/moderation endpoints  
* Input classification endpoints

---

## 3\. Technology Assumptions

These are MVP assumptions, not permanent architectural commitments.

| Layer | Assumption |
| :---- | :---- |
| Frontend | React \+ TypeScript \+ Vite |
| Backend | Python \+ FastAPI |
| AI transport | WebRTC from browser to OpenAI Realtime API |
| Backend AI role | Create ephemeral realtime sessions; hide OpenAI API key |
| Auth | None for MVP |
| Deployment | Single kiosk computer, localhost-first |
| Metrics | Prometheus-compatible `/metrics` |
| Dashboard | Grafana-compatible later |

---

## 4\. Realtime Voice Architecture

### 4.1 Chosen transport

The MVP should use **WebRTC** for browser-based realtime voice interaction.

Reason:

* The visitor uses a browser kiosk.  
* WebRTC is better suited for browser microphone/audio streaming.  
* The backend does not need to proxy live audio.  
* The backend can stay thin and only create ephemeral OpenAI realtime sessions.

### 4.2 High-level flow

```
React frontend
  -> POST /api/realtime/session
FastAPI backend
  -> creates OpenAI realtime session/client secret
FastAPI backend
  -> returns ephemeral session data
React frontend
  -> connects directly to OpenAI Realtime API using WebRTC
OpenAI Realtime API
  -> receives microphone audio
  -> streams voice response/audio events back to browser
React frontend
  -> plays audio
  -> animates fish state
  -> displays subtitles if provided
```

### 4.3 Backend must not expose long-lived secrets

The backend owns the real OpenAI API key.

The frontend must only receive an ephemeral client secret/session token suitable for connecting to the realtime session.

---

## 5\. Backend HTTP API

Base path:

```
/api
```

Backend local default assumption:

```
http://localhost:8000
```

---

## 6\. Endpoint: Create Realtime Session

### 6.1 Request

```
POST /api/realtime/session
```

Creates a short-lived OpenAI realtime session for the browser.

### 6.2 Request body

```json
{
  "clientSessionId": "pm_01HV7Y9N4S8M6QF5",
  "reason": "app_start"
}
```

### 6.3 Request fields

| Field | Type | Required | Description |
| :---- | ----: | ----: | :---- |
| `clientSessionId` | string | yes | Frontend-generated ID for this kiosk interaction/session lifecycle. Not a user ID. |
| `reason` | string | yes | Why the session is being created. |

Allowed `reason` values:

```
app_start
manual_admin
idle_timeout
error_recovery
connection_recovery
```

### 6.4 Successful response

```json
{
  "status": "ok",
  "session": {
    "id": "sess_abc123",
    "clientSecret": "ek_example_ephemeral_secret",
    "expiresAt": "2026-05-21T08:30:00Z",
    "model": "gpt-realtime-mini-2025-12-15",
    "voice": "configured-server-side-voice"
  },
  "config": {
    "idleTimeoutSeconds": 30,
    "subtitlesEnabled": true,
    "audioInputMode": "hold_to_talk"
  }
}
```

### 6.5 Response fields

| Field | Type | Description |
| :---- | ----: | :---- |
| `status` | string | `ok` on success. |
| `session.id` | string | Provider realtime session ID, if available. |
| `session.clientSecret` | string | Ephemeral secret/token for browser WebRTC connection. |
| `session.expiresAt` | string/null | Expiry timestamp if available. |
| `session.model` | string | Realtime model configured by backend. |
| `session.voice` | string | Voice configured by backend. |
| `config.idleTimeoutSeconds` | number | Frontend idle reset timer. MVP value: `30`. |
| `config.subtitlesEnabled` | boolean | Whether frontend should listen for transcript/subtitle events. |
| `config.audioInputMode` | string | MVP value: `hold_to_talk`. |

### 6.6 Error response

```json
{
  "status": "error",
  "error": {
    "code": "OPENAI_SESSION_CREATE_FAILED",
    "message": "Could not create realtime session.",
    "requestId": "req_01HV7Y9N4S8M6QF5"
  }
}
```

### 6.7 Error codes

| Code | Meaning |
| :---- | :---- |
| `OPENAI_API_KEY_MISSING` | Backend has no OpenAI API key configured. |
| `OPENAI_SESSION_CREATE_FAILED` | Backend failed to create an OpenAI realtime session. |
| `OPENAI_UNREACHABLE` | Backend could not reach OpenAI. |
| `INVALID_REQUEST` | Request body is invalid. |
| `INTERNAL_ERROR` | Unexpected backend failure. |

### 6.8 Frontend behavior on failure

Frontend should:

* enter `error` state  
* show public message: `Something went wrong. Please try again.`  
* log technical detail to browser console  
* allow admin manual reset

---

## 7\. Endpoint: Reset Session

### 7.1 Request

```
POST /api/session/reset
```

Records that the frontend reset the active interaction/session.

Important: because the browser owns the WebRTC connection, this endpoint does not need to directly stop browser audio. The frontend must stop local mic capture, audio playback, timers, subtitles, and visual state.

### 7.2 Request body

```json
{
  "clientSessionId": "pm_01HV7Y9N4S8M6QF5",
  "reason": "manual_admin",
  "previousState": "speaking",
  "openaiSessionId": "sess_abc123"
}
```

### 7.3 Request fields

| Field | Type | Required | Description |
| :---- | ----: | ----: | :---- |
| `clientSessionId` | string | yes | Frontend-generated session lifecycle ID. |
| `reason` | string | yes | Why reset happened. |
| `previousState` | string | no | Frontend state before reset. Useful for debugging. |
| `openaiSessionId` | string/null | no | Provider session ID if known. |

Allowed `reason` values:

```
manual_admin
idle_timeout
error_recovery
app_start
connection_recovery
```

Allowed `previousState` values:

```
idle
listening
thinking
speaking
returning
error
unknown
```

### 7.4 Successful response

```json
{
  "status": "ok",
  "reset": {
    "accepted": true,
    "serverReceivedAt": "2026-05-21T08:15:00Z"
  }
}
```

### 7.5 Error response

```json
{
  "status": "error",
  "error": {
    "code": "RESET_LOG_FAILED",
    "message": "Reset was applied locally but could not be recorded by backend.",
    "requestId": "req_01HV7Y9N4S8M6QF5"
  }
}
```

### 7.6 Frontend behavior

The frontend must reset locally even if this endpoint fails.

Local reset means:

* stop active microphone capture  
* stop active AI audio playback  
* close/disconnect current WebRTC session if active  
* clear visible subtitles/transcript  
* clear local conversation/session state  
* return fish to `idle`  
* resume suggested-question bubbles  
* create a fresh realtime session before the next interaction

---

## 8\. Endpoint: Backend Health

### 8.1 Request

```
GET /health
```

Checks backend status.

### 8.2 Healthy response

HTTP status: `200`

```json
{
  "status": "ok",
  "service": "paadum-meen-backend",
  "version": "0.1.0",
  "time": "2026-05-21T08:15:00Z",
  "checks": {
    "processAlive": true,
    "openaiApiKeyConfigured": true,
    "openaiRealtimeConfigured": true,
    "metricsEnabled": true
  }
}
```

### 8.3 Degraded response

HTTP status: `503`

```json
{
  "status": "degraded",
  "service": "paadum-meen-backend",
  "version": "0.1.0",
  "time": "2026-05-21T08:15:00Z",
  "checks": {
    "processAlive": true,
    "openaiApiKeyConfigured": false,
    "openaiRealtimeConfigured": false,
    "metricsEnabled": true
  },
  "error": {
    "code": "OPENAI_API_KEY_MISSING",
    "message": "OpenAI API key is not configured."
  }
}
```

### 8.4 Notes

The backend health endpoint should avoid expensive checks on every call.

For MVP, checking that the OpenAI API key exists is enough. A real OpenAI session creation test should not happen on every health call because it may create cost/noise.

---

## 9\. Frontend Health

The frontend may be served as static React assets. Therefore, the MVP frontend health check can be a static file instead of a dynamic endpoint.

### 9.1 Static health file

```
GET /health.json
```

Example local URL:

```
http://localhost:5173/health.json
```

### 9.2 Response

```json
{
  "status": "ok",
  "service": "paadum-meen-frontend",
  "version": "0.1.0",
  "buildTime": "2026-05-21T08:00:00Z"
}
```

### 9.3 Optional dynamic frontend health

If the frontend is later served through FastAPI, Caddy, or another server capable of dynamic routes, this may become:

```
GET /health
```

But for MVP, prefer:

```
GET /health.json
```

---

## 10\. Endpoint: Metrics

### 10.1 Request

```
GET /metrics
```

Returns Prometheus-compatible metrics.

### 10.2 Response content type

```
text/plain; version=0.0.4
```

### 10.3 Example response

```
# HELP paadum_realtime_sessions_created_total Total realtime sessions created
# TYPE paadum_realtime_sessions_created_total counter
paadum_realtime_sessions_created_total 12

# HELP paadum_session_resets_total Total session resets
# TYPE paadum_session_resets_total counter
paadum_session_resets_total{reason="manual_admin"} 3
paadum_session_resets_total{reason="idle_timeout"} 8

# HELP paadum_ai_response_done_total Total completed AI responses
# TYPE paadum_ai_response_done_total counter
paadum_ai_response_done_total 9

# HELP paadum_ai_response_errors_total Total AI response errors
# TYPE paadum_ai_response_errors_total counter
paadum_ai_response_errors_total 1
```

### 10.4 Recommended MVP metrics

| Metric | Type | Labels | Description |
| :---- | :---- | :---- | :---- |
| `paadum_realtime_sessions_created_total` | counter | `model` | Number of realtime sessions created. |
| `paadum_realtime_session_create_errors_total` | counter | `code` | Number of realtime session creation errors. |
| `paadum_session_resets_total` | counter | `reason` | Number of resets by reason. |
| `paadum_ai_response_done_total` | counter | none/model | Number of completed AI responses. |
| `paadum_ai_response_errors_total` | counter | `code` | Number of AI response errors. |
| `paadum_openai_input_tokens_total` | counter | `type` | Input tokens if available from provider events/logs. |
| `paadum_openai_output_tokens_total` | counter | `type` | Output tokens if available from provider events/logs. |
| `paadum_estimated_input_audio_seconds_total` | counter | none | Estimated microphone audio seconds. |
| `paadum_estimated_output_audio_seconds_total` | counter | none | Estimated AI output audio seconds. |
| `paadum_estimated_cost_usd_total` | counter | `model` | Estimated cost if calculable. |

### 10.5 Cost tracking note

Exact cost may not always be available in realtime from the browser. The app should capture usage details when provider events expose them, and otherwise estimate from audio duration and configured model pricing.

---

## 11\. Frontend State Machine Contract

The frontend owns visual state.

The backend should not tell the fish how to animate.

### 11.1 States

```
idle
listening
thinking
speaking
returning
error
```

### 11.2 State transitions

```
idle
  Space keydown -> listening

listening
  Space keyup -> thinking

thinking
  first AI audio event -> speaking
  error -> error

speaking
  AI response done -> returning
  error -> error

returning
  Space keydown before idle timeout -> listening
  idle timeout reached -> idle + reset

error
  admin reset -> idle
```

### 11.3 Hold-to-talk rules

The only visitor interaction is:

```
Hold Space to talk. Release Space to stop talking.
```

Rules:

* Space `keydown` starts listening only from valid states.  
* Space `keyup` stops listening only if current state is `listening`.  
* Stale key releases after reset must be ignored.  
* Repeated keydown events from key repeat must be ignored while already listening.  
* After manual reset, the next valid keydown starts a fresh listening state.

### 11.4 Stale key-release rule

Required defensive behavior:

```ts
if (event.type === "keyup" && event.code === "Space") {
  if (state !== "listening") return;
  stopListeningAndCommitAudio();
}
```

This prevents crashes or invalid transitions when the admin resets while the visitor is still holding Space.

---

## 12\. Frontend/OpenAI Realtime Event Contract

The frontend connects to OpenAI Realtime using WebRTC.

The app should not redefine OpenAI's full event model. It only needs to handle the events that affect UI state, audio playback, subtitles, logs, and metrics.

### 12.1 Required event handling

| Event | Frontend behavior |
| :---- | :---- |
| `response.audio.delta` | AI audio is arriving. Enter/keep `speaking`; play audio; animate fish mouth. |
| `response.audio.done` | AI audio stream finished. Keep waiting for full response completion if needed. |
| `response.audio_transcript.delta` | Append subtitle text if subtitles are enabled and text is reliable. |
| `response.audio_transcript.done` | Finalize current subtitle text if available. |
| `response.done` | AI response finished. Enter `returning`; start 30-second idle timer. Capture usage if available. |
| `error` | Enter `error`; show simple public error; log detailed error. |

### 12.2 Debug logging

In development mode, the frontend should log relevant realtime events to the browser console.

Example:

```ts
console.debug("[realtime:event]", event.type, event);
```

In production/kiosk mode, logs should be quieter but still useful for debugging errors.

### 12.3 Subtitle behavior

Subtitles are optional.

Frontend must work if transcript/subtitle events never arrive.

Subtitle rules:

* show during `speaking`  
* keep text short/readable  
* clear on manual reset  
* clear on idle timeout reset  
* do not show large transcript history

---

## 13\. Idle Timeout Contract

The frontend owns idle timeout.

Backend only resets when frontend explicitly calls:

```
POST /api/session/reset
```

### 13.1 Idle timeout value

MVP value:

```
30 seconds
```

### 13.2 Flow

```
AI response finishes
  -> frontend enters returning
  -> frontend starts 30-second timer
  -> if no new Space keydown occurs
  -> frontend performs local reset
  -> frontend calls POST /api/session/reset with reason=idle_timeout
  -> frontend returns to idle
```

### 13.3 New visitor speech before timeout

If the visitor presses Space before the 30-second timer expires:

* cancel idle timer  
* enter `listening`  
* continue or create session as appropriate

Implementation detail depends on WebRTC session freshness and provider session validity.

---

## 14\. Manual Reset Contract

Manual reset is triggered by admin mouse click on the visible **Reset Session** button.

### 14.1 Frontend behavior

Frontend must:

* stop microphone capture  
* stop AI audio playback  
* disconnect or invalidate current WebRTC session  
* clear subtitles/transcript  
* clear active timers  
* clear local conversation/session state  
* ignore stale keyup events  
* return fish to `idle`  
* resume suggested-question bubbles  
* call backend reset endpoint with reason `manual_admin`

### 14.2 Backend behavior

Backend must:

* accept reset event  
* log reset reason and previous state  
* update metrics  
* return success if reset event was recorded

Backend does not need to forcibly close browser WebRTC. Browser owns that connection.

---

## 15\. Language Contract

The MVP has minimal UI text and a simple language toggle.

Supported UI languages:

```
en = English
ta = Tamil
si = Sinhala
```

Language toggle is frontend-only for MVP.

The backend does not need a language field in session creation.

The AI system prompt should instruct the model to:

* respond in the visitor's spoken language when possible  
* use simple English if uncertain  
* keep answers short and child-friendly

---

## 16\. Error Contract

### 16.1 Public error message

For visitors, use a short non-technical message:

```
Something went wrong. Please try again.
```

### 16.2 Technical error structure

Backend error response:

```json
{
  "status": "error",
  "error": {
    "code": "OPENAI_SESSION_CREATE_FAILED",
    "message": "Could not create realtime session.",
    "requestId": "req_01HV7Y9N4S8M6QF5"
  }
}
```

### 16.3 Error codes

| Code | Layer | Meaning |
| :---- | :---- | :---- |
| `MIC_PERMISSION_DENIED` | frontend | Browser microphone permission denied. |
| `MIC_NOT_AVAILABLE` | frontend | No usable microphone found. |
| `AUDIO_PLAYBACK_FAILED` | frontend | Browser could not play AI audio. |
| `WEBRTC_CONNECTION_FAILED` | frontend/OpenAI | WebRTC connection failed. |
| `OPENAI_API_KEY_MISSING` | backend | API key missing. |
| `OPENAI_SESSION_CREATE_FAILED` | backend | Realtime session creation failed. |
| `OPENAI_UNREACHABLE` | backend | Backend could not reach OpenAI. |
| `REALTIME_EVENT_ERROR` | frontend/OpenAI | OpenAI realtime session emitted error. |
| `RESET_LOG_FAILED` | backend | Reset happened locally but backend could not record it. |
| `INTERNAL_ERROR` | backend | Unexpected backend error. |
| `UNKNOWN_ERROR` | any | Unknown error. |

### 16.4 Error recovery

Admin reset should recover the kiosk from most errors.

Frontend should not require page refresh unless the app is unrecoverable.

---

## 17\. Logging Contract

### 17.1 Backend logs

Backend should log to terminal in structured format.

Recommended fields:

```json
{
  "time": "2026-05-21T08:15:00Z",
  "level": "INFO",
  "event": "realtime_session_created",
  "clientSessionId": "pm_01HV7Y9N4S8M6QF5",
  "openaiSessionId": "sess_abc123",
  "model": "gpt-realtime-mini-2025-12-15"
}
```

### 17.2 Frontend logs

Frontend should log in development:

* state transitions  
* keydown/keyup decisions  
* WebRTC connection state  
* realtime event types  
* reset events  
* errors

Example:

```
[state] idle -> listening
[keyboard] ignored stale keyup because state=idle
[realtime:event] response.audio.delta
[reset] reason=manual_admin previousState=speaking
```

### 17.3 Sensitive logging rule

Logs must not include:

* raw OpenAI API key  
* ephemeral client secret  
* full visitor audio  
* full long transcript history

---

## 18\. Model Configuration Contract

The model is backend-configured.

Frontend must not hardcode model IDs.

Preferred MVP model assumption:

```
gpt-realtime-mini-2025-12-15
```

But the contract should allow this to change through backend configuration.

Example backend environment variable:

```
OPENAI_REALTIME_MODEL=gpt-realtime-mini-2025-12-15
```

The backend response may expose the selected model for debugging:

```json
{
  "session": {
    "model": "gpt-realtime-mini-2025-12-15"
  }
}
```

---

## 19\. System Prompt Contract

The system prompt is controlled server-side.

The frontend must not own the authoritative system prompt.

The system prompt should define:

* mascot identity  
* DreamSpace-first role  
* allowed topics  
* out-of-scope behavior  
* child-friendly tone  
* public-kiosk safety behavior  
* short answer style  
* multilingual response behavior

The backend should inject the configured system prompt when creating the realtime session.

---

## 20\. Async Expectations

### 20.1 Frontend async requirements

Frontend must handle async behavior for:

* microphone permission  
* MediaStream lifecycle  
* WebRTC connection setup  
* OpenAI realtime events  
* data channel messages  
* audio playback  
* keydown/keyup race conditions  
* admin reset cancellation  
* idle timeout

### 20.2 Backend async requirements

Backend should use async patterns for:

* FastAPI routes  
* OpenAI session creation HTTP call  
* health check responses  
* metrics updates  
* non-blocking logs/telemetry where practical

Recommended backend HTTP client:

```
httpx.AsyncClient
```

Avoid blocking `requests` inside async FastAPI handlers.

---

## 21\. Security and Privacy Boundaries

MVP assumptions:

* no user login  
* no visitor profile  
* no authentication  
* localhost/single-machine deployment  
* no long-term memory  
* no database required  
* no always-listening behavior  
* explicit hold-to-talk interaction only

Privacy behavior:

* clear session context after idle timeout  
* clear session context after admin reset  
* do not persist visitor conversations unless explicitly added in a future version  
* do not log raw audio  
* avoid storing full transcripts by default

---

## 22\. Open Questions for System Design

These are not blockers for the API contract, but should be decided in the system design/architecture document.

1. Exact OpenAI Realtime session creation payload.  
2. Exact voice selection.  
3. Exact model fallback behavior if mini quality is poor.  
4. Exact TOML configuration schema.  
5. Exact `.env` secret names.  
6. Whether frontend and backend are served separately or through one local server.  
7. Whether Caddy/nginx is needed on the kiosk machine.  
8. Whether Prometheus/Grafana runs locally or metrics stay as `/metrics` only for MVP.  
9. Exact frontend animation state implementation.  
10. How much usage/cost detail OpenAI events expose in the final selected SDK/API path.

---

## 23\. Contract Summary

The MVP API contract is intentionally thin.

The backend:

* creates OpenAI realtime sessions  
* hides secrets  
* exposes health  
* exposes metrics  
* records reset events  
* logs useful diagnostics

The frontend:

* owns kiosk UI state  
* owns hold-to-talk behavior  
* owns idle timeout  
* owns local reset behavior  
* connects to OpenAI Realtime over WebRTC  
* plays AI audio  
* animates the fish  
* shows subtitles only if available

This avoids building a custom audio backend and keeps the MVP small, fast, and aligned with direct speech-to-speech interaction.

---

## 24\. References

* Paadum Meen MVP SPEC: `mvp-spec.md`  
* OpenAI Voice Agents guide: `https://developers.openai.com/api/docs/guides/voice-agents`  
* OpenAI Realtime WebRTC guide: `https://developers.openai.com/api/docs/guides/realtime-webrtc`  
* OpenAI Realtime cost guide: `https://developers.openai.com/api/docs/guides/realtime-costs`

