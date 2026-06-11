import './editor.css'
import './blocks.css'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Condition, Program, Stmt } from '../../engine'
import { appendStmt, removeAt, setCondition, setCount } from '../../state/astEdit'
import { COMMAND_ITEMS, STRUCTURE_ITEMS, PRED_CHOICES, makeStmt, isAllowed } from './palette'
import type { PaletteItem } from './palette'

export interface BlockEditorProps {
  program: Program
  allowed?: string[]
  onChange: (program: Program) => void
}

const DIR_WORD: Record<string, string> = { влево: 'слева', вправо: 'справа', вверх: 'сверху', вниз: 'снизу' }

function condText(c: Condition): string {
  if (c.kind === 'pred') {
    const p = c.pred
    if (p.kind === 'free') return `${DIR_WORD[p.dir]} свободно`
    if (p.kind === 'wall') return `${DIR_WORD[p.dir]} стена`
    if (p.kind === 'painted') return 'клетка закрашена'
    return 'клетка чиста'
  }
  return '…' // compound conditions are edited in the Code tab
}

export function BlockEditor({ program, allowed, onChange }: BlockEditorProps) {
  const [selected, setSelected] = useState<number[] | null>(null)

  const addInto = (path: number[], item: PaletteItem) => onChange(appendStmt(program, path, makeStmt(item)))

  const condSelect = (path: number[], cond: Condition) => {
    const current = cond.kind === 'pred' ? JSON.stringify(cond.pred) : null
    const value = PRED_CHOICES.findIndex((c) => JSON.stringify(c.pred) === current)
    return (
      <select
        className="cond-select"
        value={value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) =>
          onChange(setCondition(program, path, { kind: 'pred', pred: PRED_CHOICES[Number(e.target.value)].pred }))
        }
      >
        {cond.kind !== 'pred' && <option value={-1}>{condText(cond)}</option>}
        {PRED_CHOICES.map((c, idx) => (
          <option key={c.label} value={idx}>{c.label}</option>
        ))}
      </select>
    )
  }

  const head = (path: number[], label: string, cls: string, cond?: Condition) => {
    const sel = selected?.join('.') === path.join('.')
    return (
      <div className={`blk ${cls}${sel ? ' sel' : ''}`} onClick={(e) => { e.stopPropagation(); setSelected(path) }}>
        <span>{label}</span>
        {cond !== undefined && condSelect(path, cond)}
        {sel && (
          <button className="blk-del" onClick={(e) => { e.stopPropagation(); setSelected(null); onChange(removeAt(program, path)) }}>✕</button>
        )}
      </div>
    )
  }

  const renderBody = (body: Stmt[], path: number[]): ReactNode => (
    <div className="blk-body">
      {body.map((s, i) => renderStmt(s, [...path, i]))}
      <Palette allowed={allowed} onPick={(item) => addInto(path, item)} />
    </div>
  )

  const renderStmt = (s: Stmt, path: number[]): ReactNode => {
    const k = path.join('.')
    switch (s.kind) {
      case 'cmd':
        return <div key={k}>{head(path, s.cmd, 'cmd')}</div>
      case 'whileLoop':
        return (
          <div key={k} className="blk-group">
            {head(path, 'нц пока', 'kw', s.cond)}
            {renderBody(s.body, path)}
            <div className="blk kw">кц</div>
          </div>
        )
      case 'repeat': {
        const sel = selected?.join('.') === path.join('.')
        return (
          <div key={k} className="blk-group">
            <div className={`blk kw${sel ? ' sel' : ''}`} onClick={(e) => { e.stopPropagation(); setSelected(path) }}>
              <span>нц</span>
              <input
                className="count-input"
                type="number"
                min={1}
                max={99}
                value={s.count}
                aria-label="Сколько раз повторить"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(99, Math.floor(Number(e.target.value) || 1)))
                  onChange(setCount(program, path, n))
                }}
              />
              <span>раз</span>
              {sel && (
                <button className="blk-del" onClick={(e) => { e.stopPropagation(); setSelected(null); onChange(removeAt(program, path)) }}>✕</button>
              )}
            </div>
            {renderBody(s.body, path)}
            <div className="blk kw">кц</div>
          </div>
        )
      }
      case 'if':
        return (
          <div key={k} className="blk-group">
            {head(path, 'если', 'kw', s.cond)}
            <div className="blk kw sub">то</div>
            {renderBody(s.then, path)}
            <div className="blk kw">все</div>
          </div>
        )
    }
  }

  return <div className="block-editor" onClick={() => setSelected(null)}>{renderBody(program.body, [])}</div>
}

function Palette({ allowed, onPick }: { allowed?: string[]; onPick: (item: PaletteItem) => void }) {
  return (
    <div className="palette">
      {COMMAND_ITEMS.filter((c) => isAllowed(allowed, c.label)).map((c) => (
        <button key={c.label} className="chip cmd" onClick={(e) => { e.stopPropagation(); onPick(c) }}>+ {c.label}</button>
      ))}
      {STRUCTURE_ITEMS.filter((s) => isAllowed(allowed, s.label)).map((s) => (
        <button key={s.label} className="chip kw" onClick={(e) => { e.stopPropagation(); onPick(s) }}>+ {s.label}</button>
      ))}
    </div>
  )
}
