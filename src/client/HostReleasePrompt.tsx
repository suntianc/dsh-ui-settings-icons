/** Preserve the stock shell's explicit reload decision when the Host changes releases. */
import type { ReactElement } from 'react'
import clsx from 'clsx'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientReleaseChange, WebBootRelease } from '@deepseek-ai/dsh-client-modules/client'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SettingsKey } from './locales.ts'
import styles from './HostReleasePrompt.module.css'

export interface HostReleasePromptInjected {
  dismissRelease: () => void
  reloadPage: () => void
  hooks: { releaseChange: ObservableSnapshot<ClientReleaseChange | undefined> }
}

export interface HostReleasePromptProps {
  dismissRelease: () => void
  reloadPage: () => void
  useReleaseChange: <T>(selector: (change: ClientReleaseChange | undefined) => T) => T
  t: (key: SettingsKey) => string
}

function transitionText(from: WebBootRelease | undefined, to: WebBootRelease | undefined, unknown: string): [string, string] {
  const field = from?.version !== to?.version ? 'version' : 'commit'
  return [from?.[field] ?? unknown, to?.[field] ?? unknown]
}

function Transition({ label, from, to, done }: { label: string; from: string; to: string; done: boolean }): ReactElement {
  return <>
    <span className={styles.label}>{label}</span>
    <span className={clsx(styles.release, done ? styles.faded : styles.solid)}>{from}</span>
    <span aria-hidden="true" className={clsx(styles.line, done ? styles.done : styles.pending)} />
    <span className={clsx(styles.release, done ? styles.solid : styles.faded)}>{to}</span>
  </>
}

/** Closing keeps the current page; only the reload button invokes the page-reload callback. */
export function HostReleasePrompt({ useReleaseChange, dismissRelease, reloadPage, t }: HostReleasePromptProps): ReactElement | null {
  const change = useReleaseChange(value => value)
  if (change === undefined) return null
  const unknown = t('hostRelease.unknown')
  const [serviceFrom, serviceTo] = transitionText(change.previous, change.host, unknown)
  const [pageFrom, pageTo] = transitionText(change.page, change.host, unknown)
  return <Modal
    open
    title={t('hostRelease.title')}
    description={t('hostRelease.description')}
    closeLabel={t('hostRelease.later')}
    onClose={dismissRelease}
    className={clsx(styles.dialog)}
    footer={<>
      {/* An arriving Enter key must not accept a reload without a deliberate choice. */}
      <Button variant="outline" data-modal-autofocus onClick={dismissRelease}>{t('hostRelease.later')}</Button>
      <Button variant="primary" onClick={reloadPage}>{t('hostRelease.reload')}</Button>
    </>}
  >
    <div className={styles.transitions}>
      <Transition label={t('hostRelease.service')} from={serviceFrom} to={serviceTo} done />
      <Transition label={t('hostRelease.page')} from={pageFrom} to={pageTo} done={false} />
    </div>
  </Modal>
}
