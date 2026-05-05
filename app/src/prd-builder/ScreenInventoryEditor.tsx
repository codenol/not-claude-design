import { useEffect, useState } from 'react'
import type { ScreenDef, ScreenKeyElement } from '../features/types'
import { Button, Input, Dropdown } from '../components'
import styles from './ScreenInventoryEditor.module.css'

const PHRASES = [
  'Ща-ща-ща…', 'Уже почти…', 'Ещё чуть-чуть…', 'Секунду…', 'Скоро будет…',
  'Думаю…', 'Почти готово…', 'Собираю…', 'Минуточку…', 'Подожди чуток…',
  'Готовлю ответ…', 'Нейроны греются…', 'Формулирую…', 'Сейчас-сейчас…',
  'Загружаю мысль…', 'Обрабатываю…', 'Почти на финише…', 'Пару секунд…',
  'Финишная прямая…', 'Шестерёнки крутятся…',
]

export interface ScreenInventoryEditorProps {
  screens: ScreenDef[]
  useCaseNames: { id: string; title: string }[]
  onChange: (screens: ScreenDef[]) => void
  onFillWithAi?: () => void
  aiLoading?: boolean
}

const ELEM_TYPES = [
  { label: 'datatable', value: 'datatable' },
  { label: 'form', value: 'form' },
  { label: 'map', value: 'map' },
  { label: 'chart', value: 'chart' },
  { label: 'badge', value: 'badge' },
  { label: 'button', value: 'button' },
  { label: 'modal', value: 'modal' },
  { label: 'drawer', value: 'drawer' },
  { label: 'card', value: 'card' },
  { label: 'text', value: 'text' },
]

export function ScreenInventoryEditor({ screens, useCaseNames, onChange, onFillWithAi, aiLoading }: ScreenInventoryEditorProps) {
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
      ...screens,
      { id: `s${Date.now()}`, title: '', purpose: '', relatedUseCases: [], keyElements: [] },
    ])
  }

  const update = (idx: number, patch: Partial<ScreenDef>) => {
    const next = [...screens]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(screens.filter((_, i) => i !== idx))
  }

  const toggleUseCase = (si: number, ucId: string) => {
    const s = screens[si]
    const uc = s.relatedUseCases.includes(ucId)
      ? s.relatedUseCases.filter(id => id !== ucId)
      : [...s.relatedUseCases, ucId]
    update(si, { relatedUseCases: uc })
  }

  const addElement = (si: number) => {
    const s = screens[si]
    update(si, { keyElements: [...s.keyElements, { type: 'datatable', label: '' }] })
  }

  const updateElement = (si: number, ei: number, patch: Partial<ScreenKeyElement>) => {
    const s = screens[si]
    const elems = [...s.keyElements]
    elems[ei] = { ...elems[ei], ...patch }
    update(si, { keyElements: elems })
  }

  const removeElement = (si: number, ei: number) => {
    const s = screens[si]
    update(si, { keyElements: s.keyElements.filter((_, i) => i !== ei) })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Экраны</h2>
        <div className={styles.headerButtons}>
          <Button sentiment="accent" size="small" onClick={add}>+ Экран</Button>
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

      {screens.length === 0 && !aiLoading && (
        <p className={styles.empty}>Нет экранов.</p>
      )}

      <div className={styles.list}>
        {screens.map((s, si) => (
          <div key={si} className={`${styles.card} ${s._aiGenerated ? styles.aiCard : ''}`}>
            <div className={styles.cardHeader}>
              <Input
                placeholder="Название экрана"
                value={s.title}
                onChange={e => update(si, { title: e.target.value })}
              />
              <Button type="ghost" sentiment="danger" size="small" onClick={() => remove(si)}>×</Button>
            </div>

            <Input
              className={styles.fullWidth}
              placeholder="Назначение экрана"
              value={s.purpose}
              onChange={e => update(si, { purpose: e.target.value })}
            />

            <div className={styles.ucSection}>
              <div className={styles.ucLabel}>Use Cases:</div>
              <div className={styles.ucChips}>
                {useCaseNames.map(uc => (
                  <label
                    key={uc.id}
                    className={`${styles.ucChip} ${s.relatedUseCases.includes(uc.id) ? styles.ucChipActive : ''}`}
                    onClick={() => toggleUseCase(si, uc.id)}
                  >
                    {uc.title || uc.id}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.elemSection}>
              <div className={styles.sectionLabel}>
                Ключевые элементы
                <Button type="ghost" sentiment="secondary" size="small" onClick={() => addElement(si)}>+</Button>
              </div>
              {s.keyElements.map((el, ei) => (
                <div key={ei} className={styles.elemRow}>
                  <Dropdown
                    placeholder="Тип"
                    options={ELEM_TYPES}
                    value={el.type}
                    onChange={e => updateElement(si, ei, { type: e.target.value })}
                  />
                  <Input
                    placeholder="Лейбл"
                    value={el.label}
                    onChange={e => updateElement(si, ei, { label: e.target.value })}
                  />
                  <Input
                    placeholder="dataBinding (опционально)"
                    value={el.dataBinding ?? ''}
                    onChange={e => updateElement(si, ei, { dataBinding: e.target.value || undefined })}
                  />
                  <Button type="ghost" sentiment="danger" size="small" onClick={() => removeElement(si, ei)}>×</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
