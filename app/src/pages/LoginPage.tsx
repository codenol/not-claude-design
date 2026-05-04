import { useState } from 'react'
import type { NorkaRole } from '../features/types'
import type { UserInfo } from '../services/roleConfig'
import { ROLES, getRoleColor, getUsersByRole } from '../services/roleConfig'
import styles from './LoginPage.module.css'

export interface LoginPageProps {
  onLogin: (user: UserInfo) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<NorkaRole | null>(null)

  const users = selectedRole ? getUsersByRole(selectedRole) : []

  return (
    <div className={styles.container}>
      <div className={styles.brand}>Norka</div>
      <div className={styles.subtitle}>Выбери роль</div>

      <div className={styles.roleGrid}>
        {ROLES.map(r => (
          <button
            key={r.role}
            className={`${styles.roleCard} ${selectedRole === r.role ? styles.roleActive : ''}`}
            style={{ borderColor: selectedRole === r.role ? r.color : undefined }}
            onClick={() => setSelectedRole(selectedRole === r.role ? null : r.role)}
          >
            <span className={styles.roleDot} style={{ background: r.color }} />
            <span className={styles.roleLabel}>{r.label}</span>
          </button>
        ))}
      </div>

      {selectedRole && (
        <div className={styles.usersBlock}>
          <div className={styles.usersTitle}>
            {ROLES.find(r => r.role === selectedRole)?.label} — выбери пользователя
          </div>
          <div className={styles.userList}>
            {users.map(u => (
              <button
                key={u.id}
                className={styles.userCard}
                onClick={() => onLogin(u)}
              >
                <span
                  className={styles.avatar}
                  style={{ background: getRoleColor(u.role) }}
                >
                  {u.initials}
                </span>
                <span className={styles.userName}>{u.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
