// src/ui/DeviceRenderer.js
// Draws device icons on the Canvas using the 2D context.
// All icons are drawn programmatically — no image files needed.

export class DeviceRenderer {
  /**
   * Draw a device at its (x, y) world position.
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../network/Device.js').Device} device
   * @param {boolean} selected
   */
  draw(ctx, device, selected = false) {
    ctx.save();
    ctx.translate(device.x, device.y);
    this._drawType(ctx, device.type, selected);

    // Draw hardware model badge under device icon
    if (device.model) {
      ctx.fillStyle = selected ? '#00e8ff' : '#88aacc';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(device.model, 0, 32);
    }
    ctx.restore();
  }

  _drawType(ctx, type, selected) {
    switch (type) {
      case 'router':         this._drawRouter(ctx, selected); break;
      case 'switch':         this._drawSwitch(ctx, selected); break;
      case 'l3switch':       this._drawL3Switch(ctx, selected); break;
      case 'pc':             this._drawPC(ctx, selected); break;
      case 'server':         this._drawServer(ctx, selected); break;
      case 'ap':              this._drawAP(ctx, selected); break;
      case 'hub':             this._drawHub(ctx, selected); break;
      case 'repeater':        this._drawRepeater(ctx, selected); break;
      case 'coaxialsplitter':
      case 'splitter':        this._drawCoAxialSplitter(ctx, selected); break;
      case 'bridge':          this._drawBridge(ctx, selected); break;
      case 'firewall':       this._drawFirewall(ctx, selected); break;
      case 'wirelessrouter': this._drawWirelessRouter(ctx, selected); break;
      case 'wlc':            this._drawWLC(ctx, selected); break;
      case 'modem':          this._drawModem(ctx, selected); break;
      case 'celltower':      this._drawCellTower(ctx, selected); break;
      case 'cloud':          this._drawCloud(ctx, selected); break;
      default:               this._drawGeneric(ctx, selected); break;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────
  _glow(ctx, color, blur = 10) {
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
  }
  _noGlow(ctx) {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  // ── Router: cylinder shape ───────────────────────────────────
  _drawRouter(ctx, sel) {
    const color = sel ? '#00e8ff' : '#00c8ee';
    const bg    = sel ? 'rgba(0,212,255,0.18)' : 'rgba(0,180,220,0.1)';
    const r = 24;

    this._glow(ctx, color, sel ? 18 : 8);

    // Body circle
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner symbol: 4 lines radiating (router spokes)
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    const angles = [0, 90, 180, 270];
    angles.forEach(a => {
      const rad = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rad) * 13, Math.sin(rad) * 13);
      ctx.stroke();
    });
    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Switch: rectangle with port lines ───────────────────────
  _drawSwitch(ctx, sel) {
    const color = sel ? '#60aaff' : '#4488dd';
    const bg    = sel ? 'rgba(68,136,220,0.18)' : 'rgba(40,80,160,0.12)';
    const w = 38, h = 22;

    this._glow(ctx, color, sel ? 14 : 6);

    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 4);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Port lines
    const ports = 6;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < ports; i++) {
      const x = -14 + i * 6;
      ctx.beginPath();
      ctx.moveTo(x, -5);
      ctx.lineTo(x, -1);
      ctx.lineTo(x + 3, 1);
      ctx.lineTo(x + 3, 5);
      ctx.stroke();
    }

    this._noGlow(ctx);
  }

  // ── L3 Switch: switch + routing lines ───────────────────────
  _drawL3Switch(ctx, sel) {
    const color = sel ? '#88aaff' : '#6688dd';
    const bg    = sel ? 'rgba(100,136,220,0.18)' : 'rgba(60,80,160,0.12)';
    const w = 38, h = 22;

    this._glow(ctx, color, sel ? 14 : 6);

    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 4);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // L3 label inside
    ctx.fillStyle = color;
    ctx.font      = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('L3', 0, 0);

    this._noGlow(ctx);
  }

  // ── PC: monitor shape ────────────────────────────────────────
  _drawPC(ctx, sel) {
    const color = sel ? '#88ddff' : '#66aabb';
    const bg    = sel ? 'rgba(100,180,220,0.18)' : 'rgba(60,120,160,0.1)';

    this._glow(ctx, color, sel ? 14 : 5);

    // Monitor
    ctx.beginPath();
    ctx.roundRect(-18, -18, 36, 26, 3);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Screen
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 18, 2);
    ctx.fillStyle = sel ? 'rgba(0,212,255,0.12)' : 'rgba(0,100,150,0.15)';
    ctx.fill();

    // Stand
    ctx.beginPath();
    ctx.moveTo(-8, 8); ctx.lineTo(8, 8);
    ctx.lineTo(5, 14); ctx.lineTo(-5, 14);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Base
    ctx.beginPath();
    ctx.moveTo(-10, 14); ctx.lineTo(10, 14);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── Server: rack server ──────────────────────────────────────
  _drawServer(ctx, sel) {
    const color = sel ? '#88ffbb' : '#44bb88';
    const bg    = sel ? 'rgba(100,220,160,0.18)' : 'rgba(40,160,100,0.1)';
    const w = 30, h = 32;

    this._glow(ctx, color, sel ? 14 : 6);

    // Chassis
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Drive bays (3 lines)
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    for (let i = 0; i < 3; i++) {
      const y = -8 + i * 8;
      ctx.beginPath();
      ctx.roundRect(-10, y, 8, 5, 1);
      ctx.stroke();
      // LED
      ctx.beginPath();
      ctx.arc(4, y + 2.5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#00ff88' : '#004433';
      ctx.fill();
    }

    this._noGlow(ctx);
  }

  // ── Access Point: antennae ───────────────────────────────────
  _drawAP(ctx, sel) {
    const color = sel ? '#dd88ff' : '#aa55dd';
    const bg    = sel ? 'rgba(180,100,220,0.18)' : 'rgba(120,50,180,0.1)';

    this._glow(ctx, color, sel ? 14 : 6);

    // Body circle
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Wifi arcs
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    [6, 12, 18].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r, (Math.PI * 4) / 6, (Math.PI * 2) / 6, true);
      ctx.stroke();
    });

    this._noGlow(ctx);
  }

  // ── Cloud / Internet ─────────────────────────────────────────
  _drawCloud(ctx, sel) {
    const color = sel ? '#aabbcc' : '#7799aa';
    const bg    = sel ? 'rgba(150,180,200,0.18)' : 'rgba(80,110,140,0.1)';

    this._glow(ctx, color, sel ? 10 : 4);

    // Cloud shape (series of circles)
    ctx.fillStyle   = bg;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;

    const circles = [
      [0, 4, 14], [-10, 8, 10], [10, 8, 10], [-6, -2, 10], [6, -2, 10],
    ];
    ctx.beginPath();
    circles.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); });
    ctx.fill();

    // Re-draw outline as a composed path
    ctx.beginPath();
    circles.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); });
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── Hub: Yellow rectangle with repeating hub lines ──────────
  _drawHub(ctx, sel) {
    const color = sel ? '#00e8ff' : '#00aacc';
    const bg    = sel ? 'rgba(0,212,255,0.2)' : 'rgba(0,140,170,0.14)';
    const w = 36, h = 24;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Port lines on top
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    for (let i = 0; i < 4; i++) {
      const x = -10 + i * 6.5;
      ctx.beginPath();
      ctx.moveTo(x, -8);
      ctx.lineTo(x, 4);
      ctx.stroke();
    }

    ctx.fillStyle = color;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('HUB', 0, 7);
    this._noGlow(ctx);
  }

  // ── Repeater: Signal regeneration box ───────────────────────
  _drawRepeater(ctx, sel) {
    const color = sel ? '#00e8ff' : '#00b4d8';
    const bg    = sel ? 'rgba(0,232,255,0.2)' : 'rgba(0,160,200,0.14)';
    const w = 36, h = 20;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Horizontal signal repeat arrows (Packet Tracer Repeater style)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-11, 0); ctx.lineTo(11, 0);
    ctx.moveTo(-6, -4); ctx.lineTo(-11, 0); ctx.lineTo(-6, 4);
    ctx.moveTo(6, -4);  ctx.lineTo(11, 0);  ctx.lineTo(6, 4);
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── CoAxial Splitter: Passive RF Splitter box ───────────────
  _drawCoAxialSplitter(ctx, sel) {
    const color = sel ? '#38bdf8' : '#0284c7';
    const bg    = sel ? 'rgba(56,189,248,0.2)' : 'rgba(2,132,199,0.14)';
    const w = 38, h = 18;

    this._glow(ctx, color, sel ? 14 : 6);

    // Chassis base
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2 + 2, w, h, 2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // 3 BNC Coaxial connector studs on top (matching Cisco Packet Tracer)
    ctx.fillStyle = color;
    [-12, 0, 12].forEach(x => {
      ctx.beginPath();
      ctx.rect(x - 2.5, -h/2 - 2, 5, 4);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    });

    // Internal Y-splitter signal lines
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -h/2 + 3);
    ctx.lineTo(0, -1);
    ctx.lineTo(-10, 4);
    ctx.moveTo(0, -1);
    ctx.lineTo(10, 4);
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── Bridge: Two connected blocks ─────────────────────────────
  _drawBridge(ctx, sel) {
    const color = sel ? '#ffaa44' : '#dd7722';
    const bg    = sel ? 'rgba(255,170,68,0.18)' : 'rgba(180,100,30,0.12)';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-16, -10, 14, 20, 2);
    ctx.roundRect(2, -10, 14, 20, 2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    this._noGlow(ctx);
  }

  // ── Firewall: Red Shield / Brick wall ────────────────────────
  _drawFirewall(ctx, sel) {
    const color = sel ? '#ff4444' : '#dd2222';
    const bg    = sel ? 'rgba(255,68,68,0.18)' : 'rgba(180,30,30,0.12)';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(16, -10);
    ctx.lineTo(12, 12);
    ctx.lineTo(0, 18);
    ctx.lineTo(-12, 12);
    ctx.lineTo(-16, -10);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ASA', 0, 0);
    this._noGlow(ctx);
  }

  // ── Wireless Router: Box with Wifi waves ────────────────────
  _drawWirelessRouter(ctx, sel) {
    const color = sel ? '#bb66ff' : '#8833cc';
    const bg    = sel ? 'rgba(187,102,255,0.18)' : 'rgba(136,51,204,0.12)';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-18, -8, 36, 18, 4);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Antenna
    ctx.beginPath();
    ctx.moveTo(-10, -8); ctx.lineTo(-10, -16);
    ctx.moveTo(10, -8);  ctx.lineTo(10, -16);
    ctx.stroke();
    this._noGlow(ctx);
  }

  // ── WLC: Controller box ──────────────────────────────────────
  _drawWLC(ctx, sel) {
    const color = sel ? '#44eeff' : '#00bbee';
    const bg    = sel ? 'rgba(68,238,255,0.18)' : 'rgba(0,187,238,0.12)';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-18, -14, 36, 28, 4);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('WLC', 0, 0);
    this._noGlow(ctx);
  }

  // ── Modem: Compact box ───────────────────────────────────────
  _drawModem(ctx, sel) {
    const color = sel ? '#00ffaa' : '#00aa77';
    const bg    = sel ? 'rgba(0,255,170,0.18)' : 'rgba(0,170,119,0.12)';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-16, -12, 32, 24, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    this._noGlow(ctx);
  }

  // ── Cell Tower: Tower structure ──────────────────────────────
  _drawCellTower(ctx, sel) {
    const color = sel ? '#ff9900' : '#cc7700';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(-12, 18);
    ctx.moveTo(0, -18); ctx.lineTo(12, 18);
    ctx.moveTo(-6, 0);  ctx.lineTo(6, 0);
    ctx.stroke();
    this._noGlow(ctx);
  }

  // ── Generic fallback ─────────────────────────────────────────
  _drawGeneric(ctx, sel) {
    const color = sel ? '#cccccc' : '#888888';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle   = 'rgba(100,100,100,0.2)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // ──────────────────────────────────────────────────────────
  //  Palette preview drawing (small icons in the sidebar)
  // ──────────────────────────────────────────────────────────
  drawPreview(canvas, type) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(0.8, 0.8);
    this._drawType(ctx, type, false);
    ctx.restore();
  }
}
