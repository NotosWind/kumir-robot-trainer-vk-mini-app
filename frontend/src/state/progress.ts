export interface LevelProgress {
  stars: number
  solved: boolean
}

export type ProgressMap = Record<string, LevelProgress>

export interface KeyValue {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const STORAGE_KEY = 'kumir-progress'

export function recordResult(prev: ProgressMap, levelId: string, stars: number): ProgressMap {
  const best = Math.max(stars, prev[levelId]?.stars ?? 0)
  return { ...prev, [levelId]: { stars: best, solved: best >= 1 } }
}

export function totalStars(progress: ProgressMap): number {
  return Object.values(progress).reduce((sum, p) => sum + p.stars, 0)
}

export function isUnlocked(levelIds: string[], progress: ProgressMap, index: number): boolean {
  if (index <= 0) return true
  const prevId = levelIds[index - 1]
  return Boolean(progress[prevId]?.solved)
}

export function loadProgress(kv: KeyValue, key: string = STORAGE_KEY): ProgressMap {
  const raw = kv.getItem(key)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as ProgressMap) : {}
  } catch {
    return {}
  }
}

export function saveProgress(kv: KeyValue, progress: ProgressMap, key: string = STORAGE_KEY): void {
  kv.setItem(key, JSON.stringify(progress))
}

export function mergeProgress(a: ProgressMap, b: ProgressMap): ProgressMap {
  const out: ProgressMap = { ...a }
  for (const [id, entry] of Object.entries(b)) {
    const best = Math.max(entry.stars, out[id]?.stars ?? 0)
    out[id] = { stars: best, solved: best >= 1 || entry.solved || (out[id]?.solved ?? false) }
  }
  return out
}

/** Browser-backed storage with an in-memory fallback (so SSR/tests never throw). */
export function browserStorage(): KeyValue {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    // access can throw in some sandboxes
  }
  const mem: Record<string, string> = {}
  return {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = v },
  }
}
