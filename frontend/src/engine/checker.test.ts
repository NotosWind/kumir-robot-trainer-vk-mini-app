import { describe, it, expect } from 'vitest'
import { check } from './checker'
import type { LevelLike } from './checker'
import type { Program } from './ast'

// Two corridor fields of different lengths; target = paint the whole corridor.
const cells = (n: number) => Array.from({ length: n }, (_, x) => ({ x, y: 0 }))

const level: LevelLike = {
  fields: [
    { cols: 4, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: cells(4) },
    { cols: 6, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: cells(6) },
  ],
  stars: { efficiency: { maxCommands: 3, requireLoop: true } },
}

const loopSolution: Program = {
  body: [
    { kind: 'cmd', cmd: 'закрасить' },
    { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
      body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] },
  ],
}

// Hard-coded for the 4-cell field only: paints 4 cells, fails the 6-cell field.
const hardcoded4: Program = {
  body: [
    { kind: 'cmd', cmd: 'закрасить' }, { kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' },
    { kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' },
    { kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' },
  ],
}

describe('checker', () => {
  it('awards 3 stars for a correct, generalising, efficient loop solution', () => {
    const r = check(loopSolution, level)
    expect(r.passedVisible).toBe(true)
    expect(r.passedAll).toBe(true)
    expect(r.efficiency.usedLoop).toBe(true)
    expect(r.efficiency.commandCount).toBe(3)
    expect(r.stars).toBe(3)
  })

  it('awards 1 star for a hard-coded solution that only fits the visible field', () => {
    const r = check(hardcoded4, level)
    expect(r.passedVisible).toBe(true)
    expect(r.passedAll).toBe(false)
    expect(r.stars).toBe(1)
  })

  it('awards 2 stars when it generalises but is not efficient', () => {
    const tighter: LevelLike = { ...level, stars: { efficiency: { maxCommands: 2, requireLoop: true } } }
    const r = check(loopSolution, tighter) // commandCount 3 > 2 -> loses efficiency star
    expect(r.passedAll).toBe(true)
    expect(r.stars).toBe(2)
  })

  it('reports missing cells when the loop leaves the last cell unpainted', () => {
    const fencepost: Program = {
      body: [
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          body: [{ kind: 'cmd', cmd: 'закрасить' }, { kind: 'cmd', cmd: 'вправо' }] },
      ],
    }
    const r = check(fencepost, level)
    expect(r.perField[0].status).toBe('ok')
    expect(r.perField[0].ok).toBe(false)
    expect(r.perField[0].missing).toBe(1) // the last cell stays unpainted
    expect(r.perField[0].extra).toBe(0)
  })

  it('reports a per-field crash without throwing', () => {
    const crashy: Program = { body: [{ kind: 'cmd', cmd: 'влево' }] }
    const r = check(crashy, level)
    expect(r.passedVisible).toBe(false)
    expect(r.perField[0].status).toBe('crash')
    expect(r.stars).toBe(0)
  })
})
