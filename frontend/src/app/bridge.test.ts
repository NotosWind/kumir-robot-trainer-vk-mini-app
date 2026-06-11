import { describe, it, expect } from 'vitest'
import { resolveBridge } from './bridge'

describe('resolveBridge', () => {
  it('uses a module that already has send', () => {
    const m = { send: async () => 'ok' }
    expect(resolveBridge(m).send).toBe(m.send)
  })

  it('unwraps a namespace whose default has send (Vite dev shape)', () => {
    const inner = { send: async () => 'ok' }
    expect(resolveBridge({ default: inner }).send).toBe(inner.send)
  })

  it('falls back to a no-op when neither shape has send', async () => {
    const b = resolveBridge({})
    expect(typeof b.send).toBe('function')
    await expect(b.send('VKWebAppInit')).resolves.toBeUndefined()
  })
})
