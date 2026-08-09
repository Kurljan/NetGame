// src/routing/RoutingTable.js
// Per-device routing table (Cisco IOS-inspired)

import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';

export class RoutingTable {
  /**
   * @param {Object[]} routes  Optional pre-loaded routes
   */
  constructor(routes = []) {
    /** @type {RouteEntry[]} */
    this.routes = routes.map(r => new RouteEntry(r));
  }

  // ──────────────────────────────────────────────────────────
  //  CRUD
  // ──────────────────────────────────────────────────────────

  /** Add a static route (type 'S'). */
  addStatic(network, mask, nextHop, ad = 1, metric = 0) {
    network = SC.getNetworkAddress(network, mask);   // normalize
    this._remove(network, mask);
    this.routes.push(new RouteEntry({ type: 'S', network, mask, nextHop, ad, metric }));
  }

  /** Add a connected route (type 'C') — auto-populated from interfaces. */
  addConnectedRoute(network, mask, iface) {
    network = SC.getNetworkAddress(network, mask);
    this._remove(network, mask);
    this.routes.push(new RouteEntry({ type: 'C', network, mask, nextHop: iface, ad: 0, metric: 0 }));
  }

  /** Add or update a RIP-learned route. */
  addRIP(network, mask, nextHop, metric = 1) {
    network = SC.getNetworkAddress(network, mask);
    const existing = this.routes.find(r => r.network === network && r.mask === mask && r.type === 'R');
    if (existing) {
      if (metric < existing.metric) { existing.nextHop = nextHop; existing.metric = metric; }
    } else {
      this.routes.push(new RouteEntry({ type: 'R', network, mask, nextHop, ad: 120, metric }));
    }
  }

  /** Add or update an OSPF-learned route. */
  addOSPF(network, mask, nextHop, metric = 1) {
    network = SC.getNetworkAddress(network, mask);
    const existing = this.routes.find(r => r.network === network && r.mask === mask && r.type === 'O');
    if (existing) {
      if (metric < existing.metric) { existing.nextHop = nextHop; existing.metric = metric; }
    } else {
      this.routes.push(new RouteEntry({ type: 'O', network, mask, nextHop, ad: 110, metric }));
    }
  }

  removeRoute(network, mask) { this._remove(network, mask); }

  _remove(network, mask) {
    this.routes = this.routes.filter(r => !(r.network === network && r.mask === mask));
  }

  // ──────────────────────────────────────────────────────────
  //  Lookup
  // ──────────────────────────────────────────────────────────

  /**
   * Longest-prefix match for a destination IP.
   * Respects Administrative Distance for tie-breaking.
   * @param {string} dstIp
   * @returns {RouteEntry|null}
   */
  longestPrefixMatch(dstIp) {
    let best = null, bestLen = -1;
    for (const route of this.routes) {
      if (SC.isInSubnet(dstIp, route.network, route.mask)) {
        const len = SC.maskToCidr(route.mask);
        if (len > bestLen || (len === bestLen && best && route.ad < best.ad)) {
          bestLen = len;
          best    = route;
        }
      }
    }
    return best;
  }

  // ──────────────────────────────────────────────────────────
  //  IOS-style "show ip route" output
  // ──────────────────────────────────────────────────────────
  showIpRoute() {
    if (this.routes.length === 0) return '% No routes found.';

    const typeOrder = { C: 0, S: 1, R: 2, O: 3 };
    const sorted = [...this.routes].sort((a, b) => {
      const to = (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9);
      return to !== 0 ? to : SC.ipToInt(a.network) - SC.ipToInt(b.network);
    });

    const legend = `Codes: C - connected, S - static, R - RIP, O - OSPF, * - candidate default\n`;
    const rows   = sorted.map(r => {
      const prefix = SC.maskToCidr(r.mask);
      const via    = r.type === 'C'
        ? `is directly connected, ${r.nextHop}`
        : `[${r.ad}/${r.metric}] via ${r.nextHop}`;
      return `${r.type}    ${r.network}/${prefix}  ${via}`;
    });
    return legend + rows.join('\n');
  }

  // ──────────────────────────────────────────────────────────
  //  Serialization
  // ──────────────────────────────────────────────────────────
  toJSON() { return this.routes.map(r => r.toJSON()); }
}

// ────────────────────────────────────────────────────────────────
//  RouteEntry
// ────────────────────────────────────────────────────────────────
export class RouteEntry {
  constructor({ type = 'S', network = '', mask = '', nextHop = '', ad = 1, metric = 0 } = {}) {
    this.type    = type;     // 'C' | 'S' | 'R' | 'O'
    this.network = network;
    this.mask    = mask;
    this.nextHop = nextHop;  // IP or interface name
    this.ad      = ad;       // Administrative Distance
    this.metric  = metric;
  }
  toJSON() { return { type: this.type, network: this.network, mask: this.mask, nextHop: this.nextHop, ad: this.ad, metric: this.metric }; }
}
