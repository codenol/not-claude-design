import { useState } from 'react'
import { DataTable } from '../../components'
import { TableStatusBlock } from './TableStatusBlock'
import type { DataTableBlock } from '../../types/screen'
import type { DataTableColumn } from '../../components'

const STATUS_SEVERITIES = ['success', 'warning', 'critical', 'load', 'stop'] as const
const STATUS_LABELS = ['Online', 'Warning', 'Critical', 'Loading', 'Offline'] as const
const LOCATIONS = ['msk-dc1', 'msk-dc2', 'msk-dc3', 'msk-dc4']
const TYPES = ['LOG_PROXY', 'DB_CLUSTER', 'APP_SERVER']

function generateData(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const idx = i % STATUS_SEVERITIES.length
    return {
      id: String(i + 1),
      name: `s3m-03b01-msk${String(i + 1).padStart(2, '0')}`,
      type: TYPES[i % 3],
      status: STATUS_LABELS[idx],
      statusSeverity: STATUS_SEVERITIES[idx],
      location: LOCATIONS[i % 4],
      version: `v2.${i % 5}.${i % 3}`,
    }
  })
}

export function DataTableBlock({ config }: { config: DataTableBlock }) {
  const {
    columns: columnDefs,
    data: staticData,
    generateRows = 0,
    selectable = true,
    pageSize: ps = 10,
    searchPlaceholder = 'Поиск',
    toolbarActions = [],
    bulkActions = [],
    filterChips: fcDefs = [],
  } = config

  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState(columnDefs.find(c => c.sortable)?.key || '')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(ps)
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(
    () => Object.fromEntries(fcDefs.map(f => [f.label, f.active]))
  )

  const allData = staticData && staticData.length > 0
    ? staticData
    : generateRows > 0
      ? generateData(generateRows)
      : generateData(25)

  const columns: DataTableColumn[] = columnDefs.map(col => {
    if (col.statusColumn) {
      return {
        key: col.key,
        title: col.title,
        width: col.width || '120px',
        sortable: col.sortable,
        filterable: col.filterable,
        sticky: col.sticky,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (row: any) => (
          <TableStatusBlock
            config={{
              type: 'tablestatus',
              label: row[col.key],
              severity: row.statusSeverity,
              size: 17,
              content: 'text-only',
            }}
          />
        ),
      }
    }
    return {
      key: col.key,
      title: col.title,
      width: col.width || '160px',
      sortable: col.sortable,
      filterable: col.filterable,
      sticky: col.sticky,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...allData].sort((a: any, b: any) => {
    if (!sortBy) return 0
    const dir = sortDir === 'asc' ? 1 : -1
    return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * dir
  })

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const filterChips = fcDefs.map(f => ({
    label: f.label,
    active: activeFilters[f.label] ?? f.active,
    onToggle: () => setActiveFilters(prev => ({ ...prev, [f.label]: !prev[f.label] })),
  }))

  return (
    <DataTable
      data={paginated}
      columns={columns}
      selected={selected}
      onSelectionChange={setSelected}
      selectable={selectable}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (key === sortBy) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(key); setSortDir('asc') }
      }}
      pagination={{ page, pageSize, total: allData.length }}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      searchPlaceholder={searchPlaceholder}
      toolbarActions={toolbarActions.map(a => ({ label: a.label, onClick: () => {} }))}
      bulkActions={bulkActions.map(a => ({ label: a.label, onClick: () => setSelected([]) }))}
      filterChips={filterChips}
    />
  )
}
