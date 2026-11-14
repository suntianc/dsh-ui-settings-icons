# DSH Settings Icons

Brand icons for the native DeepSeek Harness settings navigation. The plugin contributes OpenAI and Antigravity icons without replacing the official settings panel, welcome flow, permissions, or desktop updater.

## Compatibility

Version **0.2.0** targets DSH **0.2.2-rc.1 and 0.2.2-rc.3**. Verification results and limitations are recorded in [source verification](docs/dsh-source-verification.md). Older DSH versions should retain their matching older plugin release.

Install `dsh-ui-settings-icons@0.2.0` for these DSH versions. Plugin Hub may defer newly published stable versions during its release-age window.

## Icons

- OpenAI: `codex-auth`, `codex`, `openai`
- Antigravity: `antigravity-auth`, `antigravity`, `gemini`

Unknown sections retain the official icon fallback. These contributions have priority `100`, so a section's own icon registered at the default priority `0` wins.

## Native custom icons

DSH 0.2.2 owns `settings.section.icon`, a list slot with inline rendering. Register an entry whose `id` matches its settings section, and use the supplied `size` and `active` props. Do not redeclare the old keyed slot or use `entryKey`.

```tsx
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { Context } from '@deepseek-ai/cordis'
import type { SettingsSectionIconOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'

export const inject = ['slots']
export function apply(ctx: Context) {
  ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
    name: 'settings.section.icon', id: 'my-plugin',
  }, ({ size, active }: SettingsSectionIconOwnerProps) => (
    <svg width={size} height={size} aria-hidden="true" opacity={active ? 1 : 0.7}>
      <circle cx={size / 2} cy={size / 2} r={size / 3} fill="currentColor" />
    </svg>
  )))
}
```

## Migration from the replacement-shell release

The old `0.1.4-rc.1` package replaced the `ui-settings-general` entry. This version instead inserts the independent `ui-settings-icons` entry and leaves the official settings plugin enabled. Keep a backup of your configuration, use a full Host restart, and inspect any manually persisted `ui-settings-general.disabled` override before upgrading. This plugin does not rewrite user configuration or migrate welcome acknowledgements automatically. macOS Web, native Desktop settings/channel/shortcut UI, and an isolated old-profile upgrade have passed. Windows is not tested. See the verification record for exact boundaries.

The old custom `SettingsRoot` export is removed; `OpenAIIcon`, `AntigravityIcon`, and `getDefaultNavIcon` remain available for consumers. The slot owner props are now the official DSH type.

## Development

```sh
pnpm install --frozen-lockfile
pnpm run check
```

See [source verification](docs/dsh-source-verification.md) for isolated rc.1/rc.3 checks. Nothing in these checks publishes a package or touches a live DSH profile.

[中文说明](README.zh.md) · [Changelog](CHANGELOG.md) · [MIT license](LICENSE)
