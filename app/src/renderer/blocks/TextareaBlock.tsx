import { Textarea } from '../../components'
import type { TextareaState } from '../../components'
import type { TextareaBlock } from '../../types/screen'

export function TextareaBlock({ config }: { config: TextareaBlock }) {
  const {
    placeholder = 'Enter a description...',
    state = 'default',
    label,
    hint,
    value,
    copyText = false,
  } = config

  return (
    <Textarea
      placeholder={placeholder}
      state={state as TextareaState}
      label={label}
      hint={hint}
      defaultValue={value}
      copyText={copyText}
    />
  )
}
