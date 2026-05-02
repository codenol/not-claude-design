import { Button } from '../../components'
import type { ButtonSentiment, ButtonType, ButtonSize, ButtonIconPosition } from '../../components'
import type { ButtonBlock } from '../../types/screen'

export function ButtonBlock({ config }: { config: ButtonBlock }) {
  const {
    label,
    sentiment = 'accent',
    filled = true,
    outline = false,
    size = 'large',
    icon,
    iconPosition,
    disabled = false,
    state = 'default',
  } = config

  const type: ButtonType = filled ? 'filled' : outline ? 'outline' : 'ghost'

  let finalIconPosition: ButtonIconPosition = 'no-icon'
  if (iconPosition) {
    finalIconPosition = iconPosition
  } else if (icon && !label) {
    finalIconPosition = 'icon-only'
  } else if (icon) {
    finalIconPosition = 'left'
  }

  return (
    <Button
      type={type}
      sentiment={sentiment as ButtonSentiment}
      size={size as ButtonSize}
      iconPosition={finalIconPosition}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon={icon as any}
      disabled={disabled}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state={state as any}
    >
      {finalIconPosition !== 'icon-only' ? label : undefined}
    </Button>
  )
}
