# dsh-ui-settings-icons

[![npm version](https://img.shields.io/npm/v/dsh-ui-settings-icons.svg)](https://www.npmjs.com/package/dsh-ui-settings-icons)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

English | [中文](README.zh.md)

Current release: **v0.1.0**

A self-contained [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) UI plugin that enhances the DSH Settings navigation sidebar with custom icon support. It opens a new keyed slot (`settings.section.icon`) for third-party plugins while providing built-in vector icons for known capability packages.

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
- Supports keyboard navigation (`Escape` closes dialog, focus traps), ARIA dialog attributes (`aria-modal`, `aria-labelledby`, `aria-current`), wide/compact sidebar trigger states, and the native configuration file launcher (`settings.action` / `open-document`).

### Zero-Conflict Cordis Composition

- Replaces the default `ui-settings-general` row via `cordis.patch.yml` to prevent duplicate slot declaration conflicts.
- Adheres strictly to DSH's pure lifecycle model: all child slots, dictionaries, and store subscriptions dispose cleanly upon plugin unload.

## Integrating Third-Party Icons

If you are developing a DSH plugin and want to supply a custom navigation icon for your settings section:

```tsx
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MyPluginIcon } from './MyPluginIcon.tsx'
import { MySettingsPanel } from './MySettingsPanel.tsx'

export function apply(ctx: ClientContext): void {
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

- DeepSeek Harness `0.1.1-rc.1` or a compatible later `0.1.x` release.
- Node.js `^22.19.0` or `>=24.0.0`.

## Install from npm (recommended)

The npm package includes prebuilt Host and browser bundles, so no install-time build permission is required:

```sh
dsh plugin --profile web add dsh-ui-settings-icons
```

Restart `dsh web`, open Settings, and enjoy customized section icons.

## Install a prebuilt release

```sh
dsh plugin --profile web add https://github.com/suntianc/dsh-ui-settings-icons/releases/download/v0.1.0/dsh-ui-settings-icons-0.1.0.tgz
```

Restart `dsh web` and open Settings.

## Install from GitHub source

```sh
dsh plugin --profile web add github:suntianc/dsh-ui-settings-icons
```

Git dependencies are built by the package's `prepare` script. pnpm 10+ blocks that script until explicitly allowed, so the first command may print an `allowBuilds` key and stop. Copy the **exact key printed by dsh** under `allowBuilds` in `~/.dsh/profiles/web/pnpm-workspace.yaml`, then run the command again. Only grant this permission after reviewing the source.

For a reproducible install, pin a release tag or commit:

```sh
dsh plugin --profile web add github:suntianc/dsh-ui-settings-icons#v0.1.0
```

## Install a tarball

```sh
git clone https://github.com/suntianc/dsh-ui-settings-icons.git
cd dsh-ui-settings-icons
pnpm install
pnpm pack
dsh plugin --profile web add ./dsh-ui-settings-icons-0.1.0.tgz
```

## Upgrade

Stop the running `dsh web` process and update the Web profile to the current release:

```sh
dsh plugin --profile web add dsh-ui-settings-icons@0.1.0
dsh plugin --profile web list
```

After the list reports `dsh-ui-settings-icons@0.1.0`, restart `dsh web` and refresh the browser.

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
- `lib/client.js` — Loader-compatible browser plugin with inline CSS Modules;
- `lib/types/**` — TypeScript declarations.

## Friendship links

- [L 站](https://linux.do/)
