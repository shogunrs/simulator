const { app, BrowserWindow } = require("electron");
const path = require("node:path");
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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

  ipcMain.handle('rag:query', async (event, userQuery) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return "Error: GEMINI_API_KEY not found in .env file.";
      }

      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const { glob } = require("glob");
      const fs = require("fs");

      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel =
        process.env.GEMINI_MODEL || "gemma-3-12b";
      const buildModel = (modelName) =>
        genAI.getGenerativeModel({
          model: modelName,
          requestOptions: { apiVersion: "v1" }, // v1beta can 404 with newer model names on some keys
        });

      // Read specific context file
      const contextPath = path.join(__dirname, "..", "Final_Report_Complete_English.md");
      let context = "";
      try {
        context = fs.readFileSync(contextPath, "utf-8");
      } catch (err) {
        console.error("Error reading context file:", err);
        return "Error: Could not read context file Final_Report_Complete_English.md";
      }

      const prompt = `You are a helpful assistant for this project. 
      Use the following context from the project's markdown files to answer the user's question.
      If the answer is not in the context, say so, but try to be helpful based on general knowledge if applicable, 
      but emphasize that it's not in the docs.
      
      Context:
      ${context}
      
      User Question: ${userQuery}`;

      const candidateModels = [geminiModel];
      if (!candidateModels.includes("gemini-2.5-flash")) {
        candidateModels.push("gemini-2.5-flash");
      }

      let lastError = null;
      for (const modelName of candidateModels) {
        try {
          const model = buildModel(modelName);
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        } catch (err) {
          lastError = err;
          const isModelNotFound =
            err?.message && /not found|unsupported|404/i.test(err.message);
          if (isModelNotFound) {
            continue;
          }
          throw err;
        }
      }

      throw lastError || new Error("Gemini generation failed");
    } catch (error) {
      console.error("RAG Error:", error);
      return "Error processing request: " + error.message;
    }
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
