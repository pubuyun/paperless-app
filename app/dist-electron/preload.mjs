"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld(
  "electronApi",
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
    }
  }
);
