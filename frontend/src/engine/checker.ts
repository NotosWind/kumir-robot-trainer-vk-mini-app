import type { Program } from './ast'
import { countCommands, usesLoop } from './ast'
import type { FieldSpec } from './field'
import { key } from './field'
import { run } from './interpreter'
import type { RunStatus } from './interpreter'

export interface StarSpec {
  efficiency?: { maxCommands?: number; requireLoop?: boolean }
}

export interface LevelLike {
  fields: FieldSpec[]
  stars?: StarSpec
}

export interface PerField {
  ok: boolean
  status: RunStatus
  missing: number // target cells that were left unpainted
  extra: number // painted cells that are not part of the target
}

export interface CheckResult {
  passedVisible: boolean
  passedAll: boolean
  stars: 0 | 1 | 2 | 3
  perField: PerField[]
  efficiency: { commandCount: number; usedLoop: boolean; withinLimit: boolean }
}

function targetKeys(field: FieldSpec): Set<string> {
  return new Set(field.target.map((c) => key(c.x, c.y)))
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

export function check(program: Program, level: LevelLike): CheckResult {
  const perField: PerField[] = level.fields.map((field) => {
    const result = run(program, field)
    const target = targetKeys(field)
    const ok = result.status === 'ok' && setsEqual(result.painted, target)
    let missing = 0
    for (const k of target) if (!result.painted.has(k)) missing += 1
    let extra = 0
    for (const k of result.painted) if (!target.has(k)) extra += 1
    return { ok, status: result.status, missing, extra }
  })

  const passedVisible = perField[0]?.ok ?? false
  const passedAll = perField.length > 0 && perField.every((p) => p.ok)

  const commandCount = countCommands(program)
  const usedLoop = usesLoop(program)
  const eff = level.stars?.efficiency
  const withinLimit =
    (!eff?.requireLoop || usedLoop) &&
    (eff?.maxCommands === undefined || commandCount <= eff.maxCommands)

  let stars: 0 | 1 | 2 | 3 = 0
  if (passedVisible) stars = 1
  if (passedAll) stars = 2
  if (passedAll && withinLimit) stars = 3

  return {
    passedVisible,
    passedAll,
    stars,
    perField,
    efficiency: { commandCount, usedLoop, withinLimit },
  }
}
