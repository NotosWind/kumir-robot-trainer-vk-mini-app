import './editor.css'

export interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  full: boolean
  error?: { message: string; line: number }
}

export function CodeEditor({ code, onChange, full, error }: CodeEditorProps) {
  return (
    <div>
      <textarea
        className={full ? 'code-area full' : 'code-area'}
        value={code}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Редактор кода КуМир"
      />
      {error && <div className="parse-error">{error.message}</div>}
    </div>
  )
}
