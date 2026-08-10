// src/subnetting/IPv6Calculator.js
// High-precision IPv6 address math, RFC 5952 compression/expansion,
// address classification, EUI-64 generation, and hierarchical subnetting engine.

export class IPv6Calculator {
  /**
   * Expand any valid IPv6 address into its full uncompressed 8-hextet (32 hex digit) representation.
   * e.g. "2001:db8:1::1" -> "2001:0db8:0001:0000:0000:0000:0000:0001"
   * @param {string} ipv6
   * @returns {string} full 8-hextet expanded IPv6 string
   */
  static expand(ipv6) {
    if (!ipv6 || typeof ipv6 !== 'string') throw new Error('Invalid IPv6 address string.');

    let clean = ipv6.trim().toLowerCase();
    // Strip CIDR prefix if present
    if (clean.includes('/')) {
      clean = clean.split('/')[0].trim();
    }

    if (!this.isValidIPv6(clean)) {
      throw new Error(`Invalid IPv6 address: "${ipv6}"`);
    }

    let hextets = [];
    if (clean.includes('::')) {
      const [left, right] = clean.split('::');
      const leftParts = left ? left.split(':') : [];
      const rightParts = right ? right.split(':') : [];
      const missingCount = 8 - (leftParts.length + rightParts.length);
      const zeros = Array(missingCount).fill('0000');
      hextets = [...leftParts, ...zeros, ...rightParts];
    } else {
      hextets = clean.split(':');
    }

    if (hextets.length !== 8) {
      throw new Error(`Invalid IPv6 structure: "${ipv6}"`);
    }

    return hextets.map(h => h.padStart(4, '0')).join(':');
  }

  /**
   * Compress an IPv6 address adhering strictly to RFC 5952:
   * 1. Remove leading zeroes in each 16-bit hextet.
   * 2. Replace the longest contiguous sequence of two or more ":0:" hextets with "::".
   * 3. If there is a tie, compress the first one.
   * @param {string} ipv6
   * @returns {string} RFC 5952 compressed IPv6 string
   */
  static compress(ipv6) {
    const expanded = this.expand(ipv6);
    const hextets = expanded.split(':').map(h => {
      const stripped = h.replace(/^0+/, '');
      return stripped === '' ? '0' : stripped;
    });

    // Find longest contiguous run of '0'
    let bestStart = -1;
    let bestLen = 0;
    let currStart = -1;
    let currLen = 0;

    for (let i = 0; i < 8; i++) {
      if (hextets[i] === '0') {
        if (currStart === -1) {
          currStart = i;
          currLen = 1;
        } else {
          currLen++;
        }
        if (currLen > bestLen) {
          bestLen = currLen;
          bestStart = currStart;
        }
      } else {
        currStart = -1;
        currLen = 0;
      }
    }

    // Only compress if run length is 2 or more
    if (bestLen >= 2) {
      const left = hextets.slice(0, bestStart).join(':');
      const right = hextets.slice(bestStart + bestLen).join(':');
      if (bestStart === 0 && bestLen === 8) return '::';
      if (bestStart === 0) return `::${right}`;
      if (bestStart + bestLen === 8) return `${left}::`;
      return `${left}::${right}`;
    }

    return hextets.join(':');
  }

  /**
   * Validate if a string is a well-formed IPv6 address or CIDR notation.
   * @param {string} str
   * @returns {boolean}
   */
  static isValidIPv6(str) {
    if (!str || typeof str !== 'string') return false;
    let s = str.trim();
    if (s.includes('/')) {
      const [ip, prefix] = s.split('/');
      const pNum = parseInt(prefix, 10);
      if (isNaN(pNum) || pNum < 0 || pNum > 128 || String(pNum) !== prefix.trim()) return false;
      s = ip.trim();
    }

    // Regex for standard IPv6 with optional :: compression
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    return ipv6Regex.test(s);
  }

  /**
   * Determine the IPv6 Address Scope & Type with CCNA details.
   * @param {string} ipv6
   * @returns {{ type: string, scope: string, description: string, isRoutable: boolean }}
   */
  static getAddressType(ipv6) {
    const exp = this.expand(ipv6);
    const firstHextet = parseInt(exp.slice(0, 4), 16);
    const comp = this.compress(ipv6);

    if (comp === '::1') {
      return {
        type: 'Loopback',
        scope: 'Node-Local',
        description: 'Node loopback address (equivalent to 127.0.0.1 in IPv4). Used by a host to send packets to itself.',
        isRoutable: false
      };
    }
    if (comp === '::') {
      return {
        type: 'Unspecified',
        scope: 'Local',
        description: 'Unspecified address (equivalent to 0.0.0.0 in IPv4). Used as source address before obtaining an IP (DHCPv6/DAD).',
        isRoutable: false
      };
    }
    if ((firstHextet & 0xFF00) === 0xFF00) {
      return {
        type: 'Multicast',
        scope: 'Multicast Group',
        description: 'Multicast address (FF00::/8). FF02::1 = All Nodes, FF02::2 = All Routers, FF02::1:2 = All DHCPv6 Servers.',
        isRoutable: (firstHextet & 0x000F) >= 8
      };
    }
    if ((firstHextet & 0xFFC0) === 0xFE80) {
      return {
        type: 'Link-Local (LLA)',
        scope: 'Link-Local',
        description: 'Link-Local Address (FE80::/10). Used exclusively for local link communication & next-hop routing. Not routable beyond the local subnet.',
        isRoutable: false
      };
    }
    if ((firstHextet & 0xFE00) === 0xFC00) {
      return {
        type: 'Unique Local (ULA)',
        scope: 'Site-Local / Private',
        description: 'Unique Local Address (FC00::/7). Private enterprise IPv6 space (RFC 4193), equivalent to RFC 1918 private IPv4.',
        isRoutable: false
      };
    }
    if ((firstHextet & 0xE000) === 0x2000) {
      const isDoc = exp.startsWith('2001:0db8');
      return {
        type: isDoc ? 'Global Unicast (Documentation)' : 'Global Unicast (GUA)',
        scope: 'Global Internet',
        description: isDoc
          ? 'Global Unicast documentation prefix (2001:DB8::/32, RFC 3849). Globally unique and routable in CCNA lab topologies.'
          : 'Global Unicast Address (2000::/3). Globally unique, publicly routable on the IPv6 Internet.',
        isRoutable: true
      };
    }

    return {
      type: 'IPv6 Unassigned / Other',
      scope: 'Global',
      description: 'Standard IPv6 address space.',
      isRoutable: true
    };
  }

  /**
   * Generate an EUI-64 Interface ID and Link-Local (or GUA) address from a 48-bit MAC address.
   * Steps:
   * 1. Split MAC into two 24-bit halves: OUI (first 3 bytes) and NIC ID (last 3 bytes).
   * 2. Insert 0xFFFE in the middle to make it 64 bits.
   * 3. Invert the 7th bit (Universal/Local bit) of the first byte.
   * 4. Combine with the given 64-bit prefix (default 'fe80::/64').
   * @param {string} mac - e.g. "AA:BB:CC:11:22:33" or "aabb.cc11.2233"
   * @param {string} [prefix='fe80::/64']
   * @returns {{ interfaceId: string, fullAddress: string, eui64Explanation: string }}
   */
  static generateEUI64(mac, prefix = 'fe80::/64') {
    if (!mac) throw new Error('MAC address is required for EUI-64 generation.');

    const cleanMac = mac.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
    if (cleanMac.length !== 12) {
      throw new Error(`Invalid MAC address: "${mac}". Must contain 12 hexadecimal digits.`);
    }

    const byte0 = parseInt(cleanMac.slice(0, 2), 16);
    const byte1 = cleanMac.slice(2, 4);
    const byte2 = cleanMac.slice(4, 6);
    const byte3 = cleanMac.slice(6, 8);
    const byte4 = cleanMac.slice(8, 10);
    const byte5 = cleanMac.slice(10, 12);

    // Invert bit 7 (which is bit index 1 from left: 0b00000010 = 0x02)
    const modifiedByte0 = (byte0 ^ 0x02).toString(16).padStart(2, '0');

    // EUI-64 format: (byte0^2)(byte1):(byte2)ff:fe(byte3):(byte4)(byte5)
    const h1 = `${modifiedByte0}${byte1}`;
    const h2 = `${byte2}ff`;
    const h3 = `fe${byte3}`;
    const h4 = `${byte4}${byte5}`;
    const interfaceId = `${h1}:${h2}:${h3}:${h4}`;

    let prefixPart = prefix.includes('/') ? prefix.split('/')[0].trim() : prefix.trim();
    if (!prefixPart.includes('::')) prefixPart += '::';
    const pfxExpanded = this.expand(prefixPart);
    const pfxHextets = pfxExpanded.split(':').slice(0, 4);
    const full8 = `${pfxHextets.join(':')}:${interfaceId}`;
    const compressed = this.compress(full8);

    const binaryByte0 = byte0.toString(2).padStart(8, '0');
    const binaryModified = (byte0 ^ 0x02).toString(2).padStart(8, '0');

    const explanation = `
      <strong>EUI-64 Derivation Steps for MAC ${mac}:</strong><br>
      1. <strong>Split 48-bit MAC:</strong> <code>${cleanMac.slice(0, 6)}</code> (OUI) and <code>${cleanMac.slice(6, 12)}</code> (NIC).<br>
      2. <strong>Insert FFFE:</strong> <code>${cleanMac.slice(0, 6)}FFFE${cleanMac.slice(6, 12)}</code>.<br>
      3. <strong>Invert 7th bit (U/L bit):</strong> First octet 0x${cleanMac.slice(0, 2)} (<code>${binaryByte0}</code>) ➜ Invert bit 7 ➜ 0x${modifiedByte0} (<code>${binaryModified}</code>).<br>
      4. <strong>Interface ID (64-bit):</strong> <code>${interfaceId}</code>.<br>
      5. <strong>Resulting Address:</strong> <code>${compressed}</code>.
    `;

    return {
      interfaceId,
      fullAddress: compressed,
      eui64Explanation: explanation
    };
  }

  /**
   * Carve /64 subnets from an enterprise IPv6 block (e.g. /48, /56, /60).
   * In CCNA IPv6 subnetting, the Subnet ID is allocated in the 4th hextet:
   * Global Routing Prefix (48 bits) + Subnet ID (16 bits) + Interface ID (64 bits) = 128 bits.
   * @param {string} basePrefixCidr - e.g. "2001:db8:acad::/48"
   * @param {Array<{ name: string, subnetIdHex?: string|number }>} departments
   */
  static calculateIPv6Subnets(basePrefixCidr, departments = []) {
    try {
      let [baseIp, prefixStr] = basePrefixCidr.trim().split('/');
      let prefixLen = parseInt(prefixStr || '48', 10);
      const expandedBase = this.expand(baseIp);
      const hextets = expandedBase.split(':');

      const prefixHextetCount = Math.floor(prefixLen / 16);

      const subnets = departments.map((dept, index) => {
        let sidHex = '';
        if (dept.subnetIdHex !== undefined && dept.subnetIdHex !== '') {
          sidHex = String(dept.subnetIdHex).replace(/^0x/i, '').padStart(4, '0');
        } else {
          sidHex = (index + 1).toString(16).padStart(4, '0');
        }

        // Subnet prefix with /64
        const subnetHextets = [...hextets];
        subnetHextets[3] = sidHex; // 4th hextet is the standard 16-bit Subnet ID
        for (let i = 4; i < 8; i++) subnetHextets[i] = '0000';

        const subnetNetwork = this.compress(subnetHextets.join(':'));
        const firstGateway = this.compress(`${subnetHextets.slice(0, 7).join(':')}:0001`);
        const lastAddress = this.compress(`${subnetHextets.slice(0, 4).join(':')}:ffff:ffff:ffff:ffff`);

        return {
          id: dept.id || `dept_ipv6_${index + 1}`,
          name: dept.name || `Department ${index + 1}`,
          subnetIdHex: sidHex,
          prefix: 64,
          networkPrefix: `${subnetNetwork}/64`,
          gateway: firstGateway,
          hostRange: `${firstGateway} to ${lastAddress}`,
          totalHosts: '18,446,744,073,709,551,616 (2^64 hosts per /64)',
          ciscoIfaceCmd: `ipv6 address ${firstGateway}/64`
        };
      });

      return {
        success: true,
        baseNetwork: this.compress(baseIp),
        basePrefix: prefixLen,
        subnetsCount: subnets.length,
        subnets
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || 'IPv6 Subnetting calculation failed.',
        subnets: []
      };
    }
  }

  /**
   * Validate user-submitted IPv6 subnet allocations.
   */
  static validateUserIPv6Table(basePrefixCidr, expectedDepts, userRows) {
    const solution = this.calculateIPv6Subnets(basePrefixCidr, expectedDepts);
    if (!solution.success) {
      return { allCorrect: false, totalScore: 0, maxScore: 0, rowResults: [], feedbackSummary: solution.error };
    }

    let correctFieldCount = 0;
    let totalFieldCount = 0;
    let allCorrect = true;
    const rowResults = [];

    for (let i = 0; i < solution.subnets.length; i++) {
      const exp = solution.subnets[i];
      const user = userRows[i] || {};
      const fields = {};

      const checkField = (fieldName, userVal, expectedVal, normalizeFn, label) => {
        totalFieldCount++;
        const rawUser = String(userVal || '').trim();
        const rawExp = String(expectedVal).trim();
        let pass = false;
        let errMsg = '';

        if (!rawUser) {
          errMsg = `Missing ${label}. Expected: ${rawExp}`;
        } else {
          const normUser = normalizeFn ? normalizeFn(rawUser) : rawUser.toLowerCase();
          const normExp = normalizeFn ? normalizeFn(rawExp) : rawExp.toLowerCase();
          if (normUser === normExp) {
            pass = true;
            correctFieldCount++;
          } else {
            errMsg = `Incorrect ${label}. Entered: "${rawUser}", Expected: "${rawExp}"`;
          }
        }

        if (!pass) allCorrect = false;

        fields[fieldName] = {
          value: rawUser,
          expected: rawExp,
          isCorrect: pass,
          errorMsg: errMsg || undefined
        };
      };

      // Check Subnet ID in Hex
      checkField('subnetIdHex', user.subnetIdHex, exp.subnetIdHex, (v) => v.replace(/^0x/i, '').padStart(4, '0').toLowerCase(), 'Subnet ID');

      // Check Network Prefix (/64)
      checkField('networkPrefix', user.networkPrefix, exp.networkPrefix, (v) => {
        try {
          const [ip, pfx] = v.split('/');
          return `${IPv6Calculator.compress(ip)}/${pfx || '64'}`;
        } catch { return v.toLowerCase(); }
      }, 'Network Prefix (/64)');

      // Check Gateway
      checkField('gateway', user.gateway, exp.gateway, (v) => {
        try { return IPv6Calculator.compress(v.split('/')[0]); } catch { return v.toLowerCase(); }
      }, 'Router Gateway (::1)');

      const isRowCorrect = Object.values(fields).every(f => f.isCorrect);
      rowResults.push({
        deptName: exp.name,
        isCorrect: isRowCorrect,
        fields
      });
    }

    let feedbackSummary = '';
    if (allCorrect) {
      feedbackSummary = `🎉 Outstanding! All ${solution.subnets.length} IPv6 /64 subnets and gateway addresses are perfectly allocated.`;
    } else {
      const pct = Math.round((correctFieldCount / totalFieldCount) * 100);
      feedbackSummary = `Score: ${pct}% (${correctFieldCount}/${totalFieldCount} fields correct). Check highlighted fields below.`;
    }

    return {
      allCorrect,
      totalScore: correctFieldCount,
      maxScore: totalFieldCount,
      rowResults,
      feedbackSummary
    };
  }

  /**
   * Are two IPv6 addresses in the same subnet prefix?
   * @param {string} ip1
   * @param {string} ip2
   * @param {number} [prefixLen=64]
   */
  static isSameSubnet(ip1, ip2, prefixLen = 64) {
    try {
      const exp1 = this.expand(ip1).replace(/:/g, '');
      const exp2 = this.expand(ip2).replace(/:/g, '');
      const hexCharsToCheck = Math.floor(prefixLen / 4);
      return exp1.slice(0, hexCharsToCheck).toLowerCase() === exp2.slice(0, hexCharsToCheck).toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Generate Cisco IOS CLI commands for IPv6 interface and routing configuration.
   */
  static generateIosConfig(subnets = [], routerHostname = 'Router1') {
    const lines = [
      `! ═══════════════════════════════════════════════════════════════`,
      `! Cisco IOS Dual-Stack IPv6 Interface Configuration for ${routerHostname}`,
      `! Generated by NetGame IPv6 Engine`,
      `! ═══════════════════════════════════════════════════════════════`,
      `enable`,
      `configure terminal`,
      `hostname ${routerHostname}`,
      `! CRITICAL: Enable IPv6 Unicast Routing globally`,
      `ipv6 unicast-routing`,
      `!`
    ];

    const ifaces = ['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Serial0/0/0'];

    subnets.forEach((sub, idx) => {
      const iface = ifaces[idx] || `GigabitEthernet0/${idx}`;
      lines.push(`! Subnet: ${sub.name} (${sub.networkPrefix})`);
      lines.push(`interface ${iface}`);
      lines.push(` description IPv6_Subnet_${sub.name.replace(/\s+/g, '_')}`);
      lines.push(` ipv6 address ${sub.gateway}/64`);
      lines.push(` ipv6 address fe80::${idx + 1} link-local`);
      lines.push(` no shutdown`);
      lines.push(`!`);
    });

    lines.push(`end`, `show ipv6 interface brief`, `show ipv6 route`);
    return lines.join('\n');
  }
}
