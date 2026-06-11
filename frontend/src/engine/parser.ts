import type { Command, Condition, Direction, Predicate, Program, Stmt } from './ast'
import { isCommand } from './ast'

export class ParseError extends Error {
  line: number
  constructor(message: string, line: number) {
    super(`Строка ${line}: ${message}`)
    this.name = 'ParseError'
    this.line = line
  }
}

const LABEL_DIR: Record<string, Direction> = {
  слева: 'влево',
  справа: 'вправо',
  сверху: 'вверх',
  снизу: 'вниз',
}

const HEADER_WORDS = new Set(['использовать', 'алг', 'нач', 'кон'])

interface Line {
  text: string
  no: number // 1-based original line number
}

export function parse(source: string): Program {
  const lines: Line[] = source
    .split('\n')
    .map((t, i) => ({ text: t.trim(), no: i + 1 }))
    .filter((l) => l.text.length > 0)
    .filter((l) => {
      const first = l.text.toLowerCase().split(/\s+/)[0]
      return !HEADER_WORDS.has(first)
    })

  let pos = 0

  const peek = (): Line | undefined => lines[pos]

  const parseBlock = (terminators: string[]): Stmt[] => {
    const body: Stmt[] = []
    while (pos < lines.length) {
      const line = lines[pos]
      const lower = line.text.toLowerCase()
      if (terminators.includes(lower)) return body
      body.push(parseStmt())
    }
    if (terminators.length > 0) {
      throw new ParseError(
        `ожидалось «${terminators.join('» или «')}»`,
        lines[lines.length - 1]?.no ?? 1,
      )
    }
    return body
  }

  const parseStmt = (): Stmt => {
    const line = lines[pos]
    const tokens = line.text.split(/\s+/)
    const head = tokens[0].toLowerCase()

    if (head === 'нц') return parseLoop(line, tokens)
    if (head === 'если') return parseIf(line, tokens)
    if (tokens.length === 1 && isCommand(line.text)) {
      pos += 1
      return { kind: 'cmd', cmd: line.text as Command }
    }
    throw new ParseError(`неизвестная команда «${line.text}»`, line.no)
  }

  const parseLoop = (line: Line, tokens: string[]): Stmt => {
    pos += 1 // consume the нц-line
    // нц N раз  |  нц пока <cond>
    if (tokens[1]?.toLowerCase() === 'пока') {
      const cond = parseCondition(tokens.slice(2), line.no)
      const body = parseBlock(['кц'])
      expectTerminator('кц', line.no)
      return { kind: 'whileLoop', cond, body }
    }
    const n = Number(tokens[1])
    if (!Number.isInteger(n) || n < 0 || tokens[2]?.toLowerCase() !== 'раз') {
      throw new ParseError('ожидалось «нц пока …» или «нц N раз»', line.no)
    }
    const body = parseBlock(['кц'])
    expectTerminator('кц', line.no)
    return { kind: 'repeat', count: n, body }
  }

  const parseIf = (line: Line, tokens: string[]): Stmt => {
    pos += 1 // consume the если-line
    const cond = parseCondition(tokens.slice(1), line.no)
    // optional standalone "то" line
    if (peek() && peek()!.text.toLowerCase() === 'то') pos += 1
    const then = parseBlock(['иначе', 'все'])
    let elseBody: Stmt[] | undefined
    if (peek() && peek()!.text.toLowerCase() === 'иначе') {
      pos += 1
      elseBody = parseBlock(['все'])
    }
    expectTerminator('все', line.no)
    return { kind: 'if', cond, then, else: elseBody }
  }

  const expectTerminator = (word: string, openedAt: number): void => {
    const line = peek()
    if (!line || line.text.toLowerCase() !== word) {
      throw new ParseError(`не закрыта конструкция, ожидалось «${word}»`, openedAt)
    }
    pos += 1
  }

  // --- condition parsing (precedence: или < и < не < predicate) ---
  const parseCondition = (tokens: string[], lineNo: number): Condition => {
    // Split parentheses out of glued tokens, e.g. "(справа" -> "(", "справа".
    const words = tokens
      .flatMap((t) => t.split(/([()])/))
      .filter((t) => t.length > 0)
    let i = 0

    const fail = (msg: string): never => {
      throw new ParseError(msg, lineNo)
    }

    const parsePredicate = (): Predicate => {
      const w = words[i]?.toLowerCase()
      if (w === 'клетка') {
        const next = words[i + 1]?.toLowerCase()
        if (next === 'закрашена') { i += 2; return { kind: 'painted' } }
        if (next === 'чиста') { i += 2; return { kind: 'clear' } }
        return fail('ожидалось «клетка закрашена» или «клетка чиста»')
      }
      if (w !== undefined && w in LABEL_DIR) {
        const dir = LABEL_DIR[w]
        const next = words[i + 1]?.toLowerCase()
        if (next === 'свободно') { i += 2; return { kind: 'free', dir } }
        if (next === 'стена') { i += 2; return { kind: 'wall', dir } }
        return fail(`ожидалось «свободно» или «стена» после «${w}»`)
      }
      return fail(`неизвестное условие «${words[i]}»`)
    }

    const parsePrimary = (): Condition => {
      const w = words[i]?.toLowerCase()
      if (w === undefined) return fail('пустое условие')
      if (w === 'не') {
        i += 1
        return { kind: 'not', expr: parsePrimary() }
      }
      if (w === '(') {
        i += 1
        const inner = parseOr()
        if (words[i] !== ')') return fail('ожидалась «)»')
        i += 1
        return inner
      }
      return { kind: 'pred', pred: parsePredicate() }
    }

    const parseAnd = (): Condition => {
      let left = parsePrimary()
      while (words[i]?.toLowerCase() === 'и') {
        i += 1
        left = { kind: 'and', left, right: parsePrimary() }
      }
      return left
    }

    const parseOr = (): Condition => {
      let left = parseAnd()
      while (words[i]?.toLowerCase() === 'или') {
        i += 1
        left = { kind: 'or', left, right: parseAnd() }
      }
      return left
    }

    const result = parseOr()
    if (i !== words.length) fail(`лишние слова в условии: «${words.slice(i).join(' ')}»`)
    return result
  }

  const program = parseBlock([])
  return { body: program }
}
