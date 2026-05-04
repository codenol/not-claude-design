import { useState } from 'react'
import styles from './LibrariesPage.module.css'

interface LibSection {
  name: string
  items: string[]
}

const COMPONENT_GROUPS: LibSection[] = [
  { name: 'Atoms', items: ['Button', 'Input', 'Badge', 'Icon', 'MenuButton', 'Status', 'Logo', 'TableStatus', 'Textarea', 'ProgressDots', 'KebabMenu'] },
  { name: 'Molecules', items: ['MenuItem', 'Dropdown', 'Breadcrumbs'] },
  { name: 'Organisms', items: ['Sidebar', 'Layout', 'Modal', 'Drawer', 'DataTable'] },
]

const TOKEN_LINKS = ['Цвета', 'Отступы', 'Скругления']

export interface LibrariesPageProps {
  onBack: () => void
}

export function LibrariesPage(_props: LibrariesPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Библиотеки</h1>
      </div>
      <div className={styles.list}>
        <LibraryCard />
      </div>
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return <span className={`${styles.chevron} ${open ? styles.chevronDown : ''}`}>▸</span>
}

function LibraryCard() {
  const [expanded, setExpanded] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  return (
    <div className={styles.card}>
      <div className={styles.libHeader} onClick={() => setExpanded(!expanded)}>
        <Chevron open={expanded} />
        <span className={styles.libName}>Skala DS</span>
      </div>

      {expanded && (
        <>
          {COMPONENT_GROUPS.map(g => {
            const isExp = expandedGroups.includes(g.name)
            return (
              <div key={g.name}>
                <div className={styles.subItem} onClick={() => toggleGroup(g.name)}>
                  <Chevron open={isExp} />
                  <span className={styles.subName}>{g.name}</span>
                  <span className={styles.count}>{g.items.length}</span>
                </div>
                {isExp && g.items.map(it => (
                  <div key={it} className={styles.leafItem}>
                    <span className={styles.leafBullet}>·</span>
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            )
          })}

          {TOKEN_LINKS.map(t => (
            <div key={t} className={`${styles.subItem} ${styles.linkItem}`}>
              <span className={styles.linkArrow}>→</span>
              <span className={styles.subName}>{t}</span>
            </div>
          ))}

          <div className={`${styles.subItem} ${styles.linkItem}`}>
            <span className={styles.linkArrow}>→</span>
            <span className={styles.subName}>Типографика</span>
          </div>
        </>
      )}
    </div>
  )
}
