# Native icon compatibility verification

## Unreleased target

The migration targets the official native `settings.section.icon` inline list slot in:

| DSH | Official source commit |
| --- | --- |
| 0.2.2-rc.1 | 66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db |
| 0.2.2-rc.3 | 38a6a5c965aa99ab525161efb7cc5cf1fe62fced |

Default development graph: rc.3, Cordis 4.1.0, Schemastery 3.19.0. The peer range intentionally names only the two targeted releases. Test-only renderer dependencies are not plugin runtime dependencies.

## Registry checks

```sh
pnpm install --frozen-lockfile
pnpm run check
```

`check` runs peer validation, lint, typecheck, real renderer/SlotCore tests, Host Loader/Include composition, build, emitted browser bundle execution, packed artifact smoke, and publint. The ordinary test run skips the built-bundle case; `test:bundle` executes it after build.

## Matching-source checks

Build each official tag in its own scratch checkout. Never mix versions or use a live DSH profile:

```sh
git clone --depth 1 --branch dsh-v0.2.2-rc.3 https://github.com/deepseek-ai/deepseek-harness.git harness-rc3
cd harness-rc3
git rev-parse HEAD # compare with the table above
pnpm install --frozen-lockfile --ignore-scripts
pnpm run build:lib
pnpm --filter './packages/**' --filter './vendor/*' -r pack --pack-destination ../rc3-packages
# From the plugin checkout:
DSH_VERIFY_VERSION=0.2.2-rc.3 pnpm run check:dsh-source -- /absolute/path/to/rc3-packages
```

Repeat independently for `dsh-v0.2.2-rc.1`, a separate artifact directory and `DSH_VERIFY_VERSION=0.2.2-rc.1`.

The source check copies the plugin into a temporary directory, rejects mixed DSH versions, overrides the complete dependency closure with supplied artifacts, records their hashes, and runs the complete plugin check. The fixed source checkout establishes provenance; hashes identify bytes, not authenticity by themselves.

## Evidence boundaries

This document describes the required checks, not a claim that every check has passed. Preserve the actual logs and report completed, failed and blocked stages separately.

Renderer tests cover ID matching, native size/active props, priority fallback, late slot declaration, unloading/reloading, and the browser factory without Node globals. Host composition checks preserve the official settings entry and its welcome configuration during a fresh patch assembly.

These are not Windows/Electron visual tests and do not establish migration of a previously modified user profile. Before release, check a clean rc.1/rc.3 installation and an old-plugin upgrade with a full Host restart. Confirm official settings permission gating, welcome acknowledgement, shortcuts, update indicators and rc.3 channel selection remain intact. Any persistent manual `ui-settings-general.disabled` override must be inspected explicitly; this plugin never edits it automatically.

## 2026-11-14 registry validation

The migrated source passed the complete `pnpm run check` independently against both rc.1 and rc.3 registry graphs: peer validation, lint, typecheck, 6 ordinary tests, one separately executed emitted-bundle test, build, packed artifact smoke and publint. The ordinary suite's single skip is the bundle test executed by the next phase. rc.1 emitted missing upstream sourcemap warnings, not test failures.

The manifest's client injection dependencies are also checked to expose actual client plugin metadata/exports, rather than naming pure shared libraries. Host-range smoke mirrors `includePrerelease: true` and rejects unverified releases.

Source-build and Windows/Electron acceptance are separate from these completed registry checks. No package was published and no existing profile was modified.

## 2026-11-14 macOS acceptance

On macOS, both fixed official source revisions above passed frozen install and the original complete `build:lib`, without source modifications. The resulting 381 rc.1 and 383 rc.3 source packages each passed the plugin's complete source-artifact gate. The candidate also passed the registry `check` on the Mac.

Isolated real Web instances of rc.1 and rc.3 accepted the candidate without compatibility exemptions. Both rendered OpenAI and Antigravity icons for test-only section registrations and retained the stock unknown-section fallback. The official settings shell and General controls remained present; section switching and Close worked in rc.3. Welcome acknowledgement saved successfully.

Upgrade acceptance used a disposable profile, not the owner's active profile: published plugin 0.1.4-rc.1 on DSH 0.2.1-rc.2 reproduced its known welcome-save error. Updating that same profile to 0.2.0 and DSH 0.2.2-rc.1 restored the official settings entry, removed the old bundle's disabled/replacement entries, and allowed welcome acknowledgement to save. A subsequent full Host restart retained the acknowledgement. No user-layer disabled override was present in this test. Manually persisted overrides remain a separate migration condition and are never silently rewritten.

An isolated rc.3 Electron process accepted and booted the candidate, using separate DSH_HOME and Electron user-data directories. Its native UI was **not** validated: the available app selector resolved the owner's other running instance, which was left untouched. Desktop update/channel UI, native shortcuts, restricted-client permission gating, Windows, and real provider login remain unverified. Browser acceptance does not establish those surfaces. No publication is implied by these records.

### Native Desktop follow-up

With the owner's authorization, 0.2.0 was temporarily installed in the existing macOS Desktop rc.3 profile after backing up its package and configuration files. After a normal quit/restart, the plugin manager showed v0.2.0 enabled and its component running. The official settings and General controls rendered; the update-channel menu retained its current selection and exposed both channels without changing it. The shortcut editor opened and closed, and Command-comma reopened Settings. No preferences, channels, credentials or conversations were changed. The candidate was then removed, all five backed-up profile metadata files matched their original SHA-256 hashes, and the original conversation reopened normally.

This closes the earlier native-window selection limitation for settings/channel/shortcut coexistence. It does not claim a real updater download/install, restricted-client permission scenario, Windows test, or provider login. Brand icon visuals were independently tested in the real rc.1/rc.3 Web instances using test-only section registrations, not by installing unrelated auth plugins in the owner's profile. Final version 0.2.0 also passed both complete source-artifact checks and the Mac registry check.
