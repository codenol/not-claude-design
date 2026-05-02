import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './TableStatus.module.css'

export type TableStatusSeverity =
  | 'success' | 'degradation' | 'warning' | 'critical'
  | 'info' | 'maintenance' | 'additional' | 'stop' | 'new' | 'load'

export type TableStatusContent = 'text-only' | 'text-and-icon' | 'icon-only' | 'outline-text-only'

export type TableStatusSize = 17 | 24

export interface TableStatusProps {
  severity?: TableStatusSeverity
  size?: TableStatusSize
  content?: TableStatusContent
  icon?: keyof typeof LucideIcons
  children?: React.ReactNode
  className?: string
}

export function TableStatus({
  severity = 'info',
  size = 24,
  content = 'text-only',
  icon,
  children,
  className,
}: TableStatusProps) {
  const isOutline = content === 'outline-text-only'
  const isSize17 = size === 17
  const isIconOnly = content === 'icon-only'
  const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideProps>) : null

  const classList = [
    styles.status,
    isOutline ? styles.outline : '',
    isSize17 ? styles.size17 : styles.size24,
    isIconOnly ? styles.iconOnly : '',
    styles[severity] || '',
    className || '',
  ].filter(Boolean).join(' ')

  return (
    <span className={classList}>
      {IconComponent && (content === 'text-and-icon' || isIconOnly) && (
        <IconComponent size={12} className={styles.icon} />
      )}
      {!isIconOnly && (children || severity.toUpperCase())}
    </span>
  )
}
