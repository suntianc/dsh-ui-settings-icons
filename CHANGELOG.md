# Changelog

All notable changes to this project will be documented in this file.

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
