import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import * as ReactDOMClient from 'react-dom/client'
import * as JSXRuntime from 'react/jsx-runtime'
import type { ClientReleaseChange } from '@deepseek-ai/dsh-client-modules/client'
import * as Cordis from '@deepseek-ai/cordis'
import * as Store from '@deepseek-ai/dsh-client-store'
import * as Slots from '@deepseek-ai/dsh-client-ui-slots'
import * as Primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { expect, it, onTestFinished, vi } from 'vitest'
import * as Icons from '../src/client/index.ts'

vi.unmock('@deepseek-ai/dsh-client-store')
vi.unmock('@deepseek-ai/dsh-client-ui-primitives')
// jsdom has no layout observer; this fixture does not validate browser geometry.
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })

const table: Record<string, unknown> = {
  react: React, 'react-dom': ReactDOM, 'react-dom/client': ReactDOMClient,
  'react/jsx-runtime': JSXRuntime, '@deepseek-ai/cordis': Cordis,
  '@deepseek-ai/dsh-client-store': Store, '@deepseek-ai/dsh-client-ui-slots': Slots,
  '@deepseek-ai/dsh-client-ui-primitives': Primitives,
}
function clientModule(specifier: string, browserOnly = false): any {
  let result: any
  const code = readFileSync(fileURLToPath(import.meta.resolve(specifier)), 'utf8')
  const loaderWindow = { __ModuleLoader__: { load({ factory }: { factory: (require: (name: string) => unknown) => unknown }) {
    result = factory((name) => {
      if (!(name in table)) throw new Error(`Unknown browser module: ${name}`)
      return table[name]
    })
  } } }
  if (browserOnly) runInNewContext(code, { window: loaderWindow, document, console, queueMicrotask, setTimeout, clearTimeout, __DSH_BOOT__: { release: { version: '0.2.1-rc.2' } } })
  else {
    const scriptWindow = window as Window & { __ModuleLoader__?: typeof loaderWindow.__ModuleLoader__ }
    const previous = scriptWindow.__ModuleLoader__
    scriptWindow.__ModuleLoader__ = loaderWindow.__ModuleLoader__
    try { new Function('window', code)(scriptWindow) }
    finally {
      if (previous === undefined) delete scriptWindow.__ModuleLoader__
      else scriptWindow.__ModuleLoader__ = previous
    }
  }
  return result
}

async function fixture(plugin = Icons, realShortcuts = false) {
  const ctx = new Cordis.Context()
  onTestFinished(async () => { await ctx.fiber.dispose() })
  const renderer = clientModule('@deepseek-ai/dsh-client-ui-renderer/client')
  await ctx.plugin(renderer).await()
  const localeModule = clientModule('@deepseek-ai/dsh-client-locale/client')
  const locale = new localeModule.LocaleRuntime(ctx)
  ctx.reflect.provide('locale', locale)
  ctx.slots.installLocale(locale)
  const constant = <T,>(value: T) => Store.createSnapshotStore(value)
  ctx.reflect.provide('connection', { state: constant('connected'), reconnect() {} })
  ctx.reflect.provide('remote', { $host: { isLoopback: false }, settings: {} })
  ctx.reflect.provide('remote.settings', {})
  ctx.reflect.provide('configForms', { developerTools: { enabled: constant(false), setEnabled: async () => {} } })
  const releaseChange = constant<ClientReleaseChange | undefined>(undefined)
  ctx.reflect.provide('modules', { entries: { dismissRelease() { releaseChange.set(undefined) }, releaseChange } })
  if (realShortcuts) await ctx.plugin(clientModule('@deepseek-ai/dsh-client-shortcuts/client')).await()
  else ctx.reflect.provide('shortcuts', { catalog: constant([]), register: () => () => {} })
  ctx.slots.provideRoot({ hooks: { sessions: constant({ phase: 'ready', byId: {} }) } })
  const absent = constant({ key: undefined, hooks: {}, keyedHooks: {}, props: {} })
  ctx.slots.installScope('session', { current: absent, bindingSource: () => absent })
  ctx.slots.register({ name: 'root', children: {
    'shell.overlay': { kind: 'list', scope: 'root' },
    'sidebar.settings': { kind: 'single', scope: 'root' },
    'sidebar.toggle.badge': { kind: 'single', scope: 'root' },
  } }, ({ renderSlot }: any) => <>{renderSlot('sidebar.settings', { wide: true })}{renderSlot('shell.overlay', {})}</>)
  const fiber = ctx.plugin(plugin)
  await fiber.await()
  expect(ctx.slots.entries('sidebar.settings')).toHaveLength(1)
  ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'codex-auth', order: 80, label: 'GPT Auth' }, () => <p>GPT Auth body</p>))
  ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'unknown', order: 90, label: 'Unknown' }, () => <p>Unknown body</p>))
  for (const [id, label] of [['account', 'Account'], ['archived-sessions', 'Archived sessions']]) {
    ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: id!, order: 100, label: label! }, () => null))
  }
  const view = render(<>{ctx.slots.renderSlot('root', {})}</>)
  return { ctx, fiber, view, locale, releaseChange }
}

function openSettings() { fireEvent.click(screen.getByRole('button', { name: 'Settings' })) }
function openAiPath() { return screen.getByRole('button', { name: 'GPT Auth' }).querySelector('svg path')?.getAttribute('d') }
function expectOpenAiIcon() {
  // Full known-good path fingerprint, not merely the presence of an arbitrary SVG.
  expect(createHash('sha256').update(openAiPath() ?? '').digest('hex')).toBe('f80460fe911cfdc4999d14a45b937b6ee36328428123ae408ce0f89eb7585799')
}

it('renders exact OpenAI and unknown gear defaults through real slots and renderer', async () => {
  const { view } = await fixture()
  openSettings()
  const button = screen.getByRole('button', { name: 'GPT Auth' })
  expect(button.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24')
  expectOpenAiIcon()
  expect(screen.getByRole('button', { name: 'Unknown' }).querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 16 16')
  for (const [label, Icon] of [['Account', Primitives.IconUserOutlineMedium], ['Archived sessions', Primitives.IconArchiveOutlineMedium]] as const) {
    const expected = document.createElement('div')
    expected.innerHTML = renderToStaticMarkup(<Icon size={16} />)
    expect(screen.getByRole('button', { name: label }).querySelector('svg')?.innerHTML).toBe(expected.querySelector('svg')?.innerHTML)
  }
  fireEvent.click(button)
  expect(screen.getByText('GPT Auth body')).toBeDefined()
  view.unmount()
})


it('adds a keyed icon and restores OpenAI when the contributor unloads', async () => {
  const { ctx, view } = await fixture()
  openSettings()
  const expected = openAiPath()
  let dispose = () => {}
  await act(async () => {
    dispose = ctx.slots.register({ name: 'settings.section.icon', key: 'codex-auth' }, () => <svg data-testid="custom-icon"><path d="M0 0h12v12z" /></svg>)
  })
  expect(screen.getByTestId('custom-icon')).toBeDefined()
  expect(openAiPath()).toBe('M0 0h12v12z')
  await act(async () => { dispose(); dispose() })
  expect(screen.queryByTestId('custom-icon')).toBeNull()
  expect(openAiPath()).toBe(expected)
  view.unmount()
})

it('rebuilds one shell and its sections after client plugin unload/reload', async () => {
  const { ctx, fiber, view } = await fixture()
  openSettings()
  fireEvent.click(screen.getByRole('button', { name: 'GPT Auth' }))
  await act(async () => { await fiber.dispose() })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(ctx.slots.entries('sidebar.settings')).toHaveLength(0)
  expect(ctx.slots.entries('shell.overlay')).toHaveLength(0)
  await act(async () => { await ctx.plugin(Icons).await() })
  expect(ctx.slots.entries('sidebar.settings')).toHaveLength(1)
  openSettings()
  expectOpenAiIcon()
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  openSettings()
  expect(screen.getByRole('button', { name: 'General' }).getAttribute('aria-current')).toBe('true')
  view.unmount()
})


it.skipIf(process.env['DSH_TEST_BUILT_CLIENT'] !== '1')('executes the shipped browser bundle without a Node process global', async () => {
  const plugin = clientModule('../lib/client.cjs', true)
  const { view } = await fixture(plugin)
  openSettings()
  expect(document.querySelector('[data-slot-error]')).toBeNull()
  expect(screen.getByText('Current version: 0.2.1-rc.2')).toBeDefined()
  expectOpenAiIcon()
  view.unmount()
})


it.each(['MacIntel', 'Win32'])('opens and closes settings through the real keyboard adapter on %s', async (device) => {
  vi.spyOn(navigator, 'platform', 'get').mockReturnValue(device)
  const { view } = await fixture(Icons, true)
  const platform = /darwin|mac|iphone|ipad/iu.test(navigator.platform) ? 'macos' : 'other'
  const gesture = { code: 'Comma', key: ',', altKey: true, ctrlKey: platform !== 'macos', metaKey: platform === 'macos' }
  fireEvent.keyDown(window, gesture)
  expect(screen.getByRole('dialog').getAttribute('data-shortcut-modal')).toBe('settings')
  fireEvent.keyDown(window, gesture)
  expect(screen.queryByRole('dialog')).toBeNull()
  view.unmount()
})


it('registers the Host release prompt through real overlay slots', async () => {
  const { ctx, view, releaseChange } = await fixture()
  expect(ctx.slots.entries('shell.overlay')).toHaveLength(1)
  expect(screen.queryByRole('dialog')).toBeNull()
  await act(async () => { releaseChange.set({ page: { version: 'old' }, previous: { version: 'old' }, host: { version: 'new' } }) })
  expect(screen.getByRole('dialog', { name: 'Service version changed' })).toBeDefined()
  fireEvent.click(screen.getByText('Not now'))
  expect(releaseChange.getSnapshot()).toBeUndefined()
  expect(screen.queryByRole('dialog')).toBeNull()
  view.unmount()
})
