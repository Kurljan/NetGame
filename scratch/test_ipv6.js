// scratch/test_ipv6.js
// Automated test suite for IPv6 Calculator, Exercises, EUI-64, CLI, and Simulation.

import { IPv6Calculator } from '../src/subnetting/IPv6Calculator.js';
import { IPv6ExerciseManager } from '../src/subnetting/IPv6Exercises.js';
import { SubnetValidator } from '../src/subnetting/SubnetValidator.js';
import { NetworkSimulator } from '../src/network/NetworkSimulator.js';
import { Device, Interface } from '../src/network/Device.js';
import { PC } from '../src/network/PC.js';
import { Link } from '../src/network/Link.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 Running Comprehensive IPv6 Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

// ── Test 1: Expansion & RFC 5952 Compression ───────────────────
console.log('--- 1. IPv6 Address Expansion & Compression (RFC 5952) ---');
const exp1 = IPv6Calculator.expand('2001:db8:acad:1::1');
assert(exp1 === '2001:0db8:acad:0001:0000:0000:0000:0001', 'Expand 2001:db8:acad:1::1', exp1);

const comp1 = IPv6Calculator.compress('2001:0db8:acad:0001:0000:0000:0000:0001');
assert(comp1 === '2001:db8:acad:1::1', 'Compress full address to 2001:db8:acad:1::1', comp1);

const compLoopback = IPv6Calculator.compress('0000:0000:0000:0000:0000:0000:0000:0001');
assert(compLoopback === '::1', 'Compress loopback to ::1', compLoopback);

const compUnspecified = IPv6Calculator.compress('0000:0000:0000:0000:0000:0000:0000:0000');
assert(compUnspecified === '::', 'Compress all zeros to ::', compUnspecified);

const compTie = IPv6Calculator.compress('2001:0db8:0000:0000:0001:0000:0000:0001');
assert(compTie === '2001:db8::1:0:0:1', 'RFC 5952 Tie Break: compress first longest run of zeros', compTie);

// ── Test 2: Address Scope & Classification ────────────────────
console.log('\n--- 2. IPv6 Address Scope & Classification ---');
assert(IPv6Calculator.getAddressType('2001:db8:acad::1').type.includes('Global Unicast'), 'Classify 2001:db8 as GUA');
assert(IPv6Calculator.getAddressType('fe80::1').type === 'Link-Local (LLA)', 'Classify fe80::1 as Link-Local');
assert(IPv6Calculator.getAddressType('fc00::1').type === 'Unique Local (ULA)', 'Classify fc00::1 as Unique Local');
assert(IPv6Calculator.getAddressType('ff02::1').type === 'Multicast', 'Classify ff02::1 as Multicast');
assert(IPv6Calculator.getAddressType('::1').type === 'Loopback', 'Classify ::1 as Loopback');

// ── Test 3: EUI-64 Interface ID Generation ────────────────────
console.log('\n--- 3. EUI-64 Interface ID Generation ---');
const euiTest1 = IPv6Calculator.generateEUI64('AA:BB:CC:11:22:33', 'fe80::/64');
assert(euiTest1.interfaceId === 'a8bb:ccff:fe11:2233', 'EUI-64 interface ID bit 7 inverted for AABBCC112233', euiTest1.interfaceId);
assert(euiTest1.fullAddress === 'fe80::a8bb:ccff:fe11:2233', 'EUI-64 full link-local address', euiTest1.fullAddress);

const euiTest2 = IPv6Calculator.generateEUI64('00:11:22:33:44:55', '2001:db8:acad:1::/64');
assert(euiTest2.interfaceId === '0211:22ff:fe33:4455', 'EUI-64 with 00:11 -> 0211', euiTest2.interfaceId);

// ── Test 4: IPv6 /48 to /64 Subnetting ────────────────────────
console.log('\n--- 4. IPv6 Subnetting & /64 Allocation ---');
const v6Subnets = IPv6Calculator.calculateIPv6Subnets('2001:db8:acad::/48', [
  { name: 'Engineering', subnetIdHex: '0001' },
  { name: 'Sales', subnetIdHex: '0002' },
  { name: 'Server DMZ', subnetIdHex: '0010' }
]);
assert(v6Subnets.success === true, 'calculateIPv6Subnets returns success');
assert(v6Subnets.subnets[0].networkPrefix === '2001:db8:acad:1::/64', 'Subnet 1 prefix 2001:db8:acad:1::/64', v6Subnets.subnets[0].networkPrefix);
assert(v6Subnets.subnets[0].gateway === '2001:db8:acad:1::1', 'Subnet 1 gateway 2001:db8:acad:1::1', v6Subnets.subnets[0].gateway);
assert(v6Subnets.subnets[2].networkPrefix === '2001:db8:acad:10::/64', 'Subnet 3 prefix 2001:db8:acad:10::/64', v6Subnets.subnets[2].networkPrefix);

// ── Test 5: Table Validation & Grading ────────────────────────
console.log('\n--- 5. User Input Table Validation ---');
const userRowsCorrect = [
  { subnetIdHex: '0001', networkPrefix: '2001:db8:acad:1::/64', gateway: '2001:db8:acad:1::1' },
  { subnetIdHex: '0002', networkPrefix: '2001:db8:acad:2::/64', gateway: '2001:db8:acad:2::1' },
  { subnetIdHex: '0010', networkPrefix: '2001:db8:acad:10::/64', gateway: '2001:db8:acad:10::1' }
];
const valResult = IPv6Calculator.validateUserIPv6Table('2001:db8:acad::/48', [
  { name: 'Engineering', subnetIdHex: '0001' },
  { name: 'Sales', subnetIdHex: '0002' },
  { name: 'Server DMZ', subnetIdHex: '0010' }
], userRowsCorrect);
assert(valResult.allCorrect === true, 'Correct user input passes 100%');

const userRowsWrong = [
  { subnetIdHex: '9999', networkPrefix: '2001:db8:acad:1::/64', gateway: '2001:db8:acad:1::1' }
];
const valResultWrong = IPv6Calculator.validateUserIPv6Table('2001:db8:acad::/48', [
  { name: 'Engineering', subnetIdHex: '0001' }
], userRowsWrong);
assert(valResultWrong.allCorrect === false, 'Wrong subnet ID fails validation');

// ── Test 6: Network Simulation & ICMPv6 Ping ───────────────────
console.log('\n--- 6. Network Simulation & ICMPv6 Ping ---');
const sim = new NetworkSimulator();

const pc1 = new PC({ id: 'pc1', hostname: 'PC1' });
pc1.interfaces[0].ipv6Address = '2001:db8:acad:1::10';
pc1.interfaces[0].ipv6Prefix = 64;
pc1.interfaces[0].status = 'up';

const pc2 = new PC({ id: 'pc2', hostname: 'PC2' });
pc2.interfaces[0].ipv6Address = '2001:db8:acad:1::20';
pc2.interfaces[0].ipv6Prefix = 64;
pc2.interfaces[0].status = 'up';

sim.addDevice(pc1);
sim.addDevice(pc2);
sim.addLink(new Link({
  sourceDeviceId: 'pc1',
  sourceInterface: pc1.interfaces[0].name,
  destDeviceId: 'pc2',
  destInterface: pc2.interfaces[0].name,
  cableType: 'cross'
}));

const pingResult = sim.simulate('pc1', '2001:db8:acad:1::20');
assert(pingResult.success === true, 'Simulate ICMPv6 ping same subnet', pingResult.error);

// ── Test 7: SubnetValidator IPv6 Integration ──────────────────
console.log('\n--- 7. SubnetValidator IPv6 Requirements ---');
const reqs = [
  { id: 'r1', type: 'ipv6-address', hostname: 'PC1', interface: pc1.interfaces[0].name, expectedIPv6: '2001:db8:acad:1::10', desc: 'PC1 IPv6 configuration' },
  { id: 'r2', type: 'ipv6-ping', srcDeviceId: 'pc1', dstIp: '2001:db8:acad:1::20', desc: 'PC1 pings PC2 over IPv6' }
];
const valLevel = SubnetValidator.validateLevel(reqs, sim.devices, sim.links, sim);
assert(valLevel[0].pass === true, 'SubnetValidator validates ipv6-address requirement');
assert(valLevel[1].pass === true, 'SubnetValidator validates ipv6-ping requirement');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════════');

if (failed > 0) process.exit(1);
