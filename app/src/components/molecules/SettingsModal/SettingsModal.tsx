import { useState, useEffect } from 'react'
import { loadLlmSettings, saveLlmSettings } from '../../../services/llmSettings'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import styles from './SettingsModal.module.css'

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const [llm, setLlm] = useState(loadLlmSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const handleSave = () => {
    saveLlmSettings(llm)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Настройки</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.tabActive}`}>Подключение LLM</button>
        </div>

        <div className={styles.body}>
          <label className={styles.field}>
            <span className={styles.label}>Провайдер</span>
            <input className={styles.input} value="LM Studio" disabled />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>API URL</span>
            <Input
              className={styles.inputFull}
              value={llm.url}
              onChange={e => setLlm({ ...llm, url: e.target.value })}
              placeholder="http://127.0.0.1:1234"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Модель</span>
            <Input
              className={styles.inputFull}
              value={llm.model}
              onChange={e => setLlm({ ...llm, model: e.target.value })}
              placeholder="google/gemma-4-e4b"
            />
          </label>
        </div>

        <div className={styles.footer}>
          {saved && <span className={styles.savedMessage}>✓ Настройки сохранены</span>}
          <div className={styles.footerActions}>
            <Button type="ghost" sentiment="secondary" size="small" onClick={onClose}>Отмена</Button>
            <Button sentiment="accent" size="small" onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
