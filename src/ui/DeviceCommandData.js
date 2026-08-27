// src/ui/DeviceCommandData.js
// Exhaustive knowledge base for all NetGame network devices, models, purposes, and CLI commands.

export const DEVICE_CATEGORIES = [
  { id: 'all', name: 'All Devices', icon: '🌐' },
  { id: 'routers', name: 'ISRs & Routers', icon: '📡' },
  { id: 'switches', name: 'Layer 2 Switches', icon: '🔀' },
  { id: 'l3switches', name: 'Layer 3 Multilayer', icon: '⚡' },
  { id: 'security', name: 'Firewalls & Security', icon: '🛡️' },
  { id: 'wireless', name: 'Wireless & APs', icon: '📶' },
  { id: 'hosts', name: 'PCs & Servers', icon: '💻' },
  { id: 'physical', name: 'Layer 1 Devices', icon: '🔌' },
  { id: 'wan', name: 'WAN & Internet', icon: '☁️' },
];

export const DEVICE_PROFILES = {
  // ────────────────────────────────────────────────────────────
  //  1. ROUTERS / ISRs (L3)
  // ────────────────────────────────────────────────────────────
  router: {
    type: 'router',
    category: 'routers',
    title: 'Cisco Enterprise & Industrial Routers (ISRs)',
    osiLayer: 'Layer 3 — Network Layer',
    iconType: 'router',
    badgeColor: '#00d4ff',
    models: [
      { id: '4331', name: 'Cisco ISR 4331', ports: '3 GE (2 SFP combo), 2 NIM slots, 1 SM slot' },
      { id: '4321', name: 'Cisco ISR 4321', ports: '2 GE (1 SFP combo), 1 NIM slot' },
      { id: '2911', name: 'Cisco 2911 ISR', ports: '3 GE ports, 4 EHWIC slots, DSP voice gateway' },
      { id: '2901', name: 'Cisco 2901 ISR', ports: '2 GE ports, 4 EHWIC slots, DSP voice gateway' },
      { id: '1941', name: 'Cisco 1941 ISR', ports: '2 GE ports, 2 EHWIC slots, IPSec VPN accelerator' },
      { id: '1841', name: 'Cisco 1841 Legacy', ports: '2 FastEthernet ports, 2 WIC/HWIC slots' },
      { id: '2811', name: 'Cisco 2811 Legacy', ports: '2 FastEthernet ports, 4 HWIC slots' },
      { id: '2621XM', name: 'Cisco 2621XM', ports: '2 FastEthernet ports, WIC/NM slots' },
      { id: 'IR1101', name: 'Cisco IR1101 Industrial', ports: '4 FE, 1 GE SFP, 5G/Cellular, RS-232/485 SCADA' },
      { id: 'IR8340', name: 'Cisco IR8340 Rugged', ports: 'Modular 5G, GE/SFP, Substation SCADA' },
      { id: '819HGW', name: 'Cisco 819HGW IoT', ports: '4 FE, 1 GE, 3G/4G Cellular, Integrated Wi-Fi AP' },
      { id: '819HG-4G-IOX', name: 'Cisco 819HG IOx', ports: '4 FE, 1 GE, Cellular, IOx Edge Computing' },
      { id: '829', name: 'Cisco 829 Industrial', ports: '4 FE, 1 GE, Dual 4G LTE modems' },
      { id: 'CGR1240', name: 'Cisco CGR 1240 Grid', ports: 'Ruggedized outdoor pole-mounted FAN platform' },
      { id: 'PT-Router', name: 'Router-PT Generic', ports: '10 Expansion slots, 2 FE, 2 Serial, Console, Aux' },
      { id: 'PT-Empty-Router', name: 'Router-PT-Empty', ports: 'Blank modular chassis for custom slots' },
    ],
    overview: {
      role: 'Inter-network packet forwarding, WAN connectivity, path determination, and broadcast domain isolation.',
      purpose: 'Routers are the backbone of inter-network communication. They read destination IPv4/IPv6 addresses on Layer 3 packets, look up their internal Routing Table, and determine the optimal egress interface to forward packets toward remote destinations. They also enforce security policies (ACLs), translate private to public IPs (NAT/PAT), and provide DHCP addressing to local LANs.',
      whenToUse: [
        'Connecting a Local Area Network (LAN) to the Wide Area Network (WAN) or Internet.',
        'Routing traffic between separate IP subnets and VLANs.',
        'Implementing dynamic routing protocols like OSPF, RIP, and EIGRP.',
        'Providing Network Address Translation (NAT/PAT) for private IPv4 RFC 1918 addresses.',
        'Serving as the default gateway and DHCP Server for connected hosts.'
      ],
      keyFeatures: [
        'Maintains dynamic Routing Table with Administrative Distance & Metric comparisons',
        'Breaks and isolates Layer 2 Broadcast Domains (stops broadcast storms)',
        'Supports Static Routes, Default Routes (0.0.0.0/0), OSPF (Area 0), and RIPv2',
        'Cisco IOS-compliant Command Line Interface (CLI) configuration modes'
      ]
    },
    commands: [
      {
        command: 'enable',
        alias: 'en',
        mode: 'Router>',
        category: 'modes',
        purpose: 'Enters Privileged Exec Mode (indicated by the # prompt), which unlocks administrative commands, debugging, and configuration capabilities.',
        example: 'Router> enable\nRouter#',
        tip: 'Required before you can enter configuration mode or view running configs.'
      },
      {
        command: 'disable',
        mode: 'Router#',
        category: 'modes',
        purpose: 'Exits Privileged Exec Mode and returns to unprivileged User Exec Mode (Router>).',
        example: 'Router# disable\nRouter>',
        tip: 'Use to protect the router console when stepping away from the terminal.'
      },
      {
        command: 'configure terminal',
        alias: 'conf t',
        mode: 'Router#',
        category: 'modes',
        purpose: 'Enters Global Configuration Mode (Router(config)#), allowing you to modify parameters that affect the entire router.',
        example: 'Router# conf t\nRouter(config)#',
        tip: 'All interface, routing, and system changes start in this mode.'
      },
      {
        command: 'hostname <name>',
        mode: 'Router(config)#',
        category: 'system',
        purpose: 'Sets the unique host identification name for the router in the CLI prompt and syslog messages.',
        example: 'Router(config)# hostname R1-HQ\nR1-HQ(config)#',
        tip: 'Best practice: Always name routers according to their topology location (e.g. R1-Gateway, Branch-R2).'
      },
      {
        command: 'copy running-config startup-config',
        alias: 'copy run start',
        mode: 'Router#',
        category: 'system',
        purpose: 'Saves the active configuration (running-config) to NVRAM (startup-config) so it persists after a reboot.',
        example: 'Router# copy run start\nDestination filename [startup-config]? \nBuilding configuration...\n[OK]',
        tip: 'Always run this before turning off or reloading a device to prevent configuration loss.'
      },
      {
        command: 'interface <type><number>',
        alias: 'int <name>',
        mode: 'Router(config)#',
        category: 'interfaces',
        purpose: 'Enters Interface Configuration Mode for a specific physical or logical port (e.g. GigabitEthernet0/0/0, Serial0/1/0).',
        example: 'Router(config)# interface GigabitEthernet0/0/0\nRouter(config-if)#',
        tip: 'Can be abbreviated as "int g0/0" or "int fa0/1".'
      },
      {
        command: 'ip address <ip> <subnet-mask>',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Assigns an IPv4 address and subnet mask to the interface, binding the router to that local subnet as a gateway.',
        example: 'Router(config-if)# ip address 192.168.1.1 255.255.255.0',
        tip: 'Automatically adds a "Directly Connected" (C) route to the routing table once the interface is up.'
      },
      {
        command: 'no shutdown',
        alias: 'no shut',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Enables the interface administratively. Cisco router interfaces are disabled (shutdown) by default.',
        example: 'Router(config-if)# no shutdown\n%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to up',
        tip: 'Always run "no shut" after assigning an IP address, otherwise packets cannot enter or leave.'
      },
      {
        command: 'shutdown',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Administratively disables the interface, preventing electrical transmission and dropping link carrier.',
        example: 'Router(config-if)# shutdown',
        tip: 'Use for maintenance or to isolate a misbehaving network segment.'
      },
      {
        command: 'description <text>',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Adds an informational comment string to document the interface purpose, connected device, or circuit ID.',
        example: 'Router(config-if)# description Link to ISP WAN Gateway',
        tip: 'Helps network engineers quickly identify link connections in "show run" and "show interfaces".'
      },
      {
        command: 'speed <10 | 100 | 1000 | auto>',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Manually sets Ethernet port transmission speed in Mbps or enables auto-negotiation.',
        example: 'Router(config-if)# speed 1000',
        tip: 'Set matching speed on both link ends to avoid duplex/speed mismatch packet drops.'
      },
      {
        command: 'duplex <auto | full | half>',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Configures full-duplex (simultaneous bidirectional sending/receiving) or half-duplex (shared collision domain).',
        example: 'Router(config-if)# duplex full',
        tip: 'Modern Gigabit links should always operate in full duplex.'
      },
      {
        command: 'mdix auto',
        alias: 'no mdix auto',
        mode: 'Router(config-if)#',
        category: 'interfaces',
        purpose: 'Enables Automatic Medium-Dependent Interface Crossover, allowing straight-through or crossover cables to work interchangeably.',
        example: 'Router(config-if)# mdix auto',
        tip: 'Supported on modern Cisco routers and switches; eliminates need for specific crossover cables.'
      },
      {
        command: 'ip route <network> <mask> <next-hop>',
        mode: 'Router(config)#',
        category: 'routing',
        purpose: 'Installs a manual static route into the routing table toward a destination network via an adjacent next-hop router IP.',
        example: 'Router(config)# ip route 10.2.0.0 255.255.255.0 192.168.12.2',
        tip: 'Static routes have an Administrative Distance (AD) of 1, making them more trusted than dynamic protocols.'
      },
      {
        command: 'ipv6 route <network>/<prefix> <next-hop>',
        mode: 'Router(config)#',
        category: 'routing',
        purpose: 'Installs a manual static route into the IPv6 routing table toward a destination IPv6 network.',
        example: 'Router(config)# ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:1::2',
        tip: 'Ensure "ipv6 unicast-routing" is enabled globally before adding IPv6 static routes.'
      },
      {
        command: 'ip route 0.0.0.0 0.0.0.0 <next-hop>',
        mode: 'Router(config)#',
        category: 'routing',
        purpose: 'Configures a Default Static Route (Gateway of Last Resort) for forwarding all packets whose destination does not match any specific route.',
        example: 'Router(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1',
        tip: 'Essential on edge routers to route outbound web traffic to the ISP Internet gateway.'
      },
      {
        command: 'no ip route <network> <mask>',
        mode: 'Router(config)#',
        category: 'routing',
        purpose: 'Deletes a previously defined static route from the active routing table.',
        example: 'Router(config)# no ip route 10.2.0.0 255.255.255.0',
        tip: 'Use when network topology changes or when replacing static routing with dynamic protocols.'
      },
      {
        command: 'router ospf <process-id>',
        mode: 'Router(config)#',
        category: 'routing',
        purpose: 'Initializes the Open Shortest Path First (OSPFv2) dynamic link-state routing protocol process.',
        example: 'Router(config)# router ospf 1\nRouter(config-router)#',
        tip: 'Process ID is locally significant (values 1-65535); standard practice is to use 1.'
      },
      {
        command: 'network <network> <wildcard-mask> area <area-id>',
        mode: 'Router(config-router)#',
        category: 'routing',
        purpose: 'Enables OSPF on interfaces matching the network address and assigns them to an OSPF Area (e.g. Backbone Area 0).',
        example: 'Router(config-router)# network 192.168.1.0 0.0.0.255 area 0',
        tip: 'Wildcard mask is the inverse of the subnet mask (/24 = 255.255.255.0 -> wildcard 0.0.0.255).'
      },
      {
        command: 'router rip',
        mode: 'Router(config)#',
        category: 'routing',
        purpose: 'Activates Routing Information Protocol (RIP) distance-vector dynamic routing on the router.',
        example: 'Router(config)# router rip\nRouter(config-router)#',
        tip: 'RIP uses hop count as its metric (maximum 15 hops; 16 hops is unreachable).'
      },
      {
        command: 'version 2',
        mode: 'Router(config-router)#',
        category: 'routing',
        purpose: 'Switches RIP from legacy classful RIPv1 to classless RIPv2, which includes subnet masks in updates.',
        example: 'Router(config-router)# version 2',
        tip: 'Always enable version 2 to support Variable Length Subnet Masking (VLSM) and CIDR.'
      },
      {
        command: 'ip dhcp pool <pool-name>',
        mode: 'Router(config)#',
        category: 'services',
        purpose: 'Creates a DHCP address pool and enters DHCP configuration sub-mode to distribute IP settings to hosts.',
        example: 'Router(config)# ip dhcp pool LAN_POOL\nRouter(dhcp-config)#',
        tip: 'Allows the router to act as the primary DHCP server for the local subnet.'
      },
      {
        command: 'default-router <gateway-ip>',
        mode: 'Router(dhcp-config)#',
        category: 'services',
        purpose: 'Defines the default gateway IP address that DHCP clients should use for out-of-subnet traffic.',
        example: 'Router(dhcp-config)# default-router 192.168.1.1',
        tip: 'Should match the router interface IP address connected to that LAN.'
      },
      {
        command: 'dns-server <ip>',
        mode: 'Router(dhcp-config)#',
        category: 'services',
        purpose: 'Configures the primary DNS server address that DHCP clients receive for domain name resolution.',
        example: 'Router(dhcp-config)# dns-server 8.8.8.8',
        tip: 'Can specify public DNS (8.8.8.8, 1.1.1.1) or internal enterprise DNS server.'
      },
      {
        command: 'show ip route',
        alias: 'sh ip ro',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays the complete IPv4 Routing Table with route codes (C=Connected, S=Static, O=OSPF, R=RIP), metrics, and next-hop gateways.',
        example: 'Router# show ip route\nCodes: C - connected, S - static, O - OSPF, R - RIP\nC 192.168.1.0/24 is directly connected, GigabitEthernet0/0\nS 10.0.0.0/8 [1/0] via 192.168.1.254',
        tip: 'Primary verification command to troubleshoot whether the router knows how to reach a destination network.'
      },
      {
        command: 'show ipv6 route',
        alias: 'sh ipv6 ro',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays the complete IPv6 Routing Table with route codes (C=Connected, S=Static, O=OSPF), metrics, and next-hop gateways.',
        example: 'Router# show ipv6 route\nCodes: C - connected, S - static, O - OSPF\nC   2001:db8:acad:1::/64 is directly connected, GigabitEthernet0/0\nS   2001:db8:acad:2::/64 [1/0] via 2001:db8:acad:1::2',
        tip: 'Use to verify if the router knows the path to an IPv6 network.'
      },
      {
        command: 'show ip interface brief',
        alias: 'sh ip int br',
        mode: 'Router#',
        category: 'show',
        purpose: 'Outputs a concise summary table showing every interface, assigned IP address, Layer 1 Physical Status, and Layer 2 Protocol status.',
        example: 'Router# show ip int br\nInterface              IP-Address      Status   Protocol\nGigabitEthernet0/0/0   192.168.1.1     up       up\nGigabitEthernet0/0/1   unassigned      down     down',
        tip: 'Both Status (L1) and Protocol (L2) must be "up" for traffic to pass.'
      },
      {
        command: 'show running-config',
        alias: 'sh run',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays the entire active configuration currently stored in RAM (interfaces, hostnames, routes, protocols).',
        example: 'Router# show running-config',
        tip: 'Use to verify exact syntax applied to interfaces and routing engines.'
      },
      {
        command: 'show version',
        alias: 'sh ver',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays hardware details, Cisco IOS software release, system uptime, processor type, memory, and port counts.',
        example: 'Router# show version',
        tip: 'Helpful for auditing firmware versions and hardware module configurations.'
      },
      {
        command: 'show interfaces [name]',
        alias: 'sh int',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays comprehensive Layer 1 & 2 statistics, MTU, bandwidth, delay, encapsulation, and packet counters.',
        example: 'Router# show interfaces GigabitEthernet0/0/0',
        tip: 'Checks for CRC errors, collisions, and interface line resets.'
      },
      {
        command: 'show cdp neighbors',
        alias: 'sh cdp nei',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays information about directly connected Cisco devices, including device IDs, local interfaces, port IDs, and hardware platforms.',
        example: 'Router# show cdp neighbors\nDevice ID        Local Intrfce     Holdtme    Capability  Platform  Port ID\nSwitch1          Fas 0/1           163             S I    2960      Fas 0/1',
        tip: 'Invaluable tool for mapping out an unknown network topology at Layer 2.'
      },
      {
        command: 'show arp',
        alias: 'sh arp',
        mode: 'Router#',
        category: 'show',
        purpose: 'Displays the Address Resolution Protocol (ARP) table mapping Layer 3 IPv4 addresses to Layer 2 MAC addresses on local subnets.',
        example: 'Router# show arp\nProtocol  Address          Age (min)  Hardware Addr   Type   Interface\nInternet  192.168.1.10             -  0050.7966.6801  ARPA   GigabitEthernet0/0',
        tip: 'Verifies that the router is successfully resolving neighbor MAC addresses.'
      },
      {
        command: 'ping <destination-ip>',
        mode: 'Router# / Router>',
        category: 'diagnostics',
        purpose: 'Sends ICMP Echo Requests to verify end-to-end IP reachability, calculate round-trip latency, and confirm routing path.',
        example: 'Router# ping 192.168.2.1\nSending 5, 100-byte ICMP Echos to 192.168.2.1, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5)',
        tip: 'Exclamation marks (!) indicate successful echo replies; periods (.) indicate timeouts.'
      },
      {
        command: 'traceroute <destination-ip>',
        mode: 'Router# / Router>',
        category: 'diagnostics',
        purpose: 'Traces the exact hop-by-hop layer 3 path to destination IP using TTL values, displaying each intermediate router and latency.',
        example: 'Router# traceroute 10.0.0.5\nTracing the route to 10.0.0.5:\n  1  192.168.12.2 (R2-Core) 2 ms\n  2  10.0.0.5 (Server-Main) 4 ms\nTrace complete.',
        tip: 'Locates the exact router hop where packet forwarding fails or drops.'
      },
      {
        command: 'exit / end',
        mode: 'Any Config Mode',
        category: 'modes',
        purpose: 'Exit moves back one configuration level (e.g. from interface to global config). End returns immediately to privileged mode (Router#).',
        example: 'Router(config-if)# exit\nRouter(config)#',
        tip: 'Keyboard shortcut Ctrl+Z is equivalent to the "end" command.'
      },
      {
        command: 'clear',
        mode: 'Any Mode',
        category: 'system',
        purpose: 'Clears the terminal output buffer on the screen.',
        example: 'Router# clear',
        tip: 'Cleans up the CLI window for readability during simulation.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  2. LAYER 2 SWITCHES & BRIDGES (L2)
  // ────────────────────────────────────────────────────────────
  switch: {
    type: 'switch',
    category: 'switches',
    title: 'Cisco Layer 2 Enterprise Access Switches & Bridges',
    osiLayer: 'Layer 2 — Data Link Layer',
    iconType: 'switch',
    badgeColor: '#00ff88',
    models: [
      { id: '2960-24TT', name: 'Catalyst 2960-24TT', ports: '24 FastEthernet ports, 2 GigabitEthernet copper uplinks' },
      { id: '2950-24', name: 'Catalyst 2950-24', ports: '24 FastEthernet 10/100 ports' },
      { id: '2950T-24', name: 'Catalyst 2950T-24', ports: '24 FastEthernet ports, 2 GigabitEthernet uplinks' },
      { id: 'IE-2000', name: 'Cisco IE-2000 Industrial', ports: '4 FE ports, 2 GE combo uplinks, DIN-rail mount' },
      { id: 'Switch-PT', name: 'Switch-PT Generic', ports: '6 FastEthernet ports (software simulation)' },
      { id: 'Switch-PT-Empty', name: 'Switch-PT-Empty', ports: '10 blank expansion slots for modular interfaces' },
      { id: 'Bridge-PT', name: 'Bridge-PT 2-Port', ports: '2 FastEthernet ports (Layer 2 collision domain separator)' },
    ],
    overview: {
      role: 'High-density local host aggregation, MAC address learning, collision domain segmentation, and VLAN segmentation.',
      purpose: 'Layer 2 switches connect client workstations, servers, and access points into a local area network. Switches read incoming Ethernet frame headers, inspect the Source MAC address to build their CAM/MAC Address Table, and inspect the Destination MAC address to forward frames directly to the correct destination port (unicast) rather than broadcasting to all ports.',
      whenToUse: [
        'Connecting multiple PCs, laptops, IP phones, and printers on a local floor or office.',
        'Eliminating collisions: Each switch port operates as an isolated Collision Domain in Full-Duplex mode.',
        'Creating Virtual LANs (VLANs) to segment departments (e.g. Sales VLAN 10, IT VLAN 20, Guest VLAN 30).',
        'Configuring 802.1Q Trunk links to carry multi-VLAN traffic to routers and distribution switches.',
        'Preventing Layer 2 loops using Spanning Tree Protocol (STP / RSTP).'
      ],
      keyFeatures: [
        'Hardware ASIC wire-speed frame switching',
        'Automatic MAC address learning and CAM aging table',
        'IEEE 802.1Q VLAN tagging (Access ports vs Trunk ports)',
        'Spanning Tree Protocol (STP IEEE 802.1D / RSTP 802.1w) loop prevention'
      ]
    },
    commands: [
      {
        command: 'enable',
        alias: 'en',
        mode: 'Switch>',
        category: 'modes',
        purpose: 'Enters Privileged Exec Mode on the switch.',
        example: 'Switch> enable\nSwitch#',
        tip: 'Unlocks switch diagnostic and VLAN configuration commands.'
      },
      {
        command: 'configure terminal',
        alias: 'conf t',
        mode: 'Switch#',
        category: 'modes',
        purpose: 'Enters Global Configuration Mode for switch-wide settings.',
        example: 'Switch# conf t\nSwitch(config)#',
        tip: 'Required before creating VLANs or configuring switch ports.'
      },
      {
        command: 'hostname <name>',
        mode: 'Switch(config)#',
        category: 'system',
        purpose: 'Sets the administrative hostname for the switch.',
        example: 'Switch(config)# hostname SW1-Floor2\nSW1-Floor2(config)#',
        tip: 'Always identify switch floor/rack in the hostname (e.g. SW-Access-1).'
      },
      {
        command: 'copy running-config startup-config',
        alias: 'copy run start',
        mode: 'Switch#',
        category: 'system',
        purpose: 'Saves the active configuration (running-config) to NVRAM (startup-config) so it persists after a reboot.',
        example: 'Switch# copy run start\nDestination filename [startup-config]? \nBuilding configuration...\n[OK]',
        tip: 'Always run this before turning off or reloading a device to prevent configuration loss.'
      },
      {
        command: 'vlan <vlan-id>',
        mode: 'Switch(config)#',
        category: 'vlans',
        purpose: 'Creates a Virtual LAN database entry on the switch (valid IDs: 1 to 4094; normal range: 1 to 1005).',
        example: 'Switch(config)# vlan 10\nSwitch(config-vlan)#',
        tip: 'VLAN 1 is the default native VLAN and cannot be deleted.'
      },
      {
        command: 'name <vlan-name>',
        mode: 'Switch(config-vlan)#',
        category: 'vlans',
        purpose: 'Assigns an administrative descriptive name to the newly created VLAN.',
        example: 'Switch(config-vlan)# name Engineering',
        tip: 'Names make VLAN identification clear in "show vlan brief".'
      },
      {
        command: 'interface <type><number>',
        alias: 'int <name>',
        mode: 'Switch(config)#',
        category: 'interfaces',
        purpose: 'Selects a switch port interface for configuration (e.g. FastEthernet0/1, GigabitEthernet0/1).',
        example: 'Switch(config)# interface FastEthernet0/1\nSwitch(config-if)#',
        tip: 'Can also select interface ranges (e.g. "interface range fa0/1 - 12").'
      },
      {
        command: 'switchport mode access',
        mode: 'Switch(config-if)#',
        category: 'interfaces',
        purpose: 'Configures the port as a permanent Layer 2 Access Port that carries traffic for only ONE untagged VLAN (connects to end hosts).',
        example: 'Switch(config-if)# switchport mode access',
        tip: 'End devices (PCs, printers) must always be connected to access ports, not trunks.'
      },
      {
        command: 'switchport access vlan <vlan-id>',
        mode: 'Switch(config-if)#',
        category: 'interfaces',
        purpose: 'Assigns the access port to a specific VLAN membership (e.g. VLAN 10).',
        example: 'Switch(config-if)# switchport access vlan 10',
        tip: 'Traffic from this port is isolated into VLAN 10 and cannot reach other VLANs without a router.'
      },
      {
        command: 'switchport mode trunk',
        mode: 'Switch(config-if)#',
        category: 'interfaces',
        purpose: 'Configures the port as an IEEE 802.1Q Trunk Link carrying frames tagged with VLAN IDs between switches or to a router.',
        example: 'Switch(config-if)# switchport mode trunk',
        tip: 'Used on uplink ports connecting Switch to Switch or Switch to Router (Router-on-a-Stick).'
      },
      {
        command: 'no shutdown',
        mode: 'Switch(config-if)#',
        category: 'interfaces',
        purpose: 'Administratively enables the switch port.',
        example: 'Switch(config-if)# no shutdown',
        tip: 'Switch ports are usually up by default, but use this if previously shut down.'
      },
      {
        command: 'shutdown',
        mode: 'Switch(config-if)#',
        category: 'interfaces',
        purpose: 'Administratively disables the switch port for security or maintenance.',
        example: 'Switch(config-if)# shutdown',
        tip: 'Security best practice: Shut down all unused switch ports to prevent unauthorized access.'
      },
      {
        command: 'spanning-tree vlan <id> priority <value>',
        mode: 'Switch(config)#',
        category: 'stp',
        purpose: 'Configures Spanning Tree Bridge Priority (must be multiples of 4096: 0, 4096, 8192 ... 32768, 61440) to influence Root Bridge election.',
        example: 'Switch(config)# spanning-tree vlan 1 priority 4096',
        tip: 'The switch with the LOWEST Bridge Priority (and lowest MAC) becomes the STP Root Bridge.'
      },
      {
        command: 'spanning-tree vlan <id> root primary',
        mode: 'Switch(config)#',
        category: 'stp',
        purpose: 'Automatically sets the switch bridge priority to 24576 (or lower) to force this switch to become the primary STP Root Bridge.',
        example: 'Switch(config)# spanning-tree vlan 1 root primary',
        tip: 'Always configure core distribution switches as STP root to ensure predictable loop-free paths.'
      },
      {
        command: 'ip default-gateway <ip>',
        mode: 'Switch(config)#',
        category: 'system',
        purpose: 'Configures the default gateway IP address for the switch management interface so remote admins can SSH/Telnet across subnets.',
        example: 'Switch(config)# ip default-gateway 192.168.1.1',
        tip: 'Only used for switch management packets; Layer 2 switches do not route transit user data packets.'
      },
      {
        command: 'show mac address-table',
        alias: 'sh mac',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays the switch CAM table containing dynamic learned MAC addresses, associated VLAN IDs, and physical ingress ports.',
        example: 'Switch# show mac address-table\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   1    0050.7966.6801    DYNAMIC     Fa0/1\n  10    0001.9654.3210    DYNAMIC     Fa0/2',
        tip: 'Use to verify physical port location of devices or troubleshoot port security.'
      },
      {
        command: 'show vlan brief',
        alias: 'sh vlan br',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays a table of all configured VLANs, operational status (active/suspended), and assigned access member ports.',
        example: 'Switch# show vlan brief\nVLAN  Name                Status    Ports\n----  ------------------  --------  -----\n1     default             active    Fa0/3, Fa0/4, G0/1\n10    Engineering         active    Fa0/1\n20    Sales               active    Fa0/2',
        tip: 'Crucial verification command to check if access ports are assigned to the correct VLAN.'
      },
      {
        command: 'show ip interface brief',
        alias: 'sh ip int br',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays status of switch management SVIs (e.g. VLAN 1) and physical port line states.',
        example: 'Switch# show ip int br',
        tip: 'Verifies the switch management IP configuration.'
      },
      {
        command: 'show running-config',
        alias: 'sh run',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays the complete active configuration running in switch RAM.',
        example: 'Switch# show running-config',
        tip: 'Checks trunk modes, access VLANs, and spanning tree configurations.'
      },
      {
        command: 'show version',
        alias: 'sh ver',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays switch model, Cisco IOS software release, and port counts.',
        example: 'Switch# show version',
        tip: 'Used for equipment audits and inventory tracking.'
      },
      {
        command: 'show cdp neighbors',
        alias: 'sh cdp nei',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays information about directly connected Cisco devices, including device IDs, local interfaces, port IDs, and hardware platforms.',
        example: 'Switch# show cdp neighbors\nDevice ID        Local Intrfce     Holdtme    Capability  Platform  Port ID\nRouter1          Fas 0/1           163             R      1941      Gig 0/0',
        tip: 'Invaluable tool for mapping out an unknown network topology at Layer 2.'
      },
      {
        command: 'ping <ip>',
        mode: 'Switch#',
        category: 'diagnostics',
        purpose: 'Tests management connectivity from switch SVI interface to gateways or monitoring servers.',
        example: 'Switch# ping 192.168.1.1',
        tip: 'Verifies that the switch management interface is reachable.'
      },
      {
        command: 'exit / end',
        mode: 'Any Config Mode',
        category: 'modes',
        purpose: 'Returns to previous mode or privileged exec mode.',
        example: 'Switch(config-if)# exit\nSwitch(config)#',
        tip: 'Standard Cisco IOS mode navigation.'
      },
      {
        command: 'clear',
        mode: 'Any Mode',
        category: 'system',
        purpose: 'Clears the terminal output screen.',
        example: 'Switch# clear',
        tip: 'Refreshes the console buffer.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  3. LAYER 3 MULTILAYER SWITCHES (L3 SWITCH)
  // ────────────────────────────────────────────────────────────
  l3switch: {
    type: 'l3switch',
    category: 'l3switches',
    title: 'Cisco Catalyst Multilayer Layer 3 Switches',
    osiLayer: 'Layer 3 & Layer 2 — Network & Data Link',
    iconType: 'l3switch',
    badgeColor: '#ffaa00',
    models: [
      { id: '3560-24PS', name: 'Catalyst 3560-24PS', ports: '24 FastEthernet PoE ports, 2 SFP Gigabit uplinks, IP routing' },
      { id: '3650-24PS', name: 'Catalyst 3650-24PS', ports: '24 GE PoE+ ports, 2 10G SFP+ uplinks, Cisco StackWise-160' },
      { id: 'IE-3400', name: 'Catalyst IE-3400 Industrial', ports: 'Modular DIN-Rail L3 switch, GE PoE+, Resilient Ethernet' },
      { id: 'IE-9320', name: 'Catalyst IE-9320 Industrial', ports: '24 GE ports, 4 10G SFP+, IEEE 1588 PTP, PRP/HSR zero-loss' },
    ],
    overview: {
      role: 'Hardware-accelerated wire-speed Inter-VLAN routing, high-density distribution switching, and core campus routing.',
      purpose: 'Layer 3 Multilayer Switches combine the high port density and microsecond switching performance of an L2 switch with full IPv4/IPv6 routing capabilities implemented in Application-Specific Integrated Circuit (ASIC) hardware. They eliminate the router-on-a-stick bottleneck by routing traffic between VLANs directly inside the switch chassis using Switched Virtual Interfaces (SVIs).',
      whenToUse: [
        'Campus distribution and core layers with high inter-VLAN bandwidth demands.',
        'Providing hardware-speed Inter-VLAN routing for tens or hundreds of subnets without needing an external router.',
        'Connecting routed uplinks directly to WAN edge routers using "no switchport" routed ports.',
        'Running dynamic routing protocols (OSPF, RIP) directly inside the campus switch fabric.'
      ],
      keyFeatures: [
        'ASIC wire-speed Layer 3 packet forwarding (millions of packets per second)',
        'Switched Virtual Interfaces (SVIs) via "interface vlan <id>" with default gateway IP',
        'Physical Routed Ports via "no switchport" mode',
        'Hardware Access Control Lists (ACLs) and Quality of Service (QoS)'
      ]
    },
    commands: [
      {
        command: 'ip routing',
        mode: 'Switch(config)#',
        category: 'routing',
        purpose: 'Enables IPv4 routing engine in hardware. On Cisco Catalyst multilayer switches, IP routing is disabled by default.',
        example: 'Switch(config)# ip routing',
        tip: 'CRITICAL: You MUST run "ip routing" for SVIs and static/dynamic routes to forward packets between VLANs.'
      },
      {
        command: 'interface vlan <vlan-id>',
        alias: 'int vlan <id>',
        mode: 'Switch(config)#',
        category: 'routing',
        purpose: 'Creates a Switched Virtual Interface (SVI) which acts as the Layer 3 Default Gateway for all devices in that VLAN.',
        example: 'Switch(config)# interface vlan 10\nSwitch(config-if)# ip address 192.168.10.1 255.255.255.0\nSwitch(config-if)# no shutdown',
        tip: 'Hosts in VLAN 10 will set their default gateway to 192.168.10.1.'
      },
      {
        command: 'no switchport',
        mode: 'Switch(config-if)#',
        category: 'interfaces',
        purpose: 'Disables Layer 2 switching on a physical port and converts it into a pure Layer 3 Routed Port that can take an IP address.',
        example: 'Switch(config-if)# no switchport\nSwitch(config-if)# ip address 10.0.0.1 255.255.255.252',
        tip: 'Used on point-to-point links connecting the L3 switch to core routers.'
      },
      {
        command: 'ip route <network> <mask> <next-hop>',
        mode: 'Switch(config)#',
        category: 'routing',
        purpose: 'Installs a static route on the multilayer switch for forwarding packets to remote subnets.',
        example: 'Switch(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.2',
        tip: 'Default route forwards external/Internet traffic to the perimeter firewall or WAN router.'
      },
      {
        command: 'ipv6 route <network>/<prefix> <next-hop>',
        mode: 'Switch(config)#',
        category: 'routing',
        purpose: 'Installs a static route on the multilayer switch for forwarding packets to remote IPv6 subnets.',
        example: 'Switch(config)# ipv6 route 2001:db8::/32 2001:db8:acad:1::2',
        tip: 'Requires IPv6 routing to be enabled.'
      },
      {
        command: 'router ospf <process-id>',
        mode: 'Switch(config)#',
        category: 'routing',
        purpose: 'Runs OSPF dynamic routing directly on the Multilayer Switch to advertise VLAN SVIs across the enterprise network.',
        example: 'Switch(config)# router ospf 1\nSwitch(config-router)# network 192.168.10.0 0.0.0.255 area 0',
        tip: 'Enables dynamic path convergence when redundant switch links exist.'
      },
      {
        command: 'show ip route',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays the active Layer 3 routing table inside the multilayer switch, including connected SVIs and routes.',
        example: 'Switch# show ip route',
        tip: 'Verifies inter-VLAN routes are installed and active.'
      },
      {
        command: 'show ipv6 route',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays the active Layer 3 IPv6 routing table inside the multilayer switch, including connected SVIs and routes.',
        example: 'Switch# show ipv6 route',
        tip: 'Verifies IPv6 inter-VLAN routes are installed and active.'
      },
      {
        command: 'show vlan brief',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays Layer 2 VLAN assignments on the multilayer switch.',
        example: 'Switch# show vlan brief',
        tip: 'Ensures VLANs match the corresponding SVI numbers.'
      },
      {
        command: 'show mac address-table',
        mode: 'Switch#',
        category: 'show',
        purpose: 'Displays Layer 2 CAM table for local switching ports.',
        example: 'Switch# show mac address-table',
        tip: 'Verifies MAC learning on switchports.'
      },
      {
        command: 'ping <ip>',
        mode: 'Switch#',
        category: 'diagnostics',
        purpose: 'Tests Layer 3 IP connectivity from the multilayer switch.',
        example: 'Switch# ping 192.168.10.50',
        tip: 'Verifies end-to-end host reachability.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  4. SECURITY FIREWALLS & APPLIANCES
  // ────────────────────────────────────────────────────────────
  firewall: {
    type: 'firewall',
    category: 'security',
    title: 'Cisco ASA Firewalls, ISA-3000 & Security Appliances',
    osiLayer: 'Layer 3 to Layer 7 — Network to Application',
    iconType: 'firewall',
    badgeColor: '#ff4466',
    models: [
      { id: 'ISA-3000', name: 'Cisco ISA 3000 Industrial Appliance', ports: '4 GigabitEthernet ports (copper/fiber), 1 Mgmt, DIN-rail, OT/ICS DPI' },
      { id: '5506-X', name: 'Cisco ASA 5506-X Next-Gen Firewall', ports: '8 GigabitEthernet ports, 1 Mgmt, FirePOWER Services, Stateful Inspection' },
      { id: '5505', name: 'Cisco ASA 5505 Security Appliance', ports: '8 FastEthernet switch ports (2 PoE), IPsec VPN acceleration' },
      { id: 'Meraki-MX65W', name: 'Cisco Meraki MX65W Security Appliance', ports: '2 Dedicated GbE WAN, 8 GbE LAN (2 PoE+), Dual-Band 802.11ac Wi-Fi, SD-WAN' },
    ],
    overview: {
      role: 'Perimeter network defense, stateful packet inspection, security zones, SD-WAN auto-VPN, and Network Address Translation (NAT).',
      purpose: 'Firewalls and Industrial/Cloud-Managed Security Appliances protect enterprise and industrial networks from unauthorized external access. Cisco ASA and ISA-3000 appliances enforce a Security Zone hierarchy (Inside 100, DMZ 50, Outside 0) and OT/ICS protocol inspection. Cisco Meraki MX appliances deliver 100% centralized cloud management, Auto VPN mesh SD-WAN interconnectivity, Next-Gen Layer 7 application filtering, and integrated dual-band 802.11ac wireless.',
      whenToUse: [
        'Deploying at the network edge between private enterprise LAN and the public Internet.',
        'Isolating public-facing servers in a Demilitarized Zone (DMZ security level 50).',
        'Deploying Meraki MX65W for branch SD-WAN with integrated PoE+ switchports and Wi-Fi.',
        'Enforcing Stateful Packet Inspection (SPI) for TCP, UDP, and ICMP protocols.',
        'Hiding private internal IP addresses with Port Address Translation (PAT / NAT Overload).'
      ],
      keyFeatures: [
        'Stateful Packet Inspection: Tracks TCP handshakes and sequence numbers in connection tables',
        'Security Levels (Inside 100, DMZ 50, Outside 0) and Cisco Meraki Cloud Dashboard policies',
        'Access Control Lists (ACLs) with implicit deny all at the bottom',
        'Dynamic NAT/PAT translation engine & Auto-VPN SD-WAN mesh'
      ]
    },
    commands: [
      {
        command: 'nameif <zone-name>',
        mode: 'ciscoasa(config-if)#',
        category: 'zones',
        purpose: 'Assigns a logical security zone name to the interface (e.g. inside, outside, dmz).',
        example: 'ciscoasa(config-if)# nameif inside\nINFO: Security level for "inside" set to 100 by default.',
        tip: 'Naming an interface "inside" automatically defaults to security level 100; "outside" defaults to 0.'
      },
      {
        command: 'security-level <0-100>',
        mode: 'ciscoasa(config-if)#',
        category: 'zones',
        purpose: 'Explicitly sets the trust level for the interface (100 = most trusted internal network, 0 = untrusted Internet).',
        example: 'ciscoasa(config-if)# security-level 50',
        tip: 'DMZ zones hosting web/mail servers typically use security level 50.'
      },
      {
        command: 'ip address <ip> <subnet-mask>',
        mode: 'ciscoasa(config-if)#',
        category: 'interfaces',
        purpose: 'Assigns an IP address to the firewall interface.',
        example: 'ciscoasa(config-if)# ip address 192.168.1.1 255.255.255.0',
        tip: 'Acts as default gateway for hosts in that security zone.'
      },
      {
        command: 'access-list <name> extended permit <proto> <src> <dst>',
        mode: 'ciscoasa(config)#',
        category: 'security',
        purpose: 'Creates an Access Control List rule allowing specific traffic through the firewall.',
        example: 'ciscoasa(config)# access-list OUTSIDE_IN extended permit tcp any host 192.168.1.100 eq 80',
        tip: 'Extended ACLs permit filtering based on protocol (TCP/UDP/ICMP), source IP, destination IP, and port number.'
      },
      {
        command: 'access-group <name> in interface <interface-name>',
        mode: 'ciscoasa(config)#',
        category: 'security',
        purpose: 'Binds an Access Control List to an interface for inbound traffic evaluation.',
        example: 'ciscoasa(config)# access-group OUTSIDE_IN in interface outside',
        tip: 'Applied top-down: the first matching rule permits or denies traffic; unmatched traffic hits implicit deny.'
      },
      {
        command: 'show running-config',
        mode: 'ciscoasa#',
        category: 'show',
        purpose: 'Displays complete firewall rules, NAT configurations, and zone security levels.',
        example: 'ciscoasa# show running-config',
        tip: 'Use to review security policies.'
      },
      {
        command: 'ping <ip>',
        mode: 'ciscoasa#',
        category: 'diagnostics',
        purpose: 'Tests network reachability from the firewall.',
        example: 'ciscoasa# ping 8.8.8.8',
        tip: 'Verifies external WAN connectivity.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  4b. CYBERSECURITY POSTURE & TELEMETRY PLATFORMS
  // ────────────────────────────────────────────────────────────
  cyberobserver: {
    type: 'cyberobserver',
    category: 'security',
    title: 'CyberObserver Continuous Security & Telemetry Platform',
    osiLayer: 'Layer 7 — Application & Cybersecurity Analytics',
    iconType: 'cyberobserver',
    badgeColor: '#00ffff',
    models: [
      { id: 'CyberObserver', name: 'CyberObserver Security Platform', ports: '2 GigabitEthernet monitoring / sensor ports, 1 FastEthernet management port' },
      { id: 'PT-CyberObserver', name: 'PT-CyberObserver Generic', ports: '2 GE sensor ports, 1 FE management port' }
    ],
    overview: {
      role: 'Continuous Security Posture Management (CSPM), network security compliance auditing, and real-time threat telemetry sensor.',
      purpose: 'CyberObserver is a cybersecurity management and telemetry sensor platform. It continuously connects to firewalls, switches, routers, and host servers across enterprise topologies to measure cybersecurity controls, verify NIST CSF / ISO 27001 compliance, track real-time security posture scores, and aggregate network telemetry.',
      whenToUse: [
        'Auditing network security compliance and firewall policy alignment.',
        'Continuous monitoring of enterprise network devices and infrastructure telemetry.',
        'Connecting to SPAN / Mirror ports on switches to analyze security traffic.'
      ],
      keyFeatures: [
        'Continuous Security Posture Score (0–100%) measurement',
        'Compliance tracking for NIST CSF, ISO 27001, CIS Critical Security Controls',
        'Real-time network security sensor & telemetry engine'
      ]
    },
    commands: [
      {
        command: 'show posture summary',
        mode: 'CyberObserver#',
        category: 'show',
        purpose: 'Displays overall security posture compliance score and health across all monitored network devices.',
        example: 'CyberObserver# show posture summary\nOverall Posture Score: 94%\nCompliance: NIST CSF (Compliant), ISO 27001 (Audited)\nActive Sensors: 3 Devices Monitored',
        tip: 'Identifies misconfigured access rules or unencrypted management sessions.'
      },
      {
        command: 'show telemetry sensors',
        mode: 'CyberObserver#',
        category: 'show',
        purpose: 'Lists active real-time telemetry sensor streams collected from firewalls and routers.',
        example: 'CyberObserver# show telemetry sensors\nSensor ID    Source IP        Protocol    Status\n---------    ---------------  --------    ------\nSENSOR-01    192.168.1.1      ASA-SYSLOG  ACTIVE\nSENSOR-02    192.168.10.1     NETFLOW     ACTIVE',
        tip: 'Verifies live sensor telemetry feed.'
      },
      {
        command: 'ping <ip>',
        mode: 'CyberObserver#',
        category: 'diagnostics',
        purpose: 'Tests Layer 3 IP reachability from the CyberObserver platform to network devices.',
        example: 'CyberObserver# ping 192.168.1.1',
        tip: 'Ensures management connectivity to supervised firewalls and switches.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  5. WIRELESS ROUTERS, GATEWAYS, WLCS & ACCESS POINTS
  // ────────────────────────────────────────────────────────────
  wirelessrouter: {
    type: 'wirelessrouter',
    category: 'wireless',
    title: 'Wireless Routers, IoT Gateways, WLCs & APs',
    osiLayer: 'Layer 1 & Layer 2 — Physical & Data Link',
    iconType: 'wirelessrouter',
    badgeColor: '#a855f7',
    models: [
      { id: 'HomeRouter-PT-AC', name: 'HomeRouter-PT-AC', ports: '1 GE WAN, 4 GE LAN, Concurrent 2.4GHz & 5GHz 802.11ac Wi-Fi' },
      { id: 'WRT300N', name: 'Linksys WRT300N Wireless-N', ports: '1 FE WAN, 4 FE LAN, 802.11b/g/n 2.4GHz' },
      { id: 'DLC100', name: 'DLC100 Home Gateway', ports: '1 WAN, 4 LAN, 2.4/5GHz Wi-Fi, IoT Server & ZigBee/BLE Radio' },
      { id: 'AccessPoint-PT-AC', name: 'AccessPoint-PT-AC', ports: '1 GE Uplink, Concurrent 2.4GHz & 5GHz 802.11ac Radios' },
      { id: 'AccessPoint-PT-N', name: 'AccessPoint-PT-N', ports: '1 GE Uplink, 802.11n 2.4GHz MIMO Radio' },
      { id: 'AccessPoint-PT-A', name: 'AccessPoint-PT-A', ports: '1 GE Uplink, 802.11a 5GHz Radio' },
      { id: 'AccessPoint-PT', name: 'AccessPoint-PT', ports: '1 GE Uplink, 802.11b/g 2.4GHz Radio' },
      { id: 'LAP-PT', name: 'LAP-PT Lightweight AP', ports: '1 GE PoE Uplink, CAPWAP Tunneling to WLC' },
      { id: '3702i', name: 'Cisco Aironet 3702i LAP', ports: '1 GE PoE+ Uplink, 4x4 MIMO, CleanAir Spectrum, 802.11ac Wave 1' },
      { id: 'WLC-3504', name: 'Cisco 3504 Wireless Controller', ports: '4 GE ports, 1 mGig port, up to 150 APs' },
      { id: 'WLC-2504', name: 'Cisco 2504 Wireless Controller', ports: '4 GE ports (2 PoE), up to 75 APs' },
      { id: 'WLC-PT', name: 'WLC-PT Generic Controller', ports: '1 Management GE, 2 Distribution GE ports' },
    ],
    overview: {
      role: 'Wireless LAN host association, RF transmission, IoT registration, and centralized WLC controller orchestration.',
      purpose: 'Wireless infrastructure bridges mobile endpoints (laptops, smartphones, IoT sensors) to enterprise networks. Home Routers (HomeRouter-PT-AC, WRT300N) integrate an AP, switch, and NAT router. Smart Home Gateways (DLC100) host embedded IoT servers for automating smart appliances. Enterprise Lightweight APs (LAP-PT, 3702i) establish CAPWAP tunnels to Wireless LAN Controllers (WLC-PT, 2504, 3504) for centralized security, RF CleanAir spectrum management, and seamless client roaming.',
      whenToUse: [
        'Providing high-speed 802.11ac Wi-Fi access for mobile endpoints and guest networks.',
        'Connecting SOHO branch offices to the Internet with integrated DHCP and NAT.',
        'Connecting and automating smart home IoT sensors via DLC100 Home Gateway.',
        'Managing enterprise-scale campus APs centrally through Cisco 2504 or 3504 Wireless Controllers.',
        'Securing wireless transmissions using WPA2/WPA3-Personal (AES) or Enterprise (802.1X/RADIUS).'
      ],
      keyFeatures: [
        'IEEE 802.11a/b/g/n/ac dual-band frequency management (2.4 GHz & 5 GHz)',
        'CAPWAP/LWAPP tunneling between Lightweight APs and WLC controllers',
        'Embedded IoT Registration Server (DLC100 Home Gateway)',
        'WPA2/WPA3 AES-CCMP encryption and dynamic guest portals'
      ]
    },
    commands: [
      {
        command: 'ssid <network-name>',
        mode: 'WRT300N(config-wireless)#',
        category: 'wireless',
        purpose: 'Configures the Service Set Identifier (network name) broadcast to Wi-Fi client devices.',
        example: 'WRT300N(config-wireless)# ssid Office-WiFi',
        tip: 'Choose clear, descriptive SSIDs for staff and separate SSIDs for guests.'
      },
      {
        command: 'security <WPA2 | WPA3 | Open>',
        mode: 'WRT300N(config-wireless)#',
        category: 'wireless',
        purpose: 'Selects the wireless encryption algorithm. WPA2 uses robust AES/CCMP cipher encryption.',
        example: 'WRT300N(config-wireless)# security WPA2',
        tip: 'Never use legacy WEP encryption; always use WPA2 or WPA3.'
      },
      {
        command: 'passphrase <secret-key>',
        mode: 'WRT300N(config-wireless)#',
        category: 'wireless',
        purpose: 'Sets the Pre-Shared Key (PSK) password required by clients to authenticate to the Wi-Fi network.',
        example: 'WRT300N(config-wireless)# passphrase CiscoPass2026!',
        tip: 'Use minimum 8 characters with letters, numbers, and symbols.'
      },
      {
        command: 'ip address <ip> <subnet-mask>',
        mode: 'WRT300N(config-lan)#',
        category: 'interfaces',
        purpose: 'Sets the LAN gateway IP address for connected wireless and wired Ethernet clients.',
        example: 'WRT300N(config-lan)# ip address 192.168.0.1 255.255.255.0',
        tip: 'Default gateway provided to DHCP clients.'
      },
      {
        command: 'show wireless',
        mode: 'WRT300N#',
        category: 'show',
        purpose: 'Displays active wireless status, broadcast SSID, security encryption mode, and connected wireless client stations.',
        example: 'WRT300N# show wireless',
        tip: 'Verifies radio broadcast status and client associations.'
      },
      {
        command: 'show ap summary',
        mode: 'WLC#',
        category: 'show',
        purpose: 'Displays all Lightweight Access Points (LAPs) currently registered and joined to the Wireless LAN Controller.',
        example: 'WLC# show ap summary\nAP Name          Slots  AP Model        Ethernet MAC      IP Address\n---------------  -----  --------------  ----------------  --------------\nLAP-Floor1       2      AIR-CAP3702I    0014.6a55.1001    192.168.1.50',
        tip: 'Verifies CAPWAP tunnel establishment between AP and controller.'
      },
      {
        command: 'ping <ip>',
        mode: 'WRT300N#',
        category: 'diagnostics',
        purpose: 'Tests IP reachability from the wireless router to LAN hosts or WAN gateway.',
        example: 'WRT300N# ping 192.168.0.10',
        tip: 'Tests if Wi-Fi clients are successfully exchanging packets.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  6. END DEVICES & SERVERS
  // ────────────────────────────────────────────────────────────
  pc: {
    type: 'pc',
    category: 'hosts',
    title: 'PC Workstations, Laptops & End Devices',
    osiLayer: 'Layer 7 to Layer 1 — Full Protocol Stack',
    iconType: 'pc',
    badgeColor: '#00d4ff',
    models: [
      { id: 'PC-PT', name: 'PC-PT (Host Workstation)', ports: '1 FastEthernet/Gigabit NIC' },
      { id: 'Laptop-PT', name: 'Laptop-PT (Laptop Computer)', ports: '1 FastEthernet NIC, integrated Wi-Fi' },
      { id: 'Printer-PT', name: 'Printer-PT (Network Printer)', ports: '1 FastEthernet NIC' },
      { id: '7960', name: '7960 (Cisco Unified IP Phone)', ports: '1 FastEthernet SW (PoE), 1 FastEthernet PC pass-through' },
      { id: 'Home-VoIP-PT', name: 'Home-VoIP-PT (Analog Telephone Adapter)', ports: '1 Ethernet Internet WAN, 1 RJ-11 Phone' },
      { id: 'Analog-Phone-PT', name: 'Analog-Phone-PT (Desk Phone)', ports: '1 RJ-11 Telephone Line' },
      { id: 'TV-PT', name: 'TV-PT (Smart TV Display)', ports: '1 FastEthernet NIC, integrated Wi-Fi' },
      { id: 'TabletPC-PT', name: 'TabletPC-PT (Tablet Computer)', ports: '1 802.11ac Wi-Fi transceiver' },
      { id: 'SMARTPHONE-PT', name: 'SMARTPHONE-PT (Cellular & Wi-Fi)', ports: '1 Wi-Fi, 1 4G/5G Cellular transceiver' },
      { id: 'WirelessEndDevice-PT', name: 'WirelessEndDevice-PT', ports: '1 802.11 Wi-Fi radio' },
      { id: 'WiredEndDevice-PT', name: 'WiredEndDevice-PT', ports: '1 FastEthernet NIC' },
      { id: 'Sniffer', name: 'Sniffer (Protocol Analyzer)', ports: '2 FastEthernet / Gigabit capture ports (Port0, Port1)' },
    ],
    overview: {
      role: 'End-user client generating application requests (Web, DNS, Email, ICMP) and receiving responses.',
      purpose: 'End devices represent user computers that initiate network traffic. Each PC requires an IPv4 address, Subnet Mask, Default Gateway (to reach outside subnets), and DNS Server (to resolve domain names). They maintain local ARP caches and routing tables to determine whether a destination is local (sent directly via ARP/MAC) or remote (sent to Default Gateway).',
      whenToUse: [
        'Simulating client workstations browsing websites, querying DNS, or testing server connections.',
        'Testing DHCP auto-configuration from routers or DHCP servers.',
        'Verifying connectivity with ping and traceroute diagnostics.'
      ],
      keyFeatures: [
        'Static IP or dynamic DHCP client address assignment',
        'Local ARP table resolution for Layer 2 next-hops',
        'Command prompt terminal utilities: ipconfig, ping, traceroute, nslookup'
      ]
    },
    commands: [
      {
        command: 'ipconfig',
        mode: 'C:\\>',
        category: 'host',
        purpose: 'Displays the currently configured IPv4 address, subnet mask, and default gateway for the host network interface.',
        example: 'C:\\> ipconfig\nFastEthernet0 Connection:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.10\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1',
        tip: 'First command to run when troubleshooting host connectivity problems.'
      },
      {
        command: 'ipconfig /all',
        mode: 'C:\\>',
        category: 'host',
        purpose: 'Displays detailed adapter configuration including physical MAC address, DHCP enabled status, DHCP server IP, and DNS servers.',
        example: 'C:\\> ipconfig /all\n   Physical Address. . . . . . . . . : 0050.7966.6801\n   DHCP Enabled. . . . . . . . . . . : Yes\n   DNS Servers . . . . . . . . . . . : 8.8.8.8',
        tip: 'Verifies whether DHCP delivered valid DNS and Gateway parameters.'
      },
      {
        command: 'ping <ip>',
        mode: 'C:\\>',
        category: 'host',
        purpose: 'Sends ICMP Echo Requests to verify network reachability to the local gateway, another PC, or an external server.',
        example: 'C:\\> ping 192.168.1.1\nPinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=1ms TTL=255',
        tip: 'Follow the standard CCNA troubleshooting sequence: 1) ping 127.0.0.1 (loopback), 2) ping self IP, 3) ping default gateway, 4) ping remote server.'
      },
      {
        command: 'traceroute <ip>',
        alias: 'tracert <ip>',
        mode: 'C:\\>',
        category: 'host',
        purpose: 'Displays each router hop along the path to the destination and the latency at each step.',
        example: 'C:\\> traceroute 8.8.8.8\nTracing route to 8.8.8.8 over a maximum of 30 hops:\n  1   1 ms   192.168.1.1 (Gateway)\n  2   3 ms   203.0.113.1 (ISP-Router)\n  3   5 ms   8.8.8.8 (DNS-Server)\nTrace complete.',
        tip: 'Shows precisely where a packet stops forwarding in a multi-router topology.'
      },
      {
        command: 'arp -a',
        mode: 'C:\\>',
        category: 'host',
        purpose: 'Displays the host ARP cache showing recently resolved IP-to-MAC address bindings.',
        example: 'C:\\> arp -a\n  Internet Address      Physical Address      Type\n  192.168.1.1           0001.9654.3210        dynamic',
        tip: 'Confirms that the PC has learned the Layer 2 MAC address of its default gateway.'
      },
      {
        command: 'clear',
        mode: 'C:\\>',
        category: 'host',
        purpose: 'Clears the PC command prompt terminal screen.',
        example: 'C:\\> clear',
        tip: 'Refreshes command window.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  7. SERVERS (DHCP, DNS, WEB, MERAKI, CONTROLLER)
  // ────────────────────────────────────────────────────────────
  server: {
    type: 'server',
    category: 'hosts',
    title: 'Enterprise Network, Meraki & SDN Controller Servers',
    osiLayer: 'Layer 7 — Application Layer',
    iconType: 'server',
    badgeColor: '#00ff88',
    models: [
      { id: 'Server-PT', name: 'Server-PT (Generic Multi-Service)', ports: '1 FastEthernet / GigabitEthernet NIC' },
      { id: 'Meraki-Server', name: 'Meraki-Server (Cloud Dashboard)', ports: '2 GigabitEthernet network interfaces' },
      { id: 'NetworkController', name: 'NetworkController (SDN Controller)', ports: '2 GigabitEthernet network interfaces' },
      { id: 'Central-Office-Server', name: 'Central-Office-Server', ports: '1 GE LAN, 1 Backbone Uplink, 1 Coaxial Port, Cellular Gateway, IoT Registration' },
      { id: 'CyberObserver', name: 'CyberObserver (Continuous Posture Platform)', ports: '2 GE sensor ports, 1 FE management port' },
    ],
    overview: {
      role: 'Hosting centralized network services including Cellular Backhaul Gateway, IoT registration, DHCP, DNS, and Web.',
      purpose: 'Servers provide critical application and infrastructure services. The Central Office Server acts as the core telecommunications gateway for cellular Cell Towers, handling mobile subscriber data, central IoT device registration, DNS domain resolution, and dynamic DHCP IP pools.',
      whenToUse: [
        'Connecting Cell Towers to carrier core backbones via Central Office Server.',
        'Deploying automated DHCP address distribution for enterprise and branch LANs.',
        'Providing Domain Name System (DNS) host resolution for internal and external resources.',
        'Hosting centralized IoT device registration and telemetry control.'
      ],
      keyFeatures: [
        'Central Office cellular base station backbone routing & IoT registration',
        'DHCP Scope & Pool Management (Address range, lease, gateway, DNS options)',
        'DNS \'A\' Record database management',
        'HTTP Web Server hosting test web pages'
      ]
    },
    commands: [
      {
        command: 'ipconfig /all',
        mode: 'Server\\>',
        category: 'host',
        purpose: 'Displays the static IP address, subnet mask, gateway, and DNS configuration of the server.',
        example: 'Server\\> ipconfig /all\n   IPv4 Address. . . . . . . . . . . : 192.168.1.250\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1',
        tip: 'Servers must ALWAYS use static IP addresses, never dynamic DHCP addresses.'
      },
      {
        command: 'ping <ip>',
        mode: 'Server\\>',
        category: 'host',
        purpose: 'Verifies server connectivity to gateways and client subnets.',
        example: 'Server\\> ping 192.168.1.1',
        tip: 'Tests network interface reachability.'
      },
      {
        command: 'traceroute <ip>',
        mode: 'Server\\>',
        category: 'host',
        purpose: 'Traces packet path from server to remote clients or cloud gateways.',
        example: 'Server\\> traceroute 10.0.0.1',
        tip: 'Identifies routing latency.'
      },
      {
        command: 'arp -a',
        mode: 'Server\\>',
        category: 'host',
        purpose: 'Displays the server ARP table.',
        example: 'Server\\> arp -a',
        tip: 'Shows MAC addresses of connecting hosts and default gateway.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  8. LAYER 1 PHYSICAL DEVICES (HUBS, REPEATERS, SPLITTERS)
  // ────────────────────────────────────────────────────────────
  hub: {
    type: 'hub',
    category: 'physical',
    title: 'Hubs, Repeaters & Coaxial Splitters (Layer 1)',
    osiLayer: 'Layer 1 — Physical Layer',
    iconType: 'hub',
    badgeColor: '#7a9ab8',
    models: [
      { id: 'Hub-PT', name: 'Hub-PT Multiport Repeater', ports: '6 FastEthernet 10/100 Half-Duplex ports' },
      { id: 'Repeater-PT', name: 'Repeater-PT Signal Regenerator', ports: '2 FastEthernet ports' },
      { id: 'CoAxialSplitter-PT', name: 'CoAxialSplitter-PT Passive RF', ports: '3 Coaxial BNC RF Ports (1 In, 2 Out)' },
    ],
    overview: {
      role: 'Electrical bit regeneration, physical medium extension, and passive RF splitting.',
      purpose: 'Layer 1 physical devices do NOT inspect MAC addresses, IP addresses, or packet headers. A Hub is a multiport repeater: any electrical bit received on one port is regenerated and blindly repeated out of ALL other ports. All devices connected to a hub share a single Collision Domain and operate in Half-Duplex mode (using CSMA/CD). A Repeater boosts signal strength to overcome copper cable attenuation beyond 100 meters.',
      whenToUse: [
        'Demonstrating legacy network architectures and Ethernet collision domains in CCNA labs.',
        'Extending copper cable reach beyond maximum attenuation distance (100 meters for Cat5e/6).',
        'Splitting coaxial broadband RF signals to multiple cable modems.'
      ],
      keyFeatures: [
        'Operates purely on physical electrical signals and bits (0s and 1s)',
        'NO MAC address table, NO IP routing, NO memory frame buffering',
        'All ports belong to ONE single Collision Domain and ONE Broadcast Domain',
        'Half-duplex only: CSMA/CD (Carrier Sense Multiple Access with Collision Detection)'
      ]
    },
    commands: [
      {
        command: '(Hardware / Physical Only)',
        mode: 'Physical Layer (No CLI)',
        category: 'system',
        purpose: 'Hubs, Repeaters, and Passive Coaxial Splitters are unmanaged Layer 1 physical devices with no CPU, operating system, IP address, or CLI interface.',
        example: 'N/A — Operates automatically at the electrical wire level.',
        tip: 'To monitor connectivity through a hub, run ping and traceroute tests on the connected PC or router endpoints.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────
  //  9. WAN MODEMS & CLOUD
  // ────────────────────────────────────────────────────────────
  modem: {
    type: 'modem',
    category: 'wan',
    title: 'Broadband Modems, Cell Towers & Internet Cloud',
    osiLayer: 'Layer 1 & Layer 2 (Physical & Data Link)',
    iconType: 'modem',
    badgeColor: '#00d4ff',
    models: [
      { id: 'Cloud-PT', name: 'Cloud-PT (Generic WAN Cloud)', ports: 'Ethernet, Serial, Modem RJ-11, and Coaxial interfaces' },
      { id: 'Cloud-PT-Empty', name: 'Cloud-PT-Empty (Modular WAN)', ports: '10 Empty Expansion Bays for Custom ISP Modules' },
      { id: 'Cable-Modem-PT', name: 'Cable-Modem-PT (DOCSIS)', ports: '1 Coaxial BNC port, 1 RJ-45 Ethernet port' },
      { id: 'DSL-Modem-PT', name: 'DSL-Modem-PT (Broadband DSL)', ports: '1 RJ-11 Phone Line port, 1 RJ-45 Ethernet port' },
      { id: 'Cell-Tower', name: 'Cellular 4G/5G Base Station', ports: '1 Coaxial/Fiber backhaul, Wireless LTE RF' },
    ],
    overview: {
      role: 'Modulating digital Ethernet signals into analog telephone/cable/RF carrier signals for WAN transport.',
      purpose: 'Modems (Modulator-Demodulators) convert digital frames from a home or office router into analog signals suitable for transmission over copper telephone lines (DSL), coaxial cable systems (DOCSIS), or cellular towers. The Cloud device simulates public Internet Service Providers (ISPs) and remote cloud hosting environments.',
      whenToUse: [
        'Connecting branch and home offices to ISP telecommunication lines.',
        'Converting high-speed Ethernet signals for long-distance copper or RF mediums.',
        'Simulating global Internet destinations (e.g. 203.0.113.1) in CCNA WAN labs.'
      ],
      keyFeatures: [
        'Analog-to-digital signal modulation and demodulation',
        'Transparent Layer 1/2 bridging between broadband media and local router WAN ports',
        'Simulates real-world ISP cloud gateway connectivity'
      ]
    },
    commands: [
      {
        command: '(Managed via Connected Gateway)',
        mode: 'WAN Bridge (No Local CLI)',
        category: 'system',
        purpose: 'Modems act as transparent physical bridges. Configure IP addressing and default routes on the connected router interface (e.g. Router WAN G0/0/0 or WRT300N Internet port).',
        example: 'Router(config-if)# ip address 203.0.113.2 255.255.255.0\nRouter(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1',
        tip: 'Test end-to-end WAN communication by pinging the Cloud ISP gateway IP (203.0.113.1).'
      }
    ]
  }
};

/** Get profile for a given device type */
export function getDeviceProfile(type) {
  if (!type) return DEVICE_PROFILES.router;
  const t = type.toLowerCase();
  if (DEVICE_PROFILES[t]) return DEVICE_PROFILES[t];
  if (t === 'ap' || t === 'lap' || t === 'wlc' || t === 'wirelessrouter' || t === 'homegateway') return DEVICE_PROFILES.wirelessrouter;
  if (t === 'securityappliance' || t === 'firewall') return DEVICE_PROFILES.firewall;
  if (t === 'coserver' || t === 'server') return DEVICE_PROFILES.server;
  if (t === 'repeater' || t === 'coaxialsplitter' || t === 'splitter' || t === 'bridge') return DEVICE_PROFILES.hub;
  if (t === 'celltower' || t === 'cloud') return DEVICE_PROFILES.modem;
  return DEVICE_PROFILES.router;
}

