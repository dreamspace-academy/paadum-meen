import { useState, useCallback } from 'react'
import { AppState } from '../lib/constants'

export interface AppStateManager {
  state: AppState
  transitionTo: (next: AppState) => void
  reset: () => void
}

/**
 * Valid FSM transitions for Paadum Meen.
 * Any state → ERROR is always valid.
 * ERROR → IDLE is the recovery path.
 */
const VALID_TRANSITIONS: Partial<Record<AppState, AppState[]>> = {
  [AppState.IDLE]: [AppState.LISTENING],
  [AppState.LISTENING]: [AppState.THINKING],
  [AppState.THINKING]: [AppState.SPEAKING],
  [AppState.SPEAKING]: [AppState.RETURNING],
  [AppState.RETURNING]: [AppState.IDLE],
  [AppState.ERROR]: [AppState.IDLE],
}

export function useAppState(): AppStateManager {
  const [state, setState] = useState<AppState>(AppState.IDLE)

  const transitionTo = useCallback((next: AppState) => {
    setState((current) => {
      // ERROR is always reachable from any state
      if (next === AppState.ERROR) {
        return next
      }

      const allowed = VALID_TRANSITIONS[current] ?? []
      if (allowed.includes(next)) {
        return next
      }

      console.warn(
        `[useAppState] Invalid transition ignored: ${current} → ${next}`,
      )
      return current
    })
  }, [])

  const reset = useCallback(() => {
    setState(AppState.IDLE)
  }, [])

  return { state, transitionTo, reset }
}
