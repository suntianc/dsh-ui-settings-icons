import { createElement } from 'react'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { Context } from '@deepseek-ai/cordis'
import type { SettingsSectionIconOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import { OpenAIIcon } from './icons/OpenAIIcon.tsx'
import { AntigravityIcon } from './icons/AntigravityIcon.tsx'

export { OpenAIIcon } from './icons/OpenAIIcon.tsx'
export { AntigravityIcon } from './icons/AntigravityIcon.tsx'
export { getDefaultNavIcon } from './icons/default-icons.tsx'
export type { SettingsSectionIconOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
export const inject = ['slots']

/** Contribute fallback brand icons without replacing the official settings shell. */
export function apply(ctx: Context): void {
  ctx.slots.inject('settings.section.icon', () => {
    const disposers = [
      ...['codex-auth', 'codex', 'openai'].map(id => [id, OpenAIIcon] as const),
      ...['antigravity-auth', 'antigravity', 'gemini'].map(id => [id, AntigravityIcon] as const),
    ].map(([id, Icon]) => ctx.slots.register({
      name: 'settings.section.icon', id, priority: 100,
    }, ({ size }: SettingsSectionIconOwnerProps) => createElement(Icon, { size, 'aria-hidden': true })))
    return () => { for (const dispose of disposers) dispose() }
  })
}
