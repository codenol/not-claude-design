import { useState } from 'react'
import type { CommentThread as CommentThreadType } from '../features/types'
import { getRoleColor } from '../services/roleConfig'
import styles from './CommentThread.module.css'

export interface CommentThreadProps {
  thread: CommentThreadType
  onResolve: () => void
  onReply: (text: string) => void
}

export function CommentThread({ thread, onResolve, onReply }: CommentThreadProps) {
  const [replyText, setReplyText] = useState('')

  const handleReply = () => {
    if (!replyText.trim()) return
    onReply(replyText.trim())
    setReplyText('')
  }

  return (
    <div className={`${styles.thread} ${thread.resolved ? styles.resolved : ''}`}>
      {thread.messages.map((msg, i) => {
        const roleColor = getRoleColor(msg.author)
        return (
          <div key={i} className={styles.message}>
            <div className={styles.messageHeader}>
              <span
                className={styles.avatarBadge}
                style={{ background: roleColor }}
              >
                {msg.authorInitials}
              </span>
              <div className={styles.messageMeta}>
                <span className={styles.authorName}>{msg.authorName}</span>
                <span className={styles.authorRole} style={{ color: roleColor }}>
                  {msg.author}
                </span>
              </div>
              <span className={styles.time}>
                {new Date(msg.timestamp).toLocaleString('ru', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className={styles.text}>{msg.text}</div>
          </div>
        )
      })}

      {!thread.resolved && (
        <div className={styles.replyBox}>
          <textarea
            className={styles.replyInput}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Ответить..."
            rows={2}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleReply()
              }
            }}
          />
          <div className={styles.replyActions}>
            <button className={styles.replyBtn} onClick={handleReply}>
              Ответить
            </button>
            <button className={styles.resolveBtn} onClick={onResolve}>
              ✓ Решено
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
