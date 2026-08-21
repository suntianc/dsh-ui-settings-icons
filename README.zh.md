# dsh-ui-settings-icons

[![npm version](https://img.shields.io/npm/v/dsh-ui-settings-icons.svg)](https://www.npmjs.com/package/dsh-ui-settings-icons)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

[English](README.md) | 中文

当前版本：**v0.1.0**

这是一个自包含的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 界面扩展插件。它为 DSH 的设置导航侧边栏增加了自定义图标能力，开放了全新的 keyed 图标槽位（`settings.section.icon`）供第三方插件使用，并为常见的扩展包内置了精美矢量图标预设。

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
- 完整支持键盘快捷操作（`Escape` 键关闭、焦点捕获）、ARIA 对话框无障碍属性（`aria-modal`、`aria-labelledby`、`aria-current`）、侧边栏宽/窄展开自适应，以及原生配置文件打开操作（`settings.action` / `open-document`）。

### 零冲突的 Cordis 插件组合

- 通过 `cordis.patch.yml` 替换官方默认的 `ui-settings-general`，彻底避免子槽位重复声明冲突。
- 严格遵循 DSH 的生命周期模型：所有子槽位、字典注册与状态订阅在插件卸载时均会干净释放。

## 接入第三方插件图标

如果你正在开发 DSH 插件，并希望为自己的设置分区提供专属导航图标：

```tsx
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MyPluginIcon } from './MyPluginIcon.tsx'
import { MySettingsPanel } from './MySettingsPanel.tsx'

export function apply(ctx: ClientContext): void {
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

- DeepSeek Harness `0.1.0-rc.7` 或兼容的后续 `0.1.x` 版本。
- Node.js `^22.19.0` 或 `>=24.0.0`。

## 从 npm 安装（推荐）

npm 包已包含预构建的 Host 与浏览器 bundle，不需要安装期构建权限：

```sh
dsh plugin --profile web add dsh-ui-settings-icons
```

重启 `dsh web`，打开设置即可体验自定义图标。

## 安装预构建 Release

```sh
dsh plugin --profile web add https://github.com/suntianc/dsh-ui-settings-icons/releases/download/v0.1.0/dsh-ui-settings-icons-0.1.0.tgz
```

重启 `dsh web` 并打开设置。

## 从 GitHub 源码安装

```sh
dsh plugin --profile web add github:suntianc/dsh-ui-settings-icons
```

Git 依赖会通过包内 `prepare` 脚本从源码构建。pnpm 10+ 默认阻止该脚本，因此第一次安装可能打印 `allowBuilds` 键并停止。把 **dsh 输出的完整键** 加到 `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `allowBuilds` 下，再重新执行安装。只应在审查并信任源码后授权。

需要可复现安装时，固定 release tag 或 commit：

```sh
dsh plugin --profile web add github:suntianc/dsh-ui-settings-icons#v0.1.0
```

## 从 tarball 安装

```sh
git clone https://github.com/suntianc/dsh-ui-settings-icons.git
cd dsh-ui-settings-icons
pnpm install
pnpm pack
dsh plugin --profile web add ./dsh-ui-settings-icons-0.1.0.tgz
```

## 升级

先停止正在运行的 `dsh web`，再将 Web Profile 更新到当前版本：

```sh
dsh plugin --profile web add dsh-ui-settings-icons@0.1.0
dsh plugin --profile web list
```

列表显示 `dsh-ui-settings-icons@0.1.0` 后，重新启动 `dsh web` 并刷新浏览器。

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
- `lib/client.js`：兼容 Loader、内联 CSS Modules 的浏览器插件；
- `lib/types/**`：类型声明。

## 友情链接

- [L 站](https://linux.do/)
