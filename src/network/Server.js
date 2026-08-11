// src/network/Server.js
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class Server extends Device {
  constructor(opts = {}) {
    super(opts.type || 'server', opts);
    this.defaultGateway = opts.config?.defaultGateway || '';
    this.dhcpPools      = opts.config?.dhcpPools || [];
    this.dnsRecords     = opts.config?.dnsRecords || [];  // [{name, ip}]

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'FastEthernet0', shortName: 'Fa0', status: 'down' }),
        ];
      }
    }
  }

  /** Add a DHCP pool: { network, mask, start, end, gateway, dns } */
  addDhcpPool(pool) { this.dhcpPools.push(pool); }
  removeDhcpPool(index) { this.dhcpPools.splice(index, 1); }

  /** Add a DNS record */
  addDnsRecord(name, ip) { this.dnsRecords.push({ name, ip }); }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        defaultGateway: this.defaultGateway,
        dhcpPools: this.dhcpPools,
        dnsRecords: this.dnsRecords,
      },
    };
  }
}
Device.registerType('server', Server);

// ── Central Office Server ───────────────────────────────────────
export class CentralOfficeServer extends Server {
  constructor(opts = {}) {
    super({
      ...opts,
      type: 'coserver',
      model: opts.model || 'Central-Office-Server',
    });
    this.cellularGateway = opts.config?.cellularGateway || '10.0.0.1';
    this.iotRegistration = opts.config?.iotRegistration ?? true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ...this.config,
        cellularGateway: this.cellularGateway,
        iotRegistration: this.iotRegistration,
      }
    };
  }
}
Device.registerType('coserver', CentralOfficeServer);

// ── Cloud (simulated Internet) ──────────────────────────────────
export class Cloud extends Device {
  constructor(opts = {}) {
    super('cloud', opts);
    this.hostname = opts.hostname || 'Internet';
    if (this.interfaces.length === 0) {
      this.interfaces = [
        new Interface({ name: 'ISP-Link', shortName: 'ISP', status: 'up', ipAddress: '203.0.113.1', subnetMask: '255.255.255.0' }),
      ];
    }
  }
}
Device.registerType('cloud', Cloud);

