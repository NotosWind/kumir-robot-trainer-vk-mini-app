import '../editor/editor.css'

export interface RunControlsProps {
  playing: boolean
  onRun: () => void
  onStep: () => void
  onReset: () => void
}

export function RunControls({ playing, onRun, onStep, onReset }: RunControlsProps) {
  return (
    <div className="controls">
      <button className="btn run" onClick={onRun} disabled={playing}>
        <span className="ic">▶</span><span className="lb">Запустить</span>
      </button>
      <button className="btn step" onClick={onStep} disabled={playing}>
        <span className="ic">⏭</span><span className="lb">Шаг</span>
      </button>
      <button className="btn reset" onClick={onReset}>
        <span className="ic">↺</span><span className="lb">Сброс</span>
      </button>
    </div>
  )
}
