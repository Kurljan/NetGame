// electron-main.js — Electron main process
// Creates the BrowserWindow, handles IPC, and manages app lifecycle

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

let mainWindow;

// ─────────────────────────────────────────
//  Window creation
// ─────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,          // custom titlebar in the renderer
    transparent: false,
    backgroundColor: '#0a0e1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    show: false,           // show after 'ready-to-show'
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ─────────────────────────────────────────
//  App lifecycle
// ─────────────────────────────────────────
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─────────────────────────────────────────
//  IPC — Window controls
// ─────────────────────────────────────────
ipcMain.handle('window:minimize',  () => mainWindow.minimize());
ipcMain.handle('window:maximize',  () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window:close',     () => mainWindow.close());
ipcMain.handle('window:isMaximized', () => mainWindow.isMaximized());

// ─────────────────────────────────────────
//  IPC — Save / Load game data
// ─────────────────────────────────────────
const getSavePath = (slot) =>
  path.join(app.getPath('userData'), 'saves', `slot_${slot}.json`);

ipcMain.handle('save:write', async (_event, { slot, data }) => {
  try {
    const p = getSavePath(slot);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('save:read', async (_event, slot) => {
  try {
    const p = getSavePath(slot);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
});

ipcMain.handle('save:list', async () => {
  try {
    const dir = path.join(app.getPath('userData'), 'saves');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/^slot_/, '').replace('.json', ''));
  } catch {
    return [];
  }
});

ipcMain.handle('save:delete', async (_event, slot) => {
  try {
    const p = getSavePath(slot);
    if (fs.existsSync(p)) fs.unlinkSync(p);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ─────────────────────────────────────────
//  IPC — Export topology as JSON
// ─────────────────────────────────────────
ipcMain.handle('export:topology', async (_event, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Topology',
    defaultPath: 'topology.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (!filePath) return { success: false, cancelled: true };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return { success: true, filePath };
});

ipcMain.handle('import:topology', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Topology',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (!filePaths.length) return null;
  return JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'));
});
