import { ipcRenderer, contextBridge } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

interface FileSystemAPI {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  readDir(path: string): Promise<string[]>
  stat(path: string): Promise<{
    isFile: boolean
    isDirectory: boolean
    size: number
    mtime: Date
    ctime: Date
  }>
  exists(path: string): Promise<boolean>
  mkdir(path: string): Promise<void>
  delete(path: string): Promise<void>
  rename(oldPath: string, newPath: string): Promise<void>
  copy(src: string, dest: string): Promise<void>
}

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
// File system APIs
fs: {
  async readFile(filePath: string) {
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`)
    }
  },

  async writeFile(filePath: string, content: string) {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`)
    }
  },

  async readDir(dirPath: string) {
    try {
      const items = await fs.readdir(dirPath)
      const itemsWithFullPath = items.map(item => path.join(dirPath, item))
      return itemsWithFullPath
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`)
    }
  },

  async stat(itemPath: string) {
    try {
      const stats = await fs.stat(itemPath)
      return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
        ctime: stats.ctime
      }
    } catch (error) {
      throw new Error(`Failed to get item stats: ${error.message}`)
    }
  },

  async exists(itemPath: string) {
    try {
      await fs.access(itemPath)
      return true
    } catch {
      return false
    }
  },

  async mkdir(dirPath: string) {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`)
    }
  },

  async delete(itemPath: string) {
    try {
      const stats = await fs.stat(itemPath)
      if (stats.isDirectory()) {
        await fs.rm(itemPath, { recursive: true })
      } else {
        await fs.unlink(itemPath)
      }
    } catch (error) {
      throw new Error(`Failed to delete item: ${error.message}`)
    }
  },

  async rename(oldPath: string, newPath: string) {
    try {
      await fs.rename(oldPath, newPath)
    } catch (error) {
      throw new Error(`Failed to rename item: ${error.message}`)
    }
  },

  async copy(src: string, dest: string) {
    try {
      const stats = await fs.stat(src)
      if (stats.isDirectory()) {
        await fs.cp(src, dest, { recursive: true })
      } else {
        await fs.copyFile(src, dest)
      }
    } catch (error) {
      throw new Error(`Failed to copy item: ${error.message}`)
    }
  }
}
})
