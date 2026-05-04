import { createDemoTree } from '../features/mockData'
import { IndexedDbStorage } from './indexedDbStorage'

let _storage: IndexedDbStorage | null = null

export async function initStorage(): Promise<IndexedDbStorage> {
  if (_storage) return _storage

  const storage = new IndexedDbStorage()
  await storage.waitReady()

  const tree = await storage.getTree()
  const isEmpty = tree.type === 'dir' && tree.children.length === 0

  if (isEmpty) {
    const demoTree = createDemoTree()
    await storage.importTree(demoTree)
  }

  _storage = storage
  return storage
}
