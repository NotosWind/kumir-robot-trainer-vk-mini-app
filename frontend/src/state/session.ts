import { run, check } from '../engine'
import type { CheckResult, Frame, Program, RunStatus } from '../engine'
import type { Level } from '../levels/types'
import { programToCode, codeToProgram } from './codeSync'

export type EditorMode = 'blocks' | 'code'

export interface RunState {
  frames: Frame[]
  index: number
  status: RunStatus | 'idle'
  playing: boolean
}

export interface SessionState {
  level: Level
  mode: EditorMode
  program: Program
  code: string
  run: RunState
  result?: CheckResult
  parseError?: { message: string; line: number }
}

export type SessionAction =
  | { type: 'setMode'; mode: EditorMode }
  | { type: 'setProgram'; program: Program }
  | { type: 'setCode'; code: string }
  | { type: 'run' }
  | { type: 'tick' }
  | { type: 'step' }
  | { type: 'finishRun' }
  | { type: 'reset' }
  | { type: 'closeResult' }

const IDLE_RUN: RunState = { frames: [], index: -1, status: 'idle', playing: false }

export function initialSession(level: Level): SessionState {
  return { level, mode: 'blocks', program: { body: [] }, code: '', run: { ...IDLE_RUN } }
}

/** Resolve the program to execute from the active editor; may fail in code mode. */
function resolveProgram(state: SessionState):
  | { ok: true; program: Program }
  | { ok: false; message: string; line: number } {
  if (state.mode === 'code') return codeToProgram(state.code)
  return { ok: true, program: state.program }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'setMode': {
      if (action.mode === state.mode) return state
      if (action.mode === 'code') {
        return { ...state, mode: 'code', code: programToCode(state.program), parseError: undefined }
      }
      // code -> blocks: try to parse; on failure keep blocks program as-is
      const parsed = codeToProgram(state.code)
      if (parsed.ok) return { ...state, mode: 'blocks', program: parsed.program, parseError: undefined }
      return { ...state, mode: 'blocks', parseError: { message: parsed.message, line: parsed.line } }
    }
    case 'setProgram':
      return { ...state, program: action.program }
    case 'setCode':
      return { ...state, code: action.code, parseError: undefined }
    case 'run': {
      const resolved = resolveProgram(state)
      if (!resolved.ok) {
        return { ...state, parseError: { message: resolved.message, line: resolved.line }, run: { ...IDLE_RUN } }
      }
      const field = state.level.fields[0]
      const result = run(resolved.program, field, { recordFrames: true })
      return {
        ...state,
        program: resolved.program,
        parseError: undefined,
        result: undefined,
        run: { frames: result.frames ?? [], index: -1, status: result.status, playing: true },
      }
    }
    case 'tick': {
      const next = state.run.index + 1
      if (next >= state.run.frames.length) return { ...state, run: { ...state.run, playing: false } }
      return { ...state, run: { ...state.run, index: next } }
    }
    case 'step': {
      // Manual step-through: lazily compute frames (without auto-playing), then
      // advance one frame. When stepping past the last frame, evaluate the result.
      let s = state
      if (s.run.status === 'idle' || s.run.frames.length === 0) {
        const resolved = resolveProgram(s)
        if (!resolved.ok) {
          return { ...s, parseError: { message: resolved.message, line: resolved.line }, run: { ...IDLE_RUN } }
        }
        const result = run(resolved.program, s.level.fields[0], { recordFrames: true })
        s = {
          ...s,
          program: resolved.program,
          parseError: undefined,
          result: undefined,
          run: { frames: result.frames ?? [], index: -1, status: result.status, playing: false },
        }
      }
      const next = s.run.index + 1
      if (next >= s.run.frames.length) {
        const resolved = resolveProgram(s)
        const result = resolved.ok ? check(resolved.program, s.level) : undefined
        return { ...s, run: { ...s.run, playing: false }, result }
      }
      return { ...s, run: { ...s.run, index: next } }
    }
    case 'finishRun': {
      const resolved = resolveProgram(state)
      const result = resolved.ok ? check(resolved.program, state.level) : undefined
      return { ...state, run: { ...state.run, playing: false }, result }
    }
    case 'reset':
      return { ...state, run: { ...IDLE_RUN }, result: undefined, parseError: undefined }
    case 'closeResult':
      return { ...state, result: undefined }
    default:
      return state
  }
}
