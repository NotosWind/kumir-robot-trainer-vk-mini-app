// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultModal } from './ResultModal'
import type { CheckResult } from '../engine'
import type { PerField } from '../engine'

const field = (over: Partial<PerField>): PerField => ({ ok: false, status: 'ok', missing: 0, extra: 0, ...over })

const base = (over: Partial<CheckResult>): CheckResult => ({
  passedVisible: false,
  passedAll: false,
  stars: 0,
  perField: [field({})],
  efficiency: { commandCount: 0, usedLoop: false, withinLimit: false },
  ...over,
})

describe('ResultModal', () => {
  it('on full success shows three stars, praise, and Продолжить', () => {
    const onContinue = vi.fn()
    const result = base({
      passedVisible: true, passedAll: true, stars: 3,
      perField: [field({ ok: true })],
      efficiency: { commandCount: 3, usedLoop: true, withinLimit: true },
    })
    render(<ResultModal result={result} totalFields={1} onContinue={onContinue} onClose={() => {}} />)
    expect(screen.getByText(/⭐⭐⭐/)).toBeTruthy()
    fireEvent.click(screen.getByText('Продолжить'))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('praises without claiming a loop when none was used', () => {
    const result = base({
      passedVisible: true, passedAll: true, stars: 3,
      perField: [field({ ok: true })],
      efficiency: { commandCount: 1, usedLoop: false, withinLimit: true },
    })
    render(<ResultModal result={result} totalFields={1} onContinue={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/закрашены верно/i)).toBeTruthy()
    expect(screen.queryByText(/циклом/)).toBeNull()
  })

  it('on a crash explains the wall and offers Попробовать снова (stays on level)', () => {
    const onClose = vi.fn()
    const result = base({ perField: [field({ status: 'crash' })] })
    render(<ResultModal result={result} totalFields={1} onContinue={() => {}} onClose={onClose} />)
    expect(screen.getByText(/врезался в стену/)).toBeTruthy()
    expect(screen.queryByText('Продолжить')).toBeNull()
    fireEvent.click(screen.getByText('Попробовать снова'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('explains a loop that never stops', () => {
    const result = base({ perField: [field({ status: 'looplimit' })] })
    render(<ResultModal result={result} totalFields={1} onContinue={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/зациклился/)).toBeTruthy()
  })

  it('on missing cells nudges about the last cell of a loop', () => {
    const result = base({ perField: [field({ status: 'ok', missing: 1, extra: 0 })] })
    render(<ResultModal result={result} totalFields={1} onContinue={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/осталось пустыми: 1/)).toBeTruthy()
  })

  it('on extra cells says too many were painted', () => {
    const result = base({ perField: [field({ status: 'ok', missing: 0, extra: 2 })] })
    render(<ResultModal result={result} totalFields={1} onContinue={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/лишние клетки: 2/)).toBeTruthy()
  })

  it('when the visible field passes but not all, nudges toward generalising', () => {
    const result = base({
      passedVisible: true, passedAll: false, stars: 1,
      perField: [field({ ok: true }), field({ ok: false })],
    })
    render(<ResultModal result={result} totalFields={2} onContinue={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/нц пока/)).toBeTruthy()
    expect(screen.getByText('Продолжить')).toBeTruthy()
  })
})
