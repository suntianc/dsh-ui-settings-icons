# Changelog

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
