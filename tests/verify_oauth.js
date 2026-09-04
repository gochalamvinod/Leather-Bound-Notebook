/**
 * Leatherbound Notebook — Master E2E OAuth Verification Runner
 *
 * Runs all automated acceptance tests covering:
 * - Secret Auto-Discovery (M1 / ORIGINAL_REQUEST § R3)
 * - AC-1: GET /api/auth/google/config & Secret Leak Prevention (M2)
 * - AC-2: GET /api/auth/google OAuth 2.0 302 Redirect & Params (M2)
 * - AC-3: GET /api/auth/callback/google Callback Route & Handlers (M2)
 * - AC-4: POST /api/auth/google Credential Validation & Provisioning (M2)
 * - AC-5: npm run build with Zero TypeScript or Bundling Errors (M3)
 * - AC-6: Google Sign-In on Login & Registration Views (M3)
 *
 * Usage:
 *   node tests/verify_oauth.js
 */

'use strict';

const path = require('path');
const { spawn } = require('child_process');

const secretDiscoverySuite = require('./secret_discovery.test');
const frontendUiSuite = require('./frontend_ui.test');
const oauthEndpointsSuite = require('./oauth_endpoints.test');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Check if server is running on BASE_URL
async function isServerRunning(url) {
  try {
    const res = await fetch(`${url}/api/auth/google/config`, { signal: AbortSignal.timeout(2000) });
    return res.status === 200 || res.status === 404;
  } catch (_) {
    return false;
  }
}

// Start temporary server if needed
function startServer() {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'ignore'
    });

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const running = await isServerRunning(BASE_URL);
      if (running) {
        clearInterval(interval);
        resolve(serverProcess);
      } else if (attempts > 30) {
        clearInterval(interval);
        serverProcess.kill();
        reject(new Error('Timed out waiting for server to start.'));
      }
    }, 500);
  });
}

async function main() {
  const startTime = Date.now();
  console.log('===============================================================');
  console.log(' Leatherbound Notebook — Milestone 4 E2E Acceptance Test Runner');
  console.log('===============================================================');
  console.log(`Target Backend: ${BASE_URL}`);
  console.log(`Started at: ${new Date().toISOString()}`);

  let spawnedProcess = null;
  const running = await isServerRunning(BASE_URL);
  if (!running) {
    console.log('[INFO] Backend server not detected on port 3000. Launching server.js...');
    spawnedProcess = await startServer();
    console.log('[INFO] Backend server is ready.');
  } else {
    console.log('[INFO] Connected to active backend server.');
  }

  const acceptanceResults = {
    'Secret Auto-Discovery': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
    'AC-1: Config Endpoint & Secret Protection': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
    'AC-2: OAuth 2.0 Redirect Initiation': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
    'AC-3: Callback Handling & Code Exchange': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
    'AC-4: GIS Credential Login & Provisioning': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
    'AC-5: TypeScript & Vite Build Integrity': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
    'AC-6: Login & Registration Google UI': { status: 'PENDING', total: 0, passed: 0, failed: 0 },
  };

  try {
    // 1. Run Secret Auto-Discovery Suite
    const sdResults = await secretDiscoverySuite.runTests();
    acceptanceResults['Secret Auto-Discovery'] = {
      status: sdResults.failed === 0 ? 'PASS' : 'FAIL',
      total: sdResults.total,
      passed: sdResults.passed,
      failed: sdResults.failed
    };

    // 2. Run Backend Endpoints Suite
    const beResults = await oauthEndpointsSuite.runTests();
    const ac1 = beResults.results.filter(r => r.name.includes('AC1'));
    const ac2 = beResults.results.filter(r => r.name.includes('AC2'));
    const ac3 = beResults.results.filter(r => r.name.includes('AC3'));
    const ac4 = beResults.results.filter(r => r.name.includes('AC4'));

    acceptanceResults['AC-1: Config Endpoint & Secret Protection'] = {
      status: ac1.every(r => r.pass) ? 'PASS' : 'FAIL',
      total: ac1.length,
      passed: ac1.filter(r => r.pass).length,
      failed: ac1.filter(r => !r.pass).length
    };

    acceptanceResults['AC-2: OAuth 2.0 Redirect Initiation'] = {
      status: ac2.every(r => r.pass) ? 'PASS' : 'FAIL',
      total: ac2.length,
      passed: ac2.filter(r => r.pass).length,
      failed: ac2.filter(r => !r.pass).length
    };

    acceptanceResults['AC-3: Callback Handling & Code Exchange'] = {
      status: ac3.every(r => r.pass) ? 'PASS' : 'FAIL',
      total: ac3.length,
      passed: ac3.filter(r => r.pass).length,
      failed: ac3.filter(r => !r.pass).length
    };

    acceptanceResults['AC-4: GIS Credential Login & Provisioning'] = {
      status: ac4.every(r => r.pass) ? 'PASS' : 'FAIL',
      total: ac4.length,
      passed: ac4.filter(r => r.pass).length,
      failed: ac4.filter(r => !r.pass).length
    };

    // 3. Run Frontend UI Suite
    const feResults = await frontendUiSuite.runTests();
    const ac5 = feResults.results.filter(r => r.name.includes('AC-5'));
    const ac6 = feResults.results.filter(r => r.name.includes('AC-6') || r.name.includes('R2.1') || r.name.includes('R2.4'));

    acceptanceResults['AC-5: TypeScript & Vite Build Integrity'] = {
      status: ac5.every(r => r.pass) ? 'PASS' : 'FAIL',
      total: ac5.length,
      passed: ac5.filter(r => r.pass).length,
      failed: ac5.filter(r => !r.pass).length
    };

    acceptanceResults['AC-6: Login & Registration Google UI'] = {
      status: ac6.every(r => r.pass) ? 'PASS' : 'FAIL',
      total: ac6.length,
      passed: ac6.filter(r => r.pass).length,
      failed: ac6.filter(r => !r.pass).length
    };

  } finally {
    if (spawnedProcess) {
      spawnedProcess.kill();
    }
  }

  const durationMs = Date.now() - startTime;

  // Print Summary Table
  console.log('\n===============================================================');
  console.log('                E2E ACCEPTANCE VERIFICATION REPORT             ');
  console.log('===============================================================');
  console.log('Criteria                                     | Status | Tests');
  console.log('---------------------------------------------+--------+--------');

  let allPassed = true;
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const [criteria, res] of Object.entries(acceptanceResults)) {
    const paddedCriteria = criteria.padEnd(44, ' ');
    const paddedStatus = ` ${res.status} `.padEnd(8, ' ');
    const testsRatio = `${res.passed}/${res.total}`;
    console.log(`${paddedCriteria}|${paddedStatus}| ${testsRatio}`);

    if (res.status !== 'PASS') allPassed = false;
    totalTests += res.total;
    passedTests += res.passed;
    failedTests += res.failed;
  }

  console.log('===============================================================');
  console.log(`Summary: ${passedTests}/${totalTests} tests passed (${failedTests} failed) in ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`Overall Result: ${allPassed ? 'ALL ACCEPTANCE CRITERIA PASSED (SUCCESS)' : 'FAILURES DETECTED'}`);
  console.log('===============================================================\n');

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Verification Runner Error:', err);
    process.exit(1);
  });
}

module.exports = { main };
