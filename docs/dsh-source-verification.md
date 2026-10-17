# DSH source compatibility verification

This checkout targets the published DSH `0.2.1-rc.2` graph and its matching
source tag at `687f282e8625c6b8d11ff58211a90524be2e4317`. Development dependencies,
the lockfile, and default package smoke checks use this exact target, together
with Cordis `4.0.5` and Schemastery `3.18.5`. DSH peer ranges retain the minimum
`0.2.1-rc.1 || 0.2.1-rc.2`. Full plugin checks were also run against separately built official
rc.1 source artifacts at `1600d8a1e140dcde43a1a0941940a0480712c011`.
This is the Desktop-focused `0.1.4-rc.1` prerelease. Web welcome confirmation remains a known failed acceptance surface; successful offline/source checks do not override that limitation. Earlier source-artifact logs qualify the unchanged runtime changes; the final version must also pass its release gates.

## Runtime-backed test dependencies

The integration tests load the real DSH store, SlotCore, renderer, and Cordis
Loader rather than replacing them with local mocks. Some browser-library npm
artifacts declare their runtime imports only as development dependencies because
the DSH Web host supplies them. This plugin therefore supplies those imports as
explicit **test development dependencies**, using the official rc.2 lockfile
versions (including Zustand `4.5.7`, Immer `10.2.0`, Shiki `4.4.3`, and KaTeX
`0.18.7`). They do not become plugin runtime dependencies. The retired, unused
`@deepseek-ai/dsh-invariants` declaration is removed rather than mixed into the
new graph.

## Build the official artifacts once

Use a separate scratch directory, outside any plugin or live DSH installation:

```sh
git clone --depth 1 --branch dsh-v0.2.1-rc.2 https://github.com/deepseek-ai/deepseek-harness.git harness
cd harness
git rev-parse HEAD
# Must be 687f282e8625c6b8d11ff58211a90524be2e4317.
PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm install --frozen-lockfile --ignore-scripts
pnpm run build:lib
pnpm --filter './packages/**' --filter './vendor/*' -r pack --pack-destination ../dsh-packages
```

The Host and Client library build is required. Packing does not publish anything.
The resulting directory can be reused for isolated plugin checks.

## Check this plugin

From this plugin's own repository:

```sh
PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm install --frozen-lockfile
PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm run check
PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm run check:dsh-source -- /absolute/path/to/dsh-packages
```

The temporary `PNPM_CONFIG_MINIMUM_RELEASE_AGE=0` override permits verifying
the newly published release before the configured registry age window expires;
it does not change the workspace policy.

The source check copies the current plugin into a new temporary directory,
reads the supplied tarball manifests, rejects mixed DSH versions, explicitly
supplies the complete DSH dependency/peer closure, and pins pi-ai to the plugin's
development version when present. It installs that isolated graph and runs
`pnpm peers check` followed by the unmodified `pnpm run check` command.

The runner leaves the verification directory and `artifacts.json` with SHA-512
checksums for review. The fixed-tag build recipe establishes provenance; the
runner identifies the supplied bytes and checks their versions, and does not
claim to authenticate arbitrary user-supplied tarballs. Its local file overrides
and generated lockfile stay in the temporary directory. They never enter this
repository, an installed package, or a user profile.

Package smoke checks accept both registry and source-artifact lock identities
while continuing to verify the selected version. The registry graph targets `0.2.1-rc.2`; source checks default to that target. To verify rc.1, build its official `dsh-v0.2.1-rc.1` tag in a separate checkout and pack into a separate directory, then run:

```sh
DSH_VERIFY_VERSION=0.2.1-rc.1 pnpm run check:dsh-source -- /absolute/path/to/rc1-packages
```

Do not mix rc.1 and rc.2 tarballs. Both source graphs passed the full plugin check on 2026-10-17. The normal suite reports 29 passed / 3 skipped: the two known Host hot-replacement regressions and the emitted-bundle case gated to run after build. `test:bundle` separately runs and passes that emitted-bundle case.

## 中文说明

当前检出版本以已发布的 DSH `0.2.1-rc.2`、Cordis `4.0.5` 与
Schemastery `3.18.5` 为开发及默认验证目标。peer 最低范围保留
`0.2.1-rc.1 || 0.2.1-rc.2`；rc.1 与 rc.2 已分别使用固定官方 tag 的源码制品通过完整插件检查。此次 `0.1.4-rc.1` 为桌面范围预发布；Web 欢迎确认的配置覆盖冲突未通过验收，完整 Host 重启要求仍保留。旧 DSH
请保留兼容的旧插件版本。

按上面的固定 tag 构建、打包一次，然后在本插件目录运行
`pnpm run check:dsh-source -- /绝对路径/dsh-packages`。脚本在临时目录内安装
完整源码包图并运行全部检查，输出位置和制品哈希供复核。正式 package.json
和锁文件不会写入本机临时路径，也不会安装到现用 profile。

升级验证覆盖离线类型检查、测试、构建、打包 smoke 和 publint；
真实 OAuth、私有服务请求和用户现用 profile 不属于这些离线检查的证明范围。

## Evidence boundaries

Ordinary `check` runs the cold Host composition test and source-renderer tests, then builds and executes the emitted client factory in a browser-only VM scope with the real renderer. This catches accidental Node globals without claiming a visual browser run. Two optional hot-swap tests are skipped unless `DSH_VERIFY_HOT_SWAP=1`; the unmodified 1.0.6 Loader fails them because package-name replacement does not remount the old fiber. Keep those failures separate from the plugin's checks. An experimental upstream Loader patch exposed further concurrency defects during review and is not a recommended or included runtime fix. The plugin workflow relies on a full Host restart, not that candidate.

The cloud Chromium attempt was blocked by its sandbox before a page opened; no visual screenshot or macOS/Electron validation is claimed. Local acceptance should first inspect the actual installed package, Host entry and boot roster, then test a full Host restart before considering any configuration or runtime change.
