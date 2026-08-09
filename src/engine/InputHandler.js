// src/engine/InputHandler.js
// Routes mouse, keyboard, and wheel events from the canvas to the game.

import { eventBus } from './EventBus.js';

export class InputHandler {
  /**
   * @param {import('./Canvas.js').Canvas} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this._tool  = 'select'; // 'select' | 'link' | 'delete'
    this._drag  = null;     // active drag state
    this._lastMouse = { x: 0, y: 0 };

    this._bindEvents();
  }

  // ──────────────────────────────────────────────────────────
  //  Tool
  // ──────────────────────────────────────────────────────────
  setTool(tool) {
    this._tool = tool;
    this.canvas.el.style.cursor =
      tool === 'link'   ? 'crosshair' :
      tool === 'delete' ? 'not-allowed' : 'default';
    this.canvas.setLinkPreview(null, null);
  }

  // ──────────────────────────────────────────────────────────
  //  Event binding
  // ──────────────────────────────────────────────────────────
  _bindEvents() {
    const el = this.canvas.el;

    el.addEventListener('mousedown',  e => this._onMouseDown(e));
    el.addEventListener('mousemove',  e => this._onMouseMove(e));
    el.addEventListener('mouseup',    e => this._onMouseUp(e));
    el.addEventListener('wheel',      e => this._onWheel(e), { passive: false });
    el.addEventListener('contextmenu',e => e.preventDefault());
    el.addEventListener('dblclick',   e => this._onDblClick(e));
    el.addEventListener('mouseleave', () => {
      this._drag = null;
      this.canvas.setLinkPreview(null, null);
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', e => this._onKey(e));

    // Canvas drop from palette
    el.addEventListener('dragover',  e => e.preventDefault());
    el.addEventListener('drop',      e => this._onDrop(e));
  }

  // ──────────────────────────────────────────────────────────
  //  Mouse events
  // ──────────────────────────────────────────────────────────
  _getWorld(e) {
    const rect = this.canvas.el.getBoundingClientRect();
    return this.canvas.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  }
  _getScreen(e) {
    const rect = this.canvas.el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  _onMouseDown(e) {
    if (e.button !== 0 && e.button !== 1) return;
    const world  = this._getWorld(e);
    const screen = this._getScreen(e);
    this._lastMouse = screen;

    // Middle-mouse always pans
    if (e.button === 1) {
      this._drag = { type: 'pan', startScreen: screen };
      e.preventDefault();
      return;
    }

    if (this._tool === 'select') {
      const device = this.canvas.deviceAt(world.x, world.y);
      if (device) {
        eventBus.emit('device:select', device);
        this._drag = { type: 'move-device', device, startWorld: world,
                       origX: device.x, origY: device.y };
        this.canvas.setSelectedDevice(device.id);
        this.canvas.setSelectedLink(null);
      } else {
        const link = this.canvas.linkAt(world.x, world.y);
        if (link) {
          eventBus.emit('link:select', link);
          this.canvas.setSelectedDevice(null);
          this.canvas.setSelectedLink(link.id);
        } else {
          eventBus.emit('canvas:click', { world, screen });
          this.canvas.setSelectedDevice(null);
          this.canvas.setSelectedLink(null);
          eventBus.emit('device:deselect');
          this._drag = { type: 'pan', startScreen: screen };
        }
      }
    }

    if (this._tool === 'link') {
      const device = this.canvas.deviceAt(world.x, world.y);
      if (device) {
        if (this._linkSrc) {
          // Second click → create link
          if (this._linkSrc.id !== device.id) {
            eventBus.emit('link:create', { src: this._linkSrc, dst: device });
          }
          this._linkSrc = null;
          this.canvas.setLinkPreview(null, null);
        } else {
          this._linkSrc = device;
          this.canvas.setLinkPreview(device, world);
        }
      } else {
        this._linkSrc = null;
        this.canvas.setLinkPreview(null, null);
      }
    }

    if (this._tool === 'delete') {
      const device = this.canvas.deviceAt(world.x, world.y);
      if (device) {
        eventBus.emit('device:delete', device);
      } else {
        const link = this.canvas.linkAt(world.x, world.y);
        if (link) eventBus.emit('link:delete', link);
      }
    }
  }

  _onMouseMove(e) {
    const world  = this._getWorld(e);
    const screen = this._getScreen(e);
    const dx = screen.x - this._lastMouse.x;
    const dy = screen.y - this._lastMouse.y;
    this._lastMouse = screen;

    if (this._drag) {
      if (this._drag.type === 'pan') {
        this.canvas.pan(dx, dy);
      } else if (this._drag.type === 'move-device') {
        this._drag.device.x = this._drag.origX + (world.x - this._drag.startWorld.x);
        this._drag.device.y = this._drag.origY + (world.y - this._drag.startWorld.y);
        eventBus.emit('device:moved', this._drag.device);
        this.canvas.markDirty();
      }
    }

    if (this._tool === 'link' && this._linkSrc) {
      this.canvas.setLinkPreview(this._linkSrc, world);
    }

    eventBus.emit('canvas:mousemove', { world, screen });
  }

  _onMouseUp(e) {
    this._drag = null;
  }

  _onWheel(e) {
    e.preventDefault();
    const screen = this._getScreen(e);
    const factor = e.deltaY < 0 ? 1.1 : (1 / 1.1);
    this.canvas.zoom(factor, screen.x, screen.y);
  }

  _onDblClick(e) {
    const world  = this._getWorld(e);
    const device = this.canvas.deviceAt(world.x, world.y);
    if (device) eventBus.emit('device:dblclick', device);
  }

  // ──────────────────────────────────────────────────────────
  //  Drag-and-drop from palette
  // ──────────────────────────────────────────────────────────
  _onDrop(e) {
    e.preventDefault();
    const type   = e.dataTransfer.getData('device-type');
    if (!type) return;
    const rect   = this.canvas.el.getBoundingClientRect();
    const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const world  = this.canvas.screenToWorld(screen.x, screen.y);
    eventBus.emit('device:drop', { type, world });
  }

  // ──────────────────────────────────────────────────────────
  //  Keyboard shortcuts
  // ──────────────────────────────────────────────────────────
  _onKey(e) {
    // Don't intercept when typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 's': case 'S': eventBus.emit('tool:change', 'select'); break;
      case 'l': case 'L': eventBus.emit('tool:change', 'link');   break;
      case 'Delete': case 'Backspace': {
        // Delete selected device or link
        eventBus.emit('selection:delete');
        break;
      }
      case '+': case '=': this.canvas.zoom(1.1); break;
      case '-': case '_': this.canvas.zoom(1 / 1.1); break;
      case 'f': case 'F': eventBus.emit('canvas:fitAll'); break;
      case 'Escape': {
        this._linkSrc = null;
        this.canvas.setLinkPreview(null, null);
        eventBus.emit('device:deselect');
        break;
      }
    }
  }
}
