import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { MenuItem } from '../../index'
import styles from './Dropdown.module.css'

export type DropdownState = 'default' | 'warning' | 'error' | 'disabled'

export interface DropdownOption {
  label: string
  value: string
}

export interface DropdownProps {
  state?: DropdownState
  label?: string
  hint?: string
  placeholder?: string
  options?: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  className?: string
  children?: React.ReactNode
}

export function Dropdown({
  state = 'default',
  label,
  hint,
  placeholder = 'Select...',
  options = [],
  value,
  defaultValue,
  onChange,
  className,
  children,
}: DropdownProps) {
  const isDisabled = state === 'disabled'
  const stateClass = state !== 'default' ? styles[state] : ''
  const isFilled = Boolean(value || defaultValue)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className={`${styles.wrapper} ${className || ''}`} ref={ref}>
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={`${styles.trigger} ${stateClass} ${open ? styles.open : ''}`}
        onClick={() => !isDisabled && setOpen(!open)}
        role="combobox"
        aria-expanded={open}
      >
        {options.length > 0 && (
          <select
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={isDisabled}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="" disabled hidden />
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        <span className={`${styles.text} ${isFilled ? styles.textFilled : ''}`}>
          {isFilled
            ? options.find((o) => o.value === (value || defaultValue))?.label || placeholder
            : placeholder}
        </span>

        <ChevronDown size={16} className={styles.chevron} />
      </div>

      {open && children && (
        <div className={styles.panel} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}

      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
