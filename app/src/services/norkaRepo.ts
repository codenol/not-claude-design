import type { INorkaStorage } from './norkaStorage'
import type { INorkaGit } from './norkaGit'
import type {
  Project,
  Page,
  Feature,
  FeatureStage,
  FeatureVersion,
  FeatureVersionSummary,
  PRD,
  PrototypeVariant,
  CommentThread,
} from '../features/types'

function parseJson<T>(content: string | null, fallback: T): T {
  if (!content) return fallback
  try {
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export class NorkaRepo {
  private storage: INorkaStorage

  constructor(storage: INorkaStorage, _git: INorkaGit) {
    this.storage = storage
  }

  private async ensureDir(path: string): Promise<void> {
    if (!(await this.storage.exists(path))) {
      await this.storage.createDir(path)
    }
  }

  // --- Projects ---

  async listProjects(): Promise<Project[]> {
    await this.ensureDir('projects')
    const nodes = await this.storage.listDir('projects')
    const projects: Project[] = []
    for (const node of nodes) {
      if (node.type !== 'dir') continue
      const raw = await this.storage.readFile(`projects/${node.name}/project.json`)
      const p = parseJson<Project>(raw, null as unknown as Project)
      if (p) projects.push({ ...p, id: node.name })
    }
    return projects.filter(p => !p.archived)
  }

  async getProject(projectId: string): Promise<Project | null> {
    const raw = await this.storage.readFile(`projects/${projectId}/project.json`)
    const p = parseJson<Project | null>(raw, null)
    if (!p) return null
    return { ...p, id: projectId }
  }

  async saveProject(project: Project): Promise<void> {
    const dir = `projects/${project.id}`
    await this.ensureDir(dir)
    await this.storage.writeFile(`${dir}/project.json`, JSON.stringify(project, null, 2))
  }

  // --- Pages ---

  async listPages(projectId: string): Promise<Page[]> {
    const dir = `projects/${projectId}/pages`
    await this.ensureDir(dir)
    const nodes = await this.storage.listDir(dir)
    const pages: Page[] = []
    for (const node of nodes) {
      if (node.type !== 'dir') continue
      const raw = await this.storage.readFile(`${dir}/${node.name}/page.json`)
      const p = parseJson<Page>(raw, null as unknown as Page)
      if (p) pages.push({ ...p, id: node.name, projectId })
    }
    pages.sort((a, b) => a.order - b.order)
    return pages.filter(p => !p.archived)
  }

  // --- Features ---

  async listFeatures(projectId: string, pageId: string): Promise<Feature[]> {
    const dir = `projects/${projectId}/pages/${pageId}/features`
    await this.ensureDir(dir)
    const nodes = await this.storage.listDir(dir)
    const features: Feature[] = []
    for (const node of nodes) {
      if (node.type !== 'dir') continue
      const raw = await this.storage.readFile(`${dir}/${node.name}/feature.json`)
      const f = parseJson<Feature>(raw, null as unknown as Feature)
      if (f) {
        const versions = await this.listVersions(projectId, pageId, node.name)
        features.push({ ...f, id: node.name, versions, projectId, pageId })
      }
    }
    return features.filter(f => !f.archived)
  }

  async getFeature(projectId: string, pageId: string, featureId: string): Promise<Feature | null> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}`
    const raw = await this.storage.readFile(`${dir}/feature.json`)
    const f = parseJson<Feature | null>(raw, null)
    if (!f) return null
    const versions = await this.listVersions(projectId, pageId, featureId)
    return { ...f, id: featureId, versions, projectId, pageId }
  }

  async saveFeature(projectId: string, pageId: string, feature: Feature): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${feature.id}`
    await this.ensureDir(dir)
    await this.storage.writeFile(`${dir}/feature.json`, JSON.stringify(feature, null, 2))
  }

  async updateFeatureStatus(
    projectId: string,
    pageId: string,
    featureId: string,
    status: FeatureStage,
  ): Promise<void> {
    const f = await this.getFeature(projectId, pageId, featureId)
    if (!f) throw new Error(`Feature not found: ${featureId}`)
    f.status = status
    await this.saveFeature(projectId, pageId, f)
  }

  // --- Versions ---

  async listVersions(
    projectId: string,
    pageId: string,
    featureId: string,
  ): Promise<FeatureVersionSummary[]> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions`
    await this.ensureDir(dir)
    const nodes = await this.storage.listDir(dir)
    const versions: FeatureVersionSummary[] = []
    for (const node of nodes) {
      if (node.type !== 'dir') continue
      const raw = await this.storage.readFile(`${dir}/${node.name}/version.json`)
      const v = parseJson<FeatureVersionSummary>(raw, null as unknown as FeatureVersionSummary)
      if (v) versions.push(v)
    }
    versions.sort((a, b) => a.major - b.major || a.minor - b.minor)
    return versions
  }

  async getVersion(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
  ): Promise<FeatureVersion | null> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}`
    const raw = await this.storage.readFile(`${dir}/version.json`)
    const v = parseJson<FeatureVersion | null>(raw, null)
    if (!v) return null

    const variants = await this.listVariants(projectId, pageId, featureId, major, minor)
    const comments = await this.getComments(projectId, pageId, featureId, major, minor)

    return {
      ...v,
      variants: variants.filter(v => !v.archived),
      archivedVariants: variants.filter(v => v.archived),
      comments,
    }
  }

  async saveVersion(
    projectId: string,
    pageId: string,
    featureId: string,
    version: FeatureVersion,
  ): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${version.major}.${version.minor}`
    await this.ensureDir(dir)
    const { variants, archivedVariants, comments, ...versionData } = version
    await this.storage.writeFile(`${dir}/version.json`, JSON.stringify(versionData, null, 2))
  }

  async createVersion(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    stage: FeatureStage,
  ): Promise<FeatureVersion> {
    const version: FeatureVersion = {
      major,
      minor,
      stage,
      selectedVariant: null,
      variants: [],
      archivedVariants: [],
      comments: [],
      createdAt: new Date().toISOString(),
    }
    await this.saveVersion(projectId, pageId, featureId, version)
    return version
  }

  // --- PRD ---

  async getPrd(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
  ): Promise<PRD | null> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}`
    const raw = await this.storage.readFile(`${dir}/prd.json`)
    return parseJson<PRD | null>(raw, null)
  }

  async savePrd(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    prd: PRD,
  ): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}`
    await this.ensureDir(dir)
    await this.storage.writeFile(`${dir}/prd.json`, JSON.stringify(prd, null, 2))
  }

  // --- Variants ---

  private async listVariants(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
  ): Promise<(PrototypeVariant & { archived: boolean })[]> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}/variants`
    await this.ensureDir(dir)
    const nodes = await this.storage.listDir(dir)
    const variants: (PrototypeVariant & { archived: boolean })[] = []
    for (const node of nodes) {
      if (node.type !== 'file' || !node.name.endsWith('.yaml')) continue
      const id = node.name.replace('.yaml', '')
      const content = await this.storage.readFile(`${dir}/${node.name}`)
      if (!content) continue

      const lines = content.split('\n')
      const name = lines.find(l => l.startsWith('# name:'))?.replace('# name:', '').trim() ?? id
      const archived = lines.some(l => l.startsWith('# archived: true'))

      const params: Record<string, string> = {}
      for (const line of lines) {
        if (line.startsWith('# param ')) {
          const [_, key, val] = line.split(' ')
          if (key && val) params[key] = val
        }
      }

      variants.push({ id, name, yaml: content, params, archived })
    }
    return variants
  }

  async saveVariant(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    variant: PrototypeVariant,
  ): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}/variants`
    await this.ensureDir(dir)

    let header = `# name: ${variant.name}\n`
    for (const [key, val] of Object.entries(variant.params)) {
      header += `# param ${key} ${val}\n`
    }
    header += '\n'

    await this.storage.writeFile(`${dir}/${variant.id}.yaml`, header + variant.yaml)
  }

  async archiveVariant(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    variantId: string,
    archive: boolean,
  ): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}/variants`
    const path = `${dir}/${variantId}.yaml`
    const content = await this.storage.readFile(path)
    if (!content) return

    if (archive) {
      if (!content.includes('# archived: true')) {
        await this.storage.writeFile(path, `# archived: true\n${content}`)
      }
    } else {
      await this.storage.writeFile(path, content.replace('# archived: true\n', ''))
    }
  }

  async selectVariant(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    variantId: string,
  ): Promise<void> {
    const version = await this.getVersion(projectId, pageId, featureId, major, minor)
    if (!version) throw new Error('Version not found')

    for (const v of version.variants) {
      if (v.id !== variantId) {
        await this.archiveVariant(projectId, pageId, featureId, major, minor, v.id, true)
      }
    }

    version.selectedVariant = variantId
    await this.saveVersion(projectId, pageId, featureId, version)
  }

  // --- Comments ---

  async getComments(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
  ): Promise<CommentThread[]> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}`
    const raw = await this.storage.readFile(`${dir}/comments.json`)
    return parseJson<CommentThread[]>(raw, [])
  }

  async saveComments(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    comments: CommentThread[],
  ): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}/features/${featureId}/versions/v${major}.${minor}`
    await this.ensureDir(dir)
    await this.storage.writeFile(`${dir}/comments.json`, JSON.stringify(comments, null, 2))
  }

  async addComment(
    projectId: string,
    pageId: string,
    featureId: string,
    major: number,
    minor: number,
    thread: CommentThread,
  ): Promise<void> {
    const comments = await this.getComments(projectId, pageId, featureId, major, minor)
    comments.push(thread)
    await this.saveComments(projectId, pageId, featureId, major, minor, comments)
  }

  // --- Update ---

  async renameProject(projectId: string, name: string): Promise<void> {
    const p = await this.getProject(projectId)
    if (!p) return
    p.name = name
    await this.saveProject(p)
  }

  async updateProjectDesc(projectId: string, description: string): Promise<void> {
    const p = await this.getProject(projectId)
    if (!p) return
    p.description = description
    await this.saveProject(p)
  }

  async archiveProject(projectId: string): Promise<void> {
    const p = await this.getProject(projectId)
    if (!p) return
    p.archived = true
    await this.saveProject(p)
  }

  async renamePage(projectId: string, pageId: string, name: string): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}`
    const raw = await this.storage.readFile(`${dir}/page.json`)
    const p = parseJson<Partial<Page>>(raw, {})
    p.name = name
    await this.storage.writeFile(`${dir}/page.json`, JSON.stringify(p, null, 2))
  }

  async updatePageDesc(projectId: string, pageId: string, description: string): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}`
    const raw = await this.storage.readFile(`${dir}/page.json`)
    const p = parseJson<Partial<Page>>(raw, {})
    p.description = description
    await this.storage.writeFile(`${dir}/page.json`, JSON.stringify(p, null, 2))
  }

  async archivePage(projectId: string, pageId: string): Promise<void> {
    const dir = `projects/${projectId}/pages/${pageId}`
    const raw = await this.storage.readFile(`${dir}/page.json`)
    const p = parseJson<Partial<Page>>(raw, {})
    p.archived = true
    await this.storage.writeFile(`${dir}/page.json`, JSON.stringify(p, null, 2))
  }

  async renameFeature(projectId: string, pageId: string, featureId: string, title: string): Promise<void> {
    const f = await this.getFeature(projectId, pageId, featureId)
    if (!f) return
    f.title = title
    await this.saveFeature(projectId, pageId, f)
  }

  async updateFeatureDesc(projectId: string, pageId: string, featureId: string, description: string): Promise<void> {
    const f = await this.getFeature(projectId, pageId, featureId)
    if (!f) return
    f.description = description
    await this.saveFeature(projectId, pageId, f)
  }

  async archiveFeature(projectId: string, pageId: string, featureId: string): Promise<void> {
    const f = await this.getFeature(projectId, pageId, featureId)
    if (!f) return
    f.archived = true
    await this.saveFeature(projectId, pageId, f)
  }

  // --- Create ---

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
  }

  async createProject(name: string): Promise<Project> {
    const id = this.slugify(name) || `project-${Date.now()}`
    await this.ensureDir(`projects/${id}`)
    const project: Omit<Project, 'id'> = {
      name,
      createdAt: new Date().toISOString(),
      team: [],
    }
    await this.storage.writeFile(`projects/${id}/project.json`, JSON.stringify(project, null, 2))
    await this.ensureDir(`projects/${id}/pages`)
    return { ...project, id }
  }

  async createPage(projectId: string, name: string): Promise<Page> {
    const id = this.slugify(name) || `page-${Date.now()}`
    const dir = `projects/${projectId}/pages/${id}`
    await this.ensureDir(dir)
    const pages = await this.listPages(projectId)
    const page: Page = { name, order: pages.length, id, projectId }
    await this.storage.writeFile(`${dir}/page.json`, JSON.stringify(page, null, 2))
    await this.ensureDir(`${dir}/features`)
    return page
  }

  async createFeature(projectId: string, pageId: string, title: string, description: string): Promise<Feature> {
    const id = this.slugify(title) || `feature-${Date.now()}`
    const dir = `projects/${projectId}/pages/${pageId}/features/${id}`
    await this.ensureDir(dir)
    const feature: Pick<Feature, 'title' | 'description' | 'status' | 'assignedTo' | 'selectedVariantId'> = {
      title,
      description,
      status: 'draft',
      assignedTo: {},
      selectedVariantId: null,
    }
    await this.storage.writeFile(`${dir}/feature.json`, JSON.stringify(feature, null, 2))
    await this.ensureDir(`${dir}/versions`)
    await this.createVersion(projectId, pageId, id, 1, 0, 'draft')
    return { ...feature, id, projectId, pageId, versions: [] }
  }
}
