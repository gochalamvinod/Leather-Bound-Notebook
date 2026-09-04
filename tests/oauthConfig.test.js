/**
 * Unit & Integration Tests for lib/oauthConfig.js
 *
 * Verifies:
 * 1. Environment variable discovery (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc.).
 * 2. Automatic filesystem discovery from root client_secret_*.json.
 * 3. Support for 'web', 'installed', and raw JSON formats.
 * 4. Resilient error handling for malformed JSON and missing files.
 * 5. Dynamic redirect URI selection based on port and candidate URIs.
 * 6. Correct population of process.env (including VITE_GOOGLE_CLIENT_ID).
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getGoogleOAuthConfig } = require('../lib/oauthConfig');

describe('lib/oauthConfig.js - Google OAuth Configuration & Auto-Discovery', () => {
  const originalEnv = { ...process.env };
  let tempDir = null;

  beforeEach(() => {
    // Reset process.env before each test
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REDIRECT_URI;
    delete process.env.VITE_GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_AUTH_URI;
    delete process.env.GOOGLE_TOKEN_URI;
    delete process.env.GOOGLE_PROJECT_ID;
  });

  afterEach(() => {
    // Restore environment variables
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);

    // Clean up temporary directory if created
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  test('TC-1: Discovers credentials directly from process.env', () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret-123';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

    const config = getGoogleOAuthConfig({ silent: true });

    assert.equal(config.configured, true);
    assert.equal(config.clientId, 'test-client-id.apps.googleusercontent.com');
    assert.equal(config.clientSecret, 'test-client-secret-123');
    assert.equal(config.redirectUri, 'http://localhost:3000/api/auth/callback/google');
    assert.equal(process.env.VITE_GOOGLE_CLIENT_ID, 'test-client-id.apps.googleusercontent.com');
  });

  test('TC-2: Auto-discovers credentials from root client_secret_*.json when env is empty', () => {
    // No env vars set, discovery must locate client_secret_309183573806-*.json in project root
    const config = getGoogleOAuthConfig({ skipEnv: true, silent: true });

    assert.equal(config.configured, true);
    assert.equal(config.clientId, '309183573806-f65n2csjthbct96mmr3jtfq74ke7kf5v.apps.googleusercontent.com');
    assert.equal(config.clientSecret, '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');
    assert.equal(config.redirectUri, 'http://localhost:3000/api/auth/callback/google');
    assert.equal(config.projectId, 'project-c2d2d8eb-fa1b-4569-9c8');

    // Asserts process.env is populated
    assert.equal(process.env.GOOGLE_CLIENT_ID, config.clientId);
    assert.equal(process.env.GOOGLE_CLIENT_SECRET, config.clientSecret);
    assert.equal(process.env.GOOGLE_REDIRECT_URI, config.redirectUri);
    assert.equal(process.env.VITE_GOOGLE_CLIENT_ID, config.clientId);
  });

  test('TC-3: Handles "installed" client JSON format', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-installed-'));
    const secretFile = path.join(tempDir, 'client_secret_installed_app.json');
    const payload = {
      installed: {
        client_id: 'installed-id.apps.googleusercontent.com',
        client_secret: 'installed-secret-xyz',
        project_id: 'installed-project',
        redirect_uris: ['http://localhost:4000/callback']
      }
    };
    fs.writeFileSync(secretFile, JSON.stringify(payload));

    const config = getGoogleOAuthConfig({
      rootDir: tempDir,
      skipEnv: true,
      port: 4000,
      silent: true
    });

    assert.equal(config.configured, true);
    assert.equal(config.clientId, 'installed-id.apps.googleusercontent.com');
    assert.equal(config.clientSecret, 'installed-secret-xyz');
    assert.equal(config.redirectUri, 'http://localhost:4000/callback');
    assert.equal(config.projectId, 'installed-project');
  });

  test('TC-4: Handles raw (flat) client JSON format with client_secret.json', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-raw-'));
    const secretFile = path.join(tempDir, 'client_secret.json');
    const payload = {
      client_id: 'flat-id.apps.googleusercontent.com',
      client_secret: 'flat-secret-999',
      project_id: 'flat-project',
      redirect_uris: ['http://localhost:3000/api/auth/callback/google']
    };
    fs.writeFileSync(secretFile, JSON.stringify(payload));

    const config = getGoogleOAuthConfig({
      rootDir: tempDir,
      skipEnv: true,
      silent: true
    });

    assert.equal(config.configured, true);
    assert.equal(config.clientId, 'flat-id.apps.googleusercontent.com');
    assert.equal(config.clientSecret, 'flat-secret-999');
    assert.equal(config.projectId, 'flat-project');
  });

  test('TC-5: Handles missing secrets gracefully without throwing', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-empty-'));

    const config = getGoogleOAuthConfig({
      rootDir: tempDir,
      skipEnv: true,
      silent: true
    });

    assert.equal(config.configured, false);
    assert.equal(config.clientId, null);
    assert.equal(config.clientSecret, null);
    assert.equal(config.redirectUri, 'http://localhost:3000/api/auth/callback/google');
  });

  test('TC-6: Handles malformed JSON gracefully without throwing', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-malformed-'));
    const badFile = path.join(tempDir, 'client_secret_bad.json');
    fs.writeFileSync(badFile, '{ invalid json syntax !!!');

    const config = getGoogleOAuthConfig({
      rootDir: tempDir,
      skipEnv: true,
      silent: true
    });

    assert.equal(config.configured, false);
    assert.equal(config.clientId, null);
    assert.equal(config.clientSecret, null);
  });

  test('TC-7: Selects port-matched redirect URI from list', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oauth-ports-'));
    const secretFile = path.join(tempDir, 'client_secret_ports.json');
    const payload = {
      web: {
        client_id: 'port-id.apps.googleusercontent.com',
        client_secret: 'port-secret',
        redirect_uris: [
          'https://production.domain.com/oauth',
          'http://localhost:8080/api/auth/callback/google',
          'http://localhost:3000/api/auth/callback/google'
        ]
      }
    };
    fs.writeFileSync(secretFile, JSON.stringify(payload));

    // When port is 8080, it selects the 8080 redirect URI
    const config8080 = getGoogleOAuthConfig({
      rootDir: tempDir,
      skipEnv: true,
      port: 8080,
      silent: true
    });
    assert.equal(config8080.redirectUri, 'http://localhost:8080/api/auth/callback/google');

    // When port is 3000, it selects the 3000 redirect URI
    const config3000 = getGoogleOAuthConfig({
      rootDir: tempDir,
      skipEnv: true,
      port: 3000,
      silent: true
    });
    assert.equal(config3000.redirectUri, 'http://localhost:3000/api/auth/callback/google');
  });

  test('TC-8: Hybrid discovery populates projectId from file when client ID and secret are already in env', () => {
    process.env.GOOGLE_CLIENT_ID = '309183573806-f65n2csjthbct96mmr3jtfq74ke7kf5v.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = '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';
    delete process.env.GOOGLE_PROJECT_ID;

    const config = getGoogleOAuthConfig({ silent: true });

    assert.equal(config.configured, true);
    assert.equal(config.clientId, '309183573806-f65n2csjthbct96mmr3jtfq74ke7kf5v.apps.googleusercontent.com');
    assert.equal(config.clientSecret, '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');
    assert.equal(config.projectId, 'project-c2d2d8eb-fa1b-4569-9c8');
    assert.equal(process.env.GOOGLE_PROJECT_ID, 'project-c2d2d8eb-fa1b-4569-9c8');
  });
});
