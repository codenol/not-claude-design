import type { Feature, FeatureStage } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import { ACTIVE_STAGES, getDotProgress, versionLabel, getLatestVersion, getTransition } from '../features/workflowMachine'
import { ProgressDots } from '../components/atoms/ProgressDots'
import { AnalyticsStage } from '../stages/AnalyticsStage'
import { PrototypesStage } from '../stages/PrototypesStage'
import { DiscussionStage } from '../stages/DiscussionStage'
import { FinalizeStage } from '../stages/FinalizeStage'
import styles from './FeatureWorkspace.module.css'

export interface FeatureWorkspaceProps {
  feature: Feature
  projectName: string
  pageName: string
  repo: NorkaRepo
  readOnly?: boolean
  viewVersion?: { major: number; minor: number; stage: FeatureStage }
  onBack: () => void
  onFeatureUpdate: (feature: Feature) => void
}

const STAGE_LABELS: Record<string, string> = {
  analytics: 'Аналитика',
  prototypes: 'Макеты',
  discussion: 'Обсуждение',
  final: 'Оформление',
}

export function FeatureWorkspace({ feature, projectName, pageName, repo, readOnly, viewVersion, onBack, onFeatureUpdate }: FeatureWorkspaceProps) {
  const latestVer = getLatestVersion(feature)
  const activeVer = viewVersion || latestVer
  const currentStage: FeatureStage = viewVersion?.stage || feature.status

  const handleTransition = (to: FeatureStage) => {
    if (readOnly) return
    const transition = getTransition(currentStage, to)
    if (!transition) return

    if (transition.bumpsMinor && latestVer) {
      const newMinor = latestVer.minor + 1
      repo.createVersion(feature.projectId, feature.pageId, feature.id, latestVer.major, newMinor, to).then(async () => {
        const oldPrd = await repo.getPrd(feature.projectId, feature.pageId, feature.id, latestVer.major, latestVer.minor)
        if (oldPrd) {
          await repo.savePrd(feature.projectId, feature.pageId, feature.id, latestVer.major, newMinor, oldPrd)
        }
        const updated: Feature = {
          ...feature,
          status: to,
          versions: [...feature.versions, { major: latestVer.major, minor: newMinor, stage: to, selectedVariant: null }],
        }
        onFeatureUpdate(updated)
      })
    } else {
      repo.updateFeatureStatus(feature.projectId, feature.pageId, feature.id, to).then(() => {
        onFeatureUpdate({ ...feature, status: to })
      })
    }
  }

  const renderStage = () => {
    if (!activeVer) return <div className={styles.placeholderText}>Нет версий фичи</div>

    switch (currentStage) {
      case 'analytics':
        return (
          <AnalyticsStage
            repo={repo}
            projectId={feature.projectId}
            pageId={feature.pageId}
            featureId={feature.id}
            version={{ major: activeVer.major, minor: activeVer.minor }}
            projectName={projectName}
            pageName={pageName}
            readOnly={readOnly}
            onTransition={handleTransition}
          />
        )
      case 'prototypes':
        return (
          <PrototypesStage
            repo={repo}
            projectId={feature.projectId}
            pageId={feature.pageId}
            featureId={feature.id}
            version={{ major: activeVer.major, minor: activeVer.minor }}
            readOnly={readOnly}
            onTransition={handleTransition}
          />
        )
      case 'discussion':
        return (
          <DiscussionStage
            repo={repo}
            projectId={feature.projectId}
            pageId={feature.pageId}
            featureId={feature.id}
            version={{ major: activeVer.major, minor: activeVer.minor }}
            readOnly={readOnly}
            onTransition={handleTransition}
          />
        )
      case 'final':
        return (
          <FinalizeStage
            repo={repo}
            projectId={feature.projectId}
            pageId={feature.pageId}
            featureId={feature.id}
            version={{ major: activeVer.major, minor: activeVer.minor }}
            readOnly={readOnly}
            onTransition={handleTransition}
          />
        )
      case 'published':
        return (
          <div className={styles.publishedBlock}>
            <div className={styles.publishedBadge}>✓ Опубликовано v{activeVer.major}.{activeVer.minor}</div>
            <p className={styles.publishedText}>Фича передана в разработку. Доступна для просмотра.</p>
            {!readOnly && (
              <div className={styles.publishedActions}>
                <button className={styles.reopenBtn} onClick={() => handleTransition('analytics')}>
                  Переоткрыть (v{activeVer.major + 1}.0)
                </button>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className={styles.contentPlaceholder}>
            <p className={styles.placeholderText}>Стадия не поддерживается: {currentStage}</p>
          </div>
        )
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.projectLabel}>{projectName}</div>
          <div className={styles.pageLabel}>{pageName}</div>
        </div>

        <div className={styles.featureInfo}>
          <div className={styles.featureName}>
            {readOnly && <span className={styles.readOnlyBadge}>👁 </span>}
            {feature.title}
          </div>
          {activeVer && (
            <div className={styles.versionBadge}>{versionLabel(activeVer)}</div>
          )}
        </div>

        {readOnly && (
          <div className={styles.readOnlyNote}>
            Просмотр версии {activeVer ? versionLabel(activeVer) : ''}
          </div>
        )}

        <div className={styles.stagesList}>
          {ACTIVE_STAGES.map(stage => {
            const dotIdx = getDotProgress(stage)
            const isActive = stage === currentStage
            const isCompleted = getDotProgress(currentStage) > dotIdx

            return (
              <div
                key={stage}
                className={`${styles.stageItem} ${isActive ? styles.stageActive : ''} ${isCompleted ? styles.stageCompleted : ''}`}
              >
                <ProgressDots
                  stage={isCompleted ? stage : isActive ? stage : 'draft'}
                />
                <span className={styles.stageLabel}>{STAGE_LABELS[stage] ?? stage}</span>
              </div>
            )
          })}
        </div>

        <div className={styles.sidebarFooter}>
          <button className={styles.backBtn} onClick={onBack}>
            ← Назад к проекту
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {renderStage()}
      </div>
    </div>
  )
}
