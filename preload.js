// preload.js — Electron preload script
// Exposes a safe, typed API bridge between the Node main process and the renderer.
// Only whitelisted IPC channels are exposed — contextBridge enforces the boundary.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Window controls ──────────────────────────────────────────
  minimize:    ()      => ipcRenderer.invoke('window:minimize'),
  maximize:    ()      => ipcRenderer.invoke('window:maximize'),
  close:       ()      => ipcRenderer.invoke('window:close'),
  isMaximized: ()      => ipcRenderer.invoke('window:isMaximized'),

  // ── Save / Load ──────────────────────────────────────────────
  save:        (slot, data) => ipcRenderer.invoke('save:write',  { slot, data }),
  load:        (slot)       => ipcRenderer.invoke('save:read',   slot),
  listSaves:   ()           => ipcRenderer.invoke('save:list'),
  deleteSave:  (slot)       => ipcRenderer.invoke('save:delete', slot),

  // ── Topology import / export ─────────────────────────────────
  exportTopology: (data) => ipcRenderer.invoke('export:topology', data),
  importTopology: ()     => ipcRenderer.invoke('import:topology'),
});
