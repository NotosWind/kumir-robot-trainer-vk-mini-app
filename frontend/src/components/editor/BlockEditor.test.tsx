// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BlockEditor } from './BlockEditor'
import type { Program } from '../../engine'

describe('BlockEditor', () => {
  it('adds a command block to an empty program via the palette', () => {
    const onChange = vi.fn()
    render(<BlockEditor program={{ body: [] }} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+ вправо' }))
    expect(onChange).toHaveBeenCalledWith({ body: [{ kind: 'cmd', cmd: 'вправо' }] })
  })

  it('lets you change the repeat count N', () => {
    const onChange = vi.fn()
    const program: Program = {
      body: [{ kind: 'repeat', count: 3, body: [{ kind: 'cmd', cmd: 'вправо' }] }],
    }
    render(<BlockEditor program={program} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Сколько раз повторить'), { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith({
      body: [{ kind: 'repeat', count: 5, body: [{ kind: 'cmd', cmd: 'вправо' }] }],
    })
  })

  it('renders existing statements as blocks', () => {
    const program: Program = {
      body: [
        { kind: 'whileLoop', cond: { kind: 'pred', pred: { kind: 'free', dir: 'вправо' } },
          body: [{ kind: 'cmd', cmd: 'закрасить' }] },
      ],
    }
    render(<BlockEditor program={program} onChange={() => {}} />)
    expect(screen.getByText('нц пока')).toBeTruthy()
    expect(screen.getByText('закрасить')).toBeTruthy()
    expect(screen.getByText('кц')).toBeTruthy()
  })
})
