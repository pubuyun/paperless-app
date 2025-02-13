"use strict";
const electron = require("electron");
const fs = require("fs");
const path = require("path");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // File system APIs
  fs: {
    async readFile(filePath) {
      try {
        return await fs.promises.readFile(filePath, "utf-8");
      } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
    },
    async writeFile(filePath, content) {
      try {
        await fs.promises.writeFile(filePath, content, "utf-8");
      } catch (error) {
        throw new Error(`Failed to write file: ${error.message}`);
      }
    },
    async readDir(dirPath) {
      try {
        const items = await fs.promises.readdir(dirPath);
        const itemsWithFullPath = items.map((item) => path.join(dirPath, item));
        return itemsWithFullPath;
      } catch (error) {
        throw new Error(`Failed to read directory: ${error.message}`);
      }
    },
    async stat(itemPath) {
      try {
        const stats = await fs.promises.stat(itemPath);
        return {
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          size: stats.size,
          mtime: stats.mtime,
          ctime: stats.ctime
        };
      } catch (error) {
        throw new Error(`Failed to get item stats: ${error.message}`);
      }
    },
    async exists(itemPath) {
      try {
        await fs.promises.access(itemPath);
        return true;
      } catch {
        return false;
      }
    },
    async mkdir(dirPath) {
      try {
        await fs.promises.mkdir(dirPath, { recursive: true });
      } catch (error) {
        throw new Error(`Failed to create directory: ${error.message}`);
      }
    },
    async delete(itemPath) {
      try {
        const stats = await fs.promises.stat(itemPath);
        if (stats.isDirectory()) {
          await fs.promises.rm(itemPath, { recursive: true });
        } else {
          await fs.promises.unlink(itemPath);
        }
      } catch (error) {
        throw new Error(`Failed to delete item: ${error.message}`);
      }
    },
    async rename(oldPath, newPath) {
      try {
        await fs.promises.rename(oldPath, newPath);
      } catch (error) {
        throw new Error(`Failed to rename item: ${error.message}`);
      }
    },
    async copy(src, dest) {
      try {
        const stats = await fs.promises.stat(src);
        if (stats.isDirectory()) {
          await fs.promises.cp(src, dest, { recursive: true });
        } else {
          await fs.promises.copyFile(src, dest);
        }
      } catch (error) {
        throw new Error(`Failed to copy item: ${error.message}`);
      }
    }
  }
});
