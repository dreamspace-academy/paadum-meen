import { useState, useRef, useCallback } from 'react'
import {
  fetchRealtimeSession,
  resetSession as apiResetSession,
} from '../lib/api'

const REALTIME_CALLS_URL = 'https://api.openai.com/v1/realtime/calls'

const SILENCE_LEVEL_THRESHOLD = 0.01  // AI-audio level below this counts as silent
const SILENCE_POLL_MS = 100          // AI-audio sampling interval
const SILENCE_SUSTAIN_MS = 1_000     // sustained silence = playback finished
const PLAYBACK_MAX_MS = 60_000       // safety cap on the detector

type StateChangeEvent = 'speaking_started' | 'speaking_done' | 'error'

export interface RealtimeSession {
  isConnected: boolean
  isConnecting: boolean
  micStream: MediaStream | null
  aiTranscript: string
  userTranscript: string
  error: string | null
  setMicEnabled: (enabled: boolean) => void
  connect: () => Promise<void>
  disconnect: () => void
  resetSession: (reason?: 'idle_timeout' | 'manual') => Promise<void>
}

/** Shape of messages arriving on the OpenAI Realtime data channel. */
interface OaiEvent {
  type: string
  delta?: string
  error?: { message?: string }
  item?: {
    content?: Array<{ transcript?: string }>
  }
  transcript?: string
}

function maxRemoteAudioLevel(receiver: RTCRtpReceiver): number {
  const sources = receiver.getSynchronizationSources()
  let max = 0
  for (const s of sources) {
    if (typeof s.audioLevel === 'number' && s.audioLevel > max) max = s.audioLevel
  }
  return max
}

export function useWebRTC(
  onStateChange: (event: StateChangeEvent) => void,
): RealtimeSession {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [aiTranscript, setAiTranscript] = useState('')
  const [userTranscript, setUserTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Keep WebRTC objects in refs — they don't drive rendering
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const playbackPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speakingFiredRef = useRef(false)
  const isConnectingRef = useRef(false)

  // Keep onStateChange in a ref to avoid stale closures
  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange

  const detectPlaybackEnd = useCallback(() => {
    if (playbackPollRef.current !== null) clearInterval(playbackPollRef.current)
    const receiver =
      pcRef.current?.getReceivers().find((r) => r.track.kind === 'audio') ?? null
    let silentFor = 0
    let elapsed = 0
    playbackPollRef.current = setInterval(() => {
      elapsed += SILENCE_POLL_MS
      const silent =
        !receiver || maxRemoteAudioLevel(receiver) < SILENCE_LEVEL_THRESHOLD
      silentFor = silent ? silentFor + SILENCE_POLL_MS : 0
      if (silentFor >= SILENCE_SUSTAIN_MS || elapsed >= PLAYBACK_MAX_MS) {
        if (playbackPollRef.current !== null) clearInterval(playbackPollRef.current)
        playbackPollRef.current = null
        speakingFiredRef.current = false
        onStateChangeRef.current('speaking_done')
      }
    }, SILENCE_POLL_MS)
  }, [])

  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    let parsed: OaiEvent
    try {
      parsed = JSON.parse(event.data as string) as OaiEvent
    } catch {
      console.warn('[useWebRTC] Failed to parse data channel message:', event.data)
      return
    }

    switch (parsed.type) {
      case 'response.output_audio_transcript.delta':
        if (!speakingFiredRef.current) {
          speakingFiredRef.current = true
          setAiTranscript('')
          onStateChangeRef.current('speaking_started')
        }
        if (parsed.delta !== undefined) {
          setAiTranscript((prev) => prev + parsed.delta)
        }
        break

      case 'response.output_audio_transcript.done':
        // Transcript is already accumulated; nothing extra needed
        break

      case 'conversation.item.input_audio_transcription.completed': {
        // Event shape: may use event.transcript directly, or item.content[0].transcript
        const transcript =
          parsed.transcript ??
          parsed.item?.content?.[0]?.transcript ??
          ''
        setUserTranscript(transcript)
        break
      }

      case 'response.done':
        if (!speakingFiredRef.current) {
          onStateChangeRef.current('speaking_done')
        } else {
          detectPlaybackEnd()
        }
        break

      case 'error': {
        speakingFiredRef.current = false
        if (playbackPollRef.current !== null) {
          clearInterval(playbackPollRef.current)
          playbackPollRef.current = null
        }
        const msg = parsed.error?.message ?? 'Unknown error'
        setError(msg)
        onStateChangeRef.current('error')
        break
      }

      default:
        break
    }
  }, [detectPlaybackEnd])

  const disconnect = useCallback(() => {
    // Stop the playback-end detector
    if (playbackPollRef.current !== null) {
      clearInterval(playbackPollRef.current)
      playbackPollRef.current = null
    }

    // Close data channel
    if (dcRef.current) {
      dcRef.current.close()
      dcRef.current = null
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    // Stop mic tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }

    // Stop audio element
    if (audioElRef.current) {
      audioElRef.current.srcObject = null
    }

    setMicStream(null)
    setIsConnected(false)
    setIsConnecting(false)
    setAiTranscript('')
    setUserTranscript('')
    isConnectingRef.current = false
    speakingFiredRef.current = false
  }, [])

  const connect = useCallback(async () => {
    // Bail if already connected/connecting
    if (pcRef.current || isConnectingRef.current) return
    isConnectingRef.current = true

    setIsConnecting(true)
    setError(null)

    try {
      // 1. Fetch ephemeral client secret from backend
      const session = await fetchRealtimeSession()
      const clientSecret = session.client_secret.value

      // 2. Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      micStreamRef.current = stream
      setMicStream(stream)

      // 3. Create RTCPeerConnection (no ICE servers — OpenAI handles NAT)
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // 4. Add mic track (initially disabled — caller enables when user holds Space)
      const micTrack = stream.getTracks()[0]
      pc.addTrack(micTrack, stream)
      micTrack.enabled = false

      // 5. Set up incoming audio element
      if (!audioElRef.current) {
        const el = document.createElement('audio')
        el.autoplay = true
        audioElRef.current = el
      }

      pc.ontrack = (e) => {
        const stream = e.streams[0]
        if (audioElRef.current && stream) {
          audioElRef.current.srcObject = stream
          void audioElRef.current.play()
        }
      }

      // 6. Create data channel for Realtime events
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.onmessage = handleDataChannelMessage

      // 7. Create and set local offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 8. Exchange SDP with OpenAI Realtime API
      const sdpResponse = await fetch(REALTIME_CALLS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      })

      if (!sdpResponse.ok) {
        const text = await sdpResponse.text().catch(() => 'Unknown error')
        throw new Error(
          `OpenAI Realtime SDP exchange failed ${sdpResponse.status}: ${text}`,
        )
      }

      const answerSdp = await sdpResponse.text()

      // 9. Set remote description
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsConnected(true)
      setIsConnecting(false)
      isConnectingRef.current = false
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setIsConnecting(false)
      isConnectingRef.current = false
      // Clean up any partial state
      disconnect()
      onStateChangeRef.current('error')
    }
  }, [disconnect, handleDataChannelMessage])

  const setMicEnabled = useCallback((enabled: boolean) => {
    if (!pcRef.current) return
    pcRef.current.getSenders().forEach((sender) => {
      if (sender.track && sender.track.kind === 'audio') {
        sender.track.enabled = enabled
      }
    })
  }, [])

  const resetSession = useCallback(
    async (reason: 'idle_timeout' | 'manual' = 'manual') => {
      await apiResetSession(reason)
      disconnect()
      await connect()
    },
    [disconnect, connect],
  )

  return {
    isConnected,
    isConnecting,
    micStream,
    aiTranscript,
    userTranscript,
    error,
    setMicEnabled,
    connect,
    disconnect,
    resetSession,
  }
}
