// src/network/WirelessRouter.js
// Wireless Router (Linksys WRT300N) & Wireless LAN Controller (WLC 2504 / 3504)
import { Device, Interface } from './Device.js';
import { RoutingTable } from '../routing/RoutingTable.js';
import { getModelSpec } from './DeviceModels.js';

export class WirelessRouter extends Device {
  constructor(opts = {}) {
    super('wirelessrouter', opts);
    this.routingTable = new RoutingTable(opts.routingTable || []);
    this.ssid         = opts.config?.ssid     || 'Default-WiFi';
    this.security     = opts.config?.security || 'WPA2';
    this.passphrase   = opts.config?.passphrase || 'cisco123';
    this.dhcpEnabled  = opts.config?.dhcpEnabled ?? true;

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'Internet', shortName: 'WAN', status: 'down' }),
          new Interface({ name: 'Ethernet1', shortName: 'LAN1', status: 'down' }),
          new Interface({ name: 'Ethernet2', shortName: 'LAN2', status: 'down' }),
          new Interface({ name: 'Ethernet3', shortName: 'LAN3', status: 'down' }),
          new Interface({ name: 'Ethernet4', shortName: 'LAN4', status: 'down' }),
          new Interface({ name: 'Wireless',  shortName: 'WiFi', status: 'down' }),
        ];
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      routingTable: this.routingTable.toJSON(),
      config: {
        ssid: this.ssid,
        security: this.security,
        passphrase: this.passphrase,
        dhcpEnabled: this.dhcpEnabled,
      },
    };
  }
}
Device.registerType('wirelessrouter', WirelessRouter);

export class WLC extends Device {
  constructor(opts = {}) {
    super('wlc', opts);
    this.managementIp = opts.config?.managementIp || '';
    this.apList       = opts.config?.apList       || [];

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        for (let i = 1; i <= 4; i++) {
          this.interfaces.push(new Interface({
            name: `GigabitEthernet0/${i}`,
            shortName: `G0/${i}`,
            status: 'down'
          }));
        }
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        managementIp: this.managementIp,
        apList: this.apList,
      },
    };
  }
}
Device.registerType('wlc', WLC);
