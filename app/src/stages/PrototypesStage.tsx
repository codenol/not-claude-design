import { useState, useEffect, useMemo, Component } from 'react'
import yaml from 'js-yaml'
import { Agentation } from 'agentation'
import type { FeatureStage, PrototypeVariant } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import type { ScreenConfig } from '../types/screen'
import { generateVariants } from '../services/llmService'
import { YamlRenderer } from '../renderer/YamlRenderer'
import { Button, Drawer } from '../components'
import styles from './PrototypesStage.module.css'

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state: { error: string | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error: error.message } }
  render() {
    if (this.state.error) {
      return <div className={styles.parseError}>Ошибка рендеринга макета: {this.state.error}</div>
    }
    return this.props.children
  }
}

const PHRASES = [
  'Ща-ща-ща…', 'Уже почти…', 'Ещё чуть-чуть…', 'Секунду…', 'Скоро будет…',
  'Думаю…', 'Почти готово…', 'Собираю…', 'Минуточку…', 'Подожди чуток…',
  'Готовлю ответ…', 'Нейроны греются…', 'Формулирую…', 'Сейчас-сейчас…',
  'Загружаю мысль…', 'Обрабатываю…', 'Почти на финише…', 'Пару секунд…',
  'Финишная прямая…', 'Шестерёнки крутятся…',
]

export interface PrototypesStageProps {
  repo: NorkaRepo
  projectId: string
  pageId: string
  featureId: string
  version: { major: number; minor: number }
  readOnly?: boolean
  onTransition: (to: FeatureStage) => void
  userColor?: string
}

function parseConfig(yamlStr: string): ScreenConfig | null {
  try {
    const obj = yaml.load(yamlStr) as any
    if (obj && obj.meta && Array.isArray(obj.content)) {
      return obj as ScreenConfig
    }
    return null
  } catch { return null }
}

export function PrototypesStage({ repo, projectId, pageId, featureId, version, readOnly, onTransition, userColor }: PrototypesStageProps) {
  const [variants, setVariants] = useState<PrototypeVariant[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [yamlDrawer, setYamlDrawer] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [aiPhrase, setAiPhrase] = useState('')
  const [drawerTab, setDrawerTab] = useState<'yaml' | 'request'>('yaml')

  useEffect(() => {
    if (!generating) { setAiPhrase(''); return }
    setAiPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)])
    const interval = setInterval(() => {
      setAiPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)])
    }, 1000)
    return () => clearInterval(interval)
  }, [generating])

  const loadVariants = () => {
    repo.getVersion(projectId, pageId, featureId, version.major, version.minor).then(ver => {
      if (ver) setVariants(ver.variants)
      setLoaded(true)
    })
  }

  useEffect(() => { loadVariants() }, [repo, projectId, pageId, featureId, version])

  const activeVariant = variants[activeIdx]
  const config = useMemo(() => activeVariant ? parseConfig(activeVariant.yaml) : null, [activeVariant])

  const handleSelectFinal = async () => {
    if (!activeVariant) return
    setSelecting(true)
    await repo.selectVariant(projectId, pageId, featureId, version.major, version.minor, activeVariant.id)
    setSelecting(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenError('')
    try {
      const prd = await repo.getPrd(projectId, pageId, featureId, version.major, version.minor)
      if (!prd) throw new Error('PRD не найден. Сначала заполните аналитику.')
      if (prd.personas.length === 0 || prd.useCases.length === 0) {
        throw new Error('PRD не заполнен. Добавьте хотя бы одну персону и один use case.')
      }

      const { yamls, request } = await generateVariants(prd)
      const names = ['V1 — Sidebar', 'V2 — Top Nav', 'V3 — Minimal']

      for (let i = 0; i < yamls.length; i++) {
        const variant: PrototypeVariant = {
          id: `v${Date.now()}_${i}`,
          name: names[i],
          yaml: yamls[i],
          params: { variant: names[i].split('—')[1]?.trim().toLowerCase() || String(i + 1) },
          request,
        }
        await repo.saveVariant(projectId, pageId, featureId, version.major, version.minor, variant)
      }

      setActiveIdx(0)
      loadVariants()
    } catch (err: any) {
      setGenError(err.message || 'Ошибка генерации')
    } finally {
      setGenerating(false)
    }
  }

  const handleTransition = () => { onTransition('discussion') }

  if (!loaded) return <div className={styles.loading}>Загрузка...</div>

  if (variants.length === 0 && !generating) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Нет макетов</p>
        <p className={styles.emptyText}>Сгенерируйте варианты из PRD через LLM.</p>
        {genError && <p className={styles.errorText}>{genError}</p>}
        <div className={styles.emptyActions}>
          <Button type="ghost" sentiment="secondary" size="small" onClick={() => onTransition('analytics')}>
            ← Аналитика
          </Button>
          <Button sentiment="accent" size="large" onClick={handleGenerate}>
            Сгенерировать варианты
          </Button>
        </div>
      </div>
    )
  }

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
          <Button type="ghost" sentiment="secondary" size="small" onClick={() => onTransition('analytics')}>
            ← Аналитика
          </Button>
          <Button sentiment="secondary" size="small" type="ghost" onClick={() => { setDrawerTab('yaml'); setYamlDrawer(true) }}>
            Запрос и YAML
          </Button>
          {!readOnly && <>
          <Button sentiment="accent" size="small" onClick={handleSelectFinal} disabled={selecting}>
            {selecting ? '...' : '★ Финальный'}
          </Button>
          <Button sentiment="success" size="small" onClick={handleTransition}>
            → Обсуждение
          </Button>
          </>}
        </div>
      </div>

      <div className={styles.preview}>
        {generating && (
          <div className={styles.generating}>
            <p className={styles.generatingTitle}>Генерирую макеты через LLM...</p>
            <p className={styles.generatingHint}>Это может занять до минуты</p>
            <p className={styles.generatingPhrase}>{aiPhrase}</p>
          </div>
        )}
        {genError && !generating && <p className={styles.errorText}>{genError}</p>}
        {!generating && config && <ErrorBoundary><YamlRenderer config={config} /></ErrorBoundary>}
        {!generating && !config && activeVariant && (
          <div className={styles.parseError}>
            Не удалось распарсить YAML варианта «{activeVariant.name}»
          </div>
        )}
      </div>

      <Drawer
        open={yamlDrawer}
        onClose={() => setYamlDrawer(false)}
        title={`${activeVariant?.name ?? ''}`}
        width={600}
      >
        <div className={styles.drawerTabs}>
          <button className={`${styles.drawerTab} ${drawerTab === 'yaml' ? styles.drawerTabActive : ''}`} onClick={() => setDrawerTab('yaml')}>YAML</button>
          <button className={`${styles.drawerTab} ${drawerTab === 'request' ? styles.drawerTabActive : ''}`} onClick={() => setDrawerTab('request')}>Запрос</button>
        </div>
        {drawerTab === 'yaml' && (
          <pre className={styles.yamlCode}>{activeVariant?.yaml ?? ''}</pre>
        )}
        {drawerTab === 'request' && (
          <pre className={styles.yamlCode}>{activeVariant?.request ?? 'Запрос не сохранён'}</pre>
        )}
      </Drawer>

      <Agentation color={userColor} />
    </div>
  )
}
