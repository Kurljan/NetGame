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

// ── CyberObserver Platform (Continuous Posture & Telemetry) ────
export class CyberObserver extends Server {
  constructor(opts = {}) {
    super({
      ...opts,
      type: opts.type || 'cyberobserver',
      model: opts.model || 'CyberObserver',
    });
    this.postureScore    = opts.config?.postureScore    ?? 94;
    this.complianceMode  = opts.config?.complianceMode  || 'NIST CSF / ISO 27001 / CIS';
    this.telemetrySensor = opts.config?.telemetrySensor ?? true;
    this.monitoredDevices= opts.config?.monitoredDevices|| [];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ...this.config,
        postureScore: this.postureScore,
        complianceMode: this.complianceMode,
        telemetrySensor: this.telemetrySensor,
        monitoredDevices: this.monitoredDevices,
      }
    };
  }
}
Device.registerType('cyberobserver', CyberObserver);

// ── Cloud (simulated Internet & WAN) ────────────────────────────
export class Cloud extends Device {
  constructor(opts = {}) {
    super('cloud', {
      ...opts,
      model: opts.model || 'Cloud-PT',
    });
    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else if (this.model && this.model.includes('Empty')) {
        this.interfaces = [];
      } else {
        this.interfaces = [
          new Interface({ name: 'Ethernet6', shortName: 'Eth6', status: 'down' }),
          new Interface({ name: 'Serial0',   shortName: 'Se0',  status: 'down' }),
          new Interface({ name: 'Serial1',   shortName: 'Se1',  status: 'down' }),
          new Interface({ name: 'Modem4',    shortName: 'Mod4', status: 'down' }),
          new Interface({ name: 'Modem5',    shortName: 'Mod5', status: 'down' }),
          new Interface({ name: 'Coaxial7',  shortName: 'Coax7', status: 'down' }),
        ];
      }
    }
  }
}
Device.registerType('cloud', Cloud);

// ── Meraki Cloud Dashboard Server ───────────────────────────────
export class MerakiServer extends Server {
  constructor(opts = {}) {
    super({
      ...opts,
      type: 'server',
      model: opts.model || 'Meraki-Server',
    });
    this.dashboardOrg = opts.config?.dashboardOrg || 'Enterprise Organization';
    this.autoVpn = opts.config?.autoVpn ?? true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ...this.config,
        dashboardOrg: this.dashboardOrg,
        autoVpn: this.autoVpn,
      }
    };
  }
}

// ── Cisco DNA / Network Controller (SDN Controller) ─────────────
export class NetworkController extends Server {
  constructor(opts = {}) {
    super({
      ...opts,
      type: 'server',
      model: opts.model || 'NetworkController',
    });
    this.restApiEnabled = opts.config?.restApiEnabled ?? true;
    this.controllerStatus = opts.config?.controllerStatus || 'active';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ...this.config,
        restApiEnabled: this.restApiEnabled,
        controllerStatus: this.controllerStatus,
      }
    };
  }
}

