// src/ui/DeviceRenderer.js
// Draws device icons on the Canvas using the 2D context.
// All icons are drawn programmatically matching Cisco Packet Tracer aesthetics.

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
    this._drawType(ctx, device.type, selected, device.model);
    ctx.restore();
  }

  _drawType(ctx, type, selected, model = '') {
    const m = (model || '').toUpperCase();
    const t = (type || '').toLowerCase();

    // Check specific model overrides
    if (m.includes('CENTRAL') || m.includes('CO-SERVER') || t === 'coserver') {
      this._drawCentralOfficeServer(ctx, selected);
      return;
    }
    if (m.includes('CELL-TOWER') || m.includes('CELLTOWER') || t === 'celltower') {
      this._drawCellTower(ctx, selected);
      return;
    }
    if (m.includes('MERAKI') || m.includes('MX65') || t === 'securityappliance') {
      this._drawMerakiMX(ctx, selected);
      return;
    }
    if (m.includes('DLC') || m.includes('GATEWAY') || t === 'homegateway') {
      this._drawHomeGateway(ctx, selected);
      return;
    }
    if (m.includes('HOMEROUTER') || m.includes('WRT300N') || (t === 'wirelessrouter' && !m.includes('WLC'))) {
      this._drawWirelessRouter(ctx, selected, model);
      return;
    }
    if (m.includes('WLC') || t === 'wlc') {
      this._drawWLC(ctx, selected, model);
      return;
    }
    if (m.includes('LAP') || m.includes('3702') || m.includes('1130') || t === 'lap') {
      this._drawLAP(ctx, selected, model);
      return;
    }
    if (m.includes('ACCESSPOINT') || m.includes('AP-') || t === 'ap') {
      this._drawAccessPoint(ctx, selected, model);
      return;
    }

    switch (t) {
      case 'router':         this._drawRouter(ctx, selected); break;
      case 'switch':         this._drawSwitch(ctx, selected); break;
      case 'l3switch':       this._drawL3Switch(ctx, selected); break;
      case 'pc':             this._drawPC(ctx, selected); break;
      case 'server':         this._drawServer(ctx, selected); break;
      case 'ap':             this._drawAccessPoint(ctx, selected, model); break;
      case 'lap':            this._drawLAP(ctx, selected, model); break;
      case 'hub':            this._drawHub(ctx, selected); break;
      case 'repeater':       this._drawRepeater(ctx, selected); break;
      case 'coaxialsplitter':
      case 'splitter':       this._drawCoAxialSplitter(ctx, selected); break;
      case 'bridge':         this._drawBridge(ctx, selected); break;
      case 'firewall':       this._drawFirewall(ctx, selected); break;
      case 'securityappliance': this._drawMerakiMX(ctx, selected); break;
      case 'wirelessrouter': this._drawWirelessRouter(ctx, selected, model); break;
      case 'homegateway':    this._drawHomeGateway(ctx, selected); break;
      case 'wlc':            this._drawWLC(ctx, selected, model); break;
      case 'modem':          this._drawModem(ctx, selected); break;
      case 'celltower':      this._drawCellTower(ctx, selected); break;
      case 'coserver':       this._drawCentralOfficeServer(ctx, selected); break;
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
    const r = 22;

    this._glow(ctx, color, sel ? 16 : 8);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4 router arrows (in-out)
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    const angles = [0, 90, 180, 270];
    angles.forEach(a => {
      const rad = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rad) * 12, Math.sin(rad) * 12);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Switch: rectangle with port lines ───────────────────────
  _drawSwitch(ctx, sel) {
    const color = sel ? '#60aaff' : '#4488dd';
    const bg    = sel ? 'rgba(68,136,220,0.18)' : 'rgba(40,80,160,0.12)';
    const w = 38, h = 20;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Port lines
    const ports = 6;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < ports; i++) {
      const x = -14 + i * 5.6;
      ctx.beginPath();
      ctx.moveTo(x, -4);
      ctx.lineTo(x, -1);
      ctx.lineTo(x + 2.5, 1);
      ctx.lineTo(x + 2.5, 4);
      ctx.stroke();
    }
    this._noGlow(ctx);
  }

  // ── L3 Switch: switch + routing lines ───────────────────────
  _drawL3Switch(ctx, sel) {
    const color = sel ? '#88aaff' : '#6688dd';
    const bg    = sel ? 'rgba(100,136,220,0.18)' : 'rgba(60,80,160,0.12)';
    const w = 38, h = 20;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = color;
    ctx.font      = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('L3', 0, 0);
    this._noGlow(ctx);
  }

  // ── PC: monitor shape ────────────────────────────────────────
  _drawPC(ctx, sel) {
    const color = sel ? '#88ddff' : '#66aabb';
    const bg    = sel ? 'rgba(100,180,220,0.18)' : 'rgba(60,120,160,0.1)';

    this._glow(ctx, color, sel ? 14 : 5);
    ctx.beginPath();
    ctx.roundRect(-16, -16, 32, 22, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 14, 2);
    ctx.fillStyle = sel ? 'rgba(0,212,255,0.12)' : 'rgba(0,100,150,0.15)';
    ctx.fill();

    // Stand & Base
    ctx.beginPath();
    ctx.moveTo(-6, 6); ctx.lineTo(6, 6);
    ctx.lineTo(4, 12); ctx.lineTo(-4, 12);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-8, 12); ctx.lineTo(8, 12);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    this._noGlow(ctx);
  }

  // ── Server: rack server ──────────────────────────────────────
  _drawServer(ctx, sel) {
    const color = sel ? '#88ffbb' : '#44bb88';
    const bg    = sel ? 'rgba(100,220,160,0.18)' : 'rgba(40,160,100,0.1)';
    const w = 28, h = 32;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Drive bays
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    for (let i = 0; i < 3; i++) {
      const y = -8 + i * 8;
      ctx.beginPath();
      ctx.roundRect(-9, y, 8, 5, 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, y + 2.5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#00ff88' : '#004433';
      ctx.fill();
    }
    this._noGlow(ctx);
  }

  // ── Central Office Server (Distinct Cisco Packet Tracer icon) ──
  _drawCentralOfficeServer(ctx, sel) {
    const color = sel ? '#00ffff' : '#0284c7';
    const bg    = sel ? 'rgba(0,255,255,0.22)' : 'rgba(2,132,199,0.18)';
    const w = 30, h = 38;

    this._glow(ctx, color, sel ? 18 : 8);

    // Main tall server chassis
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Top ventilation / status header band
    ctx.fillStyle = color;
    ctx.fillRect(-w/2 + 2, -h/2 + 2, w - 4, 4);

    // Large prominent "CO" stamp matching Cisco Packet Tracer
    ctx.fillStyle = '#0f172a'; // Bold dark fill behind
    ctx.font = '900 15px "JetBrains Mono", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CO', 0, 4);

    ctx.fillStyle = sel ? '#ffffff' : '#e0f2fe'; // Crisp text
    ctx.fillText('CO', 0, 3);

    // Dual activity LEDs at the bottom
    ctx.beginPath();
    ctx.arc(-6, h/2 - 5, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(6, h/2 - 5, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#00e8ff';
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Cell Tower: Cellular Base Station Transceiver ─────────────
  _drawCellTower(ctx, sel) {
    const color = sel ? '#38bdf8' : '#0284c7';
    const waveColor = sel ? '#00e8ff' : '#38bdf8';
    this._glow(ctx, color, sel ? 16 : 8);

    // Lattice Tower Structure
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Legs
    ctx.moveTo(0, -18); ctx.lineTo(-13, 18);
    ctx.moveTo(0, -18); ctx.lineTo(13, 18);
    // Base platform
    ctx.moveTo(-15, 18); ctx.lineTo(15, 18);
    // Horizontal crossbars
    ctx.moveTo(-5, -6);  ctx.lineTo(5, -6);
    ctx.moveTo(-9, 6);   ctx.lineTo(9, 6);
    // Diagonal lattice braces
    ctx.moveTo(-5, -6); ctx.lineTo(9, 6);
    ctx.moveTo(5, -6);  ctx.lineTo(-9, 6);
    ctx.moveTo(-9, 6);  ctx.lineTo(13, 18);
    ctx.moveTo(9, 6);   ctx.lineTo(-13, 18);
    ctx.stroke();

    // Antenna Beacon (Apex)
    ctx.beginPath();
    ctx.arc(0, -18, 3, 0, Math.PI * 2);
    ctx.fillStyle = sel ? '#ff3344' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Concentric RF Broadcast Waves
    ctx.strokeStyle = waveColor;
    ctx.lineWidth = 1.5;
    [7, 13, 19].forEach(r => {
      // Left arc
      ctx.beginPath();
      ctx.arc(0, -18, r, Math.PI * 0.75, Math.PI * 1.25);
      ctx.stroke();
      // Right arc
      ctx.beginPath();
      ctx.arc(0, -18, r, -Math.PI * 0.25, Math.PI * 0.25);
      ctx.stroke();
    });

    this._noGlow(ctx);
  }

  // ── Meraki MX65W Security Appliance ───────────────────────────
  _drawMerakiMX(ctx, sel) {
    const color = sel ? '#00e8ff' : '#0ea5e9';
    const bodyBg = sel ? 'rgba(241,245,249,0.25)' : 'rgba(203,213,225,0.18)';
    const w = 40, h = 18;

    this._glow(ctx, color, sel ? 16 : 8);

    // Sleek white / metallic appliance casing
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2 + 2, w, h, 3);
    ctx.fillStyle = bodyBg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dual Top Antenna prongs
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -h/2 + 2); ctx.lineTo(-15, -16);
    ctx.moveTo(12, -h/2 + 2);  ctx.lineTo(15, -16);
    ctx.stroke();

    // Meraki LED Status Bar (Green / Cyan)
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-w/2 + 4, 0, w - 8, 3);

    // Security Shield Emblem
    ctx.fillStyle = color;
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MX', 0, 7);

    this._noGlow(ctx);
  }

  // ── Wireless Router (HomeRouter-PT-AC, WRT300N) ───────────────
  _drawWirelessRouter(ctx, sel, model = '') {
    const isAC = (model || '').toUpperCase().includes('AC');
    const color = sel ? '#38bdf8' : (isAC ? '#0284c7' : '#0369a1');
    const bg    = sel ? 'rgba(56,189,248,0.22)' : 'rgba(2,132,199,0.15)';
    const w = 38, h = 18;

    this._glow(ctx, color, sel ? 16 : 8);

    // Rounded router body
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2 + 2, w, h, 4);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dual Antennas angled outward
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -h/2 + 2); ctx.lineTo(-14, -15);
    ctx.moveTo(11, -h/2 + 2);  ctx.lineTo(14, -15);
    ctx.stroke();

    // Wi-Fi Broadcast Waves in center
    ctx.lineWidth = 1.2;
    [4, 8].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(0, 1, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Ethernet Port LEDs
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-10 + i * 6.5, 6, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = i < 2 ? '#00ff88' : '#00aa55';
      ctx.fill();
    }

    this._noGlow(ctx);
  }

  // ── DLC100 Home Gateway (Smart Home / IoT Hub) ────────────────
  _drawHomeGateway(ctx, sel) {
    const color = sel ? '#00e8ff' : '#0284c7';
    const bg    = sel ? 'rgba(0,232,255,0.22)' : 'rgba(2,132,199,0.16)';
    const w = 36, h = 22;

    this._glow(ctx, color, sel ? 16 : 8);

    // Chassis
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2 + 2, w, h, 3);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Antenna on right side (matching Packet Tracer Home Gateway icon)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -h/2 + 2); ctx.lineTo(10, -14);
    ctx.stroke();

    // Smart Home / IoT Icon (House roof & sensor dot)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, 3);
    ctx.lineTo(0, -3);
    ctx.lineTo(7, 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 5, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffaa';
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Access Point (AccessPoint-PT, -A, -N, -AC) ────────────────
  _drawAccessPoint(ctx, sel, model = '') {
    const m = (model || '').toUpperCase();
    const color = sel ? '#38bdf8' : '#0284c7';
    const bg    = sel ? 'rgba(56,189,248,0.2)' : 'rgba(2,132,199,0.14)';
    const w = 38, h = 20;

    this._glow(ctx, color, sel ? 14 : 6);

    // AP Box Chassis
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6-dot matrix front panel (Classic Cisco AP style)
    ctx.fillStyle = color;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.arc(-8 + col * 8, -3 + row * 6, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Band indicator badge if applicable (-A, -N, -AC)
    let badge = '';
    if (m.includes('-AC')) badge = 'AC';
    else if (m.includes('-N')) badge = 'N';
    else if (m.includes('-A')) badge = 'A';

    if (badge) {
      ctx.fillStyle = sel ? '#ffffff' : '#e0f2fe';
      ctx.font = 'bold 7px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(badge, w/2 - 3, h/2 - 3);
    }

    this._noGlow(ctx);
  }

  // ── Lightweight Access Point (LAP-PT, 3702i) ──────────────────
  _drawLAP(ctx, sel, model = '') {
    const color = sel ? '#00e8ff' : '#0284c7';
    const bg    = sel ? 'rgba(0,232,255,0.2)' : 'rgba(2,132,199,0.15)';
    const r = 18;

    this._glow(ctx, color, sel ? 16 : 8);

    // Ceiling Saucer Round Enclosure
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner Concentric Wave Rings (MIMO CleanAir)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // "LAP" badge
    ctx.fillStyle = sel ? '#ffffff' : '#bae6fd';
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LAP', 0, 0);

    this._noGlow(ctx);
  }

  // ── Wireless LAN Controller (WLC-PT, 2504, 3504) ──────────────
  _drawWLC(ctx, sel, model = '') {
    const color = sel ? '#38bdf8' : '#0284c7';
    const bg    = sel ? 'rgba(56,189,248,0.22)' : 'rgba(2,132,199,0.16)';
    const w = 40, h = 24;

    this._glow(ctx, color, sel ? 16 : 8);

    // Controller chassis
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cisco 4-way cross controller arrows on top
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -2); ctx.lineTo(10, -2);
    ctx.moveTo(0, -10);  ctx.lineTo(0, 6);
    ctx.stroke();

    // WLC Label
    ctx.fillStyle = color;
    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WLC', 0, 4);

    this._noGlow(ctx);
  }

  // ── Firewall: ASA Shield ──────────────────────────────────────
  _drawFirewall(ctx, sel) {
    const color = sel ? '#ff4444' : '#dd2222';
    const bg    = sel ? 'rgba(255,68,68,0.18)' : 'rgba(180,30,30,0.12)';
    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(15, -9);
    ctx.lineTo(11, 11);
    ctx.lineTo(0, 16);
    ctx.lineTo(-11, 11);
    ctx.lineTo(-15, -9);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('ASA', 0, 0);
    this._noGlow(ctx);
  }

  // ── Hub: 6-Port Multiport Repeater ────────────────────────────
  _drawHub(ctx, sel) {
    const color = sel ? '#00e8ff' : '#00aacc';
    const bg    = sel ? 'rgba(0,212,255,0.2)' : 'rgba(0,140,170,0.14)';
    const w = 36, h = 22;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    for (let i = 0; i < 4; i++) {
      const x = -10 + i * 6.5;
      ctx.beginPath();
      ctx.moveTo(x, -7);
      ctx.lineTo(x, 3);
      ctx.stroke();
    }

    ctx.fillStyle = color;
    ctx.font = 'bold 7px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('HUB', 0, 6);
    this._noGlow(ctx);
  }

  // ── Repeater: Signal regeneration box ───────────────────────
  _drawRepeater(ctx, sel) {
    const color = sel ? '#00e8ff' : '#00b4d8';
    const bg    = sel ? 'rgba(0,232,255,0.2)' : 'rgba(0,160,200,0.14)';
    const w = 36, h = 18;

    this._glow(ctx, color, sel ? 14 : 6);
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

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
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2 + 2, w, h, 2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = color;
    [-12, 0, 12].forEach(x => {
      ctx.beginPath();
      ctx.rect(x - 2.5, -h/2 - 2, 5, 4);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    });

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

  // ── Cloud / Internet ─────────────────────────────────────────
  _drawCloud(ctx, sel) {
    const color = sel ? '#aabbcc' : '#7799aa';
    const bg    = sel ? 'rgba(150,180,200,0.18)' : 'rgba(80,110,140,0.1)';

    this._glow(ctx, color, sel ? 10 : 4);
    ctx.fillStyle   = bg;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;

    const circles = [
      [0, 4, 14], [-10, 8, 10], [10, 8, 10], [-6, -2, 10], [6, -2, 10],
    ];
    ctx.beginPath();
    circles.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); });
    ctx.fill();
    ctx.beginPath();
    circles.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); });
    ctx.stroke();
    this._noGlow(ctx);
  }

  // ── Generic fallback ─────────────────────────────────────────
  _drawGeneric(ctx, sel) {
    const color = sel ? '#cccccc' : '#888888';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle   = 'rgba(100,100,100,0.2)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // ──────────────────────────────────────────────────────────
  //  Palette preview drawing (small icons in the sidebar)
  // ──────────────────────────────────────────────────────────
  drawPreview(canvas, type, model = '') {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(0.75, 0.75);
    this._drawType(ctx, type, false, model);
    ctx.restore();
  }
}
