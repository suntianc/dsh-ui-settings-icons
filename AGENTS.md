# dsh-ui-settings-icons Agent Guide

This supplements any workspace-level guide. Repository: https://github.com/suntianc/dsh-ui-settings-icons.

## Native-slot migration (unreleased)

Contribute brand icons to the official `settings.section.icon` inline list slot. Do not replace `sidebar.settings`, disable `ui-settings-general`, redeclare the slot as keyed, or own welcome/permission/update logic. Preserve custom icons at default priority 0 ahead of this plugin's priority 100 fallbacks. Unknown sections retain official fallbacks.

Target isolated coherent graphs for DSH 0.2.2-rc.1 and 0.2.2-rc.3, Cordis 4.1.0 and Schemastery 3.19.0. Use exact tested DSH peers; default development target is rc.3. Keep retired dsh-client-runtime absent.

Run `pnpm run check` and source-artifact checks described in docs/dsh-source-verification.md. Report blocked checks honestly. Never claim offline renderer checks prove Windows/Electron or existing-profile migration. Do not alter live profiles. Preserve the full Host restart requirement pending explicit runtime validation.

This task does not authorize publishing or replying to issues. The package version remains unchanged until release preparation.
