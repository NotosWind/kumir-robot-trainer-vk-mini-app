import { describe, it, expect } from 'vitest'
import { programToCode, codeToProgram } from './codeSync'
import type { Program } from '../engine'

const prog: Program = {
  body: [
    { kind: 'cmd', cmd: 'закрасить' },
    { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
      body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] },
  ],
}

describe('codeSync', () => {
  it('programToCode then codeToProgram round-trips', () => {
    const code = programToCode(prog)
    const res = codeToProgram(code)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.program).toEqual(prog)
  })

  it('codeToProgram returns an error result instead of throwing', () => {
    const res = codeToProgram('прыгнуть')
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.line).toBe(1)
      expect(res.message.length).toBeGreaterThan(0)
    }
  })
})
