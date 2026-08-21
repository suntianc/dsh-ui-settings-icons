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
- Preserves 100% of standard DSH settings shell behaviors (trigger button, header actions, close button, sections rendering, onboarding steps, modal shortcuts, and accessibility).
