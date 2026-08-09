// src/network/Hub.js
// Layer 1 Repeater Hub (PT-Hub, Coaxial Hub)
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class Hub extends Device {
  constructor(opts = {}) {
    super('hub', opts);

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        for (let i = 0; i < 6; i++) {
          this.interfaces.push(new Interface({
            name: `FastEthernet0/${i}`,
            shortName: `Fa0/${i}`,
            status: 'down',
            speed: '100',
            duplex: 'half'
          }));
        }
      }
    }
  }
}
Device.registerType('hub', Hub);
