// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RunControls } from './RunControls'

describe('RunControls', () => {
  it('fires onRun, onStep, onReset', () => {
    const onRun = vi.fn(); const onStep = vi.fn(); const onReset = vi.fn()
    render(<RunControls playing={false} onRun={onRun} onStep={onStep} onReset={onReset} />)
    fireEvent.click(screen.getByText('Запустить'))
    fireEvent.click(screen.getByText('Шаг'))
    fireEvent.click(screen.getByText('Сброс'))
    expect(onRun).toHaveBeenCalledOnce()
    expect(onStep).toHaveBeenCalledOnce()
    expect(onReset).toHaveBeenCalledOnce()
  })
})
