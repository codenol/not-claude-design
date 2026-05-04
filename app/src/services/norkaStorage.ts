import type { NorkaFsNode } from '../features/types'

export interface INorkaStorage {
  getTree(): Promise<NorkaFsNode>
  readFile(path: string): Promise<string | null>
  writeFile(path: string, content: string): Promise<void>
  deleteNode(path: string): Promise<boolean>
  createDir(path: string): Promise<void>
  listDir(path: string): Promise<NorkaFsNode[]>
  exists(path: string): Promise<boolean>
  importTree(tree: NorkaFsNode): Promise<void>
}
