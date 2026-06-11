// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LevelPanel } from './LevelPanel'
import { sampleLevels } from '../levels/sampleLevels'

const corridor = sampleLevels.find((l) => l.id === 'corridor')!

describe('LevelPanel (code path)', () => {
  it('lets you type a solution in Code mode, run it, and see 3 stars', async () => {
    render(<LevelPanel level={corridor} />)
    fireEvent.click(screen.getByText('Код'))
    const area = screen.getByLabelText('Редактор кода КуМир') as HTMLTextAreaElement
    fireEvent.change(area, {
      target: { value: 'закрасить\nнц пока справа свободно\n  вправо\n  закрасить\nкц' },
    })
    fireEvent.click(screen.getByText('Запустить'))

    // Poll while the play timer drains and the result modal appears.
    await waitFor(
      () => expect(screen.getByRole('dialog', { name: 'Результат' })).toBeTruthy(),
      { timeout: 4000, interval: 50 },
    )
    expect(screen.getByText(/⭐⭐⭐/)).toBeTruthy()
  })
})

describe('LevelPanel meta integration', () => {
  it('shows a back button that calls onExit, and an intro banner', () => {
    const onExit = vi.fn()
    const lvl = { ...corridor, intro: 'Подсказка-вступление' }
    render(<LevelPanel level={lvl} onExit={onExit} onSolved={() => {}} />)
    expect(screen.getByText('Подсказка-вступление')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
