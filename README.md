# 🌐 NetGame — Interactive CCNA Network Simulator & Subnetting Lab

[![Electron](https://img.shields.io/badge/Electron-Desktop%20App-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![JavaScript](https://img.shields.io/badge/ES6+-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![CCNA Ready](https://img.shields.io/badge/CCNA-200--301%20Ready-00D4FF)](https://www.cisco.com/)
[![License](https://img.shields.io/badge/License-MIT-00FF88)](LICENSE)

**NetGame** is a gamified, cyberpunk-styled Cisco network simulation and CCNA training platform built with Electron and vanilla JavaScript/HTML5 Canvas. It features real-time packet animation, dynamic topology building, an authentic Cisco IOS CLI terminal, interactive Level Campaigns (Levels 1–13), and a comprehensive **Dual-Stack IPv4 (VLSM) & IPv6 Subnetting Practice Center**.

---

## ✨ Key Features

### 1. ⚡ Dual-Stack Subnetting & VLSM Practice Center
- **Variable Length Subnet Masking (VLSM)**:
  - Optimal hierarchical subnet allocation sorted descending by host requirements.
  - Step-by-step mathematical derivation guides and visual proportional address space partition bars.
  - Curated CCNA scenarios across 4 tiers + Procedural random scenario generator.
  - Per-cell live grading and instant Cisco IOS CLI export.
- **IPv6 Subnetting & Addressing Lab**:
  - RFC 5952 compliant IPv6 address compression and full 32-hex-digit expansion.
  - EUI-64 Interface ID calculator from 48-bit MAC addresses with bit 7 inversion explanations.
  - IPv6 `/64` hierarchical subnet carving from `/48` and `/56` enterprise prefixes.
  - Scope and address type classification (GUA, LLA, ULA, Multicast, Loopback).
- **Speed Drills & Flash Quizzes**:
  - Fast-paced quizzes for contiguous subnets, capacity calculations, overlap detection, compression drills, and address type recognition with streak tracking.
- **Subnet Calculator & Inspector**:
  - Instant subnet parsing, wildcard masks, usable ranges, and broadcast calculations for both IPv4 and IPv6.

### 2. 🖥️ Authentic Cisco IOS CLI Terminal
- Standard Cisco IOS operational and configuration modes:
  - `enable` / `configure terminal` / `interface <name>`
  - `ip address <ip> <mask>`
  - `ipv6 unicast-routing` / `ipv6 address <ipv6>/<prefix>` / `ipv6 address <ipv6> eui-64` / `ipv6 address fe80::x link-local`
  - `ip route <net> <mask> <next-hop>` / `no ip route ...`
  - `show ip route` / `show ipv6 route` / `show ip interface brief` / `show ipv6 interface brief`
  - `show running-config` / `show mac address-table` / `show vlan brief`
  - `ping <ipv4-or-ipv6>` and `traceroute <ip>`
  - Auto-MDIX control (`mdix auto` / `no mdix auto`), port speed, duplex, and shutdown states.

### 3. 🎮 Interactive CCNA Level Campaign (Levels 1–13)
- **Level 1**: Basic Host-to-Host Connectivity & Cross-over Cable Validation.
- **Level 2**: Star Topology with Ethernet Switches & Hubs.
- **Level 3**: Default Gateways & Router Interface Configuration.
- **Level 4**: Static Routing & Next-Hop Verification.
- **Level 5**: VLAN Segmentation & 802.1Q Trunks.
- **Level 6**: Router-on-a-Stick (ROAS) Inter-VLAN Routing.
- **Level 7**: DHCP Server Configuration & Dynamic Pool Allocation.
- **Level 8**: Access Control Lists (Standard & Extended ACLs).
- **Level 9**: RIPv2 Dynamic Routing & Convergence.
- **Level 10**: IPv6 Global Unicast Addressing & ICMPv6 Ping.
- **Level 11**: Variable Length Subnet Masking (VLSM) Enterprise Network Design.
- **Level 12**: Single-Area OSPFv2 Dynamic Routing.
- **Level 13**: Enterprise Multi-Branch Campus Integration.

### 4. 🛠️ Sandbox & Topology Builder
- Drag-and-drop hardware modeling: Routers, Switches, Layer 3 Switches, PCs, Servers, Access Points, Wireless Routers, Firewalls, Hubs, Repeaters, Bridges, and Modems.
- Cable types: Copper Straight-Through, Copper Cross-Over, Fiber, Serial, Coaxial, and Auto-MDIX negotiation.
- Real-time packet inspection (L2 Ethernet II, L3 IPv4/IPv6, L4 ICMP/TCP/UDP) with hop-by-hop packet flight animations.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Kurljan/NetGame.git

# Navigate into the project folder
cd NetGame

# Install Electron dependencies
npm install
```

### Running the Application
```bash
npm start
```

---

## 📂 Project Architecture

```
NetGame/
├── electron-main.js          # Electron main process
├── preload.js                # Secure preload script for desktop controls
├── index.html                # Main application HTML & screen structure
├── package.json              # App manifest & scripts
├── styles/
│   ├── main.css              # Cyberpunk UI, theme variables, modals, tables
│   └── hud.css               # Canvas HUD, status indicators & toolbars
└── src/
    ├── main.js               # Application bootstrap & screen router
    ├── engine/               # HTML5 canvas renderer, event bus, input handler
    ├── levels/               # CCNA levels data & JSON definitions (Levels 1-13)
    ├── network/              # Device models, Interface, Link, Packet, Simulator
    ├── routing/              # RoutingTable, StaticRoute, RIP, OSPF engines
    ├── subnetting/           # VLSMCalculator, IPv6Calculator, Exercises & Validator
    └── ui/                   # Terminal, DevicePanel, SubnetPracticeUI, Minimap, HUD
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
