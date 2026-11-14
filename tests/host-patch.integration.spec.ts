// @vitest-environment node
/** Real Loader/Include composition: the icon extension must never replace the official shell. */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include, { type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import yaml from 'js-yaml'
import { expect, it, onTestFinished } from 'vitest'

const STOCK = '@deepseek-ai/dsh-client-ui-settings-general'
const ICONS = 'dsh-ui-settings-icons'

it('cold boots stock settings and icons as separate enabled entries', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'settings-icons-native-patch-'))
  const host = new Context()
  onTestFinished(async () => { await host.fiber.dispose(); rmSync(dir, { recursive: true, force: true }) })
  const trace: string[] = []
  host.provide('settingsIconTrace' as never, trace)
  const specifier = (name: string) => `./node_modules/${name}/index.mjs`
  for (const name of [STOCK, ICONS]) {
    const pkg = join(dir, 'node_modules', name)
    mkdirSync(pkg, { recursive: true })
    writeFileSync(join(pkg, 'index.mjs'), `export function apply(ctx) { ctx.get('settingsIconTrace').push(${JSON.stringify(name)}); }`)
  }
  const patches = yaml.load(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')) as PatchOptions[]
  expect(patches).toEqual([{ insert: [{ id: 'ui-settings-icons', name: ICONS }] }])
  for (const patch of patches) for (const entry of patch.insert ?? []) entry.name = specifier(entry.name)
  writeFileSync(join(dir, 'cordis.json'), '[]')
  await host.plugin(Loader, { baseUrl: pathToFileURL(`${dir}/`).href })
  host.loader.builtins.include = Include
  const rootEntry = { id: 'include', name: 'cordis:include', config: {
    path: './cordis.json', patches: [
      { insert: [{ id: 'ui-settings-general', name: specifier(STOCK), config: { welcomeNoticeVersion: 'retained' } }] },
      ...patches,
    ],
  } }
  await host.loader.create(rootEntry)
  await host.loader.await()
  const stock = host.loader.resolve('include:ui-settings-general').options
  const icons = host.loader.resolve('include:ui-settings-icons').options
  expect(stock.name).toBe(specifier(STOCK))
  expect(stock.disabled).not.toBe(true)
  expect(stock.config).toEqual({ welcomeNoticeVersion: 'retained' })
  expect(icons.name).toBe(specifier(ICONS))
  expect(trace.sort()).toEqual([STOCK, ICONS].sort())
})
