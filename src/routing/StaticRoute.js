// src/routing/StaticRoute.js
// Utility for adding/removing static routes (Phase 1 routing method)

import { SubnetCalculator as SC } from '../subnetting/SubnetCalculator.js';

/**
 * Add a static route to a router's routing table.
 * Validates inputs before adding.
 *
 * @param {import('./RoutingTable.js').RoutingTable} routingTable
 * @param {string} network
 * @param {string} mask
 * @param {string} nextHop
 * @returns {{ success: boolean, error?: string }}
 */
export function addStaticRoute(routingTable, network, mask, nextHop) {
  if (!SC.isValidIp(network))  return { success: false, error: `Invalid network address: ${network}` };
  if (!SC.isValidMask(mask))   return { success: false, error: `Invalid subnet mask: ${mask}` };
  if (!SC.isValidIp(nextHop))  return { success: false, error: `Invalid next-hop IP: ${nextHop}` };

  routingTable.addStatic(network, mask, nextHop);
  return { success: true };
}

/**
 * Remove a static route.
 */
export function removeStaticRoute(routingTable, network, mask) {
  routingTable.removeRoute(network, mask);
  return { success: true };
}
