// src/network/CoAxialSplitter.js
// Layer 1 Passive Coaxial RF Signal Splitter (CoAxialSplitter-PT)
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class CoAxialSplitter extends Device {
  constructor(opts = {}) {
    super('coaxialsplitter', opts);

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'Port0', shortName: 'Port0', status: 'down', speed: '10', duplex: 'half' }),
          new Interface({ name: 'Port1', shortName: 'Port1', status: 'down', speed: '10', duplex: 'half' }),
          new Interface({ name: 'Port2', shortName: 'Port2', status: 'down', speed: '10', duplex: 'half' })
        ];
      }
    }
  }
}
Device.registerType('coaxialsplitter', CoAxialSplitter);
Device.registerType('splitter', CoAxialSplitter);
