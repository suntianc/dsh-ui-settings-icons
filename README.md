# dsh-ui-settings-icons

> **Desktop-focused prerelease `0.1.4-rc.1`:** DSH `0.2.1-rc.1` / `0.2.1-rc.2` only. Fully restart the Host and reload the client after changing this plugin. The Web welcome acknowledgement has a known configuration conflict and has not passed acceptance.

[![npm version](https://img.shields.io/npm/v/dsh-ui-settings-icons.svg)](https://www.npmjs.com/package/dsh-ui-settings-icons)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

English | [中文](README.zh.md)

Release: **v0.1.4-rc.1** (npm tag: `rc`). Desktop verification and known Web limitations are described below.

A self-contained [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) UI plugin that enhances the DSH Settings navigation sidebar with custom icon support. It opens a new keyed slot (`settings.section.icon`) for third-party plugins while providing built-in vector icons for known capability packages.

## 0.1.4-rc.1: Desktop qualification for DSH 0.2.1

The development graph is DSH `0.2.1-rc.2`, Cordis `4.0.5`, and Schemastery `3.18.5`. DSH peers are restricted to `0.2.1-rc.1 || 0.2.1-rc.2`; future releases are not implicitly qualified.

### Verification scope and known Web limitation

On macOS Desktop `0.2.1-rc.2` (build `332895e`), the existing published plugin recovered OpenAI/Antigravity icons after a full cold restart. Official uninstall/reinstall contrast restored the original package/configuration; stock settings saved and retained a font-size change across restart. The release candidate rendered the full OpenAI SVG and Host version in an isolated Chrome session. These observations do not constitute a full native Desktop acceptance of every candidate interaction or native updater.

The Web preview welcome acknowledgement fails with `Configuration for "ui-settings-general" is overridden by a home patch or command-line overlay`: the replacement composition contains two same-ID rows and the configuration editor inspects a different row from the Loader. Authentication was not established as its cause. Desktop deliberately does not register this Web welcome step. This prerelease accepts the known limitation; it does not disable the confirmation or bypass configuration protection. Host API tests preserve real home/CLI overlay rejection.

### Activation and restart requirement

On the unmodified DSH `0.2.1-rc.1` / `0.2.1-rc.2` Loader, changing an existing entry's package name can leave its previous Host fiber and browser boot graph active. Therefore an enabled UI-plugin toggle alone does not establish that this replacement shell is running. After installing, enabling, disabling, or removing this replacement, fully restart the DSH Host and reload its page. A page refresh alone is insufficient when the Host graph is stale. The replacement keeps entry id `ui-settings-general`; this retains the namespace but does not resolve the Web write conflict described above. Do not work around the lifecycle problem by adding a second settings shell or renaming this entry.

The client also reads the current Host version from the boot manifest instead of accessing Node's `process` in the browser. Real SlotCore/Renderer tests cover the `codex-auth` OpenAI icon, keyed overrides and removal, and client unload/reload. The optional Host hot-swap regression is deliberately skipped by ordinary `check`; `DSH_VERIFY_HOT_SWAP=1 pnpm test tests/host-patch.integration.spec.ts` exposes the unmodified Loader failure. An experimental Loader candidate exposed concurrency defects during review and is not a recommended fix. No Host patch is included in this plugin package.

## 0.1.3-rc.2: DSH 0.2.0-rc.1 adaptation

This published release updated the DSH dependency graph and follows the 0.2 settings shell: Config Forms, the shared settings shortcut, launcher slot, modal layer, onboarding ownership, desktop update status, and General rows. The replacement Host entry uses `ui-settings-general` to retain the welcome namespace; the Web write conflict is documented above. The keyed icon slot remains available. Its recorded package and tagged-source checks passed; those results do not validate this prerelease or a live Web/Desktop profile.

## 0.1.3-rc.1: DSH 0.1.5-rc.1 adaptation

Targets DSH `0.1.5-rc.1` and synchronizes the upstream localized accessible name for the settings trigger, including icon-only compact mode. English and Chinese regression tests preserve dialog activation and focus restoration.

Moves the development baseline to DSH `0.1.5-rc.1` and aligns the English and Chinese automatic reconnection labels with the upstream settings shell. Icon slots, dialog shortcuts, focus restoration, and manual reconnect remain available.

## Features

### Keyed Icon Slot (`settings.section.icon`)

- Declares a new keyed child slot `settings.section.icon` under the settings shell.
- Any third-party plugin registering a settings section under `settings.section` can inject its own custom SVG or React icon component keyed by its section `id`.
- Dynamic slot reactivity: icon updates subscribe to the SlotCore ledger and re-render without restarting the web interface.

### Built-in Icon Presets and Fallbacks

- Ships with tailored 16x16 vector icons for:
  - **`codex-auth`** / **GPT Auth** (OpenAI / ChatGPT logo)
  - **`antigravity-auth`** (Google Antigravity / Gemini spark logo)
  - Stock DSH sections: **`models`**, **`agent-presets`**, **`plugins`**
- Gracefully falls back to DSH's standard gear icon (`IconSettingsOutline16`) when a section provides no custom icon and matches no preset.

### Full Chrome and Accessibility Parity

- Preserves the DSH settings shell structure and the tested interactions below. Browser visual parity still requires local acceptance.
- Supports keyboard navigation (`Escape` closes the dialog and restores trigger focus), ARIA dialog attributes (`aria-modal`, `aria-labelledby`, `aria-current`), wide/compact sidebar trigger states, current connection recovery/reconnect feedback, and the native configuration file launcher (`settings.action` / `open-document`).

### Cordis composition and lifecycle

- Disables the stock shell and appends its replacement through `cordis.patch.yml`. The duplicate entry ID causes the documented Web configuration-write limitation.
- Adheres strictly to DSH's pure lifecycle model: all child slots, dictionaries, and store subscriptions dispose cleanly upon plugin unload.

## Integrating Third-Party Icons

If you are developing a DSH plugin and want to supply a custom navigation icon for your settings section:

```tsx
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from 'dsh-ui-settings-icons/client'
import { MyPluginIcon } from './MyPluginIcon.tsx'
import { MySettingsPanel } from './MySettingsPanel.tsx'

export function apply(ctx: Context): void {
  // 1. Register your settings section body
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'my-plugin',
    order: 50,
    label: () => 'My Plugin',
  }, MySettingsPanel))

  // 2. Register your custom navigation icon (key matching section id)
  ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
    name: 'settings.section.icon',
    key: 'my-plugin',
  }, MyPluginIcon))
}
```

## Requirements

- Development target: DeepSeek Harness `0.2.1-rc.2` with a coherent dependency graph.
- Qualified DSH peers: `0.2.1-rc.1 || 0.2.1-rc.2`; Cordis `^4.0.5` and Schemastery `^3.18.5`.
- Node.js `^22.19.0` or `>=24.0.0`.

Plugin versions through `0.1.2` target the retired DSH `0.1.1-rc.1` client topology and do not load on `0.1.2-alpha.5`.

## Install

For Desktop, use the official plugin manager and the exact npm specification `dsh-ui-settings-icons@0.1.4-rc.1`. Quit through the normal task guard first and avoid interrupting running work. After installation/enabling, fully quit and reopen Desktop and reload any connected clients. A page refresh alone does not repair a stale Host graph.

For a separately chosen CLI profile, use the actual profile name rather than assuming it is `web`:

```sh
dsh --version
dsh plugin --profile <actual-profile> add dsh-ui-settings-icons@0.1.4-rc.1
dsh plugin --profile <actual-profile> list
```

The `rc` tag selects this prerelease; `latest` remains unchanged. Review the known Web welcome limitation before using it on Web. Older or future unqualified DSH Hosts should retain a compatible plugin version.

## Host configuration

The bundle patch replaces the stock `ui-settings-general` row:

| Row | Export | Purpose |
|---|---|---|
| `ui-settings-general` (disabled) | `@deepseek-ai/dsh-client-ui-settings-general` | Disabled to avoid slot declaration collision |
| `ui-settings-general` (replacement) | `dsh-ui-settings-icons` | Enhanced settings shell with icon slot and presets |

## Development

```sh
pnpm install
pnpm run check
```

`pnpm run build` emits:

- `lib/index.js` — Host plugin entry point;
- `lib/invariant.js` — Slot constants companion;
- `lib/client.cjs` — Loader-compatible browser plugin with inline CSS Modules;
- `lib/types/**` — TypeScript declarations.

## Friendship links

- [L 站](https://linux.do/)
