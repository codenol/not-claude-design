import { useState, forwardRef, useImperativeHandle } from 'react'
import { YamlRenderer } from '../renderer'
import type { ScreenConfig } from '../types/screen'
import styles from './YamlPlayground.module.css'

export interface YamlPlaygroundHandle {
  renderYaml: (config: ScreenConfig) => void
  clear: () => void
}

export const YamlPlayground = forwardRef<YamlPlaygroundHandle, object>((_props, ref) => {
  const [renderedConfig, setRenderedConfig] = useState<ScreenConfig | null>(null)

  useImperativeHandle(ref, () => ({
    renderYaml: (config: ScreenConfig) => {
      setRenderedConfig(config)
    },
    clear: () => {
      setRenderedConfig(null)
    },
  }), [])

  if (!renderedConfig) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⟪ ⟫</div>
        <div className={styles.emptyText}>
          Open YAML modal to render a screen
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.preview}>
        <YamlRenderer config={renderedConfig} />
      </div>
    </div>
  )
})

YamlPlayground.displayName = 'YamlPlayground'
