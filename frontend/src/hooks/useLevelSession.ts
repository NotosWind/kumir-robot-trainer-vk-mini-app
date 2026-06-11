import { useEffect, useReducer } from 'react'
import { initialSession, sessionReducer } from '../state/session'
import type { Level } from '../levels/types'

const FRAME_MS = 110

export function useLevelSession(level: Level) {
  const [state, dispatch] = useReducer(sessionReducer, level, initialSession)

  useEffect(() => {
    if (!state.run.playing) return
    if (state.run.index + 1 >= state.run.frames.length) {
      dispatch({ type: 'finishRun' })
      return
    }
    const t = setTimeout(() => dispatch({ type: 'tick' }), FRAME_MS)
    return () => clearTimeout(t)
  }, [state.run.playing, state.run.index, state.run.frames.length])

  return { state, dispatch }
}
