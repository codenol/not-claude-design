import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './MenuItem.module.css'

export type MenuItemVariant = 'sidebar' | 'context-menu'

export interface MenuItemProps {
  active?: boolean
  icon?: keyof typeof LucideIcons
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: MenuItemVariant
}

export function MenuItem({
  active = false,
  icon,
  children,
  onClick,
  className,
  variant = 'sidebar',
}: MenuItemProps) {
  const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideProps>) : null
  const iconSize = variant === 'context-menu' ? 20 : 16
  const variantClass = variant === 'context-menu' ? styles.contextMenu : ''

  return (
    <div
      className={`${styles.menuitem} ${variantClass} ${active ? styles.active : ''} ${className || ''}`}
      onClick={onClick}
      role="menuitem"
      tabIndex={0}
    >
      {IconComponent && (
        <IconComponent size={iconSize} className={styles.icon} />
      )}
      <span className={styles.text}>{children}</span>
    </div>
  )
}
