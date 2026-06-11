import type { Command, Condition, Predicate, Program, Stmt } from './ast'
import { Field, key } from './field'
import type { Cell, FieldSpec } from './field'

export type RunStatus = 'ok' | 'crash' | 'looplimit'

export interface Frame {
  action: 'move' | 'paint' | 'crash'
  robot: Cell
  paintedCell?: Cell
}

export interface RunResult {
  status: RunStatus
  robot: Cell
  painted: Set<string>
  steps: number
  crashAt?: Cell
  frames?: Frame[]
}

export interface RunOptions {
  stepLimit?: number
  recordFrames?: boolean
}

const DEFAULT_STEP_LIMIT = 100_000

class LoopLimitError extends Error {}
class CrashError extends Error {
  at: Cell
  constructor(at: Cell) {
    super('crash')
    this.at = at
  }
}

export function run(program: Program, spec: FieldSpec, opts: RunOptions = {}): RunResult {
  const field = new Field(spec)
  const stepLimit = opts.stepLimit ?? DEFAULT_STEP_LIMIT
  const frames: Frame[] | undefined = opts.recordFrames ? [] : undefined
  let steps = 0

  const evalPredicate = (pred: Predicate): boolean => {
    switch (pred.kind) {
      case 'free': return field.free(pred.dir)
      case 'wall': return !field.free(pred.dir)
      case 'painted': return field.isPainted()
      case 'clear': return field.isClear()
    }
  }

  const evalCond = (cond: Condition): boolean => {
    switch (cond.kind) {
      case 'pred': return evalPredicate(cond.pred)
      case 'not': return !evalCond(cond.expr)
      case 'and': return evalCond(cond.left) && evalCond(cond.right)
      case 'or': return evalCond(cond.left) || evalCond(cond.right)
    }
  }

  const execCommand = (cmd: Command): void => {
    steps += 1
    if (steps > stepLimit) throw new LoopLimitError()
    if (cmd === 'закрасить') {
      field.paint()
      frames?.push({ action: 'paint', robot: { ...field.robot }, paintedCell: { ...field.robot } })
      return
    }
    // movement command
    const moved = field.move(cmd)
    if (!moved) throw new CrashError({ ...field.robot })
    frames?.push({ action: 'move', robot: { ...field.robot } })
  }

  const execBlock = (stmts: Stmt[]): void => {
    for (const s of stmts) execStmt(s)
  }

  const execStmt = (s: Stmt): void => {
    switch (s.kind) {
      case 'cmd':
        execCommand(s.cmd)
        break
      case 'whileLoop':
        while (evalCond(s.cond)) {
          if (steps > stepLimit) throw new LoopLimitError()
          execBlock(s.body)
          // guard against bodies with no commands that loop forever
          steps += 1
          if (steps > stepLimit) throw new LoopLimitError()
        }
        break
      case 'repeat':
        for (let i = 0; i < s.count; i += 1) execBlock(s.body)
        break
      case 'if':
        if (evalCond(s.cond)) execBlock(s.then)
        else if (s.else) execBlock(s.else)
        break
    }
  }

  try {
    execBlock(program.body)
    return {
      status: 'ok', robot: { ...field.robot },
      painted: new Set(field.paintedKeys()), steps, frames,
    }
  } catch (e) {
    if (e instanceof CrashError) {
      frames?.push({ action: 'crash', robot: e.at })
      return { status: 'crash', robot: e.at, painted: new Set(field.paintedKeys()), steps, crashAt: e.at, frames }
    }
    if (e instanceof LoopLimitError) {
      return { status: 'looplimit', robot: { ...field.robot }, painted: new Set(field.paintedKeys()), steps, frames }
    }
    throw e
  }
}

export { key }
