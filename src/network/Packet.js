// src/network/Packet.js
// Represents a network packet traveling through the simulation.
// Contains full OSI layer data for the Packet Inspector.

let _pktId = 1;

export class Packet {
  /**
   * @param {Object} opts
   */
  constructor(opts = {}) {
    this.id       = `pkt-${_pktId++}`;
    this.protocol = opts.protocol || 'ICMP';  // ICMP | TCP | UDP | ARP
    this.type     = opts.type     || 'echo-request';

    // L3
    this.srcIp    = opts.srcIp  || '';
    this.dstIp    = opts.dstIp  || '';
    this.ttl      = opts.ttl    ?? 64;

    // L2 (updated at each hop)
    this.srcMac   = opts.srcMac || '';
    this.dstMac   = opts.dstMac || '';
    this.vlanTag  = opts.vlanTag || null;

    // L4
    this.srcPort  = opts.srcPort || (this.protocol === 'ICMP' ? 0 : this._ephemeralPort());
    this.dstPort  = opts.dstPort || Packet.defaultPort(opts.protocol);

    // L7 payload
    this.payload  = opts.payload || this._defaultPayload();

    // Simulation metadata (not part of the "real" packet)
    this._srcDeviceId = opts.srcDeviceId || '';
    this._dstDeviceId = opts.dstDeviceId || '';
    this._path        = [];   // [{deviceId, action, reason}] — filled during simulation
    this._result      = null; // 'success' | 'failure'
    this._errorReason = '';
    this._hopLog      = [];   // per-hop OSI details
  }

  // ──────────────────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────────────────
  _ephemeralPort() { return Math.floor(Math.random() * (65535 - 49152) + 49152); }

  _defaultPayload() {
    const map = {
      ICMP: 'ICMP Echo Request (32 bytes data)',
      TCP:  'TCP SYN',
      UDP:  'DNS Query',
      ARP:  'Who has this IP? Tell me.',
    };
    return map[this.protocol] || '';
  }

  static defaultPort(proto) {
    const ports = { TCP: 80, UDP: 53, ICMP: 0 };
    return ports[proto] || 0;
  }

  // ──────────────────────────────────────────────────────────
  //  OSI layer snapshot at a specific hop
  // ──────────────────────────────────────────────────────────
  /**
   * Records the OSI layer state at a given hop device.
   */
  recordHop(device, action, details = {}) {
    this._hopLog.push({
      deviceId:   device.id,
      hostname:   device.hostname,
      deviceType: device.type,
      action,
      ...details,
      srcMac:  this.srcMac,
      dstMac:  this.dstMac,
      srcIp:   this.srcIp,
      dstIp:   this.dstIp,
      ttl:     this.ttl,
      vlanTag: this.vlanTag,
    });
  }

  /**
   * Build the full OSI layer display for the PacketInspector.
   * Uses the final-hop state.
   */
  buildOsiLayers() {
    return [
      {
        layer: 7, name: 'Application',
        proto: this.protocol === 'TCP' ? 'HTTP' : this.protocol === 'UDP' ? 'DNS' : 'ICMP',
        fields: [
          { label: 'Data',     value: this.payload },
          { label: 'Protocol', value: this.protocol },
        ],
      },
      {
        layer: 4, name: 'Transport',
        proto: this.protocol === 'ICMP' ? 'N/A' : this.protocol,
        fields: this.protocol === 'ICMP' ? [
          { label: 'Type',   value: '8 (Echo Request)' },
          { label: 'Code',   value: '0' },
          { label: 'Seq',    value: '1' },
        ] : [
          { label: 'Src Port', value: String(this.srcPort) },
          { label: 'Dst Port', value: String(this.dstPort) },
          { label: 'Flags',    value: this.type },
        ],
      },
      {
        layer: 3, name: 'Network',
        proto: 'IPv4',
        fields: [
          { label: 'Src IP',  value: this.srcIp,    color: 'cyan' },
          { label: 'Dst IP',  value: this.dstIp,    color: 'green' },
          { label: 'TTL',     value: String(this.ttl) },
          { label: 'Protocol',value: this.protocol },
        ],
      },
      {
        layer: 2, name: 'Data Link',
        proto: 'Ethernet II' + (this.vlanTag ? ` / 802.1Q VLAN ${this.vlanTag}` : ''),
        fields: [
          { label: 'Src MAC',  value: this.srcMac,  color: 'orange' },
          { label: 'Dst MAC',  value: this.dstMac,  color: 'orange' },
          ...(this.vlanTag ? [{ label: 'VLAN Tag', value: String(this.vlanTag), color: 'cyan' }] : []),
          { label: 'Type',     value: '0x0800 (IPv4)' },
        ],
      },
      {
        layer: 1, name: 'Physical',
        proto: 'Ethernet',
        fields: [
          { label: 'Medium', value: 'FastEthernet / 100 Mbps' },
          { label: 'Signal', value: 'Digital' },
        ],
      },
    ];
  }
}
