import { useState, useEffect, useCallback } from 'react'
import type { FeatureStage, PRD, CommentThread } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import { Button } from '../components'
import styles from './FinalizeStage.module.css'

export interface FinalizeStageProps {
  repo: NorkaRepo
  projectId: string
  pageId: string
  featureId: string
  version: { major: number; minor: number }
  readOnly?: boolean
  onTransition: (to: FeatureStage) => void
}

interface CheckItem {
  label: string
  done: boolean
}

export function FinalizeStage({ repo, projectId, pageId, featureId, version, readOnly, onTransition }: FinalizeStageProps) {
  const [prd, setPrd] = useState<PRD | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentThread[]>([])
  const [loaded, setLoaded] = useState(false)

  const loadData = useCallback(async () => {
    const ver = await repo.getVersion(projectId, pageId, featureId, version.major, version.minor)
    const prdData = await repo.getPrd(projectId, pageId, featureId, version.major, version.minor)
    if (ver) {
      setSelectedVariant(ver.selectedVariant)
      setComments(ver.comments)
    }
    setPrd(prdData)
    setLoaded(true)
  }, [repo, projectId, pageId, featureId, version])

  useEffect(() => { loadData() }, [loadData])

  const variantName = selectedVariant
    ? `V${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)}`
    : '—'

  const allCommentsResolved = comments.length === 0 || comments.every(c => c.resolved)

  const checks: CheckItem[] = [
    { label: 'PRD заполнен', done: prd !== null },
    { label: 'Выбран финальный вариант макета', done: selectedVariant !== null },
    { label: 'Все комментарии решены', done: allCommentsResolved },
    { label: 'Все секции PRD не пустые', done: prd !== null && prd.personas.length > 0 && prd.useCases.length > 0 && prd.dataModel.length > 0 && prd.screenInventory.length > 0 },
  ]

  const allDone = checks.every(c => c.done)

  if (!loaded) return <div className={styles.loading}>Загрузка...</div>

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Оформление — v{version.major}.{version.minor}</h2>
        {!readOnly && (
        <Button sentiment="success" size="large" disabled={!allDone} onClick={() => onTransition('published')}>
          Опубликовать
        </Button>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Чеклист</h3>
          <div className={styles.checks}>
            {checks.map((c, i) => (
              <div key={i} className={`${styles.checkItem} ${c.done ? styles.checkDone : ''}`}>
                <span className={styles.checkIcon}>{c.done ? '✓' : '○'}</span>
                <span className={styles.checkLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Артефакты</h3>
          <div className={styles.artifactRow}>
            <span className={styles.artifactLabel}>PRD</span>
            <span className={styles.artifactValue}>
              {prd ? `${prd.personas.length} персон, ${prd.useCases.length} UC, ${prd.dataModel.length} сущностей, ${prd.screenInventory.length} экранов` : '—'}
            </span>
          </div>
          <div className={styles.artifactRow}>
            <span className={styles.artifactLabel}>Финальный макет</span>
            <span className={styles.artifactValue}>{variantName}</span>
          </div>
          <div className={styles.artifactRow}>
            <span className={styles.artifactLabel}>Комментарии</span>
            <span className={styles.artifactValue}>
              {comments.length} тредов ({comments.filter(c => !c.resolved).length} не решено)
            </span>
          </div>
          <div className={styles.artifactRow}>
            <span className={styles.artifactLabel}>Контракты</span>
            <span className={styles.artifactValue}>
              screen-contract.yaml, prd.schema.json
            </span>
          </div>
        </div>
      </div>

      {!allDone && (
        <div className={styles.warning}>
          Завершите все пункты чеклиста перед публикацией.
        </div>
      )}
    </div>
  )
}
