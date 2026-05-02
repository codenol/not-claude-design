# Screen YAML Contract

Назначение: YAML-файл описывает экран демо-приложения, который рендерится через `YamlRenderer`. Документ генерируется LLM после взаимодействия с пользователем и аналитиком.

## Структура верхнего уровня

```yaml
meta:          # required — метаданные страницы
sidebar:       # optional — конфигурация сайдбара (если не указан, используются дефолтные значения)
content:       # required — массив блоков контента
```

## meta

```yaml
meta:
  title: "Страница компонентов"       # optional — заголовок страницы (для контекста)
  description: "Описание страницы"    # optional
  breadcrumbs:                        # required — хлебные крошки
    - label: "Главная"
    - label: "Компоненты"
```

## sidebar

Все поля optional. Если не указано, используются дефолтные значения (меню «Обзор», «Объекты», «Метрики» и т.д.).

```yaml
sidebar:
  logoVariant: "genom"               # genom | vision | spektr | spektr-s3 | spektr-ai (default: genom)
  avatarInitials: "AB"              # default: "AB"
  statusVariant: "lock"             # default | lock (default: lock)
  menuSections:
    - title: "Управление"           # optional — заголовок секции
      items:
        - icon: "Binoculars"        # Lucide icon name
          label: "Обзор"
          active: true              # optional, default false
        - icon: "Network"
          label: "Объекты"
    - title: "Настройки"
      items:
        - icon: "PencilRuler"
          label: "Метрики"
        - icon: "BellRing"
          label: "Правила оповещений"
```

## content

Массив блоков. Каждый блок имеет обязательное поле `type` и специфичные для типа поля.

### Блоки-контейнеры

#### section
Секция с заголовком. Содержит дочерние блоки в `items`.

```yaml
- type: section
  heading: "Button — Filled"         # optional
  direction: row                     # row | col (default: row)
  gap: 8                             # gap между элементами в px (default: 8)
  items:                             # required — массив блоков
    - type: button
      label: "Accent"
      sentiment: "accent"
      filled: true
      size: "large"
    - type: button
      label: "Danger"
      sentiment: "danger"
      filled: true
      size: "large"
```

#### row
Горизонтальный ряд элементов.

```yaml
- type: row
  gap: 8
  items: [...]
```

#### col
Вертикальная колонка элементов.

```yaml
- type: col
  gap: 12
  items: [...]
```

### Атомы

#### button
Отрисовывает компонент `<Button>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `label` | string | — | Текст кнопки (required) |
| `sentiment` | accent \| danger \| warning \| success \| info \| secondary | accent | Цветовая схема |
| `filled` | boolean | true | true=filled, false=смотрит на outline |
| `outline` | boolean | false | Если filled=false: true=outline, false=ghost |
| `size` | large \| small | large | Размер |
| `icon` | string | — | Имя Lucide-иконки |
| `iconPosition` | left \| right \| icon-only | — | Позиция иконки |
| `disabled` | boolean | false | Заблокирована |
| `state` | default \| hover \| focus \| active \| disabled | default | Визуальное состояние |

```yaml
# Filled кнопка
- type: button
  label: "Accent"
  sentiment: "accent"
  filled: true
  size: "large"

# Outline кнопка с иконкой слева
- type: button
  label: "Search"
  sentiment: "accent"
  filled: false
  outline: true
  icon: "Search"
  iconPosition: "left"
  size: "large"

# Ghost кнопка
- type: button
  label: "Back"
  sentiment: "accent"
  filled: false
  icon: "ArrowLeft"
  iconPosition: "left"
  size: "large"

# Icon-only кнопка
- type: button
  label: "Add"
  sentiment: "accent"
  filled: true
  icon: "Plus"
  iconPosition: "icon-only"
  size: "large"

# Disabled state
- type: button
  label: "Disabled"
  sentiment: "accent"
  state: "disabled"
```

#### badge
Отрисовывает компонент `<Badge>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `label` | string | — | Текст бейджа (required) |
| `color` | gray \| gray-strong \| gray-warm \| nile-blue \| tory-blue \| cornflower-blue \| bondi-blue \| java \| green \| shamrock \| yellow \| orange \| red \| rose \| violet | gray | Цвет |
| `content` | text-only \| text-and-icon \| outline | text-only | Тип отображения |
| `icon` | string | — | Имя Lucide-иконки (для text-and-icon) |

```yaml
- type: badge
  label: "gray"
  color: "gray"
  content: "text-only"
```

#### input
Отрисовывает компонент `<Input>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `placeholder` | string | Input | Placeholder |
| `state` | default \| warning \| error \| disabled | default | Состояние |
| `label` | string | — | Лейбл над полем |
| `hint` | string | — | Подсказка под полем |
| `icon` | string | — | Имя Lucide-иконки |
| `iconPosition` | left \| right | — | Позиция иконки |
| `type` | string | text | text \| password |
| `value` | string | — | Значение по умолчанию |

```yaml
- type: input
  placeholder: "Enter email"
  label: "Email"
  icon: "Mail"
  iconPosition: "left"
```

#### textarea
Отрисовывает компонент `<Textarea>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `placeholder` | string | Enter a description... | Placeholder |
| `state` | default \| warning \| error \| disabled | default | Состояние |
| `label` | string | — | Лейбл |
| `hint` | string | — | Подсказка |
| `value` | string | — | Значение |
| `copyText` | boolean | false | Показать кнопку копирования |

```yaml
- type: textarea
  placeholder: "Enter a description..."
  label: "Description"
  hint: "Hint message"
  copyText: true
```

#### tablestatus
Отрисовывает компонент `<TableStatus>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `label` | string | — | Текст (если не icon-only) |
| `severity` | success \| degradation \| warning \| critical \| info \| maintenance \| additional \| stop \| new \| load | info | Серьёзность |
| `size` | 17 \| 24 | 24 | Размер |
| `content` | text-only \| text-and-icon \| icon-only \| outline-text-only | text-only | Тип отображения |
| `icon` | string | — | Иконка (для text-and-icon/icon-only) |

```yaml
- type: tablestatus
  label: "Success"
  severity: "success"
  size: 24
  content: "text-and-icon"
  icon: "Check"
```

#### text
Отрисовывает простой параграф текста.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `content` | string | — | Текст (required) |
| `variant` | body \| caption \| subtle | body | Стиль текста |

```yaml
- type: text
  content: "This is a paragraph of text."
  variant: "body"
```

#### heading
Отрисовывает заголовок h2 или h3.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `content` | string | — | Текст (required) |
| `level` | 2 \| 3 | 2 | Уровень заголовка |

```yaml
- type: heading
  content: "Page Title"
  level: 2
```

### Молекулы

#### dropdown
Отрисовывает компонент `<Dropdown>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `placeholder` | string | Select... | Placeholder |
| `state` | default \| warning \| error \| disabled | default | Состояние |
| `label` | string | — | Лейбл |
| `hint` | string | — | Подсказка |
| `options` | array | [] | Массив {label, value} |
| `value` | string | — | Выбранное значение |

```yaml
- type: dropdown
  placeholder: "Select..."
  label: "Status"
  options:
    - label: "Option 1"
      value: "opt1"
    - label: "Option 2"
      value: "opt2"
  value: "opt1"
```

### Организмы

#### datatable
Отрисовывает компонент `<DataTable>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `columns` | array | — | Колонки таблицы |
| `data` | array | — | Данные (или используй `generateRows`) |
| `generateRows` | number | — | Автогенерация N строк с демо-данными |
| `selectable` | boolean | true | Чекбоксы выбора строк |
| `pageSize` | number | 10 | Размер страницы |
| `searchPlaceholder` | string | Поиск | Placeholder поиска |
| `toolbarActions` | array | — | Кнопки тулбара [{label, onClick}] |
| `bulkActions` | array | — | Массовые действия [{label, onClick}] |
| `filterChips` | array | — | Фильтр-чипсы [{label, active}] |

```yaml
- type: datatable
  columns:
    - key: "name"
      title: "Название"
      width: "240px"
      sortable: true
      sticky: true
    - key: "type"
      title: "Тип"
      width: "160px"
      filterable: true
    - key: "status"
      title: "Статус"
      width: "120px"
      sortable: true
      filterable: true
      statusColumn: true
    - key: "location"
      title: "Расположение"
  generateRows: 45
  pageSize: 10
  toolbarActions:
    - label: "Настройка шаблонов"
  bulkActions:
    - label: "Delete"
    - label: "Export"
  filterChips:
    - label: "Нормальные"
      active: true
    - label: "Критические"
      active: true
    - label: "Предупреждения"
      active: false
```

#### modal-trigger
Отрисовывает кнопку, открывающую `<Modal>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `buttonLabel` | string | — | Текст кнопки (required) |
| `buttonSentiment` | string | accent | sentiment кнопки |
| `title` | string | — | Заголовок модалки (required) |
| `description` | string | — | Описание |
| `width` | 400 \| 600 \| 800 \| 960 | 400 | Ширина модалки |
| `content` | array | — | Контент модалки (блоки) |
| `footerButtons` | array | — | Кнопки футера [{label, sentiment, type, action}] |

```yaml
- type: modal-trigger
  buttonLabel: "Open Modal 600"
  buttonSentiment: "accent"
  title: "Modal Title"
  description: "Optional description"
  width: 600
  content:
    - type: text
      content: "Modal body content here."
  footerButtons:
    - label: "Cancel"
      sentiment: "accent"
      type: "outline"
      action: "close"
    - label: "Confirm"
      sentiment: "accent"
      action: "close"
```

#### drawer-trigger
Отрисовывает кнопку, открывающую `<Drawer>`.

| Поле | Тип | Default | Описание |
|------|-----|---------|----------|
| `buttonLabel` | string | — | Текст кнопки (required) |
| `buttonSentiment` | string | secondary | sentiment кнопки |
| `title` | string | — | Заголовок (required) |
| `width` | 400 \| 600 \| 800 \| 960 | 400 | Ширина |
| `backdrop` | boolean | true | Затемнение фона |
| `content` | array | — | Контент (блоки) |
| `footerButtons` | array | — | Кнопки футера |

```yaml
- type: drawer-trigger
  buttonLabel: "Open Drawer 400"
  buttonSentiment: "secondary"
  title: "Drawer Title"
  width: 400
  backdrop: true
  content:
    - type: text
      content: "Drawer content here."
  footerButtons:
    - label: "Cancel"
      sentiment: "accent"
      type: "outline"
      action: "close"
    - label: "Confirm"
      sentiment: "accent"
      action: "close"
```

#### form
Отрисовывает группу полей ввода.

```yaml
- type: form
  gap: 12
  items:
    - type: input
      label: "Name"
      placeholder: "Enter name"
    - type: input
      label: "Email"
      placeholder: "Enter email"
    - type: dropdown
      label: "Role"
      options:
        - label: "Admin"
          value: "admin"
    - type: textarea
      label: "Notes"
    - type: row
      gap: 8
      items:
        - type: button
          label: "Cancel"
          sentiment: "secondary"
          filled: false
        - type: button
          label: "Submit"
          sentiment: "accent"
```

## Полный пример

```yaml
meta:
  title: "Dashboard Demo"
  description: "Демо-страница дашборда"
  breadcrumbs:
    - label: "Главная"
    - label: "Дашборды"
    - label: "Demo"

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
    heading: "Кнопки"
    direction: row
    gap: 8
    items:
      - type: button
        label: "Accent"
        sentiment: "accent"
        filled: true
        size: "large"
      - type: button
        label: "Danger"
        sentiment: "danger"
        filled: true
        size: "large"
      - type: button
        label: "Warning"
        sentiment: "warning"
        filled: true
        size: "large"

  - type: section
    heading: "Inputs"
    direction: col
    gap: 12
    items:
      - type: input
        placeholder: "Default input"
      - type: input
        state: "warning"
        value: "Warning value"
      - type: input
        state: "error"
        value: "Error value"

  - type: datatable
    columns:
      - key: "name"
        title: "Name"
        sortable: true
        sticky: true
      - key: "status"
        title: "Status"
        statusColumn: true
    generateRows: 25
```

## Правила для LLM

1. Каждый блок в `content` должен иметь поле `type`.
2. Порядок блоков в `content` определяет порядок рендеринга сверху вниз.
3. Иконки используют имена из библиотеки Lucide Icons.
4. Для генерации демо-таблиц используй `generateRows` вместо ручного перечисления данных.
5. Сайдбар и хлебные крошки — опциональны. Если не указаны, используются дефолтные значения.
6. Все цвета, шрифты, отступы задаются через CSS-переменные — не указывай их в YAML.
