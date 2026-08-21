import type { SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'className'> {
  size?: number | string | undefined
  className?: string | undefined
}
