import type { ProgressMap } from '../state/progress'

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

function launchHeader(): Record<string, string> {
  const params = typeof window !== 'undefined' ? window.location.search.slice(1) : ''
  return params ? { 'X-VK-Launch-Params': params } : {}
}

export async function apiGetProgress(): Promise<ProgressMap> {
  const res = await fetch(`${BASE}/progress`, { headers: launchHeader() })
  if (!res.ok) throw new Error(`GET /progress failed: ${res.status}`)
  return (await res.json()) as ProgressMap
}

export async function apiPutResult(levelId: string, stars: number): Promise<void> {
  const res = await fetch(`${BASE}/progress/${encodeURIComponent(levelId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...launchHeader() },
    body: JSON.stringify({ stars }),
  })
  if (!res.ok) throw new Error(`PUT /progress failed: ${res.status}`)
}
