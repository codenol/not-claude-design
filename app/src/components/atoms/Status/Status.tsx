import { LockKeyhole } from 'lucide-react'
import styles from './Status.module.css'

export type StatusVariant = 'default' | 'danger' | 'lock'

export interface StatusProps {
  variant?: StatusVariant
  className?: string
}

export function Status({ variant = 'default', className }: StatusProps) {
  return (
    <div className={`${styles.status} ${styles[variant]} ${className || ''}`}>
      <div className={styles.indicator} />
      {variant === 'lock' && (
        <LockKeyhole size={12} className={styles.icon} />
      )}
    </div>
  )
}
