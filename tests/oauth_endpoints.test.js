/**
 * Backend OAuth Endpoints Test Suite (AC-1, AC-2, AC-3, AC-4)
 * Tests:
 * - AC-1: GET /api/auth/google/config
 * - AC-2: GET /api/auth/google
 * - AC-3: GET /api/auth/callback/google
 * - AC-4: POST /api/auth/google
 */

'use strict';

const assert = require('assert');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const EXPECTED_CLIENT_ID = '309183573806-f65n2csjthbct96mmr3jtfq74ke7kf5v.apps.googleusercontent.com';
const EXPECTED_CLIENT_SECRET = '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';

// Helper to generate a mock Google ID token JWT
function createMockGoogleJwt(claims = {}) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'https://accounts.google.com',
    sub: claims.sub || 'google_sub_' + Math.random().toString(36).substring(2, 10),
    email: claims.email || 'oauth_tester_' + Math.random().toString(36).substring(2, 8) + '@example.com',
    email_verified: claims.email_verified !== undefined ? claims.email_verified : true,
    name: claims.name || 'OAuth Test Account',
    picture: claims.picture || 'https://lh3.googleusercontent.com/a/default-user',
    aud: claims.aud || EXPECTED_CLIENT_ID,
    iat: now,
    exp: now + 3600,
    ...claims,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const b64Signature = Buffer.from('mock_signature_for_test').toString('base64url');

  return `${b64Header}.${b64Payload}.${b64Signature}`;
}

async function runTests() {
  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, pass: true });
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      results.push({ name, pass: false, error: err.message });
      console.error(`  [FAIL] ${name}: ${err.message}`);
    }
  }

  console.log(`\n--- Running Backend OAuth Endpoints Test Suite against ${BASE_URL} ---`);

  // ==========================================
  // AC-1: GET /api/auth/google/config
  // ==========================================
  await test('TC-AC1-1: GET /api/auth/google/config responds with HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google/config`);
    assert.strictEqual(res.status, 200, `Expected status 200, got ${res.status}`);
  });

  await test('TC-AC1-2: GET /api/auth/google/config returns JSON with ok: true and expected clientId', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google/config`);
    const data = await res.json();
    assert.strictEqual(data.ok, true, 'Expected data.ok to be true');
    assert.strictEqual(data.clientId, EXPECTED_CLIENT_ID, `Expected clientId "${EXPECTED_CLIENT_ID}", got "${data.clientId}"`);
  });

  await test('TC-AC1-3: Security Invariant: Client Secret is NOT leaked in /api/auth/google/config', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google/config`);
    const rawText = await res.text();
    const data = JSON.parse(rawText);

    assert.strictEqual(data.clientSecret, undefined, 'data.clientSecret must not exist');
    assert.strictEqual(data.client_secret, undefined, 'data.client_secret must not exist');
    assert.strictEqual(data.secret, undefined, 'data.secret must not exist');
    assert.ok(!rawText.includes(EXPECTED_CLIENT_SECRET), 'Raw response body must not contain the client secret');
    assert.ok(!rawText.includes('GOCSPX-'), 'Raw response body must not contain Google secret prefix GOCSPX-');
  });

  // ==========================================
  // AC-2: GET /api/auth/google
  // ==========================================
  await test('TC-AC2-1: GET /api/auth/google responds with HTTP 302 redirect', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302, `Expected status 302, got ${res.status}`);
    const location = res.headers.get('location');
    assert.ok(location, 'Location header must be present in redirect response');
  });

  await test('TC-AC2-2: GET /api/auth/google redirect target is Google OAuth authorization URL', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, { redirect: 'manual' });
    const location = res.headers.get('location');
    assert.ok(
      location.startsWith('https://accounts.google.com/o/oauth2/v2/auth') ||
      location.startsWith('https://accounts.google.com/o/oauth2/auth'),
      `Redirect location must start with Google accounts OAuth endpoint, got "${location}"`
    );
  });

  await test('TC-AC2-3: GET /api/auth/google contains required query parameters (client_id, redirect_uri, response_type=code, scope, state)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, { redirect: 'manual' });
    const location = res.headers.get('location');
    const url = new URL(location);

    assert.strictEqual(url.searchParams.get('client_id'), EXPECTED_CLIENT_ID, 'client_id parameter must match expected client ID');
    assert.strictEqual(url.searchParams.get('response_type'), 'code', 'response_type must be "code"');

    const redirectUri = url.searchParams.get('redirect_uri');
    assert.ok(redirectUri, 'redirect_uri parameter must exist');
    assert.ok(redirectUri.includes('/api/auth/callback/google'), `redirect_uri must point to /api/auth/callback/google, got "${redirectUri}"`);

    const scope = url.searchParams.get('scope') || '';
    assert.ok(scope.includes('openid'), 'scope must include openid');
    assert.ok(scope.includes('email'), 'scope must include email');
    assert.ok(scope.includes('profile'), 'scope must include profile');

    const state = url.searchParams.get('state');
    assert.ok(state && state.length >= 16, 'state parameter must be present and contain sufficient entropy');
  });

  // ==========================================
  // AC-3: GET /api/auth/callback/google
  // ==========================================
  await test('TC-AC3-1: GET /api/auth/callback/google route is mounted on server (not 404)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/callback/google`, { redirect: 'manual' });
    assert.notStrictEqual(res.status, 404, 'Endpoint must be mounted and not return 404');
  });

  await test('TC-AC3-2: GET /api/auth/callback/google handles missing code gracefully', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/callback/google`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302, 'Should redirect on missing authorization code');
    const location = res.headers.get('location');
    assert.ok(location.includes('error='), `Redirect location should include error param, got "${location}"`);
  });

  await test('TC-AC3-3: GET /api/auth/callback/google handles error parameter from Google (e.g. access_denied)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/callback/google?error=access_denied`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302, 'Should redirect on authorization denial');
    const location = res.headers.get('location');
    assert.ok(location.includes('error='), `Redirect location should include error, got "${location}"`);
  });

  await test('TC-AC3-4: GET /api/auth/callback/google safely handles invalid code exchange without server crash', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/callback/google?code=fake_invalid_test_code_12345&state=test_state`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302, 'Should redirect when Google token exchange fails');
    const location = res.headers.get('location');
    assert.ok(location.includes('error='), `Redirect location should include error flag, got "${location}"`);
  });

  // ==========================================
  // AC-4: POST /api/auth/google
  // ==========================================
  await test('TC-AC4-1: POST /api/auth/google route is mounted on server (not 404)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.notStrictEqual(res.status, 404, 'Endpoint must be mounted and not return 404');
  });

  await test('TC-AC4-2: POST /api/auth/google validates input and rejects malformed credential', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'completely.invalid.token' })
    });
    assert.strictEqual(res.status, 400, `Expected HTTP 400 for malformed credential, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.ok, false, 'Expected ok: false for malformed credential');
    assert.strictEqual(data.code, 'INVALID_GOOGLE_CREDENTIAL');
  });

  await test('TC-AC4-3: POST /api/auth/google provisions new user, returns vault/token, and sets session cookie', async () => {
    const uniqueEmail = `testuser_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@gmail.com`;
    const uniqueSub = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockJwt = createMockGoogleJwt({
      email: uniqueEmail,
      sub: uniqueSub,
      name: 'E2E Acceptance Test User'
    });

    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: mockJwt })
    });

    assert.strictEqual(res.status, 200, `Expected status 200 for valid GIS credential, got ${res.status}`);
    const data = await res.json();

    assert.strictEqual(data.ok, true, 'Expected data.ok to be true');
    assert.strictEqual(data.success, true, 'Expected data.success to be true');
    assert.ok(data.user, 'Expected user object/username in response');
    assert.strictEqual(data.email, uniqueEmail, `Expected response email "${uniqueEmail}", got "${data.email}"`);
    assert.ok(data.vault, 'Expected initial vault object in response');
    assert.ok(data.token, 'Expected session token in response');

    // Verify session cookie
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Expected Set-Cookie header');
    assert.ok(setCookie.includes('notebook_session='), 'Cookie should set notebook_session');
    assert.ok(setCookie.includes('HttpOnly') || setCookie.includes('httponly'), 'Cookie should be HttpOnly');
  });

  await test('TC-AC4-4: POST /api/auth/google allows existing user to log in again without collision error', async () => {
    const reusedEmail = `reused_${Date.now()}@gmail.com`;
    const reusedSub = `reused_sub_${Date.now()}`;
    const mockJwt = createMockGoogleJwt({
      email: reusedEmail,
      sub: reusedSub,
      name: 'Reused Test Account'
    });

    // First authentication provisions user
    const res1 = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: mockJwt })
    });
    assert.strictEqual(res1.status, 200);
    const data1 = await res1.json();
    assert.strictEqual(data1.ok, true);

    // Second authentication logs in user
    const res2 = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: mockJwt })
    });
    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();
    assert.strictEqual(data2.ok, true);
    assert.strictEqual(data2.user, data1.user, 'Username should be preserved across logins');
  });

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\nBackend OAuth Endpoints Results: ${passed} passed, ${failed} failed.\n`);
  return { total: results.length, passed, failed, results };
}

if (require.main === module) {
  runTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { runTests };
