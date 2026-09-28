import { afterEach, describe, expect, it, vi } from 'vitest'
import { DesktopUpdateSource } from '../src/client/desktop-update.ts'
import type { UpdatePresentation } from '../src/client/desktop-update.ts'

afterEach(() => { vi.unstubAllGlobals() })

describe('desktop update status', () => {
  it('shares one preload subscription and joins repeated update actions', async () => {
    let publish: ((state: UpdatePresentation) => void) | undefined
    let finishOpen: (() => void) | undefined
    const unsubscribe = vi.fn()
    const open = vi.fn(() => new Promise<void>((resolve) => { finishOpen = resolve }))
    const subscribe = vi.fn((listener: (state: UpdatePresentation) => void) => {
      publish = listener
      return unsubscribe
    })
    vi.stubGlobal('dshDesktop', {
      protocolVersion: 1,
      updates: { status: async () => ({ phase: 'available' }), open, subscribe },
    })

    const source = new DesktopUpdateSource()
    await vi.waitFor(() => { expect(source.store.getSnapshot().presentation?.phase).toBe('available') })
    expect(subscribe).toHaveBeenCalledOnce()

    source.open()
    source.open()
    expect(open).toHaveBeenCalledOnce()
    expect(source.store.getSnapshot().opening).toBe(true)
    finishOpen?.()
    await vi.waitFor(() => { expect(source.store.getSnapshot().opening).toBe(false) })

    publish?.({ phase: 'installing' })
    source.open()
    expect(open).toHaveBeenCalledOnce()
    source.dispose()
    publish?.({ phase: 'ready' })
    expect(source.store.getSnapshot().presentation?.phase).toBe('installing')
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
