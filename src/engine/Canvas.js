// src/engine/Canvas.js
// Manages the HTML5 Canvas used for topology rendering.
// Handles pan, zoom, coordinate transforms, and drawing all network elements.

import { eventBus } from './EventBus.js';
import { DeviceRenderer } from '../ui/DeviceRenderer.js';

export class Canvas {
  /**
   * @param {HTMLCanvasElement} canvasEl
   */
  constructor(canvasEl) {
    this.el  = canvasEl;
    this.ctx = canvasEl.getContext('2d');

    // Viewport transform
    this.offsetX  = 0;
    this.offsetY  = 0;
    this.scale    = 1;
    this.minScale = 0.25;
    this.maxScale = 3;

    // Animation
    this._rafId   = null;
    this._dirty   = true;

    // Renderer for device icons
    this.deviceRenderer = new DeviceRenderer();

    // Packet animation state
    this._packets = [];       // [{packet, progress, path}]

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // ──────────────────────────────────────────────────────────
  //  Resize
  // ──────────────────────────────────────────────────────────
  _resize() {
    const wrapper = this.el.parentElement;
    this.el.width  = wrapper.clientWidth;
    this.el.height = wrapper.clientHeight;
    this.markDirty();
  }

  get width()  { return this.el.width; }
  get height() { return this.el.height; }

  // ──────────────────────────────────────────────────────────
  //  Coordinate transform helpers
  // ──────────────────────────────────────────────────────────
  /** Screen (pixel) → World coordinates */
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale,
    };
  }

  /** World → Screen coordinates */
  worldToScreen(wx, wy) {
    return {
      x: wx * this.scale + this.offsetX,
      y: wy * this.scale + this.offsetY,
    };
  }

  // ──────────────────────────────────────────────────────────
  //  Pan & Zoom
  // ──────────────────────────────────────────────────────────
  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
    this.markDirty();
  }

  /**
   * Zoom around a screen-space focal point.
   * @param {number} factor  Multiplier (>1 = zoom in, <1 = zoom out)
   * @param {number} cx      Focal X in screen pixels
   * @param {number} cy      Focal Y in screen pixels
   */
  zoom(factor, cx = this.width / 2, cy = this.height / 2) {
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    if (newScale === this.scale) return;

    // Adjust offset so the focal point stays fixed
    this.offsetX = cx - (cx - this.offsetX) * (newScale / this.scale);
    this.offsetY = cy - (cy - this.offsetY) * (newScale / this.scale);
    this.scale   = newScale;
    this.markDirty();

    eventBus.emit('canvas:zoom', { scale: this.scale });
  }

  /** Fit all devices into view. */
  fitToDevices(devices) {
    if (!devices || devices.length === 0) {
      this.offsetX = this.width / 2;
      this.offsetY = this.height / 2;
      this.scale   = 1;
      this.markDirty();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const d of devices) {
      minX = Math.min(minX, d.x - 60);
      minY = Math.min(minY, d.y - 60);
      maxX = Math.max(maxX, d.x + 60);
      maxY = Math.max(maxY, d.y + 60);
    }

    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const padding = 80;

    const scaleX = (this.width  - padding * 2) / worldW;
    const scaleY = (this.height - padding * 2) / worldH;
    this.scale   = Math.min(this.maxScale, Math.max(this.minScale, Math.min(scaleX, scaleY)));

    this.offsetX = this.width  / 2 - ((minX + maxX) / 2) * this.scale;
    this.offsetY = this.height / 2 - ((minY + maxY) / 2) * this.scale;
    this.markDirty();
  }

  // ──────────────────────────────────────────────────────────
  //  Draw loop
  // ──────────────────────────────────────────────────────────
  markDirty() { this._dirty = true; }

  startLoop() {
    const loop = () => {
      this._rafId = requestAnimationFrame(loop);
      if (this._packets.length > 0) {
        this._advancePackets();
        this._dirty = true;
      }
      if (this._dirty) {
        this._dirty = false;
        this._draw();
      }
    };
    loop();
  }

  stopLoop() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  // ──────────────────────────────────────────────────────────
  //  Main draw call — called every frame when dirty
  // ──────────────────────────────────────────────────────────
  _draw() {
    const { ctx, width, height, scale, offsetX, offsetY } = this;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, width, height);

    // Grid
    this._drawGrid();

    // World space
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw links first (behind devices)
    if (this._links) this._drawLinks();

    // Draw devices
    if (this._devices) this._drawDevices();

    // Draw animated packets
    this._drawPackets();

    // Draw link-in-progress
    if (this._linkPreview) this._drawLinkPreview();

    ctx.restore();
  }

  // ──────────────────────────────────────────────────────────
  //  Grid
  // ──────────────────────────────────────────────────────────
  _drawGrid() {
    const { ctx, width, height, scale, offsetX, offsetY } = this;
    const spacing = 40 * scale;
    const dotR    = 1.2;

    const startX = ((offsetX % spacing) + spacing) % spacing;
    const startY = ((offsetY % spacing) + spacing) % spacing;

    ctx.fillStyle = 'rgba(0, 212, 255, 0.07)';
    for (let x = startX; x < width; x += spacing) {
      for (let y = startY; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Data binding (called by TopologyBuilder)
  // ──────────────────────────────────────────────────────────
  setData(devices, links) {
    this._devices = devices;
    this._links   = links;
    this.markDirty();
  }

  // ──────────────────────────────────────────────────────────
  //  Draw Links
  // ──────────────────────────────────────────────────────────
  _drawLinks() {
    const { ctx } = this;
    for (const link of this._links.values()) {
      const src = this._devices.get(link.sourceDeviceId);
      const dst = this._devices.get(link.destDeviceId);
      if (!src || !dst) continue;

      const selected = link.id === this._selectedLinkId;
      const mdixErr  = link.status === 'mdix-error';
      const down     = link.status === 'down' || mdixErr;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(dst.x, dst.y);

      // Cable style by cableType
      const cable = link.cableType || 'straight';
      if (selected) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth   = 3;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur  = 10;
        ctx.setLineDash([]);
      } else if (mdixErr) {
        ctx.strokeStyle = '#ff9900'; // Amber for Auto-MDIX mismatch
        ctx.lineWidth   = 2;
        ctx.setLineDash([4, 4]);
      } else if (down) {
        ctx.strokeStyle = 'rgba(255,68,102,0.6)';
        ctx.lineWidth   = 2;
        ctx.setLineDash([]);
      } else {
        switch (cable) {
          case 'crossover':
            ctx.strokeStyle = '#00ff88';
            ctx.setLineDash([6, 4]);
            ctx.lineWidth   = 2;
            break;
          case 'fiber':
            ctx.strokeStyle = '#ff9900';
            ctx.setLineDash([]);
            ctx.lineWidth   = 2.5;
            break;
          case 'serial-dce':
          case 'serial-dte':
            ctx.strokeStyle = '#ff3344';
            ctx.setLineDash([8, 4]);
            ctx.lineWidth   = 2;
            break;
          case 'console':
            ctx.strokeStyle = '#33aaff';
            ctx.setLineDash([]);
            ctx.lineWidth   = 2;
            break;
          case 'wireless':
            ctx.strokeStyle = '#bb66ff';
            ctx.setLineDash([3, 6]);
            ctx.lineWidth   = 1.5;
            break;
          default:
            ctx.strokeStyle = 'rgba(100,160,220,0.7)';
            ctx.setLineDash([]);
            ctx.lineWidth   = 2;
            break;
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);

      // Draw dual port LED dots on both ends of the link
      const angle = Math.atan2(dst.y - src.y, dst.x - src.x);
      const r = 26; // offset from center of device

      // Source LED dot
      const srcIface = src.interfaces?.find(i => i.name === link.sourceInterface || i.shortName === link.sourceInterface);
      const srcLedColor = mdixErr ? '#ff9900' : (srcIface?.status === 'up' ? '#00ff88' : '#ff3344');
      ctx.beginPath();
      ctx.arc(src.x + Math.cos(angle) * r, src.y + Math.sin(angle) * r, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = srcLedColor;
      ctx.fill();

      // Dest LED dot
      const dstIface = dst.interfaces?.find(i => i.name === link.destInterface || i.shortName === link.destInterface);
      const dstLedColor = mdixErr ? '#ff9900' : (dstIface?.status === 'up' ? '#00ff88' : '#ff3344');
      ctx.beginPath();
      ctx.arc(dst.x - Math.cos(angle) * r, dst.y - Math.sin(angle) * r, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = dstLedColor;
      ctx.fill();

      // Link label (bandwidth / type)
      if (this.scale > 0.6) {
        const mx = (src.x + dst.x) / 2;
        const my = (src.y + dst.y) / 2;
        ctx.fillStyle = 'rgba(100,160,220,0.8)';
        ctx.font      = `${10 / this.scale}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const txt = link.label || (cable !== 'straight' ? cable : '');
        if (txt) ctx.fillText(txt, mx, my - 8 / this.scale);
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Draw Devices
  // ──────────────────────────────────────────────────────────
  _drawDevices() {
    const { ctx, _selectedDeviceId } = this;
    for (const device of this._devices.values()) {
      const selected = device.id === _selectedDeviceId;

      // Selection ring
      if (selected) {
        ctx.beginPath();
        ctx.arc(device.x, device.y, 38, 0, Math.PI * 2);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth   = 2;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur  = 16;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      // Device icon
      this.deviceRenderer.draw(ctx, device, selected);

      // Hostname label
      if (this.scale > 0.3) {
        ctx.fillStyle = selected ? '#00d4ff' : '#a0bcd0';
        ctx.font      = `bold ${12 / this.scale}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(device.hostname, device.x, device.y + 34);

        // Show IP of first active interface
        if (this.scale > 0.5) {
          const iface = device.interfaces?.find(i => i.ipAddress && i.status === 'up');
          if (iface) {
            ctx.fillStyle = selected ? 'rgba(0,212,255,0.7)' : 'rgba(100,160,200,0.5)';
            ctx.font      = `${10 / this.scale}px "JetBrains Mono", monospace`;
            ctx.fillText(iface.ipAddress, device.x, device.y + 34 + 14 / this.scale);
          }
        }
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Packet animation
  // ──────────────────────────────────────────────────────────
  addPacketAnimation(packet, path, devices, onComplete) {
    if (path.length < 2) return;
    this._packets.push({
      packet,
      path,
      devices,
      hopIndex: 0,
      progress: 0,
      speed: 0.025,
      onComplete,
      trail: [],
    });
  }

  _advancePackets() {
    this._packets = this._packets.filter(anim => {
      anim.progress += anim.speed;

      if (anim.progress >= 1) {
        anim.progress = 0;
        anim.hopIndex++;

        // Notify current hop
        eventBus.emit('packet:hop', {
          packet: anim.packet,
          hopIndex: anim.hopIndex,
          deviceId: anim.path[anim.hopIndex]?.deviceId,
        });

        if (anim.hopIndex >= anim.path.length - 1) {
          if (anim.onComplete) anim.onComplete(anim.packet);
          return false; // remove
        }
      }
      return true;
    });
  }

  _drawPackets() {
    const { ctx } = this;
    for (const anim of this._packets) {
      const hop  = anim.path[anim.hopIndex];
      const next = anim.path[anim.hopIndex + 1];
      if (!hop || !next) continue;

      const src = anim.devices.get(hop.deviceId);
      const dst = anim.devices.get(next.deviceId);
      if (!src || !dst) continue;

      const px = src.x + (dst.x - src.x) * anim.progress;
      const py = src.y + (dst.y - src.y) * anim.progress;

      // Glow effect
      const proto  = anim.packet.protocol?.toLowerCase() || 'icmp';
      const color  = proto === 'icmp' ? '#00d4ff' : proto === 'tcp' ? '#00ff88' : '#ffaa00';

      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = 16;
      ctx.fillStyle   = color;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright dot
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Link preview (while drawing a new link)
  // ──────────────────────────────────────────────────────────
  setLinkPreview(srcDevice, mouseWorld) {
    this._linkPreview = srcDevice ? { src: srcDevice, mouse: mouseWorld } : null;
    this.markDirty();
  }

  _drawLinkPreview() {
    if (!this._linkPreview) return;
    const { ctx } = this;
    const { src, mouse } = this._linkPreview;
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = 'rgba(0,212,255,0.5)';
    ctx.lineWidth   = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ──────────────────────────────────────────────────────────
  //  Hit testing
  // ──────────────────────────────────────────────────────────
  /**
   * Find the device at a given world position.
   * @param {number} wx
   * @param {number} wy
   * @returns {Object|null}
   */
  deviceAt(wx, wy) {
    if (!this._devices) return null;
    for (const device of this._devices.values()) {
      const dx = wx - device.x;
      const dy = wy - device.y;
      if (dx * dx + dy * dy < 32 * 32) return device;
    }
    return null;
  }

  /**
   * Find a link near a given world position.
   */
  linkAt(wx, wy, threshold = 8) {
    if (!this._links || !this._devices) return null;
    for (const link of this._links.values()) {
      const src = this._devices.get(link.sourceDeviceId);
      const dst = this._devices.get(link.destDeviceId);
      if (!src || !dst) continue;
      const dist = this._pointToSegmentDist(wx, wy, src.x, src.y, dst.x, dst.y);
      if (dist < threshold) return link;
    }
    return null;
  }

  _pointToSegmentDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  // ──────────────────────────────────────────────────────────
  //  Selection state (used by renderer)
  // ──────────────────────────────────────────────────────────
  setSelectedDevice(id) {
    this._selectedDeviceId = id;
    this.markDirty();
  }

  setSelectedLink(id) {
    this._selectedLinkId = id;
    this.markDirty();
  }
}
