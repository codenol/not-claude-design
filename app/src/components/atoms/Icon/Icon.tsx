import * as LucideIcons from 'lucide-react'
import { type LucideProps } from 'lucide-react'
import styles from './Icon.module.css'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof LucideIcons
}

export function Icon({ name, size = 16, className, color, ...props }: IconProps) {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideProps>

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }

  return (
    <span className={`${styles.icon} ${className || ''}`}>
      <LucideIcon size={size} color={color} {...props} />
    </span>
  )
}
