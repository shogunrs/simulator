const { app, BrowserWindow } = require("electron");
const path = require("node:path");

const devServerURL = process.env.VITE_DEV_SERVER_URL || "http://localhost:3000";
const APP_ID = "com.rl.autoscaling";
let mainWindow = null;

if (process.platform === 'darwin') {
  app.setName('Reinforcement Learning');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Reinforcement Learning",
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#050812",
    icon: path.join(__dirname, '../client/public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: false,
      rightClickMenu: false,

    },
  });

  // Handle navigation requests from renderer
  const { ipcMain } = require('electron');
  ipcMain.on('navigate', (event, url) => {
    mainWindow.loadURL(url);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const simulatorEntry = app.isPackaged
    ? `file://${path.join(__dirname, "..", "dist", "public", "index.html")}`
    : devServerURL;

  const presentationPath = path.join(__dirname, "..", "view.html");

  if (!app.isPackaged) {
    mainWindow.loadURL(`file://${presentationPath}?sim=${encodeURIComponent(simulatorEntry)}`);
  } else {
    mainWindow.loadFile(presentationPath, { query: { sim: simulatorEntry } });
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId(APP_ID);
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../client/public/icon.png'));
  }

  // Create custom menu to override "Electron" name
  const { Menu } = require('electron');
  const template = [
    {
      label: 'Reinforcement Learning',
      submenu: [
        { role: 'about', label: 'About Reinforcement Learning' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
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
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
