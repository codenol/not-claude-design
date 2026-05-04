// --- Norka FS tree ---

export type NorkaFsNode = NorkaFsDir | NorkaFsFile

export interface NorkaFsDir {
  name: string
  type: 'dir'
  children: NorkaFsNode[]
}

export interface NorkaFsFile {
  name: string
  type: 'file'
  content: string
}

// --- Roles ---

export type NorkaRole =
  | 'ПО'
  | 'Аналитик'
  | 'Дизайнер'
  | 'Фронтендер'
  | 'Бэкендер'
  | 'Архитектор'
  | 'Деливери'
  | 'QA'

// --- Project ---

export interface TeamMember {
  role: NorkaRole
  userId: string
  name: string
}

export interface Project {
  id: string
  name: string
  description?: string
  archived?: boolean
  createdAt: string
  team: TeamMember[]
}

// --- Page ---

export interface Page {
  id: string
  name: string
  description?: string
  archived?: boolean
  order: number
  projectId: string
}

// --- Feature ---

export type FeatureStage = 'draft' | 'analytics' | 'prototypes' | 'discussion' | 'final' | 'published'

export interface Feature {
  id: string
  title: string
  description: string
  archived?: boolean
  status: FeatureStage
  assignedTo: Partial<Record<FeatureStage, string>>
  selectedVariantId: string | null
  versions: FeatureVersionSummary[]
  projectId: string
  pageId: string
}

export interface FeatureVersionSummary {
  major: number
  minor: number
  stage: FeatureStage
  selectedVariant: string | null
}

// --- Feature Version ---

export interface FeatureVersion {
  major: number
  minor: number
  stage: FeatureStage
  selectedVariant: string | null
  variants: PrototypeVariant[]
  archivedVariants: PrototypeVariant[]
  comments: CommentThread[]
  createdAt: string
}

// --- PRD ---

export interface Persona {
  id: string
  name: string
  role: string
  goal: string
  painPoints: string[]
}

export interface UseCaseStep {
  actor: 'user' | 'system'
  action: string
  screenId?: string
}

export interface UseCaseErrorFlow {
  condition: string
  resolution: string
}

export interface UseCase {
  id: string
  title: string
  actor: string
  goal: string
  trigger: string
  mainFlow: UseCaseStep[]
  errorFlows: UseCaseErrorFlow[]
  relatedFeatures: string[]
}

export interface EntityField {
  name: string
  type: string
  required: boolean
}

export interface EntityRelation {
  target: string
  type: '1:1' | '1:N' | 'N:M'
}

export interface Entity {
  id: string
  name: string
  fields: EntityField[]
  relations: EntityRelation[]
}

export interface ScreenKeyElement {
  type: string
  label: string
  dataBinding?: string
}

export interface ScreenDef {
  id: string
  title: string
  purpose: string
  relatedUseCases: string[]
  keyElements: ScreenKeyElement[]
}

export interface VariantDimension {
  axis: string
  description: string
}

export interface PRD {
  personas: Persona[]
  useCases: UseCase[]
  dataModel: Entity[]
  screenInventory: ScreenDef[]
  variantMatrix: VariantDimension[]
}

// --- Prototype Variant ---

export interface PrototypeVariant {
  id: string
  name: string
  yaml: string
  params: Record<string, string>
}

// --- Comments ---

export interface CommentMessage {
  author: NorkaRole
  text: string
  timestamp: string
}

export interface CommentAnchor {
  type: 'prd-block' | 'yaml-node'
  path: string
}

export interface CommentThread {
  id: string
  variantId: string
  anchor: CommentAnchor
  x: number
  y: number
  messages: CommentMessage[]
  resolved: boolean
}

// --- Git ---

export interface GitStatus {
  clean: boolean
  changes: string[]
}
