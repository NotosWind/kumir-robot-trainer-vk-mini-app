// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CampaignMap } from './CampaignMap'
import type { Level } from '../levels/types'
import type { ProgressMap } from '../state/progress'

const levels: Level[] = [
  { id: 'a', title: 'A', goal: '', fields: [] },
  { id: 'b', title: 'B', goal: '', fields: [] },
  { id: 'c', title: 'C', goal: '', fields: [] },
]

describe('CampaignMap', () => {
  it('shows the total star count and renders a node per level', () => {
    const progress: ProgressMap = { a: { stars: 2, solved: true } }
    render(<CampaignMap levels={levels} progress={progress} onSelect={() => {}} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText(/⭐ 2/)).toBeTruthy() // total stars in the header
  })

  it('locks levels whose predecessor is not solved and ignores clicks on them', () => {
    const onSelect = vi.fn()
    const progress: ProgressMap = {} // nothing solved
    render(<CampaignMap levels={levels} progress={progress} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('A')) // unlocked (index 0)
    fireEvent.click(screen.getByText('C')) // locked
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('a')
  })
})
