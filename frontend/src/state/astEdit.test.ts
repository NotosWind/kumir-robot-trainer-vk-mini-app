import { describe, it, expect } from 'vitest'
import { appendStmt, removeAt, setCondition, setCount } from './astEdit'
import type { Program } from '../engine'

describe('astEdit', () => {
  it('appends a statement to the top-level body', () => {
    const p: Program = { body: [] }
    const next = appendStmt(p, [], { kind: 'cmd', cmd: 'вправо' })
    expect(next.body).toEqual([{ kind: 'cmd', cmd: 'вправо' }])
    expect(p.body).toEqual([]) // original unchanged (immutability)
  })

  it('appends into a loop body via a path', () => {
    const p: Program = {
      body: [{ kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } }, body: [] }],
    }
    const next = appendStmt(p, [0], { kind: 'cmd', cmd: 'закрасить' })
    const loop = next.body[0]
    expect(loop.kind).toBe('whileLoop')
    if (loop.kind === 'whileLoop') expect(loop.body).toEqual([{ kind: 'cmd', cmd: 'закрасить' }])
  })

  it('removes a statement at a path', () => {
    const p: Program = { body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] }
    const next = removeAt(p, [0])
    expect(next.body).toEqual([{ kind: 'cmd', cmd: 'закрасить' }])
  })

  it('sets the condition of a loop/if node', () => {
    const p: Program = {
      body: [{ kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } }, body: [] }],
    }
    const next = setCondition(p, [0], { kind: 'pred', pred: { kind: 'wall', dir: 'вниз' } })
    const loop = next.body[0]
    if (loop.kind === 'whileLoop') expect(loop.cond).toEqual({ kind: 'pred', pred: { kind: 'wall', dir: 'вниз' } })
  })

  it('sets the count of a repeat node', () => {
    const p: Program = { body: [{ kind: 'repeat', count: 3, body: [{ kind: 'cmd', cmd: 'вправо' }] }] }
    const next = setCount(p, [0], 7)
    const node = next.body[0]
    expect(node.kind).toBe('repeat')
    if (node.kind === 'repeat') {
      expect(node.count).toBe(7)
      expect(node.body).toEqual([{ kind: 'cmd', cmd: 'вправо' }]) // body preserved
    }
    expect(p.body[0]).toEqual({ kind: 'repeat', count: 3, body: [{ kind: 'cmd', cmd: 'вправо' }] }) // original unchanged
  })
})
