const fs = require('fs');
const path = require('path');
const readline = require('readline');
const nodemailer = require('nodemailer');

const envPath = path.resolve(__dirname, '..', '.env');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('===============================================================');
console.log('      Leatherbound Notebook — Support Email & SMTP Setup       ');
console.log('===============================================================');
console.log('');
console.log('This utility configures your Support Email and SMTP credentials.');
console.log('These credentials will be written to your local .env file.');
console.log('(Your .env file is gitignored and will NOT be pushed to Git)');
console.log('');
console.log('===============================================================');
console.log('');

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  const email = await ask('[1/4] Enter Support Email (e.g. support@gochalamvinod.tech): ');
  if (!email) {
    console.log('\n[ERROR] Email cannot be empty.');
    rl.close();
    return;
  }

  const pass = await ask('[2/4] Enter Support Email Password: ');
  if (!pass) {
    console.log('\n[ERROR] Password cannot be empty.');
    rl.close();
    return;
  }

  const host = await ask('[3/4] Enter SMTP Host [Press Enter for smtp.titan.email]: ', 'smtp.titan.email');
  const port = await ask('[4/4] Enter SMTP Port [Press Enter for 587]: ', '587');
  const secure = (port === '587' || port === '25') ? 'false' : 'true';

  const envContent = [
    '# Server Port',
    'PORT=3000',
    '',
    '# SMTP Email Configuration',
    `SMTP_HOST=${host}`,
    `SMTP_PORT=${port}`,
    `SMTP_SECURE=${secure}`,
    `SMTP_USER=${email}`,
    `SMTP_PASS=${pass}`,
    `SMTP_FROM="Leatherbound Vault" <${email}>`,
    `SMTP_REPLY_TO=${email}`,
    '',
    '# Security & Expiration Overrides',
    'OTP_EXPIRY_SECONDS=600',
    'OTP_RESEND_COOLDOWN_SECONDS=60',
    'OTP_MAX_ATTEMPTS=5',
    ''
  ].join('\n');

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('\n===============================================================');
  console.log(' [SUCCESS] SMTP Configuration Saved to .env!');
  console.log(` - Support User : ${email}`);
  console.log(` - SMTP Server  : ${host}:${port} (Secure: ${secure})`);
  console.log('===============================================================');
  console.log('\nTesting SMTP connection with ' + host + ':' + port + '...');

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: secure === 'true',
    auth: { user: email, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    console.log('✅ [SUCCESS] SMTP Credentials Verified with Server!');
  } catch (err) {
    console.log('⚠️ [WARNING] Could not verify with SMTP server: ' + err.message);
  }

  console.log('\nConfiguration complete! You can now start the application:');
  console.log('  npm start     (Production)');
  console.log('  npm run dev   (Development)\n');
  rl.close();
}

main();
