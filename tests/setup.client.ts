import { createElement } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)

interface MockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  variant?: string
}

vi.mock('@deepseek-ai/dsh-client-runtime/client', () => ({
  createSnapshotStore: (initialState: any) => {
    let state = { ...initialState }
    const listeners = new Set<() => void>()
    return {
      getSnapshot: () => state,
      update: (updater: (draft: any) => void) => {
        updater(state)
        for (const fn of listeners) fn()
      },
      subscribe: (fn: () => void) => {
        listeners.add(fn)
        return () => { listeners.delete(fn) }
      },
    }
  },
}))

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Button: ({ children, icon, variant: _variant, ...props }: MockButtonProps) =>
    createElement('button', props, icon, children),
  IconCloseOutline16: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'close' }),
  IconSettingsOutline16: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'settings' }),
  IconSettingsOutline14: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'settings14' }),
  IconDataOutline16: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'models' }),
  IconAgentPresetOutline16: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'agent-presets' }),
  IconPersonalizationOutline16: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'plugins' }),
}))
