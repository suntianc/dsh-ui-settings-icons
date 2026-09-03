import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

/** Durable settings namespace for product-wide GUI onboarding facts. */
const ONBOARDING_SETTINGS_NAMESPACE = 'ui-onboarding'
const OnboardingSettingsSchema = z.object({ welcomeNoticeVersion: z.string() })

/** Register the durable GUI-onboarding section when a settings provider exists. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(ONBOARDING_SETTINGS_NAMESPACE, OnboardingSettingsSchema)
  })
}
