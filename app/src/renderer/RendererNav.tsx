import { useState, useRef, useEffect } from 'react'
import { MenuButton, MenuItem } from '../components'
import { useTheme } from '../theme/ThemeContext'
import styles from './RendererNav.module.css'

export interface RendererNavProps {
  mode: 'demo' | 'yaml'
  onModeChange: (mode: 'demo' | 'yaml') => void
  onClear?: () => void
  onOpenYamlModal?: () => void
}

export function RendererNav({
  mode,
  onModeChange,
  onClear,
  onOpenYamlModal,
}: RendererNavProps) {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className={styles.strip}>
      <div className={styles.topGroup}>
        <div className={styles.modeButton} ref={menuRef}>
          <MenuButton
            icon="Layers"
            active={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className={styles.popover}>
              <MenuItem
                icon={mode === 'demo' ? 'Circle' : 'Component'}
                active={mode === 'demo'}
                onClick={() => { onModeChange('demo'); setMenuOpen(false) }}
              >
                Hardcoded Demo
              </MenuItem>
              <MenuItem
                icon={mode === 'yaml' ? 'Circle' : 'Braces'}
                active={mode === 'yaml'}
                onClick={() => { onModeChange('yaml'); setMenuOpen(false) }}
              >
                YAML Renderer
              </MenuItem>
            </div>
          )}
        </div>

        {mode === 'yaml' && (
          <>
            <div className={styles.divider} />
            <MenuButton icon="Eraser" onClick={onClear} />
            <MenuButton icon="Code2" onClick={onOpenYamlModal} />
          </>
        )}
      </div>

      <div className={styles.spacer} />

      <div className={styles.bottomGroup}>
        <MenuButton
          icon={theme === 'dark' ? 'Sun' : 'Moon'}
          onClick={toggle}
        />
      </div>
    </div>
  )
}
