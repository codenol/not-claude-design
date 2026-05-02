import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './Badge.module.css'

export type BadgeColor =
  | 'gray'
  | 'gray-strong'
  | 'gray-warm'
  | 'nile-blue'
  | 'tory-blue'
  | 'cornflower-blue'
  | 'bondi-blue'
  | 'java'
  | 'green'
  | 'shamrock'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'rose'
  | 'violet'

export type BadgeContent = 'text-only' | 'text-and-icon' | 'outline'

export interface BadgeProps {
  color?: BadgeColor
  content?: BadgeContent
  icon?: keyof typeof LucideIcons
  children: React.ReactNode
  className?: string
}

export function Badge({
  color = 'gray',
  content = 'text-only',
  icon,
  children,
  className,
}: BadgeProps) {
  const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideProps>) : null

  return (
    <span className={`${styles.badge} ${styles[color]} ${styles[content]} ${className || ''}`}>
      <span className={styles.text}>{children}</span>
      {IconComponent && content === 'text-and-icon' && (
        <IconComponent size={12} className={styles.icon} />
      )}
    </span>
  )
}
