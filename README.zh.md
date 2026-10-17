# dsh-ui-settings-icons

> **桌面范围预发布 `0.1.4-rc.1`：** 仅限定 DSH `0.2.1-rc.1` / `0.2.1-rc.2`。变更本插件后必须完整重启 Host 并刷新客户端。Web 欢迎确认存在已知配置覆盖冲突，未通过验收。

[![npm version](https://img.shields.io/npm/v/dsh-ui-settings-icons.svg)](https://www.npmjs.com/package/dsh-ui-settings-icons)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

[English](README.md) | 中文

发布版本：**v0.1.4-rc.1**（npm 标签：`rc`）。桌面验证范围与已知 Web 限制见下文。

这是一个自包含的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 界面扩展插件。它为 DSH 的设置导航侧边栏增加了自定义图标能力，开放了全新的 keyed 图标槽位（`settings.section.icon`）供第三方插件使用，并为常见的扩展包内置了精美矢量图标预设。

## 0.1.4-rc.1：DSH 0.2.1 桌面范围预发布

开发依赖图为 DSH `0.2.1-rc.2`、Cordis `4.0.5`、Schemastery `3.18.5`。DSH peers 仅限定 `0.2.1-rc.1 || 0.2.1-rc.2`，不自动覆盖未来版本。

### 验证范围与已知 Web 限制

在 macOS Desktop `0.2.1-rc.2`（构建 `332895e`）上，现有已发布插件在完整冷启动后恢复 OpenAI/Antigravity 图标；官方卸载/重装对照恢复了原版本与配置，原生字号设置保存并在重启后保留。候选在独立 Chrome 中真实渲染完整 OpenAI SVG 与 Host 版本行。这些观察不等于候选全部原生桌面交互或原生更新器均已验收。

Web 预览说明的欢迎确认写入失败，错误为 `Configuration for "ui-settings-general" is overridden by a home patch or command-line overlay`：替换配置保留了两个同 ID 行，配置编辑器与 Loader 选中的行不一致。没有证据证明原因是未登录。桌面端原本不注册这一 Web 欢迎步骤。本次预发布接受该已知限制，不跳过确认、不绕过覆盖保护；Host API 对照仍验证真实 home/CLI 覆盖会被拒绝。


### 启用与完整重启要求

未修改的 DSH `0.2.1-rc.1` / `0.2.1-rc.2` Loader 在同一个条目 ID 更换包名时，可能继续保留旧 Host fiber 和浏览器 boot graph。因此，UI 插件开关显示启用不代表替代设置壳已经运行。安装、启用、停用或移除此替代壳后，请完整重启 DSH Host，再重新加载页面；Host graph 仍旧时，仅刷新页面无效。替代条目保留 `ui-settings-general` 命名空间，但这并未解决上述 Web 写入冲突。不要通过叠加第二个设置壳或随意改 ID 绕过生命周期问题。

客户端还改为从 boot manifest 读取当前 Host 版本，避免在浏览器访问 Node 的 `process`。真实 SlotCore/Renderer 测试覆盖 `codex-auth` 的 OpenAI 图标、keyed 覆盖与卸载回退，以及客户端卸载/重载。普通 `check` 明确跳过可选的 Host 热切回归；使用 `DSH_VERIFY_HOT_SWAP=1 pnpm test tests/host-patch.integration.spec.ts` 可复现未修 Loader 的失败。实验性 Loader 候选在审核中发现并发缺陷，不作为可用修复交付。本插件包不包含宿主补丁。

## 0.1.3-rc.2：适配 DSH 0.2.0-rc.1

此前发布版本更新了 DSH 依赖图，并跟随 0.2 版设置外壳的 Config Forms、共享快捷键、launcher 槽、模态层、引导状态、桌面更新提示与通用设置行。替代 Host 条目沿用 `ui-settings-general` ID，保留内置欢迎命名空间（Web 写入冲突见上文）；keyed 图标槽仍可使用。该历史版本的完整包检查与固定源码检查记录为通过；这些结果不证明本次预发布或真实 Web/Desktop profile 已通过验证。

## 0.1.3-rc.1：DSH 0.1.5-rc.1 适配

适配 DSH `0.1.5-rc.1`，同步上游设置按钮的本地化无障碍名称，包括仅显示图标的紧凑模式；中英文回归测试覆盖打开对话框与焦点恢复。

开发基线升级到 DSH `0.1.5-rc.1`，中英文自动重连文案与上游设置外壳对齐。图标槽位、对话框快捷键、焦点恢复与手动重连行为继续保留。

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

- 保留 DSH 设置面板结构与下列已测交互；真实浏览器视觉一致性仍需本机验收。
- 完整支持键盘快捷操作（`Escape` 键关闭并将焦点还原到触发按钮）、ARIA 对话框无障碍属性（`aria-modal`、`aria-labelledby`、`aria-current`）、侧边栏宽/窄展开自适应、当前连接恢复/重连反馈，以及原生配置文件打开操作（`settings.action` / `open-document`）。

### Cordis 配置组合与生命周期

- 通过 `cordis.patch.yml` 禁用原生壳并追加替代壳；同 ID 行导致上述已知 Web 配置写入限制。
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

- 开发目标：DeepSeek Harness `0.2.1-rc.2`（统一依赖图）。
- DSH peer 最低范围：`0.2.1-rc.1 || 0.2.1-rc.2`；Cordis `^4.0.5`、Schemastery `^3.18.5`。
- Node.js `^22.19.0` 或 `>=24.0.0`。

插件 `0.1.2` 及更早版本面向已退役的 DSH `0.1.1-rc.1` 客户端拓扑，无法在 `0.1.2-alpha.5` 上加载。

## 安装

桌面端通过官方插件管理器安装准确 npm 包 `dsh-ui-settings-icons@0.1.4-rc.1`。先通过正常退出任务守卫确认不会中断运行任务；安装、启用后完整退出并重开 Desktop，再刷新其他已连接客户端。只刷新页面无法修复旧 Host graph。

如果另行使用 CLI profile，请填写实际 profile 名称，不要默认是 `web`：

```sh
dsh --version
dsh plugin --profile <实际-profile> add dsh-ui-settings-icons@0.1.4-rc.1
dsh plugin --profile <实际-profile> list
```

`rc` 标签指向本预发布，`latest` 保持不变。Web 使用者应先了解欢迎确认限制；旧版或未验证的未来 DSH 请保留兼容插件版本。

## Host 配置

能力包 patch 替换了原版的 `ui-settings-general` 行：

| 行 | Export | 作用 |
|---|---|---|
| `ui-settings-general`（禁用） | `@deepseek-ai/dsh-client-ui-settings-general` | 禁用以避免子槽位重复声明冲突 |
| `ui-settings-general`（替代行） | `dsh-ui-settings-icons` | 增强版设置面板外壳，提供图标槽位与预设 |

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
