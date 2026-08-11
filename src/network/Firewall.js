// src/network/Firewall.js
// Cisco ASA Adaptive Security Appliance (ASA 5505, ASA 5506-X) & Meraki MX Security Appliance (Meraki-MX65W)
import { Device, Interface } from './Device.js';
import { RoutingTable } from '../routing/RoutingTable.js';
import { getModelSpec } from './DeviceModels.js';

export class Firewall extends Device {
  constructor(opts = {}) {
    super(opts.type || 'firewall', opts);
    this.routingTable = new RoutingTable(opts.routingTable || []);
    this.securityZones = opts.config?.securityZones || {
      'inside': { securityLevel: 100 },
      'outside': { securityLevel: 0 },
      'dmz': { securityLevel: 50 },
    };
    this.inspectRules = opts.config?.inspectRules || ['icmp', 'tcp', 'udp'];

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        for (let i = 0; i < 8; i++) {
          this.interfaces.push(new Interface({
            name: `GigabitEthernet1/${i + 1}`,
            shortName: `G1/${i + 1}`,
            status: 'down'
          }));
        }
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      routingTable: this.routingTable.toJSON(),
      config: {
        securityZones: this.securityZones,
        inspectRules: this.inspectRules,
      },
    };
  }
}
Device.registerType('firewall', Firewall);

export class SecurityAppliance extends Firewall {
  constructor(opts = {}) {
    super({
      ...opts,
      type: 'securityappliance',
      model: opts.model || 'Meraki-MX65W',
    });
    this.cloudManaged = opts.config?.cloudManaged ?? true;
    this.autoVpn     = opts.config?.autoVpn      ?? true;
    this.ssid        = opts.config?.ssid         || 'Meraki-Corp-WiFi';
    this.passphrase  = opts.config?.passphrase   || 'meraki123';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ...this.config,
        cloudManaged: this.cloudManaged,
        autoVpn: this.autoVpn,
        ssid: this.ssid,
        passphrase: this.passphrase,
      }
    };
  }
}
Device.registerType('securityappliance', SecurityAppliance);

