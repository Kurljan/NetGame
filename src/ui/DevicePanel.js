// src/ui/DevicePanel.js
// Right sidebar config panel — shows device interfaces, routing table, VLANs, DHCP/NAT.

import { eventBus }      from '../engine/EventBus.js';
import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';
import { SubnetValidator }from '../subnetting/SubnetValidator.js';
import { addStaticRoute, removeStaticRoute } from '../routing/StaticRoute.js';

export class DevicePanel {
  /**
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   */
  constructor(sim) {
    this.sim    = sim;
    this.device = null;   // currently shown device

    this._el        = document.getElementById('config-panel');
    this._emptyEl   = document.getElementById('panel-empty');
    this._deviceEl  = document.getElementById('panel-device');

    this._bindEvents();
    this._bindTabs();
  }

  // ──────────────────────────────────────────────────────────
  //  Event bus
  // ──────────────────────────────────────────────────────────
  _bindEvents() {
    eventBus.on('panel:showDevice', device => this.show(device));
    eventBus.on('panel:clear',      ()     => this.hide());

    // Hostname edit
    document.getElementById('panel-hostname')?.addEventListener('change', e => {
      if (!this.device) return;
      this.device.hostname = e.target.value.trim() || this.device.hostname;
      eventBus.emit('canvas:markDirty');
    });

    // Apply interfaces button
    document.getElementById('btn-apply-interfaces')?.addEventListener('click', () => {
      this._applyInterfaces();
    });

    // Add static route
    document.getElementById('btn-add-route')?.addEventListener('click', () => {
      this._addRoute();
    });

    // Delete device
    document.getElementById('btn-delete-device')?.addEventListener('click', () => {
      if (!this.device) return;
      eventBus.emit('device:delete', this.device);
    });

    // Apply routing protocol
    document.getElementById('btn-apply-routing')?.addEventListener('click', () => {
      if (!this.device) return;
      const proto = document.getElementById('routing-protocol').value;
      if (this.device.config) this.device.config.routingProtocol = proto;
      this.device.routingProtocol = proto;
      eventBus.emit('topology:changed');
    });

    // DHCP pool apply
    document.getElementById('btn-apply-dhcp')?.addEventListener('click', () => {
      this._applyDhcp();
    });
  }

  _bindTabs() {
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const id = `tab-${tab.dataset.tab}`;
        document.getElementById(id)?.classList.remove('hidden');
        if (tab.dataset.tab === 'routing') this._renderRoutingTab();
        if (tab.dataset.tab === 'vlan')    this._renderVlanTab();
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  //  Show / Hide
  // ──────────────────────────────────────────────────────────
  show(device) {
    this.device = device;
    this._emptyEl.classList.add('hidden');
    this._deviceEl.classList.remove('hidden');

    // Header
    document.getElementById('panel-device-type').textContent = device.type.toUpperCase();
    document.getElementById('panel-hostname').value = device.hostname;

    // Populate model select dropdown
    const modelSelect = document.getElementById('panel-model-select');
    if (modelSelect) {
      import('../network/DeviceModels.js').then(({ getModelsByFamily }) => {
        const familyModels = getModelsByFamily(device.type);
        modelSelect.innerHTML = familyModels.map(m =>
          `<option value="${m.id}" ${m.id === device.model ? 'selected' : ''}>${m.name}</option>`
        ).join('');
      });

      modelSelect.onchange = (e) => {
        const newModel = e.target.value;
        if (newModel && newModel !== device.model) {
          device.model = newModel;
          import('../network/DeviceModels.js').then(({ getModelSpec }) => {
            const spec = getModelSpec(newModel);
            if (spec && spec.interfaces) {
              import('../network/Device.js').then(({ Interface }) => {
                device.interfaces = spec.interfaces.map(i => new Interface(i));
                this._renderInterfacesTab();
                eventBus.emit('topology:changed');
                eventBus.emit('canvas:markDirty');
              });
            }
          });
        }
      };
    }

    // Draw icon in panel header
    const iconCanvas = document.getElementById('panel-device-icon');
    if (iconCanvas) {
      import('./DeviceRenderer.js').then(({ DeviceRenderer }) => {
        new DeviceRenderer().drawPreview(iconCanvas, device.type);
      });
    }

    // Reset to interfaces tab
    document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelector('.panel-tab[data-tab="interfaces"]')?.classList.add('active');
    document.getElementById('tab-interfaces')?.classList.remove('hidden');

    this._renderInterfacesTab();
    this._renderRoutingTab();
    this._renderVlanTab();
  }

  hide() {
    this.device = null;
    this._emptyEl.classList.remove('hidden');
    this._deviceEl.classList.add('hidden');
  }

  // ──────────────────────────────────────────────────────────
  //  Interfaces tab
  // ──────────────────────────────────────────────────────────
  _renderInterfacesTab() {
    if (!this.device) return;
    const list = document.getElementById('interfaces-list');
    list.innerHTML = '';

    // Render Model Specifications & Functions card
    import('../network/DeviceModels.js').then(({ getModelSpec }) => {
      const spec = getModelSpec(this.device.model);
      if (spec) {
        const specBox = document.createElement('div');
        specBox.className = 'model-spec-card';
        specBox.style.cssText = `
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 12px;
          font-size: 11px;
        `;
        specBox.innerHTML = `
          <div style="color:#00d4ff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">
            ${spec.category || 'Device Model'} ${spec.series ? '· ' + spec.series : ''}
          </div>
          <div style="color:#e0eaf8; font-weight:700; font-size:12px; margin-bottom:6px;">
            ${spec.name}
          </div>
          ${spec.functions ? `
          <div style="color:#b0c4de; font-size:11px; line-height:1.4; margin-bottom:6px;">
            <strong style="color:#00d4ff;">Functions & Capabilities:</strong> ${spec.functions}
          </div>` : ''}
          ${spec.slots ? `
          <div style="color:#00ff88; font-size:10px; line-height:1.3;">
            <strong>Expansion Slots & Ports:</strong> ${spec.slots}
          </div>` : ''}
        `;
        list.prepend(specBox);
      }
    });

    for (const iface of this.device.interfaces) {
      const row = document.createElement('div');
      row.className = 'iface-row';
      row.innerHTML = `
        <div class="iface-name">
          <span class="iface-status ${iface.status === 'up' ? 'up' : ''}"></span>
          ${iface.name}
          <span style="font-size:10px; color:#88aacc; margin-left:6px;">(${iface.speed} Mbps / ${iface.duplex})</span>
        </div>
        <div class="iface-field">
          <span class="iface-label">IP Address</span>
          <input class="iface-input" data-iface="${iface.name}" data-field="ipAddress"
                 type="text" value="${iface.ipAddress}" placeholder="e.g. 192.168.1.1"/>
        </div>
        <div class="iface-field">
          <span class="iface-label">Subnet Mask</span>
          <input class="iface-input" data-iface="${iface.name}" data-field="subnetMask"
                 type="text" value="${iface.subnetMask}" placeholder="e.g. 255.255.255.0"/>
        </div>
        ${this.device.type === 'pc' || this.device.type === 'server' ? `
        <div class="iface-field">
          <span class="iface-label">Gateway</span>
          <input class="iface-input" data-iface="${iface.name}" data-field="gateway"
                 type="text" value="${this.device.defaultGateway || ''}" placeholder="e.g. 192.168.1.1"/>
        </div>` : ''}
        <div class="iface-field" style="margin-top:4px;">
          <label style="font-size:11px; color:#a0bcd0; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" class="iface-mdix-check" data-iface="${iface.name}" ${iface.autoMdix ? 'checked' : ''}/>
            Auto-MDIX Enabled
          </label>
        </div>
        <div class="iface-shutdown-row">
          <input type="checkbox" id="shut-${iface.name.replace(/\//g,'-')}" class="iface-checkbox"
                 ${iface.status === 'down' ? 'checked' : ''}/>
          <label for="shut-${iface.name.replace(/\//g,'-')}" class="iface-shutdown-label">Shutdown</label>
        </div>`;
      list.appendChild(row);
    }
  }

  _applyInterfaces() {
    if (!this.device) return;
    const errors = [];

    // Read all input values
    document.querySelectorAll('.iface-input[data-iface]').forEach(input => {
      const ifaceName = input.dataset.iface;
      const field     = input.dataset.field;
      const val       = input.value.trim();
      const iface     = this.device.interfaces.find(i => i.name === ifaceName);
      if (!iface) return;

      if (field === 'ipAddress')   iface.ipAddress   = val;
      if (field === 'subnetMask')  iface.subnetMask  = val;
      if (field === 'gateway' && (this.device.type === 'pc' || this.device.type === 'server')) {
        this.device.defaultGateway = val;
      }
    });

    // Auto-MDIX checkboxes
    document.querySelectorAll('.iface-mdix-check[data-iface]').forEach(cb => {
      const ifaceName = cb.dataset.iface;
      const iface = this.device.interfaces.find(i => i.name === ifaceName);
      if (iface) iface.autoMdix = cb.checked;
    });

    // Shutdown checkboxes
    document.querySelectorAll('.iface-checkbox').forEach(cb => {
      const id     = cb.id.replace('shut-', '').replace(/-/g, '/');
      const iface  = this.device.interfaces.find(i => i.name === id || i.name.replace(/\//g,'-') === cb.id.replace('shut-',''));
      if (iface) iface.status = cb.checked ? 'down' : 'up';
    });

    // Validate IPs
    for (const iface of this.device.interfaces) {
      if (!iface.ipAddress) continue;
      const { errors: errs } = SubnetValidator.validateInterface(this.device, iface, this.sim.devices);
      errors.push(...errs);
    }

    if (errors.length > 0) {
      alert('⚠️ Configuration issues:\n\n' + errors.join('\n'));
      return;
    }

    // Update connected routes on routers
    if (this.device.routingTable) {
      import('../network/NetworkSimulator.js').then(({ NetworkSimulator }) => {
        this.sim.updateConnectedRoutes(this.device);
      });
      this.sim.updateConnectedRoutes(this.device);
    }

    // Re-render
    this._renderInterfacesTab();
    this._renderRoutingTab();
    eventBus.emit('topology:changed');
    eventBus.emit('canvas:markDirty');
    this.sim.updateConnectedRoutes && this.sim.updateConnectedRoutes(this.device);
  }

  // ──────────────────────────────────────────────────────────
  //  Routing tab
  // ──────────────────────────────────────────────────────────
  _renderRoutingTab() {
    const list = document.getElementById('routing-table-list');
    if (!list || !this.device) return;
    list.innerHTML = '';

    if (!this.device.routingTable) {
      list.innerHTML = '<div class="panel-note">No routing table (not a router).</div>';
      return;
    }

    const routes = this.device.routingTable.routes;
    if (routes.length === 0) {
      list.innerHTML = '<div class="panel-note">Empty routing table.</div>';
      return;
    }

    for (const route of routes) {
      const prefix = SC.maskToCidr(route.mask);
      const entry  = document.createElement('div');
      entry.className = 'route-entry';
      entry.innerHTML = `
        <span class="route-type ${route.type}">${route.type}</span>
        <span class="route-network">${route.network}/${prefix}</span>
        <span class="route-nexthop">via ${route.nextHop}</span>
        ${route.type === 'S' ? `<button class="route-del" data-net="${route.network}" data-mask="${route.mask}">✕</button>` : ''}`;
      list.appendChild(entry);
    }

    list.querySelectorAll('.route-del').forEach(btn => {
      btn.addEventListener('click', () => {
        removeStaticRoute(this.device.routingTable, btn.dataset.net, btn.dataset.mask);
        this._renderRoutingTab();
        eventBus.emit('topology:changed');
      });
    });

    // Set protocol selector
    const sel = document.getElementById('routing-protocol');
    if (sel) sel.value = this.device.routingProtocol || this.device.config?.routingProtocol || 'none';
  }

  _addRoute() {
    if (!this.device?.routingTable) {
      alert('Select a router first.'); return;
    }
    const network  = document.getElementById('route-network').value.trim();
    const mask     = document.getElementById('route-mask').value.trim();
    const nextHop  = document.getElementById('route-nexthop').value.trim();

    const result = addStaticRoute(this.device.routingTable, network, mask, nextHop);
    if (!result.success) { alert('❌ ' + result.error); return; }

    // Clear inputs
    ['route-network','route-mask','route-nexthop'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    this._renderRoutingTab();
    eventBus.emit('topology:changed');
  }

  // ──────────────────────────────────────────────────────────
  //  VLAN tab
  // ──────────────────────────────────────────────────────────
  _renderVlanTab() {
    const container = document.getElementById('vlan-content');
    if (!container || !this.device) return;

    if (this.device.type !== 'switch' && this.device.type !== 'l3switch') {
      container.innerHTML = '<p class="panel-note">VLANs apply to switches only.</p>';
      return;
    }

    const vlans = this.device.vlans || [];
    container.innerHTML = `
      <div class="section-label">VLANs</div>
      ${vlans.map(v => `
        <div class="route-entry">
          <span class="route-type" style="color:var(--cyan)">${v.id}</span>
          <span class="route-network">${v.name}</span>
        </div>`).join('')}
      <div class="route-form" style="margin-top:8px">
        <input id="vlan-id-input"   type="number" min="1" max="4094" class="route-input" placeholder="VLAN ID (1-4094)"/>
        <input id="vlan-name-input" type="text" class="route-input" placeholder="Name (e.g. Sales)"/>
        <button id="btn-add-vlan" class="apply-btn">Add VLAN</button>
      </div>
      <div class="section-label" style="margin-top:12px">Port Config</div>
      ${this.device.interfaces.map(i => `
        <div class="iface-row">
          <div class="iface-name">
            <span class="iface-status ${i.status==='up'?'up':''}"></span>
            ${i.shortName}
          </div>
          <div class="iface-field">
            <span class="iface-label">Mode</span>
            <select class="route-select vlan-mode-sel" data-iface="${i.name}">
              <option value="access" ${!i.trunkMode?'selected':''}>Access</option>
              <option value="trunk"  ${i.trunkMode?'selected':''}>Trunk</option>
            </select>
          </div>
          <div class="iface-field">
            <span class="iface-label">VLAN</span>
            <input class="iface-input vlan-id-sel" data-iface="${i.name}"
                   type="number" value="${i.vlanId||1}" min="1" max="4094" ${i.trunkMode?'disabled':''}/>
          </div>
        </div>`).join('')}
      <button id="btn-apply-vlans" class="apply-btn">Apply VLAN Config</button>`;

    document.getElementById('btn-add-vlan')?.addEventListener('click', () => {
      const id   = parseInt(document.getElementById('vlan-id-input').value);
      const name = document.getElementById('vlan-name-input').value.trim() || `VLAN${id}`;
      if (!id || id < 1 || id > 4094) { alert('Invalid VLAN ID (1-4094)'); return; }
      if (!this.device.vlans.find(v => v.id === id)) {
        this.device.vlans.push({ id, name });
        this._renderVlanTab();
        eventBus.emit('topology:changed');
      }
    });

    document.getElementById('btn-apply-vlans')?.addEventListener('click', () => {
      document.querySelectorAll('.vlan-mode-sel').forEach(sel => {
        const iface = this.device.interfaces.find(i => i.name === sel.dataset.iface);
        if (iface) iface.trunkMode = sel.value === 'trunk';
      });
      document.querySelectorAll('.vlan-id-sel').forEach(inp => {
        const iface = this.device.interfaces.find(i => i.name === inp.dataset.iface);
        if (iface && !iface.trunkMode) iface.vlanId = parseInt(inp.value) || 1;
      });
      this._renderVlanTab();
      eventBus.emit('topology:changed');
    });
  }

  // ──────────────────────────────────────────────────────────
  //  DHCP pool
  // ──────────────────────────────────────────────────────────
  _applyDhcp() {
    if (!this.device) return;
    const pool = {
      network: document.getElementById('dhcp-network')?.value.trim(),
      start:   document.getElementById('dhcp-start')?.value.trim(),
      end:     document.getElementById('dhcp-end')?.value.trim(),
      mask:    document.getElementById('dhcp-mask')?.value.trim(),
      dns:     document.getElementById('dhcp-dns')?.value.trim(),
    };
    if (!pool.network || !SC.isValidIp(pool.network)) { alert('Invalid DHCP network.'); return; }
    if (!this.device.dhcpPools) this.device.dhcpPools = [];
    this.device.dhcpPools.push(pool);
    eventBus.emit('topology:changed');
    alert(`✓ DHCP pool added: ${pool.network} (${pool.start} – ${pool.end})`);
  }
}
