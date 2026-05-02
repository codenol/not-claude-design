import { useMemo } from 'react'
import { Layout } from '../components'
import { renderBlocks } from './registry'
import type { ScreenConfig } from '../types/screen'
import type { BreadcrumbItem, SidebarProps } from '../components'

interface YamlRendererProps {
  config: ScreenConfig
}

export function YamlRenderer({ config }: YamlRendererProps) {
  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => config.meta.breadcrumbs.map(b => ({ label: b.label })),
    [config.meta.breadcrumbs],
  )

  const sidebarProps: Partial<SidebarProps> = useMemo(() => {
    if (!config.sidebar) return {}
    return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logoVariant: config.sidebar.logoVariant as any,
      avatarInitials: config.sidebar.avatarInitials,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statusVariant: config.sidebar.statusVariant as any,
      menuSections: config.sidebar.menuSections?.map(section => ({
        title: section.title,
        items: section.items.map(item => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          icon: item.icon as any,
          label: item.label,
          active: item.active,
        })),
      })),
    }
  }, [config.sidebar])

  return (
    <Layout sidebarProps={sidebarProps} breadcrumbs={breadcrumbs}>
      {renderBlocks(config.content)}
    </Layout>
  )
}
