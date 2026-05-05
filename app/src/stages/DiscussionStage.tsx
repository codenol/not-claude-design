import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import yaml from 'js-yaml'
import { Agentation, type Annotation } from 'agentation'
import type { FeatureStage, CommentThread as CommentThreadType } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import type { UserInfo } from '../services/roleConfig'
import type { ScreenConfig } from '../types/screen'
import { YamlRenderer } from '../renderer/YamlRenderer'
import { Button } from '../components'
import { getRoleColor } from '../services/roleConfig'
import styles from './DiscussionStage.module.css'

export interface DiscussionStageProps {
  repo: NorkaRepo
  projectId: string
  pageId: string
  featureId: string
  version: { major: number; minor: number }
  readOnly?: boolean
  currentUser: UserInfo
  onTransition: (to: FeatureStage) => void
}

function parseConfig(yamlStr: string): ScreenConfig | null {
  try {
    const obj = yaml.load(yamlStr) as any
    if (obj && obj.meta && Array.isArray(obj.content)) return obj as ScreenConfig
    return null
  } catch { return null }
}

function commentToAnnotation(
  c: CommentThreadType,
  variantId: string
): Annotation {
  const lastMsg = c.messages[c.messages.length - 1]
  return {
    id: c.id,
    x: Math.round(c.x),
    y: Math.round(c.y),
    comment: lastMsg?.text ?? '',
    messages: c.messages.map((m, i) => ({
      id: `${c.id}_msg_${i}`,
      authorRole: m.author ?? '',
      authorName: m.authorName ?? '',
      authorInitials: m.authorInitials ?? '',
      roleColor: getRoleColor(m.author ?? 'ПО'),
      text: m.text,
      timestamp: new Date(m.timestamp).getTime(),
      forLLM: false,
    })),
    element: 'Комментарий',
    elementPath: `variant:${variantId} click@${c.x},${c.y}`,
    timestamp: Date.now(),
  }
}

export function DiscussionStage({ repo, projectId, pageId, featureId, version, readOnly, currentUser, onTransition }: DiscussionStageProps) {
  const [variants, setVariants] = useState<{ id: string; name: string; yaml: string }[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [initialAnnotations, setInitialAnnotations] = useState<Annotation[]>([])
  const previewRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    setLoaded(false)
    const ver = await repo.getVersion(projectId, pageId, featureId, version.major, version.minor)
    if (ver) {
      setVariants(ver.variants.map(v => ({ id: v.id, name: v.name, yaml: v.yaml })))
      // Convert comments to annotations for active variant
      const activeVar = ver.variants[activeIdx]
      if (activeVar) {
        const variantComments = ver.comments.filter(c => c.variantId === activeVar.id)
        setInitialAnnotations(variantComments.map(c => commentToAnnotation(c, activeVar.id)))
      }
    }
    setLoaded(true)
  }, [repo, projectId, pageId, featureId, version, activeIdx])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeVariant = variants[activeIdx]
  const config = useMemo(() => {
    if (!activeVariant) return null
    return parseConfig(activeVariant.yaml)
  }, [activeVariant])

  const storageKey = `feedback-annotations-${projectId}/${pageId}/${featureId}/v${version.major}.${version.minor}/${activeVariant?.id ?? ''}`

  const handleSelectFinal = async () => {
    if (!activeVariant) return
    setSelecting(true)
    await repo.selectVariant(projectId, pageId, featureId, version.major, version.minor, activeVariant.id)
    setSelecting(false)
  }

  const roleColor = getRoleColor(currentUser.role)

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
            <button key={v.id} className={`${styles.tab} ${i === activeIdx ? styles.tabActive : ''}`} onClick={() => { setActiveIdx(i); setInitialAnnotations([]) }}>
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
        <div className={styles.preview} ref={previewRef}>
          {config && <YamlRenderer config={config} />}
        </div>
      </div>

      <Agentation
        key={activeVariant?.id}
        storageKey={storageKey}
        color={roleColor}
        userInfo={{
          role: currentUser.role,
          name: currentUser.name,
          initials: currentUser.initials,
          roleColor,
        }}
        scrollRef={previewRef}
        initialAnnotations={initialAnnotations}
        onSubmit={(output, annotations) => {
          // Save all annotations back to repo as CommentThreads
          const comments: CommentThreadType[] = annotations.map(a => ({
            id: a.id,
            variantId: activeVariant?.id ?? '',
            anchor: { type: 'yaml-node', path: a.elementPath },
            x: a.x,
            y: a.y,
            messages: (a.messages || []).map(m => ({
              author: m.authorRole as any,
              authorId: '',
              authorName: m.authorName,
              authorInitials: m.authorInitials,
              text: m.text,
              timestamp: new Date(m.timestamp).toISOString(),
            })),
            resolved: false,
          }))
          repo.saveComments(projectId, pageId, featureId, version.major, version.minor, comments)
        }}
      />
    </div>
  )
}
