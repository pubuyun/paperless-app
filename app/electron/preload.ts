import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

type IpcHandler = (event: IpcRendererEvent, ...args: unknown[]) => void

interface IpcApi {
  on(channel: string, func: ((...args: unknown[]) => void)): IpcHandler
  off(channel: string, func: IpcHandler): void
  send(channel: string, ...args: unknown[]): void
  invoke(channel: string, ...args: unknown[]): Promise<unknown>
  mainsend(channel: string, ...args: unknown[]): Promise<unknown>
}

interface FileAPI {
  showOpenDialog(options: { properties: string[] }): Promise<{ canceled: boolean; filePaths: string[] }>
  showSaveDialog(options: { title?: string; buttonLabel?: string; properties?: string[] }): Promise<{ canceled: boolean; filePath: string }>
  showMessageBox(options: { type: string; title: string; message: string; buttons: string[]; defaultId?: number; cancelId?: number }): Promise<{ response: number }>
  readFile(filePath: string): Promise<string>
  writeFile(filePath: string, content: string): Promise<void>
  readDir(dirPath: string): Promise<string[]>
  stat(itemPath: string): Promise<{
    isFile: boolean
    isDirectory: boolean
    size: number
    mtime: Date
    ctime: Date
  }>
  exists(itemPath: string): Promise<boolean>
  mkdir(dirPath: string): Promise<void>
  delete(itemPath: string): Promise<void>
  rename(oldPath: string, newPath: string): Promise<void>
  copy(src: string, dest: string): Promise<void>
  pathJoin(...paths: string[]): Promise<string>
  pathDirname(filePath: string): Promise<string>
  pathBasename(filePath: string): Promise<string>
  pathNormalize(filePath: string): Promise<string>
}
interface StoreAPI {
  set(key: string, value: unknown): Promise<void>
  get(key: string): Promise<unknown>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

contextBridge.exposeInMainWorld(
  'IpcApi',
  {
    on(channel: string, func: ((...args: unknown[]) => void)) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args)
      ipcRenderer.on(channel, subscription)
      return subscription
    },
    off(channel: string, func: IpcHandler) {
      ipcRenderer.off(channel, func)
    },
    send(channel: string, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args)
    },
    invoke(channel: string, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args)
    },
    mainsend(channel: string, ...args: unknown[]) {
      return ipcRenderer.invoke('mainsend', channel, ...args)
    }
  } as IpcApi
)
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'FileApi',
  {
    // File system APIs
    readFile(filePath: string) {
      return ipcRenderer.invoke('readFile', filePath)
    },
    writeFile(filePath: string, content: string) {
      return ipcRenderer.invoke('writeFile', filePath, content)
    },
    readDir(dirPath: string) {
      return ipcRenderer.invoke('readDir', dirPath)
    },
    stat(itemPath: string) {
      return ipcRenderer.invoke('stat', itemPath)
    },
    exists(itemPath: string) {
      return ipcRenderer.invoke('exists', itemPath)
    },
    mkdir(dirPath: string) {
      return ipcRenderer.invoke('mkdir', dirPath)
    },
    delete(itemPath: string) {
      return ipcRenderer.invoke('delete', itemPath)
    },
    rename(oldPath: string, newPath: string) {
      return ipcRenderer.invoke('rename', oldPath, newPath)
    },
    copy(src: string, dest: string) {
      return ipcRenderer.invoke('copy', src, dest)
    },
    // Dialog APIs
    showOpenDialog(options: { properties: string[] }) {
      return ipcRenderer.invoke('showOpenDialog', options)
    },
    showSaveDialog(options: { title?: string; buttonLabel?: string; properties?: string[] }) {
      return ipcRenderer.invoke('showSaveDialog', options)
    },
    showMessageBox(options: { type: string; title: string; message: string; buttons: string[]; defaultId?: number; cancelId?: number }) {
      return ipcRenderer.invoke('showMessageBox', options)
    },
    // Path APIs
    pathJoin(...paths: string[]) {
      return ipcRenderer.invoke('pathjoin', ...paths)
    },
    pathDirname(filePath: string) {
      return ipcRenderer.invoke('pathdirname', filePath)
    },
    pathBasename(filePath: string) {
      return ipcRenderer.invoke('pathbasename', filePath)
    },
    pathNormalize(filePath: string) {
      return ipcRenderer.invoke('pathnormalize', filePath)
    }
  } as FileAPI
)
contextBridge.exposeInMainWorld(
  'storeApi',
  {
    set(key: string, value: unknown) {
      return ipcRenderer.invoke('setStore', key, value)
    },
    get(key: string) {
      return ipcRenderer.invoke('getStore', key)
    },
    delete(key: string) {
      return ipcRenderer.invoke('deleteStore', key)
    },
    clear() {
      return ipcRenderer.invoke('clearStore')
    },
    has(key: string) {
      return ipcRenderer.invoke('storeHas', key)
    }
  } as StoreAPI
)
// Declare custom window interface
declare global {
  interface Window {
    IpcApi: IpcApi
    FileApi: FileAPI
    storeApi: StoreAPI
  }
}

export {}
