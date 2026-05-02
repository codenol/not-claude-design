import { X } from 'lucide-react'
import styles from './Drawer.module.css'

export type DrawerWidth = 400 | 600 | 800 | 960

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: DrawerWidth
  footer?: React.ReactNode
  backdrop?: boolean
  children: React.ReactNode
  className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  width = 400,
  footer,
  backdrop = true,
  children,
  className,
}: DrawerProps) {
  if (!open) return null

  const sizeClass = styles[`w${width}`] || styles.w400

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        style={backdrop ? undefined : { background: 'transparent' }}
      />

      <div className={`${styles.drawer} ${sizeClass} ${className || ''}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.close} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={`${styles.body} ${!footer ? styles.bodyNoFooter : ''}`}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
