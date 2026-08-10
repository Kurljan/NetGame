// src/ui/DeviceCommandGuide.js
// Interactive Device & Command Manual — teaches device purposes, hardware roles, and every CLI command.

import { eventBus } from '../engine/EventBus.js';
import { DEVICE_CATEGORIES, DEVICE_PROFILES, getDeviceProfile } from './DeviceCommandData.js';
import { DeviceRenderer } from './DeviceRenderer.js';

export class DeviceCommandGuide {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} [sim]
   */
  constructor(sim = null) {
    this.sim = sim;
    this.renderer = new DeviceRenderer();
    this.currentCategory = 'all';
    this.currentProfileKey = 'router';
    this.searchQuery = '';
    this.commandFilter = 'all';

    this._containerEl = document.getElementById('device-guide-content');
    this._navEl = document.getElementById('device-guide-nav');
    this._searchEl = document.getElementById('guide-search-input');

    this._init();
  }

  _init() {
    this._bindEvents();
  }

  _bindEvents() {
    // Search input
    this._searchEl?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderProfile(this.currentProfileKey);
    });

    // Back to menu / Back to game buttons
    document.getElementById('guide-back')?.addEventListener('click', () => {
      eventBus.emit('guide:close');
    });

    // Global event to open guide for a specific device
    eventBus.on('guide:openDevice', (type) => {
      this.openForDevice(type);
    });
  }

  /**
   * Opens the guide and selects a specific device type
   * @param {string} type
   */
  openForDevice(type = 'router') {
    const profile = getDeviceProfile(type);
    this.currentProfileKey = profile.type;
    this.renderNavigation();
    this.renderProfile(this.currentProfileKey);
  }

  /**
   * Renders the left sidebar navigation containing categories and device items
   */
  renderNavigation() {
    if (!this._navEl) return;

    let html = `
      <div class="guide-nav-header">
        <span class="guide-nav-title">Device Encyclopedia</span>
      </div>
      <div class="guide-categories-bar">
    `;

    DEVICE_CATEGORIES.forEach(cat => {
      const active = this.currentCategory === cat.id ? 'active' : '';
      html += `
        <button class="guide-cat-btn ${active}" data-cat="${cat.id}" title="${cat.name}">
          <span>${cat.icon}</span>
          <span class="cat-label">${cat.name}</span>
        </button>
      `;
    });

    html += `</div><div class="guide-device-list">`;

    const profileKeys = Object.keys(DEVICE_PROFILES);
    profileKeys.forEach(key => {
      const p = DEVICE_PROFILES[key];
      if (this.currentCategory !== 'all' && p.category !== this.currentCategory) {
        return;
      }
      const active = this.currentProfileKey === key ? 'active' : '';
      html += `
        <div class="guide-device-item ${active}" data-key="${key}">
          <canvas class="guide-item-canvas" width="36" height="36" data-draw="${p.iconType}"></canvas>
          <div class="guide-item-info">
            <div class="guide-item-name">${p.title.split(' ')[0]} ${p.title.split(' ')[1] || ''}</div>
            <div class="guide-item-layer">${p.osiLayer.split('—')[0]}</div>
          </div>
          <span class="guide-cmd-badge">${p.commands.length} cmds</span>
        </div>
      `;
    });

    html += `</div>`;
    this._navEl.innerHTML = html;

    // Draw device canvas icons
    this._navEl.querySelectorAll('.guide-item-canvas[data-draw]').forEach(canvas => {
      this.renderer.drawPreview(canvas, canvas.dataset.draw);
    });

    // Category click handlers
    this._navEl.querySelectorAll('.guide-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.cat;
        this.renderNavigation();
      });
    });

    // Device item click handlers
    this._navEl.querySelectorAll('.guide-device-item').forEach(item => {
      item.addEventListener('click', () => {
        this.currentProfileKey = item.dataset.key;
        this.renderNavigation();
        this.renderProfile(this.currentProfileKey);
      });
    });
  }

  /**
   * Renders the comprehensive device details, purpose, hardware, and complete command list
   * @param {string} profileKey
   */
  renderProfile(profileKey) {
    if (!this._containerEl) return;
    const p = DEVICE_PROFILES[profileKey] || DEVICE_PROFILES.router;

    // Filter commands by search & category
    let filteredCmds = p.commands;
    if (this.commandFilter !== 'all') {
      filteredCmds = filteredCmds.filter(c => c.category === this.commandFilter);
    }
    if (this.searchQuery) {
      filteredCmds = filteredCmds.filter(c =>
        c.command.toLowerCase().includes(this.searchQuery) ||
        (c.alias && c.alias.toLowerCase().includes(this.searchQuery)) ||
        c.purpose.toLowerCase().includes(this.searchQuery) ||
        (c.tip && c.tip.toLowerCase().includes(this.searchQuery))
      );
    }

    let html = `
      <div class="guide-profile-view">
        <!-- HEADER -->
        <div class="guide-header-card">
          <div class="guide-header-left">
            <canvas id="guide-hero-canvas" width="64" height="64"></canvas>
            <div class="guide-header-text">
              <div class="guide-layer-chip" style="border-color:${p.badgeColor}; color:${p.badgeColor}">
                ${p.osiLayer}
              </div>
              <h2 class="guide-device-title">${p.title}</h2>
              <p class="guide-device-role">${p.overview.role}</p>
            </div>
          </div>
        </div>

        <!-- TWO COLUMN OVERVIEW: USES & PURPOSE -->
        <div class="guide-overview-grid">
          <!-- CARD: Purpose & Role -->
          <div class="guide-info-card">
            <div class="guide-card-title">
              <span class="guide-card-icon">🎯</span>
              <span>Primary Purpose & Function in Networking</span>
            </div>
            <p class="guide-card-desc">${p.overview.purpose}</p>
            <div class="guide-section-subtitle">When to Use in Network Design:</div>
            <ul class="guide-bullet-list">
              ${p.overview.whenToUse.map(u => `<li>${u}</li>`).join('')}
            </ul>
          </div>

          <!-- CARD: Models & Hardware Features -->
          <div class="guide-info-card">
            <div class="guide-card-title">
              <span class="guide-card-icon">⚡</span>
              <span>Key Capabilities & Hardware Models</span>
            </div>
            <div class="guide-section-subtitle">Key Features:</div>
            <ul class="guide-bullet-list">
              ${p.overview.keyFeatures.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <div class="guide-section-subtitle" style="margin-top:12px;">Available Models in NetGame:</div>
            <div class="guide-models-list">
              ${p.models.map(m => `
                <div class="guide-model-chip">
                  <strong>${m.name}</strong>
                  <span>${m.ports}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- COMMANDS SECTION -->
        <div class="guide-commands-section">
          <div class="guide-commands-header">
            <div class="guide-cmd-title-group">
              <h3 class="guide-section-heading">CLI Commands &amp; Operational Syntax</h3>
              <span class="guide-cmd-count">${filteredCmds.length} Commands Listed</span>
            </div>

            <!-- Command Category Filters -->
            <div class="guide-cmd-filter-tabs">
              <button class="cmd-filter-btn ${this.commandFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
              <button class="cmd-filter-btn ${this.commandFilter === 'modes' ? 'active' : ''}" data-filter="modes">Exec Modes</button>
              <button class="cmd-filter-btn ${this.commandFilter === 'interfaces' ? 'active' : ''}" data-filter="interfaces">Interfaces</button>
              <button class="cmd-filter-btn ${this.commandFilter === 'routing' ? 'active' : ''}" data-filter="routing">Routing</button>
              <button class="cmd-filter-btn ${this.commandFilter === 'vlans' ? 'active' : ''}" data-filter="vlans">VLANs</button>
              <button class="cmd-filter-btn ${this.commandFilter === 'show' ? 'active' : ''}" data-filter="show">Show / Verify</button>
              <button class="cmd-filter-btn ${this.commandFilter === 'diagnostics' ? 'active' : ''}" data-filter="diagnostics">Diagnostics</button>
            </div>
          </div>

          <!-- COMMAND CARDS -->
          <div class="guide-cmd-cards-grid">
    `;

    if (filteredCmds.length === 0) {
      html += `
        <div class="guide-no-results">
          <div class="no-results-icon">🔍</div>
          <p>No commands match your filter or search query "<em>${this.searchQuery}</em>"</p>
        </div>
      `;
    } else {
      filteredCmds.forEach((cmd, idx) => {
        const aliasText = cmd.alias ? `<span class="cmd-alias">Shortcut: <code>${cmd.alias}</code></span>` : '';
        html += `
          <div class="guide-cmd-card">
            <div class="guide-cmd-card-header">
              <div class="guide-cmd-syntax">
                <code>${this._escapeHtml(cmd.command)}</code>
                ${aliasText}
              </div>
              <span class="guide-mode-chip">${this._escapeHtml(cmd.mode)}</span>
            </div>

            <div class="guide-cmd-purpose">
              <div class="cmd-prop-label">Purpose &amp; Operation:</div>
              <p>${cmd.purpose}</p>
            </div>

            <div class="guide-cmd-example">
              <div class="cmd-prop-label">Example Usage:</div>
              <pre><code>${this._escapeHtml(cmd.example)}</code></pre>
            </div>

            ${cmd.tip ? `
              <div class="guide-cmd-tip">
                <span class="tip-icon">💡</span>
                <span><strong>CCNA Tip:</strong> ${cmd.tip}</span>
              </div>
            ` : ''}

            <div class="guide-cmd-actions">
              <button class="guide-btn-copy" data-cmd="${this._escapeHtml(cmd.command.split(' ')[0])}">
                📋 Copy Syntax
              </button>
              <button class="guide-btn-try" data-cmd="${this._escapeHtml(cmd.command)}">
                ⚡ Send to CLI
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `
          </div>
        </div>
      </div>
    `;

    this._containerEl.innerHTML = html;

    // Draw Hero Icon
    const heroCanvas = document.getElementById('guide-hero-canvas');
    if (heroCanvas) {
      this.renderer.drawPreview(heroCanvas, p.iconType);
    }

    // Filter tabs handlers
    this._containerEl.querySelectorAll('.cmd-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.commandFilter = btn.dataset.filter;
        this.renderProfile(this.currentProfileKey);
      });
    });

    // Copy syntax handlers
    this._containerEl.querySelectorAll('.guide-btn-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = btn.dataset.cmd;
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = '✓ Copied!';
          btn.style.color = '#00ff88';
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.color = '';
          }, 1500);
        });
      });
    });

    // Send to CLI handlers
    this._containerEl.querySelectorAll('.guide-btn-try').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        eventBus.emit('terminal:insertCommand', cmd);
        // Visual feedback
        const original = btn.innerHTML;
        btn.innerHTML = '✓ Sent to Terminal!';
        btn.style.color = '#00ff88';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.color = '';
        }, 1500);
      });
    });
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Static helper to render the device commands & purpose view directly into the right sidebar DevicePanel
   * @param {import('../network/Device.js').Device} device
   * @param {HTMLElement} containerEl
   */
  static renderInPanel(device, containerEl) {
    if (!device || !containerEl) return;
    const p = getDeviceProfile(device.type);

    let html = `
      <div class="panel-guide-view">
        <div class="panel-guide-banner">
          <div class="panel-guide-role-title">${p.title}</div>
          <div class="panel-guide-layer">${p.osiLayer}</div>
          <p class="panel-guide-purpose">${p.overview.purpose}</p>
        </div>

        <div class="panel-guide-subheading">Supported Commands &amp; Purposes:</div>
        <div class="panel-guide-cmd-list">
    `;

    p.commands.forEach(cmd => {
      html += `
        <div class="panel-guide-cmd-item">
          <div class="panel-cmd-top">
            <code class="panel-cmd-code">${cmd.command}</code>
            <span class="panel-cmd-mode">${cmd.mode}</span>
          </div>
          <p class="panel-cmd-desc">${cmd.purpose}</p>
          <div class="panel-cmd-ex">
            <code>${cmd.example.split('\n')[0]}</code>
          </div>
          <div class="panel-cmd-btn-row">
            <button class="panel-cmd-send-btn" data-run="${cmd.command.split(' <')[0]}">⚡ Run / Pre-fill in CLI</button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    containerEl.innerHTML = html;

    // Attach click listeners to send commands to terminal
    containerEl.querySelectorAll('.panel-cmd-send-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.run;
        eventBus.emit('terminal:insertCommand', cmd);
      });
    });
  }
}
