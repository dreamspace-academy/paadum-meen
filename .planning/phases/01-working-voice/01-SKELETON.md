# Walking Skeleton — Phase 1: Working Voice

## What it proves

The skeleton validates the core architectural assumption of Paadum Meen: that a thin FastAPI backend can create an OpenAI Realtime ephemeral session and hand a client secret to the browser, which then establishes a direct WebRTC connection to OpenAI and plays streamed AI voice audio — all without the backend ever touching live audio. It also proves the hold-to-talk interaction loop (Space keydown → mic capture → commit on keyup → AI speaks) is achievable in a React kiosk frontend on localhost.

## End-to-end slice

1. Backend starts: `uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
2. Frontend starts: `npm run dev` at localhost:5173
3. Browser loads React app; frontend calls `POST /api/realtime/session` with `reason=app_start`
4. Backend uses `OPENAI_API_KEY` (from `backend/.env`) to call OpenAI, receives ephemeral secret, returns it as `session.clientSecret` — raw API key never leaves the backend process
5. Frontend receives ephemeral secret, creates a browser `RTCPeerConnection`, connects directly to OpenAI Realtime
6. Frontend enters `idle` state; visitor holds Space
7. Frontend obtains `getUserMedia` microphone stream, adds audio track to RTCPeerConnection
8. Visitor releases Space; frontend removes the audio track (stops sending)
9. OpenAI Realtime sends `response.audio.delta` events over the data channel; frontend decodes and plays audio via Web Audio API
10. `response.done` event fires; frontend enters `returning` state
11. Admin can observe the browser console for `[state]`, `[keyboard]`, and `[realtime:event]` log lines

## Skeleton components

| Component | Minimal form | Full form (Phase 1 plans) |
|-----------|-------------|--------------------------|
| FastAPI backend | `app/main.py` + single `POST /api/realtime/session` route, `.env` loading, httpx OpenAI call | + `/health`, `/metrics`, `/api/session/reset`, TOML config, Prometheus counters, structured JSON logging |
| React frontend | `App.tsx` calling backend session endpoint + raw WebRTC peer connection setup + audio element for playback | + KioskFrame (9:16), HoldToTalkInstruction, ListeningVisualizer, ErrorMessage, full state machine module, keyboard guard middleware |
| State machine | Inline `useState` in App.tsx tracking `idle/listening/thinking/speaking/returning/error` | Extracted `kioskStateMachine.ts` + `useKioskController.ts` hook with all guards |
| Keyboard handling | Simple `keydown`/`keyup` listeners in App.tsx with basic guard | Full stale-keyup guard, repeat-keydown guard, extracted `keyboard.ts` module |
| Session lifecycle | One-shot session create on mount; no reconnect | Keep-warm check before listening, expiry detection, reconnect on `connection_recovery`, idle timeout, `isExpiredSoon()` |
| Microphone | `getUserMedia` on Space keydown, `getTracks().forEach(t=>t.stop())` on keyup | Explicit `microphone.ts` module with permission error → error-state flow |
| Audio playback | Native `<audio>` element receiving remote stream from RTCPeerConnection | `audioPlayback.ts` with Web Audio API amplitude monitoring |
| Config | Hardcoded model/voice in backend | `backend/app/config/app.toml` + `pydantic-settings` Settings class |
| System prompt | Not injected in skeleton | `backend/app/config/system-prompt.md` loaded and injected into OpenAI session payload |
| Backend logging | `print()` / basic `logging` | Structured JSON logger (`core/logging.py`) with sensitive-field exclusion |
| Prometheus metrics | None | `prometheus-client` counters for sessions, resets, errors |

## Not in the skeleton (deferred to plans)

- `/health` endpoint (Plan 02)
- `/metrics` endpoint (Plan 02)
- `/api/session/reset` endpoint (Plan 02)
- TOML configuration (`app.toml`) and `pydantic-settings` loading (Plan 02)
- System prompt file copy and injection (Plan 02)
- Structured JSON logging (Plan 02)
- Prometheus metrics counters (Plan 02)
- `KioskFrame` 9:16 portrait CSS (Plan 03)
- `HoldToTalkInstruction` component with state-driven opacity/visibility (Plan 03)
- `ListeningVisualizer` 7-bar static placeholder (Plan 03)
- `ErrorMessage` component (Plan 03)
- Full extracted `kioskStateMachine.ts` + `kioskTypes.ts` (Plan 03)
- `useKioskController.ts` hook (Plan 03)
- `backendClient.ts` typed API client (Plan 03)
- Session keep-warm check before listening (`isExpiredSoon()`) (Plan 04)
- Session reconnect on connection_recovery (Plan 04)
- Idle 30-second timeout → idle state + `POST /api/session/reset` (Plan 04)
- New-speech-before-timeout (Space in returning cancels idle timer) (Plan 04)
- Stale keyup guard extracted as `useKeyboardGuard` (Plan 04)
- Error recovery via admin reset (Plan 04)
- Frontend `public/health.json` (Plan 03)
- CORS configuration (Plan 02)
