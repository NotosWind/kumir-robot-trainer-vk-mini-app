import { useReducer } from 'react'
import { CampaignMap } from './components/CampaignMap'
import { LevelPanel } from './panels/LevelPanel'
import { sampleLevels } from './levels/sampleLevels'
import { navReducer, initialNav } from './state/navigation'
import { useProgress } from './hooks/useProgress'

export default function App() {
  const [nav, dispatch] = useReducer(navReducer, initialNav)
  const { progress, recordSolved } = useProgress()

  const openLevel = (id: string) => dispatch({ type: 'openLevel', levelId: id })

  if (nav.screen === 'level') {
    const level = sampleLevels.find((l) => l.id === nav.levelId)
    if (level) {
      return (
        <LevelPanel
          level={level}
          onExit={() => dispatch({ type: 'backToMap' })}
          onSolved={(stars) => recordSolved(level.id, stars)}
        />
      )
    }
  }

  return <CampaignMap levels={sampleLevels} progress={progress} onSelect={openLevel} />
}
