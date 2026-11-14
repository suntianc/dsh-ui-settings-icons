import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as JSXRuntime from 'react/jsx-runtime'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import * as Cordis from '@deepseek-ai/cordis'
import * as Store from '@deepseek-ai/dsh-client-store'
import * as Slots from '@deepseek-ai/dsh-client-ui-slots'
import * as Primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { act, render, screen } from '@testing-library/react'
import { expect, it, onTestFinished } from 'vitest'
import * as Icons from '../src/client/index.ts'

const table: Record<string, unknown> = {
  react: React, 'react-dom': ReactDOM, 'react-dom/client': ReactDOMClient,
  'react/jsx-runtime': JSXRuntime, '@deepseek-ai/cordis': Cordis,
  '@deepseek-ai/dsh-client-store': Store, '@deepseek-ai/dsh-client-ui-slots': Slots,
  '@deepseek-ai/dsh-client-ui-primitives': Primitives,
}
function clientModule(specifier: string): any {
  let result: any
  const code = readFileSync(fileURLToPath(import.meta.resolve(specifier)), 'utf8')
  const loaderWindow = { __ModuleLoader__: { load({ factory }: { factory: (require: (name: string) => unknown) => unknown }) {
    result = factory((name) => {
      if (!(name in table)) throw new Error(`Unknown browser module: ${name}`)
      return table[name]
    })
  } } }
  // Deliberately no process, Buffer, or Node require in this browser scope.
  runInNewContext(code, { window: loaderWindow, document, console, queueMicrotask, setTimeout, clearTimeout })
  return result
}

const ids = ['codex-auth', 'codex', 'openai', 'antigravity-auth', 'antigravity', 'gemini', 'unknown']
async function fixture(plugin = Icons, lateDeclaration = false) {
  const ctx = new Cordis.Context()
  onTestFinished(async () => { await ctx.fiber.dispose() })
  await ctx.plugin(clientModule('@deepseek-ai/dsh-client-ui-renderer/client')).await()
  const absent = Store.createSnapshotStore({ key: undefined, hooks: {}, keyedHooks: {}, props: {} })
  ctx.slots.installScope('session', { current: absent, bindingSource: () => absent })
  const declare = () => ctx.slots.register({ name: 'root', children: {
    'settings.section.icon': { kind: 'list', scope: 'root', inline: true },
  } }, ({ renderSlot }: any) => <>{ids.map(id => <div key={id} data-testid={id}>{renderSlot('settings.section.icon', {
    size: 23, active: id === 'codex-auth',
  }, { only: id, fallback: <span data-testid={`fallback-${id}`}>native fallback</span> })}</div>)}</>)
  if (!lateDeclaration) declare()
  const fiber = ctx.plugin(plugin)
  await fiber.await()
  if (lateDeclaration) declare()
  await ctx.fiber.await()
  const view = render(<>{ctx.slots.renderSlot('root', {})}</>)
  return { ctx, fiber, view }
}

function path(id: string) { return screen.getByTestId(id).querySelector('svg path')?.getAttribute('d') }
function expectIcons() {
  for (const id of ids.slice(0, 3)) {
    expect(createHash('sha256').update(path(id) ?? '').digest('hex')).toBe('f80460fe911cfdc4999d14a45b937b6ee36328428123ae408ce0f89eb7585799')
  }
  for (const id of ids.slice(3, 6)) expect(path(id)).toBe('M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z')
  for (const id of ids.slice(0, 6)) {
    expect(screen.getByTestId(id).querySelectorAll('svg')).toHaveLength(1)
    expect(screen.getByTestId(id).querySelector('svg')?.getAttribute('width')).toBe('23')
  }
  expect(screen.getByTestId('fallback-unknown')).toBeDefined()
  expect(document.querySelector('[data-slot-error]')).toBeNull()
}

it.each([false, true])('contributes six exact native icons, including late owner declaration %s', async late => {
  const { ctx, view } = await fixture(Icons, late)
  expectIcons()
  expect(ctx.slots.entries('settings.section.icon')).toHaveLength(6)
  expect(ctx.slots.entries('sidebar.settings')).toHaveLength(0)
  expect(ctx.slots.entries('settings.section')).toHaveLength(0)
  view.unmount()
})

it('lets a default-priority custom icon override the fallback and passes native owner props', async () => {
  const { ctx, view } = await fixture()
  let dispose = () => {}
  const seen: Array<{ size: number; active: boolean }> = []
  await act(async () => {
    dispose = ctx.slots.register({ name: 'settings.section.icon', id: 'codex-auth' }, (props: any) => {
      seen.push({ size: props.size, active: props.active })
      return <svg data-testid="custom-icon" width={props.size}><path d="custom" /></svg>
    })
  })
  expect(screen.getByTestId('custom-icon')).toBeDefined()
  expect(screen.getByTestId('codex-auth').querySelectorAll('svg')).toHaveLength(1)
  expect(seen).toContainEqual({ size: 23, active: true })
  await act(async () => { dispose(); dispose() })
  expect(screen.queryByTestId('custom-icon')).toBeNull()
  expectIcons()
  view.unmount()
})

it('removes only its contributions on unload and restores them once on reload', async () => {
  const { ctx, fiber, view } = await fixture()
  await act(async () => { await fiber.dispose() })
  expect(ctx.slots.entries('settings.section.icon')).toHaveLength(0)
  expect(screen.getByTestId('fallback-codex-auth')).toBeDefined()
  expect(ctx.slots.entries('root')).toHaveLength(1)
  await act(async () => { await ctx.plugin(Icons).await() })
  expect(ctx.slots.entries('settings.section.icon')).toHaveLength(6)
  expectIcons()
  view.unmount()
})

it.skipIf(process.env['DSH_TEST_BUILT_CLIENT'] !== '1')('executes the shipped browser bundle without Node globals', async () => {
  const { view } = await fixture(clientModule('../lib/client.cjs'))
  expectIcons()
  view.unmount()
})
