import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { describe, expect, it } from 'vitest'
import { apply, inject } from '../src/client/index.ts'

interface SlotRecord {
  options: Record<string, unknown>
  component: unknown
}

function bench() {
  const disposers: Array<() => void> = []
  const slots: SlotRecord[] = []
  const slotSubscriptions = new Map<string, Set<() => void>>()
  const localeSubscriptions = new Set<() => void>()
  const dictionaries = new Map<string, any>()

  let sectionVersion = 1
  let onboardingVersion = 1
  let localeRevision = 1
  let registeredSections: Array<{ options: { id?: string; order?: number; label?: string } }> = [
    { options: { id: 'general', order: 0, label: 'General' } },
    { options: { id: 'codex-auth', order: 20, label: 'GPT Auth' } },
  ]
  let registeredOnboarding: Array<{ options: { id?: string; order?: number } }> = []

  const ctx = {
    locale: {
      getSnapshot: () => ({ revision: localeRevision }),
      register: (ns: string, dict: any) => {
        dictionaries.set(ns, dict)
        return () => { dictionaries.delete(ns) }
      },
      bind: (ns: string) => (key: string) => dictionaries.get(ns)?.en?.[key] ?? key,
      subscribe: (fn: () => void) => {
        localeSubscriptions.add(fn)
        return () => { localeSubscriptions.delete(fn) }
      },
    },
    settingsScope: {
      describe: () => ({
        getSnapshot: () => ({ view: { hasDocument: true }, error: null }),
        subscribe: () => () => {},
        ensure: async () => {},
      }),
    },
    slots: {
      inject(_name: string, register: () => () => void) {
        disposers.push(register())
      },
      register(options: Record<string, unknown>, component: unknown) {
        const record = { options, component }
        slots.push(record)
        return () => {
          const index = slots.indexOf(record)
          if (index >= 0) slots.splice(index, 1)
        }
      },
      getVersion(key: string) {
        if (key === 'settings.section') return sectionVersion
        if (key === 'settings.onboarding') return onboardingVersion
        return 0
      },
      entries(key: string) {
        if (key === 'settings.section') return registeredSections
        if (key === 'settings.onboarding') return registeredOnboarding
        return []
      },
      subscribe(key: string, fn: () => void) {
        let set = slotSubscriptions.get(key)
        if (!set) {
          set = new Set()
          slotSubscriptions.set(key, set)
        }
        set.add(fn)
        return () => { set.delete(fn) }
      },
    },
    get(service: string) {
      if (service === 'connection') {
        return {
          isLoopback: true,
          api: {
            settings: {
              openDocument: async () => ({ result: { ok: true } }),
            },
          },
        }
      }
      throw new Error(`unexpected service: ${service}`)
    },
    effect(effect: () => (() => void)) {
      const dispose = effect()
      disposers.push(dispose)
      return dispose
    },
  }

  apply(ctx as unknown as ClientContext)
  return {
    slots,
    dictionaries,
    slotSubscriptions,
    localeSubscriptions,
    mutateSections(newSections: typeof registeredSections) {
      registeredSections = newSections
      sectionVersion += 1
      for (const fn of slotSubscriptions.get('settings.section') ?? []) fn()
    },
    dispose: () => { for (const dispose of disposers.reverse()) dispose() },
  }
}

describe('dsh-ui-settings-icons client apply', () => {
  it('declares every consumed service', () => {
    expect(inject).toEqual(['slots', 'locale', 'connection', 'settingsScope'])
  })

  it('registers sidebar.settings, settings chrome, and general section', () => {
    const b = bench()
    expect(b.dictionaries.has('settings')).toBe(true)

    const slotNames = b.slots.map((s) => s.options['name'])
    expect(slotNames).toContain('sidebar.settings')
    expect(slotNames).toContain('settings.trigger')
    expect(slotNames).toContain('settings.header')
    expect(slotNames).toContain('settings.action')
    expect(slotNames).toContain('settings.close')
    expect(slotNames).toContain('settings.section')

    const sidebarSlot = b.slots.find((s) => s.options['name'] === 'sidebar.settings')
    const children = sidebarSlot?.options['children'] as Record<string, { kind: string; scope: string }>
    expect(children).toBeDefined()
    expect(children['settings.section.icon']).toEqual({ kind: 'keyed', scope: 'root' })
    expect(children['settings.section']).toEqual({ kind: 'list', scope: 'root' })
    expect(children['settings.trigger']).toEqual({ kind: 'single', scope: 'root' })
    expect(children['settings.header']).toEqual({ kind: 'single', scope: 'root' })
    expect(children['settings.action']).toEqual({ kind: 'list', scope: 'root' })
    expect(children['settings.close']).toEqual({ kind: 'single', scope: 'root' })
    expect(children['settings.onboarding']).toEqual({ kind: 'list', scope: 'root' })

    const generalSlot = b.slots.find((s) => s.options['name'] === 'settings.section' && s.options['id'] === 'general')
    expect(generalSlot).toBeDefined()

    b.dispose()
    expect(b.slots).toHaveLength(0)
    expect(b.dictionaries.size).toBe(0)
  })
})
