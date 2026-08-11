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
    if (m.includes('CYBER') || t === 'cyberobserver') {
      this._drawCyberObserver(ctx, selected);
      return;
    }
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
    if (m.includes('5506') || m.includes('5505') || m.includes('ISA') || m.includes('ASA') || t === 'firewall') {
      this._drawFirewall(ctx, selected, model);
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
    if (m.includes('MERAKI-SERVER') || m.includes('MERAKISERVER')) {
      this._drawMerakiServer(ctx, selected);
      return;
    }
    if (m.includes('CONTROLLER') || m.includes('NETWORKCONTROLLER')) {
      this._drawNetworkController(ctx, selected);
      return;
    }
    if (m.includes('LAPTOP')) {
      this._drawLaptop(ctx, selected);
      return;
    }
    if (m.includes('PRINTER')) {
      this._drawPrinter(ctx, selected);
      return;
    }
    if (m.includes('7960') || m.includes('IP-PHONE') || m.includes('IPPHONE')) {
      this._drawIPPhone(ctx, selected);
      return;
    }
    if (m.includes('HOME-VOIP') || m.includes('HOMEVOIP')) {
      this._drawHomeVoIP(ctx, selected);
      return;
    }
    if (m.includes('ANALOG-PHONE') || m.includes('ANALOGPHONE')) {
      this._drawAnalogPhone(ctx, selected);
      return;
    }
    if (m.includes('TV')) {
      this._drawTV(ctx, selected);
      return;
    }
    if (m.includes('TABLET')) {
      this._drawTablet(ctx, selected);
      return;
    }
    if (m.includes('SMARTPHONE')) {
      this._drawSmartphone(ctx, selected);
      return;
    }
    if (m.includes('WIRELESSENDDEVICE') || m.includes('WIRELESS-ENDDEVICE')) {
      this._drawWirelessEndDevice(ctx, selected);
      return;
    }
    if (m.includes('WIREDENDDEVICE') || m.includes('WIRED-ENDDEVICE')) {
      this._drawWiredEndDevice(ctx, selected);
      return;
    }
    if (m.includes('SNIFFER')) {
      this._drawSniffer(ctx, selected);
      return;
    }
    if (m.includes('MODEM') || t === 'modem') {
      this._drawModem(ctx, selected, model);
      return;
    }
    if (m.includes('CLOUD') || t === 'cloud') {
      this._drawCloud(ctx, selected, model);
      return;
    }

    switch (t) {
      case 'router':         this._drawRouter(ctx, selected); break;
      case 'switch':         this._drawSwitch(ctx, selected); break;
      case 'l3switch':       this._drawL3Switch(ctx, selected); break;
      case 'pc':             this._drawPC(ctx, selected); break;
      case 'server':         this._drawServer(ctx, selected); break;
      case 'cyberobserver':  this._drawCyberObserver(ctx, selected); break;
      case 'ap':             this._drawAccessPoint(ctx, selected, model); break;
      case 'lap':            this._drawLAP(ctx, selected, model); break;
      case 'hub':            this._drawHub(ctx, selected); break;
      case 'repeater':       this._drawRepeater(ctx, selected); break;
      case 'coaxialsplitter':
      case 'splitter':       this._drawCoAxialSplitter(ctx, selected); break;
      case 'bridge':         this._drawBridge(ctx, selected); break;
      case 'firewall':       this._drawFirewall(ctx, selected, model); break;
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

  // ── Meraki Server (Cloud Dashboard with Green 'M') ───────────
  _drawMerakiServer(ctx, sel) {
    const color = sel ? '#00ff88' : '#22c55e';
    this._glow(ctx, color, sel ? 16 : 8);

    const w = 28, h = 36;
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    const grad = ctx.createLinearGradient(0, -h/2, 0, h/2);
    grad.addColorStop(0, sel ? '#065f46' : '#047857');
    grad.addColorStop(1, sel ? '#022c22' : '#064e3b');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Drive bays
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 2; i++) {
      const y = -12 + i * 6;
      ctx.beginPath();
      ctx.roundRect(-9, y, 18, 4, 1);
      ctx.stroke();
    }

    // Circular Green Meraki 'M' Badge
    ctx.beginPath();
    ctx.arc(0, 6, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', 0, 6);

    this._noGlow(ctx);
  }

  // ── Network Controller (SDN Controller with Sync Arrows) ─────
  _drawNetworkController(ctx, sel) {
    const color = sel ? '#00e8ff' : '#0284c7';
    this._glow(ctx, color, sel ? 16 : 8);

    const w = 28, h = 36;
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 3);
    const grad = ctx.createLinearGradient(0, -h/2, 0, h/2);
    grad.addColorStop(0, sel ? '#0369a1' : '#0284c7');
    grad.addColorStop(1, sel ? '#0c4a6e' : '#075985');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Drive Bay
    ctx.beginPath();
    ctx.roundRect(-9, -12, 18, 4, 1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Central SDN Sync Circle with Controller Arrows
    ctx.beginPath();
    ctx.arc(0, 5, 6.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Arrowhead top
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(6.5, -1.5);
    ctx.lineTo(6.5, 2.5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Arrowhead bottom
    ctx.beginPath();
    ctx.moveTo(-3, 10);
    ctx.lineTo(-6.5, 11.5);
    ctx.lineTo(-6.5, 7.5);
    ctx.closePath();
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Laptop: 3D Clamshell Screen + Keyboard Base ──────────────
  _drawLaptop(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Screen (Angled upright)
    ctx.beginPath();
    ctx.moveTo(-13, -15);
    ctx.lineTo(13, -15);
    ctx.lineTo(11, -2);
    ctx.lineTo(-11, -2);
    ctx.closePath();
    const screenGrad = ctx.createLinearGradient(0, -15, 0, -2);
    screenGrad.addColorStop(0, sel ? '#164e63' : '#0e3a4d');
    screenGrad.addColorStop(1, sel ? '#083344' : '#082f49');
    ctx.fillStyle = screenGrad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Screen Inner Display
    ctx.beginPath();
    ctx.moveTo(-10.5, -13);
    ctx.lineTo(10.5, -13);
    ctx.lineTo(9, -4);
    ctx.lineTo(-9, -4);
    ctx.closePath();
    ctx.fillStyle = sel ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.2)';
    ctx.fill();

    // Keyboard Base (Perspective Parallelogram)
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.lineTo(11, -2);
    ctx.lineTo(16, 11);
    ctx.lineTo(-16, 11);
    ctx.closePath();
    const baseGrad = ctx.createLinearGradient(0, -2, 0, 11);
    baseGrad.addColorStop(0, sel ? '#0284c7' : '#336177');
    baseGrad.addColorStop(1, sel ? '#0369a1' : '#1e3d4c');
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Trackpad
    ctx.beginPath();
    ctx.rect(-3.5, 5, 7, 3.5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Printer: Office Desktop Network Printer ──────────────────
  _drawPrinter(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Top paper input sheet
    ctx.beginPath();
    ctx.rect(-7, -15, 14, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Printer Body
    ctx.beginPath();
    ctx.roundRect(-15, -8, 30, 18, 3);
    const bodyGrad = ctx.createLinearGradient(0, -8, 0, 10);
    bodyGrad.addColorStop(0, sel ? '#0284c7' : '#477a8e');
    bodyGrad.addColorStop(1, sel ? '#0369a1' : '#234b5c');
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Output paper tray & slot
    ctx.beginPath();
    ctx.rect(-10, 0, 20, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Output paper sheet extending
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(18, -4);
    ctx.lineTo(20, -1);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    // Power status LED
    ctx.beginPath();
    ctx.arc(-11, -3, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Cisco 7960 IP Phone ──────────────────────────────────────
  _drawIPPhone(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#62a8c5';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Phone Main Body (Angled Wedge)
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(14, -14);
    ctx.lineTo(16, 12);
    ctx.lineTo(-12, 16);
    ctx.closePath();
    const bodyGrad = ctx.createLinearGradient(-14, -14, 16, 16);
    bodyGrad.addColorStop(0, sel ? '#0369a1' : '#336177');
    bodyGrad.addColorStop(1, sel ? '#0c4a6e' : '#1b3b4a');
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Left Handset
    ctx.beginPath();
    ctx.roundRect(-16, -14, 6.5, 28, 3);
    ctx.fillStyle = sel ? '#0284c7' : '#234c5e';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // LCD Display
    ctx.beginPath();
    ctx.rect(-5, -9, 15, 8);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Keypad Grid Dots
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.arc(-3 + c * 4, 3 + r * 3, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();
      }
    }

    // Circular "IP" Emblem Badge
    ctx.beginPath();
    ctx.arc(-8, 11, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = sel ? '#00e8ff' : '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IP', -8, 11);

    this._noGlow(ctx);
  }

  // ── Home VoIP ATA Adapter ────────────────────────────────────
  _drawHomeVoIP(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#38bdf8';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // ATA Box
    ctx.beginPath();
    ctx.roundRect(-16, -5, 32, 16, 2.5);
    const grad = ctx.createLinearGradient(0, -5, 0, 11);
    grad.addColorStop(0, sel ? '#0284c7' : '#2b5f75');
    grad.addColorStop(1, sel ? '#0369a1' : '#173a4a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Top Telephone Loop / Antenna
    ctx.beginPath();
    ctx.arc(0, -5, 6, Math.PI, 0);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Front Status LEDs
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-9 + i * 6, 3, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = (i === 0 || i === 1) ? '#22c55e' : '#38bdf8';
      ctx.fill();
    }

    this._noGlow(ctx);
  }

  // ── Analog Desk Phone ────────────────────────────────────────
  _drawAnalogPhone(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Phone Base
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(12, -12);
    ctx.lineTo(14, 11);
    ctx.lineTo(-10, 14);
    ctx.closePath();
    const grad = ctx.createLinearGradient(-12, -12, 14, 14);
    grad.addColorStop(0, sel ? '#0284c7' : '#3b697d');
    grad.addColorStop(1, sel ? '#0369a1' : '#1c3e4e');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Handset
    ctx.beginPath();
    ctx.roundRect(-15, -14, 6, 26, 3);
    ctx.fillStyle = sel ? '#0369a1' : '#274f61';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Dial Pad
    ctx.beginPath();
    ctx.arc(4, 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── Smart TV Display ─────────────────────────────────────────
  _drawTV(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Outer TV Bezel
    ctx.beginPath();
    ctx.roundRect(-17, -15, 34, 22, 2);
    ctx.fillStyle = sel ? '#0f172a' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner Glowing Screen
    ctx.beginPath();
    ctx.rect(-14, -12, 28, 16);
    const grad = ctx.createLinearGradient(-14, -12, 14, 4);
    grad.addColorStop(0, sel ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.15)');
    grad.addColorStop(1, sel ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.05)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stand Pedestal
    ctx.beginPath();
    ctx.moveTo(-4, 7);
    ctx.lineTo(4, 7);
    ctx.lineTo(2, 13);
    ctx.lineTo(-2, 13);
    ctx.closePath();
    ctx.fillStyle = strokeColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-8, 13);
    ctx.lineTo(8, 13);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── Tablet PC ────────────────────────────────────────────────
  _drawTablet(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Tablet Chassis
    ctx.beginPath();
    ctx.roundRect(-14, -17, 28, 34, 3);
    ctx.fillStyle = sel ? '#0f172a' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Touch Screen Glass
    ctx.beginPath();
    ctx.rect(-11, -12, 22, 22);
    const screenGrad = ctx.createLinearGradient(-11, -12, 11, 10);
    screenGrad.addColorStop(0, sel ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.18)');
    screenGrad.addColorStop(1, sel ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)');
    ctx.fillStyle = screenGrad;
    ctx.fill();

    // Home Button
    ctx.beginPath();
    ctx.arc(0, 13, 1.8, 0, Math.PI * 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── Smartphone ───────────────────────────────────────────────
  _drawSmartphone(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Angled Smartphone Chassis
    ctx.save();
    ctx.rotate(Math.PI / 10);

    // Top Antenna
    ctx.beginPath();
    ctx.moveTo(4, -17);
    ctx.lineTo(8, -22);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Phone Body
    ctx.beginPath();
    ctx.roundRect(-10, -17, 20, 34, 3);
    ctx.fillStyle = sel ? '#0f172a' : '#1e293b';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Screen
    ctx.beginPath();
    ctx.rect(-8, -12, 16, 22);
    const grad = ctx.createLinearGradient(-8, -12, 8, 10);
    grad.addColorStop(0, sel ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.18)');
    grad.addColorStop(1, sel ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Earpiece slot
    ctx.beginPath();
    ctx.moveTo(-3, -14.5);
    ctx.lineTo(3, -14.5);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    this._noGlow(ctx);
  }

  // ── Wireless End Device ──────────────────────────────────────
  _drawWirelessEndDevice(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#62a8c5';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Module Body
    ctx.beginPath();
    ctx.roundRect(-16, -4, 32, 16, 2.5);
    const grad = ctx.createLinearGradient(0, -4, 0, 12);
    grad.addColorStop(0, sel ? '#0284c7' : '#336177');
    grad.addColorStop(1, sel ? '#0369a1' : '#1b3b4a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Wireless Broadcast Icon on Top
    ctx.beginPath();
    ctx.arc(0, -6, 2, 0, Math.PI * 2);
    ctx.fillStyle = sel ? '#00e8ff' : '#38bdf8';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -6, 5, Math.PI * 1.25, Math.PI * 1.75);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -6, 9, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // Activity LED
    ctx.beginPath();
    ctx.arc(-11, 4, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Wired End Device ─────────────────────────────────────────
  _drawWiredEndDevice(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#62a8c5';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Module Body
    ctx.beginPath();
    ctx.roundRect(-16, -6, 32, 16, 2.5);
    const grad = ctx.createLinearGradient(0, -6, 0, 10);
    grad.addColorStop(0, sel ? '#0284c7' : '#336177');
    grad.addColorStop(1, sel ? '#0369a1' : '#1b3b4a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Front Ethernet Port Cutout
    ctx.beginPath();
    ctx.rect(-5, 0, 10, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Status LED
    ctx.beginPath();
    ctx.arc(9, 2, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    this._noGlow(ctx);
  }

  // ── Sniffer (Protocol Analyzer) ──────────────────────────────
  _drawSniffer(ctx, sel) {
    const strokeColor = sel ? '#00e8ff' : '#7cb8d2';
    this._glow(ctx, strokeColor, sel ? 14 : 6);

    // Saucer / Trapezoidal Chassis
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(16, -6);
    ctx.lineTo(20, 6);
    ctx.lineTo(-20, 6);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, -6, 0, 6);
    grad.addColorStop(0, sel ? '#0284c7' : '#3f6c7f');
    grad.addColorStop(1, sel ? '#0369a1' : '#1c3e4e');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Top Capture Dome / Lens
    ctx.beginPath();
    ctx.ellipse(0, -6, 12, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = sel ? '#0284c7' : '#274e5f';
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Front Capture Mesh Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let x = -12; x <= 12; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x * 1.15, 5);
      ctx.stroke();
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

  // ── Firewall: Cisco Packet Tracer ASA / ISA Inspection & Brick Wall ─
  _drawFirewall(ctx, sel, model = '') {
    const isISA = (model || '').toUpperCase().includes('ISA');
    const glowColor = sel ? '#00e8ff' : '#0ea5e9';
    this._glow(ctx, glowColor, sel ? 16 : 8);

    const w = 30;
    const topH = 20;
    const btmH = 18;
    const x0 = -w / 2;
    const yTop = -19;
    const yBtm = yTop + topH;

    // 1. Upper Chamber: Sky Blue / Cyan Inspection Block
    ctx.beginPath();
    ctx.roundRect(x0, yTop, w, topH, [3, 3, 0, 0]);
    const topGrad = ctx.createLinearGradient(0, yTop, 0, yBtm);
    topGrad.addColorStop(0, sel ? '#38bdf8' : '#0284c7');
    topGrad.addColorStop(1, sel ? '#0284c7' : '#0369a1');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = sel ? '#00e8ff' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Magnifying Glass Handle (pointing down-left)
    ctx.beginPath();
    ctx.moveTo(-3, -5);
    ctx.lineTo(-8.5, 0.5);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Magnifying Glass Lens Rim
    ctx.beginPath();
    ctx.arc(1.5, -9, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Inspection graphic inside lens (bidirectional arrow / packet flow)
    ctx.beginPath();
    ctx.moveTo(-1.5, -9);
    ctx.lineTo(4.5, -9);
    ctx.moveTo(3, -11);
    ctx.lineTo(5, -9);
    ctx.lineTo(3, -7);
    ctx.moveTo(0, -11);
    ctx.lineTo(-2, -9);
    ctx.lineTo(0, -7);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Industrial DIN-rail accent for ISA-3000
    if (isISA) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-6, yTop + 1, 12, 2.5);
    }

    // 2. Lower Chamber: Classic Red Brick Wall
    ctx.beginPath();
    ctx.roundRect(x0, yBtm, w, btmH, [0, 0, 3, 3]);
    ctx.fillStyle = '#991b1b';
    ctx.fill();
    ctx.strokeStyle = sel ? '#ff4444' : '#b91c1c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Brick mortar lines
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1.2;

    // Horizontal mortar rows
    ctx.beginPath();
    ctx.moveTo(x0 + 1, yBtm + 6);
    ctx.lineTo(x0 + w - 1, yBtm + 6);
    ctx.moveTo(x0 + 1, yBtm + 12);
    ctx.lineTo(x0 + w - 1, yBtm + 12);
    ctx.stroke();

    // Vertical mortar joints (staggered pattern)
    ctx.beginPath();
    // Row 1 (yBtm to yBtm + 6)
    ctx.moveTo(-5, yBtm);
    ctx.lineTo(-5, yBtm + 6);
    ctx.moveTo(5, yBtm);
    ctx.lineTo(5, yBtm + 6);
    // Row 2 (yBtm + 6 to yBtm + 12)
    ctx.moveTo(-10, yBtm + 6);
    ctx.lineTo(-10, yBtm + 12);
    ctx.moveTo(0, yBtm + 6);
    ctx.lineTo(0, yBtm + 12);
    ctx.moveTo(10, yBtm + 6);
    ctx.lineTo(10, yBtm + 12);
    // Row 3 (yBtm + 12 to yBtm + btmH)
    ctx.moveTo(-5, yBtm + 12);
    ctx.lineTo(-5, yBtm + btmH);
    ctx.moveTo(5, yBtm + 12);
    ctx.lineTo(5, yBtm + btmH);
    ctx.stroke();

    this._noGlow(ctx);
  }

  // ── CyberObserver: Continuous Security & Telemetry Sensor ────
  _drawCyberObserver(ctx, sel) {
    const color = sel ? '#00ffff' : '#2dd4bf';
    const glowColor = sel ? '#00ffff' : '#0d9488';
    this._glow(ctx, glowColor, sel ? 16 : 8);

    const w = 28, h = 38;
    const x0 = -w / 2;
    const y0 = -h / 2;

    // 1. Tower Chassis
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 3);
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + h);
    grad.addColorStop(0, sel ? '#115e59' : '#0f766e');
    grad.addColorStop(1, sel ? '#042f2e' : '#134e4a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Top Sensor / Drive Bay slot
    ctx.beginPath();
    ctx.roundRect(-9, -15, 18, 3.5, 1);
    ctx.fillStyle = '#042f2e';
    ctx.fill();
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Top activity LED
    ctx.beginPath();
    ctx.arc(5.5, -13.2, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    // 3. Security Shield Outline
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(8, -4);
    ctx.quadraticCurveTo(7.5, 3.5, 0, 11);
    ctx.quadraticCurveTo(-7.5, 3.5, -8, -4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(45, 212, 191, 0.15)';
    ctx.fill();
    ctx.strokeStyle = sel ? '#ffffff' : '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 4. Horus / CyberObserver Eye Emblem inside shield
    ctx.beginPath();
    ctx.moveTo(-5.5, 1);
    ctx.quadraticCurveTo(0, -3.5, 5.5, 1);
    ctx.quadraticCurveTo(0, 5.5, -5.5, 1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#f0fdfa';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Eye Pupil / Iris
    ctx.beginPath();
    ctx.arc(0, 1, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = sel ? '#00ffff' : '#38bdf8';
    ctx.fill();

    // 5. Dual Telemetry Status LEDs at bottom
    ctx.beginPath();
    ctx.arc(-5, 15, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(5, 15, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();

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

  // ── Broadband Modem: 3D Box with Front LED Array (DSL / Cable) ──
  _drawModem(ctx, sel, model = '') {
    const isCable = (model || '').toUpperCase().includes('CABLE');
    const color = sel ? '#00e8ff' : '#0284c7';
    this._glow(ctx, color, sel ? 16 : 8);

    // 3D Perspective Modem Box
    // Top surface parallelogram
    ctx.beginPath();
    ctx.moveTo(-16, -4);
    ctx.lineTo(-6, -12);
    ctx.lineTo(16, -12);
    ctx.lineTo(6, -4);
    ctx.closePath();
    const topGrad = ctx.createLinearGradient(-16, -12, 16, -4);
    topGrad.addColorStop(0, sel ? '#38bdf8' : '#0ea5e9');
    topGrad.addColorStop(1, sel ? '#0284c7' : '#0369a1');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Right side face (3D depth)
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(16, -12);
    ctx.lineTo(16, 2);
    ctx.lineTo(6, 10);
    ctx.closePath();
    ctx.fillStyle = sel ? '#0369a1' : '#075985';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front face
    ctx.beginPath();
    ctx.rect(-16, -4, 22, 14);
    const frontGrad = ctx.createLinearGradient(-16, -4, 6, 10);
    frontGrad.addColorStop(0, sel ? '#0284c7' : '#0369a1');
    frontGrad.addColorStop(1, sel ? '#0369a1' : '#024a70');
    ctx.fillStyle = frontGrad;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front LED Indicator Array (5 circular dots in a row)
    const leds = 5;
    for (let i = 0; i < leds; i++) {
      const lx = -13 + i * 4.2;
      const ly = 3;
      ctx.beginPath();
      ctx.arc(lx, ly, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = (i === 0 || i === 1) ? '#00ff88' : '#e0f2fe';
      ctx.fill();
    }

    this._noGlow(ctx);
  }

  // ── Cloud: Cisco Packet Tracer WAN Emulation Cloud ──────────
  _drawCloud(ctx, sel, model = '') {
    const isEmpty = (model || '').toUpperCase().includes('EMPTY');
    const color = sel ? '#00e8ff' : '#4d8296';
    const strokeColor = sel ? '#00e8ff' : '#689bb0';
    this._glow(ctx, strokeColor, sel ? 16 : 8);

    // Cisco Packet Tracer Cloud Puff Lobes
    const circles = [
      { x: 0,   y: -4, r: 13 },  // Center top
      { x: -11, y: -1, r: 10 },  // Left top
      { x: 11,  y: -1, r: 10 },  // Right top
      { x: -14, y: 7,  r: 9 },   // Left bottom
      { x: 14,  y: 7,  r: 9 },   // Right bottom
      { x: 0,   y: 8,  r: 11 },  // Center bottom
    ];

    // Cloud Body Fill
    ctx.beginPath();
    circles.forEach(c => {
      ctx.moveTo(c.x + c.r, c.y);
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    });
    const grad = ctx.createLinearGradient(0, -17, 0, 19);
    grad.addColorStop(0, sel ? '#38bdf8' : '#5b93aa');
    grad.addColorStop(0.5, sel ? '#0284c7' : '#457488');
    grad.addColorStop(1, sel ? '#0369a1' : '#2b5060');
    ctx.fillStyle = grad;
    ctx.fill();

    // Cloud Outer Perimeter Stroke
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    circles.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Top Cloud Puff Highlights
    ctx.beginPath();
    ctx.arc(0, -4, 10, Math.PI * 1.1, Math.PI * 1.9);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-11, -1, 7.5, Math.PI * 1.1, Math.PI * 1.8);
    ctx.stroke();

    // Empty modular chassis indicator
    if (isEmpty) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.rect(-7, 3, 14, 7);
      ctx.stroke();
      ctx.setLineDash([]);
    }

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
