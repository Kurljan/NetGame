// src/network/Device.js
// Base class for all network devices (Router, Switch, PC, etc.)

let _idCounter = 1;

export class Device {
  /**
   * @param {string} type   - 'router' | 'switch' | 'l3switch' | 'pc' | 'server' | 'ap' | 'cloud' | 'hub' | 'bridge' | 'firewall' | 'wirelessrouter' | 'wlc' | 'modem' | 'celltower'
   * @param {Object} opts   - { hostname, x, y, interfaces, model }
   */
  constructor(type, opts = {}) {
    this.id         = opts.id || `${type}-${_idCounter++}`;
    this.type       = type;
    this.model      = opts.model || Device.defaultModel(type);
    this.hostname   = opts.hostname || Device.defaultHostname(type, this.id);
    this.x          = opts.x ?? 300;
    this.y          = opts.y ?? 200;

    /** @type {Interface[]} */
    this.interfaces = opts.interfaces ? opts.interfaces.map(i => new Interface(i)) : [];

    // Extra per-type config
    this.config     = opts.config || {};
  }

  // ── Static helpers ──────────────────────────────────────────
  static defaultModel(type) {
    const map = {
      router:          '1941',
      switch:          '2960-24TT',
      l3switch:        '3560-24PS',
      pc:              'PC-PT',
      server:          'Server-PT',
      ap:              'AP-PT',
      hub:             'Hub-PT',
      repeater:        'Repeater-PT',
      coaxialsplitter: 'CoAxialSplitter-PT',
      splitter:        'CoAxialSplitter-PT',
      bridge:          'PT-Bridge',
      firewall:        'ASA-5506-X',
      wirelessrouter:  'WRT300N',
      wlc:             'WLC-2504',
      modem:           'DSL-Modem',
      celltower:       'Cell-Tower',
      cloud:           'Cloud-PT',
    };
    return map[type] || type;
  }

  static defaultHostname(type, id) {
    const map = {
      router:          'Router',
      switch:          'Switch',
      l3switch:        'L3-SW',
      pc:              'PC',
      server:          'Server',
      ap:              'AP',
      hub:             'Hub',
      repeater:        'Repeater',
      coaxialsplitter: 'Coaxial Splitter',
      splitter:        'Coaxial Splitter',
      bridge:          'Bridge',
      firewall:        'ASA',
      wirelessrouter:  'WirelessRouter',
      wlc:             'WLC',
      modem:           'Modem',
      celltower:       'CellTower',
      cloud:           'Internet',
    };
    const base = map[type] || type;
    const num  = id.split('-').pop();
    return `${base}${num}`;
  }

  /** Returns the first interface with a configured IP that is 'up'. */
  get primaryInterface() {
    return this.interfaces.find(i => i.ipAddress && i.status === 'up') || null;
  }

  /** Returns all up interfaces. */
  get activeInterfaces() {
    return this.interfaces.filter(i => i.status === 'up' && i.ipAddress);
  }

  /** Serialise to plain object for save/load. */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      model: this.model,
      hostname: this.hostname,
      x: this.x,
      y: this.y,
      interfaces: this.interfaces.map(i => i.toJSON()),
      config: this.config,
    };
  }

  /** Restore from plain object. */
  static fromJSON(obj) {
    const DeviceClass = Device._typeMap[obj.type] || Device;
    return new DeviceClass(obj.type, obj);
  }

  static registerType(type, cls) {
    if (!Device._typeMap) Device._typeMap = {};
    Device._typeMap[type] = cls;
  }
}
Device._typeMap = {};

// ────────────────────────────────────────────────────────────────
//  Interface — a single network port on a device
// ────────────────────────────────────────────────────────────────
export class Interface {
  constructor(opts = {}) {
    this.id          = opts.id   || opts.name || 'iface';
    this.name        = opts.name || 'GigabitEthernet0/0';
    this.shortName   = opts.shortName || this._abbreviate(opts.name || '');
    this.ipAddress   = opts.ipAddress   || '';
    this.subnetMask  = opts.subnetMask  || '';
    this.status      = opts.status      || 'down';    // 'up' | 'down'
    this.vlanId      = opts.vlanId      ?? null;      // for switch access ports
    this.trunkMode   = opts.trunkMode   ?? false;
    this.allowedVlans= opts.allowedVlans ?? [];
    this.macAddress  = opts.macAddress  || Interface.randomMac();
    this.connectedTo = opts.connectedTo || null;      // linkId
    this.description = opts.description || '';

    // Advanced hardware settings (Auto-MDIX, speed, duplex, PoE, LED status)
    this.autoMdix    = opts.autoMdix    ?? true;       // Auto-MDIX toggle
    this.speed       = opts.speed       || 'auto';     // 'auto'|'10'|'100'|'1000'|'10000'
    this.duplex      = opts.duplex      || 'auto';     // 'auto'|'half'|'full'
    this.poe         = opts.poe         ?? false;      // Power over Ethernet
    this.ledStatus   = opts.ledStatus   || (this.status === 'up' ? 'green' : 'red'); // 'green'|'amber'|'red'|'off'|'blinking'
  }

  _abbreviate(name) {
    return name
      .replace('TenGigabitEthernet', 'Te')
      .replace('GigabitEthernet',    'G')
      .replace('FastEthernet',       'Fa')
      .replace('Serial',             'Se')
      .replace('Loopback',           'Lo')
      .replace('Vlan',               'Vl')
      .replace('Coaxial',            'Coax');
  }

  static randomMac() {
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    return `AA:BB:${hex()}:${hex()}:${hex()}:${hex()}`;
  }

  /** True if this interface has a valid IP and mask. */
  get hasIp() { return this.ipAddress && this.subnetMask; }

  toJSON() {
    return {
      id: this.id, name: this.name, shortName: this.shortName,
      ipAddress: this.ipAddress, subnetMask: this.subnetMask,
      status: this.status, vlanId: this.vlanId,
      trunkMode: this.trunkMode, allowedVlans: this.allowedVlans,
      macAddress: this.macAddress, connectedTo: this.connectedTo,
      description: this.description,
      autoMdix: this.autoMdix, speed: this.speed, duplex: this.duplex,
      poe: this.poe, ledStatus: this.ledStatus,
    };
  }
}
