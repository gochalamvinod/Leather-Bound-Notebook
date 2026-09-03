/**
 * Unit & Integration Test Suite: Google OAuth Secret Auto-Discovery
 * Tests: lib/oauthConfig.js
 *
 * Verifies:
 * 1. Extraction from process.env when configured.
 * 2. Auto-discovery from client_secret_*.json in project root when process.env is cleared.
 * 3. Exact matching of Client ID and Client Secret from client_secret JSON file.
 * 4. Synchronization of VITE_GOOGLE_CLIENT_ID with GOOGLE_CLIENT_ID.
 * 5. Robust handling of edge cases: missing files, empty files, malformed JSON, and 'installed' structure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { getGoogleOAuthConfig } = require('../lib/oauthConfig');

const EXPECTED_CLIENT_ID = '309183573806-f65n2csjthbct96mmr3jtfq74ke7kf5v.apps.googleusercontent.com';
const EXPECTED_CLIENT_SECRET = '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';

async function runTests() {
  const results = [];
  function test(name, fn) {
    try {
      fn();
      results.push({ name, pass: true });
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      results.push({ name, pass: false, error: err.message });
      console.error(`  [FAIL] ${name}: ${err.message}`);
    }
  }

  console.log('\n--- Running Secret Auto-Discovery Test Suite ---');

  // Save original environment
  const originalEnv = { ...process.env };

  try {
    // TC-SD-1: Auto-discovery when process.env variables are completely cleared
    test('TC-SD-1: Auto-discovers credentials from client_secret_*.json when env is empty', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.GOOGLE_REDIRECT_URI;
      delete process.env.VITE_GOOGLE_CLIENT_ID;

      const config = getGoogleOAuthConfig({ skipEnv: true, silent: true });

      assert.strictEqual(config.configured, true, 'Config should report configured: true');
      assert.strictEqual(config.clientId, EXPECTED_CLIENT_ID, `Client ID must match ${EXPECTED_CLIENT_ID}`);
      assert.strictEqual(config.clientSecret, EXPECTED_CLIENT_SECRET, `Client Secret must match ${EXPECTED_CLIENT_SECRET}`);
      assert.ok(config.redirectUri, 'Redirect URI must be defined');
      assert.ok(
        config.redirectUri.includes('http://localhost:3000/api/auth/callback/google') ||
        config.redirectUri.includes('/api/auth/callback/google'),
        `Unexpected redirectUri: ${config.redirectUri}`
      );
    });

    // TC-SD-2: Populates process.env and syncs VITE_GOOGLE_CLIENT_ID
    test('TC-SD-2: Populates process.env and syncs VITE_GOOGLE_CLIENT_ID during discovery', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.VITE_GOOGLE_CLIENT_ID;

      const config = getGoogleOAuthConfig({ silent: true });

      assert.strictEqual(process.env.GOOGLE_CLIENT_ID, EXPECTED_CLIENT_ID);
      assert.strictEqual(process.env.VITE_GOOGLE_CLIENT_ID, EXPECTED_CLIENT_ID);
      assert.strictEqual(process.env.GOOGLE_CLIENT_SECRET, EXPECTED_CLIENT_SECRET);
    });

    // TC-SD-3: Precedence of environment variables when present
    test('TC-SD-3: Environment variables take precedence over client_secret file', () => {
      process.env.GOOGLE_CLIENT_ID = 'custom-env-client-id.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'custom-env-secret';
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/callback';

      const config = getGoogleOAuthConfig({ silent: true });

      assert.strictEqual(config.clientId, 'custom-env-client-id.apps.googleusercontent.com');
      assert.strictEqual(config.clientSecret, 'custom-env-secret');
      assert.strictEqual(config.redirectUri, 'http://localhost:5000/callback');
      assert.strictEqual(config.configured, true);
    });

    // TC-SD-4: Custom port redirects resolution
    test('TC-SD-4: Resolves appropriate redirect URI based on port option', () => {
      const config = getGoogleOAuthConfig({ skipEnv: true, port: '3000', silent: true });
      assert.strictEqual(config.redirectUri, 'http://localhost:3000/api/auth/callback/google');
    });

    // TC-SD-5: Edge Case - Temp directory with 'installed' format
    test('TC-SD-5: Discovers credentials from "installed" app structure', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-test-installed-'));
      const testSecretPath = path.join(tempDir, 'client_secret_installed_app.json');
      fs.writeFileSync(
        testSecretPath,
        JSON.stringify({
          installed: {
            client_id: 'installed-app-client-id',
            client_secret: 'installed-app-secret',
            redirect_uris: ['http://localhost:8080/callback']
          }
        })
      );

      const config = getGoogleOAuthConfig({
        rootDir: tempDir,
        skipEnv: true,
        silent: true
      });

      assert.strictEqual(config.clientId, 'installed-app-client-id');
      assert.strictEqual(config.clientSecret, 'installed-app-secret');
      assert.strictEqual(config.redirectUri, 'http://localhost:8080/callback');
      assert.strictEqual(config.configured, true);

      // Clean up temp dir
      try {
        fs.unlinkSync(testSecretPath);
        fs.rmdirSync(tempDir);
      } catch (_) {}
    });

    // TC-SD-6: Edge Case - Malformed JSON does not crash and handles gracefully
    test('TC-SD-6: Malformed JSON file does not crash and reports unconfigured when empty', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-test-malformed-'));
      const testSecretPath = path.join(tempDir, 'client_secret_corrupt.json');
      fs.writeFileSync(testSecretPath, '{ corrupt json content ... !@#$%');

      const config = getGoogleOAuthConfig({
        rootDir: tempDir,
        skipEnv: true,
        silent: true
      });

      assert.strictEqual(config.configured, false);
      assert.strictEqual(config.clientId, null);
      assert.strictEqual(config.clientSecret, null);

      // Clean up temp dir
      try {
        fs.unlinkSync(testSecretPath);
        fs.rmdirSync(tempDir);
      } catch (_) {}
    });

    // TC-SD-7: Edge Case - Directory with no client_secret file
    test('TC-SD-7: Handles empty directory without secrets without crashing', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-test-empty-'));

      const config = getGoogleOAuthConfig({
        rootDir: tempDir,
        skipEnv: true,
        silent: true
      });

      assert.strictEqual(config.configured, false);
      assert.strictEqual(config.clientId, null);
      assert.strictEqual(config.clientSecret, null);

      try {
        fs.rmdirSync(tempDir);
      } catch (_) {}
    });

  } finally {
    // Restore original environment
    process.env = originalEnv;
  }

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\nSecret Discovery Results: ${passed} passed, ${failed} failed.\n`);
  return { total: results.length, passed, failed, results };
}

if (require.main === module) {
  runTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { runTests };
