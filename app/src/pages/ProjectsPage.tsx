import { useState, useEffect, useRef } from 'react'
import type { Project, Page, Feature } from '../features/types'
import type { NorkaRepo } from '../services/norkaRepo'
import { ProgressDots } from '../components/atoms/ProgressDots'
import { KebabMenu } from '../components/atoms/KebabMenu'
import { versionLabel } from '../features/workflowMachine'
import { Button } from '../components'
import styles from './ProjectsPage.module.css'

export interface ProjectsPageProps {
  projects: Project[]
  pages: Page[]
  features: Feature[]
  repo: NorkaRepo
  onSelectFeature: (projectId: string, pageId: string, featureId: string) => void
  onSelectVersion: (projectId: string, pageId: string, featureId: string, major: number, minor: number) => void
  onCreateProject: (name: string) => void
  onCreatePage: (projectId: string, name: string) => void
  onCreateFeature: (projectId: string, pageId: string, title: string) => void
  onRefresh: () => void
  onBack?: () => void
}

type ModalMode = null
  | { type: 'project' }
  | { type: 'page'; projectId: string }
  | { type: 'feature'; projectId: string; pageId: string }
  | { type: 'rename-project'; projectId: string; currentName: string }
  | { type: 'desc-project'; projectId: string; currentDesc: string }
  | { type: 'rename-page'; projectId: string; pageId: string; currentName: string }
  | { type: 'desc-page'; projectId: string; pageId: string; currentDesc: string }
  | { type: 'rename-feature'; projectId: string; pageId: string; featureId: string; currentName: string }
  | { type: 'desc-feature'; projectId: string; pageId: string; featureId: string; currentDesc: string }
  | { type: 'add-version'; projectId: string; pageId: string; featureId: string }

export function ProjectsPage({ projects, pages, features, repo, onSelectFeature, onSelectVersion,
  onCreateProject, onCreatePage, onCreateFeature, onRefresh }: ProjectsPageProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalMode>(null)
  const [modalName, setModalName] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (projects.length > 0 && !initialized.current) setExpandedProjects(new Set([projects[0].id]))
  }, [projects])
  useEffect(() => {
    if (projects.length > 0 && pages.length > 0 && !initialized.current) {
      setExpandedPages(new Set([`${projects[0].id}/${pages[0].id}`]))
      initialized.current = true
    }
  }, [projects, pages])

  const toggleSet = (s: React.Dispatch<React.SetStateAction<Set<string>>>, k: string) =>
    s(p => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n })

  const openModal = (mode: NonNullable<ModalMode>, currentValue = '') => {
    setModalName(currentValue)
    setModal(mode)
  }

  const handleCreate = () => {
    if (!modal || !modalName.trim()) return
    switch (modal.type) {
      case 'project': onCreateProject(modalName.trim()); break
      case 'page': onCreatePage(modal.projectId, modalName.trim()); break
      case 'feature': onCreateFeature(modal.projectId, modal.pageId, modalName.trim()); break
      case 'rename-project': repo.renameProject(modal.projectId, modalName.trim()).then(onRefresh); break
      case 'rename-page': repo.renamePage(modal.projectId, modal.pageId, modalName.trim()).then(onRefresh); break
      case 'rename-feature': repo.renameFeature(modal.projectId, modal.pageId, modal.featureId, modalName.trim()).then(onRefresh); break
      case 'desc-project': repo.updateProjectDesc(modal.projectId, modalName.trim()).then(onRefresh); break
      case 'desc-page': repo.updatePageDesc(modal.projectId, modal.pageId, modalName.trim()).then(onRefresh); break
      case 'desc-feature': repo.updateFeatureDesc(modal.projectId, modal.pageId, modal.featureId, modalName.trim()).then(onRefresh); break
      case 'add-version': {
        const feat = features.find(f => f.id === modal.featureId)
        const nextMajor = feat ? feat.versions.reduce((m, v) => v.major > m ? v.major : m, 0) + 1 : 1
        repo.createVersion(modal.projectId, modal.pageId, modal.featureId, nextMajor, 0, 'draft').then(onRefresh)
        break
      }
    }
    setModal(null)
  }

  const getModalTitle = () => {
    if (!modal) return ''
    if (modal.type === 'rename-project' || modal.type === 'rename-page' || modal.type === 'rename-feature') return 'Переименовать'
    if (modal.type === 'desc-project' || modal.type === 'desc-page' || modal.type === 'desc-feature') return 'Описание'
    if (modal.type === 'project') return 'Новый проект'
    if (modal.type === 'page') return 'Новая страница'
    if (modal.type === 'feature') return 'Новая фича'
    if (modal.type === 'add-version') return 'Новая версия'
    return ''
  }

  const isDescriptionModal = modal && (modal.type.startsWith('desc'))
  const isSimpleModal = modal && (modal.type === 'project' || modal.type === 'page' || modal.type === 'feature' || modal.type === 'add-version')

  const stageLabel: Record<string, string> = {
    draft: 'Черновик', analytics: 'Аналитика', prototypes: 'Макеты',
    discussion: 'Обсуждение', final: 'Оформление', published: 'Опубликовано',
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Проекты</h1>
      </div>

      <div className={styles.list}>
        {projects.map(project => {
          const projectPages = pages.filter(p => p.projectId === project.id)

          return (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div className={styles.projectHeadLeft} onClick={() => toggleSet(setExpandedProjects, project.id)}>
                <span className={`${styles.chevron} ${expandedProjects.has(project.id) ? styles.chevronDown : ''}`}>▸</span>
                <span className={styles.projectName}>{project.name}</span>
              </div>
              <KebabMenu items={[
                { label: 'Добавить страницу', onClick: () => openModal({ type: 'page', projectId: project.id }) },
                { label: 'Переименовать', onClick: () => openModal({ type: 'rename-project', projectId: project.id, currentName: project.name }, project.name) },
                { label: 'Изменить описание', onClick: () => openModal({ type: 'desc-project', projectId: project.id, currentDesc: project.description ?? '' }, project.description ?? '') },
                { label: 'Архивировать', danger: true, onClick: () => { repo.archiveProject(project.id).then(onRefresh) } },
              ]} />
            </div>

            {expandedProjects.has(project.id) && projectPages.length === 0 && (
              <div className={styles.emptyBlock} onClick={() => openModal({ type: 'page', projectId: project.id })}>Добавить первую страницу</div>
            )}
            {expandedProjects.has(project.id) && projectPages.map(page => {
              const pageKey = `${project.id}/${page.id}`
              const pageFeatures = features.filter(f => f.projectId === project.id && f.pageId === page.id)

              return (
                <div key={page.id} className={styles.pageBlock}>
                  <div className={styles.pageHeader}>
                    <div className={styles.pageHeadLeft} onClick={() => toggleSet(setExpandedPages, pageKey)}>
                      <span className={`${styles.chevron} ${expandedPages.has(pageKey) ? styles.chevronDown : ''}`}>▸</span>
                      <span className={styles.pageName}>{page.name}</span>
                    </div>
                    <KebabMenu items={[
                      { label: 'Добавить фичу', onClick: () => openModal({ type: 'feature', projectId: project.id, pageId: page.id }) },
                      { label: 'Переименовать', onClick: () => openModal({ type: 'rename-page', projectId: project.id, pageId: page.id, currentName: page.name }, page.name) },
                      { label: 'Изменить описание', onClick: () => openModal({ type: 'desc-page', projectId: project.id, pageId: page.id, currentDesc: page.description ?? '' }, page.description ?? '') },
                      { label: 'Архивировать', danger: true, onClick: () => { repo.archivePage(project.id, page.id).then(onRefresh) } },
                    ]} />
                  </div>

                  {expandedPages.has(pageKey) && pageFeatures.length === 0 && (
                    <div className={styles.emptyBlock} onClick={() => openModal({ type: 'feature', projectId: project.id, pageId: page.id })}>
                      Добавить первую фичу
                    </div>
                  )}

                  {expandedPages.has(pageKey) && pageFeatures.map(feature => {
                    const sortedVersions = [...feature.versions].sort((a, b) => {
                      if (a.major !== b.major) return b.major - a.major
                      return b.minor - a.minor
                    })
                    const latest = sortedVersions[0]
                    const olderVersions = sortedVersions.slice(1)
                    const featKey = `${project.id}/${page.id}/${feature.id}`

                    return (
                      <div key={feature.id} className={styles.featureBlock}>
                        <div className={styles.featureRow}>
                          <div className={styles.featureHeadLeft} onClick={() => onSelectFeature(project.id, page.id, feature.id)}>
                            <span className={styles.featureBullet}>●</span>
                            <span className={styles.featureTitle}>{feature.title}</span>
                            <span className={styles.featureStatus}>{stageLabel[feature.status] ?? feature.status}</span>
                          </div>
                          <div className={styles.featureMeta}>
                            <ProgressDots stage={feature.status} />
                            {latest && <span className={styles.version}>{versionLabel(latest)}</span>}
                            {olderVersions.length > 0 && (
                              <span className={`${styles.chevron} ${styles.versionChevron} ${expandedFeatures.has(featKey) ? styles.chevronDown : ''}`}
                                onClick={e => { e.stopPropagation(); toggleSet(setExpandedFeatures, featKey) }}>▸</span>
                            )}
                            {olderVersions.length === 0 && <span className={styles.noVersions} />}
                          </div>
                          <KebabMenu items={[
                            { label: 'Новая версия', onClick: () => {
                              const nextMajor = (feature.versions.reduce((m, v) => v.major > m ? v.major : m, 0)) + 1
                              repo.createVersion(project.id, page.id, feature.id, nextMajor, 0, 'draft').then(onRefresh)
                            } },
                            { label: 'Переименовать', onClick: () => openModal({ type: 'rename-feature', projectId: project.id, pageId: page.id, featureId: feature.id, currentName: feature.title }, feature.title) },
                            { label: 'Изменить описание', onClick: () => openModal({ type: 'desc-feature', projectId: project.id, pageId: page.id, featureId: feature.id, currentDesc: feature.description }, feature.description) },
                            { label: 'Архивировать', danger: true, onClick: () => { repo.archiveFeature(project.id, page.id, feature.id).then(onRefresh) } },
                          ]} />
                        </div>

                        {feature.versions.length === 0 && (
                          <div className={styles.emptyBlock} onClick={() => openModal({ type: 'add-version', projectId: project.id, pageId: page.id, featureId: feature.id })}>
                            Добавить первую версию
                          </div>
                        )}

                        {olderVersions.length > 0 && expandedFeatures.has(featKey) && olderVersions.map(ver => (
                          <div key={`${ver.major}.${ver.minor}`} className={styles.oldVersionRow}
                            onClick={() => onSelectVersion(project.id, page.id, feature.id, ver.major, ver.minor)}>
                            <span className={styles.oldVersionBullet}>·</span>
                            <span className={styles.oldVersionLabel}>{versionLabel(ver)}</span>
                            <span className={styles.oldVersionStage}>{stageLabel[ver.stage] ?? ver.stage}</span>
                            <KebabMenu items={[
                              { label: 'Просмотреть', onClick: () => onSelectVersion(project.id, page.id, feature.id, ver.major, ver.minor) },
                            ]} />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )})}

        <button className={styles.newProjectBtn} onClick={() => openModal({ type: 'project' })}>
          + Новый проект
        </button>
      </div>

      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>{getModalTitle()}</div>
            {modal.type === 'add-version' ? (
              <p className={styles.versionHint}>
                Будет создана версия v{(() => {
                  const feat = features.find(f => f.id === (modal as { featureId: string }).featureId)
                  return feat ? feat.versions.reduce((m, v) => v.major > m ? v.major : m, 0) + 1 : 1
                })()}.0
              </p>
            ) : isDescriptionModal ? (
              <textarea className={styles.modalTextarea} value={modalName}
                onChange={e => setModalName(e.target.value)} rows={4} autoFocus />
            ) : isSimpleModal && (
              <input className={styles.modalInput} placeholder="Название" value={modalName}
                onChange={e => setModalName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate() }} autoFocus />
            )}
            <div className={styles.modalActions}>
              <Button type="ghost" sentiment="secondary" size="small" onClick={() => setModal(null)}>Отмена</Button>
              <Button sentiment="accent" size="small" onClick={handleCreate}>
                {modal.type.startsWith('rename') || modal.type.startsWith('desc') ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
