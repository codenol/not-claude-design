import type { NorkaFsNode } from './types'
import * as nf from '../services/norkaFs'

const NOW = new Date().toISOString()

function prdJson() {
  return {
    personas: [
      { id: 'p1', name: 'Оператор', role: 'Дежурный инженер', goal: 'Быстро находить проблемные объекты на карте и реагировать', painPoints: ['Много уведомлений', 'Не видно связи между объектами'] },
      { id: 'p2', name: 'Руководитель смены', role: 'Старший смены', goal: 'Видеть общую картину по всем объектам', painPoints: ['Долго собирать отчёт', 'Нет сводного статуса'] },
    ],
    useCases: [
      {
        id: 'uc1', title: 'Просмотр онлайн-карты', actor: 'Оператор',
        goal: 'Увидеть все объекты на карте с их статусами', trigger: 'Открыл дашборд',
        mainFlow: [
          { actor: 'user', action: 'Открывает страницу дашборда', screenId: 's1' },
          { actor: 'system', action: 'Загружает геоданные объектов' },
          { actor: 'system', action: 'Отображает маркеры на карте с цветовой индикацией статуса' },
          { actor: 'user', action: 'Нажимает на маркер' },
          { actor: 'system', action: 'Показывает карточку объекта с деталями' },
        ],
        errorFlows: [{ condition: 'Нет соединения с API', resolution: 'Показать заглушку с кнопкой Retry' }],
        relatedFeatures: ['f-online-map'],
      },
    ],
    dataModel: [
      {
        id: 'e1', name: 'Object',
        fields: [{ name: 'id', type: 'string', required: true }, { name: 'name', type: 'string', required: true }, { name: 'status', type: 'enum', required: true }, { name: 'coordinates', type: 'geo', required: true }],
        relations: [{ target: 'Alert', type: '1:N' }],
      },
      {
        id: 'e2', name: 'Alert',
        fields: [{ name: 'id', type: 'string', required: true }, { name: 'severity', type: 'enum', required: true }, { name: 'message', type: 'string', required: true }, { name: 'timestamp', type: 'datetime', required: true }],
        relations: [{ target: 'Object', type: '1:1' }],
      },
    ],
    screenInventory: [
      {
        id: 's1', title: 'Дашборд с картой', purpose: 'Отображение объектов на карте с фильтрацией по статусу и геозоне',
        relatedUseCases: ['uc1'],
        keyElements: [
          { type: 'map', label: 'Интерактивная карта', dataBinding: 'Object.coordinates' },
          { type: 'datatable', label: 'Список объектов', dataBinding: 'Object' },
          { type: 'badge', label: 'Индикатор статуса', dataBinding: 'Object.status' },
        ],
      },
    ],
    variantMatrix: [
      { axis: 'layout', description: 'Расположение основного контента' },
      { axis: 'density', description: 'Плотность информации' },
      { axis: 'navigation', description: 'Способ навигации' },
    ],
  }
}

function sidebarYaml() {
  return `meta:
  title: "Онлайн-карта"
  breadcrumbs:
    - label: "Главная"
    - label: "Дашборды"
    - label: "Онлайн-карта"
sidebar:
  logoVariant: "genom"
  menuSections:
    - items:
        - icon: "Binoculars"
          label: "Обзор"
          active: true
        - icon: "Network"
          label: "Объекты"
content:
  - type: section
    heading: "Объекты на карте"
    direction: row
    gap: 16
    items:
      - type: text
        content: "Карта с объектами (sidebar layout)"
        variant: "body"
  - type: datatable
    columns:
      - key: "name"
        title: "Название"
        sortable: true
        sticky: true
      - key: "status"
        title: "Статус"
        statusColumn: true
    generateRows: 25
`
}

function topNavYaml() {
  return `meta:
  title: "Онлайн-карта"
  breadcrumbs:
    - label: "Главная"
    - label: "Объекты"
content:
  - type: row
    gap: 16
    items:
      - type: text
        content: "Карта с объектами (top nav layout)"
        variant: "body"
      - type: datatable
        columns:
          - key: "name"
            title: "Название"
            sortable: true
            sticky: true
          - key: "status"
            title: "Статус"
            statusColumn: true
        generateRows: 25
`
}

function minimalYaml() {
  return `meta:
  title: "Объекты"
  breadcrumbs:
    - label: "Объекты"
content:
  - type: datatable
    columns:
      - key: "name"
        title: "Название"
        sortable: true
      - key: "status"
        title: "Статус"
        statusColumn: true
    generateRows: 25
`
}

function writeVariant(root: NorkaFsNode, basePath: string, id: string, name: string, params: Record<string, string>, yaml: string) {
  let header = `# name: ${name}\n`
  for (const [k, v] of Object.entries(params)) {
    header += `# param ${k} ${v}\n`
  }
  nf.writeFile(root, `${basePath}/variants/${id}.yaml`, header + '\n' + yaml)
}

export function createEmptyTree(): NorkaFsNode {
  return {
    name: '',
    type: 'dir',
    children: [],
  }
}

export function createDemoTree(): NorkaFsNode {
  const root = createEmptyTree()

  const projectId = 'platforma-monitoringa'
  const base = `projects/${projectId}`

  nf.writeFile(root, `${base}/project.json`, JSON.stringify({
    name: 'Платформа мониторинга',
    createdAt: NOW,
    team: [
      { role: 'ПО', userId: 'u-po', name: 'Алексей' },
      { role: 'Аналитик', userId: 'u-an', name: 'Мария' },
      { role: 'Дизайнер', userId: 'u-ds', name: 'Дмитрий' },
      { role: 'Фронтендер', userId: 'u-fe', name: 'Иван' },
      { role: 'QA', userId: 'u-qa', name: 'Елена' },
    ],
  }, null, 2))

  const pages = {
    dashboards: 'Дашборды',
    objects: 'Объекты',
  }

  for (const [pageId, pageName] of Object.entries(pages)) {
    nf.writeFile(root, `${base}/pages/${pageId}/page.json`, JSON.stringify({ name: pageName, order: pageId === 'dashboards' ? 0 : 1 }, null, 2))
  }

  const features = [
    {
      id: 'online-map', title: 'Онлайн-карта', description: 'Интерактивная карта с объектами', status: 'analytics',
      versions: [{ major: 1, minor: 0, stage: 'analytics', selectedVariant: null, withPrd: true, withVariants: false, withComments: false }],
    },
    {
      id: 'load-graphs', title: 'Графики нагрузки', description: 'Графики загрузки объектов', status: 'analytics',
      versions: [
        { major: 2, minor: 3, stage: 'analytics', selectedVariant: null, withPrd: false, withVariants: true, withComments: true },
        { major: 2, minor: 2, stage: 'discussion', selectedVariant: null, withPrd: false, withVariants: true, withComments: false },
        { major: 1, minor: 0, stage: 'analytics', selectedVariant: null, withPrd: false, withVariants: false, withComments: false },
      ],
    },
    {
      id: 'object-list', title: 'Список объектов', description: 'Таблица с фильтрацией объектов', status: 'analytics',
      versions: [
        { major: 1, minor: 2, stage: 'analytics', selectedVariant: null, withPrd: false, withVariants: true, withComments: true },
        { major: 1, minor: 1, stage: 'prototypes', selectedVariant: null, withPrd: false, withVariants: true, withComments: false },
      ],
    },
  ]

  for (const f of features) {
    const featPath = `${base}/pages/dashboards/features/${f.id}`
    nf.writeFile(root, `${featPath}/feature.json`, JSON.stringify({
      title: f.title,
      description: f.description,
      status: f.status,
      assignedTo: { analytics: 'Аналитик-1', prototypes: 'Дизайнер-1' },
      selectedVariantId: null,
    }, null, 2))

    for (const v of f.versions) {
      const verPath = `${featPath}/versions/v${v.major}.${v.minor}`
      nf.writeFile(root, `${verPath}/version.json`, JSON.stringify({
        major: v.major, minor: v.minor, stage: v.stage, selectedVariant: v.selectedVariant, createdAt: NOW,
      }, null, 2))

      if (v.withPrd) {
        nf.writeFile(root, `${verPath}/prd.json`, JSON.stringify(prdJson(), null, 2))
      }

      if (v.withVariants) {
        writeVariant(root, verPath, 'sidebar', 'V1 — Sidebar layout', { layout: 'sidebar', density: 'comfortable' }, sidebarYaml())
        writeVariant(root, verPath, 'topnav', 'V2 — Top Nav layout', { layout: 'topnav', density: 'comfortable' }, topNavYaml())
        writeVariant(root, verPath, 'minimal', 'V3 — Minimal layout', { layout: 'minimal', density: 'compact' }, minimalYaml())
      }

      if (v.withComments) {
        nf.writeFile(root, `${verPath}/comments.json`, JSON.stringify([{
          id: 'c1',
          variantId: 'sidebar',
          anchor: { type: 'yaml-node', path: 'content[0]' },
          x: 120, y: 80,
          messages: [
            { author: 'ПО', text: 'Тут нужен подзаголовок с описанием карты для новых пользователей?', timestamp: NOW },
            { author: 'Дизайнер', text: 'Добавил в v2.1, смотри обновлённый макет', timestamp: NOW },
          ],
          resolved: false,
        }], null, 2))
      }
    }
  }

  nf.writeFile(root, `${base}/pages/objects/features/logging/feature.json`, JSON.stringify({
    title: 'Логирование',
    description: 'Просмотр логов объектов',
    status: 'analytics',
    assignedTo: {},
    selectedVariantId: null,
  }, null, 2))

  return root
}
