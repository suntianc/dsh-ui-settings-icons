import { createElement, useEffect } from 'react'
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
      set: (next: any) => {
        state = next
        for (const fn of listeners) fn()
      },
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
  Tooltip: ({ children }: { children: ReactNode }) => children,
  useModalLayer: (_ref: unknown, _open: boolean, onClose: () => void) => {
    useEffect(() => {
      const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
      document.addEventListener('keydown', onKey)
      return () => { document.removeEventListener('keydown', onKey) }
    }, [onClose])
  },
  closeTopModal: vi.fn(),
  Button: ({ children, icon, variant: _variant, ...props }: MockButtonProps) =>
    createElement('button', props, icon, children),
  ConnectionIndicator: ({
    state,
    disconnectedLabel,
    connectingLabel,
    recoveredLabel,
    restartActionLabel,
    onReconnect,
  }: {
    state?: 'disconnected' | 'connecting' | 'recovered'
    disconnectedLabel: string
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
    state === 'disconnected' ? disconnectedLabel : restartActionLabel)
  },
  IconCloseOutlineRegular: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'close' }),
  IconSettingsOutlineMedium: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'settings' }),
  IconDataOutlineMedium: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'models' }),
  IconAgentPresetOutlineMedium: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'agent-presets' }),
  IconPersonalizationOutlineMedium: ({ className }: { className?: string; size?: number }) =>
    createElement('span', { 'aria-hidden': true, className, 'data-icon': 'plugins' }),
}))
