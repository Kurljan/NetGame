// src/subnetting/SubnetCalculator.js
// Pure IP math utilities. No dependencies.

export class SubnetCalculator {
  // ──────────────────────────────────────────────────────────
  //  Basic conversions
  // ──────────────────────────────────────────────────────────

  /** "192.168.1.0" → 32-bit unsigned integer */
  static ipToInt(ip) {
    if (!ip || typeof ip !== 'string') return 0;
    return ip.split('.').reduce((acc, oct) => ((acc << 8) | parseInt(oct, 10)) >>> 0, 0);
  }

  /** 32-bit integer → "192.168.1.0" */
  static intToIp(n) {
    return [
      (n >>> 24) & 0xFF,
      (n >>> 16) & 0xFF,
      (n >>>  8) & 0xFF,
       n         & 0xFF,
    ].join('.');
  }

  /**
   * Convert prefix length (0-32) or dotted mask to 32-bit mask integer.
   * @param {number|string} mask  e.g. 24 or "255.255.255.0"
   */
  static maskToInt(mask) {
    if (typeof mask === 'number') {
      return mask === 0 ? 0 : ((0xFFFFFFFF << (32 - mask)) >>> 0);
    }
    return this.ipToInt(mask);
  }

  /** CIDR prefix length (0-32) → dotted mask string */
  static cidrToMask(cidr) {
    return this.intToIp(this.maskToInt(parseInt(cidr, 10)));
  }

  /** Dotted mask string → CIDR prefix length */
  static maskToCidr(mask) {
    let n = this.ipToInt(mask), count = 0;
    while (n & 0x80000000) { count++; n = (n << 1) >>> 0; }
    return count;
  }

  // ──────────────────────────────────────────────────────────
  //  Subnet math
  // ──────────────────────────────────────────────────────────

  /** Network address (host bits zeroed) */
  static getNetworkAddress(ip, mask) {
    const ipInt   = this.ipToInt(ip);
    const maskInt = this.maskToInt(mask);
    return this.intToIp((ipInt & maskInt) >>> 0);
  }

  /** Broadcast address (host bits set to 1) */
  static getBroadcastAddress(ip, mask) {
    const ipInt      = this.ipToInt(ip);
    const maskInt    = this.maskToInt(mask);
    const wildcardInt = (~maskInt) >>> 0;
    return this.intToIp(((ipInt & maskInt) | wildcardInt) >>> 0);
  }

  /** First usable host (network + 1) */
  static getFirstHost(ip, mask) {
    const netInt = this.ipToInt(this.getNetworkAddress(ip, mask));
    return this.intToIp(netInt + 1);
  }

  /** Last usable host (broadcast - 1) */
  static getLastHost(ip, mask) {
    const bcastInt = this.ipToInt(this.getBroadcastAddress(ip, mask));
    return this.intToIp(bcastInt - 1);
  }

  /** Number of usable host addresses */
  static getHostCount(mask) {
    const prefix = typeof mask === 'number' ? mask : this.maskToCidr(mask);
    if (prefix >= 32) return 0;
    if (prefix === 31) return 2;
    return Math.pow(2, 32 - prefix) - 2;
  }

  // ──────────────────────────────────────────────────────────
  //  Membership tests
  // ──────────────────────────────────────────────────────────

  /** Are two IPs in the same subnet? */
  static isSameSubnet(ip1, ip2, mask) {
    const maskInt = this.maskToInt(mask);
    return (this.ipToInt(ip1) & maskInt) >>> 0 === (this.ipToInt(ip2) & maskInt) >>> 0;
  }

  /** Is hostIp within network/mask? */
  static isInSubnet(hostIp, network, mask) {
    const maskInt = this.maskToInt(mask);
    const netInt  = this.ipToInt(network);
    return (this.ipToInt(hostIp) & maskInt) >>> 0 === (netInt & maskInt) >>> 0;
  }

  /** Is this a private (RFC 1918) address? */
  static isPrivate(ip) {
    const n = this.ipToInt(ip);
    return (
      (n & 0xFF000000) >>> 0 === 0x0A000000 ||             // 10.0.0.0/8
      (n & 0xFFF00000) >>> 0 === 0xAC100000 ||             // 172.16.0.0/12
      (n & 0xFFFF0000) >>> 0 === 0xC0A80000                // 192.168.0.0/16
    );
  }

  // ──────────────────────────────────────────────────────────
  //  Validation
  // ──────────────────────────────────────────────────────────

  static isValidIp(ip) {
    if (!ip) return false;
    const parts = String(ip).split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => {
      const n = parseInt(p, 10);
      return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
    });
  }

  static isValidMask(mask) {
    if (!this.isValidIp(mask)) return false;
    const n   = this.ipToInt(mask);
    const inv = (~n) >>> 0;
    return (inv & (inv + 1)) === 0;  // all 1s then all 0s
  }

  // ──────────────────────────────────────────────────────────
  //  Longest-prefix match helper  (used by RoutingTable)
  // ──────────────────────────────────────────────────────────

  /**
   * Given a destination IP and a list of {network, mask} entries,
   * returns the one with the longest matching prefix.
   * @param {string} dstIp
   * @param {{ network: string, mask: string }[]} routes
   * @returns {{ network: string, mask: string }|null}
   */
  static longestPrefixMatch(dstIp, routes) {
    let best = null, bestLen = -1;
    for (const route of routes) {
      if (!route.network || !route.mask) continue;
      if (this.isInSubnet(dstIp, route.network, route.mask)) {
        const len = this.maskToCidr(route.mask);
        if (len > bestLen) { bestLen = len; best = route; }
      }
    }
    return best;
  }

  // ──────────────────────────────────────────────────────────
  //  Full subnet info summary (for the Subnet Calculator UI)
  // ──────────────────────────────────────────────────────────

  /**
   * Parse a CIDR string like "192.168.1.0/24" or "10.0.0.1/255.255.0.0"
   * and return all computed fields.
   */
  static parse(cidr) {
    let ip, mask, prefix;

    if (cidr.includes('/')) {
      [ip, mask] = cidr.trim().split('/');
      if (mask.includes('.')) {
        // Dotted mask
        if (!this.isValidMask(mask)) throw new Error(`Invalid mask: ${mask}`);
        prefix = this.maskToCidr(mask);
      } else {
        prefix = parseInt(mask, 10);
        if (isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error(`Invalid prefix: ${mask}`);
        mask = this.cidrToMask(prefix);
      }
    } else {
      ip = cidr.trim();
      prefix = 24;
      mask   = this.cidrToMask(prefix);
    }

    if (!this.isValidIp(ip))   throw new Error(`Invalid IP: ${ip}`);
    if (!this.isValidMask(mask)) throw new Error(`Invalid mask: ${mask}`);

    const network   = this.getNetworkAddress(ip, mask);
    const broadcast = this.getBroadcastAddress(ip, mask);
    const firstHost = prefix <= 30 ? this.getFirstHost(network, mask) : network;
    const lastHost  = prefix <= 30 ? this.getLastHost(network, mask)  : broadcast;
    const hostCount = this.getHostCount(prefix);

    return {
      network, mask, prefix,
      broadcast, firstHost, lastHost,
      hostCount,
      ipClass:    this._getClass(ip),
      isPrivate:  this.isPrivate(ip),
      wildcardMask: this.intToIp((~this.maskToInt(mask)) >>> 0),
    };
  }

  static _getClass(ip) {
    const first = parseInt(ip.split('.')[0], 10);
    if (first < 128)       return 'A';
    if (first < 192)       return 'B';
    if (first < 224)       return 'C';
    if (first < 240)       return 'D (Multicast)';
    return 'E (Experimental)';
  }
}
