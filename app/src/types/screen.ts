export interface BreadcrumbEntry {
  label: string
  onClick?: string
}

export interface ScreenMeta {
  title?: string
  description?: string
  breadcrumbs: BreadcrumbEntry[]
}

export interface SidebarMenuItemConfig {
  icon: string
  label: string
  active?: boolean
}

export interface SidebarMenuSectionConfig {
  title?: string
  items: SidebarMenuItemConfig[]
}

export type SidebarLogoVariant = 'genom' | 'vision' | 'spektr' | 'spektr-s3' | 'spektr-ai'
export type SidebarStatusVariant = 'default' | 'lock'

export interface SidebarConfig {
  logoVariant?: SidebarLogoVariant
  avatarInitials?: string
  statusVariant?: SidebarStatusVariant
  menuSections?: SidebarMenuSectionConfig[]
}

// --- Content blocks ---

export type ButtonSentiment = 'accent' | 'danger' | 'warning' | 'success' | 'info' | 'secondary'
export type ButtonSize = 'large' | 'small'
export type ButtonIconPosition = 'left' | 'right' | 'icon-only'
export type ButtonState = 'default' | 'hover' | 'focus' | 'active' | 'disabled'

export interface ButtonBlock {
  type: 'button'
  label: string
  sentiment?: ButtonSentiment
  filled?: boolean
  outline?: boolean
  size?: ButtonSize
  icon?: string
  iconPosition?: ButtonIconPosition
  disabled?: boolean
  state?: ButtonState
}

export type BadgeColor =
  | 'gray' | 'gray-strong' | 'gray-warm'
  | 'nile-blue' | 'tory-blue' | 'cornflower-blue'
  | 'bondi-blue' | 'java' | 'green' | 'shamrock'
  | 'yellow' | 'orange' | 'red' | 'rose' | 'violet'

export type BadgeContent = 'text-only' | 'text-and-icon' | 'outline'

export interface BadgeBlock {
  type: 'badge'
  label: string
  color?: BadgeColor
  content?: BadgeContent
  icon?: string
}

export type InputState = 'default' | 'warning' | 'error' | 'disabled'
export type InputIconPosition = 'left' | 'right'

export interface InputBlock {
  type: 'input'
  placeholder?: string
  state?: InputState
  label?: string
  hint?: string
  icon?: string
  iconPosition?: InputIconPosition
  inputType?: string
  value?: string
}

export type TextareaState = 'default' | 'warning' | 'error' | 'disabled'

export interface TextareaBlock {
  type: 'textarea'
  placeholder?: string
  state?: TextareaState
  label?: string
  hint?: string
  value?: string
  copyText?: boolean
}

export type TableStatusSeverity =
  | 'success' | 'degradation' | 'warning' | 'critical'
  | 'info' | 'maintenance' | 'additional' | 'stop' | 'new' | 'load'

export type TableStatusContent = 'text-only' | 'text-and-icon' | 'icon-only' | 'outline-text-only'

export interface TableStatusBlock {
  type: 'tablestatus'
  label?: string
  severity?: TableStatusSeverity
  size?: 17 | 24
  content?: TableStatusContent
  icon?: string
}

export interface TextBlock {
  type: 'text'
  content: string
  variant?: 'body' | 'caption' | 'subtle'
}

export interface HeadingBlock {
  type: 'heading'
  content: string
  level?: 2 | 3
}

export type DropdownState = 'default' | 'warning' | 'error' | 'disabled'

export interface DropdownOption {
  label: string
  value: string
}

export interface DropdownBlock {
  type: 'dropdown'
  placeholder?: string
  state?: DropdownState
  label_dropdown?: string
  hint?: string
  options?: DropdownOption[]
  value?: string
}

export interface DataTableColumnDef {
  key: string
  title: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  sticky?: boolean
  statusColumn?: boolean
}

export interface ToolbarAction {
  label: string
}

export interface BulkAction {
  label: string
}

export interface FilterChipDef {
  label: string
  active: boolean
}

export interface DataTableBlock {
  type: 'datatable'
  columns: DataTableColumnDef[]
  data?: Record<string, unknown>[]
  generateRows?: number
  selectable?: boolean
  pageSize?: number
  searchPlaceholder?: string
  toolbarActions?: ToolbarAction[]
  bulkActions?: BulkAction[]
  filterChips?: FilterChipDef[]
}

export interface FooterButton {
  label: string
  sentiment?: string
  type?: string
  action?: string
}

export interface ModalTriggerBlock {
  type: 'modal-trigger'
  buttonLabel: string
  buttonSentiment?: string
  buttonSize?: string
  title: string
  description?: string
  width?: 400 | 600 | 800 | 960
  content: ContentBlock[]
  footerButtons?: FooterButton[]
}

export interface DrawerTriggerBlock {
  type: 'drawer-trigger'
  buttonLabel: string
  buttonSentiment?: string
  buttonSize?: string
  title: string
  width?: 400 | 600 | 800 | 960
  backdrop?: boolean
  content: ContentBlock[]
  footerButtons?: FooterButton[]
}

export interface FormBlock {
  type: 'form'
  gap?: number
  items: ContentBlock[]
}

// Container blocks
export interface SectionBlock {
  type: 'section'
  heading?: string
  direction?: 'row' | 'col'
  gap?: number
  items: ContentBlock[]
}

export interface RowBlock {
  type: 'row'
  gap?: number
  items: ContentBlock[]
}

export interface ColBlock {
  type: 'col'
  gap?: number
  items: ContentBlock[]
}

export type ContentBlock =
  | SectionBlock
  | RowBlock
  | ColBlock
  | ButtonBlock
  | BadgeBlock
  | InputBlock
  | TextareaBlock
  | DropdownBlock
  | TextBlock
  | HeadingBlock
  | TableStatusBlock
  | DataTableBlock
  | FormBlock
  | ModalTriggerBlock
  | DrawerTriggerBlock

export interface ScreenConfig {
  meta: ScreenMeta
  sidebar?: SidebarConfig
  content: ContentBlock[]
}
