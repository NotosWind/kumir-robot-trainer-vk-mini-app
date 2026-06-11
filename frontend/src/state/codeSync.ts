import { astToText, parse, ParseError } from '../engine'
import type { Program } from '../engine'

export function programToCode(program: Program): string {
  return astToText(program)
}

export type CodeParseResult =
  | { ok: true; program: Program }
  | { ok: false; message: string; line: number }

export function codeToProgram(code: string): CodeParseResult {
  try {
    return { ok: true, program: parse(code) }
  } catch (e) {
    if (e instanceof ParseError) return { ok: false, message: e.message, line: e.line }
    return { ok: false, message: 'Не удалось разобрать программу', line: 1 }
  }
}
