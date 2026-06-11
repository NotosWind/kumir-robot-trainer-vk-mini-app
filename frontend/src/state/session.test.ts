import { describe, it, expect } from 'vitest'
import { initialSession, sessionReducer } from './session'
import { sampleLevels } from '../levels/sampleLevels'

const corridor = sampleLevels.find((l) => l.id === 'corridor')!

const solutionCode = 'закрасить\nнц пока справа свободно\n  вправо\n  закрасить\nкц'

describe('sessionReducer', () => {
  it('starts idle in blocks mode with an empty program', () => {
    const s = initialSession(corridor)
    expect(s.mode).toBe('blocks')
    expect(s.program.body).toEqual([])
    expect(s.run.status).toBe('idle')
  })

  it('switching to code mode fills code from the program', () => {
    let s = initialSession(corridor)
    s = sessionReducer(s, { type: 'setProgram', program: { body: [{ kind: 'cmd', cmd: 'вправо' }] } })
    s = sessionReducer(s, { type: 'setMode', mode: 'code' })
    expect(s.code).toBe('вправо')
  })

  it('run from code mode parses, produces frames and starts playing', () => {
    let s = initialSession(corridor)
    s = sessionReducer(s, { type: 'setMode', mode: 'code' })
    s = sessionReducer(s, { type: 'setCode', code: solutionCode })
    s = sessionReducer(s, { type: 'run' })
    expect(s.run.frames.length).toBeGreaterThan(0)
    expect(s.run.playing).toBe(true)
    expect(s.parseError).toBeUndefined()
  })

  it('run from code with a syntax error sets parseError and does not start', () => {
    let s = initialSession(corridor)
    s = sessionReducer(s, { type: 'setMode', mode: 'code' })
    s = sessionReducer(s, { type: 'setCode', code: 'прыгнуть' })
    s = sessionReducer(s, { type: 'run' })
    expect(s.parseError?.line).toBe(1)
    expect(s.run.playing).toBe(false)
  })

  it('tick advances the frame; finishRun computes the result and stops', () => {
    let s = initialSession(corridor)
    s = sessionReducer(s, { type: 'setMode', mode: 'code' })
    s = sessionReducer(s, { type: 'setCode', code: solutionCode })
    s = sessionReducer(s, { type: 'run' })
    const total = s.run.frames.length
    for (let i = 0; i < total; i += 1) s = sessionReducer(s, { type: 'tick' })
    expect(s.run.index).toBe(total - 1)
    s = sessionReducer(s, { type: 'finishRun' })
    expect(s.run.playing).toBe(false)
    expect(s.result?.stars).toBe(3)
  })

  it('reset clears run state', () => {
    let s = initialSession(corridor)
    s = sessionReducer(s, { type: 'setMode', mode: 'code' })
    s = sessionReducer(s, { type: 'setCode', code: solutionCode })
    s = sessionReducer(s, { type: 'run' })
    s = sessionReducer(s, { type: 'reset' })
    expect(s.run.index).toBe(-1)
    expect(s.run.playing).toBe(false)
    expect(s.run.frames).toEqual([])
    expect(s.result).toBeUndefined()
  })
})
