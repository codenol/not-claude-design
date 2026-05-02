import { Input } from '../../components'
import type { InputState, InputIconPosition } from '../../components'
import type { InputBlock } from '../../types/screen'

export function InputBlock({ config }: { config: InputBlock }) {
  const {
    placeholder = 'Input',
    state = 'default',
    label,
    hint,
    icon,
    iconPosition,
    inputType = 'text',
    value,
  } = config

  return (
    <Input
      placeholder={placeholder}
      state={state as InputState}
      label={label}
      hint={hint}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon={icon as any}
      iconPosition={iconPosition as InputIconPosition}
      type={inputType}
      defaultValue={value}
    />
  )
}
