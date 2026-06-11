import { useEffect, useState } from 'react'
import {
  browserStorage, loadProgress, mergeProgress, recordResult, saveProgress,
} from '../state/progress'
import type { ProgressMap } from '../state/progress'
import { apiGetProgress, apiPutResult } from '../api/client'

const storage = browserStorage()

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress(storage))

  // On mount: merge the server copy when reachable; ignore failures (offline).
  useEffect(() => {
    let alive = true
    apiGetProgress()
      .then((remote) => {
        if (!alive) return
        setProgress((prev) => {
          const merged = mergeProgress(prev, remote)
          saveProgress(storage, merged)
          return merged
        })
      })
      .catch(() => { /* offline — keep local */ })
    return () => { alive = false }
  }, [])

  const recordSolved = (levelId: string, stars: number) => {
    setProgress((prev) => {
      const next = recordResult(prev, levelId, stars)
      saveProgress(storage, next)
      return next
    })
    apiPutResult(levelId, stars).catch(() => { /* offline — local already saved */ })
  }

  return { progress, recordSolved }
}
