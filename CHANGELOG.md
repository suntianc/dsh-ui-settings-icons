# Changelog

## [0.1.4-rc.1] - 2026-10-17

- Target DSH `0.2.1-rc.1` / `0.2.1-rc.2` explicitly with the coherent rc.2 development graph (Cordis 4.0.5, Schemastery 3.18.5).
- Read the running Host version from `__DSH_BOOT__.release` instead of the browser-undefined Node `process` global.
- Preserve the Host version-change refresh prompt, account/archive icons, Web/desktop shortcuts, modal classification and scrollable settings navigation; retain the keyed icon slot.
- Exercise real Loader/Include/boot-graph and SlotCore/Renderer behavior, exact OpenAI SVG, keyed overrides, unload/reload and emitted browser artifact.
- Desktop evidence: the existing npm package recovered icons after cold restart; official uninstall/reinstall contrast and stock-setting persistence were verified on macOS Desktop 0.2.1-rc.2/build 332895e. The candidate's OpenAI icon and version row rendered in isolated Chrome. Full native candidate/updater parity is not claimed.
- Known limitation accepted for this prerelease: Web welcome acknowledgement has a duplicate-ID/configuration-overlay conflict and did not pass acceptance. An authentication cause was not established. Desktop does not register that Web step.
- Known Host lifecycle limitation: installing/enabling/disabling/removing this replacement requires full Host restart and client refresh. Ordinary checks explicitly skip two opt-in hot-swap failures and the separately run production-artifact test; no Loader or configuration-protection patch is shipped.

## [0.1.3-rc.2] - 2026-09-28

- Align the plugin with DSH `0.2.0-rc.1`, including Config Forms, shared settings shortcut, launcher slot, modal layer, onboarding, desktop update status, and General rows.
- Keep the replacement Host entry at `ui-settings-general` so the stock welcome notice can persist its acknowledgement while preserving the keyed icon slot.
- Verify the complete package, source-artifact graph, and composed patch; a live Web/Desktop profile remains unverified.

## [0.1.3-rc.1] - 2026-09-10

- Targets DSH `0.1.5-rc.1` and synchronizes the upstream localized accessible name for the settings trigger, including icon-only compact mode. English and Chinese regression tests preserve dialog activation and focus restoration.
- Moves the development baseline to DSH `0.1.5-rc.1` and aligns the English and Chinese automatic reconnection labels with the upstream settings shell. Icon slots, dialog shortcuts, focus restoration, and manual reconnect remain available.

## [0.1.3-alpha.6] - 2026-09-07

- Add explicit DSH `0.1.3-alpha.1` source compatibility alongside the npm alpha.5 baseline; keep dependency graphs separate.
- Add reproducible isolated source-package checks and coherent lockfile validation.

## [0.1.3-alpha.5] - 2026-09-03

### Fixed

- Migrated the browser plugin from the retired `@deepseek-ai/dsh-client-runtime` package to the current Cordis context and `@deepseek-ai/dsh-client-store` module-table surface.
- Updated settings-document opening to the current typed `remote.settings.openSettingsDocument()` contract.
- Restored parity with the current settings shell for connection recovery status, reconnect actions, trigger focus restoration, and current elevation/geometry tokens.
- Raised the tested dependency graph to DSH `0.1.2-alpha.5`, Cordis `4.0.2`, and Schemastery `3.18.2`, with package smoke coverage preventing prerelease-range and retired-module regressions.
- Published the browser CommonJS artifact with the unambiguous `.cjs` extension so package tooling no longer interprets it as ESM.

## [0.1.2] - 2026-08-21

### Changed

- Raised the minimum DeepSeek Harness baseline to `0.1.1-rc.1` across peer dependencies, development dependencies, and bilingual requirements documentation.
- Updated packaged-artifact validation to require rc.1 for directly declared DSH packages while allowing legitimate older transitive snapshots embedded by upstream packages.

## [0.1.1] - 2026-08-21

### Fixed
- Registered Host-side `ui-onboarding` settings namespace schema to support saving the internal testing notice acknowledgement state.
- Fixed 6-petal SVG cutout coordinates in `OpenAIIcon` to eliminate solid black region.

## [0.1.0] - 2026-08-21

### Added
- Initial release of `dsh-ui-settings-icons`.
- Slot shadowing on `sidebar.settings` (`priority: -1`) to enhance DSH settings panel navigation.
- Keyed slot `settings.section.icon` allowing third-party plugins to register custom icons for `settings.section` entries.
- Built-in icon presets for OpenAI (`codex-auth`), Google Antigravity (`antigravity-auth`), Models (`models`), Agent Presets (`agent-presets`), and Plugins (`plugins`).
- Full compatibility with DSH settings shell behaviors (trigger, header actions, close button, onboarding steps, and accessibility).
