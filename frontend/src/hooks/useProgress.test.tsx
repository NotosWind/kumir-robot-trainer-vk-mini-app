// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProgress } from './useProgress'

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })

describe('useProgress', () => {
  it('merges server progress on mount', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ corridor: { stars: 3, solved: true } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )))
    const { result } = renderHook(() => useProgress())
    await waitFor(() => expect(result.current.progress.corridor?.stars).toBe(3))
  })

  it('recordSolved updates state and PUTs to the server', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === 'PUT'
        ? new Response('{"stars":2,"solved":true}', { status: 200 })
        : new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch)
    const { result } = renderHook(() => useProgress())
    act(() => { result.current.recordSolved('corridor', 2) })
    expect(result.current.progress.corridor).toEqual({ stars: 2, solved: true })
    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([, i]) => (i as RequestInit | undefined)?.method === 'PUT')).toBe(true),
    )
  })

  it('keeps local progress when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    const { result } = renderHook(() => useProgress())
    act(() => { result.current.recordSolved('corridor', 1) })
    expect(result.current.progress.corridor?.stars).toBe(1)
  })
})
