import type { PRD } from '../features/types'
import { loadLlmSettings } from './llmSettings'

function prdToCompactJson(prd: PRD): string {
  const stripped = {
    personas: prd.personas.map(({ id, _aiGenerated, ...rest }) => rest),
    useCases: prd.useCases.map(({ id, _aiGenerated, relatedFeatures, ...rest }) => rest),
    dataModel: prd.dataModel.map(({ id, _aiGenerated, ...rest }) => rest),
    screenInventory: prd.screenInventory.map(({ id, _aiGenerated, ...rest }) => rest),
    variantMatrix: prd.variantMatrix.map(({ _aiGenerated, ...rest }) => rest),
  }
  return JSON.stringify(stripped)
}

const SYSTEM_PROMPT = `Ты — генератор YAML-экранов для React-приложения. Ты используешь строго следующий формат screen-contract.yaml:

meta:
  title: string
  breadcrumbs:
    - label: string

sidebar:
  logoVariant: genom|vision|spektr
  menuSections:
    - items:
        - icon: string (Lucide icon)
          label: string
          active: boolean

content:
  - type: section|row|col|button|badge|input|textarea|text|heading|dropdown|datatable|modal-trigger|drawer-trigger|form
    (каждый блок имеет специфичные поля, смотри схему)

Принимай на вход PRD в JSON формате с полями: personas, useCases, dataModel, screenInventory, variantMatrix.
Генерируй РОВНО 3 YAML-экрана, каждый обёрнутый в \`\`\`yaml ... \`\`\`.
Вариант 1: Sidebar layout (sidebar + datatable)
Вариант 2: Top Nav layout (без sidebar, с breadcrumbs)
Вариант 3: Minimal layout (только основное содержимое)
Используй данные из PRD: имена персон, шаги use cases, названия экранов из screenInventory.
НЕ выдумывай компоненты, которых нет в схеме.
Отвечай ТОЛЬКО тремя YAML-блоками, без пояснений.`

function buildUserPrompt(prd: PRD): string {
  return `На основе этого PRD сгенерируй 3 YAML-экрана:

\`\`\`json
${prdToCompactJson(prd)}
\`\`\`
`
}

function extractYamlBlocks(text: string): string[] {
  const blocks: string[] = []
  const regex = /```ya?ml\s*\n([\s\S]*?)```/g
  let match
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim())
  }
  return blocks
}

export async function generateVariants(prd: PRD): Promise<{ yamls: string[]; request: string }> {
  const settings = loadLlmSettings()
  const url = `${settings.url.replace(/\/+$/, '')}/v1/chat/completions`

  const userPrompt = buildUserPrompt(prd)
  const requestBody = {
    model: settings.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    max_context_length: 13000,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`LM Studio ответил ${response.status}. Проверьте URL и модель в настройках.${errText ? ' ' + errText.substring(0, 200) : ''}`)
  }

  const data = await response.json() as any
  const content = data.choices?.[0]?.message?.content || ''
  const yamls = extractYamlBlocks(content)

  const request = JSON.stringify(requestBody, null, 2)

  if (yamls.length < 3) {
    throw new Error(`LLM сгенерировал только ${yamls.length} YAML-блоков вместо 3. Попробуйте ещё раз.`)
  }

  return { yamls: yamls.slice(0, 3), request }
}

const FILL_SECTION_PROMPT = `Ты — AI-аналитик, помогающий заполнить PRD. Тебе передаётся:
1. Контекст — название проекта, страницы, описание фичи
2. Полный PRD с уже заполненными данными в JSON
3. Название секции для заполнения

Генерируй 2-4 осмысленных элемента, учитывая:
- Бизнес-домен проекта (например, мониторинг, дашборды, CRM, логистика, e-commerce и т.д.)
- Описание фичи — это главный источник, все элементы должны соответствовать её смыслу
- Уже заполненные данные в других секциях PRD (связывай данные между секциями)

Секции и форматы (верни ТОЛЬКО JSON-массив):
- "personas": [{"name": "Имя", "role": "Роль", "goal": "Цель", "painPoints": ["Боль 1"]}]
- "useCases": [{"title": "Название", "actor": "имя персоны", "goal": "Цель", "trigger": "Триггер", "mainFlow": [{"actor": "user|system", "action": "действие"}], "errorFlows": [{"condition": "условие ошибки", "resolution": "способ решения"}]}]
- "dataModel": [{"name": "Название сущности", "fields": [{"name": "поле", "type": "string|number|boolean|enum|datetime|geo", "required": true|false}], "relations": [{"target": "другая сущность", "type": "1:1|1:N|N:M"}]}]
- "screens": [{"title": "Название экрана", "purpose": "Назначение", "relatedUseCases": ["заголовок use case"], "keyElements": [{"type": "datatable|form|map|chart|badge|button|modal|drawer|card|text", "label": "Лейбл элемента"}]}]
- "variants": [{"axis": "Имя оси", "description": "Описание вариантов через / (пример: light/dark)"}]

КРИТИЧНО: Генерируй данные, которые соответствуют контексту. Не выдумывай домен, не добавляй персонажей и сущностей из других сфер. ВСЁ должно быть про фичу.

Отвечай СТРОГО JSON-массивом без markdown-обёрток и пояснений.`

export async function fillSectionWithAi(prd: PRD, section: string, context?: { projectName?: string; pageName?: string; featureDescription?: string }): Promise<any[]> {
  const settings = loadLlmSettings()
  const url = `${settings.url.replace(/\/+$/, '')}/v1/chat/completions`

  const contextBlock = context
    ? `Проект: ${context.projectName || '—'}\nСтраница: ${context.pageName || '—'}\nОписание фичи: ${context.featureDescription || '—'}`
    : 'Контекст не указан.'

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: FILL_SECTION_PROMPT },
        { role: 'user', content: `КОНТЕКСТ:\n${contextBlock}\n\nСекция для заполнения: ${section}\n\nУже заполненные данные PRD:\n\`\`\`json\n${prdToCompactJson(prd)}\n\`\`\`` },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      max_context_length: 13000,
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`LM Studio ответил ${response.status}. Проверьте настройки подключения.${errText ? ' ' + errText.substring(0, 200) : ''}`)
  }

  const data = await response.json() as any
  const content: string = data.choices?.[0]?.message?.content || ''

  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('LLM не вернул JSON-массив')

  return JSON.parse(jsonMatch[0])
}

export async function improveDescription(projectName: string, pageName: string, description: string): Promise<string> {
  const settings = loadLlmSettings()
  const url = `${settings.url.replace(/\/+$/, '')}/v1/chat/completions`

  const prompt = `Ты — AI-ассистент аналитика. Улучши описание фичи.

Проект: ${projectName}
Страница: ${pageName}
Текущее описание фичи: ${description}

Сделай описание более структурированным:
- Цель фичи
- Пользовательский сценарий (кто и что делает)
- Ожидаемый результат

Верни ТОЛЬКО улучшенный текст на русском, без markdown и пояснений.`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      max_context_length: 13000,
    }),
  })

  if (!response.ok) throw new Error(`LM Studio ответил ${response.status}. Проверьте настройки подключения.`)

  const data = await response.json() as any
  return (data.choices?.[0]?.message?.content || '').trim()
}
