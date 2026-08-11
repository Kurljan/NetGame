// src/network/AccessPoint.js
import { Device, Interface } from './Device.js';
import { getModelSpec } from './DeviceModels.js';

export class AccessPoint extends Device {
  constructor(opts = {}) {
    super(opts.type || 'ap', opts);
    this.ssid         = opts.config?.ssid         || 'NetGame-WiFi';
    this.password     = opts.config?.password     || '';
    this.security     = opts.config?.security     || 'WPA2';   // 'open'|'WPA'|'WPA2'
    this.band         = opts.config?.band         || '2.4GHz'; // '2.4GHz'|'5GHz'|'Dual-Band'
    this.channel      = opts.config?.channel      || 6;
    this.isLightweight= opts.config?.isLightweight|| (this.model && (this.model.includes('LAP') || this.model.includes('3702')));
    this.controllerIp = opts.config?.controllerIp || '';       // Cisco WLC IP
    this.clients      = [];                                    // connected wireless clients

    if (this.interfaces.length === 0) {
      const spec = getModelSpec(this.model);
      if (spec && spec.interfaces) {
        this.interfaces = spec.interfaces.map(i => new Interface({ ...i, status: 'down' }));
      } else {
        this.interfaces = [
          new Interface({ name: 'Port0', shortName: 'G0', status: 'down', description: 'Wired uplink' }),
          new Interface({ name: 'Port1', shortName: 'WiFi', status: 'down', description: 'Wireless Radio' }),
        ];
      }
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: {
        ssid: this.ssid,
        password: this.password,
        security: this.security,
        band: this.band,
        channel: this.channel,
        isLightweight: this.isLightweight,
        controllerIp: this.controllerIp,
      },
    };
  }
}
Device.registerType('ap', AccessPoint);

export class LightweightAccessPoint extends AccessPoint {
  constructor(opts = {}) {
    super({
      ...opts,
      type: 'lap',
      model: opts.model || 'LAP-PT',
      config: { ...opts.config, isLightweight: true }
    });
  }
}
Device.registerType('lap', LightweightAccessPoint);

