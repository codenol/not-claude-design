import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './Button.module.css'

export type ButtonSentiment = 'accent' | 'danger' | 'warning' | 'success' | 'info' | 'secondary'
export type ButtonType = 'filled' | 'outline' | 'ghost'
export type ButtonSize = 'large' | 'small'
export type ButtonState = 'default' | 'hover' | 'focus' | 'active' | 'disabled'
export type ButtonIconPosition = 'no-icon' | 'left' | 'right' | 'icon-only'

export interface ButtonProps {
  sentiment?: ButtonSentiment
  type?: ButtonType
  size?: ButtonSize
  state?: ButtonState
  iconPosition?: ButtonIconPosition
  icon?: keyof typeof LucideIcons
  children?: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
  'aria-label'?: string
}

export function Button({
  sentiment = 'accent',
  type = 'filled',
  size = 'large',
  state = 'default',
  iconPosition = 'no-icon',
  icon,
  children,
  disabled = false,
  onClick,
  className,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || state === 'disabled'
  const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideProps>) : null

  const iconSize = size === 'large' ? 16 : 16

  if (iconPosition === 'icon-only') {
    return (
      <button
        className={`${styles.button} ${styles[type]} ${styles[sentiment]} ${styles[size]} ${styles['icon-only']} ${className || ''}`}
        disabled={isDisabled}
        onClick={onClick}
        aria-label={ariaLabel || (icon ? icon : 'button')}
      >
        {IconComponent && <IconComponent size={iconSize} />}
      </button>
    )
  }

  return (
    <button
      className={`${styles.button} ${styles[type]} ${styles[sentiment]} ${styles[size]} ${className || ''}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {IconComponent && iconPosition === 'left' && (
        <IconComponent size={iconSize} className={styles.icon} />
      )}
      {children}
      {IconComponent && iconPosition === 'right' && (
        <IconComponent size={iconSize} className={styles.icon} />
      )}
    </button>
  )
}
