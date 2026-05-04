import { useState } from 'react'
import {
  ArrowUpDown,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  EllipsisVertical,
} from 'lucide-react'
import { Input } from '../../index'
import styles from './DataTable.module.css'

export interface DataTableColumn<T = any> {
  key: string
  title: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  sticky?: boolean
  render?: (row: T) => React.ReactNode
}

export interface DataTableFilterChip {
  label: string
  active: boolean
  onToggle: () => void
}

export interface DataTablePagination {
  page: number
  pageSize: number
  total: number
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey?: (row: T) => string
  searchPlaceholder?: string
  onSearch?: (q: string) => void
  filterChips?: DataTableFilterChip[]
  toolbarActions?: { label: string; onClick: () => void }[]
  selectable?: boolean
  selected?: string[]
  onSelectionChange?: (keys: string[]) => void
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  pagination?: DataTablePagination
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  bulkActions?: { label: string; onClick: (selected: string[]) => void }[]
  className?: string
}

export function DataTable<T = any>({
  columns,
  data,
  rowKey = (row: any) => row.id || row.key || String(Math.random()),
  searchPlaceholder = 'Поиск',
  onSearch,
  filterChips,
  toolbarActions,
  selectable = true,
  selected = [],
  onSelectionChange,
  sortBy,
  sortDir: _sortDir = 'asc',
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  bulkActions,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [columnSettings, setColumnSettings] = useState(false)
  const [visibleCols, _setVisibleCols] = useState<string[]>(columns.map(c => c.key))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onSearch?.(e.target.value)
  }

  const handleSelectAll = () => {
    const allKeys = data.map(rowKey)
    if (selected.length === allKeys.length) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(allKeys)
    }
  }

  const handleSelect = (key: string) => {
    if (selected.includes(key)) {
      onSelectionChange?.(selected.filter(k => k !== key))
    } else {
      onSelectionChange?.([...selected, key])
    }
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0

  const getPageNumbers = () => {
    if (!pagination || totalPages <= 1) return []
    const pages: (number | 'ellipsis')[] = []
    const current = pagination.page
    
    pages.push(1)
    if (current > 3) pages.push('ellipsis')
    
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i)
    }
    
    if (current < totalPages - 2) pages.push('ellipsis')
    if (totalPages > 1) pages.push(totalPages)
    
    return [...new Set(pages)]
  }

  const visibleColumns = columns.filter(c => visibleCols.includes(c.key))

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <Input
            placeholder={searchPlaceholder}
            icon="Search"
            iconPosition="left"
            value={search}
            onChange={handleSearch}
          />
          {filterChips && (
            <div className={styles.filterChips}>
              {filterChips.map((chip, i) => (
                <button
                  key={i}
                  className={styles.filterChip}
                  onClick={chip.onToggle}
                >
                  {chip.active && <Check size={16} className={styles.filterChipIcon} />}
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.toolbarActions}>
          {toolbarActions?.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: 8,
                background: '#2d98b4',
                color: 'white',
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '16px',
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectable && selected.length > 0 && bulkActions && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>
            {selected.length} selected
          </span>
          <div className={styles.bulkActions}>
            {bulkActions.map((action, i) => (
              <button
                key={i}
                onClick={() => action.onClick(selected)}
                style={{
                  padding: '4px 12px',
                  border: '1px solid #dfe2e6',
                  borderRadius: 8,
                  background: 'white',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.table}>
        <div className={styles.tableInner}>
          {/* Header */}
          <div className={styles.tableHead}>
            {selectable && (
              <div className={`${styles.headerCell} ${styles.stickyLeft}`} style={{ width: 44 }}>
                <div
                  className={`${styles.checkbox} ${selected.length > 0 ? styles.checkboxChecked : ''}`}
                  onClick={handleSelectAll}
                >
                  {selected.length > 0 && <Check size={14} />}
                </div>
              </div>
            )}

            {visibleColumns.map((col) => (
              <div
                key={col.key}
                className={`${styles.headerCell} ${col.sticky ? styles.stickyLeft : ''}`}
                style={{ width: col.width || 160, minWidth: col.width || 120 }}
              >
                <span className={styles.headerText}>{col.title}</span>
                <div className={styles.headerActions}>
                  {col.sortable && (
                    <div
                      className={`${styles.headerSort} ${sortBy === col.key ? styles.headerSortActive : ''}`}
                      onClick={() => onSort?.(col.key)}
                    >
                      <ArrowUpDown size={12} />
                    </div>
                  )}
                  {col.filterable && (
                    <div className={styles.headerFilter}>
                      <Filter size={12} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Column settings */}
            <div className={styles.headerCell} style={{ width: 52, minWidth: 52, justifyContent: 'center' }}>
              <div
                className={styles.headerSettings}
                onClick={() => setColumnSettings(!columnSettings)}
                title="Column settings"
              >
                <Settings size={20} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className={styles.tableBody}>
            {data.map((row, i) => {
              const key = rowKey(row)
              const isAlt = i % 2 === 1
              return (
                <div key={key} className={styles.tableRow}>
                  {selectable && (
                    <div
                      className={`${styles.cell} ${styles.checkCell} ${styles.rowStickyLeft} ${isAlt ? styles.alt : ''}`}
                      style={{ width: 44, position: 'sticky', left: 0, zIndex: 1 }}
                    >
                      <div
                        className={`${styles.checkbox} ${selected.includes(key) ? styles.checkboxChecked : ''}`}
                        onClick={() => handleSelect(key)}
                      >
                        {selected.includes(key) && <Check size={14} />}
                      </div>
                    </div>
                  )}

                  {visibleColumns.map((col) => (
                    <div
                      key={col.key}
                      className={`${styles.cell} ${col.sticky ? styles.rowStickyLeft : ''} ${isAlt ? styles.alt : ''}`}
                      style={{ width: col.width || 160, minWidth: col.width || 120 }}
                    >
                      {col.render ? col.render(row) : (
                        <span className={styles.cellText}>{(row as any)[col.key]}</span>
                      )}
                    </div>
                  ))}

                  <div className={styles.cell} style={{ width: 52, minWidth: 52 }}>
                    <div className={styles.rowAction}>
                      <EllipsisVertical size={20} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.pageNumbers}>
            <button
              className={styles.pageBtn}
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e${i}`} className={styles.pageBtn} style={{ cursor: 'default', border: 'none' }}>
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === pagination.page ? styles.pageBtnActive : ''}`}
                  onClick={() => onPageChange?.(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className={styles.pageBtn}
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div
            className={styles.pageSize}
            onClick={() => onPageSizeChange?.(pagination.pageSize === 10 ? 25 : pagination.pageSize === 25 ? 50 : 10)}
          >
            <span>{pagination.pageSize}</span>
            <ChevronDown size={16} className={styles.pageSizeIcon} />
          </div>
        </div>
      )}
    </div>
  )
}
