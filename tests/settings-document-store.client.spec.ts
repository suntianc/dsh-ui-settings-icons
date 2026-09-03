import { describe, expect, it, vi } from 'vitest'
import { SettingsDocumentStore } from '../src/client/settings-document-store.ts'

function describeFace(hasDocument = true) {
  return {
    getSnapshot: () => ({ view: { hasDocument }, error: null }),
    subscribe: () => () => {},
    ensure: vi.fn(async () => {}),
  }
}

describe('SettingsDocumentStore current DSH remote contract', () => {
  it('opens the settings document through remote.settings', async () => {
    const openSettingsDocument = vi.fn(async () => ({ ok: true as const }))
    const controller = new SettingsDocumentStore({
      remote: { settings: { openSettingsDocument } },
    } as never, describeFace() as never)

    await controller.load()
    expect(controller.store.getSnapshot().status).toBe('ready')

    await controller.open()
    expect(openSettingsDocument).toHaveBeenCalledOnce()
    expect(controller.store.getSnapshot()).toMatchObject({
      opening: false,
      error: null,
    })
  })

  it('preserves the current remote error message', async () => {
    const openSettingsDocument = vi.fn(async () => ({
      ok: false as const,
      error: { message: 'native open denied' },
    }))
    const controller = new SettingsDocumentStore({
      remote: { settings: { openSettingsDocument } },
    } as never, describeFace() as never)

    await controller.load()
    await controller.open()

    expect(controller.store.getSnapshot()).toMatchObject({
      opening: false,
      error: 'native open denied',
    })
  })
})
