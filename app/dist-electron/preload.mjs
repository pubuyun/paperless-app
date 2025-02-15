"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld(
  "IpcApi",
  {
    on(channel, func) {
      const subscription = (_event, ...args) => func(...args);
      electron.ipcRenderer.on(channel, subscription);
      return subscription;
    },
    off(channel, func) {
      electron.ipcRenderer.off(channel, func);
    },
    send(channel, ...args) {
      electron.ipcRenderer.send(channel, ...args);
    },
    invoke(channel, ...args) {
      return electron.ipcRenderer.invoke(channel, ...args);
    },
    mainsend(channel, ...args) {
      return electron.ipcRenderer.invoke("mainsend", channel, ...args);
    }
  }
);
electron.contextBridge.exposeInMainWorld(
  "FileApi",
  {
    // File system APIs
    readFile(filePath) {
      return electron.ipcRenderer.invoke("readFile", filePath);
    },
    writeFile(filePath, content) {
      return electron.ipcRenderer.invoke("writeFile", filePath, content);
    },
    readDir(dirPath) {
      return electron.ipcRenderer.invoke("readDir", dirPath);
    },
    stat(itemPath) {
      return electron.ipcRenderer.invoke("stat", itemPath);
    },
    exists(itemPath) {
      return electron.ipcRenderer.invoke("exists", itemPath);
    },
    mkdir(dirPath) {
      return electron.ipcRenderer.invoke("mkdir", dirPath);
    },
    delete(itemPath) {
      return electron.ipcRenderer.invoke("delete", itemPath);
    },
    rename(oldPath, newPath) {
      return electron.ipcRenderer.invoke("rename", oldPath, newPath);
    },
    copy(src, dest) {
      return electron.ipcRenderer.invoke("copy", src, dest);
    },
    // Dialog APIs
    showOpenDialog(options) {
      return electron.ipcRenderer.invoke("showOpenDialog", options);
    },
    showSaveDialog(options) {
      return electron.ipcRenderer.invoke("showSaveDialog", options);
    },
    showMessageBox(options) {
      return electron.ipcRenderer.invoke("showMessageBox", options);
    },
    // Path APIs
    pathJoin(...paths) {
      return electron.ipcRenderer.invoke("pathjoin", ...paths);
    },
    pathDirname(filePath) {
      return electron.ipcRenderer.invoke("pathdirname", filePath);
    },
    pathBasename(filePath) {
      return electron.ipcRenderer.invoke("pathbasename", filePath);
    },
    pathNormalize(filePath) {
      return electron.ipcRenderer.invoke("pathnormalize", filePath);
    }
  }
);
electron.contextBridge.exposeInMainWorld(
  "storeApi",
  {
    set(key, value) {
      return electron.ipcRenderer.invoke("setStore", key, value);
    },
    get(key) {
      return electron.ipcRenderer.invoke("getStore", key);
    },
    delete(key) {
      return electron.ipcRenderer.invoke("deleteStore", key);
    },
    clear() {
      return electron.ipcRenderer.invoke("clearStore");
    },
    has(key) {
      return electron.ipcRenderer.invoke("storeHas", key);
    }
  }
);
