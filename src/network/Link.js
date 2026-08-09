// src/network/Link.js
// Represents a cable or wireless connection between two devices.

let _linkId = 1;

export class Link {
  /**
   * @param {Object} opts
   * @param {string} opts.sourceDeviceId
   * @param {string} opts.sourceInterface   - Interface name
   * @param {string} opts.destDeviceId
   * @param {string} opts.destInterface
   * @param {string} [opts.type]            - 'ethernet' | 'serial' | 'wireless'
   * @param {string} [opts.cableType]       - 'straight'|'crossover'|'fiber'|'serial-dce'|'serial-dte'|'console'|'coaxial'|'phone'|'wireless'
   * @param {number} [opts.clockRate]       - e.g. 64000
   * @param {string} [opts.label]           - e.g. '100 Mbps'
   * @param {string} [opts.status]          - 'up' | 'down' | 'mdix-error'
   */
  constructor(opts = {}) {
    this.id              = opts.id || `link-${_linkId++}`;
    this.sourceDeviceId  = opts.sourceDeviceId  || '';
    this.sourceInterface = opts.sourceInterface || '';
    this.destDeviceId    = opts.destDeviceId    || '';
    this.destInterface   = opts.destInterface   || '';
    this.type            = opts.type      || 'ethernet';
    this.cableType       = opts.cableType || (opts.type === 'wireless' ? 'wireless' : 'straight');
    this.clockRate       = opts.clockRate || 64000;
    this.label           = opts.label     || '';
    this.status          = opts.status    || 'up';
  }

  /** Return the other device ID given one side. */
  other(deviceId) {
    return deviceId === this.sourceDeviceId ? this.destDeviceId : this.sourceDeviceId;
  }

  /** True if this link connects the two given device IDs (in any order). */
  connects(a, b) {
    return (this.sourceDeviceId === a && this.destDeviceId === b) ||
           (this.sourceDeviceId === b && this.destDeviceId === a);
  }

  toJSON() {
    return {
      id: this.id,
      sourceDeviceId:  this.sourceDeviceId,
      sourceInterface: this.sourceInterface,
      destDeviceId:    this.destDeviceId,
      destInterface:   this.destInterface,
      type:      this.type,
      cableType: this.cableType,
      clockRate: this.clockRate,
      label:     this.label,
      status:    this.status,
    };
  }

  static fromJSON(obj) { return new Link(obj); }
}
