// src/ui/PacketInspector.js
// Bottom-right panel: send packets and display per-hop OSI layer breakdown.

import { eventBus }  from '../engine/EventBus.js';
import { Packet }    from '../network/Packet.js';

export class PacketInspector {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   * @param {import('../engine/Canvas.js').Canvas} canvas
   */
  constructor(sim, canvas) {
    this.sim    = sim;
    this.canvas = canvas;

    this._layersEl = document.getElementById('inspector-layers');
    this._srcSel   = document.getElementById('pkt-src');
    this._dstIp    = document.getElementById('pkt-dst-ip');
    this._protoSel = document.getElementById('pkt-proto');

    this._bindEvents();
  }

  // ──────────────────────────────────────────────────────────
  //  Events
  // ──────────────────────────────────────────────────────────
  _bindEvents() {
    document.getElementById('btn-send-packet')?.addEventListener('click', () => this._send());

    eventBus.on('packet:result', result => this._showResult(result));

    // Keep source device dropdown up to date
    eventBus.on('topology:changed', () => this._updateSourceList());

    // When a device is selected, auto-populate source
    eventBus.on('device:select', device => {
      if (this._srcSel) this._srcSel.value = device.id;
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Source device dropdown
  // ──────────────────────────────────────────────────────────
  _updateSourceList() {
    if (!this._srcSel) return;
    const current = this._srcSel.value;
    this._srcSel.innerHTML = '<option value="">Source Device</option>';
    for (const device of this.sim.devices.values()) {
      const hasIp = device.interfaces?.some(i => i.ipAddress);
      const opt   = document.createElement('option');
      opt.value       = device.id;
      opt.textContent = `${device.hostname} (${device.interfaces?.find(i=>i.ipAddress)?.ipAddress || 'no IP'})`;
      if (!hasIp) opt.disabled = true;
      this._srcSel.appendChild(opt);
    }
    if (current) this._srcSel.value = current;
  }

  // ──────────────────────────────────────────────────────────
  //  Send packet
  // ──────────────────────────────────────────────────────────
  _send() {
    const srcId  = this._srcSel?.value;
    const dstIp  = this._dstIp?.value.trim();
    const proto  = this._protoSel?.value.toUpperCase() || 'ICMP';

    if (!srcId)  { this._showError('Select a source device.'); return; }
    if (!dstIp)  { this._showError('Enter a destination IP.'); return; }

    const result = this.sim.simulate(srcId, dstIp, proto);
    this._showResult(result);

    // Trigger packet animation if success
    if (result.success && result.pathDeviceIds?.length > 1) {
      const pathForAnim = result.pathDeviceIds.map(id => ({ deviceId: id }));
      this.canvas.addPacketAnimation(
        result.packet,
        pathForAnim,
        this.sim.devices,
        () => eventBus.emit('packet:arrived', result.packet)
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Display result
  // ──────────────────────────────────────────────────────────
  _showResult(result) {
    if (!this._layersEl) return;
    this._layersEl.innerHTML = '';

    // Result banner
    const banner = document.createElement('div');
    banner.className = `pkt-result ${result.success ? 'success' : 'failure'}`;
    banner.innerHTML = result.success
      ? `<span>✓</span> Packet delivered successfully!`
      : `<span>✗</span> ${result.error || 'Packet lost.'}`;
    this._layersEl.appendChild(banner);

    // Hop trail
    if (result.pathDeviceIds?.length) {
      const trail = document.createElement('div');
      trail.className = 'hop-trail';
      result.pathDeviceIds.forEach((id, i) => {
        const dev = this.sim.devices.get(id);
        if (i > 0) {
          const arrow = document.createElement('span');
          arrow.className = 'hop-arrow';
          arrow.textContent = '→';
          trail.appendChild(arrow);
        }
        const hop = document.createElement('span');
        hop.className = `hop-item ${i === 0 ? '' : i === result.pathDeviceIds.length - 1 ? 'done' : 'active'}`;
        hop.textContent = dev?.hostname || id;
        trail.appendChild(hop);
      });
      this._layersEl.appendChild(trail);
    }

    // OSI Layers
    if (result.packet) {
      const layers = result.packet.buildOsiLayers();
      const layerColors = { 7: 'osi-l7', 4: 'osi-l4', 3: 'osi-l3', 2: 'osi-l2', 1: 'osi-l1' };

      layers.forEach(layer => {
        const card = document.createElement('div');
        card.className = 'osi-layer';

        const colorClass = layerColors[layer.layer] || 'osi-l1';
        card.innerHTML = `
          <div class="osi-layer-header">
            <div class="osi-layer-num ${colorClass}">${layer.layer}</div>
            <div class="osi-layer-name">Layer ${layer.layer} — ${layer.name}</div>
            <div class="osi-layer-proto">${layer.proto}</div>
          </div>
          <div class="osi-layer-body">
            ${layer.fields.map(f => `
              <div class="osi-field">
                <span class="osi-field-label">${f.label}:</span>
                <span class="osi-field-value ${f.color || ''}">${f.value || '—'}</span>
              </div>`).join('')}
          </div>`;
        this._layersEl.appendChild(card);
      });
    }
  }

  _showError(msg) {
    if (!this._layersEl) return;
    this._layersEl.innerHTML = `<div class="pkt-result failure"><span>✗</span> ${msg}</div>`;
  }
}
