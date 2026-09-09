# dsh-ui-settings-icons

> **DSH 兼容性（未发布的开发版本）：** 当前检出版本以 `0.1.5-alpha.1` 为开发与最低支持基线，依赖图必须保持一致。已发布的 alpha.6 不包含本次适配；旧 DSH 用户继续使用旧插件版本。见[验证说明](docs/dsh-source-verification.md)。

[![npm version](https://img.shields.io/npm/v/dsh-ui-settings-icons.svg)](https://www.npmjs.com/package/dsh-ui-settings-icons)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

[English](README.md) | 中文

最近已发布版本：**v0.1.3-alpha.6**（适用于旧 DSH；本次适配尚未发布）。

这是一个自包含的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 界面扩展插件。它为 DSH 的设置导航侧边栏增加了自定义图标能力，开放了全新的 keyed 图标槽位（`settings.section.icon`）供第三方插件使用，并为常见的扩展包内置了精美矢量图标预设。

## 未发布：DSH 0.1.5 适配

开发基线升级到 DSH `0.1.5-alpha.1`，中英文自动重连文案与上游设置外壳对齐。图标槽位、对话框快捷键、焦点恢复与手动重连行为继续保留。

## 功能

### Keyed 图标槽位 (`settings.section.icon`)

- 在设置面板外壳下声明了全新的 keyed 子槽位 `settings.section.icon`。
- 任何通过 `settings.section` 注册设置分区的第三方插件，均可通过匹配自身分区的 `id` 注入自定义 SVG 或 React 图标组件。
- 响应式动态联动：图标更新深度绑定 SlotCore 账本，无需重启界面即可动态响应变化。

### 内置图标预设与优雅回退

- 为以下常见功能分区内置了精美的 16x16 矢量图标：
  - **`codex-auth`** / **GPT Auth**（OpenAI / ChatGPT 官方徽标）
  - **`antigravity-auth`**（Google Antigravity / Gemini 星芒徽标）
  - DSH 原生分区：**`models`**、**`agent-presets`**、**`plugins`**
- 当某个分区未提供自定义图标且不匹配任何预设时，自动回退到 DSH 标准齿轮图标（`IconSettingsOutline16`）。

### 完整的交互与无障碍对齐

- 与 DSH 官方默认设置面板保持 100% 的视觉风格和交互体验对齐。
- 完整支持键盘快捷操作（`Escape` 键关闭并将焦点还原到触发按钮）、ARIA 对话框无障碍属性（`aria-modal`、`aria-labelledby`、`aria-current`）、侧边栏宽/窄展开自适应、当前连接恢复/重连反馈，以及原生配置文件打开操作（`settings.action` / `open-document`）。

### 零冲突的 Cordis 插件组合

- 通过 `cordis.patch.yml` 替换官方默认的 `ui-settings-general`，彻底避免子槽位重复声明冲突。
- 严格遵循 DSH 的生命周期模型：所有子槽位、字典注册与状态订阅在插件卸载时均会干净释放。

## 接入第三方插件图标

如果你正在开发 DSH 插件，并希望为自己的设置分区提供专属导航图标：

```tsx
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from 'dsh-ui-settings-icons/client'
import { MyPluginIcon } from './MyPluginIcon.tsx'
import { MySettingsPanel } from './MySettingsPanel.tsx'

export function apply(ctx: Context): void {
  // 1. 注册设置分区主体内容
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'my-plugin',
    order: 50,
    label: () => 'My Plugin',
  }, MySettingsPanel))

  // 2. 注册导航图标（key 对应 settings.section 的 id）
  ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
    name: 'settings.section.icon',
    key: 'my-plugin',
  }, MyPluginIcon))
}
```

## 环境要求

- DeepSeek Harness `0.1.5-alpha.1`（统一依赖图）。
- Node.js `^22.19.0` 或 `>=24.0.0`。

插件 `0.1.2` 及更早版本面向已退役的 DSH `0.1.1-rc.1` 客户端拓扑，无法在 `0.1.2-alpha.5` 上加载。

## 安装本次开发适配

本次改动尚未发布到 npm，不能通过安装已发布的 `0.1.3-alpha.6` 获得。在本插件检出目录构建并打包：

```sh
pnpm install --frozen-lockfile
pnpm run check
npm pack
```

先停止 `dsh web`，将目标 Host 升级到 DSH `0.1.5-alpha.1`，再将上一步实际生成的本地制品安装到需要升级的 profile：

```sh
dsh --version
dsh plugin --profile web add ./dsh-ui-settings-icons-0.1.3-alpha.6.tgz
dsh plugin --profile web list
```

核对条目后重启 `dsh web` 并刷新浏览器。后续正式发布版本应使用其准确版本号；本次开发适配没有发布、修改现用 profile 或升级全局 DSH。旧 DSH 安装继续使用 [alpha.6 发布记录](https://github.com/suntianc/dsh-ui-settings-icons/releases)。

## Host 配置

能力包 patch 替换了原版的 `ui-settings-general` 行：

| 行 | Export | 作用 |
|---|---|---|
| `ui-settings-general`（禁用） | `@deepseek-ai/dsh-client-ui-settings-general` | 禁用以避免子槽位重复声明冲突 |
| `ui-settings-icons` | `dsh-ui-settings-icons` | 增强版设置面板外壳，提供图标槽位与预设 |

## 开发

```sh
pnpm install
pnpm run check
```

`pnpm run build` 生成：

- `lib/index.js`：Host 插件入口；
- `lib/invariant.js`：Slot 常量伴侣模块；
- `lib/client.cjs`：兼容 Loader、内联 CSS Modules 的浏览器插件；
- `lib/types/**`：类型声明。

## 友情链接

- [L 站](https://linux.do/)
