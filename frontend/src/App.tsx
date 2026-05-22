import { useState, useEffect } from 'react'

import { AppState, IDLE_TIMEOUT_MS, THINKING_TIMEOUT_MS, UI_STRINGS } from './lib/constants'
import type { Language } from './lib/constants'
import { useAppState } from './hooks/useAppState'
import { useKeyboard } from './hooks/useKeyboard'
import { useIdleTimer } from './hooks/useIdleTimer'
import { useAudioVisualizer } from './hooks/useAudioVisualizer'
import { useWebRTC } from './hooks/useWebRTC'

import Background from './components/Background'
import Mascot from './components/Mascot'
import AudioVisualizer from './components/AudioVisualizer'
import SuggestedBubbles from './components/SuggestedBubbles'
import Subtitles from './components/Subtitles'
import LanguageSelector from './components/LanguageSelector'
import ResetButton from './components/ResetButton'
import HoldPrompt from './components/HoldPrompt'

function App() {
  // 1. Language state
  const [lang, setLang] = useState<Language>('en')

  // 2. App FSM state
  const { state, transitionTo, reset } = useAppState()

  // 3. WebRTC — wired to FSM transitions
  const {
    isConnecting,
    micStream,
    aiTranscript,
    setMicEnabled,
    connect,
    disconnect,
    resetSession,
  } = useWebRTC((event) => {
    if (event === 'speaking_started') transitionTo(AppState.SPEAKING)
    if (event === 'speaking_done') {
      transitionTo(AppState.RETURNING)
      setTimeout(() => transitionTo(AppState.IDLE), 2000)
    }
    if (event === 'error') transitionTo(AppState.ERROR)
  })

  // 5. Idle timer — declared before useKeyboard so onHoldStart can call resetTimer
  const { resetTimer } = useIdleTimer(IDLE_TIMEOUT_MS, async () => {
    reset()
    setMicEnabled(false)
    await resetSession('idle_timeout')
  })

  // 4. Keyboard hold-to-talk
  useKeyboard(
    // onHoldStart
    () => {
      if (state === AppState.IDLE || state === AppState.RETURNING) {
        setMicEnabled(true)
        transitionTo(AppState.LISTENING)
        resetTimer()
      }
    },
    // onHoldEnd
    () => {
      if (state === AppState.LISTENING) {
        setMicEnabled(false)
        transitionTo(AppState.THINKING)
      }
    },
  )

  // 6. Audio visualizer — feeds off mic stream only while LISTENING
  const { getFrequencyData } = useAudioVisualizer(
    state === AppState.LISTENING ? micStream : null,
  )

  // 7. Connect on mount, disconnect on unmount
  useEffect(() => {
    void connect()
    return () => disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 8. Error auto-recovery: reconnect after 5 s
  useEffect(() => {
    if (state === AppState.ERROR) {
      const t = setTimeout(() => {
        reset()
        void connect()
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [state, reset, connect])

  // 9. THINKING watchdog: if no response starts in time (e.g. the user held
  // Space but said nothing), return to IDLE instead of hanging.
  useEffect(() => {
    if (state !== AppState.THINKING) return
    const t = setTimeout(() => reset(), THINKING_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [state, reset])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Background />

      {/* Mascot centred, vertically positioned at ~30% from top */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Mascot state={state} />
      </div>

      {/* Suggested questions — only in IDLE */}
      <SuggestedBubbles visible={state === AppState.IDLE} lang={lang} />

      {/* Hold prompt — visible in IDLE and RETURNING */}
      <HoldPrompt
        text={UI_STRINGS[lang].holdToTalk}
        visible={state === AppState.IDLE || state === AppState.RETURNING}
      />

      {/* Audio visualizer — only in LISTENING (component manages its own fixed positioning) */}
      <AudioVisualizer
        isActive={state === AppState.LISTENING}
        getFrequencyData={getFrequencyData}
      />

      {/* Subtitles — show during THINKING and SPEAKING */}
      <Subtitles
        text={state === AppState.THINKING ? UI_STRINGS[lang].thinking : aiTranscript}
        visible={state === AppState.THINKING || state === AppState.SPEAKING}
      />

      {/* Error message */}
      {state === AppState.ERROR && (
        <div
          style={{
            position: 'fixed',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(220,38,38,0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            textAlign: 'center',
          }}
        >
          {UI_STRINGS[lang].errorMessage}
        </div>
      )}

      {/* Connecting overlay */}
      {isConnecting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          <p style={{ color: 'white', fontSize: '20px' }}>Connecting…</p>
        </div>
      )}

      {/* Language selector — top right */}
      <LanguageSelector current={lang} onChange={setLang} />

      {/* Reset button — bottom right */}
      <ResetButton
        label={UI_STRINGS[lang].reset}
        onClick={() => {
          reset()
          setMicEnabled(false)
          void resetSession('manual')
        }}
      />
    </div>
  )
}

export default App
