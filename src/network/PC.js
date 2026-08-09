// src/network/PC.js
import { Device, Interface } from './Device.js';

export class PC extends Device {
  constructor(opts = {}) {
    super('pc', opts);
    this.defaultGateway = opts.config?.defaultGateway || '';
    this.dnsServer      = opts.config?.dnsServer      || '';
    this.dhcpEnabled    = opts.config?.dhcpEnabled    ?? false;

    if (this.interfaces.length === 0) {
      this.interfaces = [
        new Interface({ name: 'FastEthernet0', shortName: 'Fa0', status: 'down' }),
      ];
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
