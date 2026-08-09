// src/ui/Terminal.js
// In-game Cisco IOS-style CLI terminal.
// Supports a subset of IOS commands and maps them to simulator actions.

import { eventBus } from '../engine/EventBus.js';
import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';
import { addStaticRoute } from '../routing/StaticRoute.js';

const HELP = `
Available Commands:
  enable / en                          Enter privileged mode
  configure terminal / conf t          Enter global config mode
  interface <name> / int <name>        Enter interface config mode
  ip address <ip> <mask>               Set interface IP
  no shutdown / no shut                Bring interface up
  shutdown                             Shut down interface
  exit / end                           Exit config mode
  ip route <net> <mask> <next-hop>     Add static route
  no ip route <net> <mask>             Remove static route
  show ip route / sh ip ro             Show routing table
  show ip interface brief / sh ip int br  Show interfaces
  show mac address-table               Show switch MAC table
  show vlan brief                      Show VLAN table
  show running-config / sh run         Show device config
  ping <ip>                            Send ICMP ping
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
      if (!ip || !SC.isValidIp(ip)) { this._print('% Usage: ping <ip-address>', 'err'); return; }
      this._doPing(ip);
      return;
    }

    // ── traceroute ─────────────────────────────────────────
    if (p0 === 'traceroute') {
      const ip = parts[1];
      if (!ip || !SC.isValidIp(ip)) { this._print('% Usage: traceroute <ip>', 'err'); return; }
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

    // ── exit / end ─────────────────────────────────────────
    if (cmd === 'exit' || cmd === 'end') {
      if (this._mode === 'iface')  { this._mode = 'config'; this._ifaceName = ''; }
      else if (this._mode === 'config') this._mode = 'enable';
      else if (this._mode === 'enable') this._mode = 'user';
      this._updatePrompt();
      return;
    }

    // ── unknown ────────────────────────────────────────────
    this._print(`% Unrecognized command: "${parts[0]}". Type "help" for a list.`, 'err');
  }

  // ──────────────────────────────────────────────────────────
  //  Show commands
  // ──────────────────────────────────────────────────────────
  _doShow(args) {
    const a = args.join(' ');

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

    this._print(`% Unknown show command: "show ${a}". Type "help" for a list.`, 'err');
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
    const prompts = { user: `${h}>`, enable: `${h}#`, config: `${h}(config)#`, iface: `${h}(config-if)#` };
    const text = prompts[this._mode] || `${h}>`;
    this._promptEl.textContent = text;
    if (this._inputEl) this._inputEl.placeholder = '';
  }

  _promptText() {
    if (!this.device) return '> ';
    const h = this.device.hostname;
    const p = { user: `${h}> `, enable: `${h}# `, config: `${h}(config)# `, iface: `${h}(config-if)# ` };
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
