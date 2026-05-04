export type AppRoute =
  | { page: 'entry' }
  | { page: 'libraries' }
  | { page: 'projects' }
  | { page: 'feature'; projectId: string; pageId: string; featureId: string }
  | { page: 'feature-version'; projectId: string; pageId: string; featureId: string; major: number; minor: number }
