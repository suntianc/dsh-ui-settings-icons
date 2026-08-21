import type { ReactElement } from 'react'
import {
  IconAgentPresetOutline16,
  IconDataOutline16,
  IconPersonalizationOutline16,
  IconSettingsOutline16,
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
    return <IconDataOutline16 {...iconProps} />
  }
  if (id === 'agent-presets') {
    return <IconAgentPresetOutline16 {...iconProps} />
  }
  if (id === 'plugins') {
    return <IconPersonalizationOutline16 {...iconProps} />
  }
  return <IconSettingsOutline16 {...iconProps} />
}
