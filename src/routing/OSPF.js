// src/routing/OSPF.js
// OSPF single-area simulation (Phase 2+ feature — stub for now)

export class OSPF {
  constructor(sim) {
    this.sim   = sim;
    this.lsdb  = new Map();  // routerId → Map<networkId, LSA>
    this.timers= new Map();
  }

  /**
   * Start OSPF on a router with a given process-id and area.
   */
  enable(routerId, processId = 1, area = 0) {
    const router = this.sim.devices.get(routerId);
    if (!router) return;
    // Schedule Hello packets every 10s (sim tick)
    const id = setInterval(() => this._hello(routerId, area), 10000);
    this.timers.set(routerId, id);
    this._buildLSA(routerId, area);
  }

  disable(routerId) {
    if (this.timers.has(routerId)) {
      clearInterval(this.timers.get(routerId));
      this.timers.delete(routerId);
    }
  }

  _hello(routerId, area) {
    // Exchange LSAs with neighbors in the same area
    const router = this.sim.devices.get(routerId);
    if (!router) return;
    for (const { deviceId } of this.sim.neighbors(routerId)) {
      const neighbor = this.sim.devices.get(deviceId);
      if (neighbor?.config?.routingProtocol !== 'ospf') continue;
      if (neighbor.config?.ospfArea !== area) continue;
      this._exchangeLSA(routerId, deviceId, area);
    }
  }

  _buildLSA(routerId, area) {
    const router = this.sim.devices.get(routerId);
    if (!router?.interfaces) return;
    const networks = router.interfaces
      .filter(i => i.status === 'up' && i.ipAddress)
      .map(i => ({ network: i.ipAddress, mask: i.subnetMask, iface: i.name }));
    if (!this.lsdb.has(routerId)) this.lsdb.set(routerId, new Map());
    this.lsdb.get(routerId).set('router-lsa', { routerId, area, networks });
  }

  _exchangeLSA(from, to, area) {
    const fromLSA = this.lsdb.get(from);
    if (!fromLSA) return;
    const toRouter = this.sim.devices.get(to);
    if (!toRouter?.routingTable) return;

    for (const [, lsa] of fromLSA) {
      for (const net of lsa.networks) {
        const viaIface = this.sim.devices.get(from)?.interfaces?.find(i => i.status === 'up' && i.ipAddress);
        if (!viaIface) continue;
        toRouter.routingTable.addOSPF(net.network, net.mask, viaIface.ipAddress, 1);
      }
    }
  }
}
