import { Badge } from '../../components'
import type { BadgeColor, BadgeContent } from '../../components'
import type { BadgeBlock } from '../../types/screen'

export function BadgeBlock({ config }: { config: BadgeBlock }) {
  const { label, color = 'gray', content = 'text-only', icon } = config

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Badge color={color as BadgeColor} content={content as BadgeContent} icon={icon as any}>
      {label}
    </Badge>
  )
}
