# dsh-ui-settings-icons Agent Guide

This file supplements the workspace-level `AGENTS.md`. The workspace guide remains authoritative for shared plugin, Git, verification, and delivery rules.

## Project identity

- Command target: `dsh-ui-settings-icons`
- Local development root: `/Users/suntc/project/dsh-plugins/dsh-ui-settings-icons`
- Canonical Git origin: `git@github.com:suntianc/dsh-ui-settings-icons.git`
- GitHub repository: `https://github.com/suntianc/dsh-ui-settings-icons`
- Issue tracker: `https://github.com/suntianc/dsh-ui-settings-icons/issues`

## Overview and purpose

`dsh-ui-settings-icons` is a DeepSeek Harness (DSH) UI enhancement plugin that enhances the settings panel shell:
- Shadows `sidebar.settings` with a higher priority (`priority: -1`)
- Declares the `settings.section.icon` keyed slot to allow third-party plugins to provide custom icons for their `settings.section` entries
- Provides built-in icon fallbacks for well-known plugins (such as `codex-auth`, `antigravity-auth`)
- Preserves 100% of standard DSH settings shell behaviors (trigger button, connection recovery, header actions, close button, sections rendering, onboarding steps, modal shortcuts, and accessibility).

## Compatibility baseline

- Target and test against DSH `0.1.2-alpha.5`, Cordis `4.0.2`, and Schemastery `3.18.2` as one coherent dependency graph.
- Client code uses Cordis `Context`; `@deepseek-ai/dsh-client-runtime` is retired and must not reappear.
- Snapshot state uses the Web module-table surface `@deepseek-ai/dsh-client-store`, and settings document actions use `ctx.remote.settings.openSettingsDocument()`.
- Keep the enhanced settings shell synchronized with the current `@deepseek-ai/dsh-client-ui-settings-general` behavior while adding only the keyed icon slot/navigation rendering delta.

## Additional verified source target

DSH `0.1.3-alpha.1` at `d347e703908d0406b7a7ef80e3a0e594d86b2215` is verified through the isolated workflow in `docs/dsh-source-verification.md`. Keep the installable alpha.5 dev/lock baseline until the new npm family is available; peers explicitly include both targets. This is two separate coherent graphs, not permission to mix prereleases. Run both `pnpm run check` and the source check when changing compatibility-sensitive behavior.
