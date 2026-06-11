import { describe, it, expect } from 'vitest'
import { parse, ParseError } from './parser'
import { astToText } from './printer'
import type { Program } from './ast'

describe('parser: basics', () => {
  it('parses a flat command sequence', () => {
    const p = parse('вправо\nзакрасить')
    expect(p).toEqual<Program>({
      body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }],
    })
  })

  it('ignores header lines and blank lines', () => {
    const p = parse('использовать Робот\nалг\nнач\n\nвправо\nкон')
    expect(p.body).toEqual([{ kind: 'cmd', cmd: 'вправо' }])
  })
})

describe('parser: loops', () => {
  it('parses a while loop with a predicate', () => {
    const p = parse('нц пока справа свободно\n  вправо\n  закрасить\nкц')
    expect(p.body[0]).toEqual({
      kind: 'whileLoop',
      cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
      body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }],
    })
  })

  it('parses нц N раз', () => {
    const p = parse('нц 3 раз\n  вниз\nкц')
    expect(p.body[0]).toEqual({
      kind: 'repeat', count: 3, body: [{ kind: 'cmd', cmd: 'вниз' }],
    })
  })
})

describe('parser: if/else and conditions', () => {
  it('parses если ... то ... иначе ... все', () => {
    const p = parse('если клетка закрашена\n  то\n    вправо\n  иначе\n    закрасить\nвсе')
    expect(p.body[0]).toEqual({
      kind: 'if',
      cond: { kind: 'pred', pred: { kind: 'painted' } },
      then: [{ kind: 'cmd', cmd: 'вправо' }],
      else: [{ kind: 'cmd', cmd: 'закрасить' }],
    })
  })

  it('parses не / и / или with correct precedence', () => {
    const p = parse('если не справа свободно и снизу стена\n  то\n    закрасить\nвсе')
    expect(p.body[0]).toEqual({
      kind: 'if',
      cond: {
        kind: 'and',
        left: { kind: 'not', expr: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } } },
        right: { kind: 'pred', pred: { kind: 'wall', dir: 'вниз' } },
      },
      then: [{ kind: 'cmd', cmd: 'закрасить' }],
      else: undefined,
    })
  })
})

describe('parser: errors', () => {
  it('throws ParseError with a line number on unknown words', () => {
    expect(() => parse('вправо\nпрыгнуть')).toThrow(ParseError)
    try {
      parse('вправо\nпрыгнуть')
    } catch (e) {
      expect((e as ParseError).line).toBe(2)
    }
  })

  it('throws on an unclosed loop', () => {
    expect(() => parse('нц пока справа свободно\n  вправо')).toThrow(ParseError)
  })
})

describe('parser/printer round-trip', () => {
  it('parse(astToText(p)) deep-equals p', () => {
    const p: Program = {
      body: [
        { kind: 'cmd', cmd: 'закрасить' },
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] },
        { kind: 'if', cond: { kind: 'or',
            left: { kind: 'pred', pred: { kind: 'wall', dir: 'вверх' } },
            right: { kind: 'pred', pred: { kind: 'clear' } } },
          then: [{ kind: 'cmd', cmd: 'вверх' }] },
      ],
    }
    expect(parse(astToText(p))).toEqual(p)
  })

  it('round-trips a не (...) condition', () => {
    const p: Program = {
      body: [
        { kind: 'if', cond: { kind: 'not', expr: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } } },
          then: [{ kind: 'cmd', cmd: 'закрасить' }] },
      ],
    }
    expect(parse(astToText(p))).toEqual(p)
  })
})
