import { useState } from 'react'
import styles from './FloatingPanel.module.css'

export interface FloatingPanelProps {
  title: string
  children: React.ReactNode
  defaultWidth?: number
  onClose?: () => void
}

export function FloatingPanel({ title, children, defaultWidth = 320, onClose }: FloatingPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(defaultWidth)

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = width

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX
      setWidth(Math.max(260, Math.min(600, startWidth + delta)))
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className={styles.panel} style={{ width: collapsed ? 40 : width }}>
      <div className={styles.header}>
        {!collapsed && <span className={styles.title}>{title}</span>}
        <div className={styles.headerActions}>
          <button className={styles.btn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '☰' : '−'}
          </button>
          {onClose && (
            <button className={styles.btn} onClick={onClose}>×</button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div className={styles.content}>{children}</div>
          <div className={styles.resizeHandle} onMouseDown={handleResizeStart} />
        </>
      )}
    </div>
  )
}
