import { useEffect, useState } from 'react'
import type { Persona } from '../features/types'
import { Button, Input, Badge } from '../components'
import styles from './PersonaEditor.module.css'

const PHRASES = [
  'Ща-ща-ща…', 'Уже почти…', 'Ещё чуть-чуть…', 'Секунду…', 'Скоро будет…',
  'Думаю…', 'Почти готово…', 'Собираю…', 'Минуточку…', 'Подожди чуток…',
  'Готовлю ответ…', 'Нейроны греются…', 'Формулирую…', 'Сейчас-сейчас…',
  'Загружаю мысль…', 'Обрабатываю…', 'Почти на финише…', 'Пару секунд…',
  'Финишная прямая…', 'Шестерёнки крутятся…',
]

export interface PersonaEditorProps {
  personas: Persona[]
  onChange: (personas: Persona[]) => void
  onFillWithAi?: () => void
  aiLoading?: boolean
}

export function PersonaEditor({ personas, onChange, onFillWithAi, aiLoading }: PersonaEditorProps) {
  const [aiPhrase, setAiPhrase] = useState('')

  useEffect(() => {
    if (!aiLoading) { setAiPhrase(''); return }
    setAiPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)])
    const interval = setInterval(() => {
      setAiPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)])
    }, 1000)
    return () => clearInterval(interval)
  }, [aiLoading])

  const add = () => {
    onChange([
      ...personas,
      { id: `p${Date.now()}`, name: '', role: '', goal: '', painPoints: [] },
    ])
  }

  const update = (idx: number, patch: Partial<Persona>) => {
    const next = [...personas]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(personas.filter((_, i) => i !== idx))
  }

  const addPainPoint = (idx: number, point: string) => {
    if (!point.trim()) return
    const p = personas[idx]
    update(idx, { painPoints: [...p.painPoints, point.trim()] })
  }

  const removePainPoint = (idx: number, pi: number) => {
    const p = personas[idx]
    update(idx, { painPoints: p.painPoints.filter((_, i) => i !== pi) })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Персоны</h2>
        <div className={styles.headerButtons}>
          <Button sentiment="accent" size="small" onClick={add}>+ Добавить</Button>
          {onFillWithAi && (
            <Button sentiment="accent" type="outline" size="small" onClick={onFillWithAi} disabled={aiLoading}>
              {aiLoading ? '...' : 'Заполнить с ИИ'}
            </Button>
          )}
        </div>
      </div>

      {aiLoading && (
        <div className={styles.aiLoading}>
          <p className={styles.aiLoadingHint}>Это может занять до минуты</p>
          <p className={styles.aiLoadingPhrase}>{aiPhrase}</p>
        </div>
      )}

      {personas.length === 0 && !aiLoading && (
        <p className={styles.empty}>Нет персон. Добавьте хотя бы одну.</p>
      )}

      <div className={styles.list}>
        {personas.map((p, idx) => (
          <div key={idx} className={`${styles.card} ${p._aiGenerated ? styles.aiCard : ''}`}>
            <div className={styles.cardHeader}>
              <Input
                placeholder="Имя персоны"
                value={p.name}
                onChange={e => update(idx, { name: e.target.value })}
              />
              <Input
                placeholder="Роль"
                value={p.role}
                onChange={e => update(idx, { role: e.target.value })}
              />
              <Button
                type="ghost"
                sentiment="danger"
                size="small"
                onClick={() => remove(idx)}
              >
                ×
              </Button>
            </div>

            <Input
              className={styles.fullWidth}
              placeholder="Цель (goal)"
              value={p.goal}
              onChange={e => update(idx, { goal: e.target.value })}
            />

            <div className={styles.painSection}>
              <div className={styles.painLabel}>Боли:</div>
              <div className={styles.painList}>
                {p.painPoints.map((pt, pi) => (
                  <div key={pi} className={styles.painTag} onClick={() => removePainPoint(idx, pi)}>
                    <Badge color="red" content="text-and-icon" icon="X">
                      {pt}
                    </Badge>
                  </div>
                ))}
              </div>
              <input
                className={styles.painInput}
                placeholder="Добавить боль..."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    addPainPoint(idx, e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
