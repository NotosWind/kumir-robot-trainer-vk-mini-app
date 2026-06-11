// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProviders } from './providers'

describe('AppProviders', () => {
  it('renders children inside the VKUI tree', () => {
    render(
      <AppProviders>
        <div>привет</div>
      </AppProviders>,
    )
    expect(screen.getByText('привет')).toBeDefined()
  })
})
