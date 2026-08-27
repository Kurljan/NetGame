import { Device, Interface } from './Device.js';
import { RoutingTable } from '../routing/RoutingTable.js';
import { IPv6RoutingTable } from '../routing/IPv6RoutingTable.js';
import { getModelSpec } from './DeviceModels.js';

export class Router extends Device {
  constructor(opts = {}) {
    super('router', opts);
    /** @type {RoutingTable} */
    this.routingTable   = new RoutingTable(opts.routingTable || []);
    /** @type {IPv6RoutingTable} */
    this.ipv6RoutingTable = new IPv6RoutingTable(opts.ipv6RoutingTable || []);
    this.natEnabled     = opts.config?.natEnabled     || false;
    this.natInside      = opts.config?.natInside      || '';
    this.natOutside     = opts.config?.natOutside     || '';
    this.routingProtocol= opts.config?.routingProtocol|| 'none'; // 'none'|'rip'|'ospf'
    this.ospfProcessId  = opts.config?.ospfProcessId  || 1;
    this.ospfArea       = opts.config?.ospfArea       || 0;
    this.dhcpPools      = opts.config?.dhcpPools      || [];
    this.aclRules       = opts.config?.aclRules       || [];

    // Default interfaces if none provided
    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface(i));
      } else {
        this.interfaces = [
          new Interface({ name: 'GigabitEthernet0/0', shortName: 'G0/0', status: 'down' }),
          new Interface({ name: 'GigabitEthernet0/1', shortName: 'G0/1', status: 'down' }),
        ];
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      routingTable: this.routingTable.toJSON(),
      ipv6RoutingTable: this.ipv6RoutingTable.toJSON(),
      config: {
        natEnabled: this.natEnabled,
        natInside: this.natInside,
        natOutside: this.natOutside,
        routingProtocol: this.routingProtocol,
        ospfProcessId: this.ospfProcessId,
        ospfArea: this.ospfArea,
        dhcpPools: this.dhcpPools,
        aclRules: this.aclRules,
      },
    };
  }
}
Device.registerType('router', Router);
