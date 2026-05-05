import type { FeatureStage } from './types'

export type AppRoute =
  | { page: 'entry' }
  | { page: 'libraries' }
  | { page: 'projects' }
  | { page: 'feature'; projectId: string; pageId: string; featureId: string; stage?: FeatureStage }
  | { page: 'feature-version'; projectId: string; pageId: string; featureId: string; major: number; minor: number; stage?: FeatureStage }
