import type { ReactNode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SettingsRoot } from '../src/client/SettingsRoot.tsx'
import type { SettingsOnboardingStepRow, SettingsSectionRow } from '../src/client/SettingsRoot.tsx'

function CustomCustomIcon() {
  return <span data-testid="custom-third-party-icon">CustomIcon</span>
}

describe('SettingsRoot with icon enhancement', () => {
  function createProps(
    customIcons: Record<string, () => ReactNode> = {},
    connectionState: 'connected' | 'connecting' | 'disconnected' = 'connected',
  ) {
    const sections: SettingsSectionRow[] = [
      { id: 'general', order: 0, label: 'General' },
      { id: 'models', order: 10, label: 'Models' },
      { id: 'codex-auth', order: 20, label: 'GPT Auth' },
      { id: 'antigravity-auth', order: 30, label: 'Antigravity' },
      { id: 'custom-plugin', order: 40, label: 'My Custom Plugin' },
    ]
    const onboardingSteps: SettingsOnboardingStepRow[] = []

    const reconnect = vi.fn()
    const renderSlot = vi.fn((name: string, _owner: any, opts?: any) => {
      if (name === 'settings.trigger') {
        return <span>Settings Trigger</span>
      }
      if (name === 'settings.header') {
        return <span>Settings Title</span>
      }
      if (name === 'settings.close') {
        return <span>Close</span>
      }
      if (name === 'settings.section.icon') {
        const custom = customIcons[opts?.entryKey]
        if (custom) return custom()
        return opts?.fallback ?? null
      }
      if (name === 'settings.section') {
        return <div data-testid={`section-body-${opts?.only}`}>Body for {opts?.only}</div>
      }
      return null
    })

    return {
      props: {
        wide: true,
        reconnect,
        useConnectionState: (fn: (state: typeof connectionState) => any) => fn(connectionState),
        useSections: (fn: (s: SettingsSectionRow[]) => any) => fn(sections),
        useOnboardingSteps: (fn: (s: SettingsOnboardingStepRow[]) => any) => fn(onboardingSteps),
        useSessions: (fn: (state: any) => any) => fn({
          phase: 'ready',
          current: 'existing',
          byId: { existing: { blank: false } },
        }),
        renderSlot,
        t: (key: string) => ({
          'connection.error': 'Disconnected',
          'connection.retry': 'Reconnect now',
          'connection.connecting': 'Connecting',
          'connection.connected': 'Connected',
          'connection.reconnect': 'Disconnected, reconnect now',
          'connection.restart': 'Connecting, restart now',
        })[key] ?? key,
      },
      reconnect,
      renderSlot,
    }
  }

  it('renders trigger and opens dialog on click', () => {
    const { props } = createProps()
    render(<SettingsRoot {...props} />)

    const trigger = screen.getByRole('button', { name: /settings trigger/i })
    expect(trigger).toBeDefined()

    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('renders custom third-party icons from settings.section.icon when registered', () => {
    const { props } = createProps({
      'custom-plugin': () => <CustomCustomIcon />,
    })
    render(<SettingsRoot {...props} />)
    fireEvent.click(screen.getByRole('button', { name: /settings trigger/i }))

    expect(screen.getByTestId('custom-third-party-icon')).toBeDefined()
  })

  it('renders built-in fallback preset icons for codex-auth and antigravity-auth', () => {
    const { props } = createProps()
    const { container } = render(<SettingsRoot {...props} />)
    fireEvent.click(screen.getByRole('button', { name: /settings trigger/i }))

    const navButtons = screen.getAllByRole('button').filter(b => b.className.includes('navCell'))
    expect(navButtons).toHaveLength(5)

    // Verify sections have icons rendered (svg elements)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })

  it('allows switching sections and pressing Escape to close', () => {
    const { props } = createProps()
    render(<SettingsRoot {...props} />)
    fireEvent.click(screen.getByRole('button', { name: /settings trigger/i }))

    expect(screen.getByTestId('section-body-general')).toBeDefined()

    const codexButton = screen.getByText('GPT Auth')
    fireEvent.click(codexButton)
    expect(screen.getByTestId('section-body-codex-auth')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('restores focus to the settings trigger after the dialog closes', () => {
    const { props } = createProps()
    render(<SettingsRoot {...props} />)
    const trigger = screen.getByRole('button', { name: /settings trigger/i })

    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(document.activeElement).toBe(trigger)
  })

  it('renders the current connection indicator and reconnect action', () => {
    const { props, reconnect } = createProps({}, 'disconnected')
    render(<SettingsRoot {...props} />)

    fireEvent.click(screen.getByText(/Disconnected/))

    expect(reconnect).toHaveBeenCalledOnce()
  })

  it('shows and then clears recovery confirmation after reconnecting', () => {
    vi.useFakeTimers()
    try {
      const connecting = createProps({}, 'connecting').props
      const connected = createProps({}, 'connected').props
      const { rerender } = render(<SettingsRoot {...connecting} />)

      expect(screen.getByTestId('connection-indicator').dataset['state']).toBe('connecting')
      rerender(<SettingsRoot {...connected} />)
      expect(screen.getByTestId('connection-indicator').dataset['state']).toBe('recovered')

      act(() => { vi.advanceTimersByTime(2_000) })
      expect(screen.queryByTestId('connection-indicator')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('suppresses connection status in compact rail mode', () => {
    const { props } = createProps({}, 'disconnected')
    render(<SettingsRoot {...props} wide={false} />)

    expect(screen.queryByTestId('connection-indicator')).toBeNull()
  })
})
