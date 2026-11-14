# DSH Settings Icons

为 DeepSeek Harness 原生设置导航补充 OpenAI / Antigravity 图标，不再替换官方设置面板、欢迎流程、权限控制或桌面更新器。

## 兼容与发布状态

**0.2.0** 的兼容目标为 **DSH 0.2.2-rc.1 / 0.2.2-rc.3**。验证范围见 [源码验证记录](docs/dsh-source-verification.md)。旧 DSH 请保留对应旧插件版本。

这些 DSH 版本请安装 `dsh-ui-settings-icons@0.2.0`。Plugin Hub 可能因发布冷却窗口暂缓选用刚发布的正式版本。

## 行为

- OpenAI 图标对应 `codex-auth`、`codex`、`openai`。
- Antigravity 图标对应 `antigravity-auth`、`antigravity`、`gemini`。
- 其他栏目保留官方默认图标。
- 本插件优先级为 `100`，栏目自己的默认优先级 `0` 图标优先。

DSH 已原生拥有 `settings.section.icon`，其类型为 inline list，传入 `size`、`active`。自定义图标以栏目 ID 注册，不再声明 keyed slot 或使用 `entryKey`。示例见 [英文 README](README.md)。

## 从旧版迁移

旧 `0.1.4-rc.1` 替换了 `ui-settings-general`。新实现只插入独立的 `ui-settings-icons`，保留官方设置插件。升级前备份配置，使用完整 Host 重启，检查是否手动保留了 `ui-settings-general.disabled` 覆盖。插件不会自动改写现用配置或迁移欢迎确认记录。

旧 `SettingsRoot` 自定义壳导出移除；`OpenAIIcon`、`AntigravityIcon`、`getDefaultNavIcon` 保留。macOS Web、原生桌面设置/渠道/快捷键界面及隔离旧 profile 升级已通过；Windows 未实测。具体边界见验证记录。

## 开发

运行 `pnpm install --frozen-lockfile` 和 `pnpm run check`。源码双版本验证见 [验证文档](docs/dsh-source-verification.md)。检查不发布包，也不触碰现用 DSH profile。
