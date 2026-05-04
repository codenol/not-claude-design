import type { FeatureStage } from '../../../features/types'
import { getDotProgress } from '../../../features/workflowMachine'
import styles from './ProgressDots.module.css'

export interface ProgressDotsProps {
  stage: FeatureStage
  className?: string
}

const STAGE_LABELS: Record<number, string> = {
  0: 'Аналитика',
  1: 'Макеты',
  2: 'Обсуждение',
  3: 'Оформление',
}

export function ProgressDots({ stage, className }: ProgressDotsProps) {
  const filled = getDotProgress(stage)

  return (
    <div className={`${styles.dots} ${className || ''}`} title={STAGE_LABELS[filled] ?? stage}>
      {[0, 1, 2, 3].map(i => {
        let cls = styles.dot
        if (i < filled) cls += ` ${styles.filled}`
        else if (i === filled && stage !== 'published') cls += ` ${styles.current}`
        return <span key={i} className={cls} />
      })}
    </div>
  )
}
