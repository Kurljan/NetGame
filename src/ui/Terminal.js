// src/ui/Terminal.js
// In-game Cisco IOS-style CLI terminal.
// Supports a subset of IOS commands and maps them to simulator actions.

import { eventBus } from '../engine/EventBus.js';
import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';
import { IPv6Calculator } from '../subnetting/IPv6Calculator.js';
import { addStaticRoute } from '../routing/StaticRoute.js';

const HELP = `
Available Commands:
  enable / en                          Enter privileged mode
  configure terminal / conf t          Enter global config mode
  interface <name> / int <name>        Enter interface config mode
  ip address <ip> <mask>               Set interface IPv4
  ipv6 address <ipv6>/<prefix>         Set interface IPv6 GUA / Subnet
  ipv6 address <ipv6> eui-64           Set interface IPv6 using EUI-64
  ipv6 address <fe80::x> link-local    Set interface IPv6 Link-Local
  ipv6 unicast-routing                 Enable global IPv6 routing
  no shutdown / no shut                Bring interface up
  shutdown                             Shut down interface
  exit / end                           Exit config mode
  ip route <net> <mask> <next-hop>     Add static IPv4 route
  show ip route / sh ip ro             Show IPv4 routing table
  show ipv6 route / sh ipv6 ro         Show IPv6 routing table
  show ip interface brief / sh ip int br  Show IPv4 interfaces
  show ipv6 interface brief            Show IPv6 interfaces & LLA
  show mac address-table               Show switch MAC table
  show vlan brief                      Show VLAN table
  show running-config / sh run         Show device config
  ping <ipv4-or-ipv6>                  Send ICMP / ICMPv6 ping
  traceroute <ip>                      Trace packet path
  clear                                Clear terminal output
  help / ?                             Show this help
`.trim();

export class Terminal {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   */
  constructor(sim) {
    this.sim    = sim;
    this.device = null;

    this._history  = [];
    this._histIdx  = -1;
    this._mode     = 'user';     // 'user' | 'enable' | 'config' | 'iface'
    this._ifaceName= '';

    this._outputEl  = document.getElementById('terminal-output');
    this._inputEl   = document.getElementById('terminal-input');
    this._promptEl  = document.getElementById('term-prompt');
    this._labelEl   = document.getElementById('term-device-label');

    this._bindEvents();
  }

  // ──────────────────────────────────────────────────────────
  //  Events
  // ──────────────────────────────────────────────────────────
  _bindEvents() {
    this._inputEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = this._inputEl.value.trim();
        this._inputEl.value = '';
        if (cmd) {
          this._history.unshift(cmd);
          this._histIdx = -1;
          this._run(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this._histIdx < this._history.length - 1) {
          this._histIdx++;
          this._inputEl.value = this._history[this._histIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._histIdx = Math.max(-1, this._histIdx - 1);
        this._inputEl.value = this._histIdx >= 0 ? this._history[this._histIdx] : '';
      }
    });

    document.getElementById('term-clear-btn')?.addEventListener('click', () => this._clearOutput());

    eventBus.on('device:select', device => {
      this.device = device;
      this._mode  = 'user';
      this._updatePrompt();
      if (this._labelEl) this._labelEl.textContent = `${device.type.toUpperCase()} — ${device.hostname}`;
    });

    eventBus.on('device:deselect', () => {
      this.device = null;
      this._mode  = 'user';
      this._updatePrompt();
      if (this._labelEl) this._labelEl.textContent = 'No device selected';
    });

    eventBus.on('terminal:insertCommand', (cmdText) => {
      if (!this._inputEl) return;
      this._inputEl.value = cmdText;
      this._inputEl.focus();
      if (cmdText.includes('<') && cmdText.includes('>')) {
        const start = cmdText.indexOf('<');
        const end = cmdText.indexOf('>') + 1;
        this._inputEl.setSelectionRange(start, end);
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Command runner
  // ──────────────────────────────────────────────────────────
  _run(raw) {
    this._print(this._promptText() + raw, 'cmd');

    if (!this.device) {
      this._print('% Select a device first (click on it in the topology).', 'err');
      return;
    }

    const cmd   = raw.trim().toLowerCase();
    const parts = raw.trim().split(/\s+/);
    const p0    = parts[0]?.toLowerCase();
    const p1    = parts[1]?.toLowerCase();

    // ── clear ──────────────────────────────────────────────
    if (cmd === 'clear') { this._clearOutput(); return; }

    // ── help / ? ───────────────────────────────────────────
    if (cmd === 'help' || cmd === '?') { this._print(HELP, 'out'); return; }

    // ── ping ───────────────────────────────────────────────
    if (p0 === 'ping') {
      const ip = parts[1];
      if (!ip || (!SC.isValidIp(ip) && !IPv6Calculator.isValidIPv6(ip))) {
        this._print('% Usage: ping <ipv4-or-ipv6-address>', 'err');
        return;
      }
      this._doPing(ip);
      return;
    }

    // ── traceroute ─────────────────────────────────────────
    if (p0 === 'traceroute') {
      const ip = parts[1];
      if (!ip || (!SC.isValidIp(ip) && !IPv6Calculator.isValidIPv6(ip))) {
        this._print('% Usage: traceroute <ip>', 'err');
        return;
      }
      this._doTraceroute(ip);
      return;
    }

    // ── show commands ──────────────────────────────────────
    if (p0 === 'show' || p0 === 'sh') {
      this._doShow(parts.slice(1).map(s => s.toLowerCase()));
      return;
    }

    // ── enable ─────────────────────────────────────────────
    if (cmd === 'enable' || cmd === 'en') {
      this._mode = 'enable';
      this._print(`${this.device.hostname}#`, 'out');
      this._updatePrompt();
      return;
    }

    // ── configure terminal ─────────────────────────────────
    if ((p0 === 'configure' && p1 === 'terminal') || cmd === 'conf t') {
      if (this._mode !== 'enable') { this._print('% Enter enable mode first.', 'err'); return; }
      this._mode = 'config';
      this._print(`Enter configuration commands, one per line. End with CNTL/Z.`, 'out');
      this._updatePrompt();
      return;
    }

    // ── copy running-config startup-config ─────────────────
    if (cmd === 'copy running-config startup-config' || cmd === 'copy run start') {
      if (this._mode !== 'enable') { this._print('% Must be in privileged mode.', 'err'); return; }
      this.device.startupConfig = this.device.toJSON();
      this._print(`Building configuration...\n[OK]`, 'ok');
      return;
    }

    // ── router ospf <id> ───────────────────────────────────
    if (p0 === 'router' && p1 === 'ospf' && parts[2]) {
      if (this._mode !== 'config') { this._print('% Must be in config mode.', 'err'); return; }
      const id = parseInt(parts[2], 10);
      if (!this.device.config) this.device.config = {};
      if (!this.device.config.ospf) this.device.config.ospf = { processId: id, networks: [] };
      this._mode = 'config-router';
      this._curOspf = id;
      this._updatePrompt();
      return;
    }

    // ── network <ip> <wildcard> area <id> ──────────────────
    if (p0 === 'network' && this._mode === 'config-router' && parts.length >= 5) {
      if (parts[3] !== 'area') return;
      const net = parts[1];
      const wildcard = parts[2];
      const area = parts[4];
      this.device.config.ospf.networks.push({ network: net, wildcard, area });
      this._print(`  Added OSPF network ${net} ${wildcard} to area ${area}`, 'ok');
      return;
    }

    // ── ipv6 unicast-routing ───────────────────────────────
    if (p0 === 'ipv6' && p1 === 'unicast-routing') {
      if (this._mode !== 'config') { this._print('% Must be in config mode.', 'err'); return; }
      if (!this.device.config) this.device.config = {};
      this.device.config.ipv6UnicastRouting = true;
      this._print(`  IPv6 unicast routing globally enabled`, 'ok');
      return;
    }

    // ── interface ──────────────────────────────────────────
    if ((p0 === 'interface' || p0 === 'int') && parts[1]) {
      if (this._mode !== 'config') { this._print('% Must be in config mode.', 'err'); return; }
      const name = parts.slice(1).join(' ');
      const iface = this._findIface(name);
      if (!iface) { this._print(`% Interface "${name}" not found.`, 'err'); return; }
      this._ifaceName = iface.name;
      this._mode      = 'iface';
      this._updatePrompt();
      this._print(`  Configuring ${iface.name}`, 'out');
      return;
    }

    // ── ipv6 address ───────────────────────────────────────
    if (p0 === 'ipv6' && p1 === 'address' && parts.length >= 3) {
      if (this._mode !== 'iface') { this._print('% Must be in interface config mode.', 'err'); return; }
      const iface = this._findIface(this._ifaceName);
      if (!iface) return;

      const rawAddr = parts[2];
      const isEui64 = parts.includes('eui-64');
      const isLinkLocal = parts.includes('link-local');

      if (isLinkLocal) {
        if (!IPv6Calculator.isValidIPv6(rawAddr)) { this._print(`% Invalid IPv6 link-local address: ${rawAddr}`, 'err'); return; }
        iface.ipv6LinkLocal = IPv6Calculator.compress(rawAddr);
        this._print(`  Interface ${this._ifaceName}: IPv6 link-local set to ${iface.ipv6LinkLocal}`, 'ok');
      } else if (isEui64) {
        try {
          const eui = IPv6Calculator.generateEUI64(iface.macAddress, rawAddr);
          iface.ipv6Address = eui.fullAddress;
          iface.ipv6Prefix = 64;
          this._print(`  Interface ${this._ifaceName}: IPv6 EUI-64 configured as ${iface.ipv6Address}/64`, 'ok');
        } catch (e) {
          this._print(`% EUI-64 error: ${e.message}`, 'err');
          return;
        }
      } else {
        if (rawAddr.includes('/')) {
          const [addr, pfx] = rawAddr.split('/');
          if (!IPv6Calculator.isValidIPv6(addr)) { this._print(`% Invalid IPv6 address: ${addr}`, 'err'); return; }
          iface.ipv6Address = IPv6Calculator.compress(addr.trim());
          iface.ipv6Prefix = parseInt(pfx.trim(), 10) || 64;
        } else {
          if (!IPv6Calculator.isValidIPv6(rawAddr)) { this._print(`% Invalid IPv6 address: ${rawAddr}`, 'err'); return; }
          iface.ipv6Address = IPv6Calculator.compress(rawAddr.trim());
          iface.ipv6Prefix = 64;
        }
        this._print(`  Interface ${this._ifaceName}: IPv6 address set to ${iface.ipv6Address}/${iface.ipv6Prefix}`, 'ok');
      }

      if (this.device.ipv6RoutingTable) this.sim.updateConnectedRoutesIPv6(this.device);

      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── ip address ─────────────────────────────────────────
    if (p0 === 'ip' && p1 === 'address' && parts.length >= 4) {
      if (this._mode !== 'iface') { this._print('% Must be in interface config mode.', 'err'); return; }
      const ip   = parts[2];
      const mask = parts[3];
      if (!SC.isValidIp(ip))   { this._print(`% Invalid IP: ${ip}`, 'err'); return; }
      if (!SC.isValidMask(mask)){ this._print(`% Invalid mask: ${mask}`, 'err'); return; }
      const iface = this._findIface(this._ifaceName);
      if (iface) { iface.ipAddress = ip; iface.subnetMask = mask; }
      if (this.device.routingTable) this.sim.updateConnectedRoutes(this.device);
      this._print(`  Interface ${this._ifaceName}: IP set to ${ip} ${mask}`, 'ok');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── no shutdown ────────────────────────────────────────
    if (cmd === 'no shutdown' || cmd === 'no shut') {
      if (this._mode !== 'iface') { this._print('% Must be in interface config mode.', 'err'); return; }
      const iface = this._findIface(this._ifaceName);
      if (iface) { iface.status = 'up'; }
      this._print(`  %LINK-5-CHANGED: Interface ${this._ifaceName}, changed state to up`, 'ok');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── shutdown ───────────────────────────────────────────
    if (cmd === 'shutdown') {
      if (this._mode !== 'iface') { this._print('% Must be in interface config mode.', 'err'); return; }
      const iface = this._findIface(this._ifaceName);
      if (iface) { iface.status = 'down'; }
      this._print(`  %LINK-5-CHANGED: Interface ${this._ifaceName}, changed state to administratively down`, 'warn');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── mdix auto / no mdix auto ───────────────────────────
    if (this._mode === 'iface' && (cmd === 'mdix auto' || cmd === 'no mdix auto')) {
      const iface = this.device.interfaces.find(i => i.name === this._ifaceName || i.shortName === this._ifaceName);
      if (iface) {
        iface.autoMdix = cmd === 'mdix auto';
        this._print(`  Auto-MDIX ${iface.autoMdix ? 'enabled' : 'disabled'} on interface ${this._ifaceName}`, 'ok');
        eventBus.emit('panel:showDevice', this.device);
        eventBus.emit('topology:changed');
      }
      return;
    }

    // ── speed / duplex / clock rate ─────────────────────────
    if (this._mode === 'iface' && (p0 === 'speed' || p0 === 'duplex' || (p0 === 'clock' && p1 === 'rate'))) {
      const iface = this.device.interfaces.find(i => i.name === this._ifaceName || i.shortName === this._ifaceName);
      if (iface) {
        if (p0 === 'speed')  iface.speed = parts[1] || 'auto';
        if (p0 === 'duplex') iface.duplex = parts[1] || 'auto';
        this._print(`  Configured ${p0} on interface ${this._ifaceName}`, 'ok');
        eventBus.emit('panel:showDevice', this.device);
        eventBus.emit('topology:changed');
      }
      return;
    }

    // ── ip route ───────────────────────────────────────────
    if (p0 === 'ip' && p1 === 'route' && parts.length >= 5) {
      if (!this.device.routingTable) { this._print('% Not a router.', 'err'); return; }
      const [,, net, mask, nh] = parts;
      const result = addStaticRoute(this.device.routingTable, net, mask, nh);
      if (!result.success) { this._print(`% ${result.error}`, 'err'); return; }
      this._print(`  Static route added: ${net}/${SC.maskToCidr(mask)} via ${nh}`, 'ok');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── no ip route ────────────────────────────────────────
    if (p0 === 'no' && p1 === 'ip' && parts[2]?.toLowerCase() === 'route' && parts.length >= 5) {
      if (!this.device.routingTable) { this._print('% Not a router.', 'err'); return; }
      const [,,, net, mask] = parts;
      this.device.routingTable.removeRoute(net, mask);
      this._print(`  Route removed: ${net}`, 'ok');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── ipv6 route ─────────────────────────────────────────
    if (p0 === 'ipv6' && p1 === 'route' && parts.length >= 4) {
      if (!this.device.ipv6RoutingTable) { this._print('% Not a router or IPv6 routing not enabled.', 'err'); return; }
      const rawPrefix = parts[2]; // e.g. 2001:db8::/64
      const nh = parts[3];
      if (!rawPrefix.includes('/')) { this._print(`% Usage: ipv6 route <prefix>/<len> <next-hop>`, 'err'); return; }
      const [net, maskStr] = rawPrefix.split('/');
      const mask = parseInt(maskStr, 10);
      if (!IPv6Calculator.isValidIPv6(net) || isNaN(mask)) { this._print(`% Invalid prefix: ${rawPrefix}`, 'err'); return; }
      if (!IPv6Calculator.isValidIPv6(nh)) { this._print(`% Invalid next-hop: ${nh}`, 'err'); return; }
      
      this.device.ipv6RoutingTable.addStatic(net, mask, IPv6Calculator.compress(nh));
      this._print(`  IPv6 static route added: ${IPv6Calculator.compress(net)}/${mask} via ${IPv6Calculator.compress(nh)}`, 'ok');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── no ipv6 route ──────────────────────────────────────
    if (p0 === 'no' && p1 === 'ipv6' && parts[2]?.toLowerCase() === 'route' && parts.length >= 4) {
      if (!this.device.ipv6RoutingTable) { this._print('% Not a router.', 'err'); return; }
      const rawPrefix = parts[3];
      if (!rawPrefix.includes('/')) { this._print(`% Usage: no ipv6 route <prefix>/<len>`, 'err'); return; }
      const [net, maskStr] = rawPrefix.split('/');
      const mask = parseInt(maskStr, 10);
      if (!IPv6Calculator.isValidIPv6(net) || isNaN(mask)) { this._print(`% Invalid prefix: ${rawPrefix}`, 'err'); return; }
      
      this.device.ipv6RoutingTable.removeRoute(net, mask);
      this._print(`  IPv6 route removed: ${IPv6Calculator.compress(net)}/${mask}`, 'ok');
      eventBus.emit('panel:showDevice', this.device);
      eventBus.emit('topology:changed');
      return;
    }

    // ── hostname ───────────────────────────────────────────
    if (p0 === 'hostname' && parts[1]) {
      if (this._mode !== 'config') { this._print('% Must be in config mode.', 'err'); return; }
      this.device.hostname = parts[1];
      this._updatePrompt();
      const hostInput = document.getElementById('panel-hostname');
      if (hostInput) hostInput.value = parts[1];
      if (this._labelEl) this._labelEl.textContent = `${this.device.type.toUpperCase()} — ${this.device.hostname}`;
      eventBus.emit('canvas:markDirty');
      eventBus.emit('topology:changed');
      this._print(`  Hostname set to "${parts[1]}"`, 'ok');
      return;
    }

    // ── vlan <id> ───────────────────────────────────────────
    if (p0 === 'vlan' && parts[1] && !isNaN(parts[1])) {
      if (this._mode !== 'config') { this._print('% Must be in config mode.', 'err'); return; }
      if (!this.device.vlans) { this.device.vlans = [{ id: 1, name: 'default' }]; }
      const vid = parseInt(parts[1], 10);
      let v = this.device.vlans.find(x => x.id === vid);
      if (!v) {
        v = { id: vid, name: `VLAN${vid}` };
        this.device.vlans.push(v);
        this.device.vlans.sort((a, b) => a.id - b.id);
        this._print(`  Created VLAN ${vid}`, 'ok');
      }
      this._mode = 'config-vlan';
      this._curVlanId = vid;
      this._updatePrompt();
      eventBus.emit('panel:showDevice', this.device);
      return;
    }

    // ── name <vlan_name> ────────────────────────────────────
    if (p0 === 'name' && parts[1] && this._mode === 'config-vlan') {
      const v = this.device.vlans?.find(x => x.id === this._curVlanId);
      if (v) {
        v.name = parts.slice(1).join(' ');
        this._print(`  VLAN ${this._curVlanId} renamed to "${v.name}"`, 'ok');
        eventBus.emit('panel:showDevice', this.device);
      }
      return;
    }

    // ── switchport mode / access ───────────────────────────
    if (p0 === 'switchport' && this._mode === 'iface') {
      const iface = this._findIface(this._ifaceName);
      if (iface) {
        if (p1 === 'mode' && parts[2]?.toLowerCase() === 'trunk') {
          iface.trunkMode = true;
          this._print(`  Interface ${this._ifaceName} set to 802.1Q TRUNK mode`, 'ok');
        } else if (p1 === 'mode' && parts[2]?.toLowerCase() === 'access') {
          iface.trunkMode = false;
          this._print(`  Interface ${this._ifaceName} set to ACCESS mode`, 'ok');
        } else if (p1 === 'access' && parts[2]?.toLowerCase() === 'vlan' && parts[3]) {
          iface.vlanId = parseInt(parts[3], 10);
          this._print(`  Interface ${this._ifaceName} assigned to VLAN ${iface.vlanId}`, 'ok');
        }
        eventBus.emit('panel:showDevice', this.device);
        eventBus.emit('topology:changed');
      }
      return;
    }

    // ── ipconfig (PC / Server) ─────────────────────────────
    if (p0 === 'ipconfig') {
      this._showIpConfig(parts[1] === '/all');
      return;
    }

    // ── arp -a ─────────────────────────────────────────────
    if (cmd === 'arp -a' || cmd === 'arp') {
      this._showArpTable();
      return;
    }

    // ── exit / end ─────────────────────────────────────────
    if (cmd === 'exit' || cmd === 'end') {
      if (this._mode === 'iface' || this._mode === 'config-vlan' || this._mode === 'config-router')  { this._mode = 'config'; this._ifaceName = ''; this._curOspf = null; }
      else if (this._mode === 'config') this._mode = 'enable';
      else if (this._mode === 'enable') this._mode = 'user';
      this._updatePrompt();
      return;
    }

    // ── unknown ────────────────────────────────────────────
    this._print(`% Unrecognized command: "${parts[0]}". Type "help" or click 📖 Device Guide for a list.`, 'err');
  }

  // ──────────────────────────────────────────────────────────
  //  Show commands
  // ──────────────────────────────────────────────────────────
  _doShow(args) {
    const a = args.join(' ');

    // show version
    if (a === 'version' || a === 'ver') {
      this._showVersion();
      return;
    }

    // show arp / show ip arp
    if (a === 'arp' || a === 'ip arp') {
      this._showArpTable();
      return;
    }

    // show interfaces
    if (a.startsWith('interfaces') || a.startsWith('int') && !a.startsWith('int br') && !a.startsWith('interface br')) {
      this._showInterfaces();
      return;
    }

    // show ip route
    if (a === 'ip route' || a === 'ip ro' || a === 'ip r') {
      if (!this.device.routingTable) { this._print('% Not a router.', 'err'); return; }
      this._print(this.device.routingTable.showIpRoute(), 'out');
      return;
    }

    // show ip interface brief
    if (a.startsWith('ip interface') || a.startsWith('ip int')) {
      this._showIpIntBrief();
      return;
    }

    // show ipv6 interface brief
    if (a.startsWith('ipv6 interface') || a.startsWith('ipv6 int')) {
      this._showIpv6IntBrief();
      return;
    }

    // show ipv6 route
    if (a === 'ipv6 route' || a === 'ipv6 ro' || a === 'ipv6 r') {
      if (!this.device.ipv6RoutingTable) { this._print('% Not a router or IPv6 routing not enabled.', 'err'); return; }
      this._print(this.device.ipv6RoutingTable.showIpv6Route(), 'out');
      return;
    }

    // show running-config
    if (a.startsWith('running') || a === 'run') {
      this._showRunningConfig();
      return;
    }

    // show mac address-table
    if (a.startsWith('mac')) {
      if (!this.device.macTable) { this._print('% Not a switch.', 'err'); return; }
      if (this.device.macTable.size === 0) { this._print('Mac Address Table is empty.', 'out'); return; }
      this._print('Vlan  Mac Address        Type    Ports', 'out');
      this._print('----  -----------------  ------  -----', 'out');
      for (const [mac, port] of this.device.macTable) {
        this._print(`1     ${mac}  DYNAMIC  ${port}`, 'out');
      }
      return;
    }

    // show vlan brief
    if (a.startsWith('vlan')) {
      if (!this.device.vlans) { this._print('% Not a switch.', 'err'); return; }
      this._print('VLAN  Name                Status    Ports', 'out');
      this._print('----  ------------------  --------  -----', 'out');
      for (const v of this.device.vlans) {
        const ports = this.device.interfaces.filter(i => i.vlanId === v.id && !i.trunkMode).map(i => i.shortName).join(', ');
        this._print(`${String(v.id).padEnd(6)}${v.name.padEnd(20)}active    ${ports}`, 'out');
      }
      return;
    }

    // show cdp neighbors
    if (a === 'cdp neighbors' || a === 'cdp nei') {
      this._showCdpNeighbors();
      return;
    }

    this._print(`% Unknown show command: "show ${a}". Type "help" or click 📖 Device Guide for a list.`, 'err');
  }

  _showCdpNeighbors() {
    this._print('Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge', 'out');
    this._print('                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone,', 'out');
    this._print('                  D - Remote, C - CVTA, M - Two-port Mac Relay\n', 'out');
    this._print('Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID', 'out');
    
    const links = this.sim.linksOf(this.device.id);
    for (const link of links) {
      const neighborId = link.other(this.device.id);
      const neighbor = this.sim.devices.get(neighborId);
      if (!neighbor) continue;

      const isSrc = link.sourceDeviceId === this.device.id;
      const localIf = isSrc ? link.sourceInterface : link.destInterface;
      const remoteIf = isSrc ? link.destInterface : link.sourceInterface;

      const locShort = this.device.interfaces.find(i => i.name === localIf || i.shortName === localIf)?.shortName || localIf;
      const remShort = neighbor.interfaces.find(i => i.name === remoteIf || i.shortName === remoteIf)?.shortName || remoteIf;

      let cap = 'H';
      if (neighbor.type === 'switch' || neighbor.type === 'l3switch') cap = 'S';
      else if (neighbor.type === 'router') cap = 'R';
      else if (neighbor.type === 'ap' || neighbor.type === 'wirelessrouter') cap = 'T';

      const devIdStr = neighbor.hostname.padEnd(16).substring(0, 16);
      const locIfStr = locShort.padEnd(17).substring(0, 17);
      const holdStr = '163'.padEnd(11);
      const capStr = cap.padEnd(12);
      const platStr = (neighbor.model || neighbor.type).padEnd(10).substring(0, 10);

      this._print(`${devIdStr} ${locIfStr} ${holdStr} ${capStr} ${platStr} ${remShort}`, 'out');
    }
  }

  _showVersion() {
    const lines = [
      `Cisco IOS Software, NetGame CCNA Simulator Engine, Version 15.7(3)M2`,
      `Technical Support: NetGame CCNA Education Portal`,
      `Device Model: ${this.device.model || this.device.type.toUpperCase()}`,
      `System Uptime: 4 hours, 28 minutes`,
      `Hardware: Processor running at 1.2 GHz, 512MB RAM, 256MB Flash`,
      `Total Interfaces: ${this.device.interfaces.length}`,
      `Configuration register is 0x2102`,
    ];
    this._print(lines.join('\n'), 'out');
  }

  _showInterfaces() {
    for (const iface of this.device.interfaces) {
      const status = iface.status === 'up' ? 'up' : 'administratively down';
      const proto = iface.status === 'up' ? 'up' : 'down';
      const lines = [
        `${iface.name} is ${status}, line protocol is ${proto}`,
        `  Hardware is Built-in RJ45, address is 0050.7966.${iface.shortName.replace(/[^0-9]/g,'').padStart(4,'0')}`,
        iface.ipAddress ? `  Internet address is ${iface.ipAddress}/${SC.maskToCidr(iface.subnetMask || '255.255.255.0')}` : '  Internet protocol processing disabled',
        `  MTU 1500 bytes, BW ${iface.speed || 1000}000 Kbit/sec, DLY 10 usec`,
        `  Encapsulation ARPA, loopback not set`,
        `  Full-duplex, ${iface.speed || '1000'}Mb/s, media type is copper`,
      ];
      this._print(lines.join('\n'), 'out');
    }
  }

  _showArpTable() {
    const lines = [
      `Protocol  Address          Age (min)  Hardware Addr   Type   Interface`,
      `----------------------------------------------------------------------`,
    ];
    for (const iface of this.device.interfaces) {
      if (iface.ipAddress && iface.status === 'up') {
        lines.push(`Internet  ${iface.ipAddress.padEnd(17)}-          0050.7966.6801  ARPA   ${iface.shortName}`);
      }
    }
    this._print(lines.join('\n'), 'out');
  }

  _showIpConfig(all = false) {
    const lines = [
      `Windows IP Configuration / Host Adapter Settings`,
      ``,
    ];
    for (const iface of this.device.interfaces) {
      lines.push(`Ethernet adapter ${iface.name}:`);
      if (all) {
        lines.push(`   Physical Address. . . . . . . . . : 0050.7966.${iface.shortName.replace(/[^0-9]/g,'').padStart(4,'0')}`);
        lines.push(`   DHCP Enabled. . . . . . . . . . . : ${this.device.dhcpEnabled ? 'Yes' : 'No'}`);
      }
      lines.push(`   IPv4 Address. . . . . . . . . . . : ${iface.ipAddress || '0.0.0.0'}`);
      lines.push(`   Subnet Mask . . . . . . . . . . . : ${iface.subnetMask || '0.0.0.0'}`);
      lines.push(`   Default Gateway . . . . . . . . . : ${this.device.defaultGateway || '0.0.0.0'}`);
      if (all && this.device.dnsServer) {
        lines.push(`   DNS Servers . . . . . . . . . . . : ${this.device.dnsServer}`);
      }
      lines.push(``);
    }
    this._print(lines.join('\n'), 'out');
  }

  _showIpIntBrief() {
    const lines = [
      `Interface              IP-Address       Status   Protocol`,
      `------------------------------------------------------------`,
    ];
    for (const iface of this.device.interfaces) {
      const ip     = iface.ipAddress   || 'unassigned';
      const status = iface.status === 'up' ? 'up' : 'down';
      const proto  = iface.status === 'up' && iface.ipAddress ? 'up' : 'down';
      lines.push(`${iface.name.padEnd(23)}${ip.padEnd(17)}${status.padEnd(9)}${proto}`);
    }
    this._print(lines.join('\n'), 'out');
  }

  _showIpv6IntBrief() {
    const lines = [
      `IPv6 Interface Status and Configuration:`,
      `Interface              IPv6-Address[Prefix]                    Status   Protocol`,
      `--------------------------------------------------------------------------------`,
    ];
    for (const iface of this.device.interfaces) {
      const v6 = iface.ipv6Address ? `${iface.ipv6Address}/${iface.ipv6Prefix || 64}` : '[unassigned]';
      const status = iface.status === 'up' ? 'up' : 'down';
      const proto  = iface.status === 'up' ? 'up' : 'down';
      lines.push(`${iface.name.padEnd(23)}${v6.padEnd(40)}${status.padEnd(9)}${proto}`);
      if (iface.ipv6LinkLocal) {
        lines.push(`  └─ Link-Local: ${iface.ipv6LinkLocal}`);
      }
    }
    this._print(lines.join('\n'), 'out');
  }

  _showIpv6Route() {
    if (!this.device.routingTable) { this._print('% Not a router.', 'err'); return; }
    const lines = [
      `IPv6 Routing Table - ${this.device.hostname}`,
      `Codes: C - Connected, L - Local, S - Static`,
      ``,
    ];
    for (const iface of this.device.interfaces) {
      if (iface.status === 'up' && iface.ipv6Address) {
        const netPrefix = IPv6Calculator.compress(iface.ipv6Address.split(':').slice(0, 4).join(':') + '::');
        lines.push(`C   ${netPrefix}/${iface.ipv6Prefix || 64} [0/0]`);
        lines.push(`     via ${iface.shortName}, directly connected`);
        lines.push(`L   ${iface.ipv6Address}/128 [0/0]`);
        lines.push(`     via ${iface.shortName}, receive`);
      }
    }
    this._print(lines.join('\n'), 'out');
  }

  _showRunningConfig() {
    const lines = [
      `! ${this.device.hostname} Running Configuration`,
      `!`,
      `hostname ${this.device.hostname}`,
      `!`,
    ];
    for (const iface of this.device.interfaces) {
      lines.push(`interface ${iface.name}`);
      if (iface.description) lines.push(` description ${iface.description}`);
      if (iface.ipAddress)   lines.push(` ip address ${iface.ipAddress} ${iface.subnetMask}`);
      if (iface.status === 'down') lines.push(` shutdown`);
      lines.push('!');
    }
    if (this.device.routingTable) {
      for (const r of this.device.routingTable.routes) {
        if (r.type === 'S') {
          lines.push(`ip route ${r.network} ${r.mask} ${r.nextHop}`);
        }
      }
    }
    lines.push('end');
    this._print(lines.join('\n'), 'out');
  }

  // ──────────────────────────────────────────────────────────
  //  Ping / Traceroute
  // ──────────────────────────────────────────────────────────
  _doPing(dstIp) {
    this._print(`Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${dstIp}, timeout is 2 seconds:`, 'out');
    const result = this.sim.simulate(this.device.id, dstIp);

    if (result.success) {
      this._print(`!!!!!`, 'ok');
      this._print(`Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`, 'ok');
      eventBus.emit('packet:result', result);
    } else {
      this._print(`.....`, 'err');
      this._print(`Success rate is 0 percent (0/5)`, 'err');
      this._print(`% ${result.error}`, 'err');
      eventBus.emit('packet:result', result);
    }
  }

  _doTraceroute(dstIp) {
    this._print(`Tracing the route to ${dstIp}:`, 'out');
    const result = this.sim.simulate(this.device.id, dstIp);
    if (!result.pathDeviceIds || result.pathDeviceIds.length === 0) {
      this._print(`% ${result.error || 'Unreachable.'}`, 'err');
      return;
    }
    result.pathDeviceIds.forEach((id, i) => {
      const dev = this.sim.devices.get(id);
      const ip  = dev?.interfaces?.find(x => x.status === 'up' && x.ipAddress)?.ipAddress || id;
      this._print(`  ${i + 1}  ${ip}  (${dev?.hostname || id})  ${(i + 1) * 2} ms`, 'out');
    });
    if (result.success) this._print(`Trace complete.`, 'ok');
    else this._print(`% Trace incomplete: ${result.error}`, 'err');
    eventBus.emit('packet:result', result);
  }

  // ──────────────────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────────────────
  _findIface(name) {
    if (!name || !this.device) return null;
    const n = name.toLowerCase();
    return this.device.interfaces.find(i =>
      i.name.toLowerCase() === n ||
      i.shortName.toLowerCase() === n ||
      // abbreviation expansion: g0/0 → GigabitEthernet0/0
      i.name.toLowerCase().replace('gigabitethernet', 'g').replace('fastethernet', 'fa').replace('serial', 's') === n
    );
  }

  _updatePrompt() {
    if (!this._promptEl || !this.device) return;
    const h  = this.device.hostname;
    const prompts = { user: `${h}>`, enable: `${h}#`, config: `${h}(config)#`, iface: `${h}(config-if)#`, 'config-vlan': `${h}(config-vlan)#`, 'config-router': `${h}(config-router)#` };
    const text = prompts[this._mode] || `${h}>`;
    this._promptEl.textContent = text;
    if (this._inputEl) this._inputEl.placeholder = '';
  }

  _promptText() {
    if (!this.device) return '> ';
    const h = this.device.hostname;
    const p = { user: `${h}> `, enable: `${h}# `, config: `${h}(config)# `, iface: `${h}(config-if)# `, 'config-vlan': `${h}(config-vlan)# `, 'config-router': `${h}(config-router)# ` };
    return p[this._mode] || `${h}> `;
  }

  _print(text, cls = 'out') {
    if (!this._outputEl) return;
    text.split('\n').forEach(line => {
      const div = document.createElement('div');
      div.className = `term-line ${cls}`;
      div.textContent = line;
      this._outputEl.appendChild(div);
    });
    this._outputEl.scrollTop = this._outputEl.scrollHeight;
  }

  _clearOutput() {
    if (this._outputEl) this._outputEl.innerHTML = '';
  }

  /** Print a message from the game engine (e.g., packet results) */
  log(text, cls = 'sys') { this._print(text, cls); }
}
