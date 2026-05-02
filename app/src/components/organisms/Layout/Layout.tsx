import { useState } from 'react'
import { Sidebar, Breadcrumbs } from '../../index'
import type { SidebarProps, BreadcrumbItem } from '../../index'
import styles from './Layout.module.css'

export interface LayoutProps {
  sidebarProps?: Partial<SidebarProps>
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
  className?: string
}

const DEFAULT_BREADCRUMBS: BreadcrumbItem[] = [
  { label: 'Главная' },
  { label: 'Компоненты' },
]

export function Layout({
  sidebarProps,
  breadcrumbs = DEFAULT_BREADCRUMBS,
  children,
  className,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <Sidebar
        collapsed={collapsed}
        logoVariant="genom"
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
        {...sidebarProps}
      />

      <div className={styles.content}>
        <div className={styles.nav}>
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className={styles.mainContainer}>
          {children}
        </div>
      </div>
    </div>
  )
}
