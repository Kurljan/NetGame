// src/network/PC.js
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class PC extends Device {
  constructor(opts = {}) {
    super('pc', { ...opts, model: opts.model || 'PC-PT' });
    this.defaultGateway = opts.config?.defaultGateway || '';
    this.dnsServer      = opts.config?.dnsServer      || '';
    this.dhcpEnabled    = opts.config?.dhcpEnabled    ?? false;

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces && spec.interfaces.length > 0) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'FastEthernet0', shortName: 'Fa0', status: 'down' }),
        ];
      }
    }
  }

  get ipAddress() {
    return this.interfaces[0]?.ipAddress || '';
  }
  get subnetMask() {
    return this.interfaces[0]?.subnetMask || '';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        defaultGateway: this.defaultGateway,
        dnsServer: this.dnsServer,
        dhcpEnabled: this.dhcpEnabled,
      },
    };
  }
}
Device.registerType('pc', PC);
