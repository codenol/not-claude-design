import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './MenuButton.module.css'

export interface MenuButtonProps {
  active?: boolean
  icon: keyof typeof LucideIcons
  onClick?: () => void
  className?: string
}

export function MenuButton({
  active = false,
  icon,
  onClick,
  className,
}: MenuButtonProps) {
  const IconComponent = LucideIcons[icon] as React.ComponentType<LucideProps>

  return (
    <button
      className={`${styles.menubutton} ${active ? styles.active : ''} ${className || ''}`}
      onClick={onClick}
      type="button"
    >
      <IconComponent size={20} className={styles.icon} />
    </button>
  )
}
