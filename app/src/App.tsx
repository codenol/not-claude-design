import { useState, useEffect, useCallback } from 'react'
import { LoginPage } from './pages/LoginPage'
import { AppShell } from './pages/AppShell'
import { LibrariesPage } from './pages/LibrariesPage'
import { ProjectsPage as ProjectsPageComponent } from './pages/ProjectsPage'
import { FeatureWorkspace } from './pages/FeatureWorkspace'
import { initStorage } from './services/initNorka'
import { NorkaRepo } from './services/norkaRepo'
import { NoopGit } from './services/norkaGit'
import { useUrlRouter } from './services/useUrlRouter'
import { getLatestVersion } from './features/workflowMachine'
import type { Project, Page, Feature, FeatureStage } from './features/types'
import type { UserInfo } from './services/roleConfig'
import './App.css'

const STORAGE_KEY = 'norka_user'

function loadSavedUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function featureUrl(projectId: string, pageId: string, featureId: string, stage?: FeatureStage, version?: { major: number; minor: number }) {
  let base = `/projects/${projectId}/${pageId}/${featureId}`
  if (version) {
    base += `/v${version.major}.${version.minor}`
  }
  if (stage) {
    base += `/${stage}`
  }
  return base
}

function versionUrl(projectId: string, pageId: string, featureId: string, major: number, minor: number) {
  return `/projects/${projectId}/${pageId}/${featureId}/v${major}.${minor}`
}

function App() {
  const { route, navigate } = useUrlRouter()
  const [repo, setRepo] = useState<NorkaRepo | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserInfo | null>(loadSavedUser)
  const [module, setModule] = useState<Module>('projects')

  useEffect(() => {
    initStorage().then(async storage => {
      const r = new NorkaRepo(storage, new NoopGit())
      setRepo(r)
      setLoading(false)
    })
  }, [])

  const loadProjects = useCallback(async () => {
    if (!repo) return
    const projList = await repo.listProjects()
    setProjects(projList)
    if (projList.length > 0) {
      const proj = projList[0]
      const pageList = await repo.listPages(proj.id)
      setPages(pageList)
      const allFeatures: Feature[] = []
      for (const page of pageList) {
        const featList = await repo.listFeatures(proj.id, page.id)
        allFeatures.push(...featList)
      }
      setFeatures(allFeatures)
    }
  }, [repo])

  const refreshData = useCallback(async () => {
    if (!repo) return
    const projList = await repo.listProjects()
    setProjects(projList)
    const allPages: Page[] = []
    const allFeatures: Feature[] = []
    for (const proj of projList) {
      const pageList = await repo.listPages(proj.id)
      allPages.push(...pageList)
      for (const page of pageList) {
        const featList = await repo.listFeatures(proj.id, page.id)
        allFeatures.push(...featList)
      }
    }
    setPages(allPages)
    setFeatures(allFeatures)
  }, [repo])

  useEffect(() => {
    if (repo && (route.page === 'projects' || route.page === 'entry' || route.page === 'feature' || route.page === 'feature-version')) {
      loadProjects()
    }
  }, [repo, route.page, loadProjects])

  const handleSelectFeature = useCallback((projectId: string, pageId: string, featureId: string) => {
    const feature = features.find(f => f.id === featureId)
    const ver = feature ? getLatestVersion(feature) : null
    navigate(featureUrl(projectId, pageId, featureId, undefined, ver ? { major: ver.major, minor: ver.minor } : undefined))
  }, [navigate, features])

  const handleSelectVersion = useCallback((projectId: string, pageId: string, featureId: string, major: number, minor: number) => {
    navigate(versionUrl(projectId, pageId, featureId, major, minor))
  }, [navigate])

  const handleCreateProject = useCallback(async (name: string) => {
    if (!repo) return
    await repo.createProject(name)
    await refreshData()
  }, [repo, refreshData])

  const handleCreatePage = useCallback(async (projectId: string, name: string) => {
    if (!repo) return
    await repo.createPage(projectId, name)
    await refreshData()
  }, [repo, refreshData])

  const handleCreateFeature = useCallback(async (projectId: string, pageId: string, title: string) => {
    if (!repo) return
    await repo.createFeature(projectId, pageId, title, '')
    await refreshData()
  }, [repo, refreshData])

  const handleModuleChange = (mod: Module) => {
    setModule(mod)
    navigate(mod === 'projects' ? '/projects' : '/libraries')
  }

  const handleLogin = (u: UserInfo) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
    navigate('/projects')
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    navigate('/')
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#9ca3af', fontSize: 14 }}>
        Загрузка...
      </div>
    )
  }

  const renderContent = () => {
    const isFeatureRoute = route.page === 'feature' || route.page === 'feature-version'

    if (isFeatureRoute) {
      const project = projects.find(p => p.id === route.projectId)
      const page = pages.find(p => p.id === route.pageId)
      const feature = features.find(f => f.id === route.featureId)

      if (!project || !page || !feature) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#9ca3af', fontSize: 14 }}>
            Загрузка...
          </div>
        )
      }

      const isReadOnly = route.page === 'feature-version'
      const viewedVersion = isReadOnly
        ? feature.versions.find(v => v.major === route.major && v.minor === route.minor)
        : null
      const viewVersion = viewedVersion
        ? { major: viewedVersion.major, minor: viewedVersion.minor, stage: viewedVersion.stage }
        : undefined

      const latestVersion = getLatestVersion(feature)
      const isLatestVersion = !isReadOnly || (latestVersion && latestVersion.major === route.major && latestVersion.minor === route.minor)

      return (
        <FeatureWorkspace
          feature={feature}
          projectName={project.name}
          pageName={page.name}
          repo={repo!}
          readOnly={isReadOnly && !isLatestVersion}
          viewVersion={viewVersion}
          explicitStage={route.stage}
          currentUser={user}
          onBack={() => navigate('/projects')}
          onStageChange={(to, newVer) => {
            const ver = newVer ?? (route.page === 'feature-version'
              ? { major: route.major!, minor: route.minor! }
              : (latestVersion ? { major: latestVersion.major, minor: latestVersion.minor } : { major: 1, minor: 0 }))
            navigate(featureUrl(route.projectId!, route.pageId!, route.featureId!, to, ver))
          }}
          onFeatureUpdate={(updated) => {
            setFeatures(prev => prev.map(f => f.id === updated.id ? updated : f))
          }}
        />
      )
    }

    if (route.page === 'libraries' || module === 'libraries') {
      return <LibrariesPage onBack={() => navigate('/projects')} />
    }

    return (
      <ProjectsPageComponent
        projects={projects}
        pages={pages}
        features={features}
        repo={repo!}
        onSelectFeature={handleSelectFeature}
        onSelectVersion={handleSelectVersion}
        onCreateProject={handleCreateProject}
        onCreatePage={handleCreatePage}
        onCreateFeature={handleCreateFeature}
        onRefresh={refreshData}
      />
    )
  }

  return (
    <AppShell
      user={user}
      currentModule={module}
      onModuleChange={handleModuleChange}
      onLogout={handleLogout}
    >
      {renderContent()}
    </AppShell>
  )
}

export default App
