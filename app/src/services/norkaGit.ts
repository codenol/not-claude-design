import type { GitStatus } from '../features/types'

export interface INorkaGit {
  status(path: string): Promise<GitStatus>
  pull(path: string): Promise<void>
  push(path: string, message: string): Promise<void>
  getRemote(path: string): Promise<string | null>
  setRemote(path: string, url: string, token: string): Promise<void>
}

export class NoopGit implements INorkaGit {
  async status(_path: string): Promise<GitStatus> {
    return { clean: true, changes: [] }
  }

  async pull(_path: string): Promise<void> {}

  async push(_path: string, _message: string): Promise<void> {}

  async getRemote(_path: string): Promise<string | null> {
    return null
  }

  async setRemote(_path: string, _url: string, _token: string): Promise<void> {}
}
