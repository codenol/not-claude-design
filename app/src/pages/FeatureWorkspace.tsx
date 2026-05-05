import { useCallback, useState } from 'react'
import type { Feature, FeatureStage } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import type { UserInfo } from '../services/roleConfig'
import { getRoleColor } from '../services/roleConfig'
import type { PrototypeVariant } from '../features/types'
import { ACTIVE_STAGES, getDotProgress, versionLabel, getLatestVersion, getTransition, canTransition } from '../features/workflowMachine'
import { ProgressDots } from '../components/atoms/ProgressDots'
import { AnalyticsStage } from '../stages/AnalyticsStage'
import { PrototypesStage } from '../stages/PrototypesStage'
import { DiscussionStage } from '../stages/DiscussionStage'
import { FinalizeStage } from '../stages/FinalizeStage'
import { DEMO_PRD, DEMO_YAMLS, DEMO_DESCRIPTION } from '../features/demoData'
import styles from './FeatureWorkspace.module.css'

export interface FeatureWorkspaceProps {
  feature: Feature
  projectName: string
  pageName: string
  repo: NorkaRepo
  readOnly?: boolean
  viewVersion?: { major: number; minor: number; stage: FeatureStage }
  explicitStage?: FeatureStage
  currentUser: UserInfo
  onBack: () => void
  onStageChange?: (stage: FeatureStage, version?: { major: number; minor: number }) => void
  onFeatureUpdate: (feature: Feature) => void
}

const STAGE_LABELS: Record<string, string> = {
  analytics: 'Аналитика',
  prototypes: 'Макеты',
  discussion: 'Обсуждение',
  final: 'Оформление',
}

export function FeatureWorkspace({ feature, projectName, pageName, repo, readOnly, viewVersion, explicitStage, currentUser, onBack, onStageChange, onFeatureUpdate }: FeatureWorkspaceProps) {
  const latestVer = getLatestVersion(feature)
  const activeVer = viewVersion || latestVer
  const featureStage: FeatureStage = feature.status
  const [renderKey, setRenderKey] = useState(0)

  const displayStage: FeatureStage = explicitStage && (explicitStage === featureStage || canTransition(featureStage, explicitStage)) ? explicitStage : featureStage

  const handleDemo = useCallback(async () => {
    if (!activeVer) return
    const { projectId, pageId, id } = feature

    if (displayStage === 'analytics') {
      await repo.updateFeatureDesc(projectId, pageId, id, DEMO_DESCRIPTION)
      await repo.savePrd(projectId, pageId, id, activeVer.major, activeVer.minor, DEMO_PRD)
    }

    if (displayStage === 'prototypes') {
      for (const v of DEMO_YAMLS) {
        const variant: PrototypeVariant = {
          id: v.id,
          name: v.name,
          yaml: v.yaml,
          params: v.params,
        }
        await repo.saveVariant(projectId, pageId, id, activeVer.major, activeVer.minor, variant)
      }
    }

    setRenderKey(k => k + 1)
  }, [displayStage, activeVer, feature, repo])

  const handleTransition = useCallback((to: FeatureStage, viaClick = false) => {
    if (readOnly) return
    const from = displayStage
    const transition = getTransition(from, to)
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
        if (onStageChange) onStageChange(to, { major: latestVer.major, minor: newMinor })
      })
    } else {
      repo.updateFeatureStatus(feature.projectId, feature.pageId, feature.id, to).then(() => {
        onFeatureUpdate({ ...feature, status: to })
        if (onStageChange) onStageChange(to)
      })
    }
  }, [readOnly, displayStage, latestVer, repo, feature, onFeatureUpdate, onStageChange])

  const handleStageClick = (stage: FeatureStage) => {
    if (stage === displayStage) return
    if (readOnly) return
    const transition = getTransition(displayStage, stage)
    if (!transition) return
    handleTransition(stage, true)
  }

  const handleStageTransition = (to: FeatureStage) => {
    handleTransition(to, true)
  }

  const renderStage = () => {
    if (!activeVer) return <div className={styles.placeholderText}>Нет версий фичи</div>

    switch (displayStage) {
      case 'analytics':
        return (
          <AnalyticsStage
            key={renderKey}
            repo={repo}
            projectId={feature.projectId}
            pageId={feature.pageId}
            featureId={feature.id}
            version={{ major: activeVer.major, minor: activeVer.minor }}
            projectName={projectName}
            pageName={pageName}
            readOnly={readOnly}
            onTransition={handleStageTransition}
          />
        )
      case 'prototypes':
        return (
          <PrototypesStage
            key={renderKey}
            repo={repo}
            projectId={feature.projectId}
            pageId={feature.pageId}
            featureId={feature.id}
            version={{ major: activeVer.major, minor: activeVer.minor }}
            readOnly={readOnly}
            onTransition={handleStageTransition}
            userColor={getRoleColor(currentUser.role)}
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
            currentUser={currentUser}
            onTransition={handleStageTransition}
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
            onTransition={handleStageTransition}
          />
        )
      case 'published':
        return (
          <div className={styles.publishedBlock}>
            <div className={styles.publishedBadge}>✓ Опубликовано v{activeVer.major}.{activeVer.minor}</div>
            <p className={styles.publishedText}>Фича передана в разработку. Доступна для просмотра.</p>
            {!readOnly && (
              <div className={styles.publishedActions}>
                <button className={styles.reopenBtn} onClick={() => handleStageClick('analytics')}>
                  Переоткрыть (v{activeVer.major + 1}.0)
                </button>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className={styles.contentPlaceholder}>
            <p className={styles.placeholderText}>Стадия не поддерживается: {displayStage}</p>
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
            const isActive = stage === displayStage
            const isCompleted = getDotProgress(featureStage) > dotIdx
            const isReachable = !readOnly && canTransition(displayStage, stage)

            return (
              <div
                key={stage}
                className={`${styles.stageItem} ${isActive ? styles.stageActive : ''} ${isCompleted ? styles.stageCompleted : ''} ${isReachable && !isActive ? styles.stageClickable : ''}`}
                onClick={() => isReachable && !isActive && handleStageClick(stage)}
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
          {!readOnly && (displayStage === 'analytics' || displayStage === 'prototypes') && (
            <button className={styles.demoBtn} onClick={handleDemo}>
              Демо
            </button>
          )}
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
