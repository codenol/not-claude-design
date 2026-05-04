import type { NorkaFsNode } from '../features/types'
import type { INorkaStorage } from './norkaStorage'
import * as nf from './norkaFs'

const DB_NAME = 'norka'
const STORE_NAME = 'tree'
const KEY = 'root'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function dbGet(db: IDBDatabase): Promise<NorkaFsNode | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(KEY)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function dbPut(db: IDBDatabase, tree: NorkaFsNode): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(tree, KEY)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

const EMPTY_TREE: NorkaFsNode = {
  name: '',
  type: 'dir',
  children: [],
}

export class IndexedDbStorage implements INorkaStorage {
  private tree: NorkaFsNode = EMPTY_TREE
  private init: Promise<void>
  private db!: IDBDatabase
  isInitialized = false

  constructor() {
    this.tree = nf.cloneTree(EMPTY_TREE)
    this.init = openDB().then(db => {
      this.db = db
      return dbGet(db).then(saved => {
        if (saved) {
          this.tree = nf.cloneTree(saved)
        }
        this.isInitialized = true
      })
    })
  }

  async waitReady(): Promise<void> {
    await this.init
  }

  private async persist(): Promise<void> {
    await this.init
    await dbPut(this.db, nf.cloneTree(this.tree))
  }

  async getTree(): Promise<NorkaFsNode> {
    await this.init
    return nf.cloneTree(this.tree)
  }

  async readFile(path: string): Promise<string | null> {
    await this.init
    return nf.readFile(this.tree, path)
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.init
    nf.writeFile(this.tree, path, content)
    await this.persist()
  }

  async deleteNode(path: string): Promise<boolean> {
    await this.init
    const result = nf.deleteNode(this.tree, path)
    if (result) await this.persist()
    return result
  }

  async createDir(path: string): Promise<void> {
    await this.init
    nf.createDir(this.tree, path)
    await this.persist()
  }

  async listDir(path: string): Promise<NorkaFsNode[]> {
    await this.init
    return nf.listDir(this.tree, path)
  }

  async exists(path: string): Promise<boolean> {
    await this.init
    return nf.exists(this.tree, path)
  }

  async importTree(tree: NorkaFsNode): Promise<void> {
    await this.init
    this.tree = nf.cloneTree(tree)
    await this.persist()
  }
}
