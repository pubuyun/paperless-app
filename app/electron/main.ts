import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import { fileApi } from './fileApi'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import debug from 'electron-debug'

/* eslint-disable */
const require = createRequire(import.meta.url)
/* eslint-enable */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │

// if development, enable debug
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
const isMac = process.platform === 'darwin';

const template = [
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
    : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Open Folder',
        click: async () => {
          const result = await dialog.showOpenDialog(win!, {
            properties: ['openDirectory']
          });
          win.webContents.send('open-folder-dialog-completed', result);
        }
      },
      { type: 'separator' },
      {
        label: 'New',
        submenu: [
          {
            label: 'File',
            click: async () => {
              const result = await dialog.showSaveDialog(win!, {
                title: 'Create New File',
                buttonLabel: 'Create'
              });
              win.webContents.send('new-file-dialog-completed', result);
            }
          },
          {
            label: 'Folder',
            click: async () => {
              const result = await dialog.showSaveDialog(win!, {
                title: 'Create New Folder',
                buttonLabel: 'Create',
                properties: ['createDirectory']
              });
              win.webContents.send('new-folder-dialog-completed', result);
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Delete',
        click: async () => {
          const result = await dialog.showMessageBox(win!, {
            type: 'warning',
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete the selected items?',
            buttons: ['Delete', 'Cancel'],
            defaultId: 1,
            cancelId: 1
          });
          win.webContents.send('delete-confirmed', result);
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
        : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [
            { role: 'close' }
          ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://electronjs.org');
        }
      }
    ]
  }
];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
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
  
  // Context menu handler
  ipcMain.on('show-context-menu', (event) => {
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: win });
  });

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
