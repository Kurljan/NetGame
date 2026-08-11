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
    this.hostname   = opts.hostname || Device.defaultHostname(type, this.id, this.model);
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
      coserver:        'Central-Office-Server',
      ap:              'AccessPoint-PT',
      lap:             'LAP-PT',
      hub:             'Hub-PT',
      repeater:        'Repeater-PT',
      coaxialsplitter: 'CoAxialSplitter-PT',
      splitter:        'CoAxialSplitter-PT',
      bridge:          'PT-Bridge',
      firewall:        'ASA-5506-X',
      securityappliance:'Meraki-MX65W',
      wirelessrouter:  'HomeRouter-PT-AC',
      homegateway:     'DLC100',
      wlc:             'WLC-PT',
      modem:           'DSL-Modem',
      celltower:       'Cell-Tower',
      cloud:           'Cloud-PT',
    };
    return map[type] || type;
  }

  static defaultHostname(type, id, model = '') {
    const num = Math.max(0, parseInt(id.split('-').pop() || '1', 10) - 1);
    const m = (model || '').toUpperCase();

    if (m.includes('MERAKI') || m.includes('MX65') || type === 'securityappliance') {
      return `Security Appliance${num}`;
    }
    if (m.includes('HOMEROUTER') || m.includes('WRT300N') || (type === 'wirelessrouter' && !m.includes('DLC') && !m.includes('GATEWAY'))) {
      return `Wireless Router${num}`;
    }
    if (m.includes('DLC') || m.includes('GATEWAY') || type === 'homegateway') {
      return `Home Gateway${num}`;
    }
    if (m.includes('CENTRAL') || m.includes('CO-SERVER') || type === 'coserver') {
      return `Central Office Server${num}`;
    }
    if (m.includes('LAP') || m.includes('3702') || m.includes('1130') || type === 'lap') {
      return `Light Weight Access Point${num}`;
    }
    if (m.includes('ACCESSPOINT') || m.includes('AP-') || type === 'ap') {
      return `Access Point${num}`;
    }
    if (m.includes('WLC') || type === 'wlc') {
      return `Wireless LAN Controller${num}`;
    }
    if (m.includes('CELL-TOWER') || m.includes('CELLTOWER') || type === 'celltower') {
      return `Cell Tower${num}`;
    }
    if (type === 'firewall' || m.includes('ASA')) {
      return `Firewall${num}`;
    }

    const map = {
      router:          'Router',
      switch:          'Switch',
      l3switch:        'Multilayer Switch',
      pc:              'PC',
      server:          'Server',
      ap:              'Access Point',
      hub:             'Hub',
      repeater:        'Repeater',
      coaxialsplitter: 'Coaxial Splitter',
      splitter:        'Coaxial Splitter',
      bridge:          'Bridge',
      firewall:        'ASA',
      wirelessrouter:  'Wireless Router',
      wlc:             'Wireless LAN Controller',
      modem:           'Modem',
      celltower:       'Cell Tower',
      cloud:           'Internet',
    };
    const base = map[type] || type;
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
    this.ipv6Address = opts.ipv6Address || '';
    this.ipv6Prefix  = opts.ipv6Prefix  ?? 64;
    this.ipv6LinkLocal= opts.ipv6LinkLocal || this._generateLinkLocal(opts.macAddress);
    this.ipv6Gateway = opts.ipv6Gateway || '';
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

  _generateLinkLocal(mac) {
    if (!mac) return 'fe80::1';
    try {
      const clean = mac.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
      if (clean.length === 12) {
        const b0 = (parseInt(clean.slice(0, 2), 16) ^ 0x02).toString(16).padStart(2, '0');
        return `fe80::${b0}${clean.slice(2, 4)}:${clean.slice(4, 6)}ff:fe${clean.slice(6, 8)}:${clean.slice(8, 12)}`;
      }
    } catch { }
    return 'fe80::1';
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
  get hasIp() { return !!(this.ipAddress && this.subnetMask); }

  /** True if this interface has a valid IPv6 address. */
  get hasIPv6() { return !!(this.ipv6Address && this.ipv6Prefix); }

  toJSON() {
    return {
      id: this.id, name: this.name, shortName: this.shortName,
      ipAddress: this.ipAddress, subnetMask: this.subnetMask,
      ipv6Address: this.ipv6Address, ipv6Prefix: this.ipv6Prefix,
      ipv6LinkLocal: this.ipv6LinkLocal, ipv6Gateway: this.ipv6Gateway,
      status: this.status, vlanId: this.vlanId,
      trunkMode: this.trunkMode, allowedVlans: this.allowedVlans,
      macAddress: this.macAddress, connectedTo: this.connectedTo,
      description: this.description,
      autoMdix: this.autoMdix, speed: this.speed, duplex: this.duplex,
      poe: this.poe, ledStatus: this.ledStatus,
    };
  }
}
