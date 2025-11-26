const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    navigate: (url) => ipcRenderer.send('navigate', url),
});
