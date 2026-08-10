// src/ui/SubnetPracticeUI.js
// Dual-Stack Interactive Controller for Subnetting, VLSM (IPv4),
// IPv6 /64 Hierarchical Subnetting, EUI-64 Lab, Compression, and Speed Drills.

import { VLSMCalculator } from '../subnetting/VLSMCalculator.js';
import { VLSMExerciseManager } from '../subnetting/VLSMExercises.js';
import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';
import { IPv6Calculator } from '../subnetting/IPv6Calculator.js';
import { IPv6ExerciseManager } from '../subnetting/IPv6Exercises.js';

export class SubnetPracticeUI {
  constructor() {
    this.currentProtocol = 'ipv4'; // 'ipv4' | 'ipv6'
    this.currentScenario = VLSMExerciseManager.getScenarioById('scen_small_office');
    this.currentIPv6Scenario = IPv6ExerciseManager.getScenarioById('ipv6_scen_campus_48');

    this.activeTab = 'exercises'; // 'exercises' | 'designer' | 'drills' | 'calc'
    this.currentDrill = null;
    this.drillStats = { correct: 0, total: 0, streak: 0, bestStreak: 0 };

    this.designerDepts = [
      { name: 'Engineering', hostsNeeded: 120 },
      { name: 'Sales', hostsNeeded: 60 },
      { name: 'HR & Admin', hostsNeeded: 28 },
      { name: 'WAN Link', hostsNeeded: 2 }
    ];

    this.ipv6DesignerDepts = [
      { name: 'Engineering VLAN 10', subnetIdHex: '0001' },
      { name: 'Sales VLAN 20', subnetIdHex: '0002' },
      { name: 'Staff Wi-Fi', subnetIdHex: '0003' },
      { name: 'Data Center DMZ', subnetIdHex: '0010' }
    ];

    this._initElements();
    this._bindEvents();
  }

  _initElements() {
    this.screenEl = document.getElementById('screen-subnet-practice');
    this.overlayEl = document.getElementById('overlay-subnet');
  }

  _bindEvents() {
    // Protocol switcher (IPv4 vs IPv6)
    document.addEventListener('click', (e) => {
      const protoBtn = e.target.closest('.proto-toggle-btn');
      if (protoBtn) {
        const proto = protoBtn.getAttribute('data-proto');
        this.switchProtocol(proto);
      }
    });

    // Tab switching for both modal and screen practice UI
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.subnet-tab-btn');
      if (tabBtn) {
        const tabKey = tabBtn.getAttribute('data-tab');
        this.switchTab(tabKey);
      }
    });

    // Subnet calculator overlay standard calculation
    document.getElementById('subnet-calc-btn')?.addEventListener('click', () => this.handleStandardCalc('subnet-input', 'subnet-result'));
    document.getElementById('modal-subnet-calc-btn')?.addEventListener('click', () => this.handleStandardCalc('modal-subnet-input', 'modal-subnet-result'));

    // Speed drill next button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#drill-next-btn')) {
        this.loadNextDrill();
      }
    });
  }

  /**
   * Switch between IPv4 and IPv6 mode.
   * @param {'ipv4'|'ipv6'} proto
   */
  switchProtocol(proto) {
    this.currentProtocol = proto;
    document.querySelectorAll('.proto-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-proto') === proto);
    });

    this.renderCurrentView();
  }

  /**
   * Switch active tab.
   * @param {'exercises'|'designer'|'drills'|'calc'} tabKey
   */
  switchTab(tabKey) {
    this.activeTab = tabKey;
    document.querySelectorAll('.subnet-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
    });
    document.querySelectorAll('.subnet-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.getAttribute('data-pane') === tabKey);
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    const isModal = !this.screenEl?.classList.contains('active');
    const prefix = isModal ? '#modal-' : '#';

    if (this.activeTab === 'exercises') {
      if (this.currentProtocol === 'ipv6') {
        this.renderIPv6ExerciseView(`${prefix}vlsm-exercise-container`);
      } else {
        this.renderExerciseView(`${prefix}vlsm-exercise-container`);
      }
    } else if (this.activeTab === 'designer') {
      if (this.currentProtocol === 'ipv6') {
        this.renderIPv6Designer(`${prefix}vlsm-designer-container`);
      } else {
        this.renderDesigner(`${prefix}vlsm-designer-container`);
      }
    } else if (this.activeTab === 'drills') {
      this.startDrills(`${prefix}vlsm-drills-container`);
    } else if (this.activeTab === 'calc') {
      this.handleStandardCalc(isModal ? 'modal-subnet-input' : 'subnet-input', isModal ? 'modal-subnet-result' : 'subnet-result');
    }
  }

  _renderProtoToggleHtml() {
    return `
      <div class="proto-switcher-wrap">
        <span class="proto-switcher-label">Protocol:</span>
        <div class="proto-toggle-group">
          <button class="proto-toggle-btn ${this.currentProtocol === 'ipv4' ? 'active' : ''}" data-proto="ipv4">
            IPv4 (VLSM)
          </button>
          <button class="proto-toggle-btn ${this.currentProtocol === 'ipv6' ? 'active' : ''}" data-proto="ipv6">
            IPv6 (/64 Subnets &amp; EUI-64)
          </button>
        </div>
      </div>
    `;
  }

  // ────────────────────────────────────────────────────────────
  //  TAB 1A: IPv4 VLSM Scenario Table Exercise
  // ────────────────────────────────────────────────────────────
  renderExerciseView(containerSelector = '#vlsm-exercise-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const scen = this.currentScenario;
    const scenariosList = VLSMExerciseManager.getCuratedScenarios();

    container.innerHTML = `
      ${this._renderProtoToggleHtml()}

      <div class="vlsm-ex-header">
        <div class="vlsm-ex-selector-wrap">
          <label class="vlsm-label">Select IPv4 Challenge Scenario:</label>
          <select id="vlsm-scenario-select" class="vlsm-select">
            ${scenariosList.map(s => `
              <option value="${s.id}" ${s.id === scen.id ? 'selected' : ''}>
                [${s.tier}] ${s.title} (${s.baseNetwork})
              </option>
            `).join('')}
            <option value="custom_random" ${scen.id.startsWith('random_') ? 'selected' : ''}>
              🎲 Procedural Random Challenge...
            </option>
          </select>
          <button id="btn-vlsm-random" class="vlsm-mini-btn" title="Generate New Random Scenario">🎲 New Random</button>
        </div>

        <div class="vlsm-ex-card">
          <div class="vlsm-ex-card-top">
            <div class="vlsm-ex-badge ${scen.tier.toLowerCase()}">${scen.tier}</div>
            <h3 class="vlsm-ex-title">${scen.title}</h3>
            <div class="vlsm-ex-base-pill">Base Allocation: <strong>${scen.baseNetwork}</strong></div>
          </div>
          <p class="vlsm-ex-desc">${scen.description}</p>
          <div class="vlsm-ex-hints">
            <span class="hint-icon">💡</span>
            <span><strong>CCNA Hint:</strong> ${scen.hint}</span>
          </div>
        </div>
      </div>

      <!-- Visual Allocation Bar -->
      <div class="vlsm-alloc-bar-section">
        <div class="vlsm-bar-header">
          <span>Address Space Partition Preview (${scen.baseNetwork})</span>
          <span id="vlsm-bar-legend" class="vlsm-bar-legend"></span>
        </div>
        <div id="vlsm-alloc-bar" class="vlsm-alloc-bar"></div>
      </div>

      <!-- Interactive Exercise Table -->
      <div class="vlsm-table-wrap">
        <div class="vlsm-table-actions-top">
          <span class="table-instruction">Fill in the VLSM subnets below (Tip: Sort by Largest Hosts first!):</span>
          <div class="table-quick-tools">
            <button id="btn-vlsm-autosort" class="vlsm-btn-secondary" title="Sort rows descending by host requirements">
              ↓ Auto-Sort Largest First
            </button>
            <button id="btn-vlsm-clear-inputs" class="vlsm-btn-secondary" title="Clear all input fields">
              ↺ Reset Fields
            </button>
          </div>
        </div>

        <table class="vlsm-table">
          <thead>
            <tr>
              <th style="width:160px">Department / Link</th>
              <th style="width:90px">Hosts Needed</th>
              <th style="width:110px">Prefix / Mask</th>
              <th>Network Address</th>
              <th>First Usable IP</th>
              <th>Last Usable IP</th>
              <th>Broadcast Address</th>
              <th style="width:60px">Status</th>
            </tr>
          </thead>
          <tbody id="vlsm-table-body">
            ${scen.departments.map((d, i) => `
              <tr data-row="${i}">
                <td><input type="text" class="vlsm-input dept-name" value="${d.name}" placeholder="Dept Name" /></td>
                <td><input type="number" class="vlsm-input dept-hosts" value="${d.hostsNeeded}" min="1" placeholder="e.g. 50" /></td>
                <td><input type="text" class="vlsm-input dept-prefix" placeholder="e.g. /26" /></td>
                <td><input type="text" class="vlsm-input dept-network" placeholder="e.g. 192.168.1.0" /></td>
                <td><input type="text" class="vlsm-input dept-first" placeholder="e.g. 192.168.1.1" /></td>
                <td><input type="text" class="vlsm-input dept-last" placeholder="e.g. 192.168.1.62" /></td>
                <td><input type="text" class="vlsm-input dept-bcast" placeholder="e.g. 192.168.1.63" /></td>
                <td class="row-status-cell"><span class="row-status-icon">-</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Action Buttons and Feedback -->
      <div class="vlsm-table-actions-bottom">
        <button id="btn-vlsm-check" class="vlsm-btn-primary">✓ Check VLSM Answers</button>
        <button id="btn-vlsm-solve" class="vlsm-btn-accent">📖 Show Step-by-Step Derivation</button>
        <button id="btn-vlsm-ios" class="vlsm-btn-secondary">📋 Export Cisco IOS CLI Config</button>
      </div>

      <div id="vlsm-feedback-box" class="vlsm-feedback-box hidden"></div>
      <div id="vlsm-step-guide-modal" class="vlsm-step-guide-box hidden"></div>
    `;

    this._updateVisualBarPreview();
    this._attachExerciseListeners(container);
  }

  // ────────────────────────────────────────────────────────────
  //  TAB 1B: IPv6 /64 Subnetting Scenario Exercise
  // ────────────────────────────────────────────────────────────
  renderIPv6ExerciseView(containerSelector = '#vlsm-exercise-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const scen = this.currentIPv6Scenario;
    const scenariosList = IPv6ExerciseManager.getCuratedScenarios();

    container.innerHTML = `
      ${this._renderProtoToggleHtml()}

      <div class="vlsm-ex-header">
        <div class="vlsm-ex-selector-wrap">
          <label class="vlsm-label">Select IPv6 Challenge Scenario:</label>
          <select id="ipv6-scenario-select" class="vlsm-select">
            ${scenariosList.map(s => `
              <option value="${s.id}" ${s.id === scen.id ? 'selected' : ''}>
                [${s.tier}] ${s.title} (${s.baseNetwork})
              </option>
            `).join('')}
            <option value="custom_random" ${scen.id.startsWith('ipv6_random_') ? 'selected' : ''}>
              🎲 Procedural Random IPv6 Challenge...
            </option>
          </select>
          <button id="btn-ipv6-random" class="vlsm-mini-btn" title="Generate New Random Scenario">🎲 New Random</button>
        </div>

        <div class="vlsm-ex-card">
          <div class="vlsm-ex-card-top">
            <div class="vlsm-ex-badge advanced">IPv6 /64</div>
            <h3 class="vlsm-ex-title">${scen.title}</h3>
            <div class="vlsm-ex-base-pill">Prefix: <strong>${scen.baseNetwork}</strong></div>
          </div>
          <p class="vlsm-ex-desc">${scen.description}</p>
          <div class="vlsm-ex-hints">
            <span class="hint-icon">💡</span>
            <span><strong>IPv6 Subnetting Rule:</strong> ${scen.hint}</span>
          </div>
        </div>
      </div>

      <!-- Interactive IPv6 Exercise Table -->
      <div class="vlsm-table-wrap">
        <div class="vlsm-table-actions-top">
          <span class="table-instruction">Assign 16-bit Subnet IDs (in hex) and complete the /64 subnet addresses:</span>
          <button id="btn-ipv6-clear-inputs" class="vlsm-btn-secondary">↺ Reset Fields</button>
        </div>

        <table class="vlsm-table">
          <thead>
            <tr>
              <th style="width:200px">Department / VLAN</th>
              <th style="width:110px">Subnet ID (Hex)</th>
              <th style="width:80px">Prefix</th>
              <th>Network Prefix (/64)</th>
              <th>Router Gateway (::1)</th>
              <th style="width:60px">Status</th>
            </tr>
          </thead>
          <tbody id="ipv6-table-body">
            ${scen.departments.map((d, i) => `
              <tr data-row="${i}">
                <td><input type="text" class="vlsm-input v6-dept-name" value="${d.name}" placeholder="Dept Name" /></td>
                <td><input type="text" class="vlsm-input v6-subnet-id" placeholder="e.g. 0001" /></td>
                <td><span class="prefix-tag">/64</span></td>
                <td><input type="text" class="vlsm-input v6-net-pfx" placeholder="e.g. 2001:db8:acad:1::/64" /></td>
                <td><input type="text" class="vlsm-input v6-gateway" placeholder="e.g. 2001:db8:acad:1::1" /></td>
                <td class="row-status-cell"><span class="row-status-icon">-</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="vlsm-table-actions-bottom">
        <button id="btn-ipv6-check" class="vlsm-btn-primary">✓ Check IPv6 Subnets</button>
        <button id="btn-ipv6-autofill" class="vlsm-btn-accent">✨ Solve &amp; Fill Subnets</button>
        <button id="btn-ipv6-ios" class="vlsm-btn-secondary">📋 Export Cisco IPv6 CLI</button>
      </div>

      <div id="ipv6-feedback-box" class="vlsm-feedback-box hidden"></div>
      <div id="ipv6-step-guide-modal" class="vlsm-step-guide-box hidden"></div>
    `;

    this._attachIPv6ExerciseListeners(container);
  }

  _attachIPv6ExerciseListeners(container) {
    container.querySelector('#ipv6-scenario-select')?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom_random') {
        this.currentIPv6Scenario = IPv6ExerciseManager.generateRandomScenario();
      } else {
        this.currentIPv6Scenario = IPv6ExerciseManager.getScenarioById(val);
      }
      this.renderIPv6ExerciseView();
    });

    container.querySelector('#btn-ipv6-random')?.addEventListener('click', () => {
      this.currentIPv6Scenario = IPv6ExerciseManager.generateRandomScenario();
      this.renderIPv6ExerciseView();
    });

    container.querySelector('#btn-ipv6-clear-inputs')?.addEventListener('click', () => {
      container.querySelectorAll('#ipv6-table-body tr').forEach(tr => {
        tr.querySelectorAll('input').forEach(inp => {
          if (!inp.classList.contains('v6-dept-name')) inp.value = '';
          inp.classList.remove('valid', 'invalid');
        });
      });
    });

    container.querySelector('#btn-ipv6-check')?.addEventListener('click', () => {
      this.checkIPv6ExerciseAnswers();
    });

    container.querySelector('#btn-ipv6-autofill')?.addEventListener('click', () => {
      const solution = IPv6Calculator.calculateIPv6Subnets(
        this.currentIPv6Scenario.baseNetwork,
        this.currentIPv6Scenario.departments
      );
      if (solution.success) {
        const trs = container.querySelectorAll('#ipv6-table-body tr');
        solution.subnets.forEach((sub, i) => {
          const tr = trs[i];
          if (!tr) return;
          tr.querySelector('.v6-subnet-id').value = sub.subnetIdHex;
          tr.querySelector('.v6-net-pfx').value = sub.networkPrefix;
          tr.querySelector('.v6-gateway').value = sub.gateway;
        });
        this.checkIPv6ExerciseAnswers();
      }
    });

    container.querySelector('#btn-ipv6-ios')?.addEventListener('click', () => {
      const solution = IPv6Calculator.calculateIPv6Subnets(
        this.currentIPv6Scenario.baseNetwork,
        this.currentIPv6Scenario.departments
      );
      if (solution.success) {
        const iosCli = IPv6Calculator.generateIosConfig(solution.subnets, 'IPv6-CoreRouter');
        this._showIosModal(iosCli, 'Cisco IOS Dual-Stack IPv6 CLI Configuration');
      }
    });
  }

  checkIPv6ExerciseAnswers() {
    const userRows = [];
    document.querySelectorAll('#ipv6-table-body tr').forEach(tr => {
      userRows.push({
        subnetIdHex: tr.querySelector('.v6-subnet-id')?.value.trim() || '',
        networkPrefix: tr.querySelector('.v6-net-pfx')?.value.trim() || '',
        gateway: tr.querySelector('.v6-gateway')?.value.trim() || ''
      });
    });

    const result = IPv6Calculator.validateUserIPv6Table(
      this.currentIPv6Scenario.baseNetwork,
      this.currentIPv6Scenario.departments,
      userRows
    );

    const feedbackBox = document.getElementById('ipv6-feedback-box');
    if (feedbackBox) {
      feedbackBox.classList.remove('hidden');
      feedbackBox.className = `vlsm-feedback-box ${result.allCorrect ? 'success' : 'warning'}`;
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <span>${result.allCorrect ? '✅ Perfect IPv6 Subnetting!' : '⚠️ Review Fields'}</span>
          <span>Score: ${result.totalScore} / ${result.maxScore} pts</span>
        </div>
        <p class="feedback-body">${result.feedbackSummary}</p>
      `;
    }

    const trs = document.querySelectorAll('#ipv6-table-body tr');
    result.rowResults.forEach((res, i) => {
      const tr = trs[i];
      if (!tr) return;

      const setField = (sel, fieldObj) => {
        const inp = tr.querySelector(sel);
        if (!inp) return;
        inp.classList.remove('valid', 'invalid');
        if (fieldObj) {
          inp.classList.add(fieldObj.isCorrect ? 'valid' : 'invalid');
          inp.title = fieldObj.isCorrect ? '✓ Correct' : (fieldObj.errorMsg || '✗ Incorrect');
        }
      };

      setField('.v6-subnet-id', res.fields.subnetIdHex);
      setField('.v6-net-pfx', res.fields.networkPrefix);
      setField('.v6-gateway', res.fields.gateway);

      const status = tr.querySelector('.row-status-icon');
      if (status) status.innerHTML = res.isCorrect ? '✅' : '❌';
    });
  }

  // ────────────────────────────────────────────────────────────
  //  TAB 2B: IPv6 EUI-64 & Compression Lab (Designer)
  // ────────────────────────────────────────────────────────────
  renderIPv6Designer(containerSelector = '#vlsm-designer-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = `
      ${this._renderProtoToggleHtml()}

      <div class="designer-top-bar">
        <div class="designer-input-group">
          <label class="vlsm-label">IPv6 Address (Test Compression &amp; Scope):</label>
          <input type="text" id="v6-inspect-input" class="vlsm-input-field" value="2001:0db8:0000:0001:0000:0000:0000:0010" />
        </div>
        <button id="btn-v6-inspect" class="vlsm-btn-primary">Inspect &amp; Compress</button>
      </div>

      <div class="designer-content-grid">
        <div class="designer-depts-col">
          <div class="section-title">EUI-64 Interface ID Generator</div>
          <p style="font-size:12px; color:var(--text-secondary); margin-bottom:10px;">
            Enter a 48-bit MAC address to generate the 64-bit EUI-64 Interface ID and Link-Local address (FE80::/64):
          </p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <input type="text" id="eui-mac-input" class="vlsm-input" value="AA:BB:CC:11:22:33" placeholder="e.g. AA:BB:CC:11:22:33" />
            <input type="text" id="eui-prefix-input" class="vlsm-input" value="fe80::/64" placeholder="Prefix (e.g. fe80::/64)" />
            <button id="btn-eui-calc" class="vlsm-btn-secondary">Generate EUI-64 Address</button>
          </div>
          <div id="eui-result-box" style="margin-top:14px; font-size:12px;"></div>
        </div>

        <div class="designer-result-col">
          <div class="section-title">IPv6 Address Anatomy &amp; Classification</div>
          <div id="v6-inspect-result" class="designer-results"></div>
        </div>
      </div>
    `;

    this._attachIPv6DesignerListeners(container);
    this.runIPv6Inspection();
    this.runEUI64Calc();
  }

  _attachIPv6DesignerListeners(container) {
    container.querySelector('#btn-v6-inspect')?.addEventListener('click', () => this.runIPv6Inspection());
    container.querySelector('#v6-inspect-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.runIPv6Inspection();
    });

    container.querySelector('#btn-eui-calc')?.addEventListener('click', () => this.runEUI64Calc());
  }

  runIPv6Inspection() {
    const raw = document.getElementById('v6-inspect-input')?.value.trim() || '2001:db8:acad:1::1';
    const resBox = document.getElementById('v6-inspect-result');
    if (!resBox) return;

    try {
      const exp = IPv6Calculator.expand(raw);
      const comp = IPv6Calculator.compress(raw);
      const typeInfo = IPv6Calculator.getAddressType(raw);

      resBox.innerHTML = `
        <div class="designer-summary-stats">
          <div class="stat-badge">Address Type: <strong style="color:var(--cyan)">${typeInfo.type}</strong></div>
          <div class="stat-badge">Scope: <strong>${typeInfo.scope}</strong></div>
          <div class="stat-badge">Routable: <strong>${typeInfo.isRoutable ? 'Yes (Public)' : 'No (Local/Private)'}</strong></div>
        </div>

        <div style="background:var(--bg-elevated); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
          <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px;">RFC 5952 Compressed Format:</div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:14px; color:var(--green); font-weight:700;">${comp}</div>
        </div>

        <div style="background:var(--bg-elevated); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
          <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px;">Full 32-Hex-Digit Expanded Format (8 Hextets):</div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--cyan);">${exp}</div>
        </div>

        <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
          <strong>CCNA Note:</strong> ${typeInfo.description}
        </div>
      `;
    } catch (e) {
      resBox.innerHTML = `<div class="vlsm-error">✗ ${e.message}</div>`;
    }
  }

  runEUI64Calc() {
    const mac = document.getElementById('eui-mac-input')?.value.trim() || 'AA:BB:CC:11:22:33';
    const prefix = document.getElementById('eui-prefix-input')?.value.trim() || 'fe80::/64';
    const resBox = document.getElementById('eui-result-box');
    if (!resBox) return;

    try {
      const eui = IPv6Calculator.generateEUI64(mac, prefix);
      resBox.innerHTML = `
        <div style="background:rgba(0,255,136,0.1); border:1px solid var(--green); padding:10px; border-radius:var(--radius-sm); margin-bottom:8px;">
          <div style="font-size:10px; color:var(--green); text-transform:uppercase; font-weight:700;">Generated Address:</div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:13px; color:#fff; font-weight:700;">${eui.fullAddress}</div>
        </div>
        <div style="font-size:11px; color:var(--text-secondary); line-height:1.4;">
          ${eui.eui64Explanation}
        </div>
      `;
    } catch (e) {
      resBox.innerHTML = `<div class="vlsm-error">✗ ${e.message}</div>`;
    }
  }

  // ────────────────────────────────────────────────────────────
  //  TAB 3: Speed Drills & Flash Quizzes (Dual-Stack)
  // ────────────────────────────────────────────────────────────
  startDrills(containerSelector = '#vlsm-drills-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    this.loadNextDrill(container);
  }

  loadNextDrill(container = document.querySelector('#vlsm-drills-container')) {
    if (!container) return;

    if (this.currentProtocol === 'ipv6') {
      this.currentDrill = IPv6ExerciseManager.generateDrillQuestion();
    } else {
      this.currentDrill = VLSMExerciseManager.generateDrillQuestion();
    }
    const d = this.currentDrill;

    container.innerHTML = `
      ${this._renderProtoToggleHtml()}

      <div class="drill-card">
        <div class="drill-top">
          <div class="drill-badge">${this.currentProtocol.toUpperCase()}: ${d.title}</div>
          <div class="drill-stats">
            <span class="stat-item">Streak: <strong class="streak-val">🔥 ${this.drillStats.streak}</strong></span>
            <span class="stat-item">Score: <strong>${this.drillStats.correct} / ${this.drillStats.total}</strong></span>
          </div>
        </div>

        <div class="drill-prompt">${d.prompt}</div>

        <div class="drill-options">
          ${d.options.map((opt, i) => `
            <button class="drill-opt-btn" data-val="${opt}">
              <span class="opt-key">${['A', 'B', 'C', 'D'][i]}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `).join('')}
        </div>

        <div id="drill-feedback" class="drill-feedback hidden"></div>
        <div class="drill-footer">
          <button id="drill-next-btn" class="vlsm-btn-primary hidden">Next Drill ➔</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.drill-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-val');
        this.submitDrillAnswer(choice, btn, container);
      });
    });
  }

  submitDrillAnswer(choice, clickedBtn, container) {
    const d = this.currentDrill;
    if (!d) return;

    const isCorrect = choice === d.correctAnswer;
    this.drillStats.total++;
    if (isCorrect) {
      this.drillStats.correct++;
      this.drillStats.streak++;
      if (this.drillStats.streak > this.drillStats.bestStreak) {
        this.drillStats.bestStreak = this.drillStats.streak;
      }
    } else {
      this.drillStats.streak = 0;
    }

    container.querySelectorAll('.drill-opt-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.getAttribute('data-val') === d.correctAnswer) {
        btn.classList.add('correct');
      } else if (btn === clickedBtn && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    const fb = container.querySelector('#drill-feedback');
    if (fb) {
      fb.classList.remove('hidden');
      fb.className = `drill-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
      fb.innerHTML = `
        <div class="feedback-title">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
        <div class="feedback-desc">${d.explanation}</div>
      `;
    }

    const nextBtn = container.querySelector('#drill-next-btn');
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
      nextBtn.focus();
    }
  }

  // ────────────────────────────────────────────────────────────
  //  TAB 4: Dual-Stack Subnet Calculator
  // ────────────────────────────────────────────────────────────
  handleStandardCalc(inputId = 'subnet-input', resultId = 'subnet-result') {
    const inputEl = document.getElementById(inputId);
    const input = inputEl?.value.trim() || (this.currentProtocol === 'ipv6' ? '2001:db8:acad:1::10/64' : '192.168.1.0/24');
    const result = document.getElementById(resultId);
    if (!result) return;

    if (IPv6Calculator.isValidIPv6(input)) {
      try {
        const clean = input.split('/')[0].trim();
        const pfx = parseInt(input.split('/')[1] || '64', 10);
        const exp = IPv6Calculator.expand(clean);
        const comp = IPv6Calculator.compress(clean);
        const typeInfo = IPv6Calculator.getAddressType(clean);

        result.innerHTML = `
          <div class="subnet-field"><div class="subnet-field-label">IPv6 Address (Compressed)</div><div class="subnet-field-value">${comp}/${pfx}</div></div>
          <div class="subnet-field"><div class="subnet-field-label">Address Type / Scope</div><div class="subnet-field-value">${typeInfo.type} (${typeInfo.scope})</div></div>
          <div class="subnet-field" style="grid-column: span 2;"><div class="subnet-field-label">Full Expanded Format (32 Hex)</div><div class="subnet-field-value" style="font-size:11px;">${exp}</div></div>
          <div class="subnet-field"><div class="subnet-field-label">Subnet Prefix</div><div class="subnet-field-value">/${pfx}</div></div>
          <div class="subnet-field"><div class="subnet-field-label">Total /64 Host Space</div><div class="subnet-field-value">18.4 Quintillion IPs</div></div>
        `;
      } catch (e) {
        result.innerHTML = `<div class="pkt-result failure">✗ ${e.message}</div>`;
      }
      return;
    }

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

  // ────────────────────────────────────────────────────────────
  //  IPv4 Designer & Common Modals
  // ────────────────────────────────────────────────────────────
  renderDesigner(containerSelector = '#vlsm-designer-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = `
      ${this._renderProtoToggleHtml()}

      <div class="designer-top-bar">
        <div class="designer-input-group">
          <label class="vlsm-label">Parent Network / Mask:</label>
          <input type="text" id="designer-base-ip" class="vlsm-input-field" value="10.0.0.0/22" placeholder="e.g. 192.168.1.0/24" />
        </div>
        <button id="btn-designer-calculate" class="vlsm-btn-primary">Calculate VLSM Design</button>
        <button id="btn-designer-add-dept" class="vlsm-btn-secondary">+ Add Department</button>
      </div>

      <div class="designer-content-grid">
        <div class="designer-depts-col">
          <div class="section-title">Department Host Requirements</div>
          <div id="designer-depts-list" class="designer-depts-list">
            ${this.designerDepts.map((d, idx) => `
              <div class="designer-dept-row" data-index="${idx}">
                <input type="text" class="vlsm-input designer-name" value="${d.name}" placeholder="Department Name" />
                <input type="number" class="vlsm-input designer-hosts" value="${d.hostsNeeded}" min="1" placeholder="Hosts" />
                <button class="btn-remove-dept" title="Remove">✕</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="designer-result-col">
          <div class="section-title">Optimal Subnet Partition</div>
          <div id="designer-results" class="designer-results"></div>
        </div>
      </div>
    `;

    this._attachDesignerListeners(container);
    this.calculateDesignerOutput();
  }

  _attachDesignerListeners(container) {
    container.querySelector('#btn-designer-add-dept')?.addEventListener('click', () => {
      this.designerDepts.push({ name: `Department ${this.designerDepts.length + 1}`, hostsNeeded: 30 });
      this.renderDesigner();
    });

    container.querySelector('#btn-designer-calculate')?.addEventListener('click', () => {
      this._gatherDesignerInputs();
      this.calculateDesignerOutput();
    });

    container.querySelectorAll('.btn-remove-dept').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('.designer-dept-row');
        const idx = parseInt(row.getAttribute('data-index'), 10);
        this.designerDepts.splice(idx, 1);
        this.renderDesigner();
      });
    });
  }

  _gatherDesignerInputs() {
    const list = [];
    document.querySelectorAll('.designer-dept-row').forEach(row => {
      list.push({
        name: row.querySelector('.designer-name')?.value.trim() || 'Subnet',
        hostsNeeded: parseInt(row.querySelector('.designer-hosts')?.value.trim(), 10) || 1
      });
    });
    this.designerDepts = list;
  }

  calculateDesignerOutput() {
    const baseCidr = document.getElementById('designer-base-ip')?.value.trim() || '10.0.0.0/22';
    const resContainer = document.getElementById('designer-results');
    if (!resContainer) return;

    const solution = VLSMCalculator.calculateVLSM(baseCidr, this.designerDepts);
    if (!solution.success) {
      resContainer.innerHTML = `<div class="vlsm-error">✗ ${solution.error}</div>`;
      return;
    }

    resContainer.innerHTML = `
      <div class="designer-summary-stats">
        <div class="stat-badge">Total Capacity: <strong>${solution.totalCapacity} IPs</strong></div>
        <div class="stat-badge">Allocated: <strong>${solution.totalUsedAddresses} IPs</strong></div>
        <div class="stat-badge">Efficiency: <strong>${solution.efficiencyPercentage}%</strong></div>
      </div>

      <div class="designer-table-wrap">
        <table class="vlsm-table compact">
          <thead>
            <tr>
              <th>Dept</th>
              <th>Needed</th>
              <th>Prefix</th>
              <th>Mask</th>
              <th>Network</th>
              <th>Usable Range</th>
              <th>Broadcast</th>
            </tr>
          </thead>
          <tbody>
            ${solution.allocations.map(a => `
              <tr>
                <td><strong>${a.name}</strong></td>
                <td>${a.hostsNeeded}</td>
                <td><span class="prefix-tag">/${a.prefix}</span></td>
                <td class="code-font">${a.mask}</td>
                <td class="code-font highlight">${a.network}</td>
                <td class="code-font">${a.firstHost} – ${a.lastHost}</td>
                <td class="code-font">${a.broadcast}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${VLSMCalculator.generateStepByStepGuide(baseCidr, this.designerDepts)}
    `;
  }

  _attachExerciseListeners(container) {
    container.querySelector('#vlsm-scenario-select')?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom_random') {
        this.currentScenario = VLSMExerciseManager.generateRandomScenario('intermediate');
      } else {
        this.currentScenario = VLSMExerciseManager.getScenarioById(val);
      }
      this.renderExerciseView();
    });

    container.querySelector('#btn-vlsm-random')?.addEventListener('click', () => {
      const tiers = ['beginner', 'intermediate', 'advanced'];
      const pick = tiers[Math.floor(Math.random() * tiers.length)];
      this.currentScenario = VLSMExerciseManager.generateRandomScenario(pick);
      this.renderExerciseView();
    });

    container.querySelector('#btn-vlsm-autosort')?.addEventListener('click', () => {
      const rows = this._gatherTableRows();
      rows.sort((a, b) => (parseInt(b.hostsNeeded, 10) || 0) - (parseInt(a.hostsNeeded, 10) || 0));
      this._populateTableRows(rows);
    });

    container.querySelector('#btn-vlsm-clear-inputs')?.addEventListener('click', () => {
      container.querySelectorAll('#vlsm-table-body tr').forEach(tr => {
        tr.querySelectorAll('.dept-prefix, .dept-network, .dept-first, .dept-last, .dept-bcast').forEach(inp => {
          inp.value = '';
          inp.classList.remove('valid', 'invalid');
        });
        const status = tr.querySelector('.row-status-icon');
        if (status) status.innerHTML = '-';
      });
      const fb = container.querySelector('#vlsm-feedback-box');
      if (fb) fb.classList.add('hidden');
    });

    container.querySelector('#btn-vlsm-check')?.addEventListener('click', () => this.checkExerciseAnswers());
    container.querySelector('#btn-vlsm-solve')?.addEventListener('click', () => this.toggleStepByStepGuide());
    container.querySelector('#btn-vlsm-ios')?.addEventListener('click', () => {
      const solution = VLSMCalculator.calculateVLSM(this.currentScenario.baseNetwork, this.currentScenario.departments);
      if (solution.success) {
        const iosCli = VLSMCalculator.generateIosConfig(solution.allocations, 'CoreRouter');
        this._showIosModal(iosCli, 'Cisco IOS Interface Configuration');
      }
    });
  }

  _gatherTableRows() {
    const rows = [];
    document.querySelectorAll('#vlsm-table-body tr').forEach(tr => {
      const prefixRaw = tr.querySelector('.dept-prefix')?.value.trim() || '';
      let prefix = prefixRaw;
      let mask = '';
      if (prefixRaw.includes('.')) {
        mask = prefixRaw;
        prefix = SC.isValidMask(mask) ? SC.maskToCidr(mask) : prefixRaw;
      } else {
        const pNum = parseInt(prefixRaw.replace('/', ''), 10);
        prefix = !isNaN(pNum) ? pNum : prefixRaw;
        mask = !isNaN(pNum) && pNum >= 0 && pNum <= 32 ? SC.cidrToMask(pNum) : '';
      }

      rows.push({
        name: tr.querySelector('.dept-name')?.value.trim() || '',
        hostsNeeded: parseInt(tr.querySelector('.dept-hosts')?.value.trim(), 10) || 0,
        prefix,
        mask,
        network: tr.querySelector('.dept-network')?.value.trim() || '',
        firstHost: tr.querySelector('.dept-first')?.value.trim() || '',
        lastHost: tr.querySelector('.dept-last')?.value.trim() || '',
        broadcast: tr.querySelector('.dept-bcast')?.value.trim() || ''
      });
    });
    return rows;
  }

  _populateTableRows(rows) {
    const tbody = document.getElementById('vlsm-table-body');
    if (!tbody) return;
    tbody.innerHTML = rows.map((r, i) => `
      <tr data-row="${i}">
        <td><input type="text" class="vlsm-input dept-name" value="${r.name}" placeholder="Dept Name" /></td>
        <td><input type="number" class="vlsm-input dept-hosts" value="${r.hostsNeeded}" min="1" /></td>
        <td><input type="text" class="vlsm-input dept-prefix" value="${r.prefix ? `/${r.prefix}` : ''}" placeholder="e.g. /26" /></td>
        <td><input type="text" class="vlsm-input dept-network" value="${r.network}" placeholder="Network IP" /></td>
        <td><input type="text" class="vlsm-input dept-first" value="${r.firstHost}" placeholder="First Host" /></td>
        <td><input type="text" class="vlsm-input dept-last" value="${r.lastHost}" placeholder="Last Host" /></td>
        <td><input type="text" class="vlsm-input dept-bcast" value="${r.broadcast}" placeholder="Broadcast" /></td>
        <td class="row-status-cell"><span class="row-status-icon">-</span></td>
      </tr>
    `).join('');
  }

  checkExerciseAnswers() {
    const userRows = this._gatherTableRows();
    const result = VLSMCalculator.validateUserVLSMTable(
      this.currentScenario.baseNetwork,
      this.currentScenario.departments,
      userRows
    );

    const feedbackBox = document.getElementById('vlsm-feedback-box');
    if (feedbackBox) {
      feedbackBox.classList.remove('hidden');
      feedbackBox.className = `vlsm-feedback-box ${result.allCorrect ? 'success' : 'warning'}`;
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <span>${result.allCorrect ? '✅ Correct Allocation!' : '⚠️ Needs Review'}</span>
          <span>Score: ${result.totalScore} / ${result.maxScore} pts</span>
        </div>
        <p class="feedback-body">${result.feedbackSummary}</p>
      `;
    }

    const trs = document.querySelectorAll('#vlsm-table-body tr');
    result.rowResults.forEach((res, i) => {
      const tr = trs[i];
      if (!tr) return;

      const setFieldState = (selector, fieldObj) => {
        const inp = tr.querySelector(selector);
        if (!inp) return;
        inp.classList.remove('valid', 'invalid');
        if (fieldObj) {
          inp.classList.add(fieldObj.isCorrect ? 'valid' : 'invalid');
          inp.title = fieldObj.isCorrect ? '✓ Correct' : (fieldObj.errorMsg || '✗ Incorrect');
        }
      };

      setFieldState('.dept-name', res.fields.name);
      setFieldState('.dept-hosts', res.fields.hostsNeeded);
      setFieldState('.dept-prefix', res.fields.prefix);
      setFieldState('.dept-network', res.fields.network);
      setFieldState('.dept-first', res.fields.firstHost);
      setFieldState('.dept-last', res.fields.lastHost);
      setFieldState('.dept-bcast', res.fields.broadcast);

      const status = tr.querySelector('.row-status-icon');
      if (status) {
        status.innerHTML = res.isCorrect ? '✅' : '❌';
        status.title = res.isCorrect ? 'Row completely correct' : 'One or more fields in this row are incorrect';
      }
    });

    this._updateVisualBarPreview(result.allCorrect);
  }

  toggleStepByStepGuide() {
    const box = document.getElementById('vlsm-step-guide-modal');
    if (!box) return;

    if (!box.classList.contains('hidden')) {
      box.classList.add('hidden');
      return;
    }

    const html = VLSMCalculator.generateStepByStepGuide(
      this.currentScenario.baseNetwork,
      this.currentScenario.departments
    );

    box.innerHTML = `
      <div class="guide-modal-inner">
        <div class="guide-modal-header">
          <h3>Variable Length Subnet Masking — Step-by-Step Derivation</h3>
          <button id="btn-close-step-guide" class="overlay-close">✕</button>
        </div>
        <div class="guide-modal-content">
          ${html}
        </div>
        <div class="guide-modal-footer">
          <button id="btn-autofill-solution" class="vlsm-btn-primary">Fill Solution Into Table</button>
          <button id="btn-close-step-guide-btm" class="vlsm-btn-secondary">Close Guide</button>
        </div>
      </div>
    `;

    box.classList.remove('hidden');
    box.querySelector('#btn-close-step-guide')?.addEventListener('click', () => box.classList.add('hidden'));
    box.querySelector('#btn-close-step-guide-btm')?.addEventListener('click', () => box.classList.add('hidden'));
    box.querySelector('#btn-autofill-solution')?.addEventListener('click', () => {
      const solution = VLSMCalculator.calculateVLSM(this.currentScenario.baseNetwork, this.currentScenario.departments);
      if (solution.success) {
        this._populateTableRows(solution.allocations);
        this.checkExerciseAnswers();
        box.classList.add('hidden');
      }
    });
  }

  _showIosModal(iosCli, title) {
    const box = document.getElementById('vlsm-step-guide-modal') || document.getElementById('ipv6-step-guide-modal');
    if (!box) return;

    box.innerHTML = `
      <div class="guide-modal-inner">
        <div class="guide-modal-header">
          <h3>${title}</h3>
          <button id="btn-close-ios" class="overlay-close">✕</button>
        </div>
        <div class="guide-modal-content">
          <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            Copy and paste these commands into NetGame's IOS Terminal or Cisco Packet Tracer.
          </p>
          <textarea class="vlsm-ios-code" readonly id="vlsm-ios-textarea">${iosCli}</textarea>
        </div>
        <div class="guide-modal-footer">
          <button id="btn-copy-ios" class="vlsm-btn-primary">📋 Copy to Clipboard</button>
          <button id="btn-close-ios-btm" class="vlsm-btn-secondary">Close</button>
        </div>
      </div>
    `;

    box.classList.remove('hidden');
    box.querySelector('#btn-close-ios')?.addEventListener('click', () => box.classList.add('hidden'));
    box.querySelector('#btn-close-ios-btm')?.addEventListener('click', () => box.classList.add('hidden'));
    box.querySelector('#btn-copy-ios')?.addEventListener('click', () => {
      const ta = box.querySelector('#vlsm-ios-textarea');
      if (ta) {
        ta.select();
        navigator.clipboard.writeText(ta.value);
        const copyBtn = box.querySelector('#btn-copy-ios');
        if (copyBtn) copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { if (copyBtn) copyBtn.textContent = '📋 Copy to Clipboard'; }, 2000);
      }
    });
  }

  _updateVisualBarPreview() {
    const bar = document.getElementById('vlsm-alloc-bar');
    const legend = document.getElementById('vlsm-bar-legend');
    if (!bar) return;

    const solution = VLSMCalculator.calculateVLSM(
      this.currentScenario.baseNetwork,
      this.currentScenario.departments
    );

    if (!solution.success) {
      bar.innerHTML = `<div class="bar-error">${solution.error}</div>`;
      return;
    }

    const colors = ['#00d4ff', '#00ff88', '#ffaa00', '#a855f7', '#ff4466', '#00e5ff', '#ffca28', '#26a69a'];
    let slicesHtml = '';

    solution.allocations.forEach((alloc, i) => {
      const pct = (alloc.totalSize / solution.totalCapacity) * 100;
      const color = colors[i % colors.length];
      slicesHtml += `
        <div class="bar-slice" style="width: ${pct}%; background: ${color};" title="${alloc.name}: ${alloc.network}/${alloc.prefix} (${alloc.totalSize} IPs, ${pct.toFixed(1)}%)">
          <span class="slice-label">${alloc.name} (/${alloc.prefix})</span>
        </div>
      `;
    });

    solution.unallocatedBlocks.forEach((unalloc) => {
      const pct = (unalloc.size / solution.totalCapacity) * 100;
      slicesHtml += `
        <div class="bar-slice unallocated" style="width: ${pct}%;" title="Free Unallocated: ${unalloc.network}/${unalloc.prefix} (${unalloc.size} IPs)">
          <span class="slice-label">Free ${pct.toFixed(0)}%</span>
        </div>
      `;
    });

    bar.innerHTML = slicesHtml;
    if (legend) {
      legend.innerHTML = `Allocated: <strong>${solution.totalUsedAddresses}</strong> / ${solution.totalCapacity} addresses (${solution.efficiencyPercentage}% efficiency)`;
    }
  }
}
