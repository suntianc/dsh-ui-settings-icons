import type { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply } from '../src/index.ts'

describe('dsh-ui-settings-icons Host apply', () => {
  it('registers the onboarding namespace through the current settings contract', () => {
    const register = vi.fn()
    const ctx = {
      inject(dependencies: string[], activate: (settingsCtx: unknown) => void) {
        expect(dependencies).toEqual(['settings'])
        activate({ settings: { register } })
      },
    }

    apply(ctx as unknown as Context)

    expect(register).toHaveBeenCalledOnce()
    expect(register.mock.calls[0]?.[0]).toBe('ui-onboarding')
  })
})
