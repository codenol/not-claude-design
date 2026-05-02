import { Icon } from '../../index'
import styles from './Breadcrumbs.module.css'

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <div className={`${styles.breadcrumbs} ${className || ''}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className={styles.itemWrapper}>
            <span
              className={`${styles.item} ${isLast ? styles.current : styles.secondary}`}
              onClick={!isLast ? item.onClick : undefined}
              role={!isLast ? 'link' : undefined}
              tabIndex={!isLast ? 0 : undefined}
            >
              {item.label}
            </span>
            {!isLast && (
              <Icon name="Dot" size={16} className={styles.separator} />
            )}
          </div>
        )
      })}
    </div>
  )
}
