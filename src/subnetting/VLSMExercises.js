// src/subnetting/VLSMExercises.js
// Curated CCNA VLSM scenario exercises, procedural exercise generator, and speed drills.

import { VLSMCalculator } from './VLSMCalculator.js';
import { SubnetCalculator as SC } from './SubnetCalculator.js';

export const CURATED_VLSM_SCENARIOS = [
  {
    id: 'scen_small_office',
    tier: 'Beginner',
    title: 'Small Branch Office Network',
    baseNetwork: '192.168.10.0/24',
    description: 'You are provisioning a new branch office with base block 192.168.10.0/24. Calculate the optimal VLSM scheme for 3 user departments plus 1 point-to-point router WAN link.',
    hint: 'Start with the largest department (IT & Dev with 55 hosts ➜ requires /26), then allocate Sales (/27), HR (/28), and the WAN link (/30).',
    departments: [
      { name: 'IT & Dev Lab', hostsNeeded: 55 },
      { name: 'Sales & Marketing', hostsNeeded: 26 },
      { name: 'HR & Accounting', hostsNeeded: 12 },
      { name: 'Router WAN Link', hostsNeeded: 2 }
    ]
  },
  {
    id: 'scen_corporate_hq',
    tier: 'Intermediate',
    title: 'Corporate Headquarters Multi-VLAN',
    baseNetwork: '172.16.0.0/23',
    description: 'Corporate IT has allocated 172.16.0.0/23 (510 usable hosts). Design non-overlapping subnets for 5 departments and 2 redundant point-to-point links.',
    hint: 'Sort descending: Engineering (130 hosts ➜ /24), Operations (70 hosts ➜ /25), Finance (35 hosts ➜ /26), R&D (20 hosts ➜ /27), Server Farm (10 hosts ➜ /28), and two /30 WAN links.',
    departments: [
      { name: 'Engineering LAN', hostsNeeded: 130 },
      { name: 'Operations LAN', hostsNeeded: 70 },
      { name: 'Finance & Legal', hostsNeeded: 35 },
      { name: 'R&D Testing Lab', hostsNeeded: 20 },
      { name: 'Server Farm DMZ', hostsNeeded: 10 },
      { name: 'WAN Link Primary', hostsNeeded: 2 },
      { name: 'WAN Link Backup', hostsNeeded: 2 }
    ]
  },
  {
    id: 'scen_campus_univ',
    tier: 'Advanced',
    title: 'University Campus Infrastructure',
    baseNetwork: '10.50.0.0/21',
    description: 'A university campus requires subnets for student computer labs, faculty Wi-Fi, administrative services, smart campus IoT devices, and VoIP phones carved from 10.50.0.0/21 (2046 usable hosts).',
    hint: 'Begin with Student Labs (460 hosts ➜ /23), followed by Faculty Wi-Fi (220 hosts ➜ /24), Admin (115 hosts ➜ /25), IoT (55 hosts ➜ /26), Voice (28 hosts ➜ /27), Management (12 hosts ➜ /28), and Firewall P2P (2 hosts ➜ /30).',
    departments: [
      { name: 'Student Computer Labs', hostsNeeded: 460 },
      { name: 'Faculty & Staff Wi-Fi', hostsNeeded: 220 },
      { name: 'Administrative Offices', hostsNeeded: 115 },
      { name: 'Smart Campus IoT Sensors', hostsNeeded: 55 },
      { name: 'VoIP IP Telephony', hostsNeeded: 28 },
      { name: 'Network Management SVI', hostsNeeded: 12 },
      { name: 'Firewall to Core Link', hostsNeeded: 2 }
    ]
  },
  {
    id: 'scen_isp_regional',
    tier: 'Enterprise',
    title: 'ISP Customer Subnet Allocation',
    baseNetwork: '172.20.4.0/22',
    description: 'An Internet Service Provider needs to allocate variable-sized customer subnet blocks and internal point-to-point transport links from a /22 allocation.',
    hint: 'Allocate Client Alpha (220 hosts ➜ /24), Client Beta (110 hosts ➜ /25), Client Gamma (50 hosts ➜ /26), NOC (24 hosts ➜ /27), and 3 point-to-point links (/30 each).',
    departments: [
      { name: 'Enterprise Client Alpha', hostsNeeded: 220 },
      { name: 'Business Client Beta', hostsNeeded: 110 },
      { name: 'Retail Client Gamma', hostsNeeded: 50 },
      { name: 'NOC Monitoring Center', hostsNeeded: 24 },
      { name: 'Backbone Link East', hostsNeeded: 2 },
      { name: 'Backbone Link West', hostsNeeded: 2 },
      { name: 'Edge BGP Peering Link', hostsNeeded: 2 }
    ]
  }
];

export class VLSMExerciseManager {
  /**
   * Get all curated scenarios.
   */
  static getCuratedScenarios() {
    return CURATED_VLSM_SCENARIOS;
  }

  /**
   * Get scenario by ID.
   */
  static getScenarioById(id) {
    return CURATED_VLSM_SCENARIOS.find(s => s.id === id) || CURATED_VLSM_SCENARIOS[0];
  }

  /**
   * Procedurally generate a new randomized VLSM scenario.
   * @param {'beginner'|'intermediate'|'advanced'} difficulty
   */
  static generateRandomScenario(difficulty = 'intermediate') {
    const deptPool = [
      'Engineering', 'Sales & Marketing', 'Customer Support', 'Human Resources',
      'Finance & Accounting', 'Research & Development', 'Data Center Servers',
      'Security Operations Center', 'Executive Suites', 'Guest Wi-Fi Network',
      'Warehouse Logistics', 'IoT Sensor Network', 'IP Surveillance Cameras',
      'Point-to-Point WAN 1', 'Point-to-Point WAN 2', 'Branch Office Link'
    ];

    let baseNetwork, depts = [];
    const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    if (difficulty === 'beginner') {
      const thirdOctet = rInt(1, 250);
      baseNetwork = `192.168.${thirdOctet}.0/24`;
      const h1 = rInt(45, 60);
      const h2 = rInt(20, 28);
      const h3 = rInt(8, 14);
      depts = [
        { name: deptPool[rInt(0, 3)], hostsNeeded: h1 },
        { name: deptPool[rInt(4, 7)], hostsNeeded: h2 },
        { name: deptPool[rInt(8, 11)], hostsNeeded: h3 },
        { name: 'Router WAN Link', hostsNeeded: 2 }
      ];
    } else if (difficulty === 'advanced') {
      const secondOctet = rInt(16, 31);
      const thirdOctet = (rInt(0, 31) * 4);
      baseNetwork = `172.${secondOctet}.${thirdOctet}.0/22`;
      const h1 = rInt(300, 480);
      const h2 = rInt(140, 230);
      const h3 = rInt(70, 115);
      const h4 = rInt(35, 55);
      const h5 = rInt(15, 26);
      depts = [
        { name: deptPool[0], hostsNeeded: h1 },
        { name: deptPool[1], hostsNeeded: h2 },
        { name: deptPool[2], hostsNeeded: h3 },
        { name: deptPool[4], hostsNeeded: h4 },
        { name: deptPool[6], hostsNeeded: h5 },
        { name: 'P2P WAN Link A', hostsNeeded: 2 },
        { name: 'P2P WAN Link B', hostsNeeded: 2 }
      ];
    } else {
      // Intermediate default (/23)
      const secondOctet = rInt(16, 31);
      const thirdOctet = (rInt(0, 60) * 2);
      baseNetwork = `172.${secondOctet}.${thirdOctet}.0/23`;
      const h1 = rInt(110, 125);
      const h2 = rInt(50, 60);
      const h3 = rInt(25, 28);
      const h4 = rInt(10, 14);
      depts = [
        { name: deptPool[rInt(0, 2)], hostsNeeded: h1 },
        { name: deptPool[rInt(3, 5)], hostsNeeded: h2 },
        { name: deptPool[rInt(6, 8)], hostsNeeded: h3 },
        { name: deptPool[rInt(9, 11)], hostsNeeded: h4 },
        { name: 'WAN Link Primary', hostsNeeded: 2 },
        { name: 'WAN Link Secondary', hostsNeeded: 2 }
      ];
    }

    // Shuffle department input order so player learns to sort descending
    const shuffledDepts = [...depts].sort(() => Math.random() - 0.5);

    return {
      id: `random_${Date.now()}`,
      tier: difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' (Procedural)',
      title: `Custom Challenge: ${baseNetwork}`,
      baseNetwork,
      description: `Procedurally generated challenge on ${baseNetwork}. Analyze department host requirements, sort by size, and solve the complete VLSM allocation.`,
      hint: 'Always sort departments in descending order of hosts needed before allocating CIDR blocks!',
      departments: shuffledDepts
    };
  }

  /**
   * Procedural Speed Drill Quiz Question Generator.
   * Generates dynamic multiple-choice and short-answer subnetting & VLSM questions.
   */
  static generateDrillQuestion() {
    const questionTypes = [
      'hostsToPrefix',
      'prefixToHosts',
      'nextSubnet',
      'overlapCheck',
      'broadcastIp',
      'firstUsableHost'
    ];

    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (type) {
      case 'hostsToPrefix': {
        const hostRequirements = [2, 6, 12, 28, 60, 120, 250, 500, 1000];
        const hosts = hostRequirements[Math.floor(Math.random() * hostRequirements.length)];
        const correctPrefix = VLSMCalculator.getPrefixForHosts(hosts);
        const correctMask = SC.cidrToMask(correctPrefix);

        const options = [
          `/${correctPrefix} (${correctMask})`,
          `/${correctPrefix - 1} (${SC.cidrToMask(correctPrefix - 1)})`,
          `/${correctPrefix + 1} (${SC.cidrToMask(correctPrefix + 1)})`,
          `/${correctPrefix + 2} (${SC.cidrToMask(correctPrefix + 2)})`
        ].sort(() => Math.random() - 0.5);

        return {
          type: 'hostsToPrefix',
          title: 'VLSM Prefix Selection',
          prompt: `What is the smallest CIDR prefix length (and subnet mask) required to support <strong>${hosts} usable hosts</strong>?`,
          correctAnswer: `/${correctPrefix} (${correctMask})`,
          options,
          explanation: `Formula: 2^h - 2 ≥ ${hosts}. With h = ${32 - correctPrefix} bits, 2^${32 - correctPrefix} - 2 = ${Math.pow(2, 32 - correctPrefix) - 2} usable hosts. Prefix = 32 - ${32 - correctPrefix} = /${correctPrefix} (${correctMask}).`
        };
      }

      case 'prefixToHosts': {
        const prefix = rInt(23, 30);
        const usableHosts = SC.getHostCount(prefix);
        const totalAddresses = Math.pow(2, 32 - prefix);

        const wrong1 = usableHosts + 2;
        const wrong2 = Math.max(0, Math.pow(2, 32 - prefix + 1) - 2);
        const wrong3 = Math.max(0, Math.floor(usableHosts / 2));

        const options = [
          String(usableHosts),
          String(wrong1),
          String(wrong2),
          String(wrong3)
        ].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5);

        return {
          type: 'prefixToHosts',
          title: 'Subnet Capacity Calculation',
          prompt: `How many <strong>usable host IP addresses</strong> are available in a <strong>/${prefix}</strong> (${SC.cidrToMask(prefix)}) subnet?`,
          correctAnswer: String(usableHosts),
          options,
          explanation: `Formula: 2^(32 - ${prefix}) - 2 = 2^${32 - prefix} - 2 = ${totalAddresses} - 2 = ${usableHosts} usable hosts.`
        };
      }

      case 'nextSubnet': {
        const baseIp = `192.168.${rInt(1, 100)}.0`;
        const prefix1 = 25; // 128 size
        const prefix2 = 26; // 64 size
        const net1 = baseIp;
        const bcast1 = SC.getBroadcastAddress(net1, SC.cidrToMask(prefix1));
        const nextNet = SC.intToIp(SC.ipToInt(bcast1) + 1);

        const options = [
          `${nextNet}/${prefix2}`,
          `${net1}/${prefix2}`,
          `192.168.1.192/${prefix2}`,
          `${SC.intToIp(SC.ipToInt(nextNet) + 32)}/${prefix2}`
        ].sort(() => Math.random() - 0.5);

        return {
          type: 'nextSubnet',
          title: 'Next Contiguous Subnet Calculation',
          prompt: `Subnet 1 is allocated as <code>${net1}/${prefix1}</code>. If the next department requires a <strong>/${prefix2}</strong> subnet, what is its valid starting network address?`,
          correctAnswer: `${nextNet}/${prefix2}`,
          options,
          explanation: `Subnet 1 (${net1}/${prefix1}) occupies ${net1} through ${bcast1}. The next contiguous available network address begins at ${nextNet}/${prefix2}.`
        };
      }

      case 'overlapCheck': {
        const overlap = Math.random() > 0.5;
        let subA, subB;
        if (overlap) {
          subA = '10.0.0.0/25'; // 0 - 127
          subB = '10.0.0.64/26'; // 64 - 127 (overlaps!)
        } else {
          subA = '10.0.0.0/25'; // 0 - 127
          subB = '10.0.0.128/26'; // 128 - 191 (non-overlapping)
        }

        return {
          type: 'overlapCheck',
          title: 'VLSM Overlap Detection',
          prompt: `Do these two subnets overlap? <br><strong>Subnet A:</strong> <code>${subA}</code><br><strong>Subnet B:</strong> <code>${subB}</code>`,
          correctAnswer: overlap ? 'Yes, they overlap' : 'No, they are non-overlapping',
          options: ['Yes, they overlap', 'No, they are non-overlapping'],
          explanation: overlap
            ? `Subnet A covers range 10.0.0.0 – 10.0.0.127. Subnet B covers 10.0.0.64 – 10.0.0.127, which falls completely inside Subnet A. This is an invalid VLSM conflict!`
            : `Subnet A covers 10.0.0.0 – 10.0.0.127. Subnet B begins at 10.0.0.128 – 10.0.0.191. They are contiguous and do not overlap.`
        };
      }

      case 'broadcastIp': {
        const third = rInt(1, 50);
        const prefix = [26, 27, 28, 29, 30][rInt(0, 4)];
        const mask = SC.cidrToMask(prefix);
        const blockSize = Math.pow(2, 32 - prefix);
        const netIp = `172.16.${third}.${rInt(0, 2) * blockSize}`;
        const bcast = SC.getBroadcastAddress(netIp, mask);

        const options = [
          bcast,
          SC.intToIp(SC.ipToInt(bcast) - 1),
          SC.intToIp(SC.ipToInt(bcast) + 1),
          SC.intToIp(SC.ipToInt(netIp) + 255)
        ].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5);

        return {
          type: 'broadcastIp',
          title: 'Broadcast Address Calculation',
          prompt: `What is the <strong>broadcast address</strong> for the subnet <code>${netIp}/${prefix}</code>?`,
          correctAnswer: bcast,
          options,
          explanation: `In a /${prefix} subnet (mask ${mask}), the block size is ${blockSize}. Network ${netIp} + (${blockSize} - 1) = ${bcast}.`
        };
      }

      case 'firstUsableHost':
      default: {
        const netIp = `10.${rInt(1, 20)}.${rInt(1, 20)}.0`;
        const prefix = 26;
        const first = SC.getFirstHost(netIp, SC.cidrToMask(prefix));
        const last = SC.getLastHost(netIp, SC.cidrToMask(prefix));

        const options = [
          first,
          netIp,
          last,
          SC.intToIp(SC.ipToInt(first) + 1)
        ].sort(() => Math.random() - 0.5);

        return {
          type: 'firstUsableHost',
          title: 'First Usable Host (Gateway)',
          prompt: `Given the subnet <code>${netIp}/${prefix}</code>, what is the <strong>first usable host IP address</strong> (standard router gateway)?`,
          correctAnswer: first,
          options,
          explanation: `The first usable host is always Network Address + 1 (i.e. ${netIp} + 1 = ${first}).`
        };
      }
    }
  }
}
