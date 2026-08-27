// src/ui/ObjectiveChecker.js
// Provides detailed, per-objective feedback with instructional diagnostics.
// Shows what's right, what's wrong, and why — turning the campaign into a learning platform.

import { eventBus }        from '../engine/EventBus.js';
import { SubnetValidator } from '../subnetting/SubnetValidator.js';

export class ObjectiveChecker {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   */
  constructor(sim) {
    this.sim        = sim;
    this._panel     = null;
    this._levelData = null;
    this._results   = [];       // latest check results
    this._objectives = [];
    this._createPanel();
  }

  // ──────────────────────────────────────────────────────────
  //  Build DOM
  // ──────────────────────────────────────────────────────────
  _createPanel() {
    this._panel = document.createElement('div');
    this._panel.id = 'objective-checker';
    this._panel.className = 'obj-checker hidden';
    this._panel.innerHTML = `
      <div class="obj-checker-header">
        <span class="obj-checker-title">📝 Objective Checker</span>
        <div class="obj-checker-actions">
          <button id="obj-checker-check-all" class="obj-checker-btn primary" title="Check all objectives">
            ▶ Check All
          </button>
          <button id="obj-checker-toggle" class="obj-checker-btn" title="Collapse/expand">
            ▾
          </button>
          <button id="obj-checker-close" class="obj-checker-btn" title="Close">
            ✖
          </button>
        </div>
      </div>
      <div class="obj-checker-body" id="obj-checker-body">
        <!-- Populated dynamically -->
      </div>
    `;
    document.body.appendChild(this._panel);

    // Wire buttons
    this._panel.querySelector('#obj-checker-check-all').addEventListener('click', () => {
      this.checkAll();
    });

    this._panel.querySelector('#obj-checker-toggle').addEventListener('click', () => {
      const body = this._panel.querySelector('#obj-checker-body');
      const btn  = this._panel.querySelector('#obj-checker-toggle');
      body.classList.toggle('collapsed');
      btn.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
    });

    this._panel.querySelector('#obj-checker-close').addEventListener('click', () => {
      this.hide();
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Load level data
  // ──────────────────────────────────────────────────────────
  loadLevel(levelData) {
    this._levelData  = levelData;
    this._objectives = (levelData.objectives || []).map(o => ({
      ...o,
      state: 'pending',
      message: '',
    }));
    this._results = [];
    this._render();
    // Do not show automatically; wait for user to open it via the Tools menu
    this.hide();
  }

  show() {
    this._panel.classList.remove('hidden');
  }

  hide() {
    this._panel.classList.add('hidden');
  }

  // ──────────────────────────────────────────────────────────
  //  Render objective items
  // ──────────────────────────────────────────────────────────
  _render() {
    const body = this._panel.querySelector('#obj-checker-body');
    if (!body) return;

    const feedback = this._levelData?.feedback || {};

    body.innerHTML = this._objectives.map((obj, idx) => {
      const fb = feedback[obj.id] || {};
      const stateIcon = obj.state === 'pass' ? '✅'
                      : obj.state === 'fail' ? '❌'
                      : '⏳';
      const stateClass = obj.state;

      // Determine diagnostic message
      let diagnostic = '';
      if (obj.state === 'pass') {
        diagnostic = fb.onPass || obj.message || 'Objective completed!';
      } else if (obj.state === 'fail') {
        diagnostic = fb.onFail || obj.message || 'Not yet complete.';
      } else {
        diagnostic = 'Not yet checked.';
      }

      return `
        <div class="obj-check-item ${stateClass}" data-obj-id="${obj.id}">
          <div class="obj-check-row">
            <span class="obj-check-icon">${stateIcon}</span>
            <span class="obj-check-num">${idx + 1}.</span>
            <span class="obj-check-desc">${obj.desc}</span>
            <button class="obj-check-single-btn" data-obj-idx="${idx}" title="Check this objective">
              Check
            </button>
          </div>
          <div class="obj-check-diagnostic ${stateClass}">
            ${diagnostic}
          </div>
        </div>
      `;
    }).join('');

    // Wire individual check buttons
    body.querySelectorAll('.obj-check-single-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.objIdx);
        this.checkSingle(idx);
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Check all objectives
  // ──────────────────────────────────────────────────────────
  checkAll() {
    if (!this._levelData?.requirements) return;

    const results = SubnetValidator.validateLevel(
      this._levelData.requirements,
      this.sim.devices,
      this.sim.links,
      this.sim
    );

    for (const result of results) {
      const obj = this._objectives.find(o => o.id === result.id);
      if (!obj) continue;
      obj.state   = result.pass ? 'pass' : 'fail';
      obj.message = result.message || '';
    }

    this._results = results;
    this._render();

    // Emit for HUD to pick up
    eventBus.emit('checker:results', {
      results: this._results,
      objectives: this._objectives,
      levelData: this._levelData,
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Check a single objective
  // ──────────────────────────────────────────────────────────
  checkSingle(idx) {
    if (!this._levelData?.requirements) return;
    const req = this._levelData.requirements[idx];
    if (!req) return;

    const results = SubnetValidator.validateLevel(
      [req],
      this.sim.devices,
      this.sim.links,
      this.sim
    );

    if (results.length > 0) {
      const result = results[0];
      const obj = this._objectives.find(o => o.id === result.id);
      if (obj) {
        obj.state   = result.pass ? 'pass' : 'fail';
        obj.message = result.message || '';
      }
    }

    this._render();

    // Emit partial update
    eventBus.emit('checker:single', {
      idx,
      objectives: this._objectives,
      levelData: this._levelData,
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Get current results summary
  // ──────────────────────────────────────────────────────────
  getAllPassed() {
    return this._objectives.length > 0 &&
      this._objectives.every(o => o.state === 'pass');
  }

  getPassCount() {
    return this._objectives.filter(o => o.state === 'pass').length;
  }

  getTotal() {
    return this._objectives.length;
  }
}
