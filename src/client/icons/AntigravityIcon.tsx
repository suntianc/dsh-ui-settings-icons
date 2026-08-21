import type { ReactElement } from 'react'
import type { IconProps } from './props.ts'

/**
 * 16x16 Antigravity / AI vector icon styled for DSH sidebar navigation.
 */
export function AntigravityIcon({ size = 16, className, ...props }: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
    </svg>
  )
}
