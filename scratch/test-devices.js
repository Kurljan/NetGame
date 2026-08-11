import { DEVICE_MODELS, getModelSpec, getModelsByFamily } from '../src/network/DeviceModels.js';
import { Device } from '../src/network/Device.js';
import { AccessPoint, LightweightAccessPoint } from '../src/network/AccessPoint.js';
import { WirelessRouter, HomeGateway, WLC } from '../src/network/WirelessRouter.js';
import { Server, CentralOfficeServer } from '../src/network/Server.js';
import { Firewall, SecurityAppliance } from '../src/network/Firewall.js';
import { CellTower } from '../src/network/Modem.js';

console.log('--- Testing Device Models Registry ---');
const testModels = [
  'Meraki-MX65W',
  'HomeRouter-PT-AC',
  'AccessPoint-PT-N',
  'Central-Office-Server',
  'LAP-PT',
  'AccessPoint-PT',
  'WRT300N',
  '3702i',
  'Cell-Tower',
  'DLC100',
  'AccessPoint-PT-A',
  'AccessPoint-PT-AC',
  'WLC-PT',
  'WLC-3504',
  'WLC-2504'
];

let allPassed = true;
testModels.forEach(modelId => {
  const spec = getModelSpec(modelId);
  if (!spec) {
    console.error(`FAIL: Model spec missing for ${modelId}`);
    allPassed = false;
  } else {
    console.log(`PASS: ${modelId} -> ${spec.name} (${spec.family}, ${spec.interfaces.length} ifaces)`);
  }
});

console.log('\n--- Testing Device Instantiation & Hostname Defaults ---');
const instantiations = [
  new SecurityAppliance({ id: 'securityappliance-1', model: 'Meraki-MX65W' }),
  new WirelessRouter({ id: 'wirelessrouter-1', model: 'HomeRouter-PT-AC' }),
  new AccessPoint({ id: 'ap-4', model: 'AccessPoint-PT-N' }),
  new CentralOfficeServer({ id: 'coserver-1', model: 'Central-Office-Server' }),
  new LightweightAccessPoint({ id: 'lap-1', model: 'LAP-PT' }),
  new AccessPoint({ id: 'ap-1', model: 'AccessPoint-PT' }),
  new WirelessRouter({ id: 'wirelessrouter-2', model: 'WRT300N' }),
  new LightweightAccessPoint({ id: 'lap-2', model: '3702i' }),
  new CellTower({ id: 'celltower-1', model: 'Cell-Tower' }),
  new HomeGateway({ id: 'homegateway-1', model: 'DLC100' }),
  new AccessPoint({ id: 'ap-2', model: 'AccessPoint-PT-A' }),
  new AccessPoint({ id: 'ap-3', model: 'AccessPoint-PT-AC' }),
  new WLC({ id: 'wlc-1', model: 'WLC-PT' }),
  new WLC({ id: 'wlc-2', model: 'WLC-3504' }),
  new WLC({ id: 'wlc-3', model: 'WLC-2504' }),
];

instantiations.forEach(dev => {
  console.log(`Device: ${dev.model} | Type: ${dev.type} | Hostname: "${dev.hostname}" | Interfaces: ${dev.interfaces.length}`);
  if (dev.interfaces.length === 0) {
    console.error(`FAIL: Device ${dev.model} has 0 interfaces!`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n>>> ALL 15 DEVICES VERIFIED SUCCESSFULLY! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
