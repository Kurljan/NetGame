// src/levels/LevelManager.js
// Loads level JSON files and manages campaign progress.

import { eventBus } from '../engine/EventBus.js';

// Static import of all level data
import level01 from './level_01.json' assert { type: 'json' };
import level02 from './level_02.json' assert { type: 'json' };
import level03 from './level_03.json' assert { type: 'json' };
import level04 from './level_04.json' assert { type: 'json' };
import level05 from './level_05.json' assert { type: 'json' };
import level06 from './level_06.json' assert { type: 'json' };
import level07 from './level_07.json' assert { type: 'json' };
import level08 from './level_08.json' assert { type: 'json' };
import level09 from './level_09.json' assert { type: 'json' };
import level10 from './level_10.json' assert { type: 'json' };

export const LEVELS = [
  level01, level02, level03, level04, level05,
  level06, level07, level08, level09, level10,
];

const SAVE_KEY = 'netgame_progress';

export class LevelManager {
  constructor() {
    this._progress = this._loadProgress();
    this._current  = null;
  }

  // ──────────────────────────────────────────────────────────
  //  Progress tracking
  // ──────────────────────────────────────────────────────────
  _loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    } catch { return {}; }
  }

  _saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this._progress));
  }

  markComplete(levelId, score, time) {
    const key = `level_${levelId}`;
    const existing = this._progress[key] || { bestScore: 0, bestTime: Infinity };
    this._progress[key] = {
      completed: true,
      bestScore: Math.max(existing.bestScore, score),
      bestTime:  Math.min(existing.bestTime, time),
    };
    this._saveProgress();
  }

  isComplete(levelId) { return !!this._progress[`level_${levelId}`]?.completed; }
  isUnlocked(levelId) {
    if (levelId <= 1) return true;
    return this.isComplete(levelId - 1);
  }
  getBestScore(levelId) { return this._progress[`level_${levelId}`]?.bestScore || 0; }
  getCompletedCount() { return Object.values(this._progress).filter(p => p.completed).length; }

  // ──────────────────────────────────────────────────────────
  //  Level access
  // ──────────────────────────────────────────────────────────
  getLevel(id) { return LEVELS.find(l => l.id === id) || null; }
  getAllLevels() { return LEVELS; }

  // ──────────────────────────────────────────────────────────
  //  Render level select grid
  // ──────────────────────────────────────────────────────────
  renderLevelGrid(onSelect) {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const prog = document.getElementById('levels-progress');
    if (prog) prog.textContent = `${this.getCompletedCount()} / ${LEVELS.length} Complete`;

    LEVELS.forEach(level => {
      const locked    = !this.isUnlocked(level.id);
      const completed = this.isComplete(level.id);

      const card = document.createElement('div');
      card.className = `level-card ${locked ? 'locked' : ''} ${completed ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="level-num">LEVEL ${String(level.id).padStart(2, '0')}</div>
        <div class="level-title">${level.title}</div>
        <div class="level-topic">${level.topic}</div>
        <div class="level-desc">${level.description}</div>
        <div class="level-badge">${locked ? '🔒' : completed ? '✅' : '▶'}</div>
        ${completed ? `<div class="level-score">Best: ${this.getBestScore(level.id)} pts</div>` : ''}`;

      if (!locked) {
        card.addEventListener('click', () => onSelect(level));
      }
      grid.appendChild(card);
    });
  }
}
