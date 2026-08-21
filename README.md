# dsh-ui-settings-icons

DeepSeek Harness (DSH) UI enhancement plugin providing customizable icons and a keyed icon slot for settings sections.

## Features

- **Keyed Icon Slot (`settings.section.icon`)**: Allows any DSH plugin to contribute custom icons for its `settings.section` entries.
- **Built-in Icon Presets**: Built-in fallback icons for well-known plugins (OpenAI / Codex, Google Antigravity) and core pages (Models, Agent Presets, Plugins, General).
- **Non-invasive & Backward-Compatible**: Seamlessly falls back to default settings gear icon for sections without an icon. Plugins can register icons without hard dependencies on this package.

## Third-party Plugin Integration

In your plugin's client entry point:

```tsx
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { OpenAIIcon } from './OpenAIIcon.tsx'

export function apply(ctx: ClientContext): void {
  // 1. Register your settings section
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'codex-auth',
    order: 20,
    label: () => 'GPT Auth',
  }, CodexCapabilitySettings))

  // 2. Register your custom icon (keyed by the section id)
  ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
    name: 'settings.section.icon',
    key: 'codex-auth',
  }, OpenAIIcon))
}
```

## License

[MIT](./LICENSE)
