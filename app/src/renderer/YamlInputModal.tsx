import { useState } from 'react'
import yaml from 'js-yaml'
import { Modal } from '../components'
import { Button } from '../components'
import { YAML_SAMPLES } from '../pages/samples'
import type { ScreenConfig } from '../types/screen'
import styles from './YamlInputModal.module.css'

export interface YamlInputModalProps {
  open: boolean
  onClose: () => void
  onRender: (config: ScreenConfig) => void
}

export function YamlInputModal({ open, onClose, onRender }: YamlInputModalProps) {
  const [rawYaml, setRawYaml] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleLoadSample = async (name: string) => {
    try {
      const response = await fetch(`/${name}`)
      if (!response.ok) throw new Error(`Failed to load: ${response.statusText}`)
      const text = await response.text()
      setRawYaml(text)
      setErrors([])
    } catch {
      setErrors([`Failed to load sample: ${name}`])
    }
  }

  const handleValidateAndRender = () => {
    setErrors([])
    if (!rawYaml.trim()) {
      setErrors(['YAML is empty'])
      return
    }

    let parsed: unknown
    try {
      parsed = yaml.load(rawYaml)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setErrors([`YAML parse error: ${msg}`])
      return
    }

    if (!parsed || typeof parsed !== 'object') {
      setErrors(['YAML must contain an object with meta, content fields'])
      return
    }

    const obj = parsed as Record<string, unknown>
    const validationErrors: string[] = []

    if (!obj.meta || typeof obj.meta !== 'object') {
      validationErrors.push('Missing required field: meta')
    } else {
      const meta = obj.meta as Record<string, unknown>
      if (!Array.isArray(meta.breadcrumbs) || meta.breadcrumbs.length === 0) {
        validationErrors.push('meta.breadcrumbs must be a non-empty array')
      }
    }

    if (!Array.isArray(obj.content)) {
      validationErrors.push('Missing required field: content (must be an array)')
    } else if (obj.content.length === 0) {
      validationErrors.push('content array is empty')
    } else {
      const content = obj.content as Record<string, unknown>[]
      content.forEach((block, i) => {
        if (!block.type) {
          validationErrors.push(`content[${i}]: missing required field "type"`)
        }
      })
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    onRender(parsed as ScreenConfig)
    onClose()
    setRawYaml('')
    setErrors([])
  }

  const handleClose = () => {
    onClose()
    setErrors([])
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="YAML Input"
      description="Вставьте YAML-описание экрана или выберите готовый пример"
      width={960}
      footer={
        <>
          <Button type="outline" sentiment="secondary" size="large" onClick={handleClose}>
            Cancel
          </Button>
          <Button sentiment="accent" size="large" onClick={handleValidateAndRender}>
            Validate & Render
          </Button>
        </>
      }
    >
      <div className={styles.content}>
        <textarea
          className={styles.textarea}
          value={rawYaml}
          onChange={(e) => { setRawYaml(e.target.value); setErrors([]) }}
          placeholder="Paste YAML here..."
          spellCheck={false}
          rows={18}
        />

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            {errors.map((err, i) => (
              <div key={i} className={styles.errorItem}>{err}</div>
            ))}
          </div>
        )}

        <div className={styles.presets}>
          <div className={styles.presetsLabel}>Predefined samples</div>
          <select
            className={styles.presetsSelect}
            onChange={(e) => {
              if (e.target.value) handleLoadSample(e.target.value)
            }}
            defaultValue=""
          >
            <option value="" disabled>Select sample...</option>
            {Object.entries(YAML_SAMPLES).map(([name, label]) => (
              <option key={name} value={name}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}
