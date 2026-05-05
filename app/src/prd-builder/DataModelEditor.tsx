import { useEffect, useState } from 'react'
import type { Entity, EntityField, EntityRelation } from '../features/types'
import { Button, Input, Dropdown } from '../components'
import styles from './DataModelEditor.module.css'

const PHRASES = [
  'Ща-ща-ща…', 'Уже почти…', 'Ещё чуть-чуть…', 'Секунду…', 'Скоро будет…',
  'Думаю…', 'Почти готово…', 'Собираю…', 'Минуточку…', 'Подожди чуток…',
  'Готовлю ответ…', 'Нейроны греются…', 'Формулирую…', 'Сейчас-сейчас…',
  'Загружаю мысль…', 'Обрабатываю…', 'Почти на финише…', 'Пару секунд…',
  'Финишная прямая…', 'Шестерёнки крутятся…',
]

export interface DataModelEditorProps {
  entities: Entity[]
  onChange: (entities: Entity[]) => void
  onFillWithAi?: () => void
  aiLoading?: boolean
}

const TYPE_OPTIONS = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'enum', value: 'enum' },
  { label: 'datetime', value: 'datetime' },
  { label: 'geo', value: 'geo' },
]

const REL_OPTIONS = [
  { label: '1:1', value: '1:1' },
  { label: '1:N', value: '1:N' },
  { label: 'N:M', value: 'N:M' },
]

export function DataModelEditor({ entities, onChange, onFillWithAi, aiLoading }: DataModelEditorProps) {
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
      ...entities,
      { id: `e${Date.now()}`, name: '', fields: [], relations: [] },
    ])
  }

  const update = (idx: number, patch: Partial<Entity>) => {
    const next = [...entities]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(entities.filter((_, i) => i !== idx))
  }

  const addField = (ei: number) => {
    const e = entities[ei]
    update(ei, { fields: [...e.fields, { name: '', type: 'string', required: false }] })
  }

  const updateField = (ei: number, fi: number, patch: Partial<EntityField>) => {
    const e = entities[ei]
    const fields = [...e.fields]
    fields[fi] = { ...fields[fi], ...patch }
    update(ei, { fields })
  }

  const removeField = (ei: number, fi: number) => {
    const e = entities[ei]
    update(ei, { fields: e.fields.filter((_, i) => i !== fi) })
  }

  const addRelation = (ei: number) => {
    const e = entities[ei]
    update(ei, { relations: [...e.relations, { target: '', type: '1:N' }] })
  }

  const updateRelation = (ei: number, ri: number, patch: Partial<EntityRelation>) => {
    const e = entities[ei]
    const rels = [...e.relations]
    rels[ri] = { ...rels[ri], ...patch }
    update(ei, { relations: rels })
  }

  const removeRelation = (ei: number, ri: number) => {
    const e = entities[ei]
    update(ei, { relations: e.relations.filter((_, i) => i !== ri) })
  }

  const entityNameOptions = entities.filter(e => e.name).map(e => ({ label: e.name, value: e.name }))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Модель данных</h2>
        <div className={styles.headerButtons}>
          <Button sentiment="accent" size="small" onClick={add}>+ Сущность</Button>
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

      {entities.length === 0 && !aiLoading && (
        <p className={styles.empty}>Нет сущностей.</p>
      )}

      <div className={styles.list}>
        {entities.map((e, ei) => (
          <div key={ei} className={`${styles.card} ${e._aiGenerated ? styles.aiCard : ''}`}>
            <div className={styles.cardHeader}>
              <Input
                placeholder="Название сущности"
                value={e.name}
                onChange={ev => update(ei, { name: ev.target.value })}
              />
              <Button type="ghost" sentiment="danger" size="small" onClick={() => remove(ei)}>×</Button>
            </div>

            {e.name && (
              <>
                <div className={styles.sectionLabel}>
                  Поля
                  <Button type="ghost" sentiment="secondary" size="small" onClick={() => addField(ei)}>+</Button>
                </div>
                {e.fields.map((f, fi) => (
                  <div key={fi} className={styles.fieldRow}>
                    <Input
                      placeholder="Имя поля"
                      value={f.name}
                      onChange={ev => updateField(ei, fi, { name: ev.target.value })}
                    />
                    <Dropdown
                      placeholder="Тип"
                      options={TYPE_OPTIONS}
                      defaultValue={f.type}
                      onChange={e => updateField(ei, fi, { type: e.target.value })}
                    />
                    <label className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={ev => updateField(ei, fi, { required: ev.target.checked })}
                      />
                      req.
                    </label>
                    <Button type="ghost" sentiment="danger" size="small" onClick={() => removeField(ei, fi)}>×</Button>
                  </div>
                ))}

                <div className={styles.sectionLabel}>
                  Связи
                  <Button type="ghost" sentiment="secondary" size="small" onClick={() => addRelation(ei)}>+</Button>
                </div>
                {e.relations.map((r, ri) => (
                  <div key={ri} className={styles.fieldRow}>
                    <Dropdown
                      placeholder="С сущностью"
                      options={entityNameOptions}
                      defaultValue={r.target}
                      onChange={e => updateRelation(ei, ri, { target: e.target.value })}
                    />
                    <Dropdown
                      placeholder="Тип связи"
                      options={REL_OPTIONS}
                      defaultValue={r.type}
                      onChange={e => updateRelation(ei, ri, { type: e.target.value as '1:1' | '1:N' | 'N:M' })}
                    />
                    <Button type="ghost" sentiment="danger" size="small" onClick={() => removeRelation(ei, ri)}>×</Button>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
