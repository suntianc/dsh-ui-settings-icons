import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { ShortcutCommandId } from '@deepseek-ai/dsh-client-shortcuts/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { closeTopModal } from '@deepseek-ai/dsh-client-ui-primitives'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { SettingsRoot } from './SettingsRoot.tsx'
import type { SettingsOnboardingStepRow, SettingsSectionRow } from './SettingsRoot.tsx'
import { CloseLabel, CurrentVersionRow, DesktopUpdateBadge, DeveloperToolsRow, GeneralSection, HeaderContent, SettingsDocumentAction, TriggerContent } from './chrome.tsx'
import { DesktopUpdateSource } from './desktop-update.ts'
import { SettingsDocumentStore } from './settings-document-store.ts'
import { en, zh, type SettingsKey } from './locales.ts'

export { SettingsRoot } from './SettingsRoot.tsx'
export type { EnhancedSettingsRootProps, SettingsSectionRow, SettingsOnboardingStepRow } from './SettingsRoot.tsx'
export { OpenAIIcon } from './icons/OpenAIIcon.tsx'
export { AntigravityIcon } from './icons/AntigravityIcon.tsx'
export { getDefaultNavIcon } from './icons/default-icons.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.section.icon': {
      kind: 'keyed'
      scope: 'root'
      owner: SettingsSectionIconOwnerProps
    }
  }

  interface LocaleNamespaceMap {
    settings: SettingsKey
  }
}

export interface SettingsSectionIconOwnerProps {
  children?: never
}

const NS = 'settings'

export const inject = [
  'slots',
  'locale',
  'connection',
  'remote',
  'remote.settings',
  'configForms',
  'shortcuts',
]

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item', id: 'developer-tools', order: 15, locale: NS,
    inject: () => ({
      hooks: { developerTools: ctx.configForms.developerTools.enabled },
      setEnabled: (enabled: boolean) => ctx.configForms.developerTools.setEnabled(enabled),
    }),
  }, DeveloperToolsRow as any))
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item', id: 'current-version', order: 100, locale: NS,
  }, CurrentVersionRow as any))
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-icons: dictionaries')
  const t = ctx.locale.bind(NS)
  const connection = ctx.get('connection')
  const desktopUpdate = new DesktopUpdateSource()
  ctx.effect(() => () => { desktopUpdate.dispose() }, 'ui-settings-icons: desktop update cleanup')
  ctx.slots.inject('sidebar.toggle.badge', () => ctx.slots.register({
    name: 'sidebar.toggle.badge', locale: NS,
    inject: () => ({ hooks: { desktopUpdate: desktopUpdate.store, connectionState: connection.state } }),
  }, DesktopUpdateBadge as any))
  const shellState = createSnapshotStore({ open: false, activeId: undefined as string | undefined })
  const shellActions = {
    open: () => { shellState.set({ ...shellState.getSnapshot(), open: true }) },
    close: () => { shellState.set({ open: false, activeId: undefined }) },
    select: (id: string) => { shellState.set({ ...shellState.getSnapshot(), activeId: id }) },
    openSection: (id: string) => { shellState.set({ open: true, activeId: id }) },
  }
  const documentController = ctx.remote.$host.isLoopback
    ? new SettingsDocumentStore(ctx, ctx.configForms.describe())
    : undefined
  const documentInjected = documentController === undefined ? undefined : () => ({
    controller: documentController,
    hooks: { snapshot: documentController.store },
  })

  ctx.effect(() => () => {
    documentController?.dispose()
  }, 'ui-settings-icons: document action cleanup')

  let rowsVersion = -1
  let rowsRevision = -1
  let rows: SettingsSectionRow[] = []
  let onboardingVersion = -1
  let onboardingSteps: SettingsOnboardingStepRow[] = []

  const shellInjected = () => ({
    openDesktopUpdate: () => { desktopUpdate.open() },
    reconnect: () => {
      connection.reconnect()
    },
    hooks: {
      shellState,
      shortcuts: ctx.shortcuts.catalog,
      desktopUpdate: desktopUpdate.store,
      connectionState: connection.state,
      sections: {
        getSnapshot: (): SettingsSectionRow[] => {
          const version = ctx.slots.getVersion('settings.section')
          const revision = ctx.locale.getSnapshot().revision
          if (version !== rowsVersion || revision !== rowsRevision) {
            rowsVersion = version
            rowsRevision = revision
            rows = ctx.slots.entries('settings.section').map((e) => ({
              id: e.options.id ?? '',
              order: e.options.order ?? 0,
              label: resolveSlotLabel(e.options.label) ?? '',
            })).sort((a, b) => a.order - b.order)
          }
          return rows
        },
        subscribe: (listener: () => void) => {
          const offLedger = ctx.slots.subscribe('settings.section', listener)
          const offLocale = ctx.locale.subscribe(listener)
          return () => {
            offLedger()
            offLocale()
          }
        },
      },
      onboardingSteps: {
        getSnapshot: (): SettingsOnboardingStepRow[] => {
          const version = ctx.slots.getVersion('settings.onboarding')
          if (version !== onboardingVersion) {
            onboardingVersion = version
            onboardingSteps = ctx.slots.entries('settings.onboarding').map((e) => ({
              id: e.options.id ?? '',
              order: e.options.order ?? 0,
            })).sort((a, b) => a.order - b.order)
          }
          return onboardingSteps
        },
        subscribe: (listener: () => void) => ctx.slots.subscribe('settings.onboarding', listener),
      },
    },
  })

  ctx.slots.inject('sidebar.settings', () => {
    const disposeShortcut = ctx.shortcuts.register({
      id: 'settings.open' as ShortcutCommandId,
      label: () => t('shortcut.open'),
      aliases: ['settings', 'preferences'],
      defaults: {
        'desktop:macos': { code: 'Comma', modifiers: ['primary'] },
        'desktop:windows': { code: 'Comma', modifiers: ['primary'] },
        'desktop:linux': { code: 'Comma', modifiers: ['primary'] },
        'web:macos': { code: 'Comma', modifiers: ['primary'] },
        'web:windows': { code: 'Comma', modifiers: ['primary'] },
      },
      regions: ['page', 'editable', 'terminal'],
      modals: ['settings'],
      resolve: ({ modal }) => {
        if (modal !== null && modal !== 'settings') return { status: 'blocked', reason: 'modal' }
        return { status: 'handled', run: () => {
          if (modal === 'settings') closeTopModal(document)
          else shellActions.open()
        } }
      },
    })
    const disposeSlot = ctx.slots.register({
    name: 'sidebar.settings',
    locale: NS,
    children: {
      'settings.launcher': {
        kind: 'single',
        scope: 'root',
      },
      'settings.trigger': {
        kind: 'single',
        scope: 'root',
      },
      'settings.header': {
        kind: 'single',
        scope: 'root',
      },
      'settings.action': {
        kind: 'list',
        scope: 'root',
      },
      'settings.close': {
        kind: 'single',
        scope: 'root',
      },
      'settings.section': {
        kind: 'list',
        scope: 'root',
      },
      'settings.section.icon': {
        kind: 'keyed',
        scope: 'root',
      },
      'settings.onboarding': {
        kind: 'list',
        scope: 'root',
      },
    },
    inject: () => ({ ...shellInjected(), actions: shellActions }),
  }, SettingsRoot as any)
    return () => { disposeShortcut(); disposeSlot() }
  })

  ctx.slots.inject('settings.trigger', () => ctx.slots.register({
    name: 'settings.trigger',
    locale: NS,
  }, TriggerContent as any))

  ctx.slots.inject('settings.header', () => ctx.slots.register({
    name: 'settings.header',
    locale: NS,
  }, HeaderContent as any))

  if (documentInjected !== undefined) {
    ctx.slots.inject('settings.action', () => ctx.slots.register({
      name: 'settings.action',
      id: 'open-document',
      order: 0,
      locale: NS,
      inject: documentInjected,
    }, SettingsDocumentAction as any))
  }

  ctx.slots.inject('settings.close', () => ctx.slots.register({
    name: 'settings.close',
    locale: NS,
  }, CloseLabel as any))

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'general',
    order: 0,
    label: () => t('general.nav'),
    locale: NS,
    children: {
      'settings.general.item': {
        kind: 'list',
        scope: 'root',
      },
    },
  }, GeneralSection as any))
}
