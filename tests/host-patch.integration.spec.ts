// @vitest-environment node
/** Real Host Loader composition and page entry reconciliation for the shipped bundle patch. */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include, { type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import { ClientModuleRegistry } from '@deepseek-ai/dsh-client-modules'
import type {
  ClientBundleRegistration, ClientModuleLoaderTarget, ClientModuleLoader,
} from '@deepseek-ai/dsh-client-modules/client'
import yaml from 'js-yaml'
import { afterEach, describe, expect, it } from 'vitest'

declare module '@deepseek-ai/cordis' {
  interface Context {
    settingsIconTrace: string[]
    settingsIconShell: string
  }
}

const STOCK = '@deepseek-ai/dsh-client-ui-settings-general'
const ICONS = 'dsh-ui-settings-icons'
// The released Host Loader cannot replace an active entry's module. Opt in to reproduce that known failure.
const hotSwap = it.runIf(process.env.DSH_VERIFY_HOT_SWAP === '1')
const roots: string[] = []
const contexts: Context[] = []
const require = createRequire(import.meta.url)

// Client exports are lazy factories in the actual published browser artifact, not native ESM.
const registrations: ClientBundleRegistration[] = []
runInNewContext(readFileSync(require.resolve('@deepseek-ai/dsh-client-modules/client'), 'utf8'), {
  window: { __ModuleLoader__: { load: (registration: ClientBundleRegistration) => registrations.push(registration) } },
  console, queueMicrotask, URL,
})
const rejectImport = () => { throw new Error('Unexpected platform import') }
const clientExports = registrations[0]!.factory(Object.assign(rejectImport, { async: async () => rejectImport() })) as {
  createClientModuleSystem: typeof import('@deepseek-ai/dsh-client-modules/client').createClientModuleSystem
}

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) {
    await ctx.fiber.dispose()
    await ctx.fiber.await()
  }
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function context(): Context {
  const ctx = new Context()
  contexts.push(ctx)
  ctx.provide('settingsIconTrace', [])
  return ctx
}

function mountedSource(name: string): string {
  return `export const name = ${JSON.stringify(name)}; export function apply(ctx) {
    ctx.provide('settingsIconShell', ${JSON.stringify(name)});
    ctx.effect(() => {
      ctx.root.settingsIconTrace.push('mount:' + ${JSON.stringify(name)});
      return () => { ctx.root.settingsIconTrace.push('dispose:' + ${JSON.stringify(name)}); };
    });
  }`
}

async function fixture(enabled: boolean) {
  const dir = mkdtempSync(join(tmpdir(), 'settings-icons-host-patch-'))
  roots.push(dir)
  const specifier = (name: string) => `./node_modules/${name}/index.mjs`
  for (const name of [STOCK, ICONS]) {
    const pkg = join(dir, 'node_modules', name)
    mkdirSync(pkg, { recursive: true })
    writeFileSync(join(pkg, 'package.json'), JSON.stringify({
      name, type: 'module',
      exports: { '.': './index.mjs', './client': './client.cjs', './package.json': './package.json' },
      dsh: { client: { platform: 'web' } },
    }))
    writeFileSync(join(pkg, 'index.mjs'), mountedSource(name))
    writeFileSync(join(pkg, 'client.cjs'), `window.__ModuleLoader__.load({
      id: ${JSON.stringify(name)}, factory: () => {
        ${mountedSource(name).replace(/export /g, '')}
        return { name, apply };
      }
    });`)
  }
  // The official Web bundle inserts the stock row before this bundle's patch is applied.
  const base: PatchOptions[] = [{ insert: [{ id: 'ui-settings-general', name: specifier(STOCK) }] }]
  const pluginPatches = yaml.load(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')) as PatchOptions[]
  for (const patch of pluginPatches) {
    if (patch.name === STOCK || patch.name === ICONS) patch.name = specifier(patch.name)
    for (const entry of patch.insert ?? []) entry.name = specifier(entry.name)
  }
  const patches = (selected: boolean): PatchOptions[] => structuredClone([...base, ...(selected ? pluginPatches : [])])
  writeFileSync(join(dir, 'cordis.json'), '[]')
  const host = context()
  await host.plugin(Loader, { baseUrl: pathToFileURL(`${dir}/`).href })
  host.loader.builtins.include = Include
  const rootEntry = { id: 'include', name: 'cordis:include', config: { path: './cordis.json', patches: patches(enabled) } }
  await host.loader.create(rootEntry)
  await host.loader.await()
  await host.plugin(ClientModuleRegistry)
  const page = context()
  const target: ClientModuleLoaderTarget = {
    mode: 'queue', pendingQueue: [], load: () => {},
    create: options => clientExports.createClientModuleSystem(target, { id: 'test-bootstrap', exports: {} }, options),
  }
  const modules: ClientModuleLoader = target.create({
    boot: host.clientModules.graph(), staticModules: {},
    loadBundle: async (url) => {
      const response = await host.clientModules.fetchBundle(new Request(new URL(url, 'http://localhost/')))
      expect(response.status).toBe(200)
      runInNewContext(await response.text(), { window: { __ModuleLoader__: target }, console, queueMicrotask, URL })
    },
  })
  await page.plugin(Loader)
  page.loader.internal = modules as never
  await modules.entries.start(page.loader, modules.manifest)
  return {
    host, page, modules,
    async select(selected: boolean) {
      await host.loader.resolve('include').update({ config: { path: './cordis.json', patches: patches(selected) } })
      await host.loader.await()
      await modules.entries.sync(host.clientModules.graph())
    },
  }
}

function expectSelected(b: Awaited<ReturnType<typeof fixture>>, selected: boolean): void {
  const wanted = selected ? ICONS : STOCK
  expect(b.host.loader.resolve('include:ui-settings-general').options.name).toContain(wanted)
  expect(b.host.get('settingsIconShell')).toBe(wanted)
  expect(b.host.clientModules.graph().entries.map(row => row.id)).toEqual([wanted])
  expect(b.page.get('settingsIconShell')).toBe(wanted)
  expect(b.modules.entries.state.getSnapshot()).toEqual({ syncing: false, failures: [] })
}

describe('settings icons bundle through Host and page Loaders', () => {
  it('cold boots only the enhanced shell without renaming its settings namespace', async () => {
    const b = await fixture(true)
    expectSelected(b, true)
    expect(b.host.settingsIconTrace).toEqual([`mount:${ICONS}`])
  })

  hotSwap('activates after stock startup, restores stock on disable, and can activate again', async () => {
    const b = await fixture(false)
    expectSelected(b, false)
    await b.select(true)
    expectSelected(b, true)
    await b.select(false)
    expectSelected(b, false)
    await b.select(true)
    expectSelected(b, true)
    expect(b.page.settingsIconTrace).toEqual([
      `mount:${STOCK}`, `dispose:${STOCK}`, `mount:${ICONS}`,
      `dispose:${ICONS}`, `mount:${STOCK}`, `dispose:${STOCK}`, `mount:${ICONS}`,
    ])
  })

  hotSwap('restores stock after the enhanced shell was selected at cold boot', async () => {
    const b = await fixture(true)
    await b.select(false)
    expectSelected(b, false)
    expect(b.page.settingsIconTrace).toEqual([`mount:${ICONS}`, `dispose:${ICONS}`, `mount:${STOCK}`])
  })
})
