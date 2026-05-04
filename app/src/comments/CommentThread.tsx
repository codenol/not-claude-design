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

  const firstAuthor = thread.messages[0]?.author
  const authorColor = firstAuthor ? getRoleColor(firstAuthor) : '#999'

  return (
    <div className={`${styles.thread} ${thread.resolved ? styles.resolved : ''}`}>
      <div className={styles.indicator} style={{ background: authorColor }} />

      <div className={styles.body}>
        {thread.messages.map((msg, i) => (
          <div key={i} className={styles.message}>
            <span className={styles.author} style={{ color: getRoleColor(msg.author) }}>
              {msg.author}
            </span>
            <span className={styles.text}>{msg.text}</span>
            <span className={styles.time}>
              {new Date(msg.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

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
    </div>
  )
}
