import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import clsx from 'clsx'
import type { ConnectionState } from '@deepseek-ai/dsh-client-connection/client'
import { ConnectionIndicator, IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { getDefaultNavIcon } from './icons/default-icons.tsx'
import type { SettingsKey } from './locales.ts'
import styles from './SettingsRoot.module.css'

export interface SettingsSectionRow {
  id: string
  order: number
  label: string
}

export interface SettingsOnboardingStepRow {
  id: string
  order: number
}

export interface EnhancedSettingsRootProps {
  wide: boolean
  reconnect: () => void
  useConnectionState: <T>(selector: (state: ConnectionState | undefined) => T) => T
  useSections: <T>(selector: (rows: SettingsSectionRow[]) => T) => T
  useOnboardingSteps: <T>(selector: (steps: SettingsOnboardingStepRow[]) => T) => T
  useSessions: <T>(selector: (state: any) => T) => T
  renderSlot: any
  t: (key: SettingsKey) => string
}

interface SettingsPanelProps {
  rows: SettingsSectionRow[]
  renderSlot: any
  activeId: string | undefined
  onSelect: (id: string) => void
  onClose: () => void
}

const RECOVERY_CONFIRMATION_MS = 2_000

function SettingsPanel({ rows, renderSlot, activeId, onSelect, onClose }: SettingsPanelProps): ReactElement {
  const active = rows.find((row) => row.id === activeId)?.id ?? rows[0]?.id
  const titleId = useId()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeButton.current?.focus()
  }, [])

  return (
    <div className={styles.overlay} role="presentation">
      <div className={styles.mask} aria-hidden="true" onClick={onClose} />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <nav className={styles.nav}>
          <div className={styles.navTitle} id={titleId}>
            {renderSlot('settings.header', {})}
          </div>
          <div className={styles.navList}>
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                className={clsx(styles.navCell, row.id === active && styles.active)}
                aria-current={row.id === active ? 'true' : undefined}
                onClick={() => { onSelect(row.id) }}
              >
                <span className={styles.navIcon}>
                  {renderSlot('settings.section.icon', {}, {
                    entryKey: row.id,
                    fallback: getDefaultNavIcon(row.id),
                  })}
                </span>
                <span className={styles.navLabel}>{row.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.actions}>
              {renderSlot('settings.action', {})}
            </div>
            <button
              ref={closeButton}
              type="button"
              className={styles.close}
              onClick={onClose}
            >
              <IconCloseOutline16 size={14} />
              <span className={styles.hiddenLabel}>
                {renderSlot('settings.close', {})}
              </span>
            </button>
          </div>
          <div className={styles.options}>
            {active !== undefined && renderSlot('settings.section', { close: onClose }, { only: active })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsRoot(props: EnhancedSettingsRootProps): ReactElement {
  const {
    wide,
    reconnect,
    useConnectionState,
    useSections,
    useOnboardingSteps,
    useSessions,
    renderSlot,
    t,
  } = props
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [completedOnboarding, setCompletedOnboarding] = useState<Set<string>>(() => new Set())
  const [showRecovery, setShowRecovery] = useState(false)
  const triggerButton = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)

  const close = useCallback(() => {
    setOpen(false)
    setActiveId(undefined)
  }, [])

  useEffect(() => {
    if (wasOpen.current && !open) triggerButton.current?.focus()
    wasOpen.current = open
  }, [open])

  const openSection = useCallback((id: string) => {
    setActiveId(id)
    setOpen(true)
  }, [])

  const rows = useSections((sections) => sections)
  const connectionState = useConnectionState((state) => state)
  const previousConnectionState = useRef(connectionState)
  const onboardingSteps = useOnboardingSteps((steps) => steps)
  const onboardingActive = useSessions((state: any) => (
    state.phase === 'ready'
      && (state.current === undefined || state.byId[state.current]?.blank === true)
  ))
  const onboardingStep = onboardingActive
    ? onboardingSteps.find((step) => !completedOnboarding.has(step.id))
    : undefined

  useEffect(() => {
    if (onboardingActive) return
    setCompletedOnboarding(new Set())
  }, [onboardingActive])

  useLayoutEffect(() => {
    const previous = previousConnectionState.current
    previousConnectionState.current = connectionState
    if (connectionState !== 'connected') {
      setShowRecovery(false)
      return
    }
    if (previous !== 'disconnected' && previous !== 'connecting') return
    setShowRecovery(true)
    const timeout = window.setTimeout(() => {
      setShowRecovery(false)
    }, RECOVERY_CONFIRMATION_MS)
    return () => {
      window.clearTimeout(timeout)
    }
  }, [connectionState])

  const completeOnboardingStep = useCallback((id: string) => {
    setCompletedOnboarding((previous) => {
      if (previous.has(id)) return previous
      return new Set([...previous, id])
    })
  }, [])

  let connectionIndicator: 'disconnected' | 'connecting' | 'recovered' | undefined
  if (connectionState === 'disconnected') connectionIndicator = 'disconnected'
  else if (connectionState === 'connecting') connectionIndicator = 'connecting'
  else if (showRecovery) connectionIndicator = 'recovered'

  return (
    <>
      <div className={clsx(styles.triggerRow, !wide && styles.railRow)}>
        <button
          ref={triggerButton}
          type="button"
          className={clsx(styles.trigger, !wide && styles.rail)}
          aria-label={t('trigger')}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => { setOpen(true) }}
        >
          {renderSlot('settings.trigger', { wide })}
        </button>
        <ConnectionIndicator
          state={wide ? connectionIndicator : undefined}
          disconnectedLabel={t('connection.error')}
          reconnectLabel={t('connection.retry')}
          connectingLabel={t('connection.connecting')}
          recoveredLabel={t('connection.connected')}
          reconnectActionLabel={t('connection.reconnect')}
          restartActionLabel={t('connection.restart')}
          onReconnect={reconnect}
        />
      </div>
      {open && (
        <SettingsPanel
          rows={rows}
          renderSlot={renderSlot}
          activeId={activeId}
          onSelect={setActiveId}
          onClose={close}
        />
      )}
      {onboardingStep !== undefined && renderSlot('settings.onboarding', {
        stepId: onboardingStep.id,
        complete: () => { completeOnboardingStep(onboardingStep.id) },
        openSection,
      }, { only: onboardingStep.id })}
    </>
  )
}
