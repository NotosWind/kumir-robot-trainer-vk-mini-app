// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import { sampleLevels } from './levels/sampleLevels'

beforeEach(() => {
  // Empty server progress on GET, OK on PUT — App's local state drives the assertions.
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) =>
    init?.method === 'PUT'
      ? new Response('{"stars":3,"solved":true}', { status: 200 })
      : new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
  ) as unknown as typeof fetch)
})

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })

describe('App (map <-> level flow)', () => {
  it('opens the first level from the map, solves it, returns to the map with stars and unlocks the next', async () => {
    render(<App />)

    // On the map: open level 1 (corridor)
    fireEvent.click(screen.getByText(sampleLevels[0].title))

    // Solve via the Code tab
    fireEvent.click(screen.getByText('Код'))
    const area = screen.getByLabelText('Редактор кода КуМир') as HTMLTextAreaElement
    fireEvent.change(area, {
      target: { value: 'закрасить\nнц пока справа свободно\n  вправо\n  закрасить\nкц' },
    })
    fireEvent.click(screen.getByText('Запустить'))

    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Результат' })).toBeTruthy(), { timeout: 4000 })
    fireEvent.click(screen.getByText('Продолжить'))

    // Back on the map: total stars now > 0 and the 2nd level is unlocked (its button enabled)
    await waitFor(() => expect(screen.getByText(/⭐ 3/)).toBeTruthy())
    const secondNode = screen.getByText(sampleLevels[1].title).closest('button') as HTMLButtonElement
    expect(secondNode.disabled).toBe(false)
  })
})
