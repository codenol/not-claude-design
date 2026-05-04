import type { FeatureStage, Feature, FeatureVersionSummary } from './types'

export const STAGE_ORDER: FeatureStage[] = [
  'draft',
  'analytics',
  'prototypes',
  'discussion',
  'final',
  'published',
]

export const ACTIVE_STAGES: FeatureStage[] = [
  'analytics',
  'prototypes',
  'discussion',
  'final',
]

export function getStageIndex(stage: FeatureStage): number {
  return STAGE_ORDER.indexOf(stage)
}

export function getDotProgress(stage: FeatureStage): number {
  if (stage === 'published') return 4
  return Math.max(0, ACTIVE_STAGES.indexOf(stage))
}

export function getActiveStage(dotsCompleted: number): FeatureStage {
  return ACTIVE_STAGES[Math.min(dotsCompleted, 3)]
}

export type StageTransition = {
  from: FeatureStage
  to: FeatureStage
  label: string
  bumpsMinor: boolean
}

export const TRANSITIONS: StageTransition[] = [
  { from: 'draft', to: 'analytics', label: 'Начать аналитику', bumpsMinor: false },
  { from: 'analytics', to: 'prototypes', label: 'Передать в макеты', bumpsMinor: false },
  { from: 'prototypes', to: 'discussion', label: 'Передать в обсуждение', bumpsMinor: false },
  { from: 'discussion', to: 'final', label: 'Утвердить → Оформление', bumpsMinor: false },
  { from: 'final', to: 'published', label: 'Опубликовать', bumpsMinor: false },

  { from: 'discussion', to: 'analytics', label: 'Вернуть в аналитику', bumpsMinor: true },
  { from: 'discussion', to: 'prototypes', label: 'Вернуть в макеты', bumpsMinor: true },
  { from: 'prototypes', to: 'analytics', label: 'Вернуть в аналитику', bumpsMinor: true },

  { from: 'published', to: 'analytics', label: 'Переоткрыть', bumpsMinor: false },
]

export function canTransition(from: FeatureStage, to: FeatureStage): boolean {
  return TRANSITIONS.some(t => t.from === from && t.to === to)
}

export function getTransition(from: FeatureStage, to: FeatureStage): StageTransition | undefined {
  return TRANSITIONS.find(t => t.from === from && t.to === to)
}

export function getNextVersion(
  feature: Feature,
  bumpsMinor: boolean,
): { major: number; minor: number } {
  const latest = getLatestVersion(feature)
  if (!latest) return { major: 1, minor: 0 }

  if (bumpsMinor) {
    return { major: latest.major, minor: latest.minor + 1 }
  }
  return { major: latest.major + 1, minor: 0 }
}

export function getLatestVersion(feature: Feature): FeatureVersionSummary | null {
  if (feature.versions.length === 0) return null
  return feature.versions.reduce((a, b) => {
    if (a.major > b.major) return a
    if (a.major < b.major) return b
    return a.minor > b.minor ? a : b
  })
}

export function versionLabel(version: { major: number; minor: number }): string {
  return `v${version.major}.${version.minor}`
}
