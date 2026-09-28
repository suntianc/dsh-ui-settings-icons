import type { ReactElement } from 'react'
import {
  IconAgentPresetOutlineMedium,
  IconDataOutlineMedium,
  IconPersonalizationOutlineMedium,
  IconSettingsOutlineMedium,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { OpenAIIcon } from './OpenAIIcon.tsx'
import { AntigravityIcon } from './AntigravityIcon.tsx'

/**
 * Built-in default navigation icon resolver by section id.
 */
export function getDefaultNavIcon(id: string, className?: string | undefined): ReactElement {
  const iconProps = className !== undefined ? { size: 16, className } : { size: 16 }
  if (id === 'codex-auth' || id === 'codex' || id === 'openai') {
    return <OpenAIIcon {...iconProps} />
  }
  if (id === 'antigravity-auth' || id === 'antigravity' || id === 'gemini') {
    return <AntigravityIcon {...iconProps} />
  }
  if (id === 'models') {
    return <IconDataOutlineMedium {...iconProps} />
  }
  if (id === 'agent-presets') {
    return <IconAgentPresetOutlineMedium {...iconProps} />
  }
  if (id === 'plugins') {
    return <IconPersonalizationOutlineMedium {...iconProps} />
  }
  return <IconSettingsOutlineMedium {...iconProps} />
}
