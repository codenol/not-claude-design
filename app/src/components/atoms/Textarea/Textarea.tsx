import * as LucideIcons from 'lucide-react'
import styles from './Textarea.module.css'

export type TextareaState = 'default' | 'warning' | 'error' | 'disabled'

export interface TextareaProps {
  state?: TextareaState
  label?: string
  hint?: string
  maxLength?: number
  copyText?: boolean
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  children?: React.ReactNode
}

export function Textarea({
  state = 'default',
  label,
  hint,
  maxLength,
  copyText = false,
  placeholder = 'Enter a description...',
  value,
  defaultValue,
  onChange,
  className,
  children,
}: TextareaProps) {
  const isDisabled = state === 'disabled'
  const stateClass = state !== 'default' ? styles[state] : ''

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={`${styles.textarea} ${stateClass}`}>
        <div className={styles.text}>
          {children || (
            <textarea
              value={value}
              defaultValue={defaultValue}
              onChange={onChange}
              placeholder={placeholder}
              disabled={isDisabled}
              maxLength={maxLength}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                background: 'transparent',
                padding: 0,
                margin: 0,
                font: 'inherit',
                color: 'inherit',
                letterSpacing: 'inherit',
              }}
            />
          )}
        </div>

        {copyText && (
          <LucideIcons.Copy size={16} className={styles.copyIcon} />
        )}

        <LucideIcons.GripVertical size={16} className={styles.resizeIcon} />
      </div>

      {hint && (
        <div className={styles.hint}>
          <span className={styles.hintText}>{hint}</span>
          <span className={styles.counter}>
            {typeof value === 'string' ? value.length : 0}/{maxLength || 60}
          </span>
        </div>
      )}
    </div>
  )
}
