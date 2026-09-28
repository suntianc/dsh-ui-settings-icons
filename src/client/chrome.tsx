import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Button, IconSettingsOutlineMedium, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { UpdateView } from './desktop-update.ts'
import type { SettingsDocumentState, SettingsDocumentStore } from './settings-document-store.ts'
import styles from './chrome.module.css'

export function TriggerContent({ wide, t }: { wide: boolean; t: (key: string) => string }): ReactElement {
  return (
    <>
      <IconSettingsOutlineMedium size={wide ? 16 : 18} />
      {wide && <span className={styles.triggerLabel}>{t('trigger')}</span>}
    </>
  )
}

export function HeaderContent({ t }: { t: (key: string) => string }): ReactElement {
  return <>{t('title')}</>
}

export function CloseLabel({ t }: { t: (key: string) => string }): ReactElement {
  return <>{t('close')}</>
}

export function GeneralSection({ renderSlot }: { renderSlot: (key: string, owner: any) => ReactElement }): ReactElement {
  return (
    <div className={styles.section}>
      {renderSlot('settings.general.item', {})}
    </div>
  )
}

export function CurrentVersionRow({ t }: { t: (key: string) => string }): ReactElement | null {
  const version = process.env.DSH_CLIENT_VERSION
  return version === undefined ? null : <div className={styles.generalRow}>{t('general.currentVersion')}: {version}</div>
}

export function DeveloperToolsRow({ useDeveloperTools, setEnabled, t }: {
  useDeveloperTools: <T>(selector: (value: boolean) => T) => T
  setEnabled: (value: boolean) => Promise<void>
  t: (key: string) => string
}): ReactElement {
  const enabled = useDeveloperTools((value) => value)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  return <div className={styles.generalRow}>
    <div><strong>{t('developerTools.title')}</strong><p>{t('developerTools.description')}</p>
      {failed && <span role="alert">{t('developerTools.error')}</span>}</div>
    <Switch checked={enabled} disabled={busy} label={t('developerTools.title')} onChange={(next) => {
      setFailed(false)
      setBusy(true)
      void setEnabled(next).catch(() => { setFailed(true) }).finally(() => { setBusy(false) })
    }} />
  </div>
}

export function DesktopUpdateBadge({ useDesktopUpdate, useConnectionState, t }: {
  useDesktopUpdate: <T>(selector: (value: UpdateView) => T) => T
  useConnectionState: <T>(selector: (value: string | undefined) => T) => T
  t: (key: string) => string
}): ReactElement | null {
  const update = useDesktopUpdate((value) => value)
  const connection = useConnectionState((value) => value)
  const phase = update.presentation?.phase
  if ((connection === 'connecting' || connection === 'disconnected') && phase !== 'installing') return null
  if (!update.failed && (phase === undefined || phase === 'idle')) return null
  return <span role="img" aria-label={t(update.failed || phase === 'error' ? 'desktop.update.retry' : 'desktop.update.available')}
    className={styles.updateBadge} />
}

export interface SettingsDocumentActionProps {
  controller: SettingsDocumentStore
  useSnapshot: <T>(selector: (state: SettingsDocumentState) => T) => T
  t: (key: string) => string
}

export function SettingsDocumentAction({ controller, useSnapshot, t }: SettingsDocumentActionProps): ReactElement | null {
  const state = useSnapshot((snapshot) => snapshot)

  useEffect(() => {
    controller.load()
  }, [controller])

  if (state.status !== 'ready') return null

  return (
    <div className={styles.action}>
      {state.error !== null && (
        <span className={styles.error} role="alert">
          {t('openDocument.error')}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={state.opening}
        onClick={() => {
          controller.open()
        }}
      >
        {t('openDocument')}
      </Button>
    </div>
  )
}
