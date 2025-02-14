import { promises as fs } from 'fs'
import path from 'path'

export const fileApi = {
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`)
    }
  },

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`)
    }
  },

  async readDir(dirPath: string): Promise<string[]> {
    try {
      const items = await fs.readdir(dirPath)
      return items
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`)
    }
  },

  async stat(itemPath: string): Promise<{
    isFile: boolean
    isDirectory: boolean
    size: number
    mtime: Date
    ctime: Date
  }> {
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

  async exists(itemPath: string): Promise<boolean> {
    try {
      await fs.access(itemPath)
      return true
    } catch {
      return false
    }
  },

  async mkdir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`)
    }
  },

  async delete(itemPath: string): Promise<void> {
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

  async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      await fs.rename(oldPath, newPath)
    } catch (error) {
      throw new Error(`Failed to rename item: ${error.message}`)
    }
  },

  async copy(src: string, dest: string): Promise<void> {
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
