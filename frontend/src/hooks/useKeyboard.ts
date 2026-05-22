import { useState, useEffect, useRef, useCallback } from 'react'

export interface KeyboardControls {
  isHolding: boolean
}

/**
 * Manages Space-bar hold-to-talk interaction.
 * Guards against key-repeat events and stale key-release events.
 */
export function useKeyboard(
  onHoldStart: () => void,
  onHoldEnd: () => void,
): KeyboardControls {
  const [isHolding, setIsHolding] = useState(false)

  // Keep refs to the latest callbacks to avoid stale closure issues
  // when listeners are registered once on mount.
  const onHoldStartRef = useRef(onHoldStart)
  const onHoldEndRef = useRef(onHoldEnd)
  onHoldStartRef.current = onHoldStart
  onHoldEndRef.current = onHoldEnd

  // Track holding state in a ref as well so keyup handler can read it
  // without needing to be recreated on every state change.
  const isHoldingRef = useRef(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code !== 'Space') return
    // Guard against key-repeat events fired while key is held
    if (event.repeat) return
    if (isHoldingRef.current) return

    isHoldingRef.current = true
    setIsHolding(true)
    onHoldStartRef.current()
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code !== 'Space') return
    // Stale key-release defense: ignore if we never started a hold
    if (!isHoldingRef.current) return

    isHoldingRef.current = false
    setIsHolding(false)
    onHoldEndRef.current()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return { isHolding }
}
