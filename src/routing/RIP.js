// src/routing/RIP.js
// RIP v2 simulation (Phase 2+ feature — stub for now)
// Will be activated when routingProtocol === 'rip' on a router

export class RIP {
  constructor(sim) {
    this.sim    = sim;
    this.timers = new Map();   // routerId → timer
  }

  /**
   * Start RIP on a router. Every 30s (simulated ticks) exchange routes.
   */
  enable(routerId) {
    if (this.timers.has(routerId)) return;
    const id = setInterval(() => this._update(routerId), 5000); // 5s sim tick
    this.timers.set(routerId, id);
    this._update(routerId);
  }

  disable(routerId) {
    if (this.timers.has(routerId)) {
      clearInterval(this.timers.get(routerId));
      this.timers.delete(routerId);
    }
  }

  _update(routerId) {
    const router = this.sim.devices.get(routerId);
    if (!router?.routingTable) return;

    // Advertise routes to RIP-enabled neighbors
    for (const { deviceId } of this.sim.neighbors(routerId)) {
      const neighbor = this.sim.devices.get(deviceId);
      if (!neighbor?.routingTable || neighbor.config?.routingProtocol !== 'rip') continue;

      // Send all routes to neighbor (split-horizon: skip routes learned via that neighbor)
      for (const route of router.routingTable.routes) {
        if (route.nextHop === deviceId) continue; // split horizon
        // Find next-hop IP toward routerId from neighbor's perspective
        const via = router.interfaces.find(i => i.status === 'up' && i.ipAddress)?.ipAddress;
        if (!via) continue;
        neighbor.routingTable.addRIP(route.network, route.mask, via, (route.metric || 0) + 1);
      }
    }
  }
}
