# Changelog

All notable changes to this project will be documented in this file.

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
