export interface LlmSettings {
  url: string
  model: string
}

const KEY = 'norka_llm'

const DEFAULTS: LlmSettings = {
  url: 'http://127.0.0.1:1234',
  model: 'google/gemma-4-e4b',
}

export function loadLlmSettings(): LlmSettings {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function saveLlmSettings(settings: LlmSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}
