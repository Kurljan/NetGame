// src/network/Repeater.js
// Layer 1 Physical Signal Repeater (Repeater-PT)
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class Repeater extends Device {
  constructor(opts = {}) {
    super('repeater', opts);

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'FastEthernet0', shortName: 'Fa0', status: 'down', speed: '100', duplex: 'half' }),
          new Interface({ name: 'FastEthernet1', shortName: 'Fa1', status: 'down', speed: '100', duplex: 'half' })
        ];
      }
    }
  }
}
Device.registerType('repeater', Repeater);
