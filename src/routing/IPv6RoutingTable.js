// src/routing/IPv6RoutingTable.js
// Per-device IPv6 routing table (Cisco IOS-inspired)

import { IPv6Calculator } from '../subnetting/IPv6Calculator.js';

export class IPv6RoutingTable {
  /**
   * @param {Object[]} routes  Optional pre-loaded routes
   */
  constructor(routes = []) {
    /** @type {IPv6RouteEntry[]} */
    this.routes = routes.map(r => new IPv6RouteEntry(r));
  }

  // ──────────────────────────────────────────────────────────
  //  CRUD
  // ──────────────────────────────────────────────────────────

  /** Add a static route (type 'S'). */
  addStatic(network, prefixLen, nextHop, ad = 1, metric = 0) {
    // Compress network
    network = IPv6Calculator.compress(network);
    this._remove(network, prefixLen);
    this.routes.push(new IPv6RouteEntry({ type: 'S', network, prefixLen, nextHop, ad, metric }));
  }

  /** Add a connected route (type 'C') — auto-populated from interfaces. */
  addConnectedRoute(network, prefixLen, iface) {
    network = IPv6Calculator.compress(network);
    this._remove(network, prefixLen);
    this.routes.push(new IPv6RouteEntry({ type: 'C', network, prefixLen, nextHop: iface, ad: 0, metric: 0 }));
  }

  /** Add or update an OSPFv3-learned route. */
  addOSPF(network, prefixLen, nextHop, metric = 1) {
    network = IPv6Calculator.compress(network);
    const existing = this.routes.find(r => r.network === network && r.prefixLen === prefixLen && r.type === 'O');
    if (existing) {
      if (metric < existing.metric) { existing.nextHop = nextHop; existing.metric = metric; }
    } else {
      this.routes.push(new IPv6RouteEntry({ type: 'O', network, prefixLen, nextHop, ad: 110, metric }));
    }
  }

  removeRoute(network, prefixLen) { 
    this._remove(IPv6Calculator.compress(network), prefixLen); 
  }

  _remove(network, prefixLen) {
    this.routes = this.routes.filter(r => !(r.network === network && r.prefixLen === prefixLen));
  }

  // ──────────────────────────────────────────────────────────
  //  Lookup
  // ──────────────────────────────────────────────────────────

  /**
   * Longest-prefix match for a destination IPv6.
   * Respects Administrative Distance for tie-breaking.
   * @param {string} dstIp
   * @returns {IPv6RouteEntry|null}
   */
  longestPrefixMatch(dstIp) {
    let best = null, bestLen = -1;
    for (const route of this.routes) {
      // Check if dstIp is in the route's subnet
      // 0.0.0.0/0 equivalent in IPv6 is ::/0 (default route)
      let matches = false;
      if (route.prefixLen === 0) {
        matches = true;
      } else {
        matches = IPv6Calculator.isSameSubnet(dstIp, route.network, route.prefixLen);
      }

      if (matches) {
        const len = route.prefixLen;
        if (len > bestLen || (len === bestLen && best && route.ad < best.ad)) {
          bestLen = len;
          best    = route;
        }
      }
    }
    return best;
  }

  // ──────────────────────────────────────────────────────────
  //  IOS-style "show ipv6 route" output
  // ──────────────────────────────────────────────────────────
  showIpv6Route() {
    if (this.routes.length === 0) return '% No routes found.';

    const typeOrder = { C: 0, S: 1, R: 2, O: 3 };
    const sorted = [...this.routes].sort((a, b) => {
      const to = (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9);
      if (to !== 0) return to;
      return a.network.localeCompare(b.network); // Naive sort for IPv6 strings
    });

    const legend = `IPv6 Routing Table - ${this.routes.length} entries\nCodes: C - connected, S - static, R - RIP, O - OSPF, * - candidate default\n`;
    const rows   = sorted.map(r => {
      const via = r.type === 'C'
        ? `is directly connected, ${r.nextHop}`
        : `[${r.ad}/${r.metric}] via ${r.nextHop}`;
      return `${r.type}   ${r.network}/${r.prefixLen}  ${via}`;
    });
    return legend + rows.join('\n');
  }

  // ──────────────────────────────────────────────────────────
  //  Serialization
  // ──────────────────────────────────────────────────────────
  toJSON() { return this.routes.map(r => r.toJSON()); }
}

// ────────────────────────────────────────────────────────────────
//  IPv6RouteEntry
// ────────────────────────────────────────────────────────────────
export class IPv6RouteEntry {
  constructor({ type = 'S', network = '', prefixLen = 64, nextHop = '', ad = 1, metric = 0 } = {}) {
    this.type      = type;     // 'C' | 'S' | 'R' | 'O'
    this.network   = network;
    this.prefixLen = prefixLen;
    this.nextHop   = nextHop;  // IP or interface name
    this.ad        = ad;       // Administrative Distance
    this.metric    = metric;
  }
  toJSON() { return { type: this.type, network: this.network, prefixLen: this.prefixLen, nextHop: this.nextHop, ad: this.ad, metric: this.metric }; }
}
