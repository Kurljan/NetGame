// src/network/AccessPoint.js
import { Device, Interface } from './Device.js';

export class AccessPoint extends Device {
  constructor(opts = {}) {
    super('ap', opts);
    this.ssid       = opts.config?.ssid     || 'NetGame-WiFi';
    this.password   = opts.config?.password || '';
    this.security   = opts.config?.security || 'WPA2';   // 'open'|'WPA'|'WPA2'
    this.band       = opts.config?.band     || '2.4GHz'; // '2.4GHz'|'5GHz'
    this.channel    = opts.config?.channel  || 6;
    this.clients    = [];   // connected wireless clients

    if (this.interfaces.length === 0) {
      this.interfaces = [
        new Interface({ name: 'GigabitEthernet0', shortName: 'G0', status: 'down', description: 'Wired uplink' }),
        new Interface({ name: 'Dot11Radio0',       shortName: 'WiFi', status: 'down', description: 'Wireless' }),
      ];
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
      },
    };
  }
}
Device.registerType('ap', AccessPoint);
