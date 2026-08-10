// src/subnetting/IPv6Exercises.js
// Curated CCNA IPv6 scenarios, EUI-64 labs, compression drills, and speed quizzes.

import { IPv6Calculator } from './IPv6Calculator.js';

export const CURATED_IPV6_SCENARIOS = [
  {
    id: 'ipv6_scen_campus_48',
    tier: 'Beginner',
    title: 'Enterprise /48 to /64 Subnetting',
    baseNetwork: '2001:db8:acad::/48',
    description: 'An enterprise network has been allocated the 48-bit global routing prefix 2001:db8:acad::/48. Carve five standard /64 subnets using hexadecimal Subnet IDs in the 4th hextet.',
    hint: 'Place the Subnet ID in the 4th hextet (e.g. Subnet 1 = 2001:db8:acad:1::/64, Subnet 2 = 2001:db8:acad:2::/64). Gateway is ::1.',
    departments: [
      { name: 'Engineering VLAN 10', subnetIdHex: '0001' },
      { name: 'Sales VLAN 20', subnetIdHex: '0002' },
      { name: 'HR VLAN 30', subnetIdHex: '0003' },
      { name: 'Data Center DMZ', subnetIdHex: '0010' },
      { name: 'Router P2P WAN Link', subnetIdHex: '00a0' }
    ]
  },
  {
    id: 'ipv6_scen_dual_stack',
    tier: 'Intermediate',
    title: 'Dual-Stack Corporate Branch Allocation',
    baseNetwork: '2001:db8:cafe::/48',
    description: 'Design an IPv6 addressing plan for a regional corporate branch. Allocate /64 subnets with organized hexadecimal department groups.',
    hint: 'Use the 4th hextet for your 16-bit Subnet ID. Executive = 0100, Operations = 0200, Wireless = 0300, Server Farm = 00ff, WAN = 000a.',
    departments: [
      { name: 'Executive Suite', subnetIdHex: '0100' },
      { name: 'Operations Floor', subnetIdHex: '0200' },
      { name: 'Staff Wi-Fi Network', subnetIdHex: '0300' },
      { name: 'Internal Server Farm', subnetIdHex: '00ff' },
      { name: 'Core Router Link', subnetIdHex: '000a' }
    ]
  },
  {
    id: 'ipv6_scen_isp_customer',
    tier: 'Advanced',
    title: 'ISP Customer /56 Subnet Delegations',
    baseNetwork: '2001:db8:1200::/56',
    description: 'An ISP assigns /64 subnets to enterprise customers from a delegated /56 block. Each customer receives a unique /64 subnet prefix.',
    hint: 'A /56 prefix leaves 8 bits (2 hex digits) for Subnet ID (range 00 to ff).',
    departments: [
      { name: 'Customer Alpha Branch', subnetIdHex: '0001' },
      { name: 'Customer Beta Branch', subnetIdHex: '0002' },
      { name: 'Customer Gamma Data Center', subnetIdHex: '0005' },
      { name: 'ISP Peering Point', subnetIdHex: '00f0' }
    ]
  }
];

export class IPv6ExerciseManager {
  static getCuratedScenarios() {
    return CURATED_IPV6_SCENARIOS;
  }

  static getScenarioById(id) {
    return CURATED_IPV6_SCENARIOS.find(s => s.id === id) || CURATED_IPV6_SCENARIOS[0];
  }

  /**
   * Procedurally generate a new randomized IPv6 scenario.
   */
  static generateRandomScenario() {
    const hexPrefix = (Math.floor(Math.random() * 0x8fff) + 0x1000).toString(16);
    const baseNetwork = `2001:db8:${hexPrefix}::/48`;

    const deptPool = [
      { name: 'Staff Workstations', sid: '0001' },
      { name: 'Wireless Guest APs', sid: '0002' },
      { name: 'Finance & Payroll', sid: '0003' },
      { name: 'Security Cameras', sid: '0010' },
      { name: 'Server Farm DMZ', sid: '0020' },
      { name: 'P2P WAN Link', sid: '00a1' }
    ];

    return {
      id: `ipv6_random_${Date.now()}`,
      tier: 'Procedural',
      title: `Custom IPv6 Challenge: ${baseNetwork}`,
      baseNetwork,
      description: `Procedurally generated IPv6 addressing plan on ${baseNetwork}. Assign /64 prefixes and router gateway addresses.`,
      hint: 'The 4th hextet is the 16-bit Subnet ID. First host address on each subnet is ::1.',
      departments: deptPool
    };
  }

  /**
   * Generate an IPv6 Speed Drill Question.
   */
  static generateDrillQuestion() {
    const drillTypes = ['compression', 'expansion', 'addressType', 'eui64', 'prefixSizing', 'loopbackMulticast'];
    const type = drillTypes[Math.floor(Math.random() * drillTypes.length)];
    const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (type) {
      case 'compression': {
        const fulls = [
          { full: '2001:0db8:0000:0000:0000:0000:0000:0001', comp: '2001:db8::1' },
          { full: 'fe80:0000:0000:0000:0000:0000:0000:0001', comp: 'fe80::1' },
          { full: '2001:0db8:0000:0001:0000:0000:0000:0001', comp: '2001:db8:0:1::1' },
          { full: 'ff02:0000:0000:0000:0000:0000:0000:0002', comp: 'ff02::2' },
          { full: '0000:0000:0000:0000:0000:0000:0000:0001', comp: '::1' }
        ];
        const pick = fulls[Math.floor(Math.random() * fulls.length)];
        const wrong1 = pick.comp.replace('::', ':0:');
        const wrong2 = pick.full.replace(/0000/g, '0');
        const wrong3 = pick.comp + ':0';

        const options = [pick.comp, wrong1, wrong2, wrong3].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5);

        return {
          type: 'compression',
          title: 'RFC 5952 Address Compression',
          prompt: `Compress the following full IPv6 address according to RFC 5952 rules:<br><code>${pick.full}</code>`,
          correctAnswer: pick.comp,
          options,
          explanation: `RFC 5952 Rules: 1) Omit leading zeros in every hextet. 2) Replace the longest contiguous run of all-zero hextets with a single '::'. Result: <code>${pick.comp}</code>.`
        };
      }

      case 'addressType': {
        const list = [
          { addr: '2001:db8:acad:1::1', type: 'Global Unicast (GUA)', exp: '2000::/3 range indicates Global Unicast (GUA), publicly routable.' },
          { addr: 'fe80::1', type: 'Link-Local (LLA)', exp: 'FE80::/10 indicates Link-Local Address (LLA), non-routable, used on local segment.' },
          { addr: 'fc00::1', type: 'Unique Local (ULA)', exp: 'FC00::/7 indicates Unique Local (ULA), private enterprise IPv6 space (RFC 4193).' },
          { addr: 'ff02::1', type: 'Multicast (All Nodes)', exp: 'FF00::/8 indicates Multicast. FF02::1 targets All IPv6 Nodes on the link.' },
          { addr: 'ff02::2', type: 'Multicast (All Routers)', exp: 'FF02::2 targets All IPv6 Routers on the link.' },
          { addr: '::1', type: 'Loopback', exp: '::1 is the IPv6 node loopback address (equivalent to 127.0.0.1 in IPv4).' }
        ];
        const pick = list[Math.floor(Math.random() * list.length)];
        const options = [
          'Global Unicast (GUA)',
          'Link-Local (LLA)',
          'Unique Local (ULA)',
          'Multicast (All Nodes)',
          'Loopback'
        ].filter(t => t === pick.type || true).slice(0, 4).sort(() => Math.random() - 0.5);

        if (!options.includes(pick.type)) options[0] = pick.type;

        return {
          type: 'addressType',
          title: 'IPv6 Address Scope & Type',
          prompt: `What type of IPv6 address is <code>${pick.addr}</code>?`,
          correctAnswer: pick.type,
          options: options.sort(() => Math.random() - 0.5),
          explanation: pick.exp
        };
      }

      case 'eui64': {
        const macs = [
          { mac: '00:11:22:33:44:55', eui: '0211:22ff:fe33:4455', bitExp: 'First byte 00 (00000000) ➜ flip bit 7 ➜ 02 (00000010), insert FFFE in middle.' },
          { mac: 'aa:bb:cc:11:22:33', eui: 'a8bb:ccff:fe11:2233', bitExp: 'First byte AA (10101010) ➜ flip bit 7 ➜ A8 (10101000), insert FFFE in middle.' },
          { mac: '02:00:4c:12:34:56', eui: '0000:4cff:fe12:3456', bitExp: 'First byte 02 (00000010) ➜ flip bit 7 ➜ 00 (00000000), insert FFFE in middle.' }
        ];
        const pick = macs[Math.floor(Math.random() * macs.length)];
        const wrong1 = pick.eui.replace('ff:fe', 'fe:ff');
        const wrong2 = pick.eui.replace(/^[0-9a-f]{4}/, 'ffff');
        const wrong3 = pick.eui.slice(0, 10) + '0000';

        const options = [pick.eui, wrong1, wrong2, wrong3].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5);

        return {
          type: 'eui64',
          title: 'EUI-64 Interface ID Generation',
          prompt: `Given MAC address <code>${pick.mac}</code>, what is the calculated <strong>64-bit EUI-64 Interface ID</strong>?`,
          correctAnswer: pick.eui,
          options,
          explanation: `Steps: 1) Split MAC at midpoint and insert FFFE. 2) Invert the 7th bit (Universal/Local bit) in the first octet. ${pick.bitExp}`
        };
      }

      case 'prefixSizing':
      default: {
        return {
          type: 'prefixSizing',
          title: 'IPv6 Subnetting Prefix Architecture',
          prompt: `In standard CCNA enterprise IPv6 network design with a <strong>/48 Global Routing Prefix</strong>, how many bits are allocated for the <strong>Subnet ID</strong> when using standard <strong>/64</strong> host subnets?`,
          correctAnswer: '16 bits (65,536 subnets)',
          options: [
            '16 bits (65,536 subnets)',
            '8 bits (256 subnets)',
            '32 bits (4.2 billion subnets)',
            '64 bits'
          ].sort(() => Math.random() - 0.5),
          explanation: 'Formula: 64 (Subnet prefix) - 48 (Global routing prefix) = 16 bits for Subnet ID (4th hextet), providing 2^16 = 65,536 /64 subnets.'
        };
      }
    }
  }
}
