# dsh-ui-settings-icons

> **DSH compatibility (unreleased development):** This checkout targets `0.1.5-alpha.1` as its development and minimum supported baseline, with a coherent dependency graph. Published alpha.6 packages do not include this adaptation; keep older plugin releases for older DSH Hosts. See [verification](docs/dsh-source-verification.md).

[![npm version](https://img.shields.io/npm/v/dsh-ui-settings-icons.svg)](https://www.npmjs.com/package/dsh-ui-settings-icons)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

English | [中文](README.zh.md)

Latest published release: **v0.1.3-alpha.6** (for older DSH; this adaptation is not published).

A self-contained [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) UI plugin that enhances the DSH Settings navigation sidebar with custom icon support. It opens a new keyed slot (`settings.section.icon`) for third-party plugins while providing built-in vector icons for known capability packages.

## Unreleased: DSH 0.1.5 adaptation

Moves the development baseline to DSH `0.1.5-alpha.1` and aligns the English and Chinese automatic reconnection labels with the upstream settings shell. Icon slots, dialog shortcuts, focus restoration, and manual reconnect remain available.

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

- Retains 100% feature and visual parity with DSH's default settings shell.
- Supports keyboard navigation (`Escape` closes the dialog and restores trigger focus), ARIA dialog attributes (`aria-modal`, `aria-labelledby`, `aria-current`), wide/compact sidebar trigger states, current connection recovery/reconnect feedback, and the native configuration file launcher (`settings.action` / `open-document`).

### Zero-Conflict Cordis Composition

- Replaces the default `ui-settings-general` row via `cordis.patch.yml` to prevent duplicate slot declaration conflicts.
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

- DeepSeek Harness `0.1.5-alpha.1` (tested coherent dependency graph).
- Node.js `^22.19.0` or `>=24.0.0`.

Plugin versions through `0.1.2` target the retired DSH `0.1.1-rc.1` client topology and do not load on `0.1.2-alpha.5`.

## Install this development adaptation

This change is not published to npm; installing the published `0.1.3-alpha.6` does not obtain it. Build and pack from this plugin checkout:

```sh
pnpm install --frozen-lockfile
pnpm run check
npm pack
```

Stop `dsh web`, upgrade the target Host to DSH `0.1.5-alpha.1`, then install the local artifact produced above into the profile you intend to upgrade:

```sh
dsh --version
dsh plugin --profile web add ./dsh-ui-settings-icons-0.1.3-alpha.6.tgz
dsh plugin --profile web list
```

Verify the entry, restart `dsh web`, and refresh the browser. Use the exact new version after a formal release. This development adaptation does not itself publish, edit a live profile, or upgrade global DSH. Older DSH installations can retain the [alpha.6 release](https://github.com/suntianc/dsh-ui-settings-icons/releases).

## Host configuration

The bundle patch replaces the stock `ui-settings-general` row:

| Row | Export | Purpose |
|---|---|---|
| `ui-settings-general` (disabled) | `@deepseek-ai/dsh-client-ui-settings-general` | Disabled to avoid slot declaration collision |
| `ui-settings-icons` | `dsh-ui-settings-icons` | Enhanced settings shell with icon slot and presets |

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
