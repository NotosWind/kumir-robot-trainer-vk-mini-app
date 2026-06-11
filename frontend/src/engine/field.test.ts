import { describe, it, expect } from 'vitest'
import { Field, key } from './field'
import type { FieldSpec } from './field'

const base: FieldSpec = { cols: 3, rows: 3, robot: { x: 0, y: 0 }, walls: [], target: [] }

describe('key', () => {
  it('formats a cell key', () => {
    expect(key(2, 5)).toBe('2:5')
  })
})

describe('Field boundaries', () => {
  it('treats the grid edge as a wall', () => {
    const f = new Field(base) // robot at top-left corner
    expect(f.free('влево')).toBe(false)
    expect(f.free('вверх')).toBe(false)
    expect(f.free('вправо')).toBe(true)
    expect(f.free('вниз')).toBe(true)
  })
})

describe('Field internal walls', () => {
  it('blocks movement across a vertical wall', () => {
    const f = new Field({ ...base, robot: { x: 1, y: 1 }, walls: ['V:1:1'] })
    expect(f.free('вправо')).toBe(false) // wall between (1,1) and (2,1)
    expect(f.free('влево')).toBe(true)
  })

  it('blocks movement across a horizontal wall', () => {
    const f = new Field({ ...base, robot: { x: 1, y: 1 }, walls: ['H:1:1'] })
    expect(f.free('вниз')).toBe(false) // wall between (1,1) and (1,2)
    expect(f.free('вверх')).toBe(true)
  })

  it('a vertical wall is symmetric from the right cell', () => {
    const f = new Field({ ...base, robot: { x: 2, y: 1 }, walls: ['V:1:1'] })
    expect(f.free('влево')).toBe(false)
  })
})

describe('Field movement and painting', () => {
  it('move updates the robot position', () => {
    const f = new Field({ ...base, robot: { x: 0, y: 0 } })
    expect(f.move('вправо')).toBe(true)
    expect(f.robot).toEqual({ x: 1, y: 0 })
  })

  it('move into a wall returns false and does not move', () => {
    const f = new Field(base) // at corner
    expect(f.move('влево')).toBe(false)
    expect(f.robot).toEqual({ x: 0, y: 0 })
  })

  it('paint marks the current cell, isPainted reflects it', () => {
    const f = new Field({ ...base, robot: { x: 1, y: 2 } })
    expect(f.isPainted()).toBe(false)
    f.paint()
    expect(f.isPainted()).toBe(true)
    expect(f.paintedKeys()).toContain('1:2')
  })

  it('honors prePainted cells', () => {
    const f = new Field({ ...base, robot: { x: 0, y: 0 }, prePainted: [{ x: 0, y: 0 }] })
    expect(f.isPainted()).toBe(true)
  })

  it('clear predicate is the negation of painted', () => {
    const f = new Field({ ...base, robot: { x: 0, y: 0 } })
    expect(f.isClear()).toBe(true)
    f.paint()
    expect(f.isClear()).toBe(false)
  })
})
