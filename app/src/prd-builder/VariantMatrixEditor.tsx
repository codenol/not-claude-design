import { useEffect, useState } from 'react'
import type { VariantDimension } from '../features/types'
import { Button, Input } from '../components'
import styles from './VariantMatrixEditor.module.css'

const PHRASES = [
  'Ща-ща-ща…', 'Уже почти…', 'Ещё чуть-чуть…', 'Секунду…', 'Скоро будет…',
  'Думаю…', 'Почти готово…', 'Собираю…', 'Минуточку…', 'Подожди чуток…',
  'Готовлю ответ…', 'Нейроны греются…', 'Формулирую…', 'Сейчас-сейчас…',
  'Загружаю мысль…', 'Обрабатываю…', 'Почти на финише…', 'Пару секунд…',
  'Финишная прямая…', 'Шестерёнки крутятся…',
]

export interface VariantMatrixEditorProps {
  dimensions: VariantDimension[]
  onChange: (dimensions: VariantDimension[]) => void
  onFillWithAi?: () => void
  aiLoading?: boolean
}

export function VariantMatrixEditor({ dimensions, onChange, onFillWithAi, aiLoading }: VariantMatrixEditorProps) {
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
    onChange([...dimensions, { axis: '', description: '' }])
  }

  const update = (idx: number, patch: Partial<VariantDimension>) => {
    const next = [...dimensions]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(dimensions.filter((_, i) => i !== idx))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Оси вариативности</h2>
        <div className={styles.headerButtons}>
          <Button sentiment="accent" size="small" onClick={add}>+ Ось</Button>
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

      <p className={styles.hint}>
        Опишите оси, по которым будут различаться варианты интерфейса. Например: layout (sidebar / topnav / minimal), density (compact / comfortable).
      </p>

      {dimensions.length === 0 && !aiLoading && (
        <p className={styles.empty}>Нет осей.</p>
      )}

      <div className={styles.list}>
        {dimensions.map((d, idx) => (
          <div key={idx} className={`${styles.card} ${d._aiGenerated ? styles.aiCard : ''}`}>
            <div className={styles.row}>
              <Input
                placeholder="axis (например layout)"
                value={d.axis}
                onChange={e => update(idx, { axis: e.target.value })}
              />
              <Input
                placeholder="Описание"
                value={d.description}
                onChange={e => update(idx, { description: e.target.value })}
              />
              <Button type="ghost" sentiment="danger" size="small" onClick={() => remove(idx)}>×</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
