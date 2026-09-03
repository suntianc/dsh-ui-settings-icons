import { createElement } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)

interface MockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  variant?: string
}

vi.mock('@deepseek-ai/dsh-client-store', () => ({
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
  ConnectionIndicator: ({
    state,
    disconnectedLabel,
    reconnectLabel,
    connectingLabel,
    recoveredLabel,
    restartActionLabel,
    onReconnect,
  }: {
    state?: 'disconnected' | 'connecting' | 'recovered'
    disconnectedLabel: string
    reconnectLabel: string
    connectingLabel: string
    recoveredLabel: string
    restartActionLabel: string
    onReconnect: () => void
  }) => {
    if (state === undefined) return null
    if (state === 'recovered') {
      return createElement('span', {
        'data-testid': 'connection-indicator',
        'data-state': state,
      }, recoveredLabel)
    }
    return createElement('button', {
      type: 'button',
      'data-testid': 'connection-indicator',
      'data-state': state,
      onClick: onReconnect,
    }, state === 'disconnected' ? disconnectedLabel : connectingLabel,
    state === 'disconnected' ? reconnectLabel : restartActionLabel)
  },
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
