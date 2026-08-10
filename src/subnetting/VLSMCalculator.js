// src/subnetting/VLSMCalculator.js
// Algorithmic engine for Variable Length Subnet Masking (VLSM) calculations,
// step-by-step mathematical derivation, validation, and Cisco IOS configuration generation.

import { SubnetCalculator as SC } from './SubnetCalculator.js';

export class VLSMCalculator {
  /**
   * Determine the minimum number of host bits needed to accommodate a given number of usable hosts.
   * Formula: 2^h - 2 >= hostsNeeded  (or 2 hosts for /31 point-to-point where applicable, standard CCNA uses 2^h - 2)
   * @param {number} hostsNeeded
   * @returns {number} hostBits (h)
   */
  static getHostBitsNeeded(hostsNeeded) {
    const hNeeded = Math.max(1, parseInt(hostsNeeded, 10) || 1);
    // Point-to-point links of 2 usable hosts require /30 (2 bits -> 2^2 - 2 = 2 usable)
    let h = 1;
    while ((Math.pow(2, h) - 2) < hNeeded) {
      h++;
      if (h > 30) break;
    }
    return h;
  }

  /**
   * Determine the CIDR prefix for a given host requirement.
   * @param {number} hostsNeeded
   * @returns {number} prefix (e.g. 26 for 60 hosts)
   */
  static getPrefixForHosts(hostsNeeded) {
    const hostBits = this.getHostBitsNeeded(hostsNeeded);
    return 32 - hostBits;
  }

  /**
   * Calculate full VLSM allocation for a given parent network block and department requirements.
   * @param {string} baseNetworkCidr - e.g. "192.168.1.0/24" or "10.0.0.0/22"
   * @param {Array<{ name: string, hostsNeeded: number, id?: string }>} departments
   * @returns {{
   *   success: boolean,
   *   error?: string,
   *   baseNetwork: string,
   *   basePrefix: number,
   *   baseMask: string,
   *   totalCapacity: number,
   *   totalUsedAddresses: number,
   *   totalUsableHostsAllocated: number,
   *   totalWastedAddresses: number,
   *   efficiencyPercentage: number,
   *   allocations: Array<{
   *     id: string,
   *     name: string,
   *     hostsNeeded: number,
   *     hostBits: number,
   *     prefix: number,
   *     mask: string,
   *     wildcard: string,
   *     network: string,
   *     firstHost: string,
   *     lastHost: string,
   *     broadcast: string,
   *     usableHosts: number,
   *     totalSize: number,
   *     wastedHosts: number,
   *     stepExplanation: string
   *   }>,
   *   unallocatedBlocks: Array<{
   *     network: string,
   *     prefix: number,
   *     size: number
   *   }>
   * }}
   */
  static calculateVLSM(baseNetworkCidr, departments = []) {
    try {
      const parsedBase = SC.parse(baseNetworkCidr);
      const baseIpInt = SC.ipToInt(parsedBase.network);
      const basePrefix = parsedBase.prefix;
      const baseTotalSize = Math.pow(2, 32 - basePrefix);
      const baseEndInt = baseIpInt + baseTotalSize - 1;

      if (!departments || departments.length === 0) {
        return {
          success: false,
          error: 'No department requirements provided.',
          allocations: [],
          unallocatedBlocks: []
        };
      }

      // Step 1: Sort departments in descending order of required hosts
      const sortedDepts = departments
        .map((d, index) => ({
          id: d.id || `dept_${index + 1}`,
          name: d.name || `Department ${index + 1}`,
          hostsNeeded: Math.max(1, parseInt(d.hostsNeeded, 10) || 1),
          originalIndex: index
        }))
        .sort((a, b) => b.hostsNeeded - a.hostsNeeded);

      let currentPointerInt = baseIpInt;
      const allocations = [];
      let totalUsedAddresses = 0;
      let totalUsableHostsAllocated = 0;

      for (let i = 0; i < sortedDepts.length; i++) {
        const dept = sortedDepts[i];
        const hostBits = this.getHostBitsNeeded(dept.hostsNeeded);
        const prefix = 32 - hostBits;
        const blockSize = Math.pow(2, hostBits);
        const usableHosts = blockSize - 2;

        if (prefix < basePrefix) {
          return {
            success: false,
            error: `Department "${dept.name}" requires ${dept.hostsNeeded} hosts (/ ${prefix}), which exceeds the entire base network capacity (/${basePrefix}).`,
            allocations: [],
            unallocatedBlocks: []
          };
        }

        // Align current pointer to block boundary if needed
        const remainder = currentPointerInt % blockSize;
        if (remainder !== 0) {
          currentPointerInt += (blockSize - remainder);
        }

        const netInt = currentPointerInt;
        const bcastInt = netInt + blockSize - 1;

        if (bcastInt > baseEndInt) {
          return {
            success: false,
            error: `Address space exhausted! Base network ${parsedBase.network}/${basePrefix} (${baseTotalSize} total addresses) cannot fit all requested departments. Ran out of space at "${dept.name}".`,
            allocations,
            unallocatedBlocks: []
          };
        }

        const network = SC.intToIp(netInt);
        const broadcast = SC.intToIp(bcastInt);
        const firstHost = SC.intToIp(netInt + 1);
        const lastHost = SC.intToIp(bcastInt - 1);
        const mask = SC.cidrToMask(prefix);
        const wildcard = SC.intToIp((~SC.maskToInt(mask)) >>> 0);
        const wastedHosts = usableHosts - dept.hostsNeeded;

        const stepExplanation = `Step ${i + 1}: ${dept.name} needs ${dept.hostsNeeded} hosts. Formula: 2^h - 2 ≥ ${dept.hostsNeeded} ➜ h = ${hostBits} bits (2^${hostBits}-2 = ${usableHosts} hosts). Prefix = 32 - ${hostBits} = /${prefix} (${mask}). Block size = ${blockSize}. Subnet: ${network}/${prefix} (Usable: ${firstHost} – ${lastHost}, Broadcast: ${broadcast}).`;

        allocations.push({
          id: dept.id,
          name: dept.name,
          hostsNeeded: dept.hostsNeeded,
          hostBits,
          prefix,
          mask,
          wildcard,
          network,
          firstHost,
          lastHost,
          broadcast,
          usableHosts,
          totalSize: blockSize,
          wastedHosts,
          stepExplanation
        });

        totalUsedAddresses += blockSize;
        totalUsableHostsAllocated += dept.hostsNeeded;
        currentPointerInt = bcastInt + 1;
      }

      // Calculate unallocated remaining blocks
      const unallocatedBlocks = [];
      let remPointer = currentPointerInt;
      while (remPointer <= baseEndInt) {
        const remainingSpace = baseEndInt - remPointer + 1;
        if (remainingSpace <= 0) break;

        // Find largest power-of-2 block that fits and aligns
        let maxPrefix = 32;
        while (maxPrefix > basePrefix) {
          const testSize = Math.pow(2, 32 - (maxPrefix - 1));
          if (testSize <= remainingSpace && (remPointer % testSize === 0)) {
            maxPrefix--;
          } else {
            break;
          }
        }
        const blkSize = Math.pow(2, 32 - maxPrefix);
        unallocatedBlocks.push({
          network: SC.intToIp(remPointer),
          prefix: maxPrefix,
          size: blkSize
        });
        remPointer += blkSize;
      }

      const efficiencyPercentage = Math.round((totalUsableHostsAllocated / baseTotalSize) * 100);
      const totalWastedAddresses = baseTotalSize - totalUsableHostsAllocated;

      return {
        success: true,
        baseNetwork: parsedBase.network,
        basePrefix,
        baseMask: parsedBase.mask,
        totalCapacity: baseTotalSize,
        totalUsedAddresses,
        totalUsableHostsAllocated,
        totalWastedAddresses,
        efficiencyPercentage,
        allocations,
        unallocatedBlocks
      };
    } catch (e) {
      return {
        success: false,
        error: e.message || 'VLSM calculation failed.',
        allocations: [],
        unallocatedBlocks: []
      };
    }
  }

  /**
   * Validate user-submitted VLSM table entries against the mathematically optimal VLSM solution.
   * @param {string} baseNetworkCidr
   * @param {Array<{ name: string, hostsNeeded: number }>} originalDepts
   * @param {Array<{
   *   name?: string,
   *   hostsNeeded?: number|string,
   *   prefix?: number|string,
   *   mask?: string,
   *   network?: string,
   *   firstHost?: string,
   *   lastHost?: string,
   *   broadcast?: string
   * }>} userRows
   * @returns {{
   *   allCorrect: boolean,
   *   totalScore: number,
   *   maxScore: number,
   *   rowResults: Array<{
   *     deptName: string,
   *     hostsNeeded: number,
   *     isCorrect: boolean,
   *     fields: { [fieldName: string]: { value: any, expected: any, isCorrect: boolean, errorMsg?: string } },
   *     generalErrors: string[]
   *   }>,
   *   feedbackSummary: string
   * }}
   */
  static validateUserVLSMTable(baseNetworkCidr, originalDepts, userRows) {
    const solution = this.calculateVLSM(baseNetworkCidr, originalDepts);
    if (!solution.success) {
      return {
        allCorrect: false,
        totalScore: 0,
        maxScore: 0,
        rowResults: [],
        feedbackSummary: solution.error
      };
    }

    const expectedAllocations = solution.allocations;
    const rowResults = [];
    let correctFieldCount = 0;
    let totalFieldCount = 0;
    let allCorrect = true;

    // Check order check (largest host requirements first)
    const isUserSorted = userRows.every((row, idx, arr) => {
      if (idx === 0) return true;
      const prevHosts = parseInt(arr[idx - 1].hostsNeeded, 10) || 0;
      const currHosts = parseInt(row.hostsNeeded, 10) || 0;
      return prevHosts >= currHosts;
    });

    for (let i = 0; i < expectedAllocations.length; i++) {
      const exp = expectedAllocations[i];
      const user = userRows[i] || {};
      const rowErrors = [];
      const fields = {};

      const checkField = (fieldName, userVal, expectedVal, validatorFn, label) => {
        totalFieldCount++;
        const rawUser = String(userVal || '').trim();
        const rawExp = String(expectedVal).trim();
        let pass = false;
        let errMsg = '';

        if (!rawUser) {
          errMsg = `Missing ${label}. Expected: ${rawExp}`;
        } else if (validatorFn ? validatorFn(rawUser, rawExp) : rawUser.toLowerCase() === rawExp.toLowerCase()) {
          pass = true;
          correctFieldCount++;
        } else {
          errMsg = `Incorrect ${label}. Entered: "${rawUser}", Expected: "${rawExp}"`;
        }

        if (!pass) allCorrect = false;

        fields[fieldName] = {
          value: rawUser,
          expected: rawExp,
          isCorrect: pass,
          errorMsg: errMsg || undefined
        };
      };

      // 1. Department Name / Hosts
      checkField('name', user.name, exp.name, (u, e) => u.toLowerCase() === e.toLowerCase(), 'Department');
      checkField('hostsNeeded', user.hostsNeeded, exp.hostsNeeded, (u, e) => parseInt(u, 10) === parseInt(e, 10), 'Hosts Needed');

      // 2. Prefix / CIDR
      checkField('prefix', user.prefix ? String(user.prefix).replace(/^\//, '') : '', exp.prefix, (u, e) => parseInt(u, 10) === parseInt(e, 10), 'Prefix (CIDR)');

      // 3. Subnet Mask
      checkField('mask', user.mask, exp.mask, (u, e) => u === e, 'Subnet Mask');

      // 4. Network Address
      checkField('network', user.network, exp.network, (u, e) => u === e, 'Network Address');

      // 5. First Usable IP
      checkField('firstHost', user.firstHost, exp.firstHost, (u, e) => u === e, 'First Usable Host');

      // 6. Last Usable IP
      checkField('lastHost', user.lastHost, exp.lastHost, (u, e) => u === e, 'Last Usable Host');

      // 7. Broadcast Address
      checkField('broadcast', user.broadcast, exp.broadcast, (u, e) => u === e, 'Broadcast Address');

      // Additional sanity checks
      if (user.network && user.mask && SC.isValidIp(user.network) && SC.isValidMask(user.mask)) {
        const netOfInput = SC.getNetworkAddress(user.network, user.mask);
        if (netOfInput !== user.network) {
          rowErrors.push(`Network address "${user.network}" is not on a valid /${SC.maskToCidr(user.mask)} block boundary (should be ${netOfInput}).`);
        }
      }

      const isRowCorrect = Object.values(fields).every(f => f.isCorrect) && rowErrors.length === 0;

      rowResults.push({
        deptName: exp.name,
        hostsNeeded: exp.hostsNeeded,
        isCorrect: isRowCorrect,
        fields,
        generalErrors: rowErrors
      });
    }

    let feedbackSummary = '';
    if (allCorrect) {
      feedbackSummary = `🎉 Perfect! All ${expectedAllocations.length} VLSM subnets correctly calculated, contiguous, and non-overlapping.`;
    } else {
      const pct = Math.round((correctFieldCount / totalFieldCount) * 100);
      feedbackSummary = `Score: ${pct}% (${correctFieldCount}/${totalFieldCount} fields correct). ${!isUserSorted ? '⚠️ Remember: Always sort departments from largest host requirement to smallest before subnetting.' : 'Review highlighted incorrect cells below.'}`;
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
   * Generate ready-to-use Cisco IOS CLI configuration commands for the calculated VLSM subnets.
   * @param {Array<{ name: string, network: string, mask: string, firstHost: string, prefix: number }>} allocations
   * @param {string} routerHostname
   * @returns {string} IOS commands block
   */
  static generateIosConfig(allocations = [], routerHostname = 'Router1') {
    const lines = [
      `! ═══════════════════════════════════════════════════════════════`,
      `! Cisco IOS VLSM Interface Configuration for ${routerHostname}`,
      `! Generated by NetGame VLSM Engine`,
      `! ═══════════════════════════════════════════════════════════════`,
      `enable`,
      `configure terminal`,
      `hostname ${routerHostname}`,
      `!`
    ];

    const ifaceNames = ['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Serial0/0/0', 'Serial0/0/1'];

    allocations.forEach((alloc, index) => {
      const iface = ifaceNames[index] || `GigabitEthernet0/${index}`;
      lines.push(`! Department / Subnet: ${alloc.name} (${alloc.hostsNeeded} hosts, ${alloc.network}/${alloc.prefix})`);
      lines.push(`interface ${iface}`);
      lines.push(` description Subnet_${alloc.name.replace(/\s+/g, '_')}_Link`);
      lines.push(` ip address ${alloc.firstHost} ${alloc.mask}`);
      lines.push(` no shutdown`);
      lines.push(`!`);
    });

    lines.push(`end`, `write memory`, `show ip interface brief`, `show ip route`);
    return lines.join('\n');
  }

  /**
   * Generate educational step-by-step mathematical breakdown for studying VLSM.
   */
  static generateStepByStepGuide(baseNetworkCidr, departments = []) {
    const solution = this.calculateVLSM(baseNetworkCidr, departments);
    if (!solution.success) return `<div class="vlsm-error">${solution.error}</div>`;

    let html = `
      <div class="vlsm-guide-header">
        <h4>VLSM Step-by-Step Mathematical Derivation</h4>
        <p class="vlsm-guide-base">Base Network: <code>${solution.baseNetwork}/${solution.basePrefix}</code> (${solution.totalCapacity} total IP addresses)</p>
      </div>
      <div class="vlsm-guide-rule">
        <strong>Golden Rule of VLSM:</strong> Always sort subnet requirements in <em>descending order</em> (largest number of hosts first). This avoids subnets overlapping and fracturing the address space.
      </div>
      <div class="vlsm-steps-list">
    `;

    solution.allocations.forEach((alloc, idx) => {
      html += `
        <div class="vlsm-step-item">
          <div class="step-num">Step ${idx + 1}</div>
          <div class="step-details">
            <div class="step-title">Allocate <strong>${alloc.name}</strong> (${alloc.hostsNeeded} usable hosts needed)</div>
            <ul class="step-math">
              <li><strong>Formula:</strong> <code>2^h - 2 ≥ ${alloc.hostsNeeded}</code> ➜ Requires <code>h = ${alloc.hostBits}</code> host bits (<code>2^${alloc.hostBits} - 2 = ${alloc.usableHosts}</code> usable hosts).</li>
              <li><strong>New Prefix:</strong> <code>32 - ${alloc.hostBits} = /${alloc.prefix}</code> (Subnet Mask: <code>${alloc.mask}</code>, Wildcard: <code>${alloc.wildcard}</code>).</li>
              <li><strong>Block Size:</strong> <code>2^${alloc.hostBits} = ${alloc.totalSize}</code> total addresses.</li>
              <li><strong>Network Address:</strong> <code>${alloc.network}</code> (Start of block).</li>
              <li><strong>Usable Host Range:</strong> <code>${alloc.firstHost}</code> to <code>${alloc.lastHost}</code> (Gateway: <code>${alloc.firstHost}</code>).</li>
              <li><strong>Broadcast Address:</strong> <code>${alloc.broadcast}</code> (End of block: ${alloc.network} + ${alloc.totalSize - 1}).</li>
              <li><strong>Next Subnet Starts At:</strong> <code>${SC.intToIp(SC.ipToInt(alloc.broadcast) + 1)}</code>.</li>
            </ul>
          </div>
        </div>
      `;
    });

    if (solution.unallocatedBlocks.length > 0) {
      html += `
        <div class="vlsm-step-item unallocated">
          <div class="step-num">Leftover</div>
          <div class="step-details">
            <div class="step-title">Remaining Available Unallocated Address Blocks</div>
            <p>The following blocks remain free for future network growth without re-addressing existing departments:</p>
            <ul>
              ${solution.unallocatedBlocks.map(b => `<li><code>${b.network}/${b.prefix}</code> (${b.size} addresses)</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  }
}
