import vkBridge from '@vkontakte/vk-bridge'

export interface BridgeLike {
  send: (method: string, params?: Record<string, unknown>) => Promise<unknown>
}

/**
 * Normalize the vk-bridge default import.
 *
 * `@vkontakte/vk-bridge` exports `bridge as default` with no `send` named export.
 * Vite's dev pre-bundler can resolve the default import to the module *namespace*
 * (whose `.send` is undefined, but `.default.send` is the real function), which made
 * `main.tsx` throw "bridge.send is not a function" in the browser. Production builds
 * resolve it correctly. This helper handles both shapes, and falls back to a no-op
 * so the app never crashes when running outside VK.
 */
export function resolveBridge(mod: unknown): BridgeLike {
  const m = mod as { send?: unknown; default?: { send?: unknown } }
  if (typeof m?.send === 'function') return m as BridgeLike
  if (typeof m?.default?.send === 'function') return m.default as BridgeLike
  return { send: async () => undefined }
}

export const bridge = resolveBridge(vkBridge)
