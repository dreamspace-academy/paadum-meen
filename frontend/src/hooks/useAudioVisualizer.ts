import { useEffect, useRef, useState } from 'react'

const FFT_SIZE = 512
const FREQUENCY_BINS = FFT_SIZE / 2 // AnalyserNode produces FFT_SIZE / 2 bins

export interface AudioVisualizerControls {
  /** Call inside your own RAF loop to read the latest frequency data. */
  getFrequencyData: () => Uint8Array<ArrayBuffer>
  isActive: boolean
}

/**
 * Reads audio amplitude from a mic MediaStream and provides a stable
 * function to pull frequency data for canvas rendering.
 *
 * `getFrequencyData` is backed by a ref — it does NOT cause re-renders.
 * Call it inside your own `requestAnimationFrame` loop.
 */
export function useAudioVisualizer(
  stream: MediaStream | null,
): AudioVisualizerControls {
  const [isActive, setIsActive] = useState(false)

  // Refs for Web Audio objects (no state — avoids re-renders)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(FREQUENCY_BINS))
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (stream === null) {
      // Tear down: stop RAF loop
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      // Disconnect source and close context
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
        audioCtxRef.current = null
      }
      analyserRef.current = null
      // Reset data array to silence
      dataArrayRef.current = new Uint8Array(FREQUENCY_BINS) as Uint8Array<ArrayBuffer>
      setIsActive(false)
      return
    }

    // Build the Web Audio graph
    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = FFT_SIZE
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    audioCtxRef.current = audioCtx
    analyserRef.current = analyser
    sourceRef.current = source
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>

    setIsActive(true)

    // Start RAF loop to continuously read frequency data
    const tick = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
      }
      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)

    // Cleanup when stream changes or unmounts
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      source.disconnect()
      void audioCtx.close()
      audioCtxRef.current = null
      analyserRef.current = null
      sourceRef.current = null
      dataArrayRef.current = new Uint8Array(FREQUENCY_BINS) as Uint8Array<ArrayBuffer>
      setIsActive(false)
    }
  }, [stream])

  // Cleanup on unmount regardless of stream state
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close()
      }
    }
  }, [])

  const getFrequencyData = (): Uint8Array<ArrayBuffer> => dataArrayRef.current

  return { getFrequencyData, isActive }
}
