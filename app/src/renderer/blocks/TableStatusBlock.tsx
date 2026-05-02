import { TableStatus } from '../../components'
import type { TableStatusSeverity, TableStatusContent } from '../../components'
import type { TableStatusBlock } from '../../types/screen'

export function TableStatusBlock({ config }: { config: TableStatusBlock }) {
  const { label, severity = 'info', size = 24, content = 'text-only', icon } = config

  return (
    <TableStatus
      severity={severity as TableStatusSeverity}
      size={size}
      content={content as TableStatusContent}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon={icon as any}
    >
      {content !== 'icon-only' ? label : undefined}
    </TableStatus>
  )
}
