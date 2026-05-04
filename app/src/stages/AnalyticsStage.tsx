import { useState, useEffect, useRef, useCallback } from 'react'
import type { PRD, FeatureStage } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import { PersonaEditor } from '../prd-builder/PersonaEditor'
import { UseCaseEditor } from '../prd-builder/UseCaseEditor'
import { DataModelEditor } from '../prd-builder/DataModelEditor'
import { ScreenInventoryEditor } from '../prd-builder/ScreenInventoryEditor'
import { VariantMatrixEditor } from '../prd-builder/VariantMatrixEditor'
import { CompletenessCheck, checkPrd } from '../prd-builder/CompletenessCheck'
import { Button } from '../components'
import { improveDescription } from '../services/llmService'
import styles from './AnalyticsStage.module.css'

export interface AnalyticsStageProps {
  repo: NorkaRepo
  projectId: string
  pageId: string
  featureId: string
  version: { major: number; minor: number }
  projectName: string
  pageName: string
  readOnly?: boolean
  onTransition: (to: FeatureStage) => void
}

const EMPTY_PRD: PRD = {
  personas: [],
  useCases: [],
  dataModel: [],
  screenInventory: [],
  variantMatrix: [],
}

type TabKey = 'desc' | 'personas' | 'usecases' | 'datamodel' | 'screens' | 'variants'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'desc', label: 'Описание' },
  { key: 'personas', label: 'Персоны' },
  { key: 'usecases', label: 'Use Cases' },
  { key: 'datamodel', label: 'Данные' },
  { key: 'screens', label: 'Экраны' },
  { key: 'variants', label: 'Вариативность' },
]

export function AnalyticsStage({ repo, projectId, pageId, featureId, version, projectName, pageName, readOnly, onTransition }: AnalyticsStageProps) {
  const [prd, setPrd] = useState<PRD>(EMPTY_PRD)
  const [description, setDescription] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('desc')
  const [saving, setSaving] = useState(false)
  const [descSaved, setDescSaved] = useState(false)
  const [toast, setToast] = useState('')
  const [improveState, setImproveState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [improveText, setImproveText] = useState('')
  const [originalDesc, setOriginalDesc] = useState('')
  const [improveError, setImproveError] = useState('')
  const [improvePhrase, setImprovePhrase] = useState('')
  const [loaded, setLoaded] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.style.height = ''  // auto — measure true content height
      const maxH = window.innerHeight * 0.8
      el.style.height = Math.max(120, Math.min(el.scrollHeight, maxH)) + 'px'
    })
  }, [description])

  useEffect(() => {
    Promise.all([
      repo.getPrd(projectId, pageId, featureId, version.major, version.minor),
      repo.getFeature(projectId, pageId, featureId),
    ]).then(([prdData, feat]) => {
      if (prdData) setPrd(prdData)
      if (feat) {
        setDescription(feat.description || '')
        setDescSaved(!!feat.description)
      }
      setLoaded(true)
    })
  }, [repo, projectId, pageId, featureId, version])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }, [])

  const autoSavePrd = useCallback((newPrd: PRD) => {
    setPrd(newPrd)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await repo.savePrd(projectId, pageId, featureId, version.major, version.minor, newPrd)
      setSaving(false)
      showToast('Сохранено')
    }, 500)
  }, [repo, projectId, pageId, featureId, version, showToast])

  const handleSaveDesc = async () => {
    setSaving(true)
    await repo.updateFeatureDesc(projectId, pageId, featureId, description)
    setDescSaved(true)
    setSaving(false)
    showToast('Сохранено')
  }

  const PHRASES = ['Ща…', 'Почти-почти…', 'Вот-вот уже…', 'Думаю…', 'Ещё секунду…', 'Собираю мысли…']

  const handleImprove = async () => {
    setImproveState('loading')
    setImproveError('')
    setOriginalDesc(description)
    setImprovePhrase('Ща…')

    let phraseIdx = 0
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % PHRASES.length
      setImprovePhrase(PHRASES[phraseIdx])
    }, 1000)

    try {
      const result = await improveDescription(projectName, pageName, description)
      clearInterval(interval)
      setDescription(result)
      setImproveText(result)
      setImproveState('result')
    } catch (err: any) {
      clearInterval(interval)
      setImproveError(err.message || 'Не удалось улучшить описание')
      setImproveState('idle')
    }
  }

  const handleAcceptImprove = () => {
    setImproveState('idle')
    setImproveText('')
    handleSaveDesc()
  }

  const handleRevertImprove = () => {
    setDescription(originalDesc)
    setImproveState('idle')
    setImproveText('')
  }

  const handleTransition = () => {
    onTransition('prototypes')
  }

  const personaNames = prd.personas.filter(p => p.name).map(p => p.name)
  const screenNames = prd.screenInventory.filter(s => s.title).map(s => ({ id: s.id, title: s.title }))
  const useCaseNames = prd.useCases.filter(uc => uc.title).map(uc => ({ id: uc.id, title: uc.title }))
  const completenessItems = checkPrd(prd)
  const allPassed = completenessItems.every(i => i.passed)

  if (!loaded) {
    return <div className={styles.loading}>Загрузка PRD...</div>
  }

  const tabsDisabled = !descSaved || readOnly

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.tabs}>
          {TABS.map(tab => {
            const isDisabled = tab.key !== 'desc' && tabsDisabled
            return (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''} ${isDisabled ? styles.tabDisabled : ''}`}
                onClick={() => !isDisabled && setActiveTab(tab.key)}
                disabled={isDisabled}
              >
                {tab.label}
              </button>
            )
          })}
          {saving && <span className={styles.savingIndicator}>●</span>}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'desc' && (
            <div className={styles.descSection}>
              <h2 className={styles.descTitle}>Описание фичи</h2>
              <textarea
                ref={textareaRef}
                className={styles.descTextarea}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Опишите фичу — сценарий, цели, контекст..."
                disabled={improveState === 'loading'}
              />
              {!readOnly && improveState !== 'result' && (
                <div className={styles.descActions}>
                  <Button sentiment="accent" size="large" onClick={handleSaveDesc} disabled={saving || !description.trim()}>
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  {descSaved && (
                    <Button sentiment="secondary" size="small" type="ghost" onClick={handleImprove} disabled={improveState === 'loading'}>
                      {improveState === 'loading' ? improvePhrase : 'Улучшить с ИИ'}
                    </Button>
                  )}
                </div>
              )}
              {improveState === 'result' && (
                <div className={styles.descActions}>
                  <Button sentiment="accent" size="small" onClick={handleAcceptImprove}>Принять</Button>
                  <Button sentiment="secondary" size="small" type="ghost" onClick={handleRevertImprove}>Вернуть как было</Button>
                </div>
              )}
              {improveError && <p className={styles.errorText}>{improveError}</p>}
            </div>
          )}

          {activeTab === 'personas' && (
            <PersonaEditor
              personas={prd.personas}
              onChange={personas => autoSavePrd({ ...prd, personas })}
            />
          )}
          {activeTab === 'usecases' && (
            <UseCaseEditor
              useCases={prd.useCases}
              personaNames={personaNames}
              screenNames={screenNames.map(s => s.title)}
              onChange={useCases => autoSavePrd({ ...prd, useCases })}
            />
          )}
          {activeTab === 'datamodel' && (
            <DataModelEditor
              entities={prd.dataModel}
              onChange={dataModel => autoSavePrd({ ...prd, dataModel })}
            />
          )}
          {activeTab === 'screens' && (
            <ScreenInventoryEditor
              screens={prd.screenInventory}
              useCaseNames={useCaseNames}
              onChange={screenInventory => autoSavePrd({ ...prd, screenInventory })}
            />
          )}
          {activeTab === 'variants' && (
            <VariantMatrixEditor
              dimensions={prd.variantMatrix}
              onChange={variantMatrix => autoSavePrd({ ...prd, variantMatrix })}
            />
          )}
        </div>
      </div>

      <div className={styles.sidebar}>
        <CompletenessCheck prd={prd} />
        {!readOnly && (
          <div className={styles.actions}>
            <Button sentiment="success" size="large" onClick={handleTransition} disabled={!allPassed}>
              → Передать в Макеты
            </Button>
          </div>
        )}
      </div>

      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}
    </div>
  )
}
