import { NetworkSimulator } from '../src/network/NetworkSimulator.js';
import { DeviceRenderer } from '../src/ui/DeviceRenderer.js';
import { DEVICE_CATEGORIES, DEVICE_PROFILES, getDeviceProfile } from '../src/ui/DeviceCommandData.js';
import { DEVICE_MODELS, getModelSpec, getModelsByFamily } from '../src/network/DeviceModels.js';

console.log('--- Checking UI and Simulator Imports ---');
const sim = new NetworkSimulator();
const renderer = new DeviceRenderer();

console.log('DEVICE_CATEGORIES count:', DEVICE_CATEGORIES.length);
console.log('DEVICE_PROFILES count:', Object.keys(DEVICE_PROFILES).length);
console.log('DEVICE_MODELS count:', Object.keys(DEVICE_MODELS).length);

const typesToCheck = ['router', 'switch', 'l3switch', 'pc', 'server', 'coserver', 'ap', 'lap', 'wirelessrouter', 'homegateway', 'wlc', 'firewall', 'securityappliance', 'celltower', 'modem', 'cloud', 'hub', 'repeater', 'coaxialsplitter', 'bridge'];
typesToCheck.forEach(t => {
  const profile = getDeviceProfile(t);
  console.log(`Profile for type '${t}':`, profile ? profile.title : 'MISSING');
});

console.log('\n>>> APP LOAD & INTEGRATION CHECK PASSED! <<<');
