import { describe, it, expect } from 'vitest'
import { sampleLevels } from './sampleLevels'
import { check } from '../engine'
import type { Command, Condition, Direction, Program, Stmt } from '../engine'

// --- tiny builders to keep reference solutions readable ---
const cmd = (c: Command): Stmt => ({ kind: 'cmd', cmd: c })
const free = (d: Direction): Condition => ({ kind: 'pred', pred: { kind: 'free', dir: d } })
const wall = (d: Direction): Condition => ({ kind: 'pred', pred: { kind: 'wall', dir: d } })
const whileLoop = (cond: Condition, body: Stmt[]): Stmt => ({ kind: 'whileLoop', cond, body })
const repeat = (count: number, body: Stmt[]): Stmt => ({ kind: 'repeat', count, body })
const iff = (cond: Condition, then: Stmt[]): Stmt => ({ kind: 'if', cond, then })
const prog = (...body: Stmt[]): Program => ({ body })

const paintAlong = (d: Direction): Stmt => whileLoop(free(d), [cmd(d), cmd('закрасить')])

const SOLUTIONS: Record<string, Program> = {
  'first-paint': prog(cmd('закрасить')),
  'three-right': prog(cmd('закрасить'), cmd('вправо'), cmd('закрасить'), cmd('вправо'), cmd('закрасить')),
  'repeat-paint': prog(cmd('закрасить'), repeat(4, [cmd('вправо'), cmd('закрасить')])),
  'corridor': prog(cmd('закрасить'), paintAlong('вправо')),
  'wall-stop': prog(cmd('закрасить'), paintAlong('вправо')),
  'left-walk': prog(cmd('закрасить'), paintAlong('влево')),
  'down-column': prog(cmd('закрасить'), paintAlong('вниз')),
  'up-column': prog(cmd('закрасить'), paintAlong('вверх')),
  'down-wall': prog(cmd('закрасить'), paintAlong('вниз')),
  'corner': prog(cmd('закрасить'), paintAlong('вправо'), paintAlong('вниз')),
  'corner-up': prog(cmd('закрасить'), paintAlong('вверх'), paintAlong('вправо')),
  'two-rows': prog(
    cmd('закрасить'), paintAlong('вправо'),
    whileLoop(free('вниз'), [cmd('вниз')]), cmd('закрасить'), paintAlong('влево'),
  ),
  'perimeter': prog(
    cmd('закрасить'), paintAlong('вправо'), paintAlong('вниз'), paintAlong('влево'), paintAlong('вверх'),
  ),
  'comb-if': prog(
    whileLoop(free('вправо'), [iff(wall('вниз'), [cmd('закрасить')]), cmd('вправо')]),
  ),
}

describe('campaign data', () => {
  it('has 14 levels with unique ids and non-empty goals', () => {
    expect(sampleLevels).toHaveLength(14)
    const ids = sampleLevels.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of sampleLevels) expect(l.goal.length).toBeGreaterThan(0)
  })

  it('the first four levels carry onboarding intros', () => {
    for (const l of sampleLevels.slice(0, 4)) expect(l.intro && l.intro.length).toBeTruthy()
  })

  for (const level of sampleLevels) {
    it(`level "${level.id}" is solvable on all its fields by its reference solution`, () => {
      const solution = SOLUTIONS[level.id]
      expect(solution, `no reference solution for ${level.id}`).toBeDefined()
      const result = check(solution, level)
      expect(result.passedAll, `${level.id} not solved on all fields`).toBe(true)
    })
  }
})
