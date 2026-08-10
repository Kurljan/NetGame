import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';
import { IPv6Calculator } from '../subnetting/IPv6Calculator.js';
import { Packet } from './Packet.js';
import { Link }   from './Link.js';
import './Hub.js';
import './Repeater.js';
import './CoAxialSplitter.js';
import './Bridge.js';
import './Firewall.js';
import './WirelessRouter.js';
import './Modem.js';

export class NetworkSimulator {
  constructor() {
    /** @type {Map<string, import('./Device.js').Device>} */
    this.devices = new Map();
    /** @type {Map<string, Link>} */
    this.links   = new Map();
  }

  // ──────────────────────────────────────────────────────────
  //  Device management
  // ──────────────────────────────────────────────────────────
  addDevice(device) {
    this.devices.set(device.id, device);
    return device;
  }

  removeDevice(id) {
    // Remove all connected links first
    for (const [lid, link] of this.links) {
      if (link.sourceDeviceId === id || link.destDeviceId === id) {
        this.links.delete(lid);
      }
    }
    this.devices.delete(id);
  }

  getDevice(id) { return this.devices.get(id) || null; }

  // ──────────────────────────────────────────────────────────
  //  Link management & Auto-MDIX Validation
  // ──────────────────────────────────────────────────────────
  addLink(link) {
    this.links.set(link.id, link);

    // Auto-bring-up the interfaces involved and validate MDIX / cable
    const src = this.devices.get(link.sourceDeviceId);
    const dst = this.devices.get(link.destDeviceId);
    const srcIface = src?.interfaces.find(i => i.name === link.sourceInterface || i.shortName === link.sourceInterface);
    const dstIface = dst?.interfaces.find(i => i.name === link.destInterface || i.shortName === link.destInterface);

    let isMdixOk = true;

    // Auto-MDIX check: Same layer devices (switch-switch, router-router, host-host) with straight cable require MDIX
    if (src && dst && link.cableType === 'straight') {
      const sameLayer = (src.type === dst.type) ||
                        (src.type === 'router' && dst.type === 'pc') ||
                        (src.type === 'pc' && dst.type === 'router');
      if (sameLayer) {
        const hasMdix = (srcIface?.autoMdix ?? true) || (dstIface?.autoMdix ?? true);
        if (!hasMdix) {
          isMdixOk = false;
        }
      }
    }

    if (srcIface) {
      srcIface.status = isMdixOk ? 'up' : 'down';
      srcIface.ledStatus = isMdixOk ? 'green' : 'amber';
      srcIface.connectedTo = link.id;
    }
    if (dstIface) {
      dstIface.status = isMdixOk ? 'up' : 'down';
      dstIface.ledStatus = isMdixOk ? 'green' : 'amber';
      dstIface.connectedTo = link.id;
    }

    link.status = isMdixOk ? 'up' : 'mdix-error';
    return link;
  }

  removeLink(id) { this.links.delete(id); }

  /** Returns all links connected to a device. */
  linksOf(deviceId) {
    return [...this.links.values()].filter(
      l => l.sourceDeviceId === deviceId || l.destDeviceId === deviceId
    );
  }

  /** Returns neighbor device IDs (and the link) for a given device. */
  neighbors(deviceId) {
    return this.linksOf(deviceId).map(link => ({
      deviceId: link.other(deviceId),
      link,
    }));
  }

  // ──────────────────────────────────────────────────────────
  //  "Connected" routing table — auto-populate from interfaces
  // ──────────────────────────────────────────────────────────
  /**
   * For a router, add connected routes (type C) for each interface
   * that has an IP address. Called whenever an interface IP changes.
   */
  updateConnectedRoutes(router) {
    if (!router.routingTable) return;
    // Remove old C routes
    router.routingTable.routes = router.routingTable.routes.filter(r => r.type !== 'C');

    for (const iface of router.interfaces) {
      if (!iface.hasIp || iface.status !== 'up') continue;
      const network = SC.getNetworkAddress(iface.ipAddress, iface.subnetMask);
      router.routingTable.addConnectedRoute(network, iface.subnetMask, iface.name);
    }
  }

  // ──────────────────────────────────────────────────────────
  //  MAIN: Simulate sending a packet
  // ──────────────────────────────────────────────────────────
  /**
   * Simulates sending an ICMP / ICMPv6 ping from srcDevice to dstIp.
   * Returns a Packet object with the path and result filled in.
   *
   * @param {string} srcDeviceId
   * @param {string} dstIp
   * @param {string} [protocol='ICMP']
   * @returns {{ packet: Packet, pathDeviceIds: string[], success: boolean, error: string }}
   */
  simulate(srcDeviceId, dstIp, protocol = 'ICMP') {
    const srcDevice = this.devices.get(srcDeviceId);
    if (!srcDevice) return { success: false, error: 'Source device not found.' };

    const isIPv6 = IPv6Calculator.isValidIPv6(dstIp);

    // ── IPv6 simulation ──────────────────────────────────────
    if (isIPv6) {
      const srcIface = srcDevice.interfaces.find(i => i.status === 'up' && (i.ipv6Address || i.ipv6LinkLocal));
      if (!srcIface) {
        return { success: false, error: `${srcDevice.hostname} has no configured IPv6 address.` };
      }

      const pkt = new Packet({
        protocol: 'ICMPv6',
        srcIp: srcIface.ipv6Address || srcIface.ipv6LinkLocal,
        dstIp,
        srcMac: srcIface.macAddress,
        dstMac: 'FF:FF:FF:FF:FF:FF',
        srcDeviceId,
      });

      const dstDevice = this._findDeviceByIPv6(dstIp);
      const sameSubnet = (srcIface.ipv6Address && IPv6Calculator.isSameSubnet(srcIface.ipv6Address, dstIp, srcIface.ipv6Prefix || 64)) ||
                         dstIp.toLowerCase().startsWith('fe80:');

      if (sameSubnet) {
        return this._directDelivery(pkt, srcDevice, dstDevice, dstIp);
      }

      // Routed IPv6 delivery
      return this._routedDeliveryIPv6(pkt, srcDevice, dstDevice, dstIp);
    }

    // ── Standard IPv4 simulation ─────────────────────────────
    const srcIface = srcDevice.interfaces.find(i => i.status === 'up' && i.ipAddress);
    if (!srcIface) {
      return { success: false, error: `${srcDevice.hostname} has no configured IP address. (interface is down or unconfigured)` };
    }

    // Build packet
    const pkt = new Packet({
      protocol,
      srcIp: srcIface.ipAddress,
      dstIp,
      srcMac: srcIface.macAddress,
      dstMac: 'FF:FF:FF:FF:FF:FF',
      srcDeviceId,
    });

    // Find which device owns dstIp
    const dstDevice = this._findDeviceByIp(dstIp);

    // If src and dst are on same subnet → direct delivery
    if (SC.isSameSubnet(srcIface.ipAddress, dstIp, srcIface.subnetMask)) {
      return this._directDelivery(pkt, srcDevice, dstDevice, dstIp);
    }

    // Otherwise: needs routing (go to default gateway)
    return this._routedDelivery(pkt, srcDevice, dstDevice, dstIp);
  }

  _routedDeliveryIPv6(pkt, srcDevice, dstDevice, dstIp) {
    const gw = srcDevice.config?.defaultGatewayIPv6 || srcDevice.interfaces.find(i => i.ipv6Gateway)?.ipv6Gateway || '';
    if (!gw) {
      pkt._result = 'failure';
      pkt._errorReason = `${srcDevice.hostname} has no IPv6 default gateway configured.`;
      return { packet: pkt, pathDeviceIds: [srcDevice.id], success: false, error: pkt._errorReason };
    }

    const gwDevice = this._findDeviceByIPv6(gw);
    if (!gwDevice) {
      pkt._result = 'failure';
      pkt._errorReason = `IPv6 Gateway ${gw} is not reachable.`;
      return { packet: pkt, pathDeviceIds: [srcDevice.id], success: false, error: pkt._errorReason };
    }

    const path = [srcDevice.id];
    const toGw = this._bfsPath(srcDevice.id, gwDevice.id);
    if (toGw) toGw.forEach(id => { if (!path.includes(id)) path.push(id); });

    if (dstDevice) {
      const fromGw = this._bfsPath(gwDevice.id, dstDevice.id);
      if (fromGw) fromGw.forEach(id => { if (!path.includes(id)) path.push(id); });
    }

    pkt._result = 'success';
    pkt._path = path;
    return { packet: pkt, pathDeviceIds: path, success: true };
  }

  // ──────────────────────────────────────────────────────────
  //  Direct delivery (same subnet)
  // ──────────────────────────────────────────────────────────
  _directDelivery(pkt, srcDevice, dstDevice, dstIp) {
    const path = [srcDevice.id];

    if (!dstDevice) {
      // BFS to find the destination
      const found = this._bfsToIp(srcDevice.id, dstIp);
      if (!found.success) {
        pkt._result = 'failure';
        pkt._errorReason = `Host ${dstIp} unreachable — not connected.`;
        return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
      }
      found.path.forEach(id => { if (!path.includes(id)) path.push(id); });
    } else {
      // BFS path between src and dst
      const found = this._bfsPath(srcDevice.id, dstDevice.id);
      if (found) found.forEach(id => { if (!path.includes(id)) path.push(id); });
    }

    pkt._result = 'success';
    pkt._path   = path;
    pkt.recordHop(srcDevice, 'send', { note: 'Same subnet — direct delivery' });
    return { packet: pkt, pathDeviceIds: path, success: true };
  }

  // ──────────────────────────────────────────────────────────
  //  Routed delivery (different subnet)
  // ──────────────────────────────────────────────────────────
  _routedDelivery(pkt, srcDevice, dstDevice, dstIp) {
    // Step 1: Check if srcDevice has a default gateway
    const gw = srcDevice.defaultGateway || srcDevice.config?.defaultGateway || '';
    if (!gw) {
      pkt._result      = 'failure';
      pkt._errorReason = `${srcDevice.hostname} has no default gateway configured.`;
      return { packet: pkt, pathDeviceIds: [srcDevice.id], success: false, error: pkt._errorReason };
    }

    // Step 2: Find the gateway device
    const gwDevice = this._findDeviceByIp(gw);
    if (!gwDevice) {
      pkt._result      = 'failure';
      pkt._errorReason = `Default gateway ${gw} is not reachable (no device has that IP).`;
      return { packet: pkt, pathDeviceIds: [srcDevice.id], success: false, error: pkt._errorReason };
    }

    // Step 3: Walk the routing path hop by hop
    const path    = [srcDevice.id];
    let   current = gwDevice;
    const visited = new Set([srcDevice.id]);
    let   hops    = 0;
    const maxHops = 20;

    // Add path from src to gwDevice via BFS (through switches etc.)
    const toGw = this._bfsPath(srcDevice.id, gwDevice.id);
    if (toGw) toGw.forEach(id => { if (!path.includes(id)) path.push(id); });

    while (hops++ < maxHops) {
      if (visited.has(current.id)) {
        pkt._result      = 'failure';
        pkt._errorReason = `Routing loop detected at ${current.hostname}.`;
        return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
      }
      visited.add(current.id);

      // Decrement TTL
      pkt.ttl--;
      if (pkt.ttl <= 0) {
        pkt._result      = 'failure';
        pkt._errorReason = `TTL expired at ${current.hostname}. Too many hops.`;
        return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
      }

      // Does this router have a directly-connected route to dstIp?
      const directIface = current.interfaces?.find(i =>
        i.status === 'up' && i.ipAddress &&
        SC.isSameSubnet(i.ipAddress, dstIp, i.subnetMask)
      );

      if (directIface) {
        // Found! Deliver to destination
        if (dstDevice) {
          const toDst = this._bfsPath(current.id, dstDevice.id);
          if (toDst) toDst.forEach(id => { if (!path.includes(id)) path.push(id); });
        }
        pkt._result = 'success';
        pkt._path   = path;
        return { packet: pkt, pathDeviceIds: path, success: true };
      }

      // Consult routing table
      if (!current.routingTable) {
        pkt._result      = 'failure';
        pkt._errorReason = `${current.hostname} has no routing table. Not a router.`;
        return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
      }

      const route = current.routingTable.longestPrefixMatch(dstIp);
      if (!route) {
        pkt._result      = 'failure';
        pkt._errorReason = `No route to host ${dstIp} on ${current.hostname}. Add a static route or enable a routing protocol.`;
        return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
      }

      // Follow next-hop
      const nextHopDevice = this._findDeviceByIp(route.nextHop);
      if (!nextHopDevice) {
        pkt._result      = 'failure';
        pkt._errorReason = `Next-hop ${route.nextHop} unreachable from ${current.hostname}.`;
        return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
      }

      const seg = this._bfsPath(current.id, nextHopDevice.id);
      if (seg) seg.forEach(id => { if (!path.includes(id)) path.push(id); });

      current = nextHopDevice;
    }

    pkt._result      = 'failure';
    pkt._errorReason = 'Max hops exceeded.';
    return { packet: pkt, pathDeviceIds: path, success: false, error: pkt._errorReason };
  }

  // ──────────────────────────────────────────────────────────
  //  Helpers
  // ──────────────────────────────────────────────────────────
  /** Find device that owns a given IP address (any interface). */
  _findDeviceByIp(ip) {
    for (const device of this.devices.values()) {
      if (device.interfaces?.some(i => i.ipAddress === ip)) return device;
    }
    return null;
  }

  _findDeviceByIPv6(ipv6) {
    if (!ipv6) return null;
    const clean = ipv6.toLowerCase().trim();
    for (const device of this.devices.values()) {
      for (const i of device.interfaces || []) {
        if (i.ipv6Address) {
          if (i.ipv6Address.toLowerCase() === clean) return device;
          try {
            if (IPv6Calculator.compress(i.ipv6Address) === IPv6Calculator.compress(clean)) return device;
            if (IPv6Calculator.expand(i.ipv6Address) === IPv6Calculator.expand(clean)) return device;
          } catch { }
        }
        if (i.ipv6LinkLocal) {
          if (i.ipv6LinkLocal.toLowerCase() === clean) return device;
          try {
            if (IPv6Calculator.compress(i.ipv6LinkLocal) === IPv6Calculator.compress(clean)) return device;
          } catch { }
        }
      }
    }
    return null;
  }

  /** BFS path between two devices (returns array of device IDs) */
  _bfsPath(startId, endId) {
    if (startId === endId) return [startId];
    const visited = new Set([startId]);
    const queue   = [{ id: startId, path: [startId] }];
    while (queue.length) {
      const { id, path } = queue.shift();
      for (const { deviceId } of this.neighbors(id)) {
        if (visited.has(deviceId)) continue;
        const newPath = [...path, deviceId];
        if (deviceId === endId) return newPath;
        visited.add(deviceId);
        queue.push({ id: deviceId, path: newPath });
      }
    }
    return null;
  }

  /** BFS to find ANY device with a given IP, returns path. */
  _bfsToIp(startId, ip) {
    const visited = new Set([startId]);
    const queue   = [{ id: startId, path: [startId] }];
    while (queue.length) {
      const { id, path } = queue.shift();
      const device = this.devices.get(id);
      if (device?.interfaces?.some(i => i.ipAddress === ip)) {
        return { success: true, path, device };
      }
      for (const { deviceId } of this.neighbors(id)) {
        if (!visited.has(deviceId)) {
          visited.add(deviceId);
          queue.push({ id: deviceId, path: [...path, deviceId] });
        }
      }
    }
    return { success: false, path: [] };
  }

  // ──────────────────────────────────────────────────────────
  //  Serialization
  // ──────────────────────────────────────────────────────────
  toJSON() {
    return {
      devices: [...this.devices.values()].map(d => d.toJSON()),
      links:   [...this.links.values()].map(l => l.toJSON()),
    };
  }

  loadJSON(data, deviceFactory) {
    this.devices.clear();
    this.links.clear();
    if (data.devices) data.devices.forEach(d => this.addDevice(deviceFactory(d)));
    if (data.links)   data.links.forEach(l => this.links.set(l.id, new Link(l)));
  }
}
