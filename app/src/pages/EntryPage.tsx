import styles from './EntryPage.module.css'
import { Icon } from '../components'

export interface EntryPageProps {
  onLibraries: () => void
  onProjects: () => void
}

export function EntryPage({ onLibraries, onProjects }: EntryPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.brand}>Norka</div>
      <div className={styles.cards}>
        <button className={styles.card} onClick={onLibraries}>
          <div className={styles.cardIcon}>
            <Icon name="Library" size={40} />
          </div>
          <div className={styles.cardTitle}>Библиотеки</div>
          <div className={styles.cardDesc}>Дизайн-системы и базы компонентов</div>
        </button>

        <button className={styles.card} onClick={onProjects}>
          <div className={styles.cardIcon}>
            <Icon name="FolderKanban" size={40} />
          </div>
          <div className={styles.cardTitle}>Проекты</div>
          <div className={styles.cardDesc}>Рабочее пространство с аналитикой, макетами и обсуждением</div>
        </button>
      </div>
    </div>
  )
}
