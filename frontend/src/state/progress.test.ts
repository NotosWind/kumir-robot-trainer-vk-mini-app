import { describe, it, expect } from 'vitest'
import {
  recordResult, totalStars, isUnlocked, loadProgress, saveProgress, mergeProgress,
  type ProgressMap, type KeyValue,
} from './progress'

describe('progress pure logic', () => {
  it('records a result and keeps the best star count', () => {
    let p: ProgressMap = {}
    p = recordResult(p, 'a', 2)
    expect(p.a).toEqual({ stars: 2, solved: true })
    p = recordResult(p, 'a', 1) // worse — keep best
    expect(p.a.stars).toBe(2)
    p = recordResult(p, 'a', 3) // better — upgrade
    expect(p.a.stars).toBe(3)
  })

  it('records 0 stars as not solved', () => {
    const p = recordResult({}, 'a', 0)
    expect(p.a).toEqual({ stars: 0, solved: false })
  })

  it('sums total stars', () => {
    const p: ProgressMap = { a: { stars: 3, solved: true }, b: { stars: 1, solved: true } }
    expect(totalStars(p)).toBe(4)
  })

  it('unlocks level 0 always and level i when i-1 is solved', () => {
    const ids = ['a', 'b', 'c']
    const p: ProgressMap = { a: { stars: 1, solved: true } }
    expect(isUnlocked(ids, p, 0)).toBe(true)
    expect(isUnlocked(ids, p, 1)).toBe(true) // a solved
    expect(isUnlocked(ids, p, 2)).toBe(false) // b not solved
  })
})

describe('progress storage', () => {
  function fakeKV(): KeyValue {
    const store: Record<string, string> = {}
    return {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v },
    }
  }

  it('saves and loads a ProgressMap round-trip', () => {
    const kv = fakeKV()
    const p: ProgressMap = { a: { stars: 2, solved: true } }
    saveProgress(kv, p)
    expect(loadProgress(kv)).toEqual(p)
  })

  it('loads an empty map when nothing is stored or data is corrupt', () => {
    const kv = fakeKV()
    expect(loadProgress(kv)).toEqual({})
    kv.setItem('kumir-progress', 'not json')
    expect(loadProgress(kv)).toEqual({})
  })
})

describe('mergeProgress', () => {
  it('takes the best stars per level across two maps', () => {
    const a: ProgressMap = { x: { stars: 1, solved: true }, y: { stars: 0, solved: false } }
    const b: ProgressMap = { x: { stars: 3, solved: true }, z: { stars: 2, solved: true } }
    expect(mergeProgress(a, b)).toEqual({
      x: { stars: 3, solved: true },
      y: { stars: 0, solved: false },
      z: { stars: 2, solved: true },
    })
  })
})
