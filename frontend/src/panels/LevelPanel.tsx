import './level.css'
import '../components/editor/editor.css'
import { useState } from 'react'
import { useLevelSession } from '../hooks/useLevelSession'
import { FieldView } from '../components/field/FieldView'
import { CodeEditor } from '../components/editor/CodeEditor'
import { BlockEditor } from '../components/editor/BlockEditor'
import { RunControls } from '../components/controls/RunControls'
import { ResultModal } from '../components/ResultModal'
import { stateAtFrame } from '../state/playback'
import type { Level } from '../levels/types'

export interface LevelPanelProps {
  level: Level
  onExit?: () => void
  onSolved?: (stars: number) => void
}

export function LevelPanel({ level, onExit, onSolved }: LevelPanelProps) {
  const { state, dispatch } = useLevelSession(level)
  const [full, setFull] = useState(false)
  const field = level.fields[0]
  const view = stateAtFrame(field, state.run.frames, state.run.index)

  const handleContinue = () => {
    if (state.result) onSolved?.(state.result.stars)
    if (onExit) onExit()
    else dispatch({ type: 'closeResult' })
  }
  const handleRetry = () => dispatch({ type: 'closeResult' })

  return (
    <div className="level">
      <div className="level-head">
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {onExit && <button className="back" aria-label="Назад" onClick={onExit}>←</button>}
          {level.title}
        </span>
        <button className="tab expand" onClick={() => setFull((f) => !f)} aria-label="Развернуть редактор">⛶</button>
      </div>
      <div className="level-goal">{level.goal}</div>
      {level.intro && <div className="level-intro">{level.intro}</div>}

      <div className="level-body">
        {!full && (
          <div className="field-wrap">
            <FieldView field={field} robot={view.robot} painted={view.painted} crashAt={view.crashAt} />
          </div>
        )}

        <div className="editor-wrap">
          <div className="tabs">
            <button className={state.mode === 'blocks' ? 'tab act' : 'tab'} onClick={() => dispatch({ type: 'setMode', mode: 'blocks' })}>Блоки</button>
            <button className={state.mode === 'code' ? 'tab act' : 'tab'} onClick={() => dispatch({ type: 'setMode', mode: 'code' })}>Код</button>
          </div>

          {state.mode === 'code' ? (
            <CodeEditor code={state.code} full={full} error={state.parseError}
              onChange={(code) => dispatch({ type: 'setCode', code })} />
          ) : (
            <BlockEditor program={state.program} allowed={level.allowedBlocks}
              onChange={(program) => dispatch({ type: 'setProgram', program })} />
          )}

          <RunControls
            playing={state.run.playing}
            onRun={() => dispatch({ type: 'run' })}
            onStep={() => dispatch({ type: 'tick' })}
            onReset={() => dispatch({ type: 'reset' })}
          />
        </div>
      </div>

      {state.result && (
        <ResultModal
          result={state.result}
          totalFields={level.fields.length}
          onContinue={handleContinue}
          onClose={handleRetry}
        />
      )}
    </div>
  )
}
