// src/network/Bridge.js
// Layer 2 2-port Bridge (PT-Bridge)
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class Bridge extends Device {
  constructor(opts = {}) {
    super('bridge', opts);
    this.macTable = new Map(Object.entries(opts.macTable || {}));

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'FastEthernet0/1', shortName: 'Fa0/1', status: 'down' }),
          new Interface({ name: 'FastEthernet0/2', shortName: 'Fa0/2', status: 'down' }),
        ];
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      macTable: Object.fromEntries(this.macTable),
    };
  }
}
Device.registerType('bridge', Bridge);
