import { X } from 'lucide-react'
import { Button } from '../../index'
import styles from './Modal.module.css'

export type ModalWidth = 400 | 600 | 800 | 960

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  width?: ModalWidth
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  width = 400,
  footer,
  children,
  className,
}: ModalProps) {
  if (!open) return null

  const sizeClass = styles[`w${width}`] || styles.w400

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${sizeClass} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.header} ${description ? styles.withDescription : ''}`}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <button className={styles.close} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalFooter({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
