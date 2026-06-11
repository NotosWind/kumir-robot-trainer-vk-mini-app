import { describe, it, expect } from 'vitest'
import { astToText } from './printer'
import type { Program } from './ast'

describe('astToText', () => {
  it('prints commands one per line', () => {
    const p: Program = { body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] }
    expect(astToText(p)).toBe('вправо\nзакрасить')
  })

  it('prints a while loop with 2-space body indentation', () => {
    const p: Program = {
      body: [
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] },
      ],
    }
    expect(astToText(p)).toBe('нц пока справа свободно\n  вправо\n  закрасить\nкц')
  })

  it('prints repeat and if/else', () => {
    const p: Program = {
      body: [
        { kind: 'repeat', count: 3, body: [{ kind: 'cmd', cmd: 'вниз' }] },
        { kind: 'if', cond: { kind: 'pred', pred: { kind: 'painted' } },
          then: [{ kind: 'cmd', cmd: 'закрасить' }],
          else: [{ kind: 'cmd', cmd: 'вправо' }] },
      ],
    }
    expect(astToText(p)).toBe(
      'нц 3 раз\n  вниз\nкц\nесли клетка закрашена\n  то\n    закрасить\n  иначе\n    вправо\nвсе',
    )
  })

  it('maps direction predicates to КуМир wording', () => {
    const p: Program = {
      body: [
        { kind: 'if', cond: { kind: 'pred', pred: { kind: 'wall', dir: 'влево' } },
          then: [{ kind: 'cmd', cmd: 'закрасить' }] },
      ],
    }
    expect(astToText(p)).toBe('если слева стена\n  то\n    закрасить\nвсе')
  })
})
