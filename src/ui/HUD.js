// src/ui/HUD.js
// Top HUD: level info, objectives chips, score, timer.

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

    this._scoreEl   = document.getElementById('hud-score');
    this._timerEl   = document.getElementById('hud-timer');
    this._objEl     = document.getElementById('hud-objectives');
    this._levelNumEl = document.getElementById('hud-level-num');
    this._levelNameEl= document.getElementById('hud-level-name');

    document.getElementById('btn-test-all')?.addEventListener('click', () => this.runObjectiveChecks());
    document.getElementById('hud-menu-btn')?.addEventListener('click', () => eventBus.emit('screen:menu'));
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
