import { describe, it, expect } from 'vitest'
import { navReducer, initialNav } from './navigation'

describe('navReducer', () => {
  it('starts on the map', () => {
    expect(initialNav).toEqual({ screen: 'map' })
  })

  it('opens a level', () => {
    expect(navReducer(initialNav, { type: 'openLevel', levelId: 'corridor' }))
      .toEqual({ screen: 'level', levelId: 'corridor' })
  })

  it('returns to the map', () => {
    const atLevel = { screen: 'level', levelId: 'corridor' } as const
    expect(navReducer(atLevel, { type: 'backToMap' })).toEqual({ screen: 'map' })
  })
})
