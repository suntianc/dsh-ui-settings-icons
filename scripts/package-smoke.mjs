#!/usr/bin/env node
/** Packaged-artifact smoke: exported Host modules, browser bundle, and patch rows. */
import { execFileSync } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import semver from 'semver'
import { DSH_BASELINE, DSH_SOURCE_VERSION, DSH_PEER_RANGE, DSH_VERIFY_VERSION, resolvedDshPackages } from './dsh-compatibility.mjs'

const CORDIS_BASELINE = '4.0.2'
const SCHEMASTERY_BASELINE = '3.18.2'
const RETIRED_DSH_PACKAGES = new Set(['@deepseek-ai/dsh-client-runtime'])
const DSH_WEB_MODULE_TABLE = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
])
const sourceRoot = resolve(import.meta.dirname, '..')
const temporary = await mkdtemp(resolve(sourceRoot, '.package-smoke-'))
try {
  const output = execFileSync('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', temporary,
  ], {
    cwd: sourceRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: resolve(temporary, '.npm-cache'),
      npm_config_ignore_scripts: 'true',
    },
  })
  const jsonStart = output.lastIndexOf('\n[')
  const packed = JSON.parse(output.slice(jsonStart < 0 ? 0 : jsonStart + 1))
  const filename = packed?.[0]?.filename
  if (typeof filename !== 'string') throw new Error('package smoke: npm pack returned no artifact')
  execFileSync('tar', ['-xzf', resolve(temporary, filename), '-C', temporary])

  const packageRoot = resolve(temporary, 'package')
  const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'))
  const changelog = await readFile(resolve(packageRoot, 'CHANGELOG.md'), 'utf8')
  if (!changelog.includes(`## [${String(manifest.version)}]`)) {
    throw new Error(`package smoke: CHANGELOG.md lacks release ${String(manifest.version)}`)
  }
  for (const section of ['peerDependencies', 'devDependencies']) {
    const entries = Object.entries(manifest[section] ?? {})
      .filter(([name]) => name.startsWith('@deepseek-ai/dsh-'))
    if (entries.length === 0) throw new Error(`package smoke: ${section} declares no DSH packages`)
    for (const [name, range] of entries) {
      if (RETIRED_DSH_PACKAGES.has(name)) {
        throw new Error(`package smoke: ${section}.${name} references a package retired by ${DSH_BASELINE}`)
      }
      const expectedRange = section === 'peerDependencies' ? DSH_PEER_RANGE : DSH_VERIFY_VERSION
      if (range !== expectedRange) {
        throw new Error(`package smoke: ${section}.${name} must be ${expectedRange}`)
      }
      const parsed = semver.validRange(String(range))
      const minimum = parsed === null ? null : semver.minVersion(parsed)
      if (parsed === null
        || minimum === null
        || !semver.satisfies(section === 'peerDependencies' ? DSH_BASELINE : DSH_VERIFY_VERSION, parsed)
        || (section === 'peerDependencies' && !semver.satisfies(DSH_SOURCE_VERSION, parsed))
        || semver.lt(minimum, DSH_BASELINE)) {
        throw new Error(`package smoke: ${section}.${name} must accept ${DSH_BASELINE} and exclude every earlier version`)
      }
    }
  }
  const coherentBaselines = [
    ['peerDependencies', '@deepseek-ai/cordis', `^${CORDIS_BASELINE}`],
    ['devDependencies', '@deepseek-ai/cordis', CORDIS_BASELINE],
    ['dependencies', '@deepseek-ai/schemastery', `^${SCHEMASTERY_BASELINE}`],
    ['peerDependencies', '@deepseek-ai/schemastery', `^${SCHEMASTERY_BASELINE}`],
    ['devDependencies', '@deepseek-ai/schemastery', SCHEMASTERY_BASELINE],
  ]
  for (const [section, name, expected] of coherentBaselines) {
    if (manifest[section]?.[name] !== expected) {
      throw new Error(`package smoke: ${section}.${name} must be ${expected}`)
    }
  }
  const clientInject = manifest.dsh?.client?.inject ?? []
  if (clientInject.some((name) => RETIRED_DSH_PACKAGES.has(name))) {
    throw new Error(`package smoke: dsh.client.inject references a package retired by ${DSH_BASELINE}`)
  }
  const lockfile = await readFile(resolve(sourceRoot, 'pnpm-lock.yaml'), 'utf8')
  const dshResolutions = resolvedDshPackages(lockfile)
  if (dshResolutions.length === 0 || dshResolutions.some(entry => entry.version !== DSH_VERIFY_VERSION)) {
    throw new Error('package smoke: pnpm-lock.yaml must resolve one coherent verified DSH graph')
  }
  const declaredDshNames = new Set(['peerDependencies', 'devDependencies']
    .flatMap((section) => Object.keys(manifest[section] ?? {}))
    .filter((name) => name.startsWith('@deepseek-ai/dsh-')))
  const highestDeclaredDshVersions = new Map()
  for (const { name, version } of dshResolutions) {
    if (!declaredDshNames.has(name) || semver.valid(version) === null) continue
    const current = highestDeclaredDshVersions.get(name)
    if (current === undefined || semver.gt(version, current)) highestDeclaredDshVersions.set(name, version)
  }
  const stale = [...declaredDshNames]
    .filter((name) => !highestDeclaredDshVersions.has(name)
      || highestDeclaredDshVersions.get(name) !== DSH_VERIFY_VERSION)
  if (stale.length > 0) {
    throw new Error(`package smoke: pnpm-lock.yaml resolves DSH below ${DSH_BASELINE}: ${stale.join(', ')}`)
  }
  const hostExports = ['.', './invariant']
  for (const key of hostExports) {
    const target = manifest.exports?.[key]?.default
    const types = manifest.exports?.[key]?.types
    if (typeof target !== 'string' || typeof types !== 'string') {
      throw new Error(`package smoke: incomplete export ${key}`)
    }
    const absolute = resolve(packageRoot, target)
    await access(absolute)
    await access(resolve(packageRoot, types))
    const loaded = await import(pathToFileURL(absolute).href)
    if (key === '.' && typeof loaded.apply !== 'function') throw new Error(`package smoke: ${key} has no apply export`)
  }

  const clientTarget = manifest.exports?.['./client']?.default
  const clientTypes = manifest.exports?.['./client']?.types
  if (typeof clientTarget !== 'string' || typeof clientTypes !== 'string') {
    throw new Error('package smoke: incomplete client export')
  }
  if (!clientTarget.endsWith('.cjs')) {
    throw new Error('package smoke: browser CommonJS bundle must use the .cjs extension')
  }
  await access(resolve(packageRoot, clientTypes))
  const client = await readFile(resolve(packageRoot, clientTarget), 'utf8')
  const requiredModules = new Set(
    [...client.matchAll(/\brequire\(\s*(['"])([^'"]+)\1\s*\)/gu)].map((match) => match[2]),
  )
  const unsupportedModules = [...requiredModules].filter((name) => !DSH_WEB_MODULE_TABLE.has(name))
  if (unsupportedModules.length > 0) {
    throw new Error(`package smoke: client bundle requires modules absent from the ${DSH_BASELINE} Web table: ${unsupportedModules.join(', ')}`)
  }
  for (const marker of [
    'window.__ModuleLoader__.load',
    '@deepseek-ai/dsh-client-store',
    'sidebar.settings',
    'settings.section.icon',
  ]) {
    if (!client.includes(marker)) throw new Error(`package smoke: client bundle lacks ${marker}`)
  }
  if (client.includes('@deepseek-ai/dsh-client-runtime')) {
    throw new Error('package smoke: client bundle requires retired @deepseek-ai/dsh-client-runtime')
  }

  const patch = await readFile(resolve(packageRoot, manifest.dsh?.bundle?.patch ?? ''), 'utf8')
  if (!patch.includes("name: 'dsh-ui-settings-icons'")) {
    throw new Error('package smoke: patch lacks dsh-ui-settings-icons')
  }

  console.log(`package smoke: ${filename} exposes Host, client, types, and bundle patch`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
