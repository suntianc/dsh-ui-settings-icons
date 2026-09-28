import type { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply, Config } from '../src/index.ts'

describe('dsh-ui-settings-icons Host apply', () => {
  it('hides the shell preference from automatic settings forms', () => {
    const configure = vi.fn(() => vi.fn())
    const effect = vi.fn((callback: () => unknown) => callback())
    const ctx = {
      fiber: {},
      inject(dependencies: string[], activate: (settingsCtx: unknown) => void) {
        expect(dependencies).toEqual(['settings'])
        activate({ settings: { configure }, effect })
      },
    }

    apply(ctx as unknown as Context)

    expect(Config).toBeDefined()
    expect(configure).toHaveBeenCalledWith({ auto: false }, ctx.fiber)
  })
})
