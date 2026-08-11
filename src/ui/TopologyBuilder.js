import { eventBus }         from '../engine/EventBus.js';
import { Router }           from '../network/Router.js';
import { Switch, L3Switch } from '../network/Switch.js';
import { PC }               from '../network/PC.js';
import { Server, CentralOfficeServer, Cloud } from '../network/Server.js';
import { AccessPoint, LightweightAccessPoint } from '../network/AccessPoint.js';
import { Hub }              from '../network/Hub.js';
import { Repeater }         from '../network/Repeater.js';
import { CoAxialSplitter }  from '../network/CoAxialSplitter.js';
import { Bridge }           from '../network/Bridge.js';
import { Firewall, SecurityAppliance } from '../network/Firewall.js';
import { WirelessRouter, HomeGateway, WLC } from '../network/WirelessRouter.js';
import { DSLModem, CableModem, CellTower } from '../network/Modem.js';
import { Link }             from '../network/Link.js';
import { Device }           from '../network/Device.js';

export class TopologyBuilder {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   * @param {import('../engine/Canvas.js').Canvas} canvas
   */
  constructor(sim, canvas) {
    this.sim    = sim;
    this.canvas = canvas;

    this._selectedDevice = null;
    this._selectedLink   = null;

    this._bindEvents();
    this._initPalette();
  }

  // ──────────────────────────────────────────────────────────
  //  Palette drag init
  // ──────────────────────────────────────────────────────────
  _initPalette() {
    const items = document.querySelectorAll('.palette-item[data-type]');
    items.forEach(item => {
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('device-type', item.dataset.type);
        if (item.dataset.model) {
          e.dataTransfer.setData('device-model', item.dataset.model);
        }
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    // Draw palette preview icons
    const previews = document.querySelectorAll('.device-icon-preview[data-draw]');
    previews.forEach(canvas => {
      const { deviceRenderer } = this.canvas;
      const model = canvas.closest('.palette-item')?.dataset.model || canvas.dataset.model || '';
      deviceRenderer.drawPreview(canvas, canvas.dataset.draw, model);
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Event bus subscriptions
  // ──────────────────────────────────────────────────────────
  _bindEvents() {
    eventBus.on('device:drop', ({ type, model, world }) => this._placeDevice(type, { ...world, model }));
    eventBus.on('device:select', device => this._onSelectDevice(device));
    eventBus.on('device:deselect', () => this._onDeselect());
    eventBus.on('device:delete', device => this._deleteDevice(device));
    eventBus.on('device:moved', device => this.canvas.markDirty());
    eventBus.on('link:create', ({ src, dst, cableType }) => this._createLink(src, dst, cableType));
    eventBus.on('link:select', link => this._onSelectLink(link));
    eventBus.on('link:delete', link => this._deleteLink(link));
    eventBus.on('selection:delete', () => {
      if (this._selectedDevice) this._deleteDevice(this._selectedDevice);
      else if (this._selectedLink) this._deleteLink(this._selectedLink);
    });
    eventBus.on('canvas:fitAll', () => this.canvas.fitToDevices([...this.sim.devices.values()]));
    eventBus.on('tool:change', tool => {
      this._setActiveTool(tool);
    });

    // Tool buttons
    document.getElementById('tool-select')?.addEventListener('click', () => eventBus.emit('tool:change', 'select'));
    document.getElementById('tool-link')?.addEventListener('click',   () => eventBus.emit('tool:change', 'link'));
    document.getElementById('tool-delete')?.addEventListener('click', () => eventBus.emit('tool:change', 'delete'));
    document.getElementById('btn-clear')?.addEventListener('click', () => this._clearAll());
    document.getElementById('zoom-in')?.addEventListener('click',  () => this.canvas.zoom(1.2));
    document.getElementById('zoom-out')?.addEventListener('click', () => this.canvas.zoom(1 / 1.2));
    document.getElementById('zoom-fit')?.addEventListener('click', () =>
      this.canvas.fitToDevices([...this.sim.devices.values()])
    );
    eventBus.on('canvas:zoom', ({ scale }) => {
      const el = document.getElementById('zoom-val');
      if (el) el.textContent = Math.round(scale * 100) + '%';
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Device placement
  // ──────────────────────────────────────────────────────────
  _placeDevice(type, opts) {
    const device = this._createDevice(type, opts);
    this.sim.addDevice(device);
    this.canvas.setData(this.sim.devices, this.sim.links);
    this.canvas.markDirty();
    document.getElementById('canvas-hint')?.classList.add('hidden');
    eventBus.emit('topology:changed');
    return device;
  }

  _createDevice(type, opts = {}) {
    const m = (opts.model || '').toUpperCase();
    const t = (type || '').toLowerCase();

    const map = {
      router:           () => new Router(opts),
      switch:           () => new Switch(opts),
      l3switch:         () => new L3Switch({ ...opts, type: 'l3switch' }),
      pc:               () => new PC(opts),
      server:           () => (m.includes('CENTRAL') || m.includes('CO-SERVER')) ? new CentralOfficeServer(opts) : new Server(opts),
      coserver:         () => new CentralOfficeServer(opts),
      ap:               () => (m.includes('LAP') || m.includes('3702')) ? new LightweightAccessPoint(opts) : new AccessPoint(opts),
      lap:              () => new LightweightAccessPoint(opts),
      hub:              () => new Hub(opts),
      repeater:         () => new Repeater(opts),
      coaxialsplitter:  () => new CoAxialSplitter(opts),
      splitter:         () => new CoAxialSplitter(opts),
      bridge:           () => new Bridge(opts),
      firewall:         () => (m.includes('MERAKI') || m.includes('MX65')) ? new SecurityAppliance(opts) : new Firewall(opts),
      securityappliance:() => new SecurityAppliance(opts),
      wirelessrouter:   () => (m.includes('DLC') || m.includes('GATEWAY')) ? new HomeGateway(opts) : new WirelessRouter(opts),
      homegateway:      () => new HomeGateway(opts),
      wlc:              () => new WLC(opts),
      modem:            () => new DSLModem(opts),
      celltower:        () => new CellTower(opts),
      cloud:            () => new Cloud(opts),
    };
    return (map[t] || map.pc)();
  }

  // ──────────────────────────────────────────────────────────
  //  Link creation
  // ──────────────────────────────────────────────────────────
  _createLink(src, dst, cableType = 'straight') {
    // Pick the first available free interfaces
    const srcIface = this._pickFreeInterface(src);
    const dstIface = this._pickFreeInterface(dst);

    const type = (src.type === 'ap' || dst.type === 'ap') ? 'wireless' : 'ethernet';

    const link = new Link({
      sourceDeviceId:  src.id,
      sourceInterface: srcIface?.name || '',
      destDeviceId:    dst.id,
      destInterface:   dstIface?.name || '',
      type,
      cableType,
    });

    this.sim.addLink(link);
    this.canvas.setData(this.sim.devices, this.sim.links);
    this.canvas.markDirty();
    eventBus.emit('topology:changed');
  }

  _pickFreeInterface(device) {
    return device.interfaces.find(i => !i.connectedTo) || device.interfaces[0];
  }

  // ──────────────────────────────────────────────────────────
  //  Selection
  // ──────────────────────────────────────────────────────────
  _onSelectDevice(device) {
    this._selectedDevice = device;
    this._selectedLink   = null;
    eventBus.emit('panel:showDevice', device);
  }

  _onSelectLink(link) {
    this._selectedLink   = link;
    this._selectedDevice = null;
    eventBus.emit('panel:showLink', link);
  }

  _onDeselect() {
    this._selectedDevice = null;
    this._selectedLink   = null;
    eventBus.emit('panel:clear');
  }

  // ──────────────────────────────────────────────────────────
  //  Deletion
  // ──────────────────────────────────────────────────────────
  _deleteDevice(device) {
    this.sim.removeDevice(device.id);
    this._selectedDevice = null;
    this.canvas.setSelectedDevice(null);
    this.canvas.setData(this.sim.devices, this.sim.links);
    this.canvas.markDirty();
    eventBus.emit('panel:clear');
    eventBus.emit('topology:changed');
  }

  _deleteLink(link) {
    this.sim.removeLink(link.id);
    this._selectedLink = null;
    this.canvas.setSelectedLink(null);
    this.canvas.setData(this.sim.devices, this.sim.links);
    this.canvas.markDirty();
    eventBus.emit('topology:changed');
  }

  _clearAll() {
    if (!confirm('Clear all devices and links?')) return;
    this.sim.devices.clear();
    this.sim.links.clear();
    this._selectedDevice = null;
    this._selectedLink   = null;
    this.canvas.setSelectedDevice(null);
    this.canvas.setSelectedLink(null);
    this.canvas.setData(this.sim.devices, this.sim.links);
    this.canvas.markDirty();
    eventBus.emit('panel:clear');
    eventBus.emit('topology:changed');
  }

  // ──────────────────────────────────────────────────────────
  //  Tool toggling
  // ──────────────────────────────────────────────────────────
  _setActiveTool(tool) {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById(`tool-${tool}`);
    if (el) el.classList.add('active');
  }

  // ──────────────────────────────────────────────────────────
  //  Load a pre-built topology from level JSON
  // ──────────────────────────────────────────────────────────
  loadTopology(data) {
    this.sim.loadJSON(data, obj => this._createDevice(obj.type, obj));
    this.canvas.setData(this.sim.devices, this.sim.links);
    this.canvas.fitToDevices([...this.sim.devices.values()]);
    document.getElementById('canvas-hint')?.classList.add('hidden');
    eventBus.emit('topology:changed');
  }
}
