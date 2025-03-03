import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { fileApi } from './fileApi'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import debug from 'electron-debug'
import getMenu from './MenuTemplate'
import Store from 'electron-store';

/* eslint-disable */
const require = createRequire(import.meta.url)
/* eslint-enable */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const store = new Store()

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │

// if development, enable debug and React DevTools
if (process.env.NODE_ENV === 'development') {
  debug()
}
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Create menu after window is initialized
  const MenuTemplate = getMenu(app, win, store)
  const menu = Menu.buildFromTemplate(MenuTemplate)
  Menu.setApplicationMenu(menu)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('ready', () => {
  createWindow()

  // Recreate menu after window is ready
  const MenuTemplate = getMenu(app, win, store)
  const menu = Menu.buildFromTemplate(MenuTemplate)
  Menu.setApplicationMenu(menu)
  
  // Set up IPC handlers for file operations
  ipcMain.handle('readFile', async (_, filePath) => await fileApi.readFile(filePath))
  ipcMain.handle('writeFile', async (_, filePath, content) => await fileApi.writeFile(filePath, content))
  ipcMain.handle('readDir', async (_, dirPath) => await fileApi.readDir(dirPath))
  ipcMain.handle('stat', async (_, itemPath) => await fileApi.stat(itemPath))
  ipcMain.handle('exists', async (_, itemPath) => await fileApi.exists(itemPath))
  ipcMain.handle('mkdir', async (_, dirPath) => await fileApi.mkdir(dirPath))
  ipcMain.handle('delete', async (_, itemPath) => await fileApi.delete(itemPath))
  ipcMain.handle('rename', async (_, oldPath, newPath) => await fileApi.rename(oldPath, newPath))
  ipcMain.handle('copy', async (_, src, dest) => await fileApi.copy(src, dest))
  ipcMain.handle('pathjoin', async (_, ...paths) => await path.join(...paths))
  ipcMain.handle('pathdirname', async (_, filePath) => await path.dirname(filePath))
  ipcMain.handle('pathbasename', async (_, filePath) => await path.basename(filePath))
  ipcMain.handle('pathnormalize', async (_, filePath) => await path.normalize(filePath))
  ipcMain.handle('setStore', async (_, key, value) => await store.set(key, value))
  ipcMain.handle('getStore', async (_, key) => await store.get(key))
  ipcMain.handle('deleteStore', async (_, key) => await store.delete(key))
  ipcMain.handle('clearStore', async () => await store.clear())
  ipcMain.handle('storeHas', async (_, key) => await store.has(key))
  ipcMain.handle('mainsend', async (_, channel, ...args) => await win?.webContents.send(channel, ...args))
  // Dialog handlers
  ipcMain.handle('showOpenDialog', async (_, options) => {
    return await dialog.showOpenDialog(win!, options)
  });
  ipcMain.handle('showSaveDialog', async (_, options) => {
    return await dialog.showSaveDialog(win!, options)
  });
  ipcMain.handle('showMessageBox', async (_, options) => {
    return await dialog.showMessageBox(win!, options)
  });
})
