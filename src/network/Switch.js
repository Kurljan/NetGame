import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class Switch extends Device {
  constructor(opts = {}) {
    super('switch', opts);
    /** @type {Map<string, string>} mac → portName */
    this.macTable     = new Map(Object.entries(opts.macTable || {}));
    /** @type {Object[]} { id, name } */
    this.vlans        = opts.vlans || [{ id: 1, name: 'default' }];
    this.stpEnabled   = opts.config?.stpEnabled ?? true;
    this.stpRoot      = opts.config?.stpRoot    ?? false;
    this.stpPriority  = opts.config?.stpPriority ?? 32768;

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        // Fallback: 8 FastEthernet ports + 1 uplink GE
        for (let i = 0; i <= 7; i++) {
          this.interfaces.push(new Interface({
            name: `FastEthernet0/${i}`,
            shortName: `Fa0/${i}`,
            status: 'down',
            vlanId: 1,
          }));
        }
        this.interfaces.push(new Interface({
          name: 'GigabitEthernet0/1',
          shortName: 'G0/1',
          status: 'down',
        }));
      }
    }
  }

  /** Learn a MAC address on a port. */
  learnMac(mac, port) {
    this.macTable.set(mac, port);
  }

  /** Look up which port a MAC is on. */
  lookupMac(mac) {
    return this.macTable.get(mac) || null;
  }

  /** Returns all ports in a given VLAN. */
  portsInVlan(vlanId) {
    return this.interfaces.filter(i => i.vlanId === vlanId && !i.trunkMode);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      vlans: this.vlans,
      macTable: Object.fromEntries(this.macTable),
      config: {
        stpEnabled: this.stpEnabled,
        stpRoot: this.stpRoot,
        stpPriority: this.stpPriority,
      },
    };
  }
}
Device.registerType('switch', Switch);

// ────────────────────────────────────────────────────────────────
//  L3 Switch — inherits Switch + adds routing
// ────────────────────────────────────────────────────────────────
import { RoutingTable } from '../routing/RoutingTable.js';

export class L3Switch extends Switch {
  constructor(opts = {}) {
    super(opts);
    this.type         = 'l3switch';
    this.routingTable = new RoutingTable(opts.routingTable || []);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'l3switch',
      routingTable: this.routingTable.toJSON(),
    };
  }
}
Device.registerType('l3switch', L3Switch);
