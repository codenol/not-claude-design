import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './Input.module.css'

export type InputState = 'default' | 'warning' | 'error' | 'disabled'
export type InputIconPosition = 'no-icon' | 'left' | 'right'

export interface InputProps {
  state?: InputState
  iconPosition?: InputIconPosition
  icon?: keyof typeof LucideIcons
  label?: string
  hint?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  className?: string
}

export function Input({
  state = 'default',
  iconPosition = 'no-icon',
  icon,
  label,
  hint,
  placeholder = 'Input',
  value,
  defaultValue,
  onChange,
  type = 'text',
  className,
}: InputProps) {
  const isDisabled = state === 'disabled'
  const stateClass = state !== 'default' ? styles[state] : ''
  const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideProps>) : null
  const isPassword = type === 'password'
  const [hidden, setHidden] = useState(true)
  const inputType = isPassword && !hidden ? 'text' : isPassword ? 'password' : type

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={`${styles.input} ${stateClass}`}>
        {IconComponent && iconPosition === 'left' && (
          <IconComponent size={16} className={styles.icon} />
        )}

        <input
          type={inputType}
          className={styles.inputField}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={isDisabled}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setHidden(!hidden)}
            disabled={isDisabled}
            tabIndex={-1}
          >
            {hidden ? (
              <LucideIcons.EyeOff size={16} />
            ) : (
              <LucideIcons.Eye size={16} />
            )}
          </button>
        )}

        {IconComponent && iconPosition === 'right' && !isPassword && (
          <IconComponent size={16} className={styles.icon} />
        )}
      </div>

      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
