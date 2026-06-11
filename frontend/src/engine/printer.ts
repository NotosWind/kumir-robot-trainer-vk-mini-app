import type { Condition, Direction, Predicate, Program, Stmt } from './ast'

const DIR_LABEL: Record<Direction, string> = {
  влево: 'слева',
  вправо: 'справа',
  вверх: 'сверху',
  вниз: 'снизу',
}

function predicateToText(p: Predicate): string {
  switch (p.kind) {
    case 'free': return `${DIR_LABEL[p.dir]} свободно`
    case 'wall': return `${DIR_LABEL[p.dir]} стена`
    case 'painted': return 'клетка закрашена'
    case 'clear': return 'клетка чиста'
  }
}

export function conditionToText(c: Condition): string {
  switch (c.kind) {
    case 'pred': return predicateToText(c.pred)
    case 'not': return `не (${conditionToText(c.expr)})`
    case 'and': return `${conditionToText(c.left)} и ${conditionToText(c.right)}`
    case 'or': return `${conditionToText(c.left)} или ${conditionToText(c.right)}`
  }
}

const pad = (depth: number) => '  '.repeat(depth)

function stmtToLines(s: Stmt, depth: number): string[] {
  const ind = pad(depth)
  switch (s.kind) {
    case 'cmd':
      return [ind + s.cmd]
    case 'whileLoop':
      return [
        `${ind}нц пока ${conditionToText(s.cond)}`,
        ...s.body.flatMap((b) => stmtToLines(b, depth + 1)),
        `${ind}кц`,
      ]
    case 'repeat':
      return [
        `${ind}нц ${s.count} раз`,
        ...s.body.flatMap((b) => stmtToLines(b, depth + 1)),
        `${ind}кц`,
      ]
    case 'if': {
      const lines = [
        `${ind}если ${conditionToText(s.cond)}`,
        `${ind}  то`,
        ...s.then.flatMap((b) => stmtToLines(b, depth + 2)),
      ]
      if (s.else) {
        lines.push(`${ind}  иначе`, ...s.else.flatMap((b) => stmtToLines(b, depth + 2)))
      }
      lines.push(`${ind}все`)
      return lines
    }
  }
}

export function astToText(program: Program): string {
  return program.body.flatMap((s) => stmtToLines(s, 0)).join('\n')
}
