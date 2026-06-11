// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiGetProgress, apiPutResult } from './client'

afterEach(() => { vi.unstubAllGlobals() })

describe('api client', () => {
  it('GET /progress returns the parsed map', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ corridor: { stars: 2, solved: true } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )))
    const map = await apiGetProgress()
    expect(map).toEqual({ corridor: { stars: 2, solved: true } })
  })

  it('PUT sends stars and rejects on non-OK', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response('', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch)
    await expect(apiPutResult('corridor', 3)).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledOnce()
    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ stars: 3 })
  })
})
