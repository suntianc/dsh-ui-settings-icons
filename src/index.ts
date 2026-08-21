/**
 * Host-side Cordis plugin entry for dsh-ui-settings-icons.
 */
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const name = 'ui-settings-icons'

export function apply(_ctx: Context, _config?: Config): void {
  // Pure UI client extension; Host registration is a lifecycle no-op.
}
