/**
 * Leatherbound Notebook — Nodemailer SMTP Email Dispatcher
 *
 * Production-grade SMTP mail transport with Titan Mail default configuration,
 * luxury skeuomorphic HTML email templates, plain-text fallbacks,
 * connection pooling, socket timeouts, and robust error classification.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * SMTP Configuration Defaults (Titan Mail)
 */
const DEFAULT_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: true,
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || '"Leatherbound Vault" <support@example.com>',
  appName: 'Leatherbound Notebook',
  defaultExpiresInMinutes: 10,
  connectionTimeoutMs: 8000,
  greetingTimeoutMs: 8000,
  socketTimeoutMs: 12000,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
};

/**
 * Resolves active SMTP configuration from environment variables with fallback defaults.
 * @param {Object} [overrides={}] - Optional custom config overrides.
 * @returns {Object} Full configuration object.
 */
function getSmtpConfig(overrides = {}) {
  const envHost = process.env.SMTP_HOST || DEFAULT_CONFIG.host;
  const envPort = parseInt(process.env.SMTP_PORT, 10) || DEFAULT_CONFIG.port;
  
  // Determine secure flag: if explicitly set in env, respect boolean; else default to port 465 === true
  let isSecure = DEFAULT_CONFIG.secure;
  if (process.env.SMTP_SECURE !== undefined && process.env.SMTP_SECURE !== '') {
    isSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true;
  } else if (envPort === 465) {
    isSecure = true;
  } else if (envPort === 587 || envPort === 25) {
    isSecure = false;
  }

  const envUser = process.env.SMTP_USER || DEFAULT_CONFIG.user;
  const envPass = process.env.SMTP_PASS || DEFAULT_CONFIG.pass;
  const envFrom = process.env.SMTP_FROM || DEFAULT_CONFIG.from;

  return {
    host: overrides.host || envHost,
    port: overrides.port !== undefined ? parseInt(overrides.port, 10) : envPort,
    secure: overrides.secure !== undefined ? Boolean(overrides.secure) : isSecure,
    auth: {
      user: (overrides.auth && overrides.auth.user) || overrides.user || envUser,
      pass: (overrides.auth && overrides.auth.pass) || overrides.pass || envPass,
    },
    from: overrides.from || envFrom,
    appName: overrides.appName || DEFAULT_CONFIG.appName,
    defaultExpiresInMinutes: overrides.defaultExpiresInMinutes || DEFAULT_CONFIG.defaultExpiresInMinutes,
    connectionTimeout: overrides.connectionTimeout || DEFAULT_CONFIG.connectionTimeoutMs,
    greetingTimeout: overrides.greetingTimeout || DEFAULT_CONFIG.greetingTimeoutMs,
    socketTimeout: overrides.socketTimeout || DEFAULT_CONFIG.socketTimeoutMs,
    pool: overrides.pool !== undefined ? overrides.pool : DEFAULT_CONFIG.pool,
    maxConnections: overrides.maxConnections || DEFAULT_CONFIG.maxConnections,
    maxMessages: overrides.maxMessages || DEFAULT_CONFIG.maxMessages,
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: overrides.rejectUnauthorized !== undefined ? overrides.rejectUnauthorized : false,
    },
  };
}

let activeTransporter = null;

/**
 * Creates or retrieves a nodemailer transporter instance.
 * @param {Object} [configOverrides] - Optional transport options.
 * @returns {nodemailer.Transporter}
 */
function createTransporter(configOverrides) {
  if (configOverrides) {
    const customConfig = getSmtpConfig(configOverrides);
    return nodemailer.createTransport(customConfig);
  }

  if (!activeTransporter) {
    const config = getSmtpConfig();
    activeTransporter = nodemailer.createTransport(config);
  }
  return activeTransporter;
}

/**
 * Resets the cached singleton transporter (useful for testing or config updates).
 */
function resetTransporter() {
  if (activeTransporter && typeof activeTransporter.close === 'function') {
    try {
      activeTransporter.close();
    } catch (e) {}
  }
  activeTransporter = null;
}

/**
 * Escapes unsafe characters for safe inclusion in HTML templates.
 * @param {string} str - Raw string.
 * @returns {string} Escaped HTML-safe string.
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates whether a given string is a valid email address.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 3) return false;
  // RFC 5322 simplified pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Masks an email address for privacy in logs (e.g. "a***d@example.com").
 * @param {string} email
 * @returns {string}
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 1) {
    return `${name}***@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Maps purpose codes to human-readable labels and descriptions.
 * @param {string} [purpose='login']
 * @returns {{ title: string, subtitle: string, action: string }}
 */
function resolvePurposeMetadata(purpose = 'login') {
  const normalized = String(purpose || '').toLowerCase().trim();
  switch (normalized) {
    case 'register':
    case 'registration':
    case 'signup':
      return {
        title: 'ACCOUNT REGISTRATION',
        subtitle: 'VERIFY YOUR MASTER VAULT ACCOUNT',
        action: 'complete your Leatherbound Notebook registration and create your encrypted vault',
      };
    case 'password_reset':
    case 'recovery':
    case 'reset':
      return {
        title: 'ACCOUNT RECOVERY',
        subtitle: 'SECURE CREDENTIAL RESET CIPHER',
        action: 'reset your vault password and restore secure access',
      };
    case 'email_verification':
    case 'verify_email':
      return {
        title: 'EMAIL VERIFICATION',
        subtitle: 'CONFIRM AUTHORIZED EMAIL ADDRESS',
        action: 'verify your primary contact email address',
      };
    case 'login':
    case 'auth':
    case 'signin':
    default:
      return {
        title: 'AUTHENTICATION CIPHER',
        subtitle: 'SECURE ZERO-KNOWLEDGE LOGIN',
        action: 'unlock your private Leatherbound Notebook vault',
      };
  }
}

/**
 * Generates a luxury, skeuomorphic, responsive HTML email for OTP delivery.
 * Features:
 * - Rich parchment & dark emerald leather aesthetic
 * - Gold foil crest and headers
 * - Large 6-digit monospaced OTP display with tracking
 * - Expiration notice and countdown
 * - Zero-knowledge security disclaimer
 *
 * @param {Object} options
 * @param {string} options.otp - The 6-digit numeric OTP code.
 * @param {string} [options.email] - Recipient email.
 * @param {string} [options.purpose='login'] - Purpose of the verification request.
 * @param {number} [options.expiresInMinutes=10] - OTP lifetime in minutes.
 * @param {string} [options.appName='Leatherbound Notebook'] - Name of the application.
 * @returns {string} Clean HTML email string.
 */
function generateOtpEmailHtml({
  otp,
  email = '',
  purpose = 'login',
  expiresInMinutes = DEFAULT_CONFIG.defaultExpiresInMinutes,
  appName = DEFAULT_CONFIG.appName,
}) {
  const safeOtp = escapeHtml(String(otp || '').trim());
  const safeEmail = escapeHtml(email ? maskEmail(email) : '');
  const safeAppName = escapeHtml(appName);
  const safeMinutes = parseInt(expiresInMinutes, 10) || 10;
  const meta = resolvePurposeMetadata(purpose);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${meta.title} — ${safeAppName}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@700&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #05120d; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .otp-card { padding: 24px 16px !important; }
      .otp-digit-box { font-size: 30px !important; letter-spacing: 8px !important; padding: 14px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #05120d; font-family: 'Lora', Georgia, 'Times New Roman', serif; color: #e2e8f0;">
  <!-- Preheader text (invisible preview in inbox) -->
  <div style="display: none; font-size: 1px; color: #05120d; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your ${safeAppName} verification cipher is ${safeOtp}. Valid for ${safeMinutes} minutes. Keep this private.
  </div>

  <!-- Background Outer Table -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05120d; background-image: radial-gradient(circle at 50% 10%, #0d2a1f 0%, #05120d 80%); padding: 40px 12px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Main Container Card with Gold Border & Skeuomorphic Shadow -->
        <table role="presentation" class="email-container" width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background: linear-gradient(180deg, #0d241a 0%, #07150f 100%); border: 1px solid #c89d38; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(212, 175, 55, 0.3);">
          
          <!-- Top Accent Trim -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #85581A 0%, #E5C07B 25%, #F7E7A9 50%, #E5C07B 75%, #85581A 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section with Gold Emblem -->
          <tr>
            <td align="center" style="padding: 38px 24px 20px 24px; background: radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.16) 0%, transparent 70%);">
              <!-- Crest Seal -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="width: 68px; height: 68px; border-radius: 50%; border: 2px solid #d4af37; background: #061910; box-shadow: 0 0 25px rgba(212, 175, 55, 0.45); color: #f3e5ab; font-size: 30px; line-height: 68px; text-align: center;">
                    ⚜
                  </td>
                </tr>
              </table>

              <!-- Branded Title -->
              <h1 style="margin: 18px 0 4px 0; font-family: 'Cinzel', 'Times New Roman', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 3.5px; color: #f7e7a9; text-transform: uppercase; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);">
                ${safeAppName}
              </h1>
              
              <!-- Subtitle Badge -->
              <p style="margin: 0; font-family: 'Cinzel', 'Times New Roman', Georgia, serif; font-size: 11px; font-weight: 600; letter-spacing: 2.5px; color: #10b981; text-transform: uppercase;">
                ${meta.subtitle}
              </p>
            </td>
          </tr>

          <!-- Ornate Filigree Divider -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td height="1" style="background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.6) 50%, transparent 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="otp-card" style="padding: 34px 44px 28px 44px; color: #e2e8f0; font-size: 15px; line-height: 1.7;">
              <p style="margin: 0 0 16px 0; color: #fef3c7; font-size: 17px; font-weight: 600;">
                Greetings Author,
              </p>
              
              <p style="margin: 0 0 24px 0; color: #cbd5e1; font-size: 14.5px;">
                To ${meta.action}${safeEmail ? ` (associated with <strong style="color: #f7e7a9;">${safeEmail}</strong>)` : ''}, please enter the one-time authentication cipher below:
              </p>

              <!-- Prominent OTP Cipher Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 24px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="background: #061811; border: 2px solid #c89d38; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 18px rgba(16, 185, 129, 0.15);">
                      <tr>
                        <td align="center" class="otp-digit-box" style="padding: 16px 36px; font-family: 'JetBrains Mono', 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 12px; color: #ffffff; text-shadow: 0 0 15px rgba(247, 231, 169, 0.7), 0 0 30px rgba(16, 185, 129, 0.5);">
                          ${safeOtp}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Expiration Warning Pill -->
              <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 28px auto;">
                <tr>
                  <td style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 20px; padding: 6px 18px; color: #6ee7b7; font-size: 12.5px; font-weight: 500; text-align: center;">
                    ⏱️ Cipher valid for <strong>${safeMinutes} minutes</strong> &bull; Single-use only
                  </td>
                </tr>
              </table>

              <!-- Security Advisory Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(8, 26, 19, 0.75); border-left: 3px solid #d4af37; border-radius: 6px; margin: 0 0 10px 0;">
                <tr>
                  <td style="padding: 14px 18px; color: #94a3b8; font-size: 12.5px; line-height: 1.6;">
                    <strong style="color: #f7e7a9; display: block; margin-bottom: 4px; font-size: 13px;">🛡️ Sovereign Security Advisory:</strong>
                    &bull; If you did not initiate this request, no action is required — your vault remains encrypted and untouched.<br />
                    &bull; <strong>Never share this cipher with anyone.</strong> ${safeAppName} engineers and staff will never ask for your code.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center" style="padding: 24px 36px 30px 36px; background-color: #040d09; border-top: 1px solid rgba(212, 175, 55, 0.25);">
              <p style="margin: 0 0 6px 0; font-family: 'Cinzel', 'Times New Roman', Georgia, serif; color: #64748b; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">
                Zero-Knowledge &bull; AES-256-GCM Encrypted &bull; Local Vault Sanctuary
              </p>
              <p style="margin: 0; color: #475569; font-size: 10.5px; line-height: 1.5;">
                This automated transmission was generated by the ${safeAppName} authentication service.<br />
                &copy; ${new Date().getFullYear()} ${safeAppName}. All sovereign rights reserved.
              </p>
            </td>
          </tr>

          <!-- Bottom Accent Trim -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #85581A 0%, #E5C07B 50%, #85581A 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates a clean plain-text fallback version for the OTP email.
 * @param {Object} options
 * @param {string} options.otp
 * @param {string} [options.email]
 * @param {string} [options.purpose='login']
 * @param {number} [options.expiresInMinutes=10]
 * @param {string} [options.appName='Leatherbound Notebook']
 * @returns {string} Plain-text email body.
 */
function generateOtpEmailText({
  otp,
  email = '',
  purpose = 'login',
  expiresInMinutes = DEFAULT_CONFIG.defaultExpiresInMinutes,
  appName = DEFAULT_CONFIG.appName,
}) {
  const safeOtp = String(otp || '').trim();
  const safeMinutes = parseInt(expiresInMinutes, 10) || 10;
  const meta = resolvePurposeMetadata(purpose);

  return `${appName.toUpperCase()} — ${meta.title}

Greetings Author,

To ${meta.action}${email ? ` (${maskEmail(email)})` : ''}, please enter your one-time verification code:

Verification Code: ${safeOtp}

Validity:
This code will expire in ${safeMinutes} minutes and can only be used once.

SECURITY ADVISORY:
- If you did not request this verification code, no further action is needed.
- Never share this code with anyone.

— ${appName} Security Team
${process.env.SMTP_USER || 'support@example.com'}
`;
}

/**
 * Generates a luxury branded HTML email for new user welcome / account creation.
 * @param {Object} options
 * @param {string} options.username
 * @param {string} [options.appName='Leatherbound Notebook']
 * @returns {string} HTML email string.
 */
function generateWelcomeEmailHtml({
  username = 'Author',
  appName = DEFAULT_CONFIG.appName,
}) {
  const safeUsername = escapeHtml(username || 'Author');
  const safeAppName = escapeHtml(appName);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${safeAppName}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #05120d; font-family: 'Georgia', serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #05120d; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05120d; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: linear-gradient(180deg, #0c2017 0%, #06150f 100%); border: 1px solid #d4af37; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.85);">
          <tr>
            <td align="center" style="padding: 36px 20px 16px 20px; background: radial-gradient(circle at center, rgba(212,175,55,0.2) 0%, transparent 70%);">
              <div style="display: inline-block; width: 68px; height: 68px; line-height: 68px; border-radius: 50%; border: 2px solid #d4af37; background: #061b12; color: #d4af37; font-size: 30px; text-align: center; box-shadow: 0 0 25px rgba(212,175,55,0.5);">
                📖
              </div>
              <h1 style="color: #f7e7a9; font-size: 23px; font-weight: 700; letter-spacing: 3px; margin: 16px 0 4px 0; text-transform: uppercase;">WELCOME TO THE ARCHIVES</h1>
              <p style="color: #d4af37; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">YOUR ENCRYPTED VAULT IS READY</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px; color: #e2e8f0; font-size: 15px; line-height: 1.7;">
              <p style="margin-top: 0; color: #fef08a; font-size: 17px; font-weight: 600;">Welcome, ${safeUsername}!</p>
              <p style="color: #cbd5e1; font-size: 14px;">
                Your master account has been verified and fortified with AES-256-GCM zero-knowledge client-gated encryption.
              </p>
              <div style="background: rgba(212, 175, 55, 0.08); border-left: 3px solid #d4af37; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
                <p style="margin: 0; color: #fde047; font-size: 13px; font-weight: 600;">Your Sovereign Vault Highlights:</p>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #94a3b8; font-size: 12.5px; line-height: 1.6;">
                  <li>Realistic 3D Page-Flipping Physics & Turn Animations</li>
                  <li>Zero-Knowledge Client-Gated Master Key Derivation</li>
                  <li>Rich Multimedia Embeds (Drawings, Code, Audio, Media)</li>
                  <li>Customizable Royal Leather Covers & Spine Embellishments</li>
                </ul>
              </div>
              <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0;">
                You may now sign in at any time to pen your thoughts in utter privacy.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 40px; background-color: #040e0a; border-top: 1px solid rgba(212,175,55,0.2);">
              <p style="color: #64748b; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
                ${safeAppName} &bull; The Sovereign Digital Sanctuary
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Categorizes and formats SMTP / Network errors into structured, user-friendly responses.
 * @param {Error} error - Caught error.
 * @returns {{ code: string, message: string, userMessage: string, details: string, status: number }}
 */
function classifySmtpError(error) {
  const errCode = error && (error.code || error.responseCode || '');
  const errMsg = error ? String(error.message || '') : 'Unknown email dispatch error';

  // Authentication failures (535, EAUTH)
  if (errCode === 'EAUTH' || errMsg.includes('535') || errMsg.toLowerCase().includes('authentication failed')) {
    return {
      code: 'SMTP_AUTH_ERROR',
      message: 'SMTP authentication failed. Verify SMTP_USER and SMTP_PASS credentials in environment variables.',
      userMessage: 'Email delivery service authentication error. Please contact the administrator.',
      details: errMsg,
      status: 502,
    };
  }

  // Connection timeouts / DNS failures
  if (
    errCode === 'ETIMEDOUT' ||
    errCode === 'ECONNRESET' ||
    errCode === 'ECONNREFUSED' ||
    errCode === 'ENOTFOUND' ||
    errCode === 'ESOCKET' ||
    errMsg.toLowerCase().includes('timeout') ||
    errMsg.toLowerCase().includes('greeting never received')
  ) {
    return {
      code: 'SMTP_NETWORK_ERROR',
      message: `SMTP connection error (${errCode || 'TIMEOUT'}). Target host may be unreachable or port is blocked.`,
      userMessage: 'Email delivery service temporarily unreachable. Please try again shortly.',
      details: errMsg,
      status: 504,
    };
  }

  // Recipient address errors (550, 553, EENVELOPE)
  if (errCode === 'EENVELOPE' || errMsg.includes('550') || errMsg.includes('553') || errMsg.toLowerCase().includes('recipient')) {
    return {
      code: 'INVALID_RECIPIENT',
      message: 'SMTP rejected recipient address.',
      userMessage: 'The provided email address could not be reached. Please verify the email and try again.',
      details: errMsg,
      status: 400,
    };
  }

  // Rate limits (421, 450, 451)
  if (errMsg.includes('421') || errMsg.includes('450') || errMsg.includes('451') || errMsg.toLowerCase().includes('rate limit')) {
    return {
      code: 'SMTP_RATE_LIMIT',
      message: 'SMTP server rate limit reached.',
      userMessage: 'Email delivery rate limit reached. Please wait a moment before requesting another code.',
      details: errMsg,
      status: 429,
    };
  }

  // Generic/fallback error
  return {
    code: 'SMTP_DISPATCH_FAILED',
    message: `Failed to dispatch email via SMTP: ${errMsg}`,
    userMessage: 'Failed to send verification email. Please try again later.',
    details: errMsg,
    status: 500,
  };
}

/**
 * Verifies SMTP server connectivity and authentication.
 * @param {Object} [configOverrides]
 * @returns {Promise<{ ok: boolean, error?: string, code?: string, details?: any }>}
 */
async function verifyTransporter(configOverrides) {
  const transporter = createTransporter(configOverrides);
  try {
    const verified = await transporter.verify();
    return { ok: true, verified };
  } catch (err) {
    const classified = classifySmtpError(err);
    console.error(`[SMTP_VERIFY_ERROR] ${classified.code}: ${classified.message}`);
    return {
      ok: false,
      error: classified.message,
      code: classified.code,
      details: classified.details,
      status: classified.status,
    };
  }
}

/**
 * Dispatches an OTP verification email.
 *
 * @param {Object} options
 * @param {string} options.to - Destination email address.
 * @param {string} options.otp - 6-digit verification code.
 * @param {string} [options.purpose='login'] - Purpose for OTP (login, register, password_reset).
 * @param {number} [options.expiresInMinutes=10] - Expiration duration in minutes.
 * @param {string} [options.appName] - Optional custom app name.
 * @param {nodemailer.Transporter} [options.transporter] - Optional injected transporter for testing.
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, code?: string, userMessage?: string }>}
 */
async function sendOtpEmail({
  to,
  otp,
  purpose = 'login',
  expiresInMinutes = DEFAULT_CONFIG.defaultExpiresInMinutes,
  appName = DEFAULT_CONFIG.appName,
  transporter: customTransporter,
}) {
  if (!to || !validateEmail(to)) {
    return {
      success: false,
      code: 'INVALID_EMAIL_FORMAT',
      error: 'Invalid recipient email address format.',
      userMessage: 'Please enter a valid email address.',
      status: 400,
    };
  }

  if (!otp || String(otp).trim().length < 4) {
    return {
      success: false,
      code: 'INVALID_OTP_PARAM',
      error: 'Invalid OTP code provided for email dispatch.',
      userMessage: 'Internal verification code generation error.',
      status: 400,
    };
  }

  const cleanEmail = to.trim();
  const cleanOtp = String(otp).trim();
  const meta = resolvePurposeMetadata(purpose);
  
  // Clean, spam-filter-friendly subject line without emojis or aggressive triggers
  const subject = `${cleanOtp} is your ${appName} verification code`;

  const htmlContent = generateOtpEmailHtml({
    otp: cleanOtp,
    email: cleanEmail,
    purpose,
    expiresInMinutes,
    appName,
  });

  const textContent = generateOtpEmailText({
    otp: cleanOtp,
    email: cleanEmail,
    purpose,
    expiresInMinutes,
    appName,
  });

  const config = getSmtpConfig();
  const messageIdDomain = config.from.includes('@')
    ? config.from.split('@')[1].replace(/[>"]/g, '').trim()
    : 'gochalamvinod.tech';

  const mailOptions = {
    from: config.from,
    to: cleanEmail,
    replyTo: process.env.SMTP_REPLY_TO || config.from,
    subject,
    text: textContent,
    html: htmlContent,
    messageId: `<auth-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@${messageIdDomain}>`,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      'X-Mailer': `${appName} Transactional Mailer v2.0`,
      'Precedence': 'bulk',
    },
  };

  const transport = customTransporter || createTransporter();

  try {
    const info = await transport.sendMail(mailOptions);
    const acceptedList = Array.isArray(info.accepted) && info.accepted.length > 0
      ? info.accepted
      : (info.envelope && info.envelope.to)
        ? (Array.isArray(info.envelope.to) ? info.envelope.to : [info.envelope.to])
        : [cleanEmail];

    console.log(`[SMTP_DISPATCH_SUCCESS] Sent ${purpose} OTP to ${maskEmail(cleanEmail)} (MessageID: ${info.messageId || 'ok'})`);
    return {
      success: true,
      messageId: info.messageId,
      accepted: acceptedList,
      response: info.response,
    };
  } catch (err) {
    const classified = classifySmtpError(err);
    console.error(`[SMTP_DISPATCH_ERROR] Failed sending to ${maskEmail(cleanEmail)}: [${classified.code}] ${classified.message}`);
    return {
      success: false,
      error: classified.message,
      userMessage: classified.userMessage,
      code: classified.code,
      details: classified.details,
      status: classified.status,
    };
  }
}

/**
 * Dispatches a generic HTML/text email.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} [options.html]
 * @param {string} [options.text]
 * @param {nodemailer.Transporter} [options.transporter]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, code?: string }>}
 */
async function sendGenericEmail({
  to,
  subject,
  html,
  text,
  transporter: customTransporter,
}) {
  if (!to || !validateEmail(to)) {
    return {
      success: false,
      code: 'INVALID_EMAIL_FORMAT',
      error: 'Invalid recipient email address format.',
      status: 400,
    };
  }

  if (!subject) {
    return {
      success: false,
      code: 'MISSING_SUBJECT',
      error: 'Subject is required for email dispatch.',
      status: 400,
    };
  }

  const config = getSmtpConfig();
  const mailOptions = {
    from: config.from,
    to: to.trim(),
    subject,
    text: text || '',
    html: html || '',
  };

  const transport = customTransporter || createTransporter();

  try {
    const info = await transport.sendMail(mailOptions);
    const acceptedList = Array.isArray(info.accepted) && info.accepted.length > 0
      ? info.accepted
      : (info.envelope && info.envelope.to)
        ? (Array.isArray(info.envelope.to) ? info.envelope.to : [info.envelope.to])
        : [to.trim()];

    return {
      success: true,
      messageId: info.messageId,
      accepted: acceptedList,
      response: info.response,
    };
  } catch (err) {
    const classified = classifySmtpError(err);
    console.error(`[SMTP_GENERIC_ERROR] Failed sending to ${maskEmail(to)}: [${classified.code}] ${classified.message}`);
    return {
      success: false,
      error: classified.message,
      userMessage: classified.userMessage,
      code: classified.code,
      details: classified.details,
      status: classified.status,
    };
  }
}

module.exports = {
  DEFAULT_CONFIG,
  getSmtpConfig,
  createTransporter,
  resetTransporter,
  validateEmail,
  maskEmail,
  escapeHtml,
  resolvePurposeMetadata,
  generateOtpEmailHtml,
  generateOtpEmailText,
  generateWelcomeEmailHtml,
  classifySmtpError,
  verifyTransporter,
  sendOtpEmail,
  sendGenericEmail,
};
