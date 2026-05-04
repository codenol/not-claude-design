import type { VariantDimension } from '../features/types'
import { Button, Input } from '../components'
import styles from './VariantMatrixEditor.module.css'

export interface VariantMatrixEditorProps {
  dimensions: VariantDimension[]
  onChange: (dimensions: VariantDimension[]) => void
}

export function VariantMatrixEditor({ dimensions, onChange }: VariantMatrixEditorProps) {
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
        <Button sentiment="accent" size="small" onClick={add}>+ Ось</Button>
      </div>

      <p className={styles.hint}>
        Опишите оси, по которым будут различаться варианты интерфейса. Например: layout (sidebar / topnav / minimal), density (compact / comfortable).
      </p>

      {dimensions.length === 0 && (
        <p className={styles.empty}>Нет осей.</p>
      )}

      <div className={styles.list}>
        {dimensions.map((d, idx) => (
          <div key={idx} className={styles.row}>
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
        ))}
      </div>
    </div>
  )
}
