// src/network/WirelessRouter.js
// Wireless Router (HomeRouter-PT-AC, Linksys WRT300N), Home Gateway (DLC100) & Wireless LAN Controller (WLC-PT, 2504, 3504)
import { Device, Interface } from './Device.js';
import { RoutingTable } from '../routing/RoutingTable.js';
import { getModelSpec } from './DeviceModels.js';

export class WirelessRouter extends Device {
  constructor(opts = {}) {
    super(opts.type || 'wirelessrouter', opts);
    this.routingTable = new RoutingTable(opts.routingTable || []);
    this.ssid         = opts.config?.ssid         || 'Default-WiFi';
    this.ssid5g       = opts.config?.ssid5g       || 'Default-WiFi-5G';
    this.security     = opts.config?.security     || 'WPA2';
    this.passphrase   = opts.config?.passphrase   || 'cisco123';
    this.dhcpEnabled  = opts.config?.dhcpEnabled  ?? true;
    this.natEnabled   = opts.config?.natEnabled   ?? true;

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
          new Interface({ name: 'Wireless 2.4GHz', shortName: 'WiFi-2.4G', status: 'down' }),
          new Interface({ name: 'Wireless 5GHz',   shortName: 'WiFi-5G',   status: 'down' }),
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
        ssid5g: this.ssid5g,
        security: this.security,
        passphrase: this.passphrase,
        dhcpEnabled: this.dhcpEnabled,
        natEnabled: this.natEnabled,
      },
    };
  }
}
Device.registerType('wirelessrouter', WirelessRouter);

export class HomeGateway extends WirelessRouter {
  constructor(opts = {}) {
    super({
      ...opts,
      type: 'homegateway',
      model: opts.model || 'DLC100',
    });
    this.iotServerEnabled = opts.config?.iotServerEnabled ?? true;
    this.iotPort          = opts.config?.iotPort || 80;
    this.registeredIoT    = opts.config?.registeredIoT || [];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ...this.config,
        iotServerEnabled: this.iotServerEnabled,
        iotPort: this.iotPort,
        registeredIoT: this.registeredIoT,
      }
    };
  }
}
Device.registerType('homegateway', HomeGateway);

export class WLC extends Device {
  constructor(opts = {}) {
    super('wlc', { ...opts, model: opts.model || 'WLC-PT' });
    this.managementIp = opts.config?.managementIp || '192.168.1.254';
    this.subnetMask   = opts.config?.subnetMask   || '255.255.255.0';
    this.defaultGateway = opts.config?.defaultGateway || '192.168.1.1';
    this.apList       = opts.config?.apList       || []; // registered LAPs
    this.wlans        = opts.config?.wlans        || [
      { id: 1, ssid: 'Corp-WLAN', security: 'WPA2-Enterprise', vlan: 10, status: 'enabled' },
      { id: 2, ssid: 'Guest-WiFi', security: 'Open', vlan: 20, status: 'enabled' }
    ];

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'Management0', shortName: 'Mgmt0', status: 'down', ipAddress: this.managementIp, subnetMask: this.subnetMask }),
          new Interface({ name: 'GigabitEthernet0/1', shortName: 'G0/1', status: 'down' }),
          new Interface({ name: 'GigabitEthernet0/2', shortName: 'G0/2', status: 'down' }),
        ];
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        managementIp: this.managementIp,
        subnetMask: this.subnetMask,
        defaultGateway: this.defaultGateway,
        apList: this.apList,
        wlans: this.wlans,
      },
    };
  }
}
Device.registerType('wlc', WLC);

