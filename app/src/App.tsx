import { useState, useRef } from 'react'
import { Button, Badge, Input, Textarea, Dropdown, Icon, MenuButton, Status, Logo, MenuItem, Layout, Modal, ModalFooter, TableStatus, Drawer, DataTable } from './components'
import type { DataTableColumn } from './components'
import { YamlPlayground } from './pages/YamlPlayground'
import type { YamlPlaygroundHandle } from './pages/YamlPlayground'
import { RendererNav } from './renderer/RendererNav'
import { YamlInputModal } from './renderer/YamlInputModal'
import './App.css'

function InteractiveMenuButton() {
  const [active, setActive] = useState(false)

  const toggle = () => setActive(prev => !prev)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <MenuButton active={active} icon="Wine" onClick={toggle} />
      <span style={{ fontFamily: 'monospace', fontSize: 14 }}>
        active: <strong>{String(active)}</strong>
      </span>
      <button onClick={toggle} style={{ padding: '4px 12px', cursor: 'pointer' }}>
        Toggle active
      </button>
    </div>
  )
}

function DataTableDemo() {
  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const columns: DataTableColumn[] = [
    { key: 'name', title: 'Название', width: '240px', sticky: true, sortable: true },
    { key: 'type', title: 'Тип', width: '160px', sortable: true, filterable: true },
    { key: 'status', title: 'Статус', width: '120px', sortable: true, filterable: true,
      render: (row: any) => (
        <TableStatus severity={row.statusSeverity} size={17}>{row.status}</TableStatus>
      )
    },
    { key: 'location', title: 'Расположение', width: '200px', sortable: true, filterable: true },
    { key: 'version', title: 'Версия', width: '120px' },
  ]

  const allData = Array.from({ length: 45 }, (_, i) => {
    const statuses = [
      { status: 'Online', severity: 'success' as const },
      { status: 'Warning', severity: 'warning' as const },
      { status: 'Critical', severity: 'critical' as const },
      { status: 'Loading', severity: 'load' as const },
      { status: 'Offline', severity: 'stop' as const },
    ]
    const s = statuses[i % statuses.length]
    return {
      id: String(i + 1),
      name: `s3m-03b01-msk${String(i + 1).padStart(2, '0')}`,
      type: i % 3 === 0 ? 'LOG_PROXY' : i % 3 === 1 ? 'DB_CLUSTER' : 'APP_SERVER',
      status: s.status,
      statusSeverity: s.severity,
      location: `msk-dc${(i % 4) + 1}`,
      version: `v2.${i % 5}.${i % 3}`,
    }
  })

  const sorted = [...allData].sort((a: any, b: any) => {
    const dir = sortDir === 'asc' ? 1 : -1
    return (a[sortBy] || '').localeCompare(b[sortBy] || '') * dir
  })

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <DataTable
      data={paginated}
      columns={columns}
      selected={selected}
      onSelectionChange={setSelected}
      selectable
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={(key) => {
        if (key === sortBy) {
          setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
          setSortBy(key)
          setSortDir('asc')
        }
      }}
      pagination={{ page, pageSize, total: allData.length }}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      toolbarActions={[{ label: 'Настройка шаблонов', onClick: () => {} }]}
      bulkActions={[
        { label: 'Delete', onClick: (keys) => setSelected([]) },
        { label: 'Export', onClick: (keys) => setSelected([]) },
      ]}
      filterChips={[
        { label: 'Нормальные', active: true, onToggle: () => {} },
        { label: 'Критические', active: true, onToggle: () => {} },
        { label: 'Предупреждения', active: false, onToggle: () => {} },
      ]}
    />
  )
}

function DemoApp() {
  const [modal, setModal] = useState<'400' | '600' | '600d' | '800' | '960' | null>(null)
  const [drawer, setDrawer] = useState<'400' | '600' | '800' | '960' | null>(null)
  const [tableSelected, setTableSelected] = useState<string[]>([])
  const [tableSort, setTableSort] = useState<{ by: string; dir: 'asc' | 'desc' }>({ by: 'name', dir: 'asc' })
  const sentiments: Array<{ label: string; value: any }> = [
    { label: 'Accent', value: 'accent' },
    { label: 'Danger', value: 'danger' },
    { label: 'Warning', value: 'warning' },
    { label: 'Success', value: 'success' },
    { label: 'Info', value: 'info' },
    { label: 'Secondary', value: 'secondary' },
  ]

  const badgeColors: Array<{ label: string; value: any }> = [
    { label: 'gray', value: 'gray' },
    { label: 'gray-strong', value: 'gray-strong' },
    { label: 'gray-warm', value: 'gray-warm' },
    { label: 'nile-blue', value: 'nile-blue' },
    { label: 'tory-blue', value: 'tory-blue' },
    { label: 'cornflower-blue', value: 'cornflower-blue' },
    { label: 'bondi-blue', value: 'bondi-blue' },
    { label: 'java', value: 'java' },
    { label: 'green', value: 'green' },
    { label: 'shamrock', value: 'shamrock' },
    { label: 'yellow', value: 'yellow' },
    { label: 'orange', value: 'orange' },
    { label: 'red', value: 'red' },
    { label: 'rose', value: 'rose' },
    { label: 'violet', value: 'violet' },
  ]

  return (
    <>
    <Layout>
      <section>
        <h2>Button — Filled</h2>
        <div className="demo-row">
          {sentiments.map(s => (
            <Button key={s.value} type="filled" sentiment={s.value} size="large">
              {s.label}
            </Button>
          ))}
        </div>
        <div className="demo-row">
          {sentiments.map(s => (
            <Button key={s.value} type="filled" sentiment={s.value} size="small">
              {s.label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2>Button — Outline</h2>
        <div className="demo-row">
          {sentiments.map(s => (
            <Button key={s.value} type="outline" sentiment={s.value} size="large">
              {s.label}
            </Button>
          ))}
        </div>
        <div className="demo-row">
          {sentiments.map(s => (
            <Button key={s.value} type="outline" sentiment={s.value} size="small">
              {s.label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2>Button — Ghost</h2>
        <div className="demo-row">
          {sentiments.map(s => (
            <Button key={s.value} type="ghost" sentiment={s.value} size="large">
              {s.label}
            </Button>
          ))}
        </div>
        <div className="demo-row">
          {sentiments.map(s => (
            <Button key={s.value} type="ghost" sentiment={s.value} size="small">
              {s.label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2>Button + Icon (Left)</h2>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="large" iconPosition="left" icon="Search">Search</Button>
          <Button type="filled" sentiment="danger" size="large" iconPosition="left" icon="Trash2">Delete</Button>
          <Button type="filled" sentiment="success" size="large" iconPosition="left" icon="Download">Download</Button>
          <Button type="outline" sentiment="accent" size="large" iconPosition="left" icon="Plus">Add</Button>
          <Button type="ghost" sentiment="accent" size="large" iconPosition="left" icon="ArrowLeft">Back</Button>
        </div>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="small" iconPosition="left" icon="Search">Search</Button>
          <Button type="filled" sentiment="danger" size="small" iconPosition="left" icon="Trash2">Delete</Button>
          <Button type="outline" sentiment="accent" size="small" iconPosition="left" icon="Plus">Add</Button>
        </div>
      </section>

      <section>
        <h2>Button + Icon (Right)</h2>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="large" iconPosition="right" icon="ArrowRight">Continue</Button>
          <Button type="filled" sentiment="success" size="large" iconPosition="right" icon="Check">Confirm</Button>
          <Button type="outline" sentiment="accent" size="large" iconPosition="right" icon="ExternalLink">Open</Button>
          <Button type="ghost" sentiment="accent" size="large" iconPosition="right" icon="ChevronRight">Next</Button>
        </div>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="small" iconPosition="right" icon="ArrowRight">Continue</Button>
          <Button type="outline" sentiment="accent" size="small" iconPosition="right" icon="ExternalLink">Open</Button>
        </div>
      </section>

      <section>
        <h2>Button — Icon Only</h2>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="large" iconPosition="icon-only" icon="Plus" aria-label="Add" />
          <Button type="filled" sentiment="danger" size="large" iconPosition="icon-only" icon="Trash2" aria-label="Delete" />
          <Button type="filled" sentiment="success" size="large" iconPosition="icon-only" icon="Check" aria-label="Confirm" />
          <Button type="outline" sentiment="accent" size="large" iconPosition="icon-only" icon="Settings" aria-label="Settings" />
          <Button type="ghost" sentiment="accent" size="large" iconPosition="icon-only" icon="X" aria-label="Close" />
        </div>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="small" iconPosition="icon-only" icon="Plus" aria-label="Add" />
          <Button type="filled" sentiment="danger" size="small" iconPosition="icon-only" icon="Trash2" aria-label="Delete" />
          <Button type="outline" sentiment="accent" size="small" iconPosition="icon-only" icon="Settings" aria-label="Settings" />
          <Button type="ghost" sentiment="accent" size="small" iconPosition="icon-only" icon="X" aria-label="Close" />
        </div>
      </section>

      <section>
        <h2>Button — States</h2>
        <div className="demo-row">
          <Button type="filled" sentiment="accent" size="large" state="default">Default</Button>
          <Button type="filled" sentiment="accent" size="large" state="hover">Hover</Button>
          <Button type="filled" sentiment="accent" size="large" state="focus">Focus</Button>
          <Button type="filled" sentiment="accent" size="large" state="active">Active</Button>
          <Button type="filled" sentiment="accent" size="large" state="disabled">Disabled</Button>
        </div>
      </section>

      <section>
        <h2>Badge — Filled</h2>
        <div className="demo-row">
          {badgeColors.map(c => (
            <Badge key={c.value} color={c.value} content="text-only">{c.label}</Badge>
          ))}
        </div>
      </section>

      <section>
        <h2>Badge — Outline</h2>
        <div className="demo-row">
          {badgeColors.map(c => (
            <Badge key={c.value} color={c.value} content="outline">{c.label}</Badge>
          ))}
        </div>
      </section>

      <section>
        <h2>Badge — Text + Icon</h2>
        <div className="demo-row">
          {badgeColors.map(c => (
            <Badge key={c.value} color={c.value} content="text-and-icon" icon="Circle">{c.label}</Badge>
          ))}
        </div>
      </section>

      <section>
        <h2>Input</h2>
        <div className="demo-col" style={{ gap: 12 }}>
          <Input placeholder="Default input" />
          <Input state="warning" defaultValue="Warning value" />
          <Input state="error" defaultValue="Error value" />
          <Input state="disabled" placeholder="Disabled" />
          <Input label="Label" placeholder="With label" />
          <Input label="Label" hint="hint message" placeholder="Label + hint" />
          <Input icon="Search" iconPosition="left" placeholder="Left icon" />
          <Input icon="Search" iconPosition="right" placeholder="Right icon" />
          <Input type="password" placeholder="Password" />
          <Input type="password" defaultValue="password" placeholder="Password filled" />
          <Input type="password" state="warning" defaultValue="password" hint="hint message" />
          <Input type="password" state="error" defaultValue="password" hint="hint message" />
        </div>
      </section>

      <section>
        <h2>Dropdown</h2>
        <div className="demo-col" style={{ gap: 12 }}>
          <Dropdown placeholder="Select..." />
          <Dropdown placeholder="Selected" defaultValue="opt1" options={[{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }]} />
          <Dropdown state="warning" defaultValue="opt1" options={[{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }]} />
          <Dropdown state="error" defaultValue="opt1" options={[{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }]} />
          <Dropdown state="disabled" placeholder="Disabled" />
          <Dropdown label="Label" placeholder="Select..." />
          <Dropdown label="Label" hint="hint message" placeholder="Select..." />
          <Dropdown placeholder="Context menu">
            <MenuItem variant="context-menu" icon="Search">Search item</MenuItem>
            <MenuItem variant="context-menu" icon="User">Profile</MenuItem>
            <MenuItem variant="context-menu" icon="Settings">Settings</MenuItem>
            <MenuItem variant="context-menu" icon="LogOut">Log out</MenuItem>
          </Dropdown>
        </div>
      </section>

      <section>
        <h2>Icon (Lucide)</h2>
        <div className="demo-row">
          <Icon name="Home" size={24} />
          <Icon name="Search" size={24} />
          <Icon name="User" size={24} />
          <Icon name="Settings" size={24} />
          <Icon name="Bell" size={24} />
          <Icon name="Check" size={24} />
          <Icon name="X" size={24} />
          <Icon name="Plus" size={24} />
          <Icon name="ArrowRight" size={24} />
          <Icon name="ChevronDown" size={24} />
        </div>
      </section>

      <section>
        <h2>MenuItem</h2>
        <div className="demo-col" style={{ maxWidth: 208, gap: 8 }}>
          <MenuItem icon="ScanEye">Обзор</MenuItem>
          <MenuItem active icon="ScanEye">Обзор (active — наведи мышку)</MenuItem>
          <MenuItem icon="BookAlert">Правила оповещений</MenuItem>
          <MenuItem icon="Code">Конструктор выражений</MenuItem>
          <MenuItem icon="Users">Список получателей</MenuItem>
        </div>
      </section>

      <section>
        <h2>Status</h2>
        <div className="demo-row">
          <Status variant="default" />
          <Status variant="danger" />
          <Status variant="lock" />
        </div>
      </section>

      <section>
        <h2>Logo — All Variants</h2>
        <div className="demo-col" style={{ gap: 16 }}>
          <Logo variant="genom" />
          <Logo variant="vision" />
          <Logo variant="spektr" />
          <Logo variant="spektr-s3" />
          <Logo variant="logo" />
          <Logo variant="spektr-ai" />
        </div>
      </section>

      <section>
        <h2>MenuButton</h2>
        <div className="demo-row">
          <MenuButton icon="Wine" />
          <MenuButton active icon="Wine" />
        </div>
        <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Наведи мышку чтобы увидеть hover-состояния</p>
        <InteractiveMenuButton />
      </section>

      <section>
        <h2>Status</h2>
        <div className="demo-col" style={{ gap: 8 }}>
          <div className="demo-row" style={{ gap: 6 }}>
            <TableStatus severity="success" size={24}>Success</TableStatus>
            <TableStatus severity="degradation" size={24}>Degradation</TableStatus>
            <TableStatus severity="warning" size={24}>Warning</TableStatus>
            <TableStatus severity="critical" size={24}>Critical</TableStatus>
            <TableStatus severity="info" size={24}>Info</TableStatus>
          </div>
          <div className="demo-row" style={{ gap: 6 }}>
            <TableStatus severity="maintenance" size={24}>Maint</TableStatus>
            <TableStatus severity="additional" size={24}>Additional</TableStatus>
            <TableStatus severity="stop" size={24}>Stop</TableStatus>
            <TableStatus severity="new" size={24}>New</TableStatus>
            <TableStatus severity="load" size={24}>Loading</TableStatus>
          </div>
          <div className="demo-row" style={{ gap: 6, marginTop: 8 }}>
            <TableStatus severity="success" size={17}>17px</TableStatus>
            <TableStatus severity="warning" size={17}>17px</TableStatus>
            <TableStatus severity="critical" size={17}>17px</TableStatus>
            <TableStatus severity="info" size={17}>17px</TableStatus>
            <TableStatus severity="load" size={17}>Loading</TableStatus>
          </div>
          <div className="demo-row" style={{ gap: 6, marginTop: 8 }}>
            <TableStatus severity="success" size={24} content="text-and-icon" icon="Check">With icon</TableStatus>
            <TableStatus severity="warning" size={24} content="text-and-icon" icon="AlertTriangle">Warning</TableStatus>
            <TableStatus severity="critical" size={24} content="text-and-icon" icon="XCircle">Critical</TableStatus>
            <TableStatus severity="info" size={24} content="icon-only" icon="Info" />
            <TableStatus severity="success" size={24} content="icon-only" icon="Check" />
          </div>
          <div className="demo-row" style={{ gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>Outline:</span>
            <TableStatus severity="success" size={24} content="outline-text-only">S</TableStatus>
            <TableStatus severity="warning" size={24} content="outline-text-only">W</TableStatus>
            <TableStatus severity="critical" size={24} content="outline-text-only">C</TableStatus>
            <TableStatus severity="info" size={24} content="outline-text-only">I</TableStatus>
            <TableStatus severity="load" size={24} content="outline-text-only">L</TableStatus>
          </div>
        </div>
      </section>

      <section>
        <h2>Drawer</h2>
        <div className="demo-row" style={{ gap: 8 }}>
          <Button sentiment="secondary" size="large" onClick={() => setDrawer('400')}>400</Button>
          <Button sentiment="secondary" size="large" onClick={() => setDrawer('600')}>600</Button>
          <Button sentiment="secondary" size="large" onClick={() => setDrawer('800')}>800</Button>
          <Button sentiment="secondary" size="large" onClick={() => setDrawer('960')}>960</Button>
        </div>
      </section>

      <section style={{ width: '100%' }}>
        <h2>DataTable</h2>
        <DataTableDemo />
      </section>

      <section>
        <h2>Textarea</h2>
        <div className="demo-col" style={{ gap: 16 }}>
          <Textarea state="default" placeholder="Enter a description..." />
          <Textarea state="warning" defaultValue="Warning text" />
          <Textarea state="error" defaultValue="Error text" />
          <Textarea state="disabled" placeholder="Enter a description..." />
          <Textarea state="default" label="Label" placeholder="Enter a description..." />
          <Textarea state="default" label="Label" hint="hint message" placeholder="Enter a description..." copyText />
        </div>
      </section>

      <section>
        <h2>Modal</h2>
        <div className="demo-row" style={{ gap: 8 }}>
          <Button sentiment="accent" size="large" onClick={() => setModal('400')}>400</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal('600')}>600</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal('600d')}>600+desc</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal('800')}>800</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal('960')}>960</Button>
        </div>
      </section>
    </Layout>

    <Modal
      open={modal === '400'}
      onClose={() => setModal(null)}
      title="Modal 400"
      width={400}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setModal(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal(null)}>Confirm</Button>
        </>
      }
    >
      <p>Modal content with width 400px.</p>
      <p>This is a small modal for simple confirmations.</p>
    </Modal>

    <Modal
      open={modal === '600'}
      onClose={() => setModal(null)}
      title="Modal 600"
      width={600}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setModal(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal(null)}>Confirm</Button>
        </>
      }
    >
      <p>Medium modal with width 600px.</p>
      <p>Good for forms, detailed content, or multi-step flows.</p>
    </Modal>

    <Modal
      open={modal === '600d'}
      onClose={() => setModal(null)}
      title="Modal 600"
      description="With description line"
      width={600}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setModal(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal(null)}>Confirm</Button>
        </>
      }
    >
      <p>Medium modal with description in the header.</p>
      <p>Header height: 74px instead of 56px.</p>
    </Modal>

    <Modal
      open={modal === '800'}
      onClose={() => setModal(null)}
      title="Modal 800"
      width={800}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setModal(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal(null)}>Save</Button>
        </>
      }
    >
      <p>Large modal with width 800px.</p>
      <p>Ideal for complex forms, tables, or rich content.</p>
    </Modal>

    <Modal
      open={modal === '960'}
      onClose={() => setModal(null)}
      title="Modal 960"
      width={960}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setModal(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setModal(null)}>Submit</Button>
        </>
      }
    >
      <p>Extra large modal with width 960px.</p>
      <p>For full-featured interfaces, wizards, or dashboards.</p>
    </Modal>

    <Drawer
      open={drawer === '400'}
      onClose={() => setDrawer(null)}
      title="Drawer 400"
      width={400}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setDrawer(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setDrawer(null)}>Confirm</Button>
        </>
      }
    >
      <p>Drawer content 400px.</p>
    </Drawer>

    <Drawer
      open={drawer === '600'}
      onClose={() => setDrawer(null)}
      title="Drawer 600"
      width={600}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setDrawer(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setDrawer(null)}>Confirm</Button>
        </>
      }
    >
      <p>Drawer content 600px.</p>
    </Drawer>

    <Drawer
      open={drawer === '800'}
      onClose={() => setDrawer(null)}
      title="Drawer 800"
      width={800}
      backdrop={false}
    >
      <p>Drawer without backdrop and footer. 800px.</p>
    </Drawer>

    <Drawer
      open={drawer === '960'}
      onClose={() => setDrawer(null)}
      title="Drawer 960"
      width={960}
      footer={
        <>
          <Button type="outline" sentiment="accent" size="large" onClick={() => setDrawer(null)}>Cancel</Button>
          <Button sentiment="accent" size="large" onClick={() => setDrawer(null)}>Submit</Button>
        </>
      }
    >
      <p>Drawer content 960px.</p>
    </Drawer>
    </>
  )
}

function App() {
  const [mode, setMode] = useState<'demo' | 'yaml'>('demo')
  const playgroundRef = useRef<YamlPlaygroundHandle>(null)
  const [yamlModalOpen, setYamlModalOpen] = useState(false)

  const handleRender = (config: ScreenConfig) => {
    playgroundRef.current?.renderYaml(config)
  }

  const handleClear = () => {
    playgroundRef.current?.clear()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <RendererNav
          mode={mode}
          onModeChange={setMode}
          onClear={handleClear}
          onOpenYamlModal={() => setYamlModalOpen(true)}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {mode === 'demo' ? <DemoApp /> : (
            <YamlPlayground ref={playgroundRef} />
          )}
        </div>
      </div>

      <YamlInputModal
        open={yamlModalOpen}
        onClose={() => setYamlModalOpen(false)}
        onRender={handleRender}
      />
    </div>
  )
}

export default App
