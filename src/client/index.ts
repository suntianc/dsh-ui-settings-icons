import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { SettingsRoot } from './SettingsRoot.tsx'
import type { SettingsOnboardingStepRow, SettingsSectionRow } from './SettingsRoot.tsx'
import { CloseLabel, GeneralSection, HeaderContent, SettingsDocumentAction, TriggerContent } from './chrome.tsx'
import { SettingsDocumentStore } from './settings-document-store.ts'
import { en, zh, type SettingsKey } from './locales.ts'

export { SettingsRoot } from './SettingsRoot.tsx'
export type { EnhancedSettingsRootProps, SettingsSectionRow, SettingsOnboardingStepRow } from './SettingsRoot.tsx'
export { OpenAIIcon } from './icons/OpenAIIcon.tsx'
export { AntigravityIcon } from './icons/AntigravityIcon.tsx'
export { getDefaultNavIcon } from './icons/default-icons.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'sidebar.settings': {
      kind: 'single'
      scope: 'root'
      owner: { wide: boolean }
    }
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

export const inject = ['slots', 'locale', 'connection', 'settingsScope']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-icons: dictionaries')
  const t = ctx.locale.bind(NS)
  const connection = ctx.get('connection') as any
  const documentController = connection?.isLoopback
    ? new SettingsDocumentStore(connection.api, ctx.settingsScope.describe())
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
    hooks: {
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

  ctx.slots.inject('sidebar.settings', () => ctx.slots.register({
    name: 'sidebar.settings',
    children: {
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
    inject: shellInjected,
  }, SettingsRoot as any))

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
