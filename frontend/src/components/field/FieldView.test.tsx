// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FieldView } from './FieldView'
import type { FieldSpec } from '../../engine'

const field: FieldSpec = {
  cols: 3, rows: 2, robot: { x: 0, y: 0 }, walls: ['V:1:0'],
  target: [{ x: 2, y: 1 }],
}

describe('FieldView', () => {
  it('renders a cell rect per grid cell plus the robot', () => {
    const { container } = render(
      <FieldView field={field} robot={{ x: 1, y: 0 }} painted={new Set(['0:0'])} />,
    )
    // 3*2 = 6 cell rects (class "cell")
    expect(container.querySelectorAll('rect.cell').length).toBe(6)
    // robot marker present
    expect(container.querySelector('[data-testid="robot"]')).not.toBeNull()
    // one wall segment
    expect(container.querySelectorAll('line.wall').length).toBe(1)
  })

  it('marks painted and target cells with classes', () => {
    const { container } = render(
      <FieldView field={field} robot={field.robot} painted={new Set(['0:0'])} />,
    )
    expect(container.querySelectorAll('rect.painted').length).toBe(1)
    expect(container.querySelectorAll('rect.target').length).toBe(1)
  })
})
