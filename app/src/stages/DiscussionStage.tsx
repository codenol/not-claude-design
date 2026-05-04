import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import yaml from 'js-yaml'
import type { FeatureStage, CommentThread as CommentThreadType, NorkaRole } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import type { ScreenConfig } from '../types/screen'
import { YamlRenderer } from '../renderer/YamlRenderer'
import { Button } from '../components'
import { FloatingPanel } from '../comments/FloatingPanel'
import { PinMarker } from '../comments/PinMarker'
import { CommentThread } from '../comments/CommentThread'
import { getRoleColor } from '../services/roleConfig'
import styles from './DiscussionStage.module.css'

export interface DiscussionStageProps {
  repo: NorkaRepo
  projectId: string
  pageId: string
  featureId: string
  version: { major: number; minor: number }
  readOnly?: boolean
  onTransition: (to: FeatureStage) => void
}

function parseConfig(yamlStr: string): ScreenConfig | null {
  try {
    const obj = yaml.load(yamlStr) as any
    if (obj && obj.meta && Array.isArray(obj.content)) return obj as ScreenConfig
    return null
  } catch { return null }
}

export function DiscussionStage({ repo, projectId, pageId, featureId, version, readOnly, onTransition }: DiscussionStageProps) {
  const [variants, setVariants] = useState<{ id: string; name: string; yaml: string }[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [comments, setComments] = useState<CommentThreadType[]>([])
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null)
  const [newPinText, setNewPinText] = useState('')
  const [selecting, setSelecting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    setLoaded(false)
    const ver = await repo.getVersion(projectId, pageId, featureId, version.major, version.minor)
    if (ver) {
      setVariants(ver.variants.map(v => ({ id: v.id, name: v.name, yaml: v.yaml })))
      setComments(ver.comments)
    }
    setLoaded(true)
  }, [repo, projectId, pageId, featureId, version])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeVariant = variants[activeIdx]
  const config = useMemo(() => {
    if (!activeVariant) return null
    return parseConfig(activeVariant.yaml)
  }, [activeVariant])

  const variantComments = comments.filter(c => c.variantId === activeVariant?.id)

  const handlePreviewClick = (e: React.MouseEvent) => {
    if (readOnly) return
    if (!previewRef.current || !activeVariant) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left + previewRef.current.scrollLeft)
    const y = Math.round(e.clientY - rect.top + previewRef.current.scrollTop)
    setNewPin({ x, y })
    setNewPinText('')
  }

  const handleAddComment = () => {
    if (!newPin || !activeVariant || !newPinText.trim()) return
    const thread: CommentThreadType = {
      id: `c${Date.now()}`,
      variantId: activeVariant.id,
      anchor: { type: 'yaml-node', path: `click@${newPin.x},${newPin.y}` },
      x: newPin.x,
      y: newPin.y,
      messages: [{ author: 'Аналитик' as NorkaRole, text: newPinText.trim(), timestamp: new Date().toISOString() }],
      resolved: false,
    }
    const updated = [...comments, thread]
    setComments(updated)
    repo.saveComments(projectId, pageId, featureId, version.major, version.minor, updated)
    setNewPin(null)
  }

  const handleReply = (threadId: string, text: string) => {
    const updated = comments.map(c => {
      if (c.id !== threadId) return c
      return {
        ...c,
        messages: [...c.messages, { author: 'ПО' as NorkaRole, text, timestamp: new Date().toISOString() }],
      }
    })
    setComments(updated)
    repo.saveComments(projectId, pageId, featureId, version.major, version.minor, updated)
  }

  const handleResolve = (threadId: string) => {
    const updated = comments.map(c => c.id === threadId ? { ...c, resolved: true } : c)
    setComments(updated)
    repo.saveComments(projectId, pageId, featureId, version.major, version.minor, updated)
  }

  const handleSelectFinal = async () => {
    if (!activeVariant) return
    setSelecting(true)
    await repo.selectVariant(projectId, pageId, featureId, version.major, version.minor, activeVariant.id)
    setSelecting(false)
  }

  if (!loaded) return <div className={styles.loading}>Загрузка...</div>

  if (variants.length === 0) return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>Нет макетов</p>
      <p className={styles.emptyText}>Сначала создайте макеты на стадии «Макеты».</p>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {variants.map((v, i) => (
            <button key={v.id} className={`${styles.tab} ${i === activeIdx ? styles.tabActive : ''}`} onClick={() => setActiveIdx(i)}>
              {v.name}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          {!readOnly && <>
          <Button type="ghost" sentiment="secondary" size="small" onClick={() => onTransition('analytics')}>
            ← Аналитика
          </Button>
          <Button type="ghost" sentiment="secondary" size="small" onClick={() => onTransition('prototypes')}>
            ← Макеты
          </Button>
          <Button sentiment="accent" size="small" onClick={handleSelectFinal} disabled={selecting}>
            {selecting ? '...' : '★ Финальный'}
          </Button>
          <Button sentiment="success" size="small" onClick={() => onTransition('final')}>
            → Оформление
          </Button>
          </>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.preview} ref={previewRef} onClick={handlePreviewClick}>
          {config && <YamlRenderer config={config} />}
          {variantComments.map(tc => (
            <PinMarker key={tc.id} x={tc.x} y={tc.y} color={getRoleColor(tc.messages[0]?.author ?? 'ПО')} />
          ))}
          {newPin && (
            <div style={{ position: 'absolute', left: newPin.x, top: newPin.y, zIndex: 20 }} onClick={e => e.stopPropagation()}>
              <div className={styles.newCommentBox}>
                <textarea
                  className={styles.newCommentInput}
                  value={newPinText}
                  onChange={e => setNewPinText(e.target.value)}
                  placeholder="Новый комментарий..."
                  rows={2}
                  autoFocus
                />
                <div className={styles.newCommentActions}>
                  <button className={styles.cancelBtn} onClick={() => setNewPin(null)}>×</button>
                  <button className={styles.sendBtn} onClick={handleAddComment}>→</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <FloatingPanel title={`Комментарии (${variantComments.length})`}>
          <div className={styles.commentsList}>
            {variantComments.length === 0 && <p className={styles.noComments}>Нет комментариев. Кликните на макет чтобы добавить.</p>}
            {variantComments.map(tc => (
              <CommentThread
                key={tc.id}
                thread={tc}
                onResolve={() => handleResolve(tc.id)}
                onReply={text => handleReply(tc.id, text)}
              />
            ))}
          </div>
        </FloatingPanel>
      </div>
    </div>
  )
}
