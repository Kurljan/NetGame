// src/main.js
// Game bootstrap — initializes all systems and wires them together.

import { eventBus }         from './engine/EventBus.js';
import { Canvas }           from './engine/Canvas.js';
import { InputHandler }     from './engine/InputHandler.js';
import { NetworkSimulator } from './network/NetworkSimulator.js';
import { TopologyBuilder }  from './ui/TopologyBuilder.js';
import { DevicePanel }      from './ui/DevicePanel.js';
import { Terminal }         from './ui/Terminal.js';
import { PacketInspector }  from './ui/PacketInspector.js';
import { HUD }              from './ui/HUD.js';
import { LevelManager, LEVELS } from './levels/LevelManager.js';
import { SubnetCalculator as SC } from './subnetting/SubnetCalculator.js';
import { DeviceCommandGuide } from './ui/DeviceCommandGuide.js';
import { SubnetPracticeUI } from './ui/SubnetPracticeUI.js';
import { LevelBriefing }    from './ui/LevelBriefing.js';
import { ObjectiveChecker }  from './ui/ObjectiveChecker.js';

// ──────────────────────────────────────────────────────────────
//  Global game state
// ──────────────────────────────────────────────────────────────
const state = {
  currentScreen: 'menu',
  previousScreen: 'menu',
  currentLevel:  null,
  isSandbox:     false,
};

// ──────────────────────────────────────────────────────────────
//  Initialize core systems
// ──────────────────────────────────────────────────────────────
const sim         = new NetworkSimulator();
const canvasEl    = document.getElementById('topology-canvas');
const canvas      = new Canvas(canvasEl);
const input       = new InputHandler(canvas);
const builder     = new TopologyBuilder(sim, canvas);
const panel       = new DevicePanel(sim);
const terminal    = new Terminal(sim);
const inspector   = new PacketInspector(sim, canvas);
const hud         = new HUD(sim);
const levels      = new LevelManager();
const deviceGuide = new DeviceCommandGuide(sim);
const subnetUI    = new SubnetPracticeUI();
const briefing    = new LevelBriefing();
const checker     = new ObjectiveChecker(sim);

canvas.setData(sim.devices, sim.links);
canvas.startLoop();

// ──────────────────────────────────────────────────────────────
//  Window controls (Electron)
// ──────────────────────────────────────────────────────────────
if (window.electronAPI) {
  document.getElementById('btn-minimize')?.addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click', () => window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',    () => window.electronAPI.close());
} else {
  // Fallback (browser dev mode — hide close button gracefully)
  ['btn-minimize','btn-maximize','btn-close'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0.3';
  });
}

// ──────────────────────────────────────────────────────────────
//  Screen management
// ──────────────────────────────────────────────────────────────
function showScreen(id) {
  if (state.currentScreen !== id) {
    state.previousScreen = state.currentScreen;
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${id}`)?.classList.add('active');
  state.currentScreen = id;

  // Resize canvas when game screen becomes visible
  if (id === 'game') {
    setTimeout(() => {
      canvas._resize();
      canvas.fitToDevices([...sim.devices.values()]);
    }, 50);
  }
}

// ──────────────────────────────────────────────────────────────
//  Main Menu
// ──────────────────────────────────────────────────────────────
document.getElementById('menu-campaign')?.addEventListener('click', () => showScreen('levels'));
document.getElementById('menu-sandbox')?.addEventListener('click',  () => {
  state.isSandbox = true;
  state.currentLevel = null;
  sim.devices.clear();
  sim.links.clear();
  canvas.setData(sim.devices, sim.links);
  canvas.markDirty();
  document.getElementById('hud-level-num').textContent  = 'SANDBOX';
  document.getElementById('hud-level-name').textContent = 'Free Build';
  document.getElementById('hud-objectives').innerHTML   = '<div class="objective-chip">Free mode — no objectives</div>';
  checker.hide();
  document.getElementById('hud-tools-btn').style.display = 'none';
  document.getElementById('hud-tools-menu')?.classList.add('hidden');
  document.getElementById('hint-drawer')?.classList.remove('open');
  showScreen('game');
});
document.getElementById('menu-subnet-practice')?.addEventListener('click', () => {
  subnetUI.renderExerciseView('#vlsm-exercise-container');
  showScreen('subnet-practice');
});
document.getElementById('menu-device-guide')?.addEventListener('click', () => {
  deviceGuide.openForDevice('router');
  showScreen('device-guide');
});
document.getElementById('menu-study')?.addEventListener('click', () => {
  renderStudyGuide();
  showScreen('study');
});

// Quick access buttons during gameplay
function openDeviceGuideFromGame() {
  const devType = panel.device ? panel.device.type : 'router';
  deviceGuide.openForDevice(devType);
  showScreen('device-guide');
}

document.getElementById('hud-guide-btn')?.addEventListener('click', () => {
  openDeviceGuideFromGame();
  document.getElementById('hud-tools-menu')?.classList.add('hidden');
});
document.getElementById('btn-device-guide')?.addEventListener('click', openDeviceGuideFromGame);
document.getElementById('btn-floating-guide')?.addEventListener('click', openDeviceGuideFromGame);

document.getElementById('levels-back')?.addEventListener('click', () => showScreen('menu'));
document.getElementById('study-back')?.addEventListener('click',  () => showScreen('menu'));
document.getElementById('practice-back')?.addEventListener('click', () => {
  showScreen(state.previousScreen === 'game' ? 'game' : 'menu');
});
document.getElementById('guide-back')?.addEventListener('click',  () => {
  showScreen(state.previousScreen === 'game' ? 'game' : 'menu');
});

eventBus.on('screen:menu', () => showScreen('menu'));
eventBus.on('guide:openDevice', (type) => {
  deviceGuide.openForDevice(type || (panel.device ? panel.device.type : 'router'));
  showScreen('device-guide');
});
eventBus.on('guide:close', () => {
  showScreen(state.previousScreen === 'game' ? 'game' : 'menu');
});

// ──────────────────────────────────────────────────────────────
//  Level Select
// ──────────────────────────────────────────────────────────────
levels.renderLevelGrid((levelData) => {
  startLevel(levelData);
});

function startLevel(levelData) {
  state.currentLevel = levelData;
  state.isSandbox    = false;

  // Reset sim
  sim.devices.clear();
  sim.links.clear();

  // Load topology from level JSON
  builder.loadTopology(levelData.topology);

  // Load HUD objectives & hint system
  hud.loadLevel(levelData);

  // Load the objective checker panel
  checker.loadLevel(levelData);

  // Re-show educational buttons (may be hidden by sandbox)
  const toolsBtn = document.getElementById('hud-tools-btn');
  if (toolsBtn) toolsBtn.style.display = '';

  // Show the game screen first, then show the briefing overlay on top
  showScreen('game');
  briefing.show(levelData);
}

// ──────────────────────────────────────────────────────────────
//  HUD: "Back to Menu" button
// ──────────────────────────────────────────────────────────────
document.getElementById('hud-menu-btn')?.addEventListener('click', () => {
  if (confirm('Return to the main menu? Your progress will be lost.')) {
    checker.hide();
    showScreen('menu');
  }
});

// ──────────────────────────────────────────────────────────────
//  Briefing: re-read button
// ──────────────────────────────────────────────────────────────
document.getElementById('hud-briefing-btn')?.addEventListener('click', () => {
  briefing.reshow();
  document.getElementById('hud-tools-menu')?.classList.add('hidden');
});

// ──────────────────────────────────────────────────────────────
//  Objective Checker: open button
// ──────────────────────────────────────────────────────────────
document.getElementById('hud-checker-btn')?.addEventListener('click', () => {
  checker.show();
  document.getElementById('hud-tools-menu')?.classList.add('hidden');
});

// ──────────────────────────────────────────────────────────────
//  Checker ↔ HUD sync: when checker runs, also update HUD chips
// ──────────────────────────────────────────────────────────────
eventBus.on('checker:results', ({ results }) => {
  // Delegate to HUD so chips and score stay in sync
  hud.runObjectiveChecks();
});

// ──────────────────────────────────────────────────────────────
//  Level Complete overlay
// ──────────────────────────────────────────────────────────────
eventBus.on('level:complete', ({ score, time, level }) => {
  levels.markComplete(level.id, score, time);

  document.getElementById('result-icon').textContent   = '🎉';
  document.getElementById('result-title').textContent  = 'Level Complete!';
  document.getElementById('result-msg').textContent    = `You've mastered: ${level.topic}`;
  document.getElementById('res-score').textContent     = score.toLocaleString();
  document.getElementById('res-time').textContent      = hud.formatTime(time);

  document.getElementById('overlay-result')?.classList.remove('hidden');
});

document.getElementById('res-retry')?.addEventListener('click', () => {
  document.getElementById('overlay-result')?.classList.add('hidden');
  if (state.currentLevel) startLevel(state.currentLevel);
});

document.getElementById('res-next')?.addEventListener('click', () => {
  document.getElementById('overlay-result')?.classList.add('hidden');
  const nextId = (state.currentLevel?.id || 0) + 1;
  const next   = LEVELS.find(l => l.id === nextId);
  if (next && levels.isUnlocked(nextId)) {
    startLevel(next);
  } else {
    showScreen('levels');
    levels.renderLevelGrid(startLevel);
  }
});

document.getElementById('res-levels')?.addEventListener('click', () => {
  document.getElementById('overlay-result')?.classList.add('hidden');
  levels.renderLevelGrid(startLevel);
  showScreen('levels');
});

// ──────────────────────────────────────────────────────────────
//  Subnet Calculator & VLSM Hub overlay
// ──────────────────────────────────────────────────────────────
document.getElementById('btn-subnet-calc')?.addEventListener('click', () => {
  subnetUI.renderExerciseView('#modal-vlsm-exercise-container');
  subnetUI.renderDesigner('#modal-vlsm-designer-container');
  subnetUI.startDrills('#modal-vlsm-drills-container');
  document.getElementById('overlay-subnet')?.classList.remove('hidden');
});
document.getElementById('subnet-close')?.addEventListener('click', () => {
  document.getElementById('overlay-subnet')?.classList.add('hidden');
});

// Standard modal calc button & screen calc button
function handleCalcInput(inputId, resultId) {
  const input = document.getElementById(inputId)?.value.trim();
  const result = document.getElementById(resultId);
  if (!input || !result) return;
  try {
    const info = SC.parse(input);
    result.innerHTML = `
      <div class="subnet-field"><div class="subnet-field-label">Network Address</div><div class="subnet-field-value">${info.network}/${info.prefix}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">Subnet Mask</div><div class="subnet-field-value">${info.mask}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">Wildcard Mask</div><div class="subnet-field-value">${info.wildcardMask}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">Broadcast</div><div class="subnet-field-value">${info.broadcast}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">First Host</div><div class="subnet-field-value">${info.firstHost}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">Last Host</div><div class="subnet-field-value">${info.lastHost}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">Usable Hosts</div><div class="subnet-field-value">${info.hostCount.toLocaleString()}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">IP Class</div><div class="subnet-field-value">${info.ipClass}</div></div>
      <div class="subnet-field"><div class="subnet-field-label">Private?</div><div class="subnet-field-value">${info.isPrivate ? 'Yes (RFC 1918)' : 'No (Public)'}</div></div>
    `;
  } catch (e) {
    result.innerHTML = `<div class="pkt-result failure">✗ ${e.message}</div>`;
  }
}

document.getElementById('subnet-calc-btn')?.addEventListener('click', () => handleCalcInput('subnet-input', 'subnet-result'));
document.getElementById('subnet-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleCalcInput('subnet-input', 'subnet-result');
});

document.getElementById('modal-subnet-calc-btn')?.addEventListener('click', () => handleCalcInput('modal-subnet-input', 'modal-subnet-result'));
document.getElementById('modal-subnet-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleCalcInput('modal-subnet-input', 'modal-subnet-result');
});

// ──────────────────────────────────────────────────────────────
//  EventBus: canvas markDirty forwarding
// ──────────────────────────────────────────────────────────────
eventBus.on('canvas:markDirty', () => canvas.markDirty());
eventBus.on('topology:changed', () => {
  canvas.setData(sim.devices, sim.links);
  canvas.markDirty();
  inspector._updateSourceList();
});

// ──────────────────────────────────────────────────────────────
//  Study Guide content
// ──────────────────────────────────────────────────────────────
function renderStudyGuide() {
  const el = document.getElementById('study-content');
  if (!el) return;
  el.innerHTML = STUDY_CARDS.map(card => `
    <div class="study-card">
      <h3>${card.title}</h3>
      ${card.content}
    </div>`).join('');
}

const STUDY_CARDS = [
  {
    title: '📡 OSI Model — 7 Layers',
    content: `<ul>
      <li><strong>L7 Application</strong> — HTTP, DNS, FTP, DHCP</li>
      <li><strong>L6 Presentation</strong> — Encryption, formatting</li>
      <li><strong>L5 Session</strong> — Session management</li>
      <li><strong>L4 Transport</strong> — TCP (reliable), UDP (unreliable)</li>
      <li><strong>L3 Network</strong> — IP addressing, routing</li>
      <li><strong>L2 Data Link</strong> — MAC addressing, VLANs, switching</li>
      <li><strong>L1 Physical</strong> — Cables, signals, bits</li>
    </ul>`,
  },
  {
    title: '🔢 VLSM (Variable Length Subnet Masking) Deep Dive',
    content: `
      <div style="font-size:12px; line-height:1.6;">
        <p><strong>What is VLSM?</strong> Subnetting a subnet. Allows allocating different prefix lengths (/24, /26, /30) from the same parent block to match exact host requirements without wasting IP addresses.</p>
        <h4 style="color:#00d4ff; margin:8px 0 4px;">4-Step VLSM Algorithm:</h4>
        <ol style="padding-left:18px;">
          <li><strong>Step 1: Sort by size descending:</strong> Always allocate the largest department first to avoid fractured overlaps.</li>
          <li><strong>Step 2: Calculate host bits (h):</strong> Use formula <code>2^h - 2 ≥ Hosts Needed</code>.</li>
          <li><strong>Step 3: Determine CIDR prefix:</strong> <code>Prefix = 32 - h</code> (e.g. 50 hosts ➜ h=6 ➜ /26 mask 255.255.255.192).</li>
          <li><strong>Step 4: Align next block:</strong> Next subnet begins at <code>Previous Broadcast + 1</code>.</li>
        </ol>
        <p style="margin-top:6px;"><strong>WAN Point-to-Point Links:</strong> Always use <strong>/30</strong> (2 usable hosts, mask 255.255.255.252).</p>
      </div>
    `,
  },
  {
    title: '🔢 Subnetting Quick Reference',
    content: `<ul>
      <li>/24 = 255.255.255.0 → 254 hosts</li>
      <li>/25 = 255.255.255.128 → 126 hosts</li>
      <li>/26 = 255.255.255.192 → 62 hosts</li>
      <li>/27 = 255.255.255.224 → 30 hosts</li>
      <li>/28 = 255.255.255.240 → 14 hosts</li>
      <li>/30 = 255.255.255.252 → 2 hosts (point-to-point)</li>
    </ul>
    <p style="margin-top:8px">Formula: <code>2^(32-prefix) - 2</code> usable hosts</p>`,
  },
  {
    title: '🏠 RFC 1918 — Private Addresses',
    content: `<ul>
      <li><code>10.0.0.0/8</code> — Class A (16M hosts)</li>
      <li><code>172.16.0.0/12</code> — Class B (1M hosts)</li>
      <li><code>192.168.0.0/16</code> — Class C (65K hosts)</li>
    </ul>
    <p style="margin-top:8px">Private addresses require NAT to reach the Internet.</p>`,
  },
  {
    title: '🔄 Routing Protocols',
    content: `<ul>
      <li><strong>Static</strong> — Manually configured. AD = 1.</li>
      <li><strong>RIP v2</strong> — Distance-vector. Max 15 hops. AD = 120.</li>
      <li><strong>OSPF</strong> — Link-state, Dijkstra SPF. AD = 110.</li>
      <li><strong>EIGRP</strong> — Cisco hybrid. AD = 90.</li>
      <li><strong>BGP</strong> — Internet routing protocol. AD = 20 (eBGP).</li>
    </ul>
    <p style="margin-top:8px">Lower AD = more preferred. Connected routes have AD = 0.</p>`,
  },
  {
    title: '🔀 VLANs & Trunking',
    content: `<ul>
      <li>VLANs logically segment a switch into multiple networks</li>
      <li>Access port: one VLAN, untagged frames</li>
      <li>Trunk port: multiple VLANs, 802.1Q tagged frames</li>
      <li>Native VLAN: untagged traffic on trunk (default VLAN 1)</li>
      <li>Inter-VLAN routing needs a router or L3 switch</li>
    </ul>`,
  },
  {
    title: '🌐 NAT / PAT',
    content: `<ul>
      <li><strong>Static NAT</strong>: 1 private ↔ 1 public IP</li>
      <li><strong>Dynamic NAT</strong>: pool of public IPs</li>
      <li><strong>PAT (NAT Overload)</strong>: many private → 1 public IP (port-based)</li>
      <li>Inside local: private IP on LAN</li>
      <li>Inside global: public IP seen on Internet</li>
    </ul>`,
  },
  {
    title: '🚧 ACLs — Access Control Lists',
    content: `<ul>
      <li>Standard ACL: filters on source IP only (place near destination)</li>
      <li>Extended ACL: source IP, dest IP, protocol, ports (place near source)</li>
      <li>Implicit deny all at end of every ACL</li>
      <li>Applied inbound or outbound on an interface</li>
      <li>Processing is top-down — first match wins</li>
    </ul>`,
  },
  {
    title: '📶 Wireless — WLAN Basics',
    content: `<ul>
      <li>802.11a/b/g/n/ac/ax (Wi-Fi 6)</li>
      <li>2.4 GHz: longer range, more interference</li>
      <li>5 GHz: shorter range, faster, less interference</li>
      <li>Channels: 1, 6, 11 are non-overlapping on 2.4 GHz</li>
      <li>WPA2 (AES/CCMP) is required for secure networks</li>
      <li>SSID: network name broadcast by the AP</li>
    </ul>`,
  },
  {
    title: '📋 IOS CLI Cheat Sheet',
    content: `<code>enable</code> — enter privileged mode<br>
    <code>conf t</code> — configure terminal<br>
    <code>int g0/0</code> — interface config mode<br>
    <code>ip address 10.0.0.1 255.255.255.0</code><br>
    <code>no shutdown</code> — bring interface up<br>
    <code>ip route 0.0.0.0 0.0.0.0 10.0.0.1</code> — default route<br>
    <code>show ip route</code> — routing table<br>
    <code>show ip int brief</code> — interface summary<br>
    <code>ping 10.0.0.2</code>`,
  },
  {
    title: '🏗️ STP — Spanning Tree',
    content: `<ul>
      <li>Prevents Layer 2 loops in redundant switch topologies</li>
      <li>Root Bridge: lowest Bridge ID (priority + MAC) wins</li>
      <li>Port states: Blocking → Listening → Learning → Forwarding</li>
      <li>PVST+: one STP instance per VLAN (Cisco)</li>
      <li>RSTP (802.1w): faster convergence (~1-2 seconds)</li>
    </ul>`,
  },
  {
    title: '📟 Cisco Router Models & Capabilities Breakdown',
    content: `
      <div style="font-size:11px; line-height:1.5;">
        <h4 style="color:#00d4ff; margin:6px 0 4px;">1. Enterprise Integrated Services Routers (ISRs)</h4>
        <p><strong>Cisco 4000 Series (ISR4321, ISR4331):</strong> Modern, high-performance routers for secure WAN, hosting, advanced routing, application visibility, VoIP, unified communications, and Catalyst SD-WAN. <em>ISR4331:</em> 3 GE ports (2 SFP), 2 NIM slots, 1 Service Module slot, USB.</p>
        <p style="margin-top:4px;"><strong>Cisco 2900 (2901, 2911) & 1900 (1941) Series:</strong> ISR G2 routers for small to medium branch offices. Hardware IPSec VPN acceleration. 1941: 2 GE ports, 2 EHWIC slots. 2901/2911: 2-3 GE ports, 4 EHWIC slots, internal DSP slots for voice/video gateways.</p>
        <p style="margin-top:4px;"><strong>Cisco 1800 (1841) & 2800 (2811) Series:</strong> Legacy ISRs. 1841: secure basic data connectivity (2 FE ports, 2 WIC/HWIC slots). 2811: integrated voice/video & data routing (2 FE ports, 4 HWIC slots).</p>
        <p style="margin-top:4px;"><strong>Cisco 2600 Series (2620XM, 2621XM):</strong> End-of-life modular access routers for small branch offices (1 or 2 FE ports, older WIC/NM slots).</p>

        <h4 style="color:#00d4ff; margin:10px 0 4px;">2. Industrial & Connected Grid Routers</h4>
        <p><strong>Cisco 800 Series (819HGW, 819HG-4G-IOX, 829):</strong> Ruggedized fixed-config routers for IoT & M2M communication. Firewalls, IPS, 3G/4G LTE cellular modems. 819HGW includes integrated Wi-Fi AP; 819HG-4G-IOX supports IOx edge application hosting.</p>
        <p style="margin-top:4px;"><strong>Cisco CGR 1000 Series (CGR1240):</strong> Ruggedized outdoor pole-mounted platform for Field Area Network (FAN) power distribution grids. Environmental cover, GE/SFP modules (100BASE-FX / 1000BASE-T).</p>
        <p style="margin-top:4px;"><strong>Cisco Industrial Routers (IR1101, IR8340):</strong> Modular industrial routers for harsh environments (factories, substations). Edge computing, 5G/cellular slots, GE/SFP ports, and legacy RS-232/485 serial ports for SCADA hardware.</p>

        <h4 style="color:#00d4ff; margin:10px 0 4px;">3. Generic Simulation Routers</h4>
        <p><strong>Router-PT & Router-PT-Empty:</strong> Software-only simulation routers for lab topology planning and practice. Router-PT: 10 expansion slots, 2 FE, 2 Serial, Console, Aux. Router-PT-Empty: blank chassis populated from scratch with custom modules.</p>
      </div>
    `,
  },
  {
    title: '🔀 Cisco Switch & Bridge Models Breakdown',
    content: `
      <div style="font-size:11px; line-height:1.5;">
        <h4 style="color:#00d4ff; margin:6px 0 4px;">1. Layer 2 Enterprise Access Switches</h4>
        <p><strong>Catalyst 2960-24TT:</strong> Fixed-config L2 access switch with 24 FastEthernet ports + 2 GigabitEthernet copper uplinks, VLANs, 802.1Q trunking, STP/RSTP, and port security.</p>
        <p style="margin-top:4px;"><strong>Catalyst 2950-24 & 2950T-24:</strong> Legacy L2 FastEthernet switches. 2950-24 has 24 10/100 ports; 2950T-24 adds dual GigabitEthernet copper uplinks.</p>

        <h4 style="color:#00d4ff; margin:10px 0 4px;">2. Layer 3 Multilayer Switches</h4>
        <p><strong>Catalyst 3560-24PS:</strong> Enterprise L3 switch with 24 FastEthernet 802.3af PoE ports + 2 SFP Gigabit uplinks. Hardware IP routing (OSPF, RIP, EIGRP), inter-VLAN routing, and ACLs.</p>
        <p style="margin-top:4px;"><strong>Catalyst 3650-24PS:</strong> Next-gen L3 switch with 24 GE PoE+ ports + 2 10G SFP+ uplinks, Cisco StackWise-160, integrated wireless controller capability, and advanced routing.</p>

        <h4 style="color:#00d4ff; margin:10px 0 4px;">3. Industrial Ethernet Switches</h4>
        <p><strong>Cisco IE-2000:</strong> Ruggedized DIN-rail L2 industrial switch (4 FE ports + 2 GE combo uplinks) for harsh factory and substation environments.</p>
        <p style="margin-top:4px;"><strong>Cisco Catalyst IE-3400:</strong> Advanced modular DIN-rail L3 industrial switch with GE PoE+ ports, inter-VLAN routing, and Resilient Ethernet Protocol (REP).</p>
        <p style="margin-top:4px;"><strong>Cisco Catalyst IE-9320:</strong> High-density 19-inch rack-mount L3 industrial switch with 24 GE ports + 4 10G SFP+ uplinks, IEEE 1588 PTP precision timing, and zero-loss redundancy (PRP/HSR).</p>

        <h4 style="color:#00d4ff; margin:10px 0 4px;">4. Generic Simulation Devices</h4>
        <p><strong>Switch-PT, Switch-PT-Empty & Bridge-PT:</strong> Software simulation devices. Switch-PT: 6 FE ports. Switch-PT-Empty: blank 10-slot chassis. Bridge-PT: 2-port L2 Ethernet bridge micro-segmenting collision domains.</p>
      </div>
    `,
  },
];

// ──────────────────────────────────────────────────────────────
//  Start on main menu
// ──────────────────────────────────────────────────────────────
showScreen('menu');
console.log('[NetGame] Initialized — v1.0.0');
