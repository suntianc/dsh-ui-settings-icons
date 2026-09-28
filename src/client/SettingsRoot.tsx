import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import type { ShortcutCatalogEntry } from '@deepseek-ai/dsh-client-shortcuts/client'
import type { ConnectionState } from '@deepseek-ai/dsh-client-connection/client'
import { ConnectionIndicator, IconCloseOutlineRegular, Tooltip, useModalLayer } from '@deepseek-ai/dsh-client-ui-primitives'
import { getDefaultNavIcon } from './icons/default-icons.tsx'
import type { SettingsKey } from './locales.ts'
import type { UpdateView } from './desktop-update.ts'
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
  useShellState?: <T>(selector: (state: { open: boolean; activeId: string | undefined }) => T) => T
  useShortcuts?: <T>(selector: (rows: readonly ShortcutCatalogEntry[]) => T) => T
  useDesktopUpdate?: <T>(selector: (state: UpdateView) => T) => T
  openDesktopUpdate?: () => void
  actions?: {
    open: () => void
    close: () => void
    select: (id: string) => void
    openSection: (id: string) => void
  }
}

interface SettingsPanelProps {
  rows: SettingsSectionRow[]
  renderSlot: any
  activeId: string | undefined
  onSelect: (id: string) => void
  onClose: () => void
}

const RECOVERY_CONFIRMATION_MS = 2_000
const CONNECTING_MIN_VISIBLE_MS = 800

function SettingsPanel({ rows, renderSlot, activeId, onSelect, onClose }: SettingsPanelProps): ReactElement {
  const active = rows.find((row) => row.id === activeId)?.id ?? rows[0]?.id
  const titleId = useId()

  const panel = useRef<HTMLDivElement>(null)
  useModalLayer(panel, true, onClose)

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <div className={styles.mask} aria-hidden="true" onClick={onClose} />
      <div
        ref={panel}
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
                data-modal-autofocus={row.id === active ? '' : undefined}
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
              type="button"
              className={styles.close}
              onClick={onClose}
            >
              <IconCloseOutlineRegular size={14} />
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
    </div>, document.body,
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
  const shared = props.useShellState?.((state) => state)
  const settingsOpen = shared?.open ?? open
  const selectedId = shared?.activeId ?? activeId
  const shortcut = props.useShortcuts?.((rows) => rows.find((row) => row.id === 'settings.open'))
  const desktopUpdate = props.useDesktopUpdate?.((state) => state)
  const [requestedOnboarding, setRequestedOnboarding] = useState<string | undefined>()
  const [completedOnboarding, setCompletedOnboarding] = useState<Set<string>>(() => new Set())
  const [showRecovery, setShowRecovery] = useState(false)
  const [holdConnecting, setHoldConnecting] = useState(false)
  const connectingShownAt = useRef<number | undefined>(undefined)
  const triggerButton = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(settingsOpen)

  const close = useCallback(() => {
    if (props.actions) props.actions.close()
    else { setOpen(false); setActiveId(undefined) }
  }, [props.actions])

  useEffect(() => {
    if (wasOpen.current && !settingsOpen) triggerButton.current?.focus()
    wasOpen.current = settingsOpen
  }, [settingsOpen])

  const openSection = useCallback((id: string) => {
    if (props.actions) props.actions.openSection(id)
    else { setActiveId(id); setOpen(true) }
  }, [props.actions])

  const rows = useSections((sections) => sections)
  const connectionState = useConnectionState((state) => state)
  const previousConnectionState = useRef(connectionState)
  const onboardingSteps = useOnboardingSteps((steps) => steps)
  const onboardingActive = useSessions((state: any) => {
    const main = Object.values(state.byId as Record<string, { blank?: boolean; retainedBy?: { mainView?: number } }>)
      .find((session) => (session.retainedBy?.mainView ?? 0) > 0)
    return state.phase === 'ready' && (main === undefined || main.blank === true)
  })
  const onboardingStep = requestedOnboarding !== undefined
    ? onboardingSteps.find((step) => step.id === requestedOnboarding)
    : onboardingActive ? onboardingSteps.find((step) => !completedOnboarding.has(step.id)) : undefined

  useEffect(() => {
    if (onboardingActive) return
    setCompletedOnboarding(new Set())
  }, [onboardingActive])

  const seenOnboarding = useRef(onboardingStep)
  useEffect(() => {
    const appeared = seenOnboarding.current === undefined && onboardingStep !== undefined
    seenOnboarding.current = onboardingStep
    if (appeared && settingsOpen) close()
  }, [onboardingStep, settingsOpen, close])

  useLayoutEffect(() => {
    const previous = previousConnectionState.current
    previousConnectionState.current = connectionState
    if (connectionState !== 'connected') {
      setShowRecovery(false)
      return
    }
    if (previous !== 'disconnected' && previous !== 'connecting') return
    setShowRecovery(true)
  }, [connectionState])

  useLayoutEffect(() => {
    if (!showRecovery || holdConnecting) return
    const timeout = window.setTimeout(() => { setShowRecovery(false) }, RECOVERY_CONFIRMATION_MS)
    return () => { window.clearTimeout(timeout) }
  }, [showRecovery, holdConnecting])

  useLayoutEffect(() => {
    if (connectionState === 'connecting') {
      connectingShownAt.current = Date.now()
      return
    }
    const shownAt = connectingShownAt.current
    if (shownAt === undefined) return
    connectingShownAt.current = undefined
    const remaining = CONNECTING_MIN_VISIBLE_MS - (Date.now() - shownAt)
    if (remaining <= 0) return
    setHoldConnecting(true)
    const timeout = window.setTimeout(() => { setHoldConnecting(false) }, remaining)
    return () => { window.clearTimeout(timeout); setHoldConnecting(false) }
  }, [connectionState])

  const completeOnboardingStep = useCallback((id: string) => {
    setRequestedOnboarding(undefined)
    setCompletedOnboarding((previous) => {
      if (previous.has(id)) return previous
      return new Set([...previous, id])
    })
  }, [])

  let connectionIndicator: 'disconnected' | 'connecting' | 'recovered' | undefined
  if (connectionState === 'connecting' || holdConnecting) connectionIndicator = 'connecting'
  else if (connectionState === 'disconnected') connectionIndicator = 'disconnected'
  else if (showRecovery) connectionIndicator = 'recovered'
  const updatePhase = desktopUpdate?.presentation?.phase
  const updateVisible = desktopUpdate !== undefined && (desktopUpdate.failed || (updatePhase !== undefined && updatePhase !== 'idle'))
  const updateBusy = desktopUpdate?.opening || ['checking', 'downloading', 'verifying', 'installing'].includes(updatePhase ?? '')
  const updateLabel = desktopUpdate?.failed || updatePhase === 'error'
    ? t('desktop.update.retry')
      : updatePhase === 'downloading'
      ? `${t('desktop.update.downloading')} ${desktopUpdate?.presentation?.percent ?? 0}%`
      : updatePhase === 'checking' ? t('desktop.update.checking')
        : updatePhase === 'verifying' ? t('desktop.update.verifying')
          : updatePhase === 'available' ? t('desktop.update.available')
        : updatePhase === 'ready' ? t('desktop.update.ready')
          : t('desktop.update.installing')

  return (
    <>
      <div className={clsx(styles.triggerRow, !wide && styles.railRow)}>
        {renderSlot('settings.launcher', {
          wide,
          settingsOpen,
          openSettings: () => { props.actions?.open(); if (!props.actions) setOpen(true) },
          ...(shortcut?.keys.length ? { settingsShortcut: { keys: shortcut.keys, aria: shortcut.aria } } : {}),
          openOnboarding: (id: string) => { close(); setRequestedOnboarding(id) },
        }, { fallback: <Tooltip disabled={settingsOpen} label={t('trigger')} shortcutKeys={shortcut?.keys}><button
          ref={triggerButton}
          type="button"
          className={clsx(styles.trigger, !wide && styles.rail)}
          aria-label={t('trigger')}
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          aria-keyshortcuts={shortcut?.aria}
          onClick={() => { props.actions?.open(); if (!props.actions) setOpen(true) }}
        >
          {renderSlot('settings.trigger', { wide })}
        </button></Tooltip> })}
        <ConnectionIndicator
          state={wide && updatePhase !== 'installing' ? connectionIndicator : undefined}
          disconnectedLabel={t('connection.error')}
          connectingLabel={t('connection.connecting')}
          recoveredLabel={t('connection.connected')}
          reconnectActionLabel={t('connection.reconnect')}
          restartActionLabel={t('connection.restart')}
          onReconnect={reconnect}
        />
        {wide && updateVisible && (connectionIndicator === undefined || updatePhase === 'installing') &&
          <Tooltip label={desktopUpdate.presentation?.version ?? updateLabel}>
            <button type="button" className={styles.updateButton} aria-label={updateLabel}
              aria-disabled={updateBusy} onClick={() => { if (!updateBusy) props.openDesktopUpdate?.() }}>
              {updateLabel}
            </button>
          </Tooltip>}
      </div>
      {settingsOpen && (
        <SettingsPanel
          rows={rows}
          renderSlot={renderSlot}
          activeId={selectedId}
          onSelect={(id) => { props.actions?.select(id); if (!props.actions) setActiveId(id) }}
          onClose={close}
        />
      )}
      {onboardingStep !== undefined && renderSlot('settings.onboarding', {
        stepId: onboardingStep.id,
        explicit: requestedOnboarding !== undefined,
        complete: () => { completeOnboardingStep(onboardingStep.id) },
        openSection,
      }, { only: onboardingStep.id })}
    </>
  )
}
