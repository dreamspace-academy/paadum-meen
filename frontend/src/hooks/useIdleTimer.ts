import { useEffect, useRef, useCallback } from 'react'

/**
 * Triggers `onIdle` after `timeoutMs` ms of no activity.
 * Call `resetTimer` on any user activity to restart the countdown.
 * Automatically starts on mount and cleans up on unmount.
 */
export function useIdleTimer(
  timeoutMs: number,
  onIdle: () => void,
): { resetTimer: () => void } {
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep a ref to the latest onIdle to avoid stale closures
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  const resetTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current)
    }
    timerIdRef.current = setTimeout(() => {
      onIdleRef.current()
    }, timeoutMs)
  }, [timeoutMs])

  useEffect(() => {
    // Start the countdown immediately on mount
    resetTimer()

    return () => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current)
      }
    }
  }, [resetTimer])

  return { resetTimer }
}
