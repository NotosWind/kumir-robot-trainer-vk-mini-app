export const COMMANDS = ['вверх', 'вниз', 'влево', 'вправо', 'закрасить'] as const
export const DIRECTIONS = ['вверх', 'вниз', 'влево', 'вправо'] as const

export type Command = (typeof COMMANDS)[number]
export type Direction = (typeof DIRECTIONS)[number]

export type Predicate =
  | { kind: 'free'; dir: Direction }   // <dir> свободно
  | { kind: 'wall'; dir: Direction }   // <dir> стена
  | { kind: 'painted' }                // клетка закрашена
  | { kind: 'clear' }                  // клетка чиста

export type Condition =
  | { kind: 'pred'; pred: Predicate }
  | { kind: 'not'; expr: Condition }
  | { kind: 'and'; left: Condition; right: Condition }
  | { kind: 'or'; left: Condition; right: Condition }

export type Stmt =
  | { kind: 'cmd'; cmd: Command }
  | { kind: 'whileLoop'; cond: Condition; body: Stmt[] }       // нц пока ... кц
  | { kind: 'repeat'; count: number; body: Stmt[] }            // нц N раз ... кц
  | { kind: 'if'; cond: Condition; then: Stmt[]; else?: Stmt[] } // если ... то ... иначе ... все

export interface Program {
  body: Stmt[]
}

export function isCommand(word: string): word is Command {
  return (COMMANDS as readonly string[]).includes(word)
}

export function isDirection(word: string): word is Direction {
  return (DIRECTIONS as readonly string[]).includes(word)
}

export function countCommands(program: Program): number {
  const walk = (stmts: Stmt[]): number =>
    stmts.reduce((n, s) => {
      if (s.kind === 'cmd') return n + 1
      if (s.kind === 'whileLoop' || s.kind === 'repeat') return n + walk(s.body)
      if (s.kind === 'if') return n + walk(s.then) + (s.else ? walk(s.else) : 0)
      return n
    }, 0)
  return walk(program.body)
}

export function usesLoop(program: Program): boolean {
  const walk = (stmts: Stmt[]): boolean =>
    stmts.some((s) => {
      if (s.kind === 'whileLoop' || s.kind === 'repeat') return true
      if (s.kind === 'if') return walk(s.then) || (s.else ? walk(s.else) : false)
      return false
    })
  return walk(program.body)
}
