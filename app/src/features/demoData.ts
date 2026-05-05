import type { PRD } from './types'

export const DEMO_DESCRIPTION = 'Список бекапов кластера pantoni — таблица с фильтрацией по статусу, дате и кластеру, с возможностью восстановления из бекапа и планирования расписания.'

export const DEMO_PRD: PRD = {
  personas: [
    {
      id: 'demo-p1',
      name: 'Александр Ковалёв',
      role: 'Системный администратор',
      goal: 'Быстро находить актуальные бекапы кластера pantoni и восстанавливать данные при сбоях',
      painPoints: [
        'Долго искать нужный бекап среди сотен записей',
        'Нет быстрого способа сравнить бекапы по дате',
        'Сложно отследить статус восстановления',
      ],
    },
    {
      id: 'demo-p2',
      name: 'Марина Громова',
      role: 'DevOps-инженер',
      goal: 'Настроить автоматическое резервное копирование кластеров и мониторить расписание',
      painPoints: [
        'Расписание бекапов не синхронизировано между кластерами',
        'Нет единого дашборда по всем кластерам',
        'Оповещения о сбоях бекапов приходят с задержкой',
      ],
    },
  ],
  useCases: [
    {
      id: 'demo-uc1',
      title: 'Просмотр списка бекапов',
      actor: 'Системный администратор',
      goal: 'Увидеть все бекапы кластера pantoni с фильтрацией по статусу и дате',
      trigger: 'Открыл страницу бекапов',
      mainFlow: [
        { actor: 'user', action: 'Открывает страницу «Бекапы»', screenId: 'demo-s1' },
        { actor: 'system', action: 'Загружает список бекапов из API' },
        { actor: 'system', action: 'Отображает таблицу с колонками: название, кластер, дата, размер, статус' },
        { actor: 'user', action: 'Фильтрует по статусу «Успешно»' },
        { actor: 'system', action: 'Обновляет таблицу, показывая только успешные бекапы' },
      ],
      errorFlows: [{ condition: 'API бекапов недоступно', resolution: 'Показать заглушку с кнопкой «Повторить» и последними кешированными данными' }],
      relatedFeatures: [],
    },
    {
      id: 'demo-uc2',
      title: 'Восстановление из бекапа',
      actor: 'DevOps-инженер',
      goal: 'Восстановить данные кластера из выбранного бекапа',
      trigger: 'Нажал кнопку «Восстановить» в строке бекапа',
      mainFlow: [
        { actor: 'user', action: 'Находит нужный бекап в таблице', screenId: 'demo-s1' },
        { actor: 'user', action: 'Нажимает «Восстановить» в строке бекапа', screenId: 'demo-s1' },
        { actor: 'system', action: 'Показывает модальное окно подтверждения с выбором целевого кластера' },
        { actor: 'user', action: 'Выбирает кластер и подтверждает восстановление' },
        { actor: 'system', action: 'Запускает задачу восстановления и показывает прогресс' },
      ],
      errorFlows: [{ condition: 'Целевой кластер недоступен', resolution: 'Показать ошибку с предложением выбрать другой кластер или повторить позже' }],
      relatedFeatures: [],
    },
    {
      id: 'demo-uc3',
      title: 'Планирование бекапов',
      actor: 'DevOps-инженер',
      goal: 'Создать расписание автоматического резервного копирования для кластера',
      trigger: 'Перешёл на вкладку «Расписание»',
      mainFlow: [
        { actor: 'user', action: 'Открывает страницу «Расписание бекапов»', screenId: 'demo-s3' },
        { actor: 'system', action: 'Показывает список активных расписаний' },
        { actor: 'user', action: 'Нажимает «Создать расписание»' },
        { actor: 'system', action: 'Показывает форму: кластер, периодичность (cron), retention (дней)' },
        { actor: 'user', action: 'Заполняет форму и сохраняет' },
        { actor: 'system', action: 'Создаёт расписание и добавляет в список' },
      ],
      errorFlows: [{ condition: 'Некорректное cron-выражение', resolution: 'Показать валидационную ошибку с подсказкой формата' }],
      relatedFeatures: [],
    },
  ],
  dataModel: [
    {
      id: 'demo-e1',
      name: 'Backup',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'clusterId', type: 'string', required: true },
        { name: 'sizeBytes', type: 'number', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'createdAt', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
      ],
      relations: [{ target: 'Cluster', type: '1:1' }],
    },
    {
      id: 'demo-e2',
      name: 'Cluster',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'environment', type: 'enum', required: true },
        { name: 'region', type: 'string', required: true },
        { name: 'nodeCount', type: 'number', required: false },
      ],
      relations: [{ target: 'Backup', type: '1:N' }, { target: 'BackupSchedule', type: '1:N' }],
    },
    {
      id: 'demo-e3',
      name: 'BackupSchedule',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'clusterId', type: 'string', required: true },
        { name: 'cronExpression', type: 'string', required: true },
        { name: 'retentionDays', type: 'number', required: true },
        { name: 'enabled', type: 'boolean', required: true },
        { name: 'lastRunAt', type: 'datetime', required: false },
        { name: 'nextRunAt', type: 'datetime', required: false },
      ],
      relations: [{ target: 'Cluster', type: '1:1' }],
    },
  ],
  screenInventory: [
    {
      id: 'demo-s1',
      title: 'Список бекапов',
      purpose: 'Таблица всех бекапов кластера pantoni с фильтрацией по статусу, дате и кластеру. Быстрые действия: восстановить, скачать, удалить.',
      relatedUseCases: ['demo-uc1', 'demo-uc2'],
      keyElements: [
        { type: 'datatable', label: 'Таблица бекапов', dataBinding: 'Backup' },
        { type: 'badge', label: 'Статус бекапа', dataBinding: 'Backup.status' },
        { type: 'button', label: 'Восстановить', dataBinding: 'Backup.id' },
      ],
    },
    {
      id: 'demo-s2',
      title: 'Детали бекапа',
      purpose: 'Карточка с полной информацией о бекапе: размер, длительность, кластер, логи восстановления.',
      relatedUseCases: ['demo-uc2'],
      keyElements: [
        { type: 'text', label: 'Название бекапа', dataBinding: 'Backup.name' },
        { type: 'text', label: 'Размер', dataBinding: 'Backup.sizeBytes' },
        { type: 'badge', label: 'Тип бекапа', dataBinding: 'Backup.type' },
        { type: 'button', label: 'Восстановить', dataBinding: 'Backup.id' },
      ],
    },
    {
      id: 'demo-s3',
      title: 'Расписание бекапов',
      purpose: 'Управление расписаниями автоматического резервного копирования: создание, редактирование, включение/отключение.',
      relatedUseCases: ['demo-uc3'],
      keyElements: [
        { type: 'datatable', label: 'Список расписаний', dataBinding: 'BackupSchedule' },
        { type: 'button', label: 'Создать расписание', dataBinding: '' },
        { type: 'input', label: 'Cron-выражение', dataBinding: 'BackupSchedule.cronExpression' },
      ],
    },
  ],
  variantMatrix: [
    { axis: 'layout', description: 'Расположение навигации и контента' },
    { axis: 'density', description: 'Плотность отображения данных в таблице' },
  ],
}

export const DEMO_YAMLS = [
  {
    id: 'sidebar',
    name: 'V1 — Sidebar layout',
    params: { layout: 'sidebar', density: 'comfortable' },
    yaml: `meta:
  title: "Бекапы pantoni"
  breadcrumbs:
    - label: "Главная"
    - label: "Кластеры"
    - label: "Бекапы pantoni"
sidebar:
  logoVariant: "genom"
  menuSections:
    - items:
        - icon: "HardDrive"
          label: "Кластеры"
        - icon: "Database"
          label: "Бекапы"
          active: true
        - icon: "Clock"
          label: "Расписание"
content:
  - type: section
    heading: "Бекапы кластера pantoni"
    direction: row
    gap: 16
    items:
      - type: text
        content: "Список резервных копий кластера pantoni (prod, регион msq). Автоматические бекапы — каждый день в 03:00 МСК."
        variant: "body"
  - type: row
    gap: 12
    items:
      - type: input
        placeholder: "Поиск по названию..."
        icon: "Search"
      - type: dropdown
        placeholder: "Статус"
        options:
          - label: "Все"
            value: "all"
          - label: "Успешно"
            value: "success"
          - label: "Ошибка"
            value: "error"
          - label: "В процессе"
            value: "in_progress"
  - type: datatable
    columns:
      - key: "name"
        title: "Название"
        sortable: true
        sticky: true
      - key: "cluster"
        title: "Кластер"
      - key: "created"
        title: "Дата"
        sortable: true
      - key: "size"
        title: "Размер"
      - key: "type"
        title: "Тип"
      - key: "status"
        title: "Статус"
        statusColumn: true
    generateRows: 12
    searchPlaceholder: "Поиск бекапа..."
    toolbarActions:
      - label: "Создать бекап"
      - label: "Экспорт"
    bulkActions:
      - label: "Удалить"
      - label: "Сравнить"
`,
  },
  {
    id: 'topnav',
    name: 'V2 — Top Nav layout',
    params: { layout: 'topnav', density: 'comfortable' },
    yaml: `meta:
  title: "Бекапы pantoni"
  breadcrumbs:
    - label: "Главная"
    - label: "Кластеры"
    - label: "Бекапы pantoni"
content:
  - type: section
    heading: "Бекапы кластера pantoni"
    direction: col
    gap: 16
    items:
      - type: row
        gap: 12
        items:
          - type: input
            placeholder: "Поиск бекапа..."
            icon: "Search"
          - type: button
            label: "Создать бекап"
            sentiment: "accent"
            filled: true
          - type: button
            label: "Расписание"
            sentiment: "secondary"
            outline: true
      - type: datatable
        columns:
          - key: "name"
            title: "Название"
            sortable: true
            sticky: true
          - key: "cluster"
            title: "Кластер"
          - key: "created"
            title: "Дата создания"
            sortable: true
          - key: "size"
            title: "Размер"
          - key: "type"
            title: "Тип"
          - key: "status"
            title: "Статус"
            statusColumn: true
        generateRows: 18
        searchPlaceholder: "Фильтр по названию..."
        toolbarActions:
          - label: "Экспорт"
        filterChips:
          - label: "Все"
            active: true
          - label: "Успешно"
            active: false
          - label: "С ошибкой"
            active: false
          - label: "За сегодня"
            active: false
`,
  },
  {
    id: 'minimal',
    name: 'V3 — Minimal layout',
    params: { layout: 'minimal', density: 'compact' },
    yaml: `meta:
  title: "Бекапы pantoni"
  breadcrumbs:
    - label: "Бекапы"
content:
  - type: datatable
    columns:
      - key: "name"
        title: "Название"
        sortable: true
      - key: "cluster"
        title: "Кластер"
      - key: "created"
        title: "Дата"
        sortable: true
      - key: "size"
        title: "Размер"
      - key: "status"
        title: "Статус"
        statusColumn: true
    generateRows: 25
    searchPlaceholder: "Поиск..."
    pageSize: 10
    selectable: true
    bulkActions:
      - label: "Восстановить"
      - label: "Скачать"
      - label: "Удалить"
`,
  },
]
