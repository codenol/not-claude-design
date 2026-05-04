import type { ScreenDef, ScreenKeyElement } from '../features/types'
import { Button, Input, Dropdown } from '../components'
import styles from './ScreenInventoryEditor.module.css'

export interface ScreenInventoryEditorProps {
  screens: ScreenDef[]
  useCaseNames: { id: string; title: string }[]
  onChange: (screens: ScreenDef[]) => void
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

export function ScreenInventoryEditor({ screens, useCaseNames, onChange }: ScreenInventoryEditorProps) {
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
        <Button sentiment="accent" size="small" onClick={add}>+ Экран</Button>
      </div>

      {screens.length === 0 && (
        <p className={styles.empty}>Нет экранов.</p>
      )}

      <div className={styles.list}>
        {screens.map((s, si) => (
          <div key={si} className={styles.card}>
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
