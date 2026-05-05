import { useState, useRef, useEffect } from 'react'
import type { UserInfo } from '../services/roleConfig'
import { getRoleColor } from '../services/roleConfig'
import { useTheme } from '../theme/ThemeContext'
import { Icon, SettingsModal } from '../components'

type Module = 'projects' | 'libraries'

export interface AppShellProps {
  user: UserInfo
  currentModule: Module
  onModuleChange: (mod: Module) => void
  onLogout: () => void
  children: React.ReactNode
}

export function AppShell({ user, currentModule, onModuleChange, onLogout, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { theme, toggle } = useTheme()
  const roleColor = getRoleColor(user.role)
  const isDesigner = user.role === 'Дизайнер'

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  useEffect(() => {
    if (!userMenuOpen) return
    const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [userMenuOpen])

  return (
    <>
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Minibar */}
      <div style={{
        width: 40, flexShrink: 0, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--sidebar-border-default, #dfe2e6)',
        background: 'var(--sidebar-background-default, #ffffff)',
        alignItems: 'center', padding: '8px 0', gap: 2,
      }}>
        {/* Top slot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
          {isDesigner && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                title="Сменить модуль"
                style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: menuOpen ? 'var(--sidebar-menubutton-background-hover, #eef1f5)' : 'transparent',
                  color: 'var(--sidebar-menubutton-icon-default, #a8aab0)',
                }}
              >
                <Icon name="LayoutGrid" size={18} />
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', left: '100%', top: 0, zIndex: 100,
                  background: 'var(--sidebar-background-default, #ffffff)',
                  border: '1px solid var(--sidebar-border-default, #dfe2e6)',
                  borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  minWidth: 160, padding: 4, display: 'flex', flexDirection: 'column', gap: 2,
                  marginLeft: 8,
                }}>
                  <ModuleMenuItem
                    label="Проекты"
                    active={currentModule === 'projects'}
                    onClick={() => { onModuleChange('projects'); setMenuOpen(false) }}
                  />
                  <ModuleMenuItem
                    label="Библиотеки"
                    active={currentModule === 'libraries'}
                    onClick={() => { onModuleChange('libraries'); setMenuOpen(false) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom slot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingBottom: 4 }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title="Сменить тему"
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', color: 'var(--sidebar-menubutton-icon-default, #a8aab0)',
            }}
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            title="Настройки"
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', color: 'var(--sidebar-menubutton-icon-default, #a8aab0)',
            }}
          >
            <Icon name="Settings" size={18} />
          </button>

          {/* Avatar */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={user.name}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', borderRadius: '50%', cursor: 'pointer', background: roleColor,
                color: '#ffffff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              {user.initials}
            </button>
            {userMenuOpen && (
              <div style={{
                position: 'absolute', left: '100%', bottom: 0, zIndex: 100,
                background: 'var(--sidebar-background-default, #ffffff)',
                border: '1px solid var(--sidebar-border-default, #dfe2e6)',
                borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                minWidth: 200, padding: 8, marginLeft: 8,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sidebar-text-default, #3f4146)', marginBottom: 4 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sidebar-menubutton-icon-default, #a8aab0)', marginBottom: 8 }}>
                  {user.role}
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); onLogout() }}
                  style={{
                    width: '100%', padding: '4px 8px', border: '1px solid var(--sidebar-border-default, #dfe2e6)',
                    borderRadius: 4, background: 'none', cursor: 'pointer',
                    fontSize: 13, color: '#ef4444', fontFamily: 'inherit',
                  }}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto', height: '100vh', background: 'var(--layout-background-default)', color: 'var(--color-text-default)' }}>
        {children}
      </div>
    </div>

    {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  )
}

function ModuleMenuItem({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 10px', fontSize: 13, textAlign: 'left', fontFamily: 'inherit',
        border: 'none', borderRadius: 4, cursor: 'pointer',
        background: active ? 'var(--sidebar-menubutton-background-hover, #eef1f5)' : 'none',
        color: active ? 'var(--sidebar-text-default, #3f4146)' : 'var(--sidebar-text-default, #3f4146)',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-menubutton-background-hover, #f8f9fb)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'none' }}
    >
      {label}
    </button>
  )
}
