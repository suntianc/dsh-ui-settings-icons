import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Button, IconSettingsOutline14, IconSettingsOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SettingsDocumentState, SettingsDocumentStore } from './settings-document-store.ts'
import styles from './chrome.module.css'

export function TriggerContent({ wide, t }: { wide: boolean; t: (key: string) => string }): ReactElement {
  return (
    <>
      {wide ? <IconSettingsOutline16 size={16} /> : <IconSettingsOutline14 size={18} />}
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
