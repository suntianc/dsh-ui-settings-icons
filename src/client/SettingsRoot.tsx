import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import clsx from 'clsx'
import { IconCloseOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { getDefaultNavIcon } from './icons/default-icons.tsx'
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
  useSections: <T>(selector: (rows: SettingsSectionRow[]) => T) => T
  useOnboardingSteps: <T>(selector: (steps: SettingsOnboardingStepRow[]) => T) => T
  useSessions?: <T>(selector: (state: any) => T) => T
  renderSlot: any
}

interface SettingsPanelProps {
  rows: SettingsSectionRow[]
  renderSlot: any
  activeId: string | undefined
  onSelect: (id: string) => void
  onClose: () => void
}

function SettingsPanel({ rows, renderSlot, activeId, onSelect, onClose }: SettingsPanelProps): ReactElement {
  const active = rows.find((r) => r.id === activeId)?.id ?? rows[0]?.id
  const titleId = useId()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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
  const { wide, useSections, useOnboardingSteps, useSessions, renderSlot } = props
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [completedOnboarding, setCompletedOnboarding] = useState<Set<string>>(() => new Set())

  const close = useCallback(() => {
    setOpen(false)
    setActiveId(undefined)
  }, [])

  const openSection = useCallback((id: string) => {
    setActiveId(id)
    setOpen(true)
  }, [])

  const rows = useSections((s) => s)
  const onboardingSteps = useOnboardingSteps((s) => s)
  const onboardingActive = useSessions?.((state: any) => (
    state?.phase === 'ready' && (state?.current === undefined || state?.byId?.[state?.current]?.blank === true)
  )) ?? false
  const onboardingStep = onboardingActive ? onboardingSteps.find((step) => !completedOnboarding.has(step.id)) : undefined

  useEffect(() => {
    if (onboardingActive) return
    setCompletedOnboarding(new Set())
  }, [onboardingActive])

  const completeOnboardingStep = useCallback((id: string) => {
    setCompletedOnboarding((previous) => {
      if (previous.has(id)) return previous
      return new Set([...previous, id])
    })
  }, [])

  return (
    <>
      <button
        type="button"
        className={clsx(styles.trigger, !wide && styles.rail)}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen(true) }}
      >
        {renderSlot('settings.trigger', { wide })}
      </button>
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
