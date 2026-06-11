import { describe, it, expect } from 'vitest'
import { COMMANDS, DIRECTIONS, isCommand, countCommands, usesLoop } from './ast'
import type { Program } from './ast'

describe('ast helpers', () => {
  it('exposes the five commands and four directions', () => {
    expect(COMMANDS).toEqual(['вверх', 'вниз', 'влево', 'вправо', 'закрасить'])
    expect(DIRECTIONS).toEqual(['вверх', 'вниз', 'влево', 'вправо'])
  })

  it('isCommand recognises valid command words', () => {
    expect(isCommand('закрасить')).toBe(true)
    expect(isCommand('нц')).toBe(false)
  })

  it('countCommands counts command statements statically (loop body counted once)', () => {
    const p: Program = {
      body: [
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          body: [{ kind: 'cmd', cmd: 'вправо' }, { kind: 'cmd', cmd: 'закрасить' }] },
        { kind: 'cmd', cmd: 'закрасить' },
      ],
    }
    expect(countCommands(p)).toBe(3)
    expect(usesLoop(p)).toBe(true)
  })

  it('usesLoop is false for a flat program', () => {
    const p: Program = { body: [{ kind: 'cmd', cmd: 'вправо' }] }
    expect(usesLoop(p)).toBe(false)
  })
})
