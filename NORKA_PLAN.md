# Norka — План реализации

## Архитектура

### Хранилище

```
┌───────────────────────────────────────────────────┐
│                    UI Layer                         │
│  ProjectsPage / FeatureWorkspace / Stages           │
│       ↕ domain objects (Project, Feature, PRD)     │
├───────────────────────────────────────────────────┤
│              NorkaRepo (domain mapper)              │
│   FS tree ↔ domain objects (Project/Page/Feature)  │
│       ↕                                            │
├──────────────────────────┬────────────────────────┤
│     INorkaStorage        │     INorkaGit           │
│     (interface)          │     (interface)         │
├──────────────────────────┼────────────────────────┤
│  ┌──────────────────┐    │  ┌──────────────────┐   │
│  │ IndexedDBStorage │    │  │    NoopGit       │   │
│  │   (web, сейчас)  │    │  │ (заглушка, пока) │   │
│  └──────────────────┘    │  └──────────────────┘   │
│                          │                         │
│  ┌──────────────────┐    │  ┌──────────────────┐   │
│  │  TauriFSStorage  │    │  │  TauriLibGit     │   │
│  │  (будет потом)   │    │  │  (будет потом)   │   │
│  │  Rust: fs + path │    │  │  Rust: libgit2   │   │
│  └──────────────────┘    │  └──────────────────┘   │
└──────────────────────────┴────────────────────────┘
```

### Ролевая модель

| Роль | Цвет | Hex |
|---|---|---|
| ПО | Фиолетовый | `#7C3AED` |
| Аналитик | Синий | `#2563EB` |
| Дизайнер | Розовый | `#EC4899` |
| Фронтендер | Голубой | `#06B6D4` |
| Бэкендер | Зелёный | `#10B981` |
| Архитектор | Оранжевый | `#F97316` |
| Деливери | Янтарный | `#D97706` |
| QA | Красный | `#EF4444` |

### Workflow (стадии фичи)

```
  draft ──────► analytics      ПО инициирует фичу
  analytics ──► prototypes      Аналитик завершил PRD
  prototypes ─► discussion      Дизайнер утвердил макеты
  discussion ─► final           ★ Выбран финальный вариант, правок нет
  discussion ─► analytics       Правки в аналитике → minor +1
  discussion ─► prototypes      Правки в макетах → minor +1
  final ──────► published       Оформление завершено
  published ──► analytics       ПО переоткрыл → major +1
```

### Версионирование

Major version — только когда ПО переоткрывает фичу.
Minor version — автоматический инкремент при любом возврате на доработку после Стадии 2.

### Файловая структура проекта

```
workspace/
└── projects/
    └── {project-name}/
        ├── project.json
        └── pages/
            └── {page-name}/
                ├── page.json
                └── features/
                    └── {feature-name}/
                        ├── feature.json
                        └── versions/
                            └── v{major}.{minor}/
                                ├── version.json
                                ├── prd.json
                                ├── variants/
                                │   ├── {variant-name}.yaml
                                │   └── ...
                                └── comments.json
```

---

## Файлы реализации

```
app/src/
├── services/
│   ├── norkaStorage.ts        # INorkaStorage interface
│   ├── indexedDbStorage.ts    # IndexedDB impl
│   ├── norkaGit.ts            # INorkaGit interface + NoopGit
│   ├── norkaRepo.ts           # domain mapper: tree ↔ objects
│   ├── roleConfig.ts          # роли + цвета + иконки
│   └── norkaFs.ts             # низкоуровневые операции с деревом
│
├── features/
│   ├── types.ts               # Project, Page, Feature, FeatureVersion, PRD, CommentThread...
│   ├── workflowMachine.ts     # state machine стадий
│   └── mockData.ts            # демо-дерево для разработки
│
├── pages/
│   ├── EntryPage.tsx           # Библиотеки vs Проекты
│   ├── LibrariesPage.tsx       # Список DS-библиотек
│   ├── ProjectsPage.tsx        # Аккордеон-дерево с ProgressDots
│   └── FeatureWorkspace.tsx    # Layout: Sidebar стадий + Content
│
├── stages/
│   ├── AnalyticsStage.tsx      # PRD Builder (5 табов)
│   ├── PrototypesStage.tsx     # Табы вариантов + полноразмерный макет + Drawer YAML
│   ├── DiscussionStage.tsx     # Pin-based комментарии + плавающая панель
│   └── FinalizeStage.tsx       # Rich Format + публикация
│
├── prd-builder/
│   ├── PersonaEditor.tsx
│   ├── UseCaseEditor.tsx
│   ├── DataModelEditor.tsx
│   ├── ScreenInventoryEditor.tsx
│   ├── VariantMatrixEditor.tsx
│   ├── CompletenessCheck.tsx
│   └── PrdExport.tsx
│
├── comments/
│   ├── CommentThread.tsx
│   ├── PinMarker.tsx
│   └── FloatingPanel.tsx
│
├── components/atoms/
│   └── ProgressDots/           # новый atom: 4 точки-индикатора стадий
│       ├── ProgressDots.tsx
│       ├── ProgressDots.module.css
│       └── index.ts
│
└── contracts/
    ├── screen-contract.schema.json  # уже есть
    └── prd.schema.json              # новый: JSON Schema для structured PRD
```

---

## Порядок реализации

### Фаза 0 — Фундамент
1. `features/types.ts` — все типы
2. `services/roleConfig.ts` — роли + цвета
3. `services/norkaFs.ts` — дерево ФС, readFile/writeFile/listDir (in-memory)
4. `services/norkaStorage.ts` — интерфейс
5. `services/indexedDbStorage.ts` — IndexedDB реализация
6. `services/norkaGit.ts` — интерфейс + NoopGit
7. `services/norkaRepo.ts` — domain mapper
8. `features/mockData.ts` — демо-дерево с 1 проектом, 2 страницами, 3 фичами
9. `features/workflowMachine.ts` — стадии + переходы + версионирование
10. `contracts/prd.schema.json` — JSON Schema

### Фаза 1 — Навигационный скелет
10. `components/atoms/ProgressDots/` — 4 точки-индикатора
11. `pages/EntryPage.tsx` — Библиотеки vs Проекты
12. `pages/LibrariesPage.tsx` — список библиотек (заглушка)
13. `pages/ProjectsPage.tsx` — аккордеон-дерево с ProgressDots
14. `pages/FeatureWorkspace.tsx` — Layout + Sidebar стадий + контент
15. Обновить `App.tsx` — роутинг между экранами

### Фаза 2 — Стадии внутри фичи
16. `prd-builder/*` — Personas, UseCases, DataModel, Screens, VariantMatrix, CompletenessCheck
17. `stages/AnalyticsStage.tsx` — композиция prd-builder + [Сохранить PRD] → [Передать в Макеты]
18. `stages/PrototypesStage.tsx` — табы вариантов + полноразмерный YamlRenderer + Drawer с YAML + [★ финальный] + [Передать в Обсуждение]
19. `comments/*` — CommentThread, PinMarker, FloatingPanel

### Фаза 3 — Обсуждение, Оформление, Полировка
20. `stages/DiscussionStage.tsx` — pin-based комментарии + плавающая панель + ролевые цвета + [★ финальный] + [Вернуть на...]
21. `stages/FinalizeStage.tsx` — Rich Format + чеклист + [Опубликовать]
22. Шлифовка: переходы minor/major, архив вариантов, read-only published

---

## Технические решения

| Что | Как |
|-----|-----|
| Роутинг | React state-based (SPA-оболочка, всё внутри `App.tsx`) |
| IndexedDB | `idb` (легковесная библиотека) или нативный API |
| YamlRenderer | Используем существующий `YamlRenderer` + `YamlInputModal` |
| FloatingPanel | CSS `position: fixed` + drag через pointer events + resize handle |
| PinMarker | Абсолютное позиционирование внутри контейнера макета по координатам клика |
| Tauri-совместимость | Все `INorkaStorage` вызовы асинхронны → при миграции заменим IndexedDB на `invoke('read_file', { path })` |
| Git sync | Интерфейс `INorkaGit` готов → при миграции реализуем через Rust libgit2 |
