# dsh-ui-settings-icons

DeepSeek Harness (DSH) 设置面板图标与导航扩展插件。

## 功能特性

- **Keyed Icon Slot (`settings.section.icon`)**：开放图标槽位，允许任意 DSH 插件为主设置项（`settings.section`）主动注入并展示自定义 Icon。
- **内置预设图标**：内置常用三方插件（OpenAI / Codex、Google Antigravity）与 DSH 核心页面（模型、Agent 预设、插件、通用）的精美矢量图标。
- **无侵入与向下兼容**：若未注册自定义图标，自动优雅回退到内置预设或默认齿轮图标；三方插件无需硬依赖此包即可使用声明式注入。

## 三方插件接入方式

在插件的客户端入口（`src/client/index.ts`）中：

```tsx
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { OpenAIIcon } from './OpenAIIcon.tsx'

export function apply(ctx: ClientContext): void {
  // 1. 注册设置页面
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'codex-auth',
    order: 20,
    label: () => 'GPT Auth',
  }, CodexCapabilitySettings))

  // 2. 注册自定义图标（key 为对应 section 的 id）
  ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
    name: 'settings.section.icon',
    key: 'codex-auth',
  }, OpenAIIcon))
}
```

## 许可证

[MIT](./LICENSE)
