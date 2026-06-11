import { describe, it, expect } from 'vitest'
import { run } from './interpreter'
import type { FieldSpec } from './field'
import type { Program } from './ast'

// 5x1 corridor, robot at left, no internal walls
const corridor: FieldSpec = {
  cols: 5, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: [],
}

describe('interpreter: basic commands', () => {
  it('runs a flat sequence and paints', () => {
    const p: Program = {
      body: [
        { kind: 'cmd', cmd: 'закрасить' },
        { kind: 'cmd', cmd: 'вправо' },
        { kind: 'cmd', cmd: 'закрасить' },
      ],
    }
    const r = run(p, corridor)
    expect(r.status).toBe('ok')
    expect(r.robot).toEqual({ x: 1, y: 0 })
    expect([...r.painted].sort()).toEqual(['0:0', '1:0'])
    expect(r.steps).toBe(3)
  })

  it('reports a crash when moving into a wall', () => {
    const p: Program = { body: [{ kind: 'cmd', cmd: 'влево' }] }
    const r = run(p, corridor)
    expect(r.status).toBe('crash')
    expect(r.crashAt).toEqual({ x: 0, y: 0 })
  })
})

describe('interpreter: while loop with predicate', () => {
  it('paints a whole corridor until the wall', () => {
    const p: Program = {
      body: [
        { kind: 'cmd', cmd: 'закрасить' },
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] },
      ],
    }
    const r = run(p, corridor)
    expect(r.status).toBe('ok')
    expect([...r.painted].sort()).toEqual(['0:0', '1:0', '2:0', '3:0', '4:0'])
  })
})

describe('interpreter: repeat loop', () => {
  it('repeats a body N times', () => {
    const p: Program = {
      body: [{ kind: 'repeat', count: 3, body: [{ kind: 'cmd', cmd: 'вправо' }] }],
    }
    const r = run(p, corridor)
    expect(r.robot).toEqual({ x: 3, y: 0 })
  })
})

describe('interpreter: if/else and conditions', () => {
  it('takes the then-branch when condition holds', () => {
    const p: Program = {
      body: [
        { kind: 'if', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          then: [{ kind: 'cmd', cmd: 'закрасить' }],
          else: [{ kind: 'cmd', cmd: 'вправо' }] },
      ],
    }
    const r = run(p, corridor)
    expect([...r.painted]).toEqual(['0:0'])
  })

  it('evaluates не / и / или and the wall/painted/clear predicates', () => {
    const p: Program = {
      body: [
        { kind: 'if',
          cond: { kind: 'and',
            left: { kind: 'pred', pred: { kind: 'wall', dir: 'влево' } },
            right: { kind: 'not', expr: { kind: 'pred', pred: { kind: 'painted' } } } },
          then: [{ kind: 'cmd', cmd: 'закрасить' }] },
      ],
    }
    const r = run(p, corridor) // влево стена (corner) AND not painted -> paint
    expect([...r.painted]).toEqual(['0:0'])
  })
})

describe('interpreter: loop limit', () => {
  it('stops with looplimit on a non-crashing infinite loop', () => {
    // While the current cell stays clear and we never paint, the loop never ends.
    const inf: Program = {
      body: [
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'clear' } },
          body: [{ kind: 'if', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
                   then: [], else: [] }] },
      ],
    }
    const r = run(inf, corridor, { stepLimit: 1000 })
    expect(r.status).toBe('looplimit')
  })
})

describe('interpreter: frames for animation', () => {
  it('records one frame per executed command when recordFrames is set', () => {
    const p: Program = {
      body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }],
    }
    const r = run(p, corridor, { recordFrames: true })
    expect(r.frames).toBeDefined()
    expect(r.frames!.map((f) => f.action)).toEqual(['move', 'paint'])
    expect(r.frames![0].robot).toEqual({ x: 1, y: 0 })
    expect(r.frames![1].paintedCell).toEqual({ x: 1, y: 0 })
  })
})
