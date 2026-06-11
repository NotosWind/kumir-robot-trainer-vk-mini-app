import { describe, it, expect } from 'vitest'
import { row, col, rect, perimeter } from './helpers'

describe('geometry helpers', () => {
  it('row builds a horizontal line', () => {
    expect(row(3, 0)).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }])
  })
  it('col builds a vertical line', () => {
    expect(col(2)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }])
  })
  it('rect fills a block', () => {
    expect(rect(0, 0, 2, 2)).toEqual([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ])
  })
  it('perimeter covers the border of a 3x3 (8 unique cells)', () => {
    const keys = new Set(perimeter(3, 3).map((c) => `${c.x}:${c.y}`))
    expect(keys.size).toBe(8) // 9 cells minus the center
    expect(keys.has('1:1')).toBe(false)
  })
})
