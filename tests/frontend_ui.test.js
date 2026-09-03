/**
 * Frontend UI & Bundling Test Suite
 * Tests: index.html, LoginTab.tsx, RegisterTab.tsx, GoogleAuthButton.tsx, and Vite/TypeScript Build
 *
 * Verifies:
 * - AC-5: `npm run build` succeeds with zero TypeScript or bundling errors.
 * - AC-6: Both Login and Registration views display the Google authentication option.
 * - R2.1: Google Identity Services SDK script in index.html.
 * - R2.4: Fallback navigation to /api/auth/google in GoogleAuthButton.tsx.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

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

  console.log('\n--- Running Frontend UI & Bundling Test Suite ---');

  // TC-FE-1: Google Identity Services script in index.html
  test('TC-FE-1: index.html includes Google Identity Services SDK script tag (R2.1)', () => {
    const indexPath = path.join(PROJECT_ROOT, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'index.html must exist');
    const content = fs.readFileSync(indexPath, 'utf8');

    const gsiScriptPattern = /<script[^>]*src=["']https:\/\/accounts\.google\.com\/gsi\/client["'][^>]*>/i;
    assert.ok(
      gsiScriptPattern.test(content),
      'index.html must include script tag with src="https://accounts.google.com/gsi/client"'
    );
    assert.ok(content.includes('async'), 'GIS script should have async attribute');
    assert.ok(content.includes('defer'), 'GIS script should have defer attribute');
  });

  // TC-FE-2: GoogleAuthButton rendered in LoginTab.tsx with stylized separator
  test('TC-FE-2: LoginTab.tsx renders GoogleAuthButton and stylized separator (AC-6, R2.2)', () => {
    const loginTabPath = path.join(PROJECT_ROOT, 'src', 'components', 'auth', 'LoginTab.tsx');
    assert.ok(fs.existsSync(loginTabPath), 'LoginTab.tsx must exist');
    const content = fs.readFileSync(loginTabPath, 'utf8');

    assert.ok(
      content.includes('GoogleAuthButton') && content.includes('<GoogleAuthButton'),
      'LoginTab.tsx must import and render <GoogleAuthButton />'
    );
    assert.ok(
      content.includes('OR CONTINUE WITH'),
      'LoginTab.tsx must include stylized separator "OR CONTINUE WITH"'
    );
    assert.ok(
      content.includes('loginWithGoogle'),
      'LoginTab.tsx must wire GoogleAuthButton onSuccess to loginWithGoogle'
    );
  });

  // TC-FE-3: GoogleAuthButton rendered in RegisterTab.tsx with stylized separator
  test('TC-FE-3: RegisterTab.tsx renders GoogleAuthButton and stylized separator (AC-6, R2.3)', () => {
    const registerTabPath = path.join(PROJECT_ROOT, 'src', 'components', 'auth', 'RegisterTab.tsx');
    assert.ok(fs.existsSync(registerTabPath), 'RegisterTab.tsx must exist');
    const content = fs.readFileSync(registerTabPath, 'utf8');

    assert.ok(
      content.includes('GoogleAuthButton') && content.includes('<GoogleAuthButton'),
      'RegisterTab.tsx must import and render <GoogleAuthButton />'
    );
    assert.ok(
      content.includes('OR REGISTER WITH EMAIL') || content.includes('OR CONTINUE WITH'),
      'RegisterTab.tsx must include stylized separator "OR REGISTER WITH EMAIL"'
    );
    assert.ok(
      content.includes('loginWithGoogle'),
      'RegisterTab.tsx must wire GoogleAuthButton onSuccess to loginWithGoogle'
    );
  });

  // TC-FE-4: GoogleAuthButton provides fallback redirect to /api/auth/google
  test('TC-FE-4: GoogleAuthButton.tsx provides fallback navigation to /api/auth/google (R2.4)', () => {
    const googleBtnPath = path.join(PROJECT_ROOT, 'src', 'components', 'auth', 'GoogleAuthButton.tsx');
    assert.ok(fs.existsSync(googleBtnPath), 'GoogleAuthButton.tsx must exist');
    const content = fs.readFileSync(googleBtnPath, 'utf8');

    assert.ok(
      content.includes('/api/auth/google'),
      'GoogleAuthButton.tsx must contain navigation fallback to /api/auth/google'
    );
    assert.ok(
      content.includes('/api/auth/google/config'),
      'GoogleAuthButton.tsx must fetch dynamic clientId from /api/auth/google/config'
    );
  });

  // TC-FE-5: npm run build passes with zero errors (AC-5)
  test('TC-FE-5: npm run build succeeds with zero errors (AC-5, R2.5)', () => {
    console.log('    Executing "npm run build" to verify TypeScript & bundling integrity...');
    try {
      const output = execSync('npm run build', {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
      assert.ok(
        output.includes('built in') || output.includes('dist'),
        'Vite build should complete successfully'
      );
    } catch (err) {
      throw new Error(`npm run build failed with code ${err.status}:\n${err.stdout}\n${err.stderr}`);
    }
  });

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\nFrontend UI & Build Results: ${passed} passed, ${failed} failed.\n`);
  return { total: results.length, passed, failed, results };
}

if (require.main === module) {
  runTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

module.exports = { runTests };
