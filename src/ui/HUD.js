// src/ui/HUD.js
// Top HUD: level info, objectives chips, score, timer, and hint system.

import { eventBus }          from '../engine/EventBus.js';
import { SubnetValidator }   from '../subnetting/SubnetValidator.js';

export class HUD {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   */
  constructor(sim) {
    this.sim         = sim;
    this.score       = 0;
    this._timer      = 0;
    this._timerRunning = false;
    this._timerInterval= null;
    this._objectives = [];
    this._levelData  = null;

    // Hint system state
    this._hints     = [];
    this._hintIndex = 0;       // how many hints have been revealed
    this._hintOpen  = false;

    this._scoreEl   = document.getElementById('hud-score');
    this._timerEl   = document.getElementById('hud-timer');
    this._objEl     = document.getElementById('hud-objectives');
    this._levelNumEl = document.getElementById('hud-level-num');
    this._levelNameEl= document.getElementById('hud-level-name');

    // Hint drawer DOM
    this._hintDrawer   = document.getElementById('hint-drawer');
    this._hintBody     = document.getElementById('hint-drawer-body');
    this._hintCount    = document.getElementById('hint-drawer-count');
    this._hintNextBtn  = document.getElementById('hint-next-btn');
    
    // Tools dropdown & items
    this._toolsBtn     = document.getElementById('hud-tools-btn');
    this._toolsMenu    = document.getElementById('hud-tools-menu');
    this._hintHudBtn   = document.getElementById('hud-hint-btn');
    this._toolsBadge   = document.getElementById('tools-hint-badge');
    this._menuBadge    = document.getElementById('menu-hint-badge');

    document.getElementById('btn-test-all')?.addEventListener('click', () => this.runObjectiveChecks());
    document.getElementById('hud-menu-btn')?.addEventListener('click', () => eventBus.emit('screen:menu'));

    // Toggle Tools Dropdown
    this._toolsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toolsMenu?.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this._toolsMenu?.contains(e.target) && e.target !== this._toolsBtn) {
        this._toolsMenu?.classList.add('hidden');
      }
    });

    // Hint button toggles the drawer
    this._hintHudBtn?.addEventListener('click', () => {
      this.toggleHintDrawer();
      this._toolsMenu?.classList.add('hidden'); // close menu
    });

    // "Show Next Hint" button
    this._hintNextBtn?.addEventListener('click', () => this.showNextHint());

    // Close Hint Drawer button
    document.getElementById('hint-close-btn')?.addEventListener('click', () => this._closeHintDrawer());
  }

  // ──────────────────────────────────────────────────────────
  //  Level load
  // ──────────────────────────────────────────────────────────
  loadLevel(levelData) {
    this._levelData  = levelData;
    this.score       = 0;
    this._timer      = 0;
    this._objectives = (levelData.objectives || []).map(o => ({ ...o, state: 'pending' }));

    if (this._levelNumEl)  this._levelNumEl.textContent  = `LV ${levelData.id || '?'}`;
    if (this._levelNameEl) this._levelNameEl.textContent = levelData.title || 'Level';

    // Load hints
    this._hints     = levelData.hints || [];
    this._hintIndex = 0;
    this._hintOpen  = false;
    this._renderHintDrawer();
    this._closeHintDrawer();

    this._renderObjectives();
    this._updateScore();
    this._startTimer();
  }

  // ──────────────────────────────────────────────────────────
  //  Objectives
  // ──────────────────────────────────────────────────────────
  _renderObjectives() {
    if (!this._objEl) return;
    this._objEl.innerHTML = '';
    for (const obj of this._objectives) {
      const chip = document.createElement('div');
      chip.className  = `objective-chip ${obj.state}`;
      chip.id         = `obj-${obj.id}`;
      chip.innerHTML  = `<span class="obj-dot ${obj.state === 'pending' ? 'blink' : ''}"></span>${obj.desc}`;
      this._objEl.appendChild(chip);
    }
  }

  runObjectiveChecks() {
    if (!this._levelData?.requirements) return;

    const results = SubnetValidator.validateLevel(
      this._levelData.requirements,
      this.sim.devices,
      this.sim.links,
      this.sim
    );

    let allPass = true;
    for (const result of results) {
      const obj = this._objectives.find(o => o.id === result.id);
      if (!obj) continue;

      const wasPass = obj.state === 'pass';
      obj.state = result.pass ? 'pass' : 'fail';
      if (!result.pass) allPass = false;

      // Award points for newly passing objectives
      if (result.pass && !wasPass) {
        this.score += 100;
        this._updateScore();
      }

      // Update chip
      const chip = document.getElementById(`obj-${obj.id}`);
      if (chip) {
        chip.className = `objective-chip ${obj.state}`;
        chip.innerHTML = `<span class="obj-dot"></span>${result.message}`;
      }
    }

    if (allPass && results.length > 0) {
      // Bonus for time
      const bonus = Math.max(0, 500 - this._timer * 2);
      this.score += bonus;
      this._updateScore();
      this._stopTimer();
      eventBus.emit('level:complete', {
        score: this.score,
        time:  this._timer,
        level: this._levelData,
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Hint System
  // ──────────────────────────────────────────────────────────
  toggleHintDrawer() {
    if (this._hintOpen) {
      this._closeHintDrawer();
    } else {
      this._openHintDrawer();
    }
  }

  _openHintDrawer() {
    this._hintOpen = true;
    this._hintDrawer?.classList.add('open');
  }

  _closeHintDrawer() {
    this._hintOpen = false;
    this._hintDrawer?.classList.remove('open');
  }

  showNextHint() {
    if (this._hintIndex >= this._hints.length) return;
    this._hintIndex++;
    this._renderHintDrawer();
    this._openHintDrawer();
  }

  _renderHintDrawer() {
    if (!this._hintBody) return;

    // Update counter
    if (this._hintCount) {
      this._hintCount.textContent = `${this._hintIndex} / ${this._hints.length}`;
    }

    // Render revealed hints
    if (this._hintIndex === 0) {
      this._hintBody.innerHTML = '<div class="hint-empty">Click "Show Next Hint" to reveal your first hint.</div>';
    } else {
      this._hintBody.innerHTML = this._hints.slice(0, this._hintIndex).map((hint, i) => `
        <div class="hint-item">
          <span class="hint-num">${i + 1}</span>
          <span class="hint-text">${hint}</span>
        </div>
      `).join('');
    }

    // Disable button when all hints revealed
    if (this._hintNextBtn) {
      const allRevealed = this._hintIndex >= this._hints.length;
      this._hintNextBtn.disabled = allRevealed;
      this._hintNextBtn.textContent = allRevealed ? 'All Hints Revealed' : 'Show Next Hint';
    }

    // Update HUD button badges
    const remaining = this._hints.length - this._hintIndex;
    if (remaining > 0 && this._hints.length > 0) {
      if (this._toolsBadge) {
        this._toolsBadge.textContent = remaining;
        this._toolsBadge.classList.remove('hidden');
      }
      if (this._menuBadge) {
        this._menuBadge.textContent = remaining;
        this._menuBadge.classList.remove('hidden');
      }
    } else {
      if (this._toolsBadge) this._toolsBadge.classList.add('hidden');
      if (this._menuBadge) this._menuBadge.classList.add('hidden');
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Score
  // ──────────────────────────────────────────────────────────
  _updateScore() {
    if (this._scoreEl) this._scoreEl.textContent = this.score.toLocaleString();
  }

  addScore(pts) {
    this.score += pts;
    this._updateScore();
  }

  // ──────────────────────────────────────────────────────────
  //  Timer
  // ──────────────────────────────────────────────────────────
  _startTimer() {
    this._stopTimer();
    this._timerRunning = true;
    this._timerInterval = setInterval(() => {
      this._timer++;
      this._updateTimer();
    }, 1000);
  }

  _stopTimer() {
    this._timerRunning = false;
    if (this._timerInterval) { clearInterval(this._timerInterval); this._timerInterval = null; }
  }

  _updateTimer() {
    if (!this._timerEl) return;
    const m = Math.floor(this._timer / 60);
    const s = this._timer % 60;
    this._timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  getElapsedTime() { return this._timer; }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
}
