import { describe, it, expect } from 'vitest'
import { stateAtFrame } from './playback'
import { run } from '../engine'
import type { FieldSpec } from '../engine'

const field: FieldSpec = { cols: 3, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: [] }

describe('stateAtFrame', () => {
  const frames = run(
    { body: [{ kind: 'cmd', cmd: 'закрасить' }, { kind: 'cmd', cmd: 'вправо' }] },
    field, { recordFrames: true },
  ).frames!

  it('index -1 returns the initial state', () => {
    const s = stateAtFrame(field, frames, -1)
    expect(s.robot).toEqual({ x: 0, y: 0 })
    expect(s.painted.size).toBe(0)
  })

  it('accumulates painted cells and tracks the robot up to the index', () => {
    const s0 = stateAtFrame(field, frames, 0) // after закрасить
    expect([...s0.painted]).toEqual(['0:0'])
    const s1 = stateAtFrame(field, frames, 1) // after вправо
    expect(s1.robot).toEqual({ x: 1, y: 0 })
    expect([...s1.painted]).toEqual(['0:0'])
  })
})
