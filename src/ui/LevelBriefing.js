// src/ui/LevelBriefing.js
// Shows a learning-oriented briefing overlay when a campaign level starts.
// Explains the task, why it matters, key concepts, and learning goals.

import { eventBus } from '../engine/EventBus.js';

export class LevelBriefing {
  constructor() {
    this._overlay = null;
    this._levelData = null;
    this._createOverlay();
  }

  // ──────────────────────────────────────────────────────────
  //  Build the DOM overlay (once)
  // ──────────────────────────────────────────────────────────
  _createOverlay() {
    this._overlay = document.createElement('div');
    this._overlay.id = 'overlay-briefing';
    this._overlay.className = 'overlay hidden';
    this._overlay.innerHTML = `
      <div class="overlay-box briefing-box">
        <div class="briefing-header">
          <div class="briefing-level-badge" id="briefing-level-badge">LEVEL 01</div>
          <h2 class="briefing-title" id="briefing-title">Level Title</h2>
          <span class="briefing-topic" id="briefing-topic">Topic</span>
        </div>

        <div class="briefing-body">
          <!-- Task Description -->
          <div class="briefing-section">
            <div class="briefing-section-icon">📋</div>
            <div class="briefing-section-content">
              <h3>Your Task</h3>
              <p id="briefing-task"></p>
            </div>
          </div>

          <!-- Why This Matters -->
          <div class="briefing-section">
            <div class="briefing-section-icon">🎯</div>
            <div class="briefing-section-content">
              <h3>Why This Matters</h3>
              <p id="briefing-why"></p>
            </div>
          </div>

          <!-- Key Concepts -->
          <div class="briefing-section">
            <div class="briefing-section-icon">📚</div>
            <div class="briefing-section-content">
              <h3>Key Concepts</h3>
              <div class="briefing-concepts" id="briefing-concepts"></div>
            </div>
          </div>

          <!-- Objectives -->
          <div class="briefing-section">
            <div class="briefing-section-icon">✅</div>
            <div class="briefing-section-content">
              <h3>Objectives</h3>
              <ol class="briefing-objectives" id="briefing-objectives"></ol>
            </div>
          </div>

          <!-- Learning Goal -->
          <div class="briefing-section learning-goal">
            <div class="briefing-section-icon">🎓</div>
            <div class="briefing-section-content">
              <h3>Learning Goal</h3>
              <p id="briefing-goal"></p>
            </div>
          </div>

          <!-- CCNA Reference -->
          <div class="briefing-ccna" id="briefing-ccna"></div>
        </div>

        <div class="briefing-footer">
          <button id="briefing-start-btn" class="briefing-start-btn">
            Start Level <span class="briefing-start-arrow">→</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(this._overlay);

    // Wire up start button
    this._overlay.querySelector('#briefing-start-btn').addEventListener('click', () => {
      this.hide();
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Show briefing for a level
  // ──────────────────────────────────────────────────────────
  show(levelData) {
    this._levelData = levelData;

    const briefing = levelData.briefing || {};

    // Level badge & title
    this._overlay.querySelector('#briefing-level-badge').textContent =
      `LEVEL ${String(levelData.id).padStart(2, '0')}`;
    this._overlay.querySelector('#briefing-title').textContent =
      levelData.title || 'Untitled';
    this._overlay.querySelector('#briefing-topic').textContent =
      levelData.topic || '';

    // Task description
    this._overlay.querySelector('#briefing-task').textContent =
      levelData.description || 'Complete the objectives below.';

    // Why this matters
    const whyEl = this._overlay.querySelector('#briefing-why');
    whyEl.textContent = briefing.why || 'This task teaches fundamental networking skills tested on the CCNA exam.';

    // Key concepts (pills)
    const conceptsEl = this._overlay.querySelector('#briefing-concepts');
    const concepts = briefing.concepts || [levelData.topic || 'Networking'];
    conceptsEl.innerHTML = concepts.map(c =>
      `<span class="briefing-concept-pill">${c}</span>`
    ).join('');

    // Objectives list
    const objEl = this._overlay.querySelector('#briefing-objectives');
    objEl.innerHTML = (levelData.objectives || []).map(o =>
      `<li>${o.desc}</li>`
    ).join('');

    // Learning goal
    const goalEl = this._overlay.querySelector('#briefing-goal');
    goalEl.textContent = briefing.learningGoal ||
      `You'll practice ${levelData.topic || 'networking'} skills used in real-world network administration.`;

    // CCNA reference
    const ccnaEl = this._overlay.querySelector('#briefing-ccna');
    ccnaEl.textContent = levelData.ccnaRef ? `📖 ${levelData.ccnaRef}` : '';

    // Show
    this._overlay.classList.remove('hidden');
  }

  hide() {
    this._overlay.classList.add('hidden');
    eventBus.emit('briefing:dismissed', this._levelData);
  }

  isVisible() {
    return !this._overlay.classList.contains('hidden');
  }

  /** Re-show the briefing for the current level. */
  reshow() {
    if (this._levelData) {
      this.show(this._levelData);
    }
  }
}
