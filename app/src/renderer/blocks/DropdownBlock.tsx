import { Dropdown } from '../../components'
import type { DropdownState, DropdownOption } from '../../components'
import type { DropdownBlock } from '../../types/screen'

export function DropdownBlock({ config }: { config: DropdownBlock }) {
  const {
    placeholder = 'Select...',
    state = 'default',
    label_dropdown,
    hint,
    options = [],
    value,
  } = config

  return (
    <Dropdown
      placeholder={placeholder}
      state={state as DropdownState}
      label={label_dropdown}
      hint={hint}
      options={options as DropdownOption[]}
      defaultValue={value}
    />
  )
}
