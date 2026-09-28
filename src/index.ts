import type { Context, Volatile } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

/** Welcome acknowledgement associated with this replacement shell's Config. */
export interface Config {
  welcomeNoticeVersion: Volatile<string | undefined>
}

export const Config = z.object({ welcomeNoticeVersion: z.string().volatile() })

/** Keep the replacement shell's internal preference out of the automatic form. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], child => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
  })
}
