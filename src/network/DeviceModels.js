// src/network/DeviceModels.js
// Central registry for all Cisco Packet Tracer intermediary device models

export const DEVICE_MODELS = {
  // ── 1. ENTERPRISE INTEGRATED SERVICES ROUTERS (ISRs) ──────────
  '4321': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 4000 Series',
    name: 'Cisco ISR 4321',
    description: 'Modern, high-performance enterprise router for secure WAN, hosting, advanced routing, and application visibility.',
    functions: 'Modern high-performance enterprise router designed for secure WAN connectivity, hosting, advanced routing, and application visibility. Supports Voice over IP (VoIP), unified communications, and advanced software-defined networking like Catalyst SD-WAN.',
    slots: '1 NIM slot, 1 SFP combo port, USB management ports',
    interfaces: [
      { name: 'GigabitEthernet0/0/0', shortName: 'G0/0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/1', shortName: 'G0/0/1', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  'ISR4321': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 4000 Series',
    name: 'Cisco ISR 4321',
    description: 'Modern, high-performance enterprise router for secure WAN, hosting, advanced routing, and application visibility.',
    functions: 'Modern high-performance enterprise router designed for secure WAN connectivity, hosting, advanced routing, and application visibility. Supports Voice over IP (VoIP), unified communications, and advanced software-defined networking like Catalyst SD-WAN.',
    slots: '1 NIM slot, 1 SFP combo port, USB management ports',
    interfaces: [
      { name: 'GigabitEthernet0/0/0', shortName: 'G0/0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/1', shortName: 'G0/0/1', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  '4331': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 4000 Series',
    name: 'Cisco ISR 4331',
    description: 'High-performance enterprise router with 3 GE ports (2 SFP), NIM slots, and Catalyst SD-WAN support.',
    functions: 'Modern high-performance enterprise router designed for secure WAN connectivity, hosting, advanced routing, and application visibility. Supports Voice over IP (VoIP), unified communications, and advanced software-defined networking like Catalyst SD-WAN.',
    slots: '2 NIM slots, 1 Service Module slot, 2 SFP fiber slots, USB management ports',
    interfaces: [
      { name: 'GigabitEthernet0/0/0', shortName: 'G0/0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/1', shortName: 'G0/0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/2', shortName: 'G0/0/2', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  'ISR4331': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 4000 Series',
    name: 'Cisco ISR 4331',
    description: 'High-performance enterprise router with 3 GE ports (2 SFP), NIM slots, and Catalyst SD-WAN support.',
    functions: 'Modern high-performance enterprise router designed for secure WAN connectivity, hosting, advanced routing, and application visibility. Supports Voice over IP (VoIP), unified communications, and advanced software-defined networking like Catalyst SD-WAN.',
    slots: '2 NIM slots, 1 Service Module slot, 2 SFP fiber slots, USB management ports',
    interfaces: [
      { name: 'GigabitEthernet0/0/0', shortName: 'G0/0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/1', shortName: 'G0/0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/2', shortName: 'G0/0/2', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  '1941': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 1900 Series',
    name: 'Cisco 1941 ISR',
    description: 'Integrated Services Router G2 with 2 GE ports & 2 EHWIC slots.',
    functions: 'Built to consolidate data, security, wireless, and mobility services for small to medium branch offices. Provides hardware-accelerated IPSec VPN capabilities and high performance for concurrent services.',
    slots: '2 EHWIC slots for modular expansion',
    interfaces: [
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  '2901': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 2900 Series',
    name: 'Cisco 2901 ISR',
    description: 'Integrated Services Router G2 with 2 GE ports, 4 EHWIC slots & voice gateway support.',
    functions: 'Built to consolidate data, security, wireless, and mobility services for small to medium branch offices. Provides hardware-accelerated IPSec VPN capabilities and internal Digital Signal Processor (DSP) slots to support voice and video gateways.',
    slots: '4 EHWIC slots, internal DSP slots for voice/video gateways',
    interfaces: [
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  '2911': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 2900 Series',
    name: 'Cisco 2911 ISR',
    description: 'Integrated Services Router G2 with 3 GE ports, 4 EHWIC slots & voice gateway support.',
    functions: 'Built to consolidate data, security, wireless, and mobility services for small to medium branch offices. Provides hardware-accelerated IPSec VPN capabilities and internal Digital Signal Processor (DSP) slots to support voice and video gateways.',
    slots: '4 EHWIC slots, internal DSP slots for voice/video gateways',
    interfaces: [
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  '1841': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 1800 Series',
    name: 'Cisco 1841 ISR',
    description: 'Modular Legacy ISR with 2 Fast Ethernet ports & 2 WIC slots.',
    functions: 'Primarily designed for secure, basic data connectivity in small businesses with hardware-based encryption and VPN support.',
    slots: '2 WIC/HWIC slots for serial lines, T1/E1, or analog modems',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  '2811': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 2800 Series',
    name: 'Cisco 2811 ISR',
    description: 'Legacy ISR with 2 Fast Ethernet ports, integrated voice/video & 4 HWIC slots.',
    functions: 'Legacy ISR providing integrated voice and video support alongside data routing and advanced security for branch offices.',
    slots: '4 WIC/HWIC slots for serial lines, T1/E1, or analog modems',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  '2620XM': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 2600 Series',
    name: 'Cisco 2620XM',
    description: 'End-of-life modular access router with 1 Fast Ethernet port.',
    functions: 'End-of-life modular access router that was once the standard for small branch offices, handling basic routing, VPNs, and legacy voice services.',
    slots: 'WIC and Network Module (NM) slots for WAN connectivity',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: false }
    ]
  },
  '2621XM': {
    family: 'router',
    category: 'Enterprise Integrated Services Routers (ISRs)',
    series: 'Cisco 2600 Series',
    name: 'Cisco 2621XM',
    description: 'End-of-life modular access router with dual Fast Ethernet ports.',
    functions: 'End-of-life modular access router that was once the standard for small branch offices, handling basic routing, VPNs, and legacy voice services.',
    slots: 'WIC and Network Module (NM) slots for WAN connectivity',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: false },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: false }
    ]
  },

  // ── 2. INDUSTRIAL & CONNECTED GRID ROUTERS ────────────────────
  '819HGW': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco 800 Series',
    name: 'Cisco 819HGW Cellular & Wi-Fi Router',
    description: 'Ruggedized IoT/M2M Gateway Router with 4 FE LAN ports, 1 GE WAN, 3G/4G LTE & Integrated Wi-Fi.',
    functions: 'Fixed-configuration, ruggedized router deployed for Internet of Things (IoT), Machine-to-Machine (M2M) communication, and remote sites. Provides robust multiprotocol routing, advanced security features (firewalls, intrusion prevention), and integrated Wi-Fi (WLAN) access points.',
    slots: 'Embedded 3G/4G LTE cellular modem, integrated Wi-Fi access point radio',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/2', shortName: 'Fa0/2', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/3', shortName: 'Fa0/3', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Cellular0', shortName: 'Cell0', speed: '100', duplex: 'full', autoMdix: false },
      { name: 'Dot11Radio0', shortName: 'WiFi', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  '819HG-4G-IOX': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco 800 Series',
    name: 'Cisco 819HG-4G-IOX Industrial Gateway',
    description: 'Ruggedized M2M Cellular Gateway Router with Cisco IOx edge computing capabilities.',
    functions: 'Fixed-configuration, ruggedized router deployed for Internet of Things (IoT), Machine-to-Machine (M2M) communication, and remote edge sites. Provides robust multiprotocol routing, advanced firewall, intrusion prevention, and Cisco IOx edge application hosting environment.',
    slots: 'Embedded 3G/4G LTE cellular modem, IOx edge application execution platform',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/2', shortName: 'Fa0/2', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/3', shortName: 'Fa0/3', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Cellular0', shortName: 'Cell0', speed: '100', duplex: 'full', autoMdix: false }
    ]
  },
  '819HG-4G': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco 800 Series',
    name: 'Cisco 819HG-4G Industrial Gateway',
    description: 'Industrial M2M Cellular Gateway Router with 4 FE ports and 1 GE WAN.',
    functions: 'Fixed-configuration, ruggedized router deployed for Internet of Things (IoT) and Machine-to-Machine (M2M) communication. Provides robust multiprotocol routing and advanced security (firewalls & IPS).',
    slots: 'Embedded 3G/4G LTE cellular modem',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Cellular0', shortName: 'Cell0', speed: '100', duplex: 'full', autoMdix: false }
    ]
  },
  '829': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco 800 Series',
    name: 'Cisco 829 Industrial Router',
    description: 'Ruggedized Industrial 4G LTE Router with 4 FE LAN ports & 1 GE WAN.',
    functions: 'Fixed-configuration, ruggedized router deployed for Internet of Things (IoT), Machine-to-Machine (M2M) communication, transportation fleets, and remote sites. Provides robust multiprotocol routing and advanced security (firewalls & intrusion prevention).',
    slots: 'Dual 3G/4G LTE cellular modem slots',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/2', shortName: 'Fa0/2', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/3', shortName: 'Fa0/3', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Cellular0', shortName: 'Cell0', speed: '100', duplex: 'full', autoMdix: false }
    ]
  },
  'CGR1240': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco CGR 1000 Series',
    name: 'Cisco CGR 1240 Connected Grid Router',
    description: 'Ruggedized outdoor pole-mounted communication platform for Field Area Networks (FAN).',
    functions: 'Highly ruggedized communication platform specifically designed for outdoor, pole-mounted use in Field Area Network (FAN) power distribution grids. Links power generation systems over long distances.',
    slots: 'Specialized protective cover plate, SFP module slots (100BASE-FX / 1000BASE-T)',
    interfaces: [
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Dot11Radio0', shortName: 'WiFi', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  '1240': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco CGR 1000 Series',
    name: 'Cisco CGR 1240 Connected Grid Router',
    description: 'Ruggedized outdoor pole-mounted communication platform for Field Area Networks (FAN).',
    functions: 'Highly ruggedized communication platform specifically designed for outdoor, pole-mounted use in Field Area Network (FAN) power distribution grids. Links power generation systems over long distances.',
    slots: 'Specialized protective cover plate, SFP module slots (100BASE-FX / 1000BASE-T)',
    interfaces: [
      { name: 'GigabitEthernet0/0', shortName: 'G0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Dot11Radio0', shortName: 'WiFi', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  'IR1101': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco Industrial Routers',
    name: 'Cisco IR1101 Industrial ISR',
    description: 'Modular industrial router for edge computing, SCADA hardware, and heavy IoT.',
    functions: 'Modular industrial router built to withstand harsh environments like manufacturing plants, transportation systems, and utility substations. Handles edge computing tasks and secure data routing for heavy industrial IoT equipment.',
    slots: 'Modular cellular/5G slots, SCADA legacy serial interface modules',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/0', shortName: 'G0/0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Serial0/0/0', shortName: 'Se0/0/0', speed: '0.115', duplex: 'full', autoMdix: false },
      { name: 'Cellular0', shortName: 'Cell0', speed: '100', duplex: 'full', autoMdix: false }
    ]
  },
  'IR8340': {
    family: 'router',
    category: 'Industrial & Connected Grid Routers',
    series: 'Cisco Industrial Routers',
    name: 'Cisco IR8340 Industrial Router',
    description: 'Heavy modular industrial router with 5G cellular slots, GE/SFP ports, and SCADA serial interfaces.',
    functions: 'Modular industrial router built to withstand harsh environments like manufacturing plants, transportation systems, and utility substations. Handles edge computing tasks and secure data routing for heavy industrial IoT equipment and older SCADA hardware management.',
    slots: 'Modular cellular/5G slots, SFP fiber WAN slots, SCADA legacy serial interface modules',
    interfaces: [
      { name: 'GigabitEthernet0/0/0', shortName: 'G0/0/0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/1', shortName: 'G0/0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/0/2', shortName: 'G0/0/2', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Serial0/0/0', shortName: 'Se0/0/0', speed: '0.115', duplex: 'full', autoMdix: false },
      { name: 'Cellular0', shortName: 'Cell0', speed: '100', duplex: 'full', autoMdix: false }
    ]
  },

  // ── 3. GENERIC SIMULATION ROUTERS ────────────────────────────
  'PT-Router': {
    family: 'router',
    category: 'Generic Simulation Routers',
    series: 'Generic Simulation Routers',
    name: 'Router-PT (Generic)',
    description: 'Generic simulation router equipped with 10 open expansion slots, Console & Aux ports.',
    functions: 'Software-only simulation router that does not represent a physical Cisco product. Utilized strictly in network simulation environments to practice hardware configuration, module installation, and network topology planning.',
    slots: '10 open expansion slots, 1 console port, 1 auxiliary port',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Serial0/0/0', shortName: 'Se0/0/0', speed: '1.544', duplex: 'full', autoMdix: false },
      { name: 'Serial0/0/1', shortName: 'Se0/0/1', speed: '1.544', duplex: 'full', autoMdix: false }
    ]
  },
  'Router-PT': {
    family: 'router',
    category: 'Generic Simulation Routers',
    series: 'Generic Simulation Routers',
    name: 'Router-PT (Generic)',
    description: 'Generic simulation router equipped with 10 open expansion slots, Console & Aux ports.',
    functions: 'Software-only simulation router that does not represent a physical Cisco product. Utilized strictly in network simulation environments to practice hardware configuration, module installation, and network topology planning.',
    slots: '10 open expansion slots, 1 console port, 1 auxiliary port',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Serial0/0/0', shortName: 'Se0/0/0', speed: '1.544', duplex: 'full', autoMdix: false },
      { name: 'Serial0/0/1', shortName: 'Se0/0/1', speed: '1.544', duplex: 'full', autoMdix: false }
    ]
  },
  'PT-Empty-Router': {
    family: 'router',
    category: 'Generic Simulation Routers',
    series: 'Generic Simulation Routers',
    name: 'Router-PT-Empty',
    description: 'Blank modular simulation router chassis allowing custom module population from scratch.',
    functions: 'Software-only simulation router providing a blank chassis, allowing the user to populate it from scratch with modules like Fast Ethernet, Gigabit Ethernet, and synchronous/asynchronous Serial interfaces.',
    slots: 'Blank chassis with 10 open modular expansion slots, 1 console port, 1 auxiliary port',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  'Router-PT-Empty': {
    family: 'router',
    category: 'Generic Simulation Routers',
    series: 'Generic Simulation Routers',
    name: 'Router-PT-Empty',
    description: 'Blank modular simulation router chassis allowing custom module population from scratch.',
    functions: 'Software-only simulation router providing a blank chassis, allowing the user to populate it from scratch with modules like Fast Ethernet, Gigabit Ethernet, and synchronous/asynchronous Serial interfaces.',
    slots: 'Blank chassis with 10 open modular expansion slots, 1 console port, 1 auxiliary port',
    interfaces: [
      { name: 'FastEthernet0/0', shortName: 'Fa0/0', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },

  // ── SWITCHES (LAYER 2 & LAYER 3) & BRIDGES ─────────────────────
  '2960-24TT': {
    family: 'switch',
    category: 'Layer 2 Enterprise Access Switches',
    series: 'Catalyst 2960 Series',
    name: 'Catalyst 2960-24TT',
    description: '24 FastEthernet ports + 2 GigabitEthernet copper uplinks.',
    functions: 'Fixed-configuration Layer 2 enterprise access switch providing FastEthernet desktop connectivity with dual GE uplinks, VLANs, 802.1Q trunking, STP/RSTP, and port security.',
    slots: 'Fixed chassis with 24 10/100 ports + 2 10/100/1000 uplinks',
    interfaces: Array.from({ length: 24 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1
    })).concat([
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ])
  },
  '2950-24': {
    family: 'switch',
    category: 'Layer 2 Enterprise Access Switches',
    series: 'Catalyst 2950 Series',
    name: 'Catalyst 2950-24',
    description: '24 FastEthernet ports.',
    functions: 'Legacy Layer 2 wire-speed FastEthernet switch for basic LAN desktop connectivity, VLAN segmentation, and STP.',
    slots: 'Fixed chassis with 24 10/100 FastEthernet ports',
    interfaces: Array.from({ length: 24 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: false, vlanId: 1
    }))
  },
  '2950T-24': {
    family: 'switch',
    category: 'Layer 2 Enterprise Access Switches',
    series: 'Catalyst 2950 Series',
    name: 'Catalyst 2950T-24',
    description: '24 FastEthernet ports + 2 GigabitEthernet copper uplinks.',
    functions: 'Legacy Layer 2 switch providing 24 FastEthernet ports with dual GigabitEthernet copper uplinks for high-speed core/distribution connection.',
    slots: 'Fixed chassis with 24 10/100 ports + 2 10/100/1000 uplinks',
    interfaces: Array.from({ length: 24 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: false, vlanId: 1
    })).concat([
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ])
  },
  'IE-2000': {
    family: 'switch',
    category: 'Industrial Ethernet Switches',
    series: 'Cisco IE 2000 Series',
    name: 'Cisco IE-2000 Industrial Switch',
    description: 'Ruggedized DIN-rail Layer 2 Industrial Switch with 4 FE ports and 2 GE combo uplinks.',
    functions: 'Compact DIN-rail industrial switch built for extreme environments (factories, substations, intelligent transportation systems). Secure Layer 2 switching, CIP/PROFINET industrial protocol support.',
    slots: 'DIN-rail mount compact industrial chassis with 4 FE + 2 GE combo ports',
    interfaces: Array.from({ length: 4 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1
    })).concat([
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ])
  },
  'IE-3400': {
    family: 'l3switch',
    category: 'Industrial Ethernet Switches',
    series: 'Cisco Catalyst IE3400 Rugged Series',
    name: 'Cisco Catalyst IE-3400 Industrial L3 Switch',
    description: 'Modular DIN-rail Layer 3 Multilayer Industrial Switch with advanced security and PoE+ support.',
    functions: 'Advanced modular industrial Layer 3 multilayer switch for harsh environments. Supports inter-VLAN routing, advanced security, Cisco DNA Center management, high PoE+ power budgets, and sub-second ring resiliency (REP).',
    slots: 'Modular expandable DIN-rail chassis, support for expansion modules (GE/PoE+)',
    interfaces: Array.from({ length: 8 }, (_, i) => ({
      name: `GigabitEthernet1/0/${i + 1}`, shortName: `G1/0/${i + 1}`, speed: '1000', duplex: 'auto', autoMdix: true, poe: true, vlanId: 1
    })).concat([
      { name: 'GigabitEthernet1/1/1', shortName: 'G1/1/1', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 },
      { name: 'GigabitEthernet1/1/2', shortName: 'G1/1/2', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ])
  },
  'IE-9320': {
    family: 'l3switch',
    category: 'Industrial Ethernet Switches',
    series: 'Cisco Catalyst IE9300 / IE9320 Series',
    name: 'Cisco Catalyst IE-9320 Industrial L3 Switch',
    description: 'High-density rack-mount Layer 3 Industrial Multilayer Switch for utility & substation automation.',
    functions: 'High-density 19-inch rack-mount industrial Layer 3 switch for utility power substations, smart grid, and railway control. Supports hardware-rate Layer 3 routing, IEEE 1588 precision timing (PTP), and zero-loss redundancy (PRP/HSR).',
    slots: 'High-density rack-mount chassis with 24 GE ports + 4 10G SFP+ fiber uplinks',
    interfaces: Array.from({ length: 24 }, (_, i) => ({
      name: `GigabitEthernet1/0/${i + 1}`, shortName: `G1/0/${i + 1}`, speed: '1000', duplex: 'auto', autoMdix: true, poe: true, vlanId: 1
    })).concat([
      { name: 'TenGigabitEthernet1/1/1', shortName: 'Te1/1/1', speed: '10000', duplex: 'full', autoMdix: true, vlanId: 1 },
      { name: 'TenGigabitEthernet1/1/2', shortName: 'Te1/1/2', speed: '10000', duplex: 'full', autoMdix: true, vlanId: 1 },
      { name: 'TenGigabitEthernet1/1/3', shortName: 'Te1/1/3', speed: '10000', duplex: 'full', autoMdix: true, vlanId: 1 },
      { name: 'TenGigabitEthernet1/1/4', shortName: 'Te1/1/4', speed: '10000', duplex: 'full', autoMdix: true, vlanId: 1 }
    ])
  },
  'PT-Switch': {
    family: 'switch',
    category: 'Generic Simulation Switches & Bridges',
    series: 'Generic Simulation Devices',
    name: 'Switch-PT (Generic)',
    description: 'Generic 6-port FastEthernet Layer 2 simulation switch.',
    functions: 'Software-only simulation switch utilized strictly in lab environments to practice basic Ethernet switching, VLAN configuration, and MAC table operation.',
    slots: 'Generic chassis with 6 FastEthernet ports',
    interfaces: Array.from({ length: 6 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1
    }))
  },
  'Switch-PT': {
    family: 'switch',
    category: 'Generic Simulation Switches & Bridges',
    series: 'Generic Simulation Devices',
    name: 'Switch-PT (Generic)',
    description: 'Generic 6-port FastEthernet Layer 2 simulation switch.',
    functions: 'Software-only simulation switch utilized strictly in lab environments to practice basic Ethernet switching, VLAN configuration, and MAC table operation.',
    slots: 'Generic chassis with 6 FastEthernet ports',
    interfaces: Array.from({ length: 6 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1
    }))
  },
  'PT-Empty-Switch': {
    family: 'switch',
    category: 'Generic Simulation Switches & Bridges',
    series: 'Generic Simulation Devices',
    name: 'Switch-PT-Empty',
    description: 'Generic empty modular simulation switch chassis.',
    functions: 'Blank modular simulation switch chassis for custom module population (FastEthernet, GigabitEthernet, Fiber) from scratch.',
    slots: 'Blank chassis with 10 open modular expansion slots',
    interfaces: [
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ]
  },
  'Switch-PT-Empty': {
    family: 'switch',
    category: 'Generic Simulation Switches & Bridges',
    series: 'Generic Simulation Devices',
    name: 'Switch-PT-Empty',
    description: 'Generic empty modular simulation switch chassis.',
    functions: 'Blank modular simulation switch chassis for custom module population (FastEthernet, GigabitEthernet, Fiber) from scratch.',
    slots: 'Blank chassis with 10 open modular expansion slots',
    interfaces: [
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ]
  },
  '3560-24PS': {
    family: 'l3switch',
    category: 'Layer 3 Multilayer Switches',
    series: 'Catalyst 3560 Series',
    name: 'Catalyst 3560-24PS',
    description: '24 FastEthernet PoE ports + 2 SFP Gigabit ports, Layer 3 Routing.',
    functions: 'Enterprise Layer 3 multilayer switch providing IP routing (OSPF, EIGRP, RIP), 802.3af PoE for IP phones/APs, inter-VLAN routing, and hardware Access Control Lists (ACLs).',
    slots: 'Fixed 1RU chassis with 24 10/100 PoE ports + 2 SFP Gigabit ports',
    interfaces: Array.from({ length: 24 }, (_, i) => ({
      name: `FastEthernet0/${i + 1}`, shortName: `Fa0/${i + 1}`, speed: '100', duplex: 'auto', autoMdix: true, poe: true, vlanId: 1
    })).concat([
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true, vlanId: 1 }
    ])
  },
  '3650-24PS': {
    family: 'l3switch',
    category: 'Layer 3 Multilayer Switches',
    series: 'Catalyst 3650 Series',
    name: 'Catalyst 3650-24PS',
    description: '24 GigabitEthernet PoE+ ports + 2 10G SFP+ uplinks, Layer 3 Multilayer.',
    functions: 'Next-generation standalone & stackable Layer 3 multilayer switch with integrated wireless controller capability, full PoE+, 10G SFP+ uplinks, Cisco StackWise-160, and advanced IPv4/IPv6 routing.',
    slots: '1RU modular uplink chassis with 24 10/100/1000 PoE+ ports + 2 10G SFP+ uplinks',
    interfaces: Array.from({ length: 24 }, (_, i) => ({
      name: `GigabitEthernet1/0/${i + 1}`, shortName: `G1/0/${i + 1}`, speed: '1000', duplex: 'auto', autoMdix: true, poe: true, vlanId: 1
    })).concat([
      { name: 'TenGigabitEthernet1/1/1', shortName: 'Te1/1/1', speed: '10000', duplex: 'full', autoMdix: true, vlanId: 1 },
      { name: 'TenGigabitEthernet1/1/2', shortName: 'Te1/1/2', speed: '10000', duplex: 'full', autoMdix: true, vlanId: 1 }
    ])
  },
  'PT-Bridge': {
    family: 'bridge',
    category: 'Generic Simulation Switches & Bridges',
    series: 'Generic Simulation Devices',
    name: 'Bridge-PT (Generic)',
    description: 'Generic 2-port Layer 2 Ethernet Bridge.',
    functions: 'Legacy Layer 2 network bridge that micro-segments collision domains across 2 Ethernet segments based on hardware MAC addresses.',
    slots: '2 FastEthernet bridge ports',
    interfaces: [
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/2', shortName: 'Fa0/2', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  'Bridge-PT': {
    family: 'bridge',
    category: 'Generic Simulation Switches & Bridges',
    series: 'Generic Simulation Devices',
    name: 'Bridge-PT (Generic)',
    description: 'Generic 2-port Layer 2 Ethernet Bridge.',
    functions: 'Legacy Layer 2 network bridge that micro-segments collision domains across 2 Ethernet segments based on hardware MAC addresses.',
    slots: '2 FastEthernet bridge ports',
    interfaces: [
      { name: 'FastEthernet0/1', shortName: 'Fa0/1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'FastEthernet0/2', shortName: 'Fa0/2', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },

  // ── WIRELESS ACCESS POINTS (AUTONOMOUS & LIGHTWEIGHT) ───────────
  'AccessPoint-PT': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT',
    description: 'Generic 802.11b/g Wireless Access Point with 1 GigabitEthernet uplink port.',
    functions: 'Standard autonomous Layer 2 wireless access point bridging 802.11b/g wireless clients to a wired Ethernet LAN network.',
    slots: '1 GigabitEthernet RJ-45 port, 2.4GHz internal antenna',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  'AP-PT': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT',
    description: 'Generic 802.11b/g Wireless Access Point with 1 GigabitEthernet uplink port.',
    functions: 'Standard autonomous Layer 2 wireless access point bridging 802.11b/g wireless clients to a wired Ethernet LAN network.',
    slots: '1 GigabitEthernet RJ-45 port, 2.4GHz internal antenna',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  'AccessPoint-PT-A': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-A',
    description: '802.11a 5GHz Wireless Access Point with 1 GigabitEthernet uplink port.',
    functions: 'Autonomous Layer 2 wireless access point operating in the 5GHz frequency band for high-density, low-interference wireless LAN connectivity.',
    slots: '1 GigabitEthernet RJ-45 port, 5GHz internal antenna',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-5G', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  'AP-PT-A': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-A',
    description: '802.11a 5GHz Wireless Access Point with 1 GigabitEthernet uplink port.',
    functions: 'Autonomous Layer 2 wireless access point operating in the 5GHz frequency band for high-density, low-interference wireless LAN connectivity.',
    slots: '1 GigabitEthernet RJ-45 port, 5GHz internal antenna',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-5G', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },
  'AccessPoint-PT-N': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-N',
    description: '802.11n 2.4GHz Wireless Access Point with 1 GigabitEthernet uplink port.',
    functions: 'High-speed autonomous Layer 2 wireless access point utilizing 802.11n MIMO technology for improved coverage and up to 300 Mbps bandwidth.',
    slots: '1 GigabitEthernet RJ-45 port, 2.4GHz MIMO antennas',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-N', speed: '300', duplex: 'half', autoMdix: false }
    ]
  },
  'AP-PT-N': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-N',
    description: '802.11n 2.4GHz Wireless Access Point with 1 GigabitEthernet uplink port.',
    functions: 'High-speed autonomous Layer 2 wireless access point utilizing 802.11n MIMO technology for improved coverage and up to 300 Mbps bandwidth.',
    slots: '1 GigabitEthernet RJ-45 port, 2.4GHz MIMO antennas',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-N', speed: '300', duplex: 'half', autoMdix: false }
    ]
  },
  'AccessPoint-PT-AC': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-AC',
    description: 'Dual-Band 802.11ac Gigabit Wireless Access Point with concurrent 2.4GHz & 5GHz radios.',
    functions: 'High-performance dual-band wireless access point supporting 802.11ac Wave 2 gigabit wireless speeds and beamforming across concurrent frequencies.',
    slots: '1 GigabitEthernet RJ-45 port, dual-band internal antennas',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-2.4G', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'Port2', shortName: 'WiFi-5G', speed: '867', duplex: 'half', autoMdix: false }
    ]
  },
  'AP-PT-AC': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-AC',
    description: 'Dual-Band 802.11ac Gigabit Wireless Access Point with concurrent 2.4GHz & 5GHz radios.',
    functions: 'High-performance dual-band wireless access point supporting 802.11ac Wave 2 gigabit wireless speeds and beamforming across concurrent frequencies.',
    slots: '1 GigabitEthernet RJ-45 port, dual-band internal antennas',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-2.4G', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'Port2', shortName: 'WiFi-5G', speed: '867', duplex: 'half', autoMdix: false }
    ]
  },
  'AP-AC-N': {
    family: 'ap',
    category: 'Wireless Access Points',
    series: 'Generic Simulation AP',
    name: 'AccessPoint-PT-AC',
    description: 'Dual-Band 802.11ac Gigabit Wireless Access Point',
    interfaces: [
      { name: 'Port0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Port1', shortName: 'WiFi-2.4G', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'Port2', shortName: 'WiFi-5G', speed: '867', duplex: 'half', autoMdix: false }
    ]
  },
  'LAP-PT': {
    family: 'ap',
    category: 'Lightweight Access Points (LAP)',
    series: 'Cisco Lightweight Wireless',
    name: 'LAP-PT',
    description: 'Generic Lightweight Access Point for Cisco Wireless LAN Controller (WLC) integration.',
    functions: 'Lightweight Access Point (LAP) operating in split-MAC architecture. Automatically establishes secure CAPWAP/LWAPP tunnels to a Cisco WLC for centralized RF management, authentication, and roaming.',
    slots: '1 GigabitEthernet RJ-45 PoE port, integrated antenna array',
    interfaces: [
      { name: 'GigabitEthernet0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'Dot11Radio0', shortName: 'WiFi', speed: '450', duplex: 'half', autoMdix: false }
    ]
  },
  '3702i': {
    family: 'ap',
    category: 'Lightweight Access Points (LAP)',
    series: 'Cisco Aironet 3700 Series',
    name: 'Cisco Aironet 3702i',
    description: 'Enterprise 802.11ac Wave 1 Lightweight AP with 4x4 MIMO and Cisco CleanAir.',
    functions: 'Enterprise-grade lightweight 802.11ac access point featuring 4x4 MIMO with 3 spatial streams, Cisco CleanAir proactive spectrum intelligence, and ClientLink 3.0 beamforming. Managed exclusively via Cisco WLC controllers.',
    slots: '1 GigabitEthernet PoE+ uplink, 1 Management Console port, dual-band CleanAir radios',
    interfaces: [
      { name: 'GigabitEthernet0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'Dot11Radio0', shortName: 'WiFi-2.4G', speed: '450', duplex: 'half', autoMdix: false },
      { name: 'Dot11Radio1', shortName: 'WiFi-5G', speed: '1300', duplex: 'half', autoMdix: false }
    ]
  },
  'LAP-3702i': {
    family: 'ap',
    category: 'Lightweight Access Points (LAP)',
    series: 'Cisco Aironet 3700 Series',
    name: 'Cisco Aironet 3702i',
    description: 'Enterprise 802.11ac Wave 1 Lightweight AP with 4x4 MIMO and Cisco CleanAir.',
    functions: 'Enterprise-grade lightweight 802.11ac access point featuring 4x4 MIMO with 3 spatial streams, Cisco CleanAir proactive spectrum intelligence, and ClientLink 3.0 beamforming.',
    slots: '1 GigabitEthernet PoE+ uplink, dual-band CleanAir radios',
    interfaces: [
      { name: 'GigabitEthernet0', shortName: 'G0', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'Dot11Radio0', shortName: 'WiFi-2.4G', speed: '450', duplex: 'half', autoMdix: false },
      { name: 'Dot11Radio1', shortName: 'WiFi-5G', speed: '1300', duplex: 'half', autoMdix: false }
    ]
  },
  'LAP-1130AG': {
    family: 'ap',
    category: 'Lightweight Access Points (LAP)',
    series: 'Cisco Aironet 1130 Series',
    name: 'Cisco LAP-1130AG',
    description: 'Autonomous/Lightweight Access Point with dual 802.11a/g radios.',
    functions: 'Legacy enterprise wireless access point supporting autonomous or lightweight CAPWAP operation.',
    slots: '1 FastEthernet PoE port',
    interfaces: [
      { name: 'FastEthernet0', shortName: 'Fa0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Dot11Radio0', shortName: 'WiFi', speed: '54', duplex: 'half', autoMdix: false }
    ]
  },

  // ── WIRELESS ROUTERS & HOME GATEWAYS ───────────────────────────
  'HomeRouter-PT-AC': {
    family: 'wirelessrouter',
    category: 'Wireless Routers & Home Gateways',
    series: 'Cisco Home Routers',
    name: 'HomeRouter-PT-AC',
    description: 'Dual-Band 802.11ac Wireless Home Router with 1 Gigabit WAN, 4 Gigabit LAN ports, and NAT/DHCP.',
    functions: 'Consumer and SOHO integrated router combining an 802.11ac dual-band wireless access point, 4-port Gigabit Ethernet switch, DHCP server, SPI firewall, and NAT router to connect local homes and small offices to broadband ISPs.',
    slots: '1 GE Internet WAN port, 4 GE LAN switch ports, 2.4GHz & 5GHz Wi-Fi radios',
    interfaces: [
      { name: 'Internet', shortName: 'WAN', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet1', shortName: 'LAN1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet2', shortName: 'LAN2', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet3', shortName: 'LAN3', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet4', shortName: 'LAN4', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Wireless 2.4GHz', shortName: 'WiFi-2.4G', speed: '450', duplex: 'half', autoMdix: false },
      { name: 'Wireless 5GHz', shortName: 'WiFi-5G', speed: '1300', duplex: 'half', autoMdix: false }
    ]
  },
  'HomeRouter': {
    family: 'wirelessrouter',
    category: 'Wireless Routers & Home Gateways',
    series: 'Cisco Home Routers',
    name: 'HomeRouter-PT-AC',
    description: 'Dual-Band 802.11ac Wireless Home Router',
    interfaces: [
      { name: 'Internet', shortName: 'WAN', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet1', shortName: 'LAN1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet2', shortName: 'LAN2', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet3', shortName: 'LAN3', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet4', shortName: 'LAN4', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Wireless 2.4GHz', shortName: 'WiFi-2.4G', speed: '450', duplex: 'half', autoMdix: false },
      { name: 'Wireless 5GHz', shortName: 'WiFi-5G', speed: '1300', duplex: 'half', autoMdix: false }
    ]
  },
  'WRT300N': {
    family: 'wirelessrouter',
    category: 'Wireless Routers & Home Gateways',
    series: 'Linksys Wireless Series',
    name: 'Linksys WRT300N',
    description: 'Wireless-N Broadband Router with 1 WAN port, 4 FastEthernet LAN ports, and 2.4GHz Wi-Fi.',
    functions: 'Classic SOHO wireless broadband router integrating an 802.11n Wi-Fi access point, 4 FastEthernet switch ports, NAT translation, DHCP server, and stateful packet inspection firewall.',
    slots: '1 FE Internet WAN port, 4 FE LAN ports, 2.4GHz 802.11n radio',
    interfaces: [
      { name: 'Internet', shortName: 'WAN', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet1', shortName: 'LAN1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet2', shortName: 'LAN2', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet3', shortName: 'LAN3', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet4', shortName: 'LAN4', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Wireless',  shortName: 'WiFi', speed: '300', duplex: 'half', autoMdix: false }
    ]
  },
  'DLC100': {
    family: 'wirelessrouter',
    category: 'Wireless Routers & Home Gateways',
    series: 'Cisco Home Gateway Series',
    name: 'DLC100 Home Gateway',
    description: 'Smart IoT Home Gateway Router with 4 LAN ports, 1 WAN port, Wi-Fi, and integrated IoT Server.',
    functions: 'Specialized Smart Home & IoT Gateway router. In addition to standard wireless broadband routing, it hosts an embedded IoT Registration Server allowing smart devices (sensors, smart lamps, fans, doors) to register, report telemetry, and be automated.',
    slots: '1 FE/GE Internet port, 4 LAN ports, 2.4/5GHz Wi-Fi, ZigBee/BLE IoT antenna',
    interfaces: [
      { name: 'Internet', shortName: 'WAN', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet1', shortName: 'LAN1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet2', shortName: 'LAN2', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet3', shortName: 'LAN3', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet4', shortName: 'LAN4', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Wireless',  shortName: 'WiFi', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'IoTRadio',  shortName: 'IoT',  speed: '10',  duplex: 'half', autoMdix: false }
    ]
  },
  'HomeGateway-PT': {
    family: 'wirelessrouter',
    category: 'Wireless Routers & Home Gateways',
    series: 'Cisco Home Gateway Series',
    name: 'DLC100 Home Gateway',
    description: 'Smart IoT Home Gateway Router',
    interfaces: [
      { name: 'Internet', shortName: 'WAN', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet1', shortName: 'LAN1', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet2', shortName: 'LAN2', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet3', shortName: 'LAN3', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Ethernet4', shortName: 'LAN4', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Wireless',  shortName: 'WiFi', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'IoTRadio',  shortName: 'IoT',  speed: '10',  duplex: 'half', autoMdix: false }
    ]
  },

  // ── WIRELESS LAN CONTROLLERS (WLC) ─────────────────────────────
  'WLC-PT': {
    family: 'wlc',
    category: 'Wireless LAN Controllers (WLC)',
    series: 'Generic Simulation WLC',
    name: 'WLC-PT (Generic)',
    description: 'Generic centralized Wireless LAN Controller with Gigabit Ethernet distribution & management ports.',
    functions: 'Centralized network appliance responsible for orchestrating Lightweight Access Points (LAPs). Handles CAPWAP tunneling, dynamic RF power/channel assignment, 802.11 WLAN policies, RADIUS/802.1X authentication, and guest portals.',
    slots: '1 Gigabit Management port, 2 Gigabit Distribution ports, 1 Console port',
    interfaces: [
      { name: 'Management0', shortName: 'Mgmt0', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  'WLC-3504': {
    family: 'wlc',
    category: 'Wireless LAN Controllers (WLC)',
    series: 'Cisco 3504 Series',
    name: 'Cisco 3504 Wireless Controller',
    description: 'Enterprise high-density Wireless Controller supporting up to 150 APs, 4 GE ports, and 1 Multigigabit port.',
    functions: 'Compact, high-density enterprise controller supporting Cisco DNA Spaces, 802.11ac Wave 2 and Wi-Fi 6 AP orchestration, sub-second failover, and hardware-rate 4 Gbps data throughput.',
    slots: '1 Multigigabit Ethernet (mGig) port, 4 GigabitEthernet RJ-45 ports, 1 SFP fiber slot, 1 Service port',
    interfaces: [
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/2', shortName: 'G0/2', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/3', shortName: 'G0/3', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'GigabitEthernet0/4', shortName: 'G0/4', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Management', shortName: 'Mgmt', speed: '1000', duplex: 'auto', autoMdix: true }
    ]
  },
  'WLC-2504': {
    family: 'wlc',
    category: 'Wireless LAN Controllers (WLC)',
    series: 'Cisco 2504 Series',
    name: 'Cisco 2504 Wireless Controller',
    description: 'Branch-office Wireless LAN Controller with 4 GigabitEthernet ports (2 PoE).',
    functions: 'Cost-effective centralized controller for small to mid-sized branch deployments, managing up to 75 Lightweight Access Points with centralized security, rogue AP detection, and CleanAir RF monitoring.',
    slots: '4 GigabitEthernet RJ-45 ports (2 PoE), 1 Console port',
    interfaces: Array.from({ length: 4 }, (_, i) => ({
      name: `GigabitEthernet0/${i + 1}`, shortName: `G0/${i + 1}`, speed: '1000', duplex: 'auto', autoMdix: true, poe: i < 2
    }))
  },

  // ── SECURITY APPLIANCES & FIREWALLS ────────────────────────────
  'Meraki-MX65W': {
    family: 'firewall',
    category: 'Cloud-Managed Security Appliances',
    series: 'Cisco Meraki MX Series',
    name: 'Cisco Meraki MX65W Security Appliance',
    description: 'Cloud-Managed 100% centralized Security & SD-WAN Appliance with integrated 802.11ac Wi-Fi & PoE+.',
    functions: 'Enterprise cloud-managed security appliance offering Next-Generation Layer 7 application firewalling, Auto VPN SD-WAN interconnectivity, Content Filtering, Snort-based Intrusion Detection (IDS/IPS), and dual-band 802.11ac Wi-Fi.',
    slots: '2 Dedicated GbE WAN uplinks, 8 GbE LAN switch ports (2 PoE+), integrated 802.11ac antennas',
    interfaces: [
      { name: 'Internet1', shortName: 'WAN1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Internet2', shortName: 'WAN2', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN1', shortName: 'LAN1', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'LAN2', shortName: 'LAN2', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'LAN3', shortName: 'LAN3', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN4', shortName: 'LAN4', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN5', shortName: 'LAN5', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN6', shortName: 'LAN6', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN7', shortName: 'LAN7', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN8', shortName: 'LAN8', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Wireless2.4GHz', shortName: 'WiFi-2.4G', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'Wireless5GHz', shortName: 'WiFi-5G', speed: '867', duplex: 'half', autoMdix: false }
    ]
  },
  'MX65W': {
    family: 'firewall',
    category: 'Cloud-Managed Security Appliances',
    series: 'Cisco Meraki MX Series',
    name: 'Cisco Meraki MX65W Security Appliance',
    description: 'Cloud-Managed 100% centralized Security & SD-WAN Appliance with integrated 802.11ac Wi-Fi & PoE+.',
    functions: 'Enterprise cloud-managed security appliance offering Next-Gen Layer 7 firewalling, Auto VPN, and dual-band Wi-Fi.',
    slots: '2 GbE WAN, 8 GbE LAN (2 PoE+), 802.11ac Wi-Fi',
    interfaces: [
      { name: 'Internet1', shortName: 'WAN1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Internet2', shortName: 'WAN2', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN1', shortName: 'LAN1', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'LAN2', shortName: 'LAN2', speed: '1000', duplex: 'auto', autoMdix: true, poe: true },
      { name: 'LAN3', shortName: 'LAN3', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN4', shortName: 'LAN4', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN5', shortName: 'LAN5', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN6', shortName: 'LAN6', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN7', shortName: 'LAN7', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'LAN8', shortName: 'LAN8', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Wireless2.4GHz', shortName: 'WiFi-2.4G', speed: '300', duplex: 'half', autoMdix: false },
      { name: 'Wireless5GHz', shortName: 'WiFi-5G', speed: '867', duplex: 'half', autoMdix: false }
    ]
  },
  'ASA-5506-X': {
    family: 'firewall',
    category: 'Enterprise Security Firewalls',
    series: 'Cisco ASA 5500-X Series',
    name: 'Cisco ASA 5506-X Firewall',
    description: 'Next-Gen Firewall with 8 GigabitEthernet ports and Cisco FirePOWER services.',
    functions: 'Next-generation adaptive security appliance delivering stateful inspection, hardware-accelerated IPsec/SSL VPNs, Advanced Malware Protection (AMP), and Next-Gen IPS for small to mid-sized businesses.',
    slots: '8 GigabitEthernet ports, 1 Management port, 1 Console port',
    interfaces: Array.from({ length: 8 }, (_, i) => ({
      name: `GigabitEthernet1/${i + 1}`, shortName: `G1/${i + 1}`, speed: '1000', duplex: 'auto', autoMdix: true
    }))
  },
  'ASA-5505': {
    family: 'firewall',
    category: 'Enterprise Security Firewalls',
    series: 'Cisco ASA 5500 Series',
    name: 'Cisco ASA 5505 Firewall',
    description: 'Adaptive Security Appliance with 8 FastEthernet switch ports (2 PoE).',
    functions: 'Classic modular security appliance for small business and teleworker environments with integrated 8-port 10/100 switch, hardware VPN acceleration, and stateful security zones.',
    slots: '8 FastEthernet ports (ports 6 & 7 provide PoE), 1 Console port',
    interfaces: Array.from({ length: 8 }, (_, i) => ({
      name: `Ethernet0/${i}`, shortName: `Fa0/${i}`, speed: '100', duplex: 'auto', autoMdix: true, vlanId: 1
    }))
  },

  // ── SERVERS & CELLULAR INFRASTRUCTURE ──────────────────────────
  'Central-Office-Server': {
    family: 'server',
    category: 'Telecom & Central Office Infrastructure',
    series: 'Cisco Telecom Infrastructure',
    name: 'Central-Office-Server',
    description: 'Central Office Server for cellular base station backhaul, IoT registration, DNS, DHCP, and core WAN routing.',
    functions: 'Carrier-grade Central Office Server that acts as the core gateway for cellular infrastructure (Cell Towers), connecting wireless mobile subscribers to telecom backbone networks, providing central IoT device registration, DNS resolution, and automated IP addressing.',
    slots: '1 Gigabit LAN port, 1 High-speed Backbone uplink, 1 Coaxial interface, Cellular Gateway services',
    interfaces: [
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Backbone0', shortName: 'Backbone', speed: '10000', duplex: 'full', autoMdix: true },
      { name: 'Coaxial0',  shortName: 'Coax',     speed: '100',  duplex: 'half', autoMdix: false },
      { name: 'FastEthernet0', shortName: 'Fa0', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  'CO-Server': {
    family: 'server',
    category: 'Telecom & Central Office Infrastructure',
    series: 'Cisco Telecom Infrastructure',
    name: 'Central-Office-Server',
    description: 'Central Office Server for cellular base station backhaul and IoT registration.',
    interfaces: [
      { name: 'GigabitEthernet0/1', shortName: 'G0/1', speed: '1000', duplex: 'auto', autoMdix: true },
      { name: 'Backbone0', shortName: 'Backbone', speed: '10000', duplex: 'full', autoMdix: true },
      { name: 'Coaxial0',  shortName: 'Coax',     speed: '100',  duplex: 'half', autoMdix: false },
      { name: 'FastEthernet0', shortName: 'Fa0', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  'Server-PT': {
    family: 'server',
    category: 'Enterprise Servers',
    series: 'Generic Simulation Devices',
    name: 'Server-PT (Generic)',
    description: 'Multi-service server supporting DHCP, DNS, HTTP, FTP, and Syslog services.',
    functions: 'Host network server simulating enterprise application services including dynamic DHCP IP pooling, DNS record resolution, and web services.',
    slots: '1 FastEthernet/Gigabit port',
    interfaces: [
      { name: 'FastEthernet0', shortName: 'Fa0', speed: '100', duplex: 'auto', autoMdix: true }
    ]
  },
  'Cell-Tower': {
    family: 'celltower',
    category: 'Telecom & Cellular Infrastructure',
    series: 'Cisco Cellular Infrastructure',
    name: 'Cell-Tower',
    description: '4G LTE / 5G Cellular Base Transceiver Station (eNodeB) with high-speed fiber backhaul.',
    functions: 'Wireless telecommunications tower that bridges mobile cellular handsets and industrial cellular routers to the Central Office core network over high-speed backbone fiber or coaxial links.',
    slots: '1 High-speed Backbone connection, 1 Coaxial connection, 4G/5G Cellular transceiver antenna',
    interfaces: [
      { name: 'Backbone0', shortName: 'Backbone', speed: '1000', duplex: 'full', autoMdix: true },
      { name: 'Cellular0', shortName: 'Cell',     speed: '100', duplex: 'full', autoMdix: false },
      { name: 'Coaxial0',  shortName: 'Coax',     speed: '100', duplex: 'half', autoMdix: false }
    ]
  },
  'CellTower': {
    family: 'celltower',
    category: 'Telecom & Cellular Infrastructure',
    series: 'Cisco Cellular Infrastructure',
    name: 'Cell-Tower',
    description: '4G LTE / 5G Cellular Base Station',
    interfaces: [
      { name: 'Backbone0', shortName: 'Backbone', speed: '1000', duplex: 'full', autoMdix: true },
      { name: 'Cellular0', shortName: 'Cell',     speed: '100', duplex: 'full', autoMdix: false },
      { name: 'Coaxial0',  shortName: 'Coax',     speed: '100', duplex: 'half', autoMdix: false }
    ]
  },

  // ── WAN INFRASTRUCTURE & BROADBAND MODEMS ──────────────────────
  'Cloud-PT': {
    family: 'cloud',
    category: 'WAN Infrastructure',
    series: 'Generic WAN Emulation',
    name: 'Cloud-PT (Generic WAN)',
    description: 'Generic Multi-port WAN Emulation Cloud simulating ISP switching fabrics.',
    functions: 'Multi-interface WAN cloud for simulating Frame Relay, ATM, DSLAM, and Internet ISP routing networks.',
    slots: 'Ethernet, Serial, Modem RJ-11, and Coaxial interfaces',
    interfaces: [
      { name: 'Ethernet0', shortName: 'Eth0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Serial0',   shortName: 'Se0',  speed: '1.544', duplex: 'full', autoMdix: false },
      { name: 'Modem0',    shortName: 'Mod0', speed: '56', duplex: 'full', autoMdix: false },
      { name: 'Coaxial0',  shortName: 'Coax0', speed: '10', duplex: 'half', autoMdix: false }
    ]
  },
  'DSL-Modem': {
    family: 'modem',
    category: 'Broadband Modems',
    series: 'Generic Physical Devices',
    name: 'DSL Modem-PT',
    description: 'Digital Subscriber Line Broadband Modem (RJ-45 Ethernet to RJ-11 Phone Line).',
    functions: 'Modulates digital Ethernet packets into high-frequency analog signals over copper telephone subscriber lines to connect to ISP DSLAMs.',
    slots: '1 RJ-45 Ethernet port, 1 RJ-11 Telephone port',
    interfaces: [
      { name: 'Ethernet0', shortName: 'Eth0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Port1',     shortName: 'Phone', speed: '10', duplex: 'full', autoMdix: false }
    ]
  },
  'Cable-Modem': {
    family: 'modem',
    category: 'Broadband Modems',
    series: 'Generic Physical Devices',
    name: 'Cable Modem-PT',
    description: 'DOCSIS Broadband Cable Modem (RJ-45 Ethernet to Coaxial F-Type/BNC).',
    functions: 'Modulates digital Ethernet frames over broadband coaxial cable TV frequencies (DOCSIS) to connect to ISP CMTS systems.',
    slots: '1 RJ-45 Ethernet port, 1 Coaxial F-connector',
    interfaces: [
      { name: 'Ethernet0', shortName: 'Eth0', speed: '100', duplex: 'auto', autoMdix: true },
      { name: 'Coaxial0',  shortName: 'Coax', speed: '10', duplex: 'half', autoMdix: false }
    ]
  },

  // ── LAYER 1 PHYSICAL DEVICES (HUBS, REPEATERS, SPLITTERS) ───────
  'Hub-PT': {
    family: 'hub',
    category: 'Generic Physical & Layer 1 Devices',
    series: 'Generic Physical Devices',
    name: 'Hub-PT',
    description: 'Generic 6-port FastEthernet physical layer multiport repeater (Hub-PT).',
    functions: 'Layer 1 physical layer multiport repeater. Receives electrical/optical signals on one port and regenerates & floods them out all other active ports without MAC learning or frame filtering.',
    slots: '6 FastEthernet ports',
    interfaces: Array.from({ length: 6 }, (_, i) => ({
      name: `FastEthernet${i}`, shortName: `Fa${i}`, speed: '100', duplex: 'half', autoMdix: true
    }))
  },
  'PT-Hub': {
    family: 'hub',
    category: 'Generic Physical & Layer 1 Devices',
    series: 'Generic Physical Devices',
    name: 'Hub-PT',
    description: 'Generic 6-port FastEthernet physical layer multiport repeater (Hub-PT).',
    functions: 'Layer 1 physical layer multiport repeater. Receives electrical/optical signals on one port and regenerates & floods them out all other active ports without MAC learning or frame filtering.',
    slots: '6 FastEthernet ports',
    interfaces: Array.from({ length: 6 }, (_, i) => ({
      name: `FastEthernet${i}`, shortName: `Fa${i}`, speed: '100', duplex: 'half', autoMdix: true
    }))
  },
  'Repeater-PT': {
    family: 'repeater',
    category: 'Generic Physical & Layer 1 Devices',
    series: 'Generic Physical Devices',
    name: 'Repeater-PT',
    description: 'Generic 2-port FastEthernet Layer 1 signal repeater (Repeater-PT).',
    functions: 'Layer 1 physical signal repeater. Amplifies and retransmits physical signals between two Ethernet segments to extend link distance without inspecting MAC headers.',
    slots: '2 FastEthernet ports',
    interfaces: [
      { name: 'FastEthernet0', shortName: 'Fa0', speed: '100', duplex: 'half', autoMdix: true },
      { name: 'FastEthernet1', shortName: 'Fa1', speed: '100', duplex: 'half', autoMdix: true }
    ]
  },
  'PT-Repeater': {
    family: 'repeater',
    category: 'Generic Physical & Layer 1 Devices',
    series: 'Generic Physical Devices',
    name: 'Repeater-PT',
    description: 'Generic 2-port FastEthernet Layer 1 signal repeater (Repeater-PT).',
    functions: 'Layer 1 physical signal repeater. Amplifies and retransmits physical signals between two Ethernet segments to extend link distance without inspecting MAC headers.',
    slots: '2 FastEthernet ports',
    interfaces: [
      { name: 'FastEthernet0', shortName: 'Fa0', speed: '100', duplex: 'half', autoMdix: true },
      { name: 'FastEthernet1', shortName: 'Fa1', speed: '100', duplex: 'half', autoMdix: true }
    ]
  },
  'CoAxialSplitter-PT': {
    family: 'coaxialsplitter',
    category: 'Generic Physical & Layer 1 Devices',
    series: 'Generic Physical Devices',
    name: 'CoAxialSplitter-PT',
    description: 'Generic 3-port Passive Coaxial RF Signal Splitter (CoAxialSplitter-PT).',
    functions: 'Passive Layer 1 broadband coaxial RF signal splitter. Splits 1 coaxial cable input signal across multiple coaxial output connectors.',
    slots: '3 Coaxial BNC ports',
    interfaces: [
      { name: 'Port0', shortName: 'Port0', speed: '10', duplex: 'half', autoMdix: false },
      { name: 'Port1', shortName: 'Port1', speed: '10', duplex: 'half', autoMdix: false },
      { name: 'Port2', shortName: 'Port2', speed: '10', duplex: 'half', autoMdix: false }
    ]
  },
  'CoaxialSplitter-PT': {
    family: 'coaxialsplitter',
    category: 'Generic Physical & Layer 1 Devices',
    series: 'Generic Physical Devices',
    name: 'CoAxialSplitter-PT',
    description: 'Generic 3-port Passive Coaxial RF Signal Splitter (CoAxialSplitter-PT).',
    functions: 'Passive Layer 1 broadband coaxial RF signal splitter. Splits 1 coaxial cable input signal across multiple coaxial output connectors.',
    slots: '3 Coaxial BNC ports',
    interfaces: [
      { name: 'Port0', shortName: 'Port0', speed: '10', duplex: 'half', autoMdix: false },
      { name: 'Port1', shortName: 'Port1', speed: '10', duplex: 'half', autoMdix: false },
      { name: 'Port2', shortName: 'Port2', speed: '10', duplex: 'half', autoMdix: false }
    ]
  }
};

/** Get model preset or fallback */
export function getModelSpec(modelId) {
  if (!modelId) return null;
  return DEVICE_MODELS[modelId] || DEVICE_MODELS[modelId.toUpperCase()] || null;
}

/** Get list of unique models for a device family */
export function getModelsByFamily(family) {
  const f = (family || '').toLowerCase();
  const familyMap = {
    securityappliance: ['firewall', 'securityappliance'],
    firewall: ['firewall', 'securityappliance'],
    homegateway: ['wirelessrouter', 'homegateway'],
    wirelessrouter: ['wirelessrouter', 'homegateway'],
    lap: ['ap', 'lap'],
    ap: ['ap', 'lap'],
    coserver: ['server', 'coserver'],
    server: ['server', 'coserver'],
    celltower: ['celltower', 'modem'],
    modem: ['modem', 'celltower'],
  };
  const targetFamilies = familyMap[f] || [f];

  const seen = new Set();
  const results = [];
  for (const [id, spec] of Object.entries(DEVICE_MODELS)) {
    if (targetFamilies.includes(spec.family)) {
      if (!seen.has(spec.name)) {
        seen.add(spec.name);
        results.push({ id, ...spec });
      }
    }
  }
  return results;
}

