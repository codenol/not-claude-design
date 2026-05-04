import type { PRD } from '../features/types'
import { loadLlmSettings } from './llmSettings'

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
${JSON.stringify(prd, null, 2)}
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

export async function generateVariants(prd: PRD): Promise<string[]> {
  const settings = loadLlmSettings()
  const url = `${settings.url.replace(/\/+$/, '')}/v1/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(prd) },
      ],
      temperature: 0.7,
      max_tokens: 16000,
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`LM Studio ответил ${response.status}. Проверьте URL и модель в настройках.${errText ? ' ' + errText.substring(0, 200) : ''}`)
  }

  const data = await response.json() as any
  const content = data.choices?.[0]?.message?.content || ''
  const yamls = extractYamlBlocks(content)

  if (yamls.length < 3) {
    throw new Error(`LLM сгенерировал только ${yamls.length} YAML-блоков вместо 3. Попробуйте ещё раз.`)
  }

  return yamls.slice(0, 3)
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
    }),
  })

  if (!response.ok) throw new Error(`LM Studio ответил ${response.status}. Проверьте настройки подключения.`)

  const data = await response.json() as any
  return (data.choices?.[0]?.message?.content || '').trim()
}
