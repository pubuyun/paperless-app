import {shell, MenuItemConstructorOptions, App, dialog, BrowserWindow } from "electron"
import Store from "electron-store"

const isMac = process.platform === 'darwin';

export default function getMenu(app:App, win:BrowserWindow|null, store:Store) 
{
    return [
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
              ] as MenuItemConstructorOptions[]
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
            {
              label: 'Clear Cache',
              click: async () => {
                store.clear();
              }
            },
            isMac ? { role: 'close' } : { role: 'quit' }
          ] as MenuItemConstructorOptions[]
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
                    ] as MenuItemConstructorOptions[]
                  }
                ]
              : [
                  { role: 'delete' },
                  { type: 'separator' },
                  { role: 'selectAll' }
                ]) as MenuItemConstructorOptions[]
          ] as MenuItemConstructorOptions[]
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
          ] as MenuItemConstructorOptions[]
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
                ]) as MenuItemConstructorOptions[]
          ] as MenuItemConstructorOptions[]
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
          ] as MenuItemConstructorOptions[]
        }
      ] as MenuItemConstructorOptions[];
}
