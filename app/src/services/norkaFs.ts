import type { NorkaFsNode, NorkaFsDir } from '../features/types'

export function getNode(root: NorkaFsNode, path: string): NorkaFsNode | null {
  const parts = path.split('/').filter(Boolean)
  let current: NorkaFsNode = root
  for (const part of parts) {
    if (current.type !== 'dir') return null
    const child = current.children.find(c => c.name === part)
    if (!child) return null
    current = child
  }
  return current
}

export function readFile(root: NorkaFsNode, path: string): string | null {
  const node = getNode(root, path)
  if (node?.type === 'file') return node.content
  return null
}

export function writeFile(root: NorkaFsNode, path: string, content: string): void {
  const parts = path.split('/').filter(Boolean)
  const fileName = parts.pop()!
  let current: NorkaFsDir = root as NorkaFsDir

  for (const part of parts) {
    let child = current.children.find(c => c.name === part)
    if (!child || child.type !== 'dir') {
      child = { name: part, type: 'dir', children: [] }
      current.children.push(child)
    }
    current = child as NorkaFsDir
  }

  const existing = current.children.find(c => c.name === fileName)
  if (existing && existing.type === 'file') {
    existing.content = content
  } else {
    current.children.push({ name: fileName, type: 'file', content })
  }
}

export function createDir(root: NorkaFsNode, path: string): void {
  const parts = path.split('/').filter(Boolean)
  let current: NorkaFsDir = root as NorkaFsDir

  for (const part of parts) {
    let child = current.children.find(c => c.name === part)
    if (!child) {
      child = { name: part, type: 'dir', children: [] }
      current.children.push(child)
    }
    if (child.type !== 'dir') return
    current = child as NorkaFsDir
  }
}

export function listDir(root: NorkaFsNode, path: string): NorkaFsNode[] {
  const node = getNode(root, path)
  if (node?.type === 'dir') return [...node.children]
  return []
}

export function deleteNode(root: NorkaFsNode, path: string): boolean {
  const parts = path.split('/').filter(Boolean)
  const targetName = parts.pop()
  if (!targetName) return false

  const parentPath = parts.join('/')
  const parent = parts.length === 0 ? root : getNode(root, parentPath)

  if (parent?.type === 'dir') {
    const idx = parent.children.findIndex(c => c.name === targetName)
    if (idx !== -1) {
      parent.children.splice(idx, 1)
      return true
    }
  }
  return false
}

export function exists(root: NorkaFsNode, path: string): boolean {
  return getNode(root, path) !== null
}

export function cloneTree(node: NorkaFsNode): NorkaFsNode {
  if (node.type === 'file') {
    return { name: node.name, type: 'file', content: node.content }
  }
  return {
    name: node.name,
    type: 'dir',
    children: node.children.map(c => cloneTree(c)),
  }
}
