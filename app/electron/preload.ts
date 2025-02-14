import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

type IpcHandler = (event: IpcRendererEvent, ...args: unknown[]) => void

interface FileAPI {
  on(channel: string, func: ((...args: unknown[]) => void)): void
  off(channel: string, func: IpcHandler): void
  send(channel: string, ...args: unknown[]): void
  invoke(channel: string, ...args: unknown[]): Promise<unknown>
  showOpenDialog(options: { properties: string[] }): Promise<{ canceled: boolean; filePaths: string[] }>
  showSaveDialog(options: { title?: string; buttonLabel?: string; properties?: string[] }): Promise<{ canceled: boolean; filePath?: string }>
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
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronApi',
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
    }
  } as FileAPI
)

// Declare custom window interface
declare global {
  interface Window {
    electronApi: FileAPI
  }
}

export {}
