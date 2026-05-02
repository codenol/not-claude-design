import { useState } from 'react'
import {
  MenuButton,
  Status,
  Logo,
  MenuItem,
} from '../../index'
import styles from './Sidebar.module.css'

export type SidebarLogoVariant = 'genom' | 'vision' | 'spektr' | 'spektr-s3' | 'spektr-ai'

export interface SidebarMenuItem {
  icon: string
  label: string
  active?: boolean
}

export interface SidebarMenuSection {
  title?: string
  items: SidebarMenuItem[]
}

export interface SidebarProps {
  collapsed?: boolean
  logoVariant?: SidebarLogoVariant
  topActions?: Array<{ icon: string; active?: boolean }>
  bottomActions?: Array<{ icon: string; active?: boolean }>
  menuSections?: SidebarMenuSection[]
  avatarInitials?: string
  statusVariant?: 'default' | 'lock'
  onCollapse?: () => void
  onExpand?: () => void
  className?: string
}

const DEFAULT_TOP_ACTIONS = [
  { icon: 'Bell' },
  { icon: 'LayoutGrid' },
  { icon: 'BookmarkCheck' },
]

const DEFAULT_BOTTOM_ACTIONS = [
  { icon: 'Settings' },
  { icon: 'Moon' },
  { icon: 'Images' },
  { icon: 'CircleHelp' },
]

const DEFAULT_MENU_SECTIONS: SidebarMenuSection[] = [
  {
    items: [
      { icon: 'Binoculars', label: 'Обзор' },
      { icon: 'Network', label: 'Объекты' },
    ],
  },
  {
    title: 'Настройки',
    items: [
      { icon: 'PencilRuler', label: 'Метрики' },
      { icon: 'Info', label: 'Диагностика' },
      { icon: 'BellRing', label: 'Правила оповещений' },
      { icon: 'ArrowLeftRight', label: 'Конструктор выражений' },
      { icon: 'UserPlus', label: 'Список получателей' },
      { icon: 'Users', label: 'Группы рассылки' },
      { icon: 'Mail', label: 'Настройки отправки' },
    ],
  },
  {
    title: 'Безопасность',
    items: [
      { icon: 'LayoutGrid', label: 'Ролевая модель' },
      { icon: 'Key', label: 'Токены доступа' },
    ],
  },
]

export function Sidebar({
  collapsed = false,
  logoVariant = 'genom',
  topActions = DEFAULT_TOP_ACTIONS,
  bottomActions = DEFAULT_BOTTOM_ACTIONS,
  menuSections = DEFAULT_MENU_SECTIONS,
  avatarInitials = 'AB',
  statusVariant = 'lock',
  onCollapse,
  onExpand,
  className,
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null)

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${className || ''}`}>
      {/* Minibar */}
      <div className={styles.minibar}>
        <div className={styles.minibarInner}>
          {/* Top slot */}
          <div className={styles.slot}>
            <Status variant={statusVariant} />
            {topActions.map((action, i) => (
              <MenuButton key={`top-${i}`} icon={action.icon as any} active={action.active} />
            ))}
          </div>

          {/* Bottom slot */}
          <div className={`${styles.slot} ${styles.bottomSlot}`}>
            {bottomActions.map((action, i) => (
              <MenuButton key={`bottom-${i}`} icon={action.icon as any} active={action.active} />
            ))}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                <span>{avatarInitials}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded menu panel */}
      {!collapsed && (
        <div className={styles.menuPanel}>
          {/* Header */}
          <div className={styles.header}>
            <Logo variant={logoVariant} />
            <div className={styles.divider} />
          </div>

          {/* Menu content */}
          <div className={styles.menuContent}>
            <div className={styles.menuSlot}>
              {menuSections.map((section, si) => (
                <div key={si} className={styles.menuSection}>
                  {section.title && (
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>{section.title}</div>
                      <div className={styles.sectionHeaderLine} />
                    </div>
                  )}
                  {section.items.map((item, ii) => (
                    <MenuItem
                      key={`${si}-${ii}`}
                      icon={item.icon as any}
                      active={item.active || activeItem === item.label}
                      onClick={() => setActiveItem(item.label)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer divider */}
            <div className={styles.menuDivider} />

            {/* Collapse button */}
            <div className={styles.bottomBlock}>
              <MenuItem
                icon="ChevronLeft"
                onClick={onCollapse}
                className={styles.collapseItem}
              >
                Свернуть
              </MenuItem>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed expand button */}
      {collapsed && (
        <div className={styles.expandPanel}>
          <div className={styles.expandBottom}>
            <MenuButton icon="ChevronRight" onClick={onExpand} />
          </div>
        </div>
      )}
    </div>
  )
}
