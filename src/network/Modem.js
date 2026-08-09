// src/network/Modem.js
// DSL Modem, Cable Modem, Cell Tower
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class Modem extends Device {
  constructor(type, opts = {}) {
    super(type, opts);

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'Ethernet0', shortName: 'Eth0', status: 'down' }),
          new Interface({ name: 'Port1',     shortName: 'Line', status: 'down' }),
        ];
      }
    }
  }
}

export class DSLModem extends Modem {
  constructor(opts = {}) {
    super('modem', { ...opts, model: opts.model || 'DSL-Modem' });
  }
}
Device.registerType('modem', DSLModem);

export class CableModem extends Modem {
  constructor(opts = {}) {
    super('modem', { ...opts, model: opts.model || 'Cable-Modem' });
  }
}

export class CellTower extends Device {
  constructor(opts = {}) {
    super('celltower', { ...opts, model: opts.model || 'Cell-Tower' });

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'Backbone0', shortName: 'Backbone', status: 'down' }),
          new Interface({ name: 'Cellular0', shortName: 'Cell', status: 'down' }),
        ];
      }
    }
  }
}
Device.registerType('celltower', CellTower);
