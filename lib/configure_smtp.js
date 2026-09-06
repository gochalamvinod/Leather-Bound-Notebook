const fs = require('fs');
const path = require('path');
const readline = require('readline');
const nodemailer = require('nodemailer');

const envPath = path.resolve(__dirname, '..', '.env');
const projectRoot = path.resolve(__dirname, '..');

// Helper to read existing .env variables if present
function parseExistingEnv() {
  const env = {};
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    } catch (_) {}
  }
  return env;
}

// Find candidate Google OAuth secret JSON files in project root
function findClientSecretFiles() {
  const candidates = [];
  try {
    const files = fs.readdirSync(projectRoot);
    for (const file of files) {
      if (/^client_secret.*\.json$/i.test(file)) {
        candidates.push(file);
      }
    }
  } catch (_) {}
  return candidates;
}

// Safely parse Google OAuth client secret JSON
function parseGoogleSecretJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const data = parsed.web || parsed.installed || parsed;

    const clientId = data.client_id || data.clientId;
    const clientSecret = data.client_secret || data.clientSecret;
    const redirectUris = data.redirect_uris || data.redirectUris || [];

    if (!clientId) {
      return { ok: false, error: 'File does not contain a valid "client_id"' };
    }

    // Determine redirect URI: prefer localhost:3000 callback if present, or first redirect URI, or default
    let redirectUri = 'http://localhost:3000/api/auth/callback/google';
    if (Array.isArray(redirectUris) && redirectUris.length > 0) {
      const match = redirectUris.find(u => typeof u === 'string' && u.includes('localhost:3000'));
      redirectUri = match || redirectUris[0];
    }

    return {
      ok: true,
      clientId: String(clientId).trim(),
      clientSecret: clientSecret ? String(clientSecret).trim() : '',
      redirectUri: String(redirectUri).trim()
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  const existingEnv = parseExistingEnv();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  function ask(question, defaultValue = '') {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  console.log('===============================================================');
  console.log('   Leatherbound Notebook — One-Time Deployment Setup Wizard   ');
  console.log('===============================================================');
  console.log('');
  console.log('This wizard configures your Support Email (SMTP) and Google');
  console.log('OAuth 2.0 credentials for a production or local deployment.');
  console.log('Settings are written to your local .env file.');
  console.log('(Your secrets are protected by .gitignore and will NOT be pushed)');
  console.log('');
  console.log('===============================================================');
  console.log('');

  // 1. Support Email
  const defaultEmail = existingEnv.SMTP_USER || '';
  const emailPrompt = defaultEmail 
    ? `[1/5] Enter Support Email [Default: ${defaultEmail}]: ` 
    : '[1/5] Enter Support Email (e.g. support@gochalamvinod.tech): ';
  const email = await ask(emailPrompt, defaultEmail);

  if (!email) {
    console.log('\n[ERROR] Email cannot be empty.');
    rl.close();
    return;
  }

  // 2. Support Email Password
  const defaultPass = existingEnv.SMTP_PASS || '';
  const passPrompt = defaultPass 
    ? `[2/5] Enter Support Email Password [Press Enter to keep current password]: ` 
    : '[2/5] Enter Support Email Password: ';
  const pass = await ask(passPrompt, defaultPass);

  if (!pass) {
    console.log('\n[ERROR] Password cannot be empty.');
    rl.close();
    return;
  }

  // 3. SMTP Host
  const defaultHost = existingEnv.SMTP_HOST || 'smtp.titan.email';
  const host = await ask(`[3/5] Enter SMTP Host [Press Enter for ${defaultHost}]: `, defaultHost);

  // 4. SMTP Port
  const defaultPort = existingEnv.SMTP_PORT || '587';
  const port = await ask(`[4/4] Enter SMTP Port [Press Enter for ${defaultPort}]: `, defaultPort);
  const secure = (port === '587' || port === '25') ? 'false' : 'true';

  // 5. Google OAuth Client Secret JSON File
  console.log('');
  console.log('---------------------------------------------------------------');
  console.log(' Google OAuth 2.0 Configuration (One-Time Deployment)');
  console.log('---------------------------------------------------------------');

  const detectedFiles = findClientSecretFiles();
  let defaultSecretFile = detectedFiles.length > 0 ? detectedFiles[0] : '';

  if (defaultSecretFile) {
    console.log(`🔍 [DETECTED] Found Google Client Secret file: ${defaultSecretFile}`);
  }

  let googleClientId = existingEnv.GOOGLE_CLIENT_ID || '';
  let googleClientSecret = existingEnv.GOOGLE_CLIENT_SECRET || '';
  let googleRedirectUri = existingEnv.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

  const secretPrompt = defaultSecretFile
    ? `[5/5] Enter Google Client Secret JSON path [Press Enter to load "${defaultSecretFile}", or type path / 'skip']: `
    : `[5/5] Enter Google Client Secret JSON path [e.g. client_secret_*.json, or drag & drop file, or 'skip']: `;

  let secretInput = await ask(secretPrompt, defaultSecretFile);

  // Strip wrapping quotes if user dragged and dropped into console
  secretInput = secretInput.replace(/^["']+|["']+$/g, '').trim();

  if (secretInput && secretInput.toLowerCase() !== 'skip') {
    let resolvedSecretPath = path.isAbsolute(secretInput) 
      ? secretInput 
      : path.resolve(projectRoot, secretInput);

    if (fs.existsSync(resolvedSecretPath)) {
      const parsed = parseGoogleSecretJson(resolvedSecretPath);
      if (parsed.ok) {
        googleClientId = parsed.clientId;
        googleClientSecret = parsed.clientSecret;
        googleRedirectUri = parsed.redirectUri;
        console.log('\n✅ [SUCCESS] Google OAuth Client Secret successfully loaded!');
        console.log(`   • Client ID     : ${googleClientId}`);
        console.log(`   • Client Secret : ${googleClientSecret ? googleClientSecret.substring(0, 8) + '...' : '(empty)'}`);
        console.log(`   • Redirect URI  : ${googleRedirectUri}`);
      } else {
        console.log(`\n⚠️ [WARNING] Could not parse Google Client Secret file: ${parsed.error}`);
        console.log('   Retaining existing Google OAuth settings from .env (if any).');
      }
    } else {
      console.log(`\n⚠️ [WARNING] File not found: "${resolvedSecretPath}"`);
      console.log('   Retaining existing Google OAuth settings from .env (if any).');
    }
  } else {
    console.log('\nℹ️ [INFO] Google OAuth step skipped.');
  }

  // Generate .env file
  const envLines = [
    '# Server Port',
    'PORT=3000',
    '',
    '# SMTP Email Configuration (Port 587 STARTTLS with auto-fallback to 465)',
    `SMTP_HOST=${host}`,
    `SMTP_PORT=${port}`,
    `SMTP_SECURE=${secure}`,
    `SMTP_USER=${email}`,
    `SMTP_PASS=${pass}`,
    `SMTP_FROM="Leatherbound Vault" <${email}>`,
    `SMTP_REPLY_TO=${email}`,
    '',
    '# Security & Expiration Overrides',
    `OTP_EXPIRY_SECONDS=${existingEnv.OTP_EXPIRY_SECONDS || 600}`,
    `OTP_RESEND_COOLDOWN_SECONDS=${existingEnv.OTP_RESEND_COOLDOWN_SECONDS || 60}`,
    `OTP_MAX_ATTEMPTS=${existingEnv.OTP_MAX_ATTEMPTS || 5}`,
    '',
    '# Google OAuth 2.0 Configuration',
    `GOOGLE_CLIENT_ID=${googleClientId}`,
    `GOOGLE_CLIENT_SECRET=${googleClientSecret}`,
    `GOOGLE_REDIRECT_URI=${googleRedirectUri}`,
    `VITE_GOOGLE_CLIENT_ID=${googleClientId}`,
    ''
  ];

  fs.writeFileSync(envPath, envLines.join('\n'), 'utf8');

  console.log('\n===============================================================');
  console.log(' ✅ [SUCCESS] Deployment Configuration Saved to .env!');
  console.log(` • Support User  : ${email}`);
  console.log(` • SMTP Server   : ${host}:${port} (STARTTLS fallback ready)`);
  if (googleClientId) {
    console.log(` • Google OAuth  : Active (Client ID: ${googleClientId.substring(0, 20)}...)`);
  } else {
    console.log(` • Google OAuth  : Not configured (Optional)`);
  }
  console.log('===============================================================');

  // Verify SMTP Connection
  console.log('\nTesting SMTP connection with ' + host + ':' + port + '...');
  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: secure === 'true',
    auth: { user: email, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });

  try {
    await transporter.verify();
    console.log('✅ [SUCCESS] SMTP Credentials Verified with Server!');
  } catch (err) {
    console.log('⚠️ [WARNING] Could not verify with SMTP server: ' + err.message);
  }

  console.log('\n===============================================================');
  console.log(' Configuration Complete! Ready to launch:');
  console.log('   npm run dev   (Development Mode)');
  console.log('   npm start     (Production Mode)');
  console.log('===============================================================\n');
  rl.close();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[FATAL ERROR]', err);
    process.exit(1);
  });
}

module.exports = {
  main,
  parseExistingEnv,
  findClientSecretFiles,
  parseGoogleSecretJson
};

