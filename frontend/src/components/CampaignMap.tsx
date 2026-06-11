import './CampaignMap.css'
import type { Level } from '../levels/types'
import { isUnlocked, totalStars } from '../state/progress'
import type { ProgressMap } from '../state/progress'

export interface CampaignMapProps {
  levels: Level[]
  progress: ProgressMap
  onSelect: (levelId: string) => void
}

export function CampaignMap({ levels, progress, onSelect }: CampaignMapProps) {
  const ids = levels.map((l) => l.id)
  return (
    <div className="map">
      <div className="map-head">
        <span>КуМир-Робот</span>
        <span className="map-stars">⭐ {totalStars(progress)}</span>
      </div>
      <div className="map-list">
        {levels.map((lvl, i) => {
          const unlocked = isUnlocked(ids, progress, i)
          const stars = progress[lvl.id]?.stars ?? 0
          const done = progress[lvl.id]?.solved ?? false
          return (
            <button
              key={lvl.id}
              className={`map-node${done ? ' done' : ''}`}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(lvl.id)}
            >
              <span className="idx">{i + 1}</span>
              <span className="meta">
                <h3>{lvl.title}</h3>
                <span className="stars">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
              </span>
              {!unlocked && <span className="lock">🔒</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
