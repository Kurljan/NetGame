// src/subnetting/SubnetValidator.js
// Validates player subnet assignments against level requirements.

import { SubnetCalculator as SC } from './SubnetCalculator.js';

export class SubnetValidator {
  /**
   * Check that a device's interface has a valid, non-conflicting IP.
   * @param {import('../network/Device.js').Device} device
   * @param {import('../network/Device.js').Interface} iface
   * @param {Map<string, import('../network/Device.js').Device>} allDevices
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validateInterface(device, iface, allDevices) {
    const errors = [];

    if (!iface.ipAddress) return { valid: true, errors };  // unconfigured is OK

    if (!SC.isValidIp(iface.ipAddress)) {
      errors.push(`${iface.shortName}: "${iface.ipAddress}" is not a valid IP address.`);
    }
    if (!SC.isValidMask(iface.subnetMask)) {
      errors.push(`${iface.shortName}: "${iface.subnetMask}" is not a valid subnet mask.`);
    }
    if (errors.length) return { valid: false, errors };

    const network   = SC.getNetworkAddress(iface.ipAddress, iface.subnetMask);
    const broadcast = SC.getBroadcastAddress(iface.ipAddress, iface.subnetMask);

    if (iface.ipAddress === network) {
      errors.push(`${iface.shortName}: ${iface.ipAddress} is the network address — cannot assign to a host.`);
    }
    if (iface.ipAddress === broadcast) {
      errors.push(`${iface.shortName}: ${iface.ipAddress} is the broadcast address — cannot assign to a host.`);
    }

    // Check for duplicate IPs
    for (const other of allDevices.values()) {
      if (other.id === device.id) continue;
      for (const oi of (other.interfaces || [])) {
        if (oi.ipAddress && oi.ipAddress === iface.ipAddress) {
          errors.push(`${iface.shortName}: IP ${iface.ipAddress} is already used by ${other.hostname} (${oi.shortName}).`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate that two devices are on the same subnet (for direct connectivity).
   */
  static sameSubnet(ip1, mask1, ip2, mask2) {
    if (!SC.isValidIp(ip1) || !SC.isValidIp(ip2)) return false;
    // Use the more specific mask
    const mask = SC.maskToCidr(mask1) >= SC.maskToCidr(mask2) ? mask1 : mask2;
    return SC.isSameSubnet(ip1, ip2, mask);
  }

  /**
   * Validate an entire level topology against its requirements.
   * @param {Object[]} requirements — from level JSON
   * @param {Map} devices
   * @param {Map} links
   * @param {import('../network/NetworkSimulator.js').NetworkSimulator} sim
   * @returns {Object[]} results — [{id, desc, pass, message}]
   */
  static validateLevel(requirements, devices, links, sim) {
    return requirements.map(req => {
      try {
        switch (req.type) {
          case 'ping': return this._checkPing(req, sim);
          case 'subnet': return this._checkSubnet(req, devices);
          case 'route-exists': return this._checkRouteExists(req, devices);
          case 'vlan': return this._checkVlan(req, devices);
          default: return { id: req.id, desc: req.desc, pass: false, message: 'Unknown requirement type.' };
        }
      } catch (e) {
        return { id: req.id, desc: req.desc, pass: false, message: e.message };
      }
    });
  }

  static _checkPing(req, sim) {
    const result = sim.simulate(req.srcDeviceId, req.dstIp);
    return {
      id: req.id,
      desc: req.desc,
      pass: result.success,
      message: result.success ? '✓ Ping successful' : `✗ ${result.error}`,
    };
  }

  static _checkSubnet(req, devices) {
    const device = [...devices.values()].find(d => d.hostname === req.hostname || d.id === req.deviceId);
    if (!device) return { id: req.id, desc: req.desc, pass: false, message: `Device "${req.hostname}" not found.` };
    const iface  = device.interfaces.find(i => i.name === req.interface || i.shortName === req.interface);
    if (!iface) return { id: req.id, desc: req.desc, pass: false, message: `Interface "${req.interface}" not found.` };

    const net = SC.getNetworkAddress(iface.ipAddress, iface.subnetMask);
    const pass = net === req.expectedNetwork && iface.subnetMask === req.expectedMask;
    return {
      id: req.id, desc: req.desc, pass,
      message: pass
        ? `✓ ${iface.shortName} is in the correct subnet.`
        : `✗ Expected ${req.expectedNetwork}/${SC.maskToCidr(req.expectedMask)}, got ${net}/${SC.maskToCidr(iface.subnetMask)}.`,
    };
  }

  static _checkRouteExists(req, devices) {
    const device = [...devices.values()].find(d => d.hostname === req.hostname || d.id === req.deviceId);
    if (!device?.routingTable) return { id: req.id, desc: req.desc, pass: false, message: 'Router not found.' };
    const route = device.routingTable.routes.find(r =>
      SC.getNetworkAddress(r.network, r.mask) === SC.getNetworkAddress(req.network, req.mask)
    );
    const pass = !!route;
    return {
      id: req.id, desc: req.desc, pass,
      message: pass ? `✓ Route to ${req.network} exists.` : `✗ ${req.hostname} has no route to ${req.network}.`,
    };
  }

  static _checkVlan(req, devices) {
    const device = [...devices.values()].find(d => d.hostname === req.hostname || d.id === req.deviceId);
    if (!device?.vlans) return { id: req.id, desc: req.desc, pass: false, message: 'Switch not found.' };
    const vlan = device.vlans.find(v => v.id === req.vlanId);
    const pass  = !!vlan;
    return {
      id: req.id, desc: req.desc, pass,
      message: pass ? `✓ VLAN ${req.vlanId} exists on ${device.hostname}.` : `✗ VLAN ${req.vlanId} not configured.`,
    };
  }
}
