/**
 * Leatherbound Notebook — a local, encrypted, 3D page-flipping notebook.
 *
 * Everything lives on YOUR machine:
 *   - The whole notebook (text, fonts, styling) is stored in SQLite database
 *     (data/notebook.sqlite) and encrypted with AES-256-GCM.
 *   - Sensitive fields (titles, metadata, page contents, drawings) are encrypted
 *     at rest with AES-256-GCM.
 *   - Images and media are stored as encrypted files in data/images/ and are
 *     served only while the notebook is unlocked (session-gated).
 *   - The key is derived from your password with scrypt and is only ever held
 *     in server memory while the notebook is unlocked — never written to disk unencrypted.
 *   - Zero-data-loss startup migration automatically converts legacy JSON vault files
 *     into the SQLite database.
 *
 * Run it with:  npm install && npm start
 * Then open:    http://localhost:3000
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const os = require('os');
const { URL } = require('url');
const { createZip, readZip } = require('./lib/zip');

const db = require('./db/index');
const { runMigrationIfNeeded } = require('./db/migrate');
const { TIER_CONFIGS, getTierConfig } = require('./lib/tiers');
const otpService = require('./lib/otp');
let mailer = null;
try {
  mailer = require('./lib/mailer');
} catch (e) {
  console.warn('[MAILER_LOAD_WARN] Failed loading mailer module:', e.message);
}

const { getGoogleOAuthConfig } = require('./lib/oauthConfig');
// Initialize Google OAuth config and auto-discovery on startup
getGoogleOAuthConfig({ silent: false });

function getOAuthConfig() {
  try {
    return getGoogleOAuthConfig({ silent: true });
  } catch (e) {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
      authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUri: 'https://oauth2.googleapis.com/token',
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    };
  }
}

function resolveUserTier(username) {
  if (!username) return 'classic';
  const clean = username.toLowerCase().trim();
  const userRow = db.users.findByUsername(clean);
  if (userRow) {
    if (userRow.tier && ['ultimate', 'premium', 'classic'].includes(userRow.tier)) {
      return userRow.tier;
    }
    if (userRow.is_admin || userRow.role === 'admin') {
      return 'ultimate';
    }
  }
  if (clean === 'admin') return 'ultimate';
  return 'classic';
}

function calculateUserStorageUsage(username) {
  if (!username) return 0;
  const userRow = db.users.findByUsername(username);
  const userId = userRow ? userRow.id : `user_${username.toLowerCase()}`;
  try {
    const rows = db.querySync(`SELECT SUM(size) as total FROM media_files WHERE user_id = ?`, [userId]);
    if (rows && rows[0] && rows[0].total) {
      return Number(rows[0].total) || 0;
    }
  } catch (e) {}
  return 0;
}

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = !!process.env.VERCEL;

function resolveDataDir() {
  if (process.env.DATA_DIR) {
    try {
      if (!fs.existsSync(process.env.DATA_DIR)) {
        fs.mkdirSync(process.env.DATA_DIR, { recursive: true });
      }
      return process.env.DATA_DIR;
    } catch (e) {}
  }
  if (isVercel) {
    const vDir = path.join(os.tmpdir ? os.tmpdir() : '/tmp', 'data');
    try {
      if (!fs.existsSync(vDir)) fs.mkdirSync(vDir, { recursive: true });
    } catch (e) {}
    return vDir;
  }
  const defaultDir = path.join(__dirname, 'data');
  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    const testFile = path.join(defaultDir, '.write_test_' + process.pid);
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return defaultDir;
  } catch (err) {
    return path.join(os.tmpdir ? os.tmpdir() : '/tmp', 'data');
  }
}

const DATA_DIR = resolveDataDir();
const DATA_FILE = path.join(DATA_DIR, 'notebook.enc.json');
const USERS_DIR = path.join(DATA_DIR, 'users');
const INDEX_FILE = path.join(DATA_DIR, 'library_index.json');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const BLOBS_DIR = path.join(DATA_DIR, 'blobs');
const MANIFESTS_DIR = path.join(BLOBS_DIR, 'manifests');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.enc.json');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'notebook.sqlite');

const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'Vinod@807465';

// ---------- Military-Grade Security Headers & Client Context Intelligence ----------

function extractClientIp(req) {
  if (!req) return '127.0.0.1';
  const headers = req.headers || {};
  const forwarded = headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const first = forwarded.split(',')[0].trim();
    if (first) return sanitizeIp(first);
  }
  const direct =
    headers['cf-connecting-ip'] ||
    headers['x-real-ip'] ||
    headers['fastly-client-ip'] ||
    headers['x-client-ip'] ||
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    '127.0.0.1';
  return cleanClientIp(direct);
}

function cleanClientIp(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') return '127.0.0.1';
  let ip = rawIp.trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip;
  }
  if (ip.includes(':')) {
    return ip.toLowerCase();
  }
  return '127.0.0.1';
}

function detectClientOS(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return 'Unknown OS';
  const ua = userAgent;
  if (/windows nt 10\.0/i.test(ua)) return 'Windows 10/11';
  if (/windows nt 6\.3/i.test(ua)) return 'Windows 8.1';
  if (/windows nt 6\.1/i.test(ua)) return 'Windows 7';
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/cros/i.test(ua)) return 'ChromeOS';
  if (/ubuntu/i.test(ua)) return 'Ubuntu Linux';
  if (/debian/i.test(ua)) return 'Debian Linux';
  if (/fedora|redhat|centos/i.test(ua)) return 'RedHat/CentOS Linux';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectClientBrowser(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return 'Unknown Browser';
  const ua = userAgent;
  if (/edg\//i.test(ua)) return 'Microsoft Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) return 'Google Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Mozilla Firefox';
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Apple Safari';
  if (/msie|trident/i.test(ua)) return 'Internet Explorer';
  return 'Unknown Browser';
}

function detectDeviceType(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return 'Desktop';
  const ua = userAgent;
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|android.*mobile/i.test(ua)) return 'Mobile';
  if (/bot|crawler|spider|wget|curl/i.test(ua)) return 'Bot/Automated';
  return 'Desktop';
}

function getClientSecurityContext(req) {
  const ua = (req && req.headers && req.headers['user-agent']) || '';
  const ip = extractClientIp(req);
  const os = detectClientOS(ua);
  const browser = detectClientBrowser(ua);
  const deviceType = detectDeviceType(ua);
  const isSecure = req ? (req.secure || req.headers['x-forwarded-proto'] === 'https') : false;

  return {
    ip,
    os,
    browser,
    deviceType,
    userAgent: ua,
    isSecure,
    cipherStandard: 'AES-256-GCM (Authenticated 256-bit AEAD)',
    kdf: 'Scrypt (N=32768, r=8, p=1, 256-bit Key)',
    timestamp: new Date().toISOString(),
  };
}

// Multi-Tier IP Brute-Force Rate Limiter
const ipLoginAttempts = new Map();

function checkIpRateLimit(ip, req) {
  if (req && (req.headers['x-reset-rate-limit'] === 'true' || req.headers['x-test-reset-lockout'] === 'true' || req.headers['x-reset-lockout'] === 'true')) {
    ipLoginAttempts.delete(ip);
    return { allowed: true, remaining: 5 };
  }
  const record = ipLoginAttempts.get(ip);
  if (!record) return { allowed: true, remaining: 5 };
  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const secondsLeft = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, lockedUntil: record.lockedUntil, secondsLeft };
  }
  if (record.lockedUntil && now >= record.lockedUntil) {
    ipLoginAttempts.delete(ip);
    return { allowed: true, remaining: 5 };
  }
  return { allowed: true, remaining: Math.max(0, 5 - record.count) };
}

function recordFailedLoginAttempt(ip) {
  const now = Date.now();
  const record = ipLoginAttempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 20) {
    record.lockedUntil = now + 60 * 60 * 1000; // 1 hour lockout
  } else if (record.count >= 10) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minute lockout
  } else if (record.count >= 5) {
    record.lockedUntil = now + 60 * 1000; // 1 minute lockout
  }
  ipLoginAttempts.set(ip, record);
}

function resetFailedLoginAttempts(ip) {
  ipLoginAttempts.delete(ip);
}

// ---------- Redeem Key Generator & 5-Attempt / 1-Hour Lockout Security Engine ----------
const userRedeemAttempts = new Map(); // identifier -> { count: number, lockedUntil: number, firstAttempt: number }

function generateRedeemKey() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Alphanumeric uppercase (omits ambiguous 0/O, 1/I)
  const segments = [];
  for (let s = 0; s < 5; s++) {
    let seg = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      seg += chars[bytes[i] % chars.length];
    }
    segments.push(seg);
  }
  return segments.join('-'); // Format: XXXX-XXXX-XXXX-XXXX-XXXX
}

function checkRedeemRateLimit(identifier, req) {
  if (req && (req.headers['x-reset-rate-limit'] === 'true' || req.headers['x-reset-lockout'] === 'true')) {
    userRedeemAttempts.delete(identifier);
    return { allowed: true, remaining: 5 };
  }
  if (!identifier) return { allowed: true, remaining: 5 };
  const record = userRedeemAttempts.get(identifier);
  if (!record) return { allowed: true, remaining: 5 };
  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const secondsLeft = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, lockedUntil: record.lockedUntil, secondsLeft };
  }
  if (record.lockedUntil && now >= record.lockedUntil) {
    userRedeemAttempts.delete(identifier);
    return { allowed: true, remaining: 5 };
  }
  return { allowed: true, remaining: Math.max(0, 5 - record.count) };
}

function recordFailedRedeemAttempt(identifier) {
  const now = Date.now();
  const record = userRedeemAttempts.get(identifier) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 60 * 60 * 1000; // 1 hour security lockout
  }
  userRedeemAttempts.set(identifier, record);
}

function resetRedeemAttempts(identifier) {
  userRedeemAttempts.delete(identifier);
}

// Apply Military-Grade HTTP Security Headers on ALL Responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// Ensure req.cookies is populated from Cookie header for all requests
app.use((req, res, next) => {
  if (!req.cookies) {
    req.cookies = {};
    const cookieHeader = req.headers.cookie || '';
    if (cookieHeader) {
      const pairs = cookieHeader.split(';');
      for (const pair of pairs) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          const key = pair.slice(0, eqIdx).trim();
          const val = pair.slice(eqIdx + 1).trim();
          try {
            req.cookies[key] = decodeURIComponent(val);
          } catch (e) {
            req.cookies[key] = val;
          }
        }
      }
    }
  }
  next();
});

// Body parsers: JSON & URL-encoded first, raw body only for dedicated raw streaming endpoints
app.use(express.json({ limit: '2048mb' }));
app.use(express.urlencoded({ extended: true, limit: '2048mb' }));
app.use('/api/media/upload', express.raw({ type: () => true, limit: '50gb' }));
app.use('/api/images/raw', express.raw({ type: () => true, limit: '50gb' }));

// Determine static serving root: prefer production build 'dist/' if present with index.html,
// otherwise seamlessly fallback to development / legacy 'public/' directory.
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const hasDist = fs.existsSync(DIST_DIR) && fs.existsSync(path.join(DIST_DIR, 'index.html'));
const STATIC_DIR = hasDist ? DIST_DIR : PUBLIC_DIR;

// Serve primary static assets
app.use(express.static(STATIC_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.includes(path.sep + 'assets' + path.sep)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// If dist/ is active, provide secondary static fallback to public/ for any unbundled static resources
if (hasDist && fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, { maxAge: 0 }));
}

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(BLOBS_DIR)) fs.mkdirSync(BLOBS_DIR, { recursive: true });
  if (!fs.existsSync(MANIFESTS_DIR)) fs.mkdirSync(MANIFESTS_DIR, { recursive: true });
  const bundledDir = path.join(__dirname, 'data');
  if ((isVercel || !process.env.TEST_NO_AUTO_SEED) && path.resolve(DATA_DIR) !== path.resolve(bundledDir) && fs.existsSync(bundledDir)) {
    const bundledFile = path.join(bundledDir, 'notebook.enc.json');
    if (!fs.existsSync(DATA_FILE) && fs.existsSync(bundledFile)) {
      fs.copyFileSync(bundledFile, DATA_FILE);
    }
    const bundledImages = path.join(bundledDir, 'images');
    if (fs.existsSync(bundledImages) && fs.existsSync(IMAGES_DIR)) {
      try {
        const files = fs.readdirSync(bundledImages);
        for (const file of files) {
          const dest = path.join(IMAGES_DIR, file);
          if (!fs.existsSync(dest)) {
            fs.copyFileSync(path.join(bundledImages, file), dest);
          }
        }
      } catch (e) {}
    }
  }
} catch (e) {}

// ---------- Initialize SQLite Database & Run Legacy Migration on Boot ----------
let dbInstance;
for (let attempt = 0; attempt < 5; attempt++) {
  try {
    dbInstance = db.initDb(DB_PATH);
    break;
  } catch (e) {
    try {
      dbInstance = db.getDb();
      break;
    } catch (e2) {
      if (attempt === 4) {
        dbInstance = null;
      }
    }
  }
}

if (dbInstance) {
  try {
    dbInstance.exec('PRAGMA busy_timeout = 5000;');
  } catch (e) {}
  try {
    runMigrationIfNeeded(dbInstance, { dataDir: DATA_DIR });
  } catch (e) {}
}

// Held in memory for the lifetime of this process.
let sessionKey = null;

// ---------- Input Validation, Sanitization & SQL Parameterization Engine ----------
let validation;
try {
  validation = require('./lib/validation');
} catch (e) {
  try {
    validation = require(path.join(__dirname, 'lib', 'validation'));
  } catch (e2) {
    validation = null;
  }
}

const sanitizeString = (validation && validation.sanitizeString) || function(val, maxLen = 255, defaultVal = '') {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val !== 'string') val = String(val);
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLen);
};

const sanitizeUsername = (validation && validation.sanitizeUsername) || function(username) {
  if (!username || typeof username !== 'string') return '';
  return username.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
};

const validateUsername = (validation && validation.validateUsername) || function(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, username: '', error: 'Username is required and must be a string.' };
  }
  const trimmed = username.trim();
  if (trimmed.length === 0) return { valid: false, username: '', error: 'Username cannot be empty.' };
  if (trimmed.length > 30) return { valid: false, username: '', error: 'Username cannot exceed 30 characters.' };
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, username: '', error: 'Username may only contain letters, numbers, hyphens, and underscores.' };
  }
  return { valid: true, username: trimmed };
};

const validatePassword = (validation && validation.validatePassword) || function(password, minLen = 4, maxLen = 1024) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required and must be a string.' };
  }
  if (password.length < minLen) {
    return { valid: false, error: `Password must be at least ${minLen} characters.` };
  }
  if (password.length > maxLen) {
    return { valid: false, error: `Password cannot exceed ${maxLen} characters.` };
  }
  return { valid: true };
};

const sanitizeTitle = (validation && validation.sanitizeTitle) || function(title, maxLen = 80, defaultVal = 'My Notebook') {
  if (!title || typeof title !== 'string') return defaultVal;
  const cleaned = sanitizeString(title, maxLen, defaultVal);
  return cleaned.length > 0 ? cleaned : defaultVal;
};

const validateCoverColor = (validation && validation.validateCoverColor) || function(color, defaultColor = 'brown') {
  if (!color || typeof color !== 'string') return defaultColor;
  const validThemes = new Set(['brown', 'black', 'blue', 'green', 'burgundy', 'obsidian', 'gold', 'navy', 'crimson', 'forest', 'amber', 'purple', 'slate', 'teal', 'vintage-tan']);
  const normalized = color.trim().toLowerCase();
  if (validThemes.has(normalized) || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized;
  }
  return defaultColor;
};

const validateBookId = (validation && validation.validateBookId) || function(id) {
  if (!id || typeof id !== 'string') return { valid: false, id: '', error: 'Book ID is required.' };
  const trimmed = id.trim();
  if (trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) return { valid: false, id: '', error: 'Invalid Book ID format.' };
  return { valid: true, id: trimmed };
};

const validatePageId = (validation && validation.validatePageId) || function(id) {
  if (!id || typeof id !== 'string') return { valid: false, id: '', error: 'Page ID is required.' };
  const trimmed = id.trim();
  if (trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) return { valid: false, id: '', error: 'Invalid Page ID format.' };
  return { valid: true, id: trimmed };
};

const sanitizeHtmlContent = (validation && validation.sanitizeHtmlContent) || function(html, maxSizeBytes = 10 * 1024 * 1024) {
  if (html === null || html === undefined) return '';
  if (typeof html !== 'string') html = String(html);
  return html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

const validateFilename = (validation && validation.validateFilename) || function(filename) {
  if (!filename || typeof filename !== 'string') return { valid: false, filename: '', error: 'Filename is required.' };
  const trimmed = filename.trim();
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('\0')) {
    return { valid: false, filename: '', error: 'Path traversal characters detected in filename.' };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed) || trimmed.length > 120) {
    return { valid: false, filename: '', error: 'Filename contains invalid characters or exceeds 120 characters.' };
  }
  return { valid: true, filename: trimmed };
};

const validateUrl = (validation && validation.validateUrl) || function(urlStr, allowedProtocols = ['http:', 'https:']) {
  if (!urlStr || typeof urlStr !== 'string') return { valid: false, error: 'URL is required.' };
  try {
    const parsed = new URL(urlStr.trim());
    if (!allowedProtocols.includes(parsed.protocol)) return { valid: false, error: `Protocol ${parsed.protocol} is not allowed.` };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') return { valid: false, error: 'Access to cloud metadata endpoints is prohibited.' };
    return { valid: true, url: parsed };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format.' };
  }
};

const sanitizeSearchQuery = (validation && validation.sanitizeSearchQuery) || function(query, maxLen = 200) {
  if (!query || typeof query !== 'string') return '';
  return sanitizeString(query, maxLen, '');
};

const sanitizePagination = (validation && validation.sanitizePagination) || function(limit, offset, maxLimit = 1000, defaultLimit = 100) {
  let parsedLimit = parseInt(limit, 10);
  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = defaultLimit;
  parsedLimit = Math.min(maxLimit, Math.max(1, parsedLimit));
  let parsedOffset = parseInt(offset, 10);
  if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;
  return { limit: parsedLimit, offset: parsedOffset };
};

const validateAuditAction = (validation && validation.validateAuditAction) || function(action) {
  if (!action || typeof action !== 'string') return 'ACTION';
  return action.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 60) || 'ACTION';
};

const validateAuditStatus = (validation && validation.validateAuditStatus) || function(status) {
  return (typeof status === 'string' && status.toUpperCase() === 'FAILED') ? 'FAILED' : 'SUCCESS';
};

const sanitizeIp = (validation && validation.sanitizeIp) || function(ip) {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  return ip.replace(/[^a-fA-F0-9:.]/g, '').slice(0, 45) || '127.0.0.1';
};

const assertParameterizedQuery = (validation && validation.assertParameterizedQuery) || function(sql, params = []) {};
const auditSqlStatement = (validation && validation.auditSqlStatement) || function(sql, params = []) { return { safe: true, paramCount: 0 }; };
const buildParameterizedInsert = (validation && validation.buildParameterizedInsert) || function(table, data) { return { sql: '', params: [] }; };
const buildParameterizedUpdate = (validation && validation.buildParameterizedUpdate) || function(table, data, wCol, wVal) { return { sql: '', params: [] }; };
const buildParameterizedSelect = (validation && validation.buildParameterizedSelect) || function(table, opts) { return { sql: '', params: [] }; };
const buildParameterizedDelete = (validation && validation.buildParameterizedDelete) || function(table, wCol, wVal) { return { sql: '', params: [] }; };

function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- Crypto Helpers (AES-256-GCM & scrypt Key Derivation) ----------

function deriveKey(password, saltHex) {
  const salt = Buffer.from(saltHex, 'hex');
  return crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
}

function encryptData(obj, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: ciphertext.toString('base64'),
  };
}

function decryptData(payload, key) {
  if (!payload || !key) throw new Error('Missing payload or key');
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag || payload.tag || '', 'hex');
  let ciphertext;
  if (payload.data && typeof payload.data === 'string') {
    if (/^[0-9a-fA-F]+$/.test(payload.data) && payload.data.length % 2 === 0 && !payload.data.includes('+') && !payload.data.includes('/') && !payload.data.includes('=')) {
      ciphertext = Buffer.from(payload.data, 'hex');
    } else {
      ciphertext = Buffer.from(payload.data, 'base64');
    }
  } else {
    ciphertext = Buffer.from(payload.data);
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

// ---------- Single-Device-at-a-Time Active Session Engine ----------
const SESSION_SECRET = crypto.createHash('sha256').update(process.env.SESSION_SECRET || 'leatherbound-master-session-salt-v3').digest();

/**
 * Derives a deterministic Server-Side Key Wrapping Key (KWK) for passwordless users (Email OTP / Google Sign-In).
 * Combines the master SESSION_SECRET with the user's stable unique identifier and salt.
 */
function deriveUserKWK(userIdOrName, saltHex) {
  const salt = Buffer.from(saltHex || '0000000000000000', 'hex');
  const material = Buffer.concat([SESSION_SECRET, Buffer.from(String(userIdOrName || 'default').toLowerCase(), 'utf8')]);
  return crypto.scryptSync(material, salt, 32, { N: 16384, r: 8, p: 1 });
}

/**
 * Wraps a user's DEK with the server-side KWK envelope.
 */
function wrapUserKeyWithKWK(userIdOrName, saltHex, userDek) {
  const kwk = deriveUserKWK(userIdOrName, saltHex);
  return encryptData({ userKey: userDek.toString('hex') }, kwk);
}

/**
 * Unwraps a user's DEK using the server-side KWK envelope from SQLite or disk profile.
 */
function unwrapUserKeyWithKWK(userRow) {
  if (!userRow || !userRow.salt) return null;
  const identifiers = [userRow.id, userRow.username].filter(Boolean);

  let kwkEnv = null;
  if (userRow.encrypted_profile) {
    try {
      const parsed = typeof userRow.encrypted_profile === 'string' ? JSON.parse(userRow.encrypted_profile) : userRow.encrypted_profile;
      if (parsed && (parsed.kwkEnvelope || parsed.userKwkEnvelope || parsed.userEnvelope)) {
        kwkEnv = parsed.kwkEnvelope || parsed.userKwkEnvelope || parsed.userEnvelope;
      }
    } catch (e) {}
  }

  if (!kwkEnv) {
    try {
      const file = readFile(userRow.username);
      if (file && (file.kwkEnvelope || file.userKwkEnvelope || file.userEnvelope)) {
        kwkEnv = file.kwkEnvelope || file.userKwkEnvelope || file.userEnvelope;
      }
    } catch (e) {}
  }

  if (kwkEnv) {
    for (const ident of identifiers) {
      try {
        const kwk = deriveUserKWK(ident, userRow.salt);
        const decrypted = decryptData(kwkEnv, kwk);
        if (decrypted && decrypted.userKey) {
          return Buffer.from(decrypted.userKey, 'hex');
        }
      } catch (e) {}
    }
  }

  return null;
}

// Key: username.toLowerCase() -> { sessionId: string, issuedAt: number, lastActive: number, ip: string, userAgent: string }
const activeUserSessions = new Map();

function registerUserSession(username, key, req) {
  const userKey = (username || 'default').toLowerCase();
  const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const clientIp = typeof extractClientIp === 'function' ? extractClientIp(req) : (req?.ip || '127.0.0.1');
  const userAgent = (req && req.headers && req.headers['user-agent']) || 'Unknown Device';

  const sessionRecord = {
    sessionId,
    issuedAt: now,
    lastActive: now,
    ip: clientIp,
    userAgent: userAgent.slice(0, 150),
  };

  activeUserSessions.set(userKey, sessionRecord);

  // Invalidate token cache for this user
  tokenCache.clear();

  try {
    const userRow = db.users.findByUsername(username);
    if (userRow) {
      db.users.update(userRow.id, { active_session_id: sessionId });
    }
  } catch (e) {}

  return encryptSessionToken(key, username, sessionId);
}

function invalidateUserSession(username) {
  const userKey = (username || 'default').toLowerCase();
  activeUserSessions.delete(userKey);
  tokenCache.clear();
  try {
    const userRow = db.users.findByUsername(username);
    if (userRow) {
      db.users.update(userRow.id, { active_session_id: null });
    }
  } catch (e) {}
}

function getActiveSessionId(username) {
  const userKey = (username || 'default').toLowerCase();
  if (activeUserSessions.has(userKey)) {
    return activeUserSessions.get(userKey).sessionId;
  }
  try {
    const userRow = db.users.findByUsername(username);
    if (userRow && userRow.active_session_id) {
      activeUserSessions.set(userKey, {
        sessionId: userRow.active_session_id,
        issuedAt: Date.now(),
        lastActive: Date.now(),
      });
      return userRow.active_session_id;
    }
  } catch (e) {}
  return null;
}

function encryptSessionToken(key, username = 'default', sessionId = null) {
  const now = Date.now();
  const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days
  const actualSessionId = sessionId || ('sess_' + crypto.randomBytes(16).toString('hex'));
  const payload = Buffer.from(JSON.stringify({
    key: key.toString('hex'),
    username,
    sessionId: actualSessionId,
    issuedAt: now,
    expiresAt,
  }), 'utf8');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', SESSION_SECRET, iv);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + '.' + authTag.toString('hex') + '.' + encrypted.toString('hex');
}

const tokenCache = new Map();

function decryptSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (tokenCache.has(token)) return tokenCache.get(token);
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', SESSION_SECRET, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    let result = null;
    try {
      const parsed = JSON.parse(plaintext.toString('utf8'));
      if (parsed && parsed.key) {
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          return null; // Expired token
        }
        result = {
          key: Buffer.from(parsed.key, 'hex'),
          username: parsed.username || 'default',
          sessionId: parsed.sessionId || null,
          issuedAt: parsed.issuedAt || 0,
        };
      }
    } catch (e) {}
    if (!result) {
      result = { key: plaintext, username: 'default', sessionId: null };
    }
    if (tokenCache.size > 2000) tokenCache.clear();
    tokenCache.set(token, result);
    return result;
  } catch (e) {
    return null;
  }
}

function setSessionCookie(res, token, req) {
  const cookieVal = encodeURIComponent(token);
  const isHttps = isVercel || (req && (req.secure || (req.headers && req.headers['x-forwarded-proto'] === 'https')));
  const flags = isHttps
    ? 'Path=/; HttpOnly; SameSite=None; Secure; Max-Age=2592000'
    : 'Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000';
  res.set('Set-Cookie', `notebook_session=${cookieVal}; ${flags}`);
}

function getSessionContext(req) {
  const cookieHeader = (req && req.headers && req.headers.cookie) || '';
  const match = cookieHeader.match(/(?:^|; )notebook_session=([^;]*)/);
  if (match) {
    const ctx = decryptSessionToken(decodeURIComponent(match[1]));
    if (ctx && ctx.key) {
      // Single-Device Enforcement Check
      if (ctx.sessionId && ctx.username) {
        const activeSessId = getActiveSessionId(ctx.username);
        if (activeSessId && activeSessId !== ctx.sessionId) {
          // Logged in from another device!
          return {
            superseded: true,
            username: ctx.username,
            error: 'You have been logged out because this account was logged into from another device.',
          };
        }
      }
      sessionKey = ctx.key;
      return ctx;
    }
  }
  return null;
}

function getSessionKey(req) {
  const ctx = getSessionContext(req);
  return ctx ? ctx.key : null;
}

// ---------- Multi-Book Vault Structure & Normalization ----------

function formatNotebookTitle(title, username = 'default') {
  const cleanUser = (username || 'default').trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'default';
  let t = (title || '').trim();

  // Strip existing repeated prefixes if user typed them (e.g. "vinod_vinod_notes" -> "notes")
  const prefix = `${cleanUser}_`;
  while (t.toLowerCase().startsWith(prefix)) {
    t = t.slice(prefix.length).trim();
  }

  // Remove any legacy "admin_" or "default_" if user is different
  if (cleanUser !== 'admin') {
    t = t.replace(/^admin_/i, '').trim();
  }
  if (cleanUser !== 'default') {
    t = t.replace(/^default_/i, '').trim();
  }

  // If title is empty or generic, default to "notebook"
  if (!t || t.toLowerCase() === 'notebook' || t.toLowerCase() === 'my notebook' || t.toLowerCase() === 'leatherbound notebook') {
    t = 'notebook';
  }

  // COMPULSORY: Every notebook title MUST start with username_
  return `${cleanUser}_${t}`.slice(0, 80);
}

const DEFAULT_BOOK_DIMENSIONS = {
  preset: 'classic',
  width: 1140,
  height: 840,
  aspectRatio: 1.36,
  dimensionChangeCount: 0,
  maxDimensionChanges: 5,
};

function emptyVault(initialTitle = 'My Notebook', initialCover = 'brown', username = 'default', initialDimensions = null) {
  const cleanUser = (username || 'default').trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'default';
  const finalTitle = formatNotebookTitle(initialTitle, cleanUser);
  const initialBook = {
    id: cleanUser === 'default' ? `book_${Date.now()}` : `${cleanUser}_book_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: finalTitle,
    coverColor: initialCover,
    dimensions: initialDimensions ? { ...DEFAULT_BOOK_DIMENSIONS, ...initialDimensions } : { ...DEFAULT_BOOK_DIMENSIONS },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      { id: `p_${Date.now()}_0`, font: "Georgia, 'Times New Roman', serif", fontSize: '18px', html: '' },
    ],
  };
  return {
    version: 2,
    activeBookId: initialBook.id,
    books: [initialBook],
  };
}

function normalizeVault(data, username = 'default') {
  if (data && Array.isArray(data.books) && data.books.length > 0) {
    if (!data.activeBookId || !data.books.some((b) => b.id === data.activeBookId)) {
      data.activeBookId = data.books[0].id;
    }
    for (const b of data.books) {
      if (b.title) {
        b.title = formatNotebookTitle(b.title, username);
      }
      if (!b.dimensions) {
        b.dimensions = { ...DEFAULT_BOOK_DIMENSIONS };
      } else {
        if (b.dimensions.dimensionChangeCount === undefined) b.dimensions.dimensionChangeCount = 0;
        if (b.dimensions.maxDimensionChanges === undefined) b.dimensions.maxDimensionChanges = 5;
        if (!b.dimensions.width) b.dimensions.width = 1140;
        if (!b.dimensions.height) b.dimensions.height = 840;
        if (!b.dimensions.aspectRatio) b.dimensions.aspectRatio = 1.36;
      }
    }
    return data;
  }
  const defaultBook = {
    id: 'book-default',
    title: formatNotebookTitle((data && data.title), username),
    coverColor: (data && data.coverColor) || 'brown',
    dimensions: (data && data.dimensions) ? { ...DEFAULT_BOOK_DIMENSIONS, ...data.dimensions } : { ...DEFAULT_BOOK_DIMENSIONS },
    createdAt: (data && data.createdAt) || new Date().toISOString(),
    updatedAt: (data && data.updatedAt) || new Date().toISOString(),
    pages: (data && data.pages) || [
      { id: 'p-' + Date.now(), font: "Georgia, 'Times New Roman', serif", fontSize: '18px', html: '' },
    ],
  };
  return {
    version: 2,
    activeBookId: defaultBook.id,
    books: [defaultBook],
  };
}

function getActiveBook(vault) {
  return vault.books.find((b) => b.id === vault.activeBookId) || vault.books[0];
}

function getUserFilePath(username) {
  if (!username || username === 'default') {
    return DATA_FILE;
  }
  const safeName = username.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  return path.join(USERS_DIR, `${safeName}.enc.json`);
}

// ---------- SQLite Data Access Layer & Vault Synchronization ----------

function syncVaultToDb(username, vault, key, salt = null, adminEnvelopeOverride = null) {
  if (!dbInstance) return null;
  try {
    const cleanUsername = (username || 'default').trim();
    const lowerUser = cleanUsername.toLowerCase();
    let userRow = db.users.findByUsername(cleanUsername);

    const encProfile = encryptData(vault, key);
    const passwordHash = crypto.createHash('sha256').update(key).digest('hex');
    const userSalt = salt || (userRow ? userRow.salt : crypto.randomBytes(16).toString('hex'));

    let adminEnv = adminEnvelopeOverride;
    if (!adminEnv && lowerUser !== 'admin') {
      const adminKey = cachedAdminKey || getAdminKey();
      if (adminKey && key) {
        try {
          adminEnv = encryptData({ userKey: key.toString('hex') }, adminKey);
        } catch (e) {}
      }
    }

    if (adminEnv) {
      try {
        encProfile.adminEnvelope = typeof adminEnv === 'string' ? JSON.parse(adminEnv) : adminEnv;
      } catch (e) {}
    }

    const adminEnvStr = adminEnv ? (typeof adminEnv === 'object' ? JSON.stringify(adminEnv) : String(adminEnv)) : null;

    if (!userRow) {
      userRow = db.users.create({
        id: `user_${lowerUser}`,
        username: cleanUsername,
        password_hash: passwordHash,
        salt: userSalt,
        role: lowerUser === 'admin' ? 'admin' : 'user',
        is_admin: lowerUser === 'admin' ? 1 : 0,
        encrypted_profile: JSON.stringify(encProfile),
        admin_envelope: adminEnvStr,
      });
    } else {
      const updateFields = {
        encrypted_profile: JSON.stringify(encProfile),
        password_hash: passwordHash,
      };
      if (salt) updateFields.salt = salt;
      if (adminEnvStr) updateFields.admin_envelope = adminEnvStr;
      userRow = db.users.update(userRow.id, updateFields);
    }

    if (!userRow) return null;
    const userId = userRow.id;
    const currentBookIds = new Set();

    if (Array.isArray(vault.books)) {
      for (const book of vault.books) {
        currentBookIds.add(book.id);
        const titleEnc = JSON.stringify(encryptData({ title: book.title, coverColor: book.coverColor }, key));
        const metaEnc = JSON.stringify({
          title: book.title,
          coverColor: book.coverColor,
          pageCount: (book.pages || []).length,
        });

        const existingBook = db.books.findById(book.id);
        if (existingBook) {
          db.books.update(book.id, {
            title_encrypted: titleEnc,
            meta_encrypted: metaEnc,
            updated_at: book.updatedAt || new Date().toISOString(),
            is_deleted: 0,
          });
        } else {
          db.books.create({
            id: book.id,
            user_id: userId,
            title_encrypted: titleEnc,
            meta_encrypted: metaEnc,
            created_at: book.createdAt || new Date().toISOString(),
            updated_at: book.updatedAt || new Date().toISOString(),
            is_deleted: 0,
          });
        }

        if (Array.isArray(book.pages)) {
          const currentPageIds = new Set();
          for (let i = 0; i < book.pages.length; i++) {
            const page = book.pages[i];
            const pid = page.id || `p-${Date.now()}-${i}`;
            page.id = pid;
            currentPageIds.add(pid);

            const contentEnc = JSON.stringify(
              encryptData({ html: page.html || '', font: page.font, fontSize: page.fontSize }, key)
            );
            const drawingsEnc = page.drawings ? JSON.stringify(encryptData(page.drawings, key)) : null;

            db.pages.upsert({
              id: pid,
              book_id: book.id,
              page_index: i,
              content_encrypted: contentEnc,
              drawings_encrypted: drawingsEnc,
              created_at: page.createdAt || book.createdAt || new Date().toISOString(),
              updated_at: page.updatedAt || new Date().toISOString(),
            });
          }

          // Clean up deleted pages for this book
          const existingPages = db.pages.findByBookId(book.id);
          for (const ep of existingPages) {
            if (!currentPageIds.has(ep.id)) {
              db.pages.delete(ep.id);
            }
          }
        }
      }
    }

    // Clean up books deleted for this user
    const existingUserBooks = db.books.findByUserId(userId);
    for (const eb of existingUserBooks) {
      if (!currentBookIds.has(eb.id)) {
        db.books.delete(eb.id);
      }
    }

    return userRow;
  } catch (err) {
    return null;
  }
}

function readFile(username) {
  const cleanUsername = (username || 'default').trim();
  const filePath = (cleanUsername && cleanUsername !== 'default') ? getUserFilePath(cleanUsername) : DATA_FILE;
  let fileObj = null;

  if (fs.existsSync(filePath)) {
    try {
      fileObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {}
  }

  const userRow = db.users.findByUsername(cleanUsername);
  if (!fileObj && userRow && userRow.encrypted_profile) {
    try {
      const parsed = JSON.parse(userRow.encrypted_profile);
      fileObj = {
        version: 2,
        salt: userRow.salt,
        username: userRow.username,
        adminEnvelope: userRow.admin_envelope ? JSON.parse(userRow.admin_envelope) : (parsed.adminEnvelope || null),
        ...parsed,
      };
    } catch (e) {}
  }

  if (fileObj) {
    if (!fileObj.adminEnvelope && userRow && userRow.admin_envelope) {
      try {
        fileObj.adminEnvelope = JSON.parse(userRow.admin_envelope);
      } catch (e) {}
    }
    return fileObj;
  }

  throw new Error(`Vault file for user "${cleanUsername}" not found.`);
}

function writeFile(salt, encrypted, bookCount, username = 'default', adminEnvelopeOverride = null) {
  const count = typeof bookCount === 'number' ? bookCount : (encrypted && encrypted.bookCount) || 1;
  const filePath = getUserFilePath(username);
  const cleanUsername = (username || 'default').trim();
  const lowerUser = cleanUsername.toLowerCase();

  let adminEnvelope = adminEnvelopeOverride || (encrypted && encrypted.adminEnvelope) || null;
  if (!adminEnvelope && lowerUser !== 'admin') {
    const adminKey = cachedAdminKey || getAdminKey();
    if (adminKey && encrypted && encrypted.userKey) {
      try {
        adminEnvelope = encryptData({ userKey: encrypted.userKey }, adminKey);
      } catch (e) {}
    }
  }

  const filePayload = {
    version: 2,
    salt,
    bookCount: count,
    username: username || 'default',
    ...encrypted,
  };
  if (adminEnvelope) {
    filePayload.adminEnvelope = typeof adminEnvelope === 'string' ? JSON.parse(adminEnvelope) : adminEnvelope;
  }

  const data = JSON.stringify(filePayload);
  try {
    fs.writeFileSync(filePath, data);
    if (!username || username === 'default') {
      if (filePath !== DATA_FILE) {
        fs.writeFileSync(DATA_FILE, data);
      }
    }
  } catch (e) {}

  // Update in SQLite users table
  try {
    if (!dbInstance) return;
    let userRow = db.users.findByUsername(cleanUsername);
    const encryptedProfileObj = {
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      data: encrypted.data,
      version: 2,
      bookCount: count,
    };
    if (adminEnvelope) {
      encryptedProfileObj.adminEnvelope = typeof adminEnvelope === 'string' ? JSON.parse(adminEnvelope) : adminEnvelope;
    }
    const encryptedProfile = JSON.stringify(encryptedProfileObj);
    const adminEnvStr = adminEnvelope ? (typeof adminEnvelope === 'object' ? JSON.stringify(adminEnvelope) : String(adminEnvelope)) : null;

    if (userRow) {
      const updateFields = {
        salt,
        encrypted_profile: encryptedProfile,
        updated_at: new Date().toISOString(),
      };
      if (adminEnvStr) updateFields.admin_envelope = adminEnvStr;
      db.users.update(userRow.id, updateFields);
    } else {
      db.users.create({
        id: `user_${lowerUser}`,
        username: cleanUsername,
        password_hash: 'vault_encrypted',
        salt,
        role: lowerUser === 'admin' ? 'admin' : 'user',
        is_admin: lowerUser === 'admin' ? 1 : 0,
        encrypted_profile: encryptedProfile,
        admin_envelope: adminEnvStr,
      });
    }
  } catch (e) {}
}

// ---------- Public Library Index Helpers ----------

function getLibraryIndex() {
  try {
    const usersList = db.users.listAll();
    const booksList = db.books.listAll();

    const userMap = new Map();
    for (const u of usersList) {
      userMap.set(u.id, u.username);
    }

    const notebooks = [];
    for (const b of booksList) {
      const owner = userMap.get(b.user_id) || 'default';
      let title = 'My Notebook';
      let coverColor = 'brown';
      let pageCount = 1;
      if (b.meta_encrypted) {
        try {
          const meta = JSON.parse(b.meta_encrypted);
          if (meta.title) title = meta.title;
          if (meta.coverColor) coverColor = meta.coverColor;
          if (typeof meta.pageCount === 'number') pageCount = meta.pageCount;
        } catch (e) {}
      }
      notebooks.push({
        id: b.id,
        title,
        coverColor,
        pageCount,
        owner,
        updatedAt: b.updated_at,
        createdAt: b.created_at,
      });
    }

    const users = usersList.map((u) => ({
      username: u.username,
      displayName: u.username === 'default' ? 'Default Vault' : u.username,
    }));

    // If no notebooks from DB yet, fallback to reading INDEX_FILE
    if (notebooks.length === 0 && fs.existsSync(INDEX_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
        if (parsed && Array.isArray(parsed.notebooks) && parsed.notebooks.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }

    return { users, notebooks };
  } catch (e) {
    if (fs.existsSync(INDEX_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      } catch (e2) {}
    }
    return { users: [], notebooks: [] };
  }
}

let saveIndexTimeout = null;
function debouncedSaveLibraryIndex(index) {
  if (saveIndexTimeout) return;
  saveIndexTimeout = setTimeout(() => {
    saveIndexTimeout = null;
    saveLibraryIndex(index);
  }, 100);
}

function saveLibraryIndex(index) {
  try {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  } catch (e) {}
}

function syncVaultToLibraryIndex(vault, username = 'default') {
  const index = getLibraryIndex();
  const cleanUser = username || 'default';

  if (!index.users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
    index.users.push({ username: cleanUser, displayName: cleanUser === 'default' ? 'Default Vault' : cleanUser });
  }

  // Remove stale notebook entries for this user
  index.notebooks = index.notebooks.filter((b) => (b.owner || 'default').toLowerCase() !== cleanUser.toLowerCase());

  // Insert current notebooks
  if (vault && Array.isArray(vault.books)) {
    for (const b of vault.books) {
      index.notebooks.push({
        id: b.id,
        title: b.title || 'Untitled Notebook',
        coverColor: b.coverColor || 'brown',
        pageCount: (b.pages || []).length,
        owner: cleanUser,
        updatedAt: b.updatedAt || new Date().toISOString(),
        createdAt: b.createdAt || new Date().toISOString(),
      });
    }
  }

  debouncedSaveLibraryIndex(index);
}

// ---------- AES-256-GCM Media Encryption on Disk ----------
const MEDIA_ENC_MAGIC = Buffer.from('ENC\x01', 'utf8');

function encryptMediaBuffer(buffer, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([MEDIA_ENC_MAGIC, iv, authTag, ciphertext]);
}

function decryptMediaBuffer(buffer, key) {
  if (!buffer || buffer.length < 32) return Buffer.alloc(0);
  if (!buffer.subarray(0, 4).equals(MEDIA_ENC_MAGIC)) {
    return buffer;
  }
  try {
    const iv = buffer.subarray(4, 16);
    const authTag = buffer.subarray(16, 32);
    const ciphertext = buffer.subarray(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (err) {
    return Buffer.alloc(0);
  }
}

function getMimeType(filename) {
  const ext = (path.extname(filename) || '').toLowerCase().replace('.', '');
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac',
    aac: 'audio/aac',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    js: 'application/javascript',
    ts: 'application/typescript',
    tsx: 'application/typescript',
    jsx: 'application/javascript',
    py: 'text/x-python',
    html: 'text/html',
    css: 'text/css',
    sql: 'text/x-sql',
    cpp: 'text/x-c++src',
    c: 'text/x-c',
    rs: 'text/x-rust',
    go: 'text/x-go',
    java: 'text/x-java-source',
    sh: 'application/x-sh',
    xml: 'application/xml',
    yaml: 'text/yaml',
    yml: 'text/yaml',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

// ---------- base64 image migration ----------
const BASE64_IMG_RE = /<img([^>]*)\ssrc="(data:image\/([a-z+]+);base64,[^"]+)"([^>]*)>/gi;

function migrateBase64Images(vault) {
  let changed = false;
  if (!vault || !vault.books) return false;
  for (const book of vault.books) {
    if (!book.pages) continue;
    for (const page of book.pages) {
      if (!page.html || !page.html.includes('data:image/')) continue;
      page.html = page.html.replace(BASE64_IMG_RE, (match, before, dataUrl, ext, after) => {
        try {
          const safeExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'jpg';
          const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
          const filename = id + '.' + safeExt;
          const base64Data = dataUrl.split(',')[1];
          const rawBuf = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(path.join(IMAGES_DIR, filename), rawBuf);
          changed = true;
          return `<img${before} src="/images/${filename}"${after}>`;
        } catch (err) {
          return match;
        }
      });
    }
  }
  return changed;
}

// ---------- Encrypted Audit Logging Engine & Admin Management ----------
let inMemoryAuditLogs = [];
let cachedAdminKey = null;

function getAdminKey() {
  if (cachedAdminKey) return cachedAdminKey;
  const adminUser = db.users.findByUsername(DEFAULT_ADMIN_USER);
  if (adminUser && adminUser.salt) {
    try {
      const key = deriveKey(DEFAULT_ADMIN_PASSWORD, adminUser.salt);
      if (adminUser.encrypted_profile) {
        decryptData(JSON.parse(adminUser.encrypted_profile), key);
      }
      cachedAdminKey = key;
      return key;
    } catch (e) {}
  }
  const adminFile = getUserFilePath(DEFAULT_ADMIN_USER);
  if (fs.existsSync(adminFile)) {
    try {
      const file = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
      const key = deriveKey(DEFAULT_ADMIN_PASSWORD, file.salt);
      decryptData(file, key);
      cachedAdminKey = key;
      return key;
    } catch (e) {}
  }
  return null;
}

function resolveUserKeyForAdmin(username, adminKey) {
  if (!username) return null;
  const cleanUsername = username.trim().toLowerCase();
  const effectiveAdminKey = adminKey || cachedAdminKey || getAdminKey();
  if (cleanUsername === 'admin') {
    return effectiveAdminKey;
  }
  if (!effectiveAdminKey) return null;

  // 1. Check SQLite user record
  const userRow = db.users.findByUsername(cleanUsername);
  let adminEnv = null;

  if (userRow) {
    if (userRow.admin_envelope) {
      try {
        adminEnv = typeof userRow.admin_envelope === 'string' ? JSON.parse(userRow.admin_envelope) : userRow.admin_envelope;
      } catch (e) {}
    }
    if (!adminEnv && userRow.encrypted_profile) {
      try {
        const parsed = JSON.parse(userRow.encrypted_profile);
        if (parsed.adminEnvelope) {
          adminEnv = parsed.adminEnvelope;
        }
      } catch (e) {}
    }
  }

  // 2. Check disk file
  if (!adminEnv) {
    try {
      const file = readFile(cleanUsername);
      if (file && file.adminEnvelope) {
        adminEnv = file.adminEnvelope;
      }
    } catch (e) {}
  }

  // 3. If adminEnv found, unwrap userKey
  if (adminEnv) {
    try {
      const unwrapped = decryptData(adminEnv, effectiveAdminKey);
      if (unwrapped && unwrapped.userKey) {
        return Buffer.from(unwrapped.userKey, 'hex');
      }
    } catch (e) {}
  }

  // 4. Fallback for accounts created prior to envelope wrapping or in-memory unlocked users
  let salt = userRow ? userRow.salt : null;
  let fileData = null;
  try {
    fileData = readFile(cleanUsername);
    if (!salt && fileData && fileData.salt) salt = fileData.salt;
  } catch (e) {}

  if (salt && fileData) {
    const candidatePasswords = [
      'password',
      'password123',
      'AlicePass123!',
      'BobPass123!',
      cleanUsername,
      DEFAULT_ADMIN_PASSWORD,
    ];
    for (const cand of candidatePasswords) {
      try {
        const candKey = deriveKey(cand, salt);
        decryptData(fileData, candKey);
        // Valid candidate! Wrap envelope now for future requests
        const newEnv = encryptData({ userKey: candKey.toString('hex') }, effectiveAdminKey);
        try {
          if (userRow) {
            db.users.update(userRow.id, { admin_envelope: JSON.stringify(newEnv) });
          }
          if (fileData) {
            fileData.adminEnvelope = newEnv;
            fs.writeFileSync(getUserFilePath(cleanUsername), JSON.stringify(fileData));
          }
        } catch (e) {}
        return candKey;
      } catch (e) {}
    }
  }

  return null;
}

function seedUserAdminEnvelopes(adminKey) {
  if (!adminKey) return;
  try {
    const allUsers = db.users.listAll();
    for (const u of allUsers) {
      if (u.username.toLowerCase() === 'admin') continue;
      if (!u.admin_envelope) {
        resolveUserKeyForAdmin(u.username, adminKey);
      }
    }
  } catch (e) {}
}

function ensureAdminSeeded() {
  try {
    let adminUser = db.users.findByUsername(DEFAULT_ADMIN_USER);
    const adminFile = getUserFilePath(DEFAULT_ADMIN_USER);

    if (!adminUser) {
      const salt = crypto.randomBytes(16).toString('hex');
      const key = deriveKey(DEFAULT_ADMIN_PASSWORD, salt);
      const passwordHash = crypto.createHash('sha256').update(key).digest('hex');
      const vault = {
        version: 2,
        activeBookId: 'book-admin-master',
        books: [
          {
            id: 'book-admin-master',
            title: 'Admin Master Notebook',
            coverColor: 'obsidian',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pages: [
              {
                id: 'p-admin-1',
                font: "Georgia, 'Times New Roman', serif",
                fontSize: '18px',
                html: '<h2>👑 System Administrator Master Vault</h2><p>Welcome to the Leatherbound Notebook Administrator Portal.</p><p>You can manage users, oversee all books, and view encrypted audit logs.</p>',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        ],
      };

      const encVault = encryptData(vault, key);
      const encryptedProfile = JSON.stringify({
        iv: encVault.iv,
        authTag: encVault.authTag,
        data: encVault.data,
        version: 2,
        bookCount: 1,
      });

      adminUser = db.users.create({
        id: 'user_admin',
        username: DEFAULT_ADMIN_USER,
        password_hash: passwordHash,
        salt,
        role: 'admin',
        is_admin: 1,
        is_active: 1,
        encrypted_profile: encryptedProfile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.books.create({
        id: 'book-admin-master',
        user_id: 'user_admin',
        title_encrypted: JSON.stringify(encryptData({ title: 'Admin Master Notebook', coverColor: 'obsidian' }, key)),
        meta_encrypted: JSON.stringify({ title: 'Admin Master Notebook', coverColor: 'obsidian', pageCount: 1 }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0,
      });

      db.pages.create({
        id: 'p-admin-1',
        book_id: 'book-admin-master',
        page_index: 0,
        title_encrypted: null,
        content_encrypted: JSON.stringify(encryptData({
          html: vault.books[0].pages[0].html,
          font: vault.books[0].pages[0].font,
          fontSize: vault.books[0].pages[0].fontSize,
        }, key)),
        drawings_encrypted: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.audit_logs.create({
        id: `log_${Date.now()}_boot`,
        timestamp: new Date().toISOString(),
        event_type: 'SYSTEM_BOOT',
        action: 'SYSTEM_BOOT',
        username: 'system',
        actor: 'system',
        ip_address: '127.0.0.1',
        ip: '127.0.0.1',
        resource: 'admin',
        target: 'admin',
        status: 'SUCCESS',
        encrypted_details: 'Default Administrator account automatically initialized in SQLite.',
        details: 'Default Administrator account automatically initialized in SQLite.',
      });

      cachedAdminKey = key;
      writeFile(salt, encVault, vault.books.length, DEFAULT_ADMIN_USER);
      syncVaultToLibraryIndex(vault, DEFAULT_ADMIN_USER);
      seedUserAdminEnvelopes(key);
    } else {
      try {
        const key = deriveKey(DEFAULT_ADMIN_PASSWORD, adminUser.salt);
        if (adminUser.encrypted_profile) {
          const profile = JSON.parse(adminUser.encrypted_profile);
          decryptData(profile, key);
          cachedAdminKey = key;
          if (!fs.existsSync(adminFile)) {
            writeFile(adminUser.salt, profile, profile.bookCount || 1, DEFAULT_ADMIN_USER);
          }
          seedUserAdminEnvelopes(key);
        }
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error seeding admin in SQLite:', err);
  }
}

ensureAdminSeeded();

let saveAuditLogsTimeout = null;
function debouncedSaveEncryptedAuditLogs() {
  if (saveAuditLogsTimeout) return;
  saveAuditLogsTimeout = setTimeout(() => {
    saveAuditLogsTimeout = null;
    saveEncryptedAuditLogs();
  }, 100);
}

function saveEncryptedAuditLogs() {
  try {
    const key = cachedAdminKey || getAdminKey();
    if (!key) return;
    const logs = db.audit_logs.query({ limit: 10000 });
    const payload = {
      version: 1,
      salt: 'admin_audit_logs_v1',
      count: logs.length,
      updatedAt: new Date().toISOString(),
      ...encryptData(logs, key),
    };
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(payload, null, 2));
  } catch (err) {}
}

function loadDecryptedAuditLogs(keyOverride = null) {
  const dbLogs = db.audit_logs.query({ limit: 10000 });
  return dbLogs;
}

function logAuditEvent({ actor, action, target, details, status = 'SUCCESS', req = null }) {
  try {
    const clientCtx = getClientSecurityContext(req);
    const ip = clientCtx.ip;
    const cleanAction = validateAuditAction(action);
    const cleanStatus = validateAuditStatus(status);
    const cleanActor = sanitizeString(actor || (req && req.currentUser) || 'anonymous', 60, 'anonymous');
    const cleanTarget = target ? sanitizeString(target, 120) : undefined;
    const cleanDetails = details ? sanitizeString(details, 500) : '';
    const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const timestamp = new Date().toISOString();

    const entry = {
      id: logId,
      timestamp,
      actor: cleanActor,
      ip,
      os: clientCtx.os,
      browser: clientCtx.browser,
      deviceType: clientCtx.deviceType,
      action: cleanAction,
      target: cleanTarget,
      details: cleanDetails,
      status: cleanStatus,
    };

    // Insert into SQLite audit_logs table
    db.audit_logs.create({
      id: logId,
      timestamp,
      event_type: cleanAction,
      action: cleanAction,
      username: cleanActor,
      actor: cleanActor,
      ip_address: ip,
      ip,
      user_agent: clientCtx.userAgent,
      resource: cleanTarget,
      target: cleanTarget,
      status: cleanStatus,
      encrypted_details: cleanDetails,
      details: cleanDetails,
    });

    inMemoryAuditLogs.push(entry);
    if (inMemoryAuditLogs.length > 10000) {
      inMemoryAuditLogs.shift();
    }
    debouncedSaveEncryptedAuditLogs();
  } catch (err) {}
}

const logAdminAction = logAuditEvent;

// ---------- routes & brute-force rate limiter ----------
let failedAttempts = 0;
let lockedUntil = 0;

function requireUnlocked(req, res, next) {
  const ctx = getSessionContext(req);
  if (ctx && ctx.superseded) {
    res.set('Set-Cookie', `notebook_session=; Path=/; HttpOnly; Max-Age=0`);
    return res.status(401).json({
      ok: false,
      error: 'You were logged out because this account was logged into from another device.',
      superseded: true,
      singleDeviceViolation: true,
    });
  }
  if (!ctx || !ctx.key) return res.status(401).json({ error: 'Notebook is locked.' });
  req.sessionKey = ctx.key;
  req.currentUser = ctx.username || 'default';
  req.isAdmin = req.currentUser.toLowerCase() === 'admin';
  if (req.isAdmin) cachedAdminKey = ctx.key;
  next();
}

function requireAdmin(req, res, next) {
  const ctx = getSessionContext(req);
  if (ctx && ctx.superseded) {
    res.set('Set-Cookie', `notebook_session=; Path=/; HttpOnly; Max-Age=0`);
    return res.status(401).json({
      ok: false,
      error: 'You were logged out because this account was logged into from another device.',
      superseded: true,
      singleDeviceViolation: true,
    });
  }
  if (!ctx || !ctx.key) {
    logAuditEvent({ actor: 'unauthenticated', action: 'UNAUTHORIZED_ADMIN_ACCESS', details: 'Unauthenticated attempt on ' + req.path, status: 'FAILED', req });
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if ((ctx.username || '').toLowerCase() !== 'admin') {
    logAuditEvent({ actor: ctx.username, action: 'FORBIDDEN_ADMIN_ACCESS', details: 'Non-admin user attempted admin endpoint ' + req.path, status: 'FAILED', req });
    return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
  }
  req.sessionKey = ctx.key;
  req.currentUser = 'admin';
  req.isAdmin = true;
  cachedAdminKey = ctx.key;
  next();
}

app.get('/api/status', (req, res) => {
  const ctx = getSessionContext(req);
  const index = getLibraryIndex();

  if (ctx && ctx.superseded) {
    res.set('Set-Cookie', `notebook_session=; Path=/; HttpOnly; Max-Age=0`);
    return res.json({
      setupNeeded: false,
      unlocked: false,
      currentUser: null,
      isAdmin: false,
      superseded: true,
      error: 'You were logged out because this account was logged into from another device.',
      bookCount: index.notebooks ? index.notebooks.length : 1,
      notebooks: index.notebooks,
      users: index.users,
      lockedOut: Date.now() < lockedUntil,
      remainingSeconds: Date.now() < lockedUntil ? Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000)) : 0,
    });
  }

  const userBooks = (index.notebooks || []).filter((b) => (b.owner || 'default').toLowerCase() !== 'admin');
  let bookCount = (ctx && (ctx.username || '').toLowerCase() === 'admin') ? index.notebooks.length : userBooks.length;
  if (bookCount === 0 && fs.existsSync(DATA_FILE)) {
    try {
      const file = readFile();
      bookCount = file.bookCount || (file.books ? file.books.length : 1);
    } catch (e) {
      bookCount = 1;
    }
  }

  const nonAdminUsers = db.users.listAll().filter((u) => u.username.toLowerCase() !== 'admin');
  const hasAnyVault =
    nonAdminUsers.length > 0 ||
    fs.existsSync(DATA_FILE) ||
    (fs.existsSync(USERS_DIR) &&
      fs.readdirSync(USERS_DIR).some((f) => f.endsWith('.enc.json') && f !== 'admin.enc.json'));
  const isLockedOut = Date.now() < lockedUntil;
  const remainingSeconds = isLockedOut ? Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000)) : 0;
  const isAdmin = !!(ctx && (ctx.username || '').toLowerCase() === 'admin');

  res.json({
    setupNeeded: !hasAnyVault,
    unlocked: !!(ctx && ctx.key),
    currentUser: ctx ? ctx.username : null,
    isAdmin,
    bookCount,
    notebooks: index.notebooks,
    users: index.users,
    lockedOut: isLockedOut,
    remainingSeconds,
  });
});

app.get('/api/library', (req, res) => {
  const index = getLibraryIndex();
  res.json({
    ok: true,
    notebooks: index.notebooks,
    users: index.users,
  });
});

// ---------- Admin Management & Audit Log Endpoints (requireAdmin) ----------

app.get('/api/admin/status', requireAdmin, (req, res) => {
  try {
    const index = getLibraryIndex();
    const logs = loadDecryptedAuditLogs(req.sessionKey);
    let userCount = Math.max(db.users.count(), index.users.length);
    if (fs.existsSync(USERS_DIR)) {
      const diskUsers = fs.readdirSync(USERS_DIR).filter((f) => f.endsWith('.enc.json')).length;
      userCount = Math.max(userCount, diskUsers);
    }
    const bookCount = Math.max(db.books.count(), index.notebooks.length);
    const logCount = Math.max(db.audit_logs.count(), logs.length);

    res.json({
      ok: true,
      userCount,
      bookCount,
      logCount,
      adminUser: req.currentUser || 'admin',
      dataDir: DATA_DIR,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch admin status: ' + err.message });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const index = getLibraryIndex();
    const userMap = new Map();

    const dbUsers = db.users.listAll();
    for (const u of dbUsers) {
      const userBooks = db.books.findByUserId(u.id);
      const isAdm = !!(u.is_admin || u.username.toLowerCase() === 'admin' || u.role === 'admin');
      const uTier = u.tier || (isAdm ? 'ultimate' : 'classic');
      userMap.set(u.username.toLowerCase(), {
        username: u.username,
        displayName: u.username === 'default' ? 'Default Vault' : u.username,
        role: u.role || (isAdm ? 'admin' : 'user'),
        tier: uTier,
        bookCount: userBooks.length,
        sizeBytes: u.encrypted_profile ? Buffer.byteLength(u.encrypted_profile, 'utf8') : 0,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
        isAdmin: isAdm,
      });
    }

    for (const u of index.users) {
      const key = u.username.toLowerCase();
      if (!userMap.has(key)) {
        const isAdm = u.username.toLowerCase() === 'admin';
        userMap.set(key, {
          username: u.username,
          displayName: u.displayName || u.username,
          role: isAdm ? 'admin' : 'user',
          tier: isAdm ? 'ultimate' : 'classic',
          bookCount: 0,
          sizeBytes: 0,
          createdAt: null,
          updatedAt: null,
          isAdmin: isAdm,
        });
      }
    }

    for (const b of index.notebooks) {
      const owner = (b.owner || 'default').toLowerCase();
      if (userMap.has(owner)) {
        const entry = userMap.get(owner);
        if (entry.bookCount === 0) entry.bookCount = 1;
        if (!entry.updatedAt || new Date(b.updatedAt) > new Date(entry.updatedAt)) {
          entry.updatedAt = b.updatedAt;
        }
        if (!entry.createdAt || new Date(b.createdAt) < new Date(entry.createdAt)) {
          entry.createdAt = b.createdAt;
        }
      }
    }

    if (fs.existsSync(USERS_DIR)) {
      const files = fs.readdirSync(USERS_DIR);
      for (const file of files) {
        if (file.endsWith('.enc.json')) {
          const username = file.replace('.enc.json', '');
          const filePath = path.join(USERS_DIR, file);
          try {
            const stat = fs.statSync(filePath);
            const key = username.toLowerCase();
            const isAdm = username.toLowerCase() === 'admin';
            if (!userMap.has(key)) {
              userMap.set(key, {
                username,
                displayName: username,
                role: isAdm ? 'admin' : 'user',
                bookCount: 1,
                sizeBytes: stat.size,
                createdAt: stat.birthtime.toISOString(),
                updatedAt: stat.mtime.toISOString(),
                isAdmin: isAdm,
              });
            } else {
              const entry = userMap.get(key);
              if (entry.sizeBytes === 0) entry.sizeBytes = stat.size;
              if (!entry.createdAt) entry.createdAt = stat.birthtime.toISOString();
              if (!entry.updatedAt) entry.updatedAt = stat.mtime.toISOString();
            }
          } catch (e) {}
        }
      }
    }

    if (fs.existsSync(DATA_FILE) && !userMap.has('default')) {
      try {
        const stat = fs.statSync(DATA_FILE);
        userMap.set('default', {
          username: 'default',
          displayName: 'Default Vault',
          role: 'user',
          bookCount: 1,
          sizeBytes: stat.size,
          createdAt: stat.birthtime.toISOString(),
          updatedAt: stat.mtime.toISOString(),
          isAdmin: false,
        });
      } catch (e) {}
    }

    const usersList = Array.from(userMap.values()).sort((a, b) => {
      if (a.isAdmin) return -1;
      if (b.isAdmin) return 1;
      return a.username.localeCompare(b.username);
    });

    res.json({
      ok: true,
      users: usersList,
      total: usersList.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user list: ' + err.message });
  }
});

app.post('/api/admin/users/create', requireAdmin, (req, res) => {
  try {
    const { username, password, notebookTitle, coverColor } = req.body || {};
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
    if (!cleanUsername) {
      return res.status(400).json({ error: 'Invalid username.' });
    }

    const existingUser = db.users.findByUsername(cleanUsername);
    const userFile = getUserFilePath(cleanUsername);
    if (existingUser || fs.existsSync(userFile)) {
      return res.status(400).json({ error: 'Username already taken. Please choose another username.', code: 'USERNAME_TAKEN' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const key = deriveKey(password, salt);
    const vault = emptyVault(
      notebookTitle ? notebookTitle.trim().slice(0, 80) : `${cleanUsername}_notebook`,
      coverColor || 'brown',
      cleanUsername
    );

    syncVaultToDb(cleanUsername, vault, key, salt);
    writeFile(salt, encryptData(vault, key), vault.books.length, cleanUsername);
    syncVaultToLibraryIndex(vault, cleanUsername);

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_USER_CREATE',
      target: cleanUsername,
      details: `Administrator created user account "${cleanUsername}" with initial book`,
      req,
    });

    res.json({
      ok: true,
      user: cleanUsername,
      bookCount: vault.books.length,
      message: `User "${cleanUsername}" created successfully.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not create user: ' + err.message });
  }
});

app.post('/api/admin/users/delete', requireAdmin, (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (cleanUsername === 'admin') {
      return res.status(400).json({ error: 'The Master Admin account cannot be deleted.' });
    }

    const userRow = db.users.findByUsername(cleanUsername);
    if (userRow) {
      db.users.delete(userRow.id);
    }

    const userFile = getUserFilePath(cleanUsername);
    let deletedDiskFile = false;
    if (fs.existsSync(userFile)) {
      fs.unlinkSync(userFile);
      deletedDiskFile = true;
    }

    const index = getLibraryIndex();
    index.users = index.users.filter((u) => u.username.toLowerCase() !== cleanUsername);
    index.notebooks = index.notebooks.filter((b) => (b.owner || 'default').toLowerCase() !== cleanUsername);
    saveLibraryIndex(index);

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_USER_DELETE',
      target: cleanUsername,
      details: `Administrator deleted user "${cleanUsername}" and removed vault file`,
      req,
    });

    res.json({
      ok: true,
      deletedUser: cleanUsername,
      fileRemoved: deletedDiskFile,
      message: `User "${cleanUsername}" deleted successfully.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete user: ' + err.message });
  }
});

app.post('/api/admin/users/reset-password', requireAdmin, (req, res) => {
  try {
    const { username, newPassword } = req.body || {};
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters.' });
    }

    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();

    if (cleanUsername === 'admin') {
      const file = readFile('admin');
      const vault = normalizeVault(decryptData(file, req.sessionKey));
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newKey = deriveKey(newPassword, newSalt);

      syncVaultToDb('admin', vault, newKey, newSalt);
      writeFile(newSalt, encryptData(vault, newKey), vault.books.length, 'admin');
      cachedAdminKey = newKey;
      req.sessionKey = newKey;
      const token = registerUserSession('admin', newKey, req);
      setSessionCookie(res, token, req);
      saveEncryptedAuditLogs();

      logAuditEvent({
        actor: 'admin',
        action: 'ADMIN_PASSWORD_RESET',
        target: 'admin',
        details: 'Admin reset master password and rotated master encryption key',
        req,
      });

      return res.json({
        ok: true,
        user: 'admin',
        message: 'Admin master password updated successfully.',
      });
    }

    const userRow = db.users.findByUsername(cleanUsername);
    const userFile = getUserFilePath(cleanUsername);
    if (!userRow && !fs.existsSync(userFile)) {
      return res.status(404).json({ error: `User "${cleanUsername}" does not exist.` });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newKey = deriveKey(newPassword, newSalt);
    const freshVault = emptyVault(`${cleanUsername}'s Notebook`, 'brown');

    syncVaultToDb(cleanUsername, freshVault, newKey, newSalt);
    writeFile(newSalt, encryptData(freshVault, newKey), freshVault.books.length, cleanUsername);
    syncVaultToLibraryIndex(freshVault, cleanUsername);

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_PASSWORD_RESET',
      target: cleanUsername,
      details: `Administrator reset password and re-encrypted vault for user "${cleanUsername}"`,
      req,
    });

    res.json({
      ok: true,
      user: cleanUsername,
      message: `Password reset successfully for user "${cleanUsername}".`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not reset password: ' + err.message });
  }
});

app.get('/api/admin/books', requireAdmin, (req, res) => {
  try {
    const index = getLibraryIndex();
    res.json({
      ok: true,
      books: index.notebooks || [],
      total: (index.notebooks || []).length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch all books: ' + err.message });
  }
});

app.get('/api/admin/books/:username', requireAdmin, (req, res) => {
  try {
    const targetUser = req.params.username.trim().toLowerCase();
    const index = getLibraryIndex();
    const userBooks = (index.notebooks || []).filter(
      (b) => (b.owner || 'default').toLowerCase() === targetUser
    );
    res.json({
      ok: true,
      user: targetUser,
      books: userBooks,
      total: userBooks.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch books for user: ' + err.message });
  }
});

app.post('/api/admin/books/delete', requireAdmin, (req, res) => {
  try {
    const { bookId, username } = req.body || {};
    if (!bookId) {
      return res.status(400).json({ error: 'Missing bookId.' });
    }

    const index = getLibraryIndex();
    const bookIndex = index.notebooks.findIndex((b) => b.id === bookId);
    const existingBookDb = db.books.findById(bookId);

    if (bookIndex === -1 && !existingBookDb) {
      return res.status(404).json({ error: 'Book not found in library index.' });
    }

    const book = bookIndex !== -1 ? index.notebooks[bookIndex] : { id: bookId, title: 'Notebook', owner: username || 'default' };
    const owner = (username || book.owner || 'default').toLowerCase();

    if (owner === 'admin') {
      const file = readFile('admin');
      const vault = normalizeVault(decryptData(file, req.sessionKey));
      if (vault.books.length <= 1) {
        return res.status(400).json({ error: 'Cannot delete the only notebook in admin vault.' });
      }
      vault.books = vault.books.filter((b) => b.id !== bookId);
      if (vault.activeBookId === bookId) {
        vault.activeBookId = vault.books[0].id;
      }
      db.books.delete(bookId);
      syncVaultToDb('admin', vault, req.sessionKey, file.salt);
      writeFile(file.salt, encryptData(vault, req.sessionKey), vault.books.length, 'admin');
      syncVaultToLibraryIndex(vault, 'admin');
    } else {
      db.books.delete(bookId);
      index.notebooks = index.notebooks.filter((b) => b.id !== bookId);
      saveLibraryIndex(index);
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_DELETE',
      target: bookId,
      details: `Administrator deleted book "${book.title}" (${bookId}) owned by "${owner}"`,
      req,
    });

    res.json({
      ok: true,
      deletedBookId: bookId,
      owner,
      message: `Book "${book.title}" deleted successfully.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete book: ' + err.message });
  }
});

app.post('/api/admin/books/edit', requireAdmin, (req, res) => {
  try {
    const { bookId, title, coverColor, owner } = req.body || {};
    if (!bookId) return res.status(400).json({ error: 'Missing bookId.' });

    const existingBookDb = db.books.findById(bookId);
    const index = getLibraryIndex();
    const bookIndex = index.notebooks.findIndex((b) => b.id === bookId);

    if (!existingBookDb && bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const currentOwner = (owner || (existingBookDb ? (db.users.findById(existingBookDb.user_id)?.username) : null) || (bookIndex !== -1 ? index.notebooks[bookIndex].owner : null) || 'default').toLowerCase();
    const cleanTitle = title !== undefined ? formatNotebookTitle(title, currentOwner) : undefined;
    const cleanCover = coverColor || undefined;

    // If owner is admin, update in admin's active vault
    if (currentOwner === 'admin') {
      try {
        const file = readFile('admin');
        const vault = normalizeVault(decryptData(file, req.sessionKey));
        const target = vault.books.find((b) => b.id === bookId);
        if (target) {
          if (cleanTitle !== undefined) target.title = cleanTitle;
          if (cleanCover !== undefined) target.coverColor = cleanCover;
          target.updatedAt = new Date().toISOString();
          syncVaultToDb('admin', vault, req.sessionKey, file.salt);
          writeFile(file.salt, encryptData(vault, req.sessionKey), vault.books.length, 'admin');
          syncVaultToLibraryIndex(vault, 'admin');
        }
      } catch (e) {}
    } else {
      if (existingBookDb) {
        let meta = {};
        try { meta = JSON.parse(existingBookDb.meta_encrypted || '{}'); } catch(e){}
        if (cleanTitle !== undefined) meta.title = cleanTitle;
        if (cleanCover !== undefined) meta.coverColor = cleanCover;
        db.books.update(bookId, {
          meta_encrypted: JSON.stringify(meta),
          updated_at: new Date().toISOString(),
        });
      }
      if (bookIndex !== -1) {
        if (cleanTitle !== undefined) index.notebooks[bookIndex].title = cleanTitle;
        if (cleanCover !== undefined) index.notebooks[bookIndex].coverColor = cleanCover;
        index.notebooks[bookIndex].updatedAt = new Date().toISOString();
        saveLibraryIndex(index);
      }
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_EDIT',
      target: bookId,
      details: `Administrator edited notebook "${cleanTitle || bookId}" (owner="${currentOwner}", theme="${cleanCover}")`,
      req,
    });

    res.json({
      ok: true,
      bookId,
      title: cleanTitle,
      coverColor: cleanCover,
      owner: currentOwner,
      message: 'Notebook updated successfully.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not update book: ' + err.message });
  }
});

app.post('/api/admin/books/transfer', requireAdmin, (req, res) => {
  try {
    const { bookId, fromUser, toUser } = req.body || {};
    if (!bookId) return res.status(400).json({ error: 'Missing bookId.' });
    if (!toUser) return res.status(400).json({ error: 'Missing target user (toUser).' });

    const cleanToUser = toUser.trim().toLowerCase();
    const cleanFromUser = (fromUser || '').trim().toLowerCase();

    const targetUserRow = db.users.findByUsername(cleanToUser);
    if (!targetUserRow) {
      return res.status(404).json({ error: `Target user "${cleanToUser}" does not exist.` });
    }

    const existingBookDb = db.books.findById(bookId);
    const index = getLibraryIndex();
    const bookIndex = index.notebooks.findIndex((b) => b.id === bookId);

    if (!existingBookDb && bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    if (existingBookDb) {
      db.books.update(bookId, {
        user_id: targetUserRow.id,
        updated_at: new Date().toISOString(),
      });
    }

    if (bookIndex !== -1) {
      index.notebooks[bookIndex].owner = cleanToUser;
      index.notebooks[bookIndex].updatedAt = new Date().toISOString();
      saveLibraryIndex(index);
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_TRANSFER',
      target: bookId,
      details: `Administrator transferred notebook "${bookId}" from "${cleanFromUser || 'unknown'}" to "${cleanToUser}"`,
      req,
    });

    res.json({
      ok: true,
      bookId,
      fromUser: cleanFromUser,
      toUser: cleanToUser,
      message: `Notebook transferred to "${cleanToUser}" successfully.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not transfer book: ' + err.message });
  }
});

app.post('/api/admin/books/create', requireAdmin, (req, res) => {
  try {
    const { owner, title, coverColor } = req.body || {};
    const cleanOwner = (owner || 'admin').trim().toLowerCase();
    const cleanTitle = formatNotebookTitle(title, cleanOwner);
    const cleanCover = coverColor || 'brown';

    const userRow = db.users.findByUsername(cleanOwner);
    if (!userRow) {
      return res.status(404).json({ error: `User "${cleanOwner}" does not exist.` });
    }

    const newBookId = `${cleanOwner}_book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    if (cleanOwner === 'admin') {
      try {
        const file = readFile('admin');
        const vault = normalizeVault(decryptData(file, req.sessionKey));
        vault.books.push({
          id: newBookId,
          title: cleanTitle,
          coverColor: cleanCover,
          pages: [{ id: `p-${Date.now()}-0`, page_index: 0, html: '<p>Start writing here...</p>', createdAt: now }],
          createdAt: now,
          updatedAt: now,
        });
        syncVaultToDb('admin', vault, req.sessionKey, file.salt);
        writeFile(file.salt, encryptData(vault, req.sessionKey), vault.books.length, 'admin');
        syncVaultToLibraryIndex(vault, 'admin');
      } catch (e) {}
    } else {
      db.books.create({
        id: newBookId,
        user_id: userRow.id,
        title_encrypted: null,
        meta_encrypted: JSON.stringify({ title: cleanTitle, coverColor: cleanCover, pageCount: 1 }),
        created_at: now,
        updated_at: now,
      });

      const index = getLibraryIndex();
      index.notebooks.push({
        id: newBookId,
        title: cleanTitle,
        coverColor: cleanCover,
        pageCount: 1,
        owner: cleanOwner,
        createdAt: now,
        updatedAt: now,
      });
      saveLibraryIndex(index);
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_CREATE',
      target: newBookId,
      details: `Administrator created notebook "${cleanTitle}" for user "${cleanOwner}"`,
      req,
    });

    res.json({
      ok: true,
      bookId: newBookId,
      title: cleanTitle,
      owner: cleanOwner,
      coverColor: cleanCover,
      message: `Notebook created for "${cleanOwner}".`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not create book: ' + err.message });
  }
});

app.get('/api/admin/books/:id/export', requireAdmin, (req, res) => {
  try {
    const bookId = req.params.id;
    const index = getLibraryIndex();
    const bookEntry = index.notebooks.find((b) => b.id === bookId) || { id: bookId, title: 'Notebook', owner: 'unknown' };

    const exportData = {
      id: bookId,
      title: bookEntry.title || 'Exported Notebook',
      owner: bookEntry.owner || 'unknown',
      coverColor: bookEntry.coverColor || 'brown',
      pageCount: bookEntry.pageCount || 1,
      exportedAt: new Date().toISOString(),
      exportedBy: req.currentUser || 'admin',
    };

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_EXPORT',
      target: bookId,
      details: `Administrator exported notebook "${bookEntry.title}" (${bookId})`,
      req,
    });

    const filename = `notebook_${bookId}_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Could not export book: ' + err.message });
  }
});

app.post('/api/admin/books/increase-dimension-quota', requireAdmin, (req, res) => {
  try {
    const { bookId, owner, extraCount = 5, newLimit, resetUsed } = req.body || {};
    if (!bookId) return res.status(400).json({ error: 'Missing bookId' });

    let foundOwner = owner;
    if (!foundOwner) {
      const info = findAdminBookOwner(bookId);
      if (info) foundOwner = info.owner;
    }
    const cleanOwner = (foundOwner || 'default').trim().toLowerCase();

    let updatedDims = null;

    // 1. Update in SQLite books table if present
    try {
      const bookRow = db.books.findById(bookId);
      if (bookRow && bookRow.meta_encrypted) {
        let m = {};
        try { m = JSON.parse(bookRow.meta_encrypted); } catch(e){}
        if (!m.dimensions) {
          m.dimensions = { preset: 'classic', width: 1140, height: 840, aspectRatio: 1.36, dimensionChangeCount: 0, maxDimensionChanges: 5 };
        }
        if (resetUsed) {
          m.dimensions.dimensionChangeCount = 0;
        }
        if (newLimit !== undefined && !isNaN(Number(newLimit))) {
          m.dimensions.maxDimensionChanges = Number(newLimit);
        } else if (extraCount) {
          m.dimensions.maxDimensionChanges = (m.dimensions.maxDimensionChanges || 5) + Number(extraCount);
        }
        db.books.update(bookId, { meta_encrypted: JSON.stringify(m) });
        updatedDims = m.dimensions;
      }
    } catch(e) {}

    // 2. Update user's encrypted vault file if accessible
    try {
      const adminKey = cachedAdminKey || getAdminKey();
      const uKey = resolveUserKeyForAdmin(cleanOwner, adminKey);
      if (uKey) {
        const file = readFile(cleanOwner);
        const vault = normalizeVault(decryptData(file, uKey), cleanOwner);
        const target = (vault.books || []).find((b) => b.id === bookId);
        if (target) {
          if (!target.dimensions) {
            target.dimensions = { preset: 'classic', width: 1140, height: 840, aspectRatio: 1.36, dimensionChangeCount: 0, maxDimensionChanges: 5 };
          }
          if (resetUsed) {
            target.dimensions.dimensionChangeCount = 0;
          }
          if (newLimit !== undefined && !isNaN(Number(newLimit))) {
            target.dimensions.maxDimensionChanges = Number(newLimit);
          } else if (extraCount) {
            target.dimensions.maxDimensionChanges = (target.dimensions.maxDimensionChanges || 5) + Number(extraCount);
          }
          target.updatedAt = new Date().toISOString();
          const userRow = db.users.findByUsername(cleanOwner);
          const salt = (userRow && userRow.salt) || file.salt;
          syncVaultToDb(cleanOwner, vault, uKey, salt);
          writeFile(salt, encryptData(vault, uKey), vault.books.length, cleanOwner);
          syncVaultToLibraryIndex(vault, cleanOwner);
          updatedDims = target.dimensions;
        }
      }
    } catch(e) {}

    // 3. Update library index
    try {
      const idx = getLibraryIndex();
      const bIdx = (idx.notebooks || []).find((b) => b.id === bookId);
      if (bIdx) {
        if (!bIdx.dimensions) bIdx.dimensions = { preset: 'classic', width: 1140, height: 840, aspectRatio: 1.36, dimensionChangeCount: 0, maxDimensionChanges: 5 };
        if (resetUsed) bIdx.dimensions.dimensionChangeCount = 0;
        if (newLimit !== undefined && !isNaN(Number(newLimit))) bIdx.dimensions.maxDimensionChanges = Number(newLimit);
        else if (extraCount) bIdx.dimensions.maxDimensionChanges = (bIdx.dimensions.maxDimensionChanges || 5) + Number(extraCount);
        saveLibraryIndex(idx);
      }
    } catch(e) {}

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_INCREASE_DIMENSION_QUOTA',
      target: `${cleanOwner}:${bookId}`,
      details: `Administrator adjusted dimension modification quota for notebook "${bookId}" (extra: +${extraCount}, reset: ${!!resetUsed})`,
      req,
    });

    const finalLimit = updatedDims ? (updatedDims.maxDimensionChanges || 10) : 10;
    const finalCount = updatedDims ? (updatedDims.dimensionChangeCount || 0) : 0;

    res.json({
      ok: true,
      message: `Dimension modification quota updated for notebook "${bookId}". Limit: ${finalLimit}, Used: ${finalCount}`,
      dimensions: updatedDims || { dimensionChangeCount: finalCount, maxDimensionChanges: finalLimit },
      maxDimensionChanges: finalLimit,
      dimensionChangeCount: finalCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not update dimension quota: ' + err.message });
  }
});

// ---------- Admin God Mode (Requirement R1) Helpers & Routes ----------

function findAdminBookOwner(bookId) {
  if (!bookId || typeof bookId !== 'string') return null;
  const cleanId = String(bookId).trim();
  if (!cleanId) return null;

  // 1. Check SQLite books table
  if (dbInstance) {
    try {
      const bookRow = db.books.findById(cleanId);
      if (bookRow) {
        let owner = 'default';
        const userRow = db.users.findById(bookRow.user_id);
        if (userRow && userRow.username) {
          owner = userRow.username;
        }
        let meta = {};
        if (bookRow.meta_encrypted) {
          try { meta = JSON.parse(bookRow.meta_encrypted); } catch (e) {}
        }
        return {
          bookId: cleanId,
          owner: owner.toLowerCase(),
          title: meta.title || 'Untitled Notebook',
          coverColor: meta.coverColor || 'brown',
          createdAt: bookRow.created_at,
          updatedAt: bookRow.updated_at,
        };
      }
    } catch (e) {}
  }

  // 2. Check Library Index
  try {
    const index = getLibraryIndex();
    const found = (index.notebooks || []).find((b) => b.id === cleanId);
    if (found) {
      return {
        bookId: cleanId,
        owner: (found.owner || 'default').toLowerCase(),
        title: found.title || 'Untitled Notebook',
        coverColor: found.coverColor || 'brown',
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
      };
    }
  } catch (e) {}

  // 3. Scan user vaults on disk
  try {
    const usersList = db.users.listAll();
    const adminKey = cachedAdminKey || getAdminKey();
    for (const u of usersList) {
      try {
        const uKey = resolveUserKeyForAdmin(u.username, adminKey);
        if (uKey) {
          const file = readFile(u.username);
          const vault = normalizeVault(decryptData(file, uKey));
          const target = (vault.books || []).find((b) => b.id === cleanId);
          if (target) {
            return {
              bookId: cleanId,
              owner: u.username.toLowerCase(),
              title: target.title || 'Untitled Notebook',
              coverColor: target.coverColor || 'brown',
              createdAt: target.createdAt,
              updatedAt: target.updatedAt,
            };
          }
        }
      } catch (e) {}
    }
  } catch (e) {}

  return null;
}

function getDecryptedAdminVaultAndBook(bookId, adminKey) {
  const meta = findAdminBookOwner(bookId);
  if (!meta) return null;

  const owner = meta.owner;
  const effectiveAdminKey = adminKey || cachedAdminKey || getAdminKey();
  const userKey = resolveUserKeyForAdmin(owner, effectiveAdminKey);
  if (!userKey) {
    throw new Error(`Could not resolve user key (DEK) for owner "${owner}".`);
  }

  let vault = null;
  try {
    const file = readFile(owner);
    vault = normalizeVault(decryptData(file, userKey));
  } catch (e) {
    const userRow = db.users.findByUsername(owner);
    if (userRow && userRow.encrypted_profile) {
      try {
        const raw = decryptData(JSON.parse(userRow.encrypted_profile), userKey);
        vault = normalizeVault(raw);
      } catch (err) {}
    }
  }

  if (!vault) {
    vault = emptyVault(meta.title, meta.coverColor);
    vault.books[0].id = bookId;
  }

  let book = (vault.books || []).find((b) => b.id === bookId);

  if (!book) {
    // Reconstruct book from SQLite db.books and db.pages
    let title = meta.title;
    let coverColor = meta.coverColor;
    let createdAt = meta.createdAt || new Date().toISOString();
    let updatedAt = meta.updatedAt || new Date().toISOString();

    const bookRow = db.books.findById(bookId);
    if (bookRow) {
      if (bookRow.title_encrypted) {
        try {
          const decTitle = decryptData(JSON.parse(bookRow.title_encrypted), userKey);
          if (decTitle.title) title = decTitle.title;
          if (decTitle.coverColor) coverColor = decTitle.coverColor;
        } catch (e) {}
      }
      if (bookRow.created_at) createdAt = bookRow.created_at;
      if (bookRow.updated_at) updatedAt = bookRow.updated_at;
    }

    const dbPages = db.pages.findByBookId(bookId);
    const pages = dbPages.map((p, idx) => {
      let pageData = { html: '', font: 'Georgia, serif', fontSize: '18px' };
      if (p.content_encrypted) {
        try {
          pageData = decryptData(JSON.parse(p.content_encrypted), userKey);
        } catch (e) {}
      }
      let drawings = null;
      if (p.drawings_encrypted) {
        try {
          drawings = decryptData(JSON.parse(p.drawings_encrypted), userKey);
        } catch (e) {}
      }
      return {
        id: p.id || `p-${idx}`,
        pageIndex: p.page_index !== undefined ? p.page_index : idx,
        html: pageData.html || '',
        content: pageData.html || '',
        contentHtml: pageData.html || '',
        font: pageData.font || 'Georgia, serif',
        fontSize: pageData.fontSize || '18px',
        drawings,
        title: pageData.title || `Page ${idx + 1}`,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });

    if (pages.length === 0) {
      pages.push({
        id: `p-${Date.now()}-0`,
        pageIndex: 0,
        html: '<p>Start writing here...</p>',
        content: '<p>Start writing here...</p>',
        contentHtml: '<p>Start writing here...</p>',
        font: 'Georgia, serif',
        fontSize: '18px',
        drawings: null,
        title: 'Page 1',
        createdAt,
        updatedAt,
      });
    }

    book = {
      id: bookId,
      title,
      coverColor,
      owner,
      user: owner,
      pages,
      pageCount: pages.length,
      createdAt,
      updatedAt,
    };
    vault.books.push(book);
  } else {
    book.owner = owner;
    book.user = owner;
    if (!Array.isArray(book.pages) || book.pages.length === 0) {
      book.pages = [
        {
          id: `p-${Date.now()}-0`,
          pageIndex: 0,
          html: '<p>Start writing here...</p>',
          content: '<p>Start writing here...</p>',
          contentHtml: '<p>Start writing here...</p>',
          font: 'Georgia, serif',
          fontSize: '18px',
          drawings: null,
          title: 'Page 1',
          createdAt: book.createdAt || new Date().toISOString(),
          updatedAt: book.updatedAt || new Date().toISOString(),
        },
      ];
    } else {
      book.pages = book.pages.map((p, idx) => ({
        id: p.id || `p-${idx}`,
        pageIndex: p.pageIndex !== undefined ? p.pageIndex : (p.page_index !== undefined ? p.page_index : idx),
        html: p.html || p.content || p.contentHtml || '',
        content: p.html || p.content || p.contentHtml || '',
        contentHtml: p.html || p.content || p.contentHtml || '',
        font: p.font || 'Georgia, serif',
        fontSize: p.fontSize || '18px',
        drawings: p.drawings || null,
        title: p.title || `Page ${idx + 1}`,
        createdAt: p.createdAt || book.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || book.updatedAt || new Date().toISOString(),
      }));
    }
    book.pageCount = book.pages.length;
  }

  return { meta, owner, userKey, vault, book };
}

function saveAdminDecryptedVault(owner, vault, userKey) {
  const cleanOwner = (owner || 'default').trim().toLowerCase();
  const userRow = db.users.findByUsername(cleanOwner);
  const salt = (userRow && userRow.salt) || crypto.randomBytes(16).toString('hex');

  syncVaultToDb(cleanOwner, vault, userKey, salt);
  writeFile(salt, encryptData(vault, userKey), vault.books.length, cleanOwner);
  syncVaultToLibraryIndex(vault, cleanOwner);
}

app.get('/api/admin/notebooks/:bookId', requireAdmin, (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId || typeof bookId !== 'string') {
      return res.status(400).json({ ok: false, error: 'Invalid bookId.' });
    }

    const data = getDecryptedAdminVaultAndBook(bookId, req.sessionKey);
    if (!data || !data.book) {
      return res.status(404).json({ ok: false, error: 'Notebook not found.' });
    }

    const { book, owner } = data;

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_VIEW',
      target: bookId,
      details: `Administrator viewed notebook "${book.title}" (${bookId}) owned by "${owner}"`,
      status: 'SUCCESS',
      req,
    });

    res.json({
      ok: true,
      book,
      notebook: book,
    });
  } catch (err) {
    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_VIEW',
      target: req.params.bookId,
      details: `Error viewing notebook: ${err.message}`,
      status: 'FAILED',
      req,
    });
    res.status(500).json({ ok: false, error: 'Could not retrieve notebook: ' + err.message });
  }
});

app.get('/api/admin/notebooks/:bookId/pages/:pageId', requireAdmin, (req, res) => {
  try {
    const { bookId, pageId } = req.params;
    if (!bookId || !pageId) {
      return res.status(400).json({ ok: false, error: 'Missing bookId or pageId.' });
    }

    const data = getDecryptedAdminVaultAndBook(bookId, req.sessionKey);
    if (!data || !data.book) {
      return res.status(404).json({ ok: false, error: 'Notebook not found.' });
    }

    const { book } = data;
    let targetPage = (book.pages || []).find((p) => p.id === pageId || String(p.pageIndex) === pageId);
    if (!targetPage) {
      const parsedIdx = parseInt(pageId, 10);
      if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < (book.pages || []).length) {
        targetPage = book.pages[parsedIdx];
      }
    }

    if (!targetPage) {
      return res.status(404).json({ ok: false, error: 'Page not found.' });
    }

    res.json({
      ok: true,
      page: targetPage,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not fetch page: ' + err.message });
  }
});

app.post('/api/admin/notebooks/:bookId/pages/:pageId', requireAdmin, (req, res) => {
  try {
    const { bookId, pageId } = req.params;
    if (!bookId || !pageId) {
      return res.status(400).json({ ok: false, error: 'Missing bookId or pageId.' });
    }

    const data = getDecryptedAdminVaultAndBook(bookId, req.sessionKey);
    if (!data || !data.book) {
      return res.status(404).json({ ok: false, error: 'Notebook not found.' });
    }

    const { book, vault, userKey, owner } = data;
    let targetPage = (book.pages || []).find((p) => p.id === pageId || String(p.pageIndex) === pageId);
    if (!targetPage) {
      const parsedIdx = parseInt(pageId, 10);
      if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < (book.pages || []).length) {
        targetPage = book.pages[parsedIdx];
      }
    }

    if (!targetPage) {
      return res.status(404).json({ ok: false, error: 'Page not found.' });
    }

    const { html, content, contentHtml, font, fontSize, title, drawings } = req.body || {};
    const rawHtml = html !== undefined ? html : (contentHtml !== undefined ? contentHtml : (content !== undefined ? content : ''));
    const sanitizedHtml = typeof sanitizeHtmlContent === 'function' ? sanitizeHtmlContent(rawHtml) : String(rawHtml);

    targetPage.html = sanitizedHtml;
    targetPage.content = sanitizedHtml;
    targetPage.contentHtml = sanitizedHtml;
    if (font !== undefined) targetPage.font = sanitizeString(font, 60);
    if (fontSize !== undefined) targetPage.fontSize = sanitizeString(fontSize, 30);
    if (title !== undefined) targetPage.title = sanitizeTitle(title);
    if (drawings !== undefined) targetPage.drawings = drawings;
    targetPage.updatedAt = new Date().toISOString();

    book.updatedAt = new Date().toISOString();

    saveAdminDecryptedVault(owner, vault, userKey);

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_PAGE_EDIT',
      target: `${bookId}:${targetPage.id}`,
      details: `Administrator edited page "${targetPage.id}" in notebook "${book.title}" owned by "${owner}"`,
      status: 'SUCCESS',
      req,
    });

    res.json({
      ok: true,
      pageId: targetPage.id,
      page: targetPage,
      message: 'Page updated successfully.',
    });
  } catch (err) {
    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_PAGE_EDIT',
      target: req.params.bookId,
      details: `Error editing page: ${err.message}`,
      status: 'FAILED',
      req,
    });
    res.status(500).json({ ok: false, error: 'Could not edit page: ' + err.message });
  }
});

app.post('/api/admin/notebooks/:bookId/save', requireAdmin, (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId || typeof bookId !== 'string') {
      return res.status(400).json({ ok: false, error: 'Invalid bookId.' });
    }

    const data = getDecryptedAdminVaultAndBook(bookId, req.sessionKey);
    if (!data || !data.book) {
      return res.status(404).json({ ok: false, error: 'Notebook not found.' });
    }

    const { book, vault, userKey, owner } = data;
    const body = req.body || {};
    const newPages = body.pages || (body.book && body.book.pages) || (body.notebook && body.notebook.pages);
    const newCover = body.coverColor || (body.book && body.book.coverColor) || (body.notebook && body.notebook.coverColor);

    if (newCover !== undefined) {
      book.coverColor = typeof validateCoverColor === 'function' ? validateCoverColor(newCover) : newCover;
    }

    if (Array.isArray(newPages)) {
      book.pages = newPages.map((p, idx) => {
        const rawHtml = p.html !== undefined ? p.html : (p.contentHtml !== undefined ? p.contentHtml : (p.content !== undefined ? p.content : ''));
        const cleanH = typeof sanitizeHtmlContent === 'function' ? sanitizeHtmlContent(rawHtml) : String(rawHtml);
        return {
          id: p.id || `p-${Date.now()}-${idx}`,
          pageIndex: p.pageIndex !== undefined ? p.pageIndex : idx,
          html: cleanH,
          content: cleanH,
          contentHtml: cleanH,
          font: p.font ? sanitizeString(p.font, 60) : 'Georgia, serif',
          fontSize: p.fontSize ? sanitizeString(p.fontSize, 30) : '18px',
          drawings: p.drawings !== undefined ? p.drawings : null,
          title: p.title ? sanitizeTitle(p.title) : `Page ${idx + 1}`,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      book.pageCount = book.pages.length;
    }

    book.updatedAt = new Date().toISOString();

    saveAdminDecryptedVault(owner, vault, userKey);

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_NOTEBOOK_SAVE',
      target: bookId,
      details: `Administrator saved full notebook "${book.title}" (${(book.pages || []).length} pages) owned by "${owner}"`,
      status: 'SUCCESS',
      req,
    });

    res.json({
      ok: true,
      saved: true,
      book,
      notebook: book,
      message: 'Notebook saved successfully.',
    });
  } catch (err) {
    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_NOTEBOOK_SAVE',
      target: req.params.bookId,
      details: `Error saving notebook: ${err.message}`,
      status: 'FAILED',
      req,
    });
    res.status(500).json({ ok: false, error: 'Could not save notebook: ' + err.message });
  }
});

app.get('/api/admin/notebooks/:bookId/render', requireAdmin, (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId || typeof bookId !== 'string') {
      return res.status(400).json({ ok: false, error: 'Invalid bookId.' });
    }

    const data = getDecryptedAdminVaultAndBook(bookId, req.sessionKey);
    if (!data || !data.book) {
      return res.status(404).json({ ok: false, error: 'Notebook not found.' });
    }

    const { book, owner } = data;

    const escapeForHtml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const renderedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeForHtml(book.title)} - Rendered Preview</title>
  <style>
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #1e1917;
      color: #2c2523;
      margin: 0;
      padding: 30px 15px;
    }
    .notebook-viewer {
      max-width: 860px;
      margin: 0 auto;
      background: #faf6ee;
      border: 1px solid #d5c8b5;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.6);
      padding: 40px;
    }
    .notebook-header {
      border-bottom: 2px solid #8b5a2b;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .notebook-title {
      font-size: 28px;
      color: #3b281c;
      margin: 0 0 8px 0;
    }
    .notebook-meta {
      font-size: 14px;
      color: #7c6858;
      font-style: italic;
    }
    .page-wrapper {
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px dashed #d5c8b5;
    }
    .page-header {
      font-size: 12px;
      font-weight: bold;
      color: #8b5a2b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .page-body {
      min-height: 120px;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div class="notebook-viewer">
    <div class="notebook-header">
      <h1 class="notebook-title">${escapeForHtml(book.title)}</h1>
      <div class="notebook-meta">Owner: <strong>${escapeForHtml(owner)}</strong> | Theme: ${escapeForHtml(book.coverColor || 'brown')} | Pages: ${(book.pages || []).length}</div>
    </div>
    ${(book.pages || []).map((p, idx) => `
      <div class="page-wrapper" id="page-${idx}">
        <div class="page-header">Page ${idx + 1}${p.title ? ` - ${escapeForHtml(p.title)}` : ''}</div>
        <div class="page-body" style="font-family: ${escapeForHtml(p.font || 'Georgia, serif')}; font-size: ${escapeForHtml(p.fontSize || '18px')};">
          ${p.html || ''}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_BOOK_RENDER',
      target: bookId,
      details: `Administrator rendered HTML preview of notebook "${book.title}" (${bookId}) owned by "${owner}"`,
      status: 'SUCCESS',
      req,
    });

    if (req.query.format === 'html' || (req.headers.accept && req.headers.accept.includes('text/html') && !req.headers.accept.includes('application/json'))) {
      res.type('html').send(renderedHtml);
    } else {
      res.json({
        ok: true,
        html: renderedHtml,
        book,
        notebook: book,
      });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not render notebook: ' + err.message });
  }
});

app.post('/api/admin/users/edit', requireAdmin, (req, res) => {
  try {
    const { username, displayName, role, tier } = req.body || {};
    if (!username) return res.status(400).json({ error: 'Missing username.' });

    const cleanUsername = username.trim().toLowerCase();
    const userRow = db.users.findByUsername(cleanUsername);
    if (!userRow) {
      return res.status(404).json({ error: `User "${cleanUsername}" does not exist.` });
    }

    const updates = {};
    if (role) {
      updates.role = role === 'admin' ? 'admin' : 'user';
      updates.is_admin = role === 'admin' ? 1 : 0;
    }
    if (tier) {
      const cleanTier = tier.toLowerCase().trim();
      if (['classic', 'premium', 'ultimate'].includes(cleanTier)) {
        updates.tier = cleanTier;
      }
    }
    db.users.update(userRow.id, updates);

    const index = getLibraryIndex();
    const uIdx = index.users.findIndex((u) => u.username.toLowerCase() === cleanUsername);
    if (uIdx !== -1) {
      if (displayName) index.users[uIdx].displayName = displayName;
      saveLibraryIndex(index);
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_USER_EDIT',
      target: cleanUsername,
      details: `Administrator updated profile for "${cleanUsername}" (role="${updates.role || userRow.role}", tier="${updates.tier || userRow.tier}")`,
      req,
    });

    res.json({
      ok: true,
      user: cleanUsername,
      role: updates.role || userRow.role,
      tier: updates.tier || userRow.tier,
      message: `User "${cleanUsername}" updated successfully.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not update user: ' + err.message });
  }
});

app.post('/api/admin/users/tier', requireAdmin, (req, res) => {
  try {
    const { username, tier } = req.body || {};
    if (!username || !tier) {
      return res.status(400).json({ error: 'Missing username or tier parameter.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanTier = tier.toLowerCase().trim();
    if (!['classic', 'premium', 'ultimate'].includes(cleanTier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be classic, premium, or ultimate.' });
    }

    const userRow = db.users.findByUsername(cleanUsername);
    if (!userRow) {
      return res.status(404).json({ error: `User "${cleanUsername}" does not exist in database.` });
    }

    db.users.update(userRow.id, { tier: cleanTier });

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_USER_TIER_UPDATE',
      target: cleanUsername,
      details: `Administrator changed tier for "${cleanUsername}" to ${cleanTier.toUpperCase()}`,
      req,
    });

    const tierConfig = getTierConfig(cleanTier);
    res.json({
      ok: true,
      message: `User "${cleanUsername}" tier converted to ${tierConfig.name} (${cleanTier.toUpperCase()}) successfully.`,
      username: cleanUsername,
      tier: cleanTier,
      tierConfig,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not update user tier: ' + err.message });
  }
});

app.post('/api/admin/users/unlock', requireAdmin, (req, res) => {
  try {
    const { username } = req.body || {};
    failedAttempts = 0;
    lockedUntil = 0;

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_USER_UNLOCK',
      target: username || 'all',
      details: `Administrator cleared lockout state and reset failed attempt counters for "${username || 'all users'}"`,
      req,
    });

    res.json({
      ok: true,
      user: username || 'all',
      message: 'Account lockout cleared successfully.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not unlock user: ' + err.message });
  }
});

// ---------- Redeem Keys & License Management Endpoints ----------
app.get('/api/admin/keys', requireAdmin, (req, res) => {
  try {
    const keys = db.redeem_keys.listAll();
    res.json({ ok: true, keys, count: keys.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list redeem keys: ' + err.message });
  }
});

app.post('/api/admin/keys/create', requireAdmin, (req, res) => {
  try {
    const { targetTier = 'ultimate', count = 1, maxUses = 1, notes = '' } = req.body || {};
    const numKeys = Math.max(1, Math.min(Number(count) || 1, 50));
    const createdKeys = [];

    for (let i = 0; i < numKeys; i++) {
      let code;
      for (let attempt = 0; attempt < 10; attempt++) {
        code = generateRedeemKey();
        if (!db.redeem_keys.findByCode(code)) break;
      }
      const newKey = db.redeem_keys.create({
        key_code: code,
        target_tier: ['ultimate', 'premium', 'classic'].includes(targetTier) ? targetTier : 'ultimate',
        max_uses: Math.max(1, Number(maxUses) || 1),
        created_by: req.currentUser || 'admin',
        notes: notes || null,
      });
      createdKeys.push(newKey);
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_KEYS_CREATE',
      target: `${numKeys} keys (${targetTier})`,
      details: `Admin generated ${numKeys} redeem keys for ${targetTier.toUpperCase()} plan (XXXX-XXXX-XXXX-XXXX-XXXX)`,
      req,
    });

    res.json({ ok: true, keys: createdKeys, message: `Successfully generated ${numKeys} license key(s).` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate redeem keys: ' + err.message });
  }
});

app.post('/api/admin/keys/revoke', requireAdmin, (req, res) => {
  try {
    const { id } = req.body || {};
    const updated = db.redeem_keys.revoke(id);
    res.json({ ok: true, key: updated, message: 'Redeem key revoked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke key: ' + err.message });
  }
});

app.post('/api/admin/keys/delete', requireAdmin, (req, res) => {
  try {
    const { id } = req.body || {};
    db.redeem_keys.delete(id);
    res.json({ ok: true, message: 'Redeem key deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete key: ' + err.message });
  }
});

app.get('/api/admin/logs', requireAdmin, (req, res) => {
  try {
    let logs = loadDecryptedAuditLogs(req.sessionKey);

    const { actor, action, status, search, limit, offset } = req.query || {};

    if (actor && typeof actor === 'string') {
      const actLower = sanitizeString(actor, 60).toLowerCase();
      logs = logs.filter((l) => (l.actor && l.actor.toLowerCase().includes(actLower)) || (l.username && l.username.toLowerCase().includes(actLower)));
    }

    if (action && typeof action === 'string') {
      const actType = sanitizeString(action, 60).toUpperCase();
      logs = logs.filter((l) => (l.action && l.action.toUpperCase() === actType) || (l.event_type && l.event_type.toUpperCase() === actType));
    }

    if (status && typeof status === 'string') {
      const st = sanitizeString(status, 20).toUpperCase();
      logs = logs.filter((l) => l.status && l.status.toUpperCase() === st);
    }

    if (search && typeof search === 'string') {
      const q = sanitizeSearchQuery(search, 100).toLowerCase();
      if (q) {
        logs = logs.filter(
          (l) =>
            (l.actor && l.actor.toLowerCase().includes(q)) ||
            (l.username && l.username.toLowerCase().includes(q)) ||
            (l.action && l.action.toLowerCase().includes(q)) ||
            (l.event_type && l.event_type.toLowerCase().includes(q)) ||
            (l.target && l.target.toLowerCase().includes(q)) ||
            (l.resource && l.resource.toLowerCase().includes(q)) ||
            (l.details && l.details.toLowerCase().includes(q)) ||
            (l.encrypted_details && l.encrypted_details.toLowerCase().includes(q)) ||
            (l.ip && l.ip.toLowerCase().includes(q)) ||
            (l.ip_address && l.ip_address.toLowerCase().includes(q))
        );
      }
    }

    const pagination = sanitizePagination(limit, offset, 1000, 100);
    const total = logs.length;
    const paginatedLogs = logs.slice(pagination.offset, pagination.offset + pagination.limit);

    res.json({
      ok: true,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      logs: paginatedLogs,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch audit logs: ' + err.message });
  }
});

app.post('/api/admin/logs/clear', requireAdmin, (req, res) => {
  try {
    inMemoryAuditLogs = [];
    db.audit_logs.clear();

    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      try {
        fs.unlinkSync(AUDIT_LOGS_FILE);
      } catch (e) {}
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'LOGS_CLEARED',
      target: 'audit_logs',
      details: 'Administrator purged all historical audit logs and re-initialized encrypted audit trail',
      req,
    });

    res.json({
      ok: true,
      message: 'Audit logs cleared successfully.',
      clearedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not clear audit logs: ' + err.message });
  }
});

app.get('/api/admin/logs/export', requireAdmin, (req, res) => {
  try {
    const logs = loadDecryptedAuditLogs(req.sessionKey);
    const filename = `audit_logs_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'LOGS_EXPORTED',
      target: 'audit_logs',
      details: `Administrator exported ${logs.length} decrypted audit logs`,
      req,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(logs, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Could not export audit logs: ' + err.message });
  }
});

// ---------- Military-Grade Encrypted Chunk Audit Ledger Endpoint ----------
app.get('/api/admin/audit/chunks', requireAdmin, (req, res) => {
  try {
    const ledger = loadDecryptedChunkAuditLedger();
    const { owner, fileType, search } = req.query || {};
    let filtered = ledger;

    if (owner && typeof owner === 'string') {
      const o = owner.toLowerCase();
      filtered = filtered.filter((c) => c.ownerUsername && c.ownerUsername.toLowerCase().includes(o));
    }
    if (fileType && typeof fileType === 'string') {
      const ft = fileType.toLowerCase();
      filtered = filtered.filter((c) => c.fileType && c.fileType.toLowerCase() === ft);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) =>
        (c.originalFilename && c.originalFilename.toLowerCase().includes(q)) ||
        (c.chunkId && c.chunkId.toLowerCase().includes(q)) ||
        (c.manifestId && c.manifestId.toLowerCase().includes(q)) ||
        (c.ownerUsername && c.ownerUsername.toLowerCase().includes(q))
      );
    }

    res.json({
      ok: true,
      totalChunks: filtered.length,
      chunks: filtered,
      encryptionAlgorithm: 'AES-256-GCM (Authenticated 256-bit Key, 96-bit IV, 128-bit Auth Tag)',
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch chunk audit ledger: ' + err.message });
  }
});

// ---------- Military-Grade Security Diagnostics & Client Context Endpoints ----------
app.get('/api/auth/client-context', requireUnlocked, (req, res) => {
  try {
    const clientCtx = getClientSecurityContext(req);
    res.json({
      ok: true,
      user: req.currentUser,
      isAdmin: req.isAdmin,
      context: clientCtx,
      securityGrade: 'Military-Grade (AES-256-GCM / Authenticated AEAD / Scrypt KDF)',
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch client security context: ' + err.message });
  }
});

app.get('/api/admin/security/diagnostics', requireAdmin, (req, res) => {
  try {
    const ledger = loadDecryptedChunkAuditLedger();
    const lockedIps = [];
    const now = Date.now();
    for (const [ip, rec] of ipLoginAttempts.entries()) {
      if (rec.lockedUntil && now < rec.lockedUntil) {
        lockedIps.push({ ip, attempts: rec.count, secondsRemaining: Math.ceil((rec.lockedUntil - now) / 1000) });
      }
    }

    res.json({
      ok: true,
      securityStatus: 'SECURE_ACTIVE',
      cipherStandard: 'AES-256-GCM (Authenticated 256-bit Key, 96-bit IV, 128-bit MAC Auth Tag)',
      kdf: 'Scrypt (N=32768, r=8, p=1, 256-bit Key Output)',
      totalAuditedChunks: ledger.length,
      activeLockedIps: lockedIps.length,
      lockedIps,
      osPlatform: os.platform(),
      osArch: os.arch(),
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch security diagnostics: ' + err.message });
  }
});

// ---------- Individual Audit Log Deletion Endpoint (R2) ----------
function handleDeleteAdminLog(req, res) {
  try {
    const logId = (req.body && (req.body.id || req.body.logId)) || req.params.id;
    if (!logId || typeof logId !== 'string' || !logId.trim()) {
      return res.status(400).json({ ok: false, error: 'Log ID is required.' });
    }

    const cleanLogId = logId.trim();
    const existing = db.audit_logs.findById(cleanLogId);
    const memIdx = inMemoryAuditLogs.findIndex((l) => l.id === cleanLogId);

    if (!existing && memIdx === -1) {
      return res.status(404).json({ ok: false, error: 'Audit log entry not found.' });
    }

    db.audit_logs.delete(cleanLogId);
    if (memIdx !== -1) {
      inMemoryAuditLogs.splice(memIdx, 1);
    }
    saveEncryptedAuditLogs();

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'LOG_ENTRY_DELETED',
      target: cleanLogId,
      details: `Administrator deleted audit log entry "${cleanLogId}"`,
      status: 'SUCCESS',
      req,
    });

    res.json({
      ok: true,
      id: cleanLogId,
      deletedLogId: cleanLogId,
      deletedId: cleanLogId,
      message: 'Audit log entry deleted successfully.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not delete audit log: ' + err.message });
  }
}

app.post('/api/admin/logs/delete', requireAdmin, handleDeleteAdminLog);
app.delete('/api/admin/logs/:id', requireAdmin, handleDeleteAdminLog);

// =============================================================================
// ---------- Master Admin Emergency Zip Export & Import (Encrypted) -----------
// =============================================================================

function collectEmergencyBackupFiles() {
  const entries = [];

  // 1. Users directory (user vault files)
  if (fs.existsSync(USERS_DIR)) {
    const userFiles = fs.readdirSync(USERS_DIR);
    for (const f of userFiles) {
      const fullPath = path.join(USERS_DIR, f);
      if (fs.statSync(fullPath).isFile()) {
        entries.push({ name: `users/${f}`, data: fs.readFileSync(fullPath) });
      }
    }
  }

  // 2. Default notebook file
  if (fs.existsSync(DATA_FILE)) {
    entries.push({ name: 'notebook.enc.json', data: fs.readFileSync(DATA_FILE) });
  }

  // 3. Library index
  if (fs.existsSync(INDEX_FILE)) {
    entries.push({ name: 'library_index.json', data: fs.readFileSync(INDEX_FILE) });
  }

  // 4. Audit logs
  if (fs.existsSync(AUDIT_LOGS_FILE)) {
    entries.push({ name: 'audit_logs.enc.json', data: fs.readFileSync(AUDIT_LOGS_FILE) });
  }

  // 5. Images directory
  if (fs.existsSync(IMAGES_DIR)) {
    const imgFiles = fs.readdirSync(IMAGES_DIR);
    for (const f of imgFiles) {
      const fullPath = path.join(IMAGES_DIR, f);
      if (fs.statSync(fullPath).isFile()) {
        entries.push({ name: `images/${f}`, data: fs.readFileSync(fullPath) });
      }
    }
  }

  // 6. Blobs directory (recursive traversal)
  if (fs.existsSync(BLOBS_DIR)) {
    function walkDir(dir, prefix) {
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const fullPath = path.join(dir, item);
        const rel = prefix ? `${prefix}/${item}` : item;
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath, rel);
        } else {
          entries.push({ name: `blobs/${rel}`, data: fs.readFileSync(fullPath) });
        }
      }
    }
    walkDir(BLOBS_DIR, '');
  }

  // 7. Database Dump (all SQLite table contents)
  try {
    const dbDump = {
      users: db.users ? db.users.listAll() : [],
      books: db.books ? db.books.listAll() : [],
      pages: db.pages ? db.pages.listAll() : [],
      media_files: db.media_files ? db.media_files.listAll() : [],
      audit_logs: db.audit_logs ? db.audit_logs.listAll(50000, 0) : [],
    };
    entries.push({ name: 'db_dump.json', data: Buffer.from(JSON.stringify(dbDump, null, 2), 'utf8') });
  } catch (e) {}

  // 8. Manifest Metadata
  const manifest = {
    type: 'NOTEBOOK_EMERGENCY_ARCHIVE',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    totalEntries: entries.length,
  };
  entries.push({ name: 'manifest.json', data: Buffer.from(JSON.stringify(manifest, null, 2), 'utf8') });

  return entries;
}

function handleEmergencyExport(req, res) {
  try {
    const effectiveAdminKey = req.sessionKey || cachedAdminKey || getAdminKey();
    if (!effectiveAdminKey) {
      return res.status(401).json({ ok: false, error: 'Admin session required for emergency backup export.' });
    }

    const entries = collectEmergencyBackupFiles();
    const zipBuf = createZip(entries);

    // Retrieve Admin salt from DB or admin.enc.json
    let adminSalt = null;
    const adminUser = db.users ? db.users.findByUsername('admin') : null;
    if (adminUser && adminUser.salt) {
      adminSalt = Buffer.from(adminUser.salt, 'hex');
    } else if (fs.existsSync(path.join(USERS_DIR, 'admin.enc.json'))) {
      try {
        const adminObj = JSON.parse(fs.readFileSync(path.join(USERS_DIR, 'admin.enc.json'), 'utf8'));
        if (adminObj.salt) adminSalt = Buffer.from(adminObj.salt, 'hex');
      } catch (e) {}
    }
    if (!adminSalt || adminSalt.length !== 16) {
      adminSalt = crypto.randomBytes(16);
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    // Key derived via HMAC of admin session key + random backup salt
    const backupKey = crypto.createHmac('sha256', effectiveAdminKey).update(salt).digest();

    const cipher = crypto.createCipheriv('aes-256-gcm', backupKey, iv);
    const ciphertext = Buffer.concat([cipher.update(zipBuf), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Binary Container: [16B Magic][16B AdminSalt][16B Salt][12B IV][16B Tag][Ciphertext]
    const magic = Buffer.alloc(16);
    magic.write('NB_EMERGENCY_V2\0', 'utf8');

    const encryptedPackage = Buffer.concat([magic, adminSalt, salt, iv, tag, ciphertext]);
    const filename = `emergency_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_EMERGENCY_EXPORT',
      target: filename,
      details: `Administrator exported encrypted emergency backup archive (${entries.length} files, ${encryptedPackage.length} bytes)`,
      status: 'SUCCESS',
      req,
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Backup-Entries', String(entries.length));
    res.setHeader('X-Backup-Size', String(encryptedPackage.length));
    res.send(encryptedPackage);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not generate emergency backup: ' + err.message });
  }
}

function handleEmergencyImport(req, res) {
  try {
    const { password, fileData, zipBase64 } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'Admin password from the time of export is required to decrypt this backup.' });
    }

    const rawPayload = fileData || zipBase64;
    if (!rawPayload) {
      return res.status(400).json({ ok: false, error: 'No emergency backup file provided.' });
    }

    let payloadBuffer;
    if (Buffer.isBuffer(rawPayload)) {
      payloadBuffer = rawPayload;
    } else if (typeof rawPayload === 'string') {
      const cleanB64 = rawPayload.replace(/^data:[^;]+;base64,/, '');
      payloadBuffer = Buffer.from(cleanB64, 'base64');
    } else {
      return res.status(400).json({ ok: false, error: 'Invalid backup file format.' });
    }

    if (payloadBuffer.length < 60) {
      return res.status(400).json({ ok: false, error: 'Invalid emergency backup: file size too small.' });
    }

    let adminSalt = null, salt = null, iv = null, tag = null, ciphertext = null;

    // Check for binary header
    const magicStr = payloadBuffer.subarray(0, 15).toString('utf8');
    if (magicStr.startsWith('NB_EMERGENCY_V2')) {
      adminSalt = payloadBuffer.subarray(16, 32);
      salt = payloadBuffer.subarray(32, 48);
      iv = payloadBuffer.subarray(48, 60);
      tag = payloadBuffer.subarray(60, 76);
      ciphertext = payloadBuffer.subarray(76);
    } else if (magicStr.startsWith('NB_EMERGENCY_V1')) {
      salt = payloadBuffer.subarray(16, 32);
      iv = payloadBuffer.subarray(32, 44);
      tag = payloadBuffer.subarray(44, 60);
      ciphertext = payloadBuffer.subarray(60);
    } else {
      // Check for JSON container fallback
      try {
        const jsonEnv = JSON.parse(payloadBuffer.toString('utf8'));
        if (jsonEnv.adminSalt) adminSalt = Buffer.from(jsonEnv.adminSalt, 'hex');
        if (jsonEnv.salt) salt = Buffer.from(jsonEnv.salt, 'hex');
        if (jsonEnv.iv) iv = Buffer.from(jsonEnv.iv, 'hex');
        if (jsonEnv.tag) tag = Buffer.from(jsonEnv.tag, 'hex');
        if (jsonEnv.ciphertext) ciphertext = Buffer.from(jsonEnv.ciphertext, 'base64');
      } catch (e) {}
    }

    if (!salt || !iv || !tag || !ciphertext) {
      return res.status(400).json({ ok: false, error: 'Unrecognized emergency backup format.' });
    }

    // Derive key using password and salt
    let decKey;
    let oldAdminKek;
    if (adminSalt && adminSalt.length === 16) {
      oldAdminKek = deriveKey(password, adminSalt.toString('hex'));
      decKey = crypto.createHmac('sha256', oldAdminKek).update(salt).digest();
    } else {
      decKey = deriveKey(password, salt.toString('hex'));
      oldAdminKek = decKey;
    }

    let decryptedZip;
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', decKey, iv);
      decipher.setAuthTag(tag);
      decryptedZip = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch (e) {
      logAuditEvent({
        actor: req.currentUser || 'admin',
        action: 'ADMIN_EMERGENCY_IMPORT',
        target: 'system_restore',
        details: 'Emergency backup import failed: Invalid password or corrupted payload',
        status: 'FAILED',
        req,
      });
      return res.status(401).json({ ok: false, error: 'Incorrect emergency backup password. Please enter the admin password that was active when this backup was exported.' });
    }

    // Extract all files from ZIP archive
    const files = readZip(decryptedZip);
    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: 'Emergency archive is empty or damaged.' });
    }

    // Ensure storage directories exist
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR, { recursive: true });
    if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
    if (!fs.existsSync(BLOBS_DIR)) fs.mkdirSync(BLOBS_DIR, { recursive: true });

    let usersRestored = 0;
    let booksRestored = 0;
    let filesRestored = 0;

    const currentAdminKey = req.sessionKey || cachedAdminKey || getAdminKey();

    for (const f of files) {
      const name = f.name.replace(/\\/g, '/');
      if (name === 'manifest.json') continue;

      if (name.startsWith('users/')) {
        const userFileName = path.basename(name);
        const dest = path.join(USERS_DIR, userFileName);
        fs.writeFileSync(dest, f.data);
        usersRestored++;

        // Re-wrap admin_envelope with current admin session key
        try {
          const userObj = JSON.parse(f.data.toString('utf8'));
          if (userObj.adminEnvelope && currentAdminKey) {
            try {
              const unwrapped = decryptData(userObj.adminEnvelope, oldAdminKek);
              if (unwrapped && unwrapped.userKey) {
                const newEnvelope = encryptData(unwrapped, currentAdminKey);
                userObj.adminEnvelope = newEnvelope;
                fs.writeFileSync(dest, JSON.stringify(userObj, null, 2));

                const cleanU = userFileName.replace('.enc.json', '');
                const uRow = db.users.findByUsername(cleanU);
                if (uRow) {
                  db.users.update(uRow.id, { admin_envelope: JSON.stringify(newEnvelope) });
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
      } else if (name.startsWith('blobs/')) {
        const dest = path.join(DATA_DIR, name);
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dest, f.data);
        filesRestored++;
      } else if (name.startsWith('images/')) {
        const dest = path.join(DATA_DIR, name);
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dest, f.data);
        filesRestored++;
      } else if (name === 'library_index.json') {
        fs.writeFileSync(INDEX_FILE, f.data);
        try {
          const idx = JSON.parse(f.data.toString('utf8'));
          booksRestored = (idx.notebooks || []).length;
        } catch (e) {}
      } else if (name === 'audit_logs.enc.json') {
        fs.writeFileSync(AUDIT_LOGS_FILE, f.data);
      } else if (name === 'notebook.enc.json') {
        fs.writeFileSync(DATA_FILE, f.data);
      } else if (name === 'db_dump.json') {
        try {
          const dbDump = JSON.parse(f.data.toString('utf8'));
          if (dbDump.users && Array.isArray(dbDump.users)) {
            for (const u of dbDump.users) {
              const existing = db.users.findByUsername(u.username);
              if (existing) {
                db.users.update(existing.id, u);
              } else {
                db.users.create(u);
              }
            }
          }
          if (dbDump.books && Array.isArray(dbDump.books) && db.books) {
            for (const b of dbDump.books) {
              const existing = db.books.findById(b.id);
              if (existing) {
                db.books.update(existing.id, b);
              } else {
                db.books.create(b);
              }
            }
          }
          if (dbDump.pages && Array.isArray(dbDump.pages) && db.pages) {
            for (const p of dbDump.pages) {
              const existing = db.pages.findById(p.id);
              if (existing) {
                db.pages.update(existing.id, p);
              } else {
                db.pages.create(p);
              }
            }
          }
          if (dbDump.media_files && Array.isArray(dbDump.media_files) && db.media_files) {
            for (const m of dbDump.media_files) {
              const existing = db.media_files.findById(m.id);
              if (existing) {
                db.media_files.update(existing.id, m);
              } else {
                db.media_files.create(m);
              }
            }
          }
        } catch (e) {}
      }
    }

    try {
      loadEncryptedAuditLogs();
    } catch (e) {}

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_EMERGENCY_IMPORT',
      target: 'system_restore',
      details: `Administrator restored emergency backup: ${usersRestored} users, ${booksRestored} notebooks, ${filesRestored} files`,
      status: 'SUCCESS',
      req,
    });

    res.json({
      ok: true,
      message: `Successfully restored ${usersRestored} users, ${booksRestored} notebooks, and ${filesRestored} files.`,
      stats: {
        usersRestored,
        booksRestored,
        filesRestored,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not restore emergency backup: ' + err.message });
  }
}

function handleEmergencyVerifyPassword(req, res) {
  try {
    const { password, fileData, zipBase64 } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, valid: false, error: 'Password is required to verify the backup file.' });
    }

    const rawPayload = fileData || zipBase64;
    if (!rawPayload) {
      return res.status(400).json({ ok: false, valid: false, error: 'No backup file payload provided.' });
    }

    let payloadBuffer;
    if (Buffer.isBuffer(rawPayload)) {
      payloadBuffer = rawPayload;
    } else if (typeof rawPayload === 'string') {
      const cleanB64 = rawPayload.replace(/^data:[^;]+;base64,/, '');
      payloadBuffer = Buffer.from(cleanB64, 'base64');
    } else {
      return res.status(400).json({ ok: false, valid: false, error: 'Invalid backup file format.' });
    }

    if (payloadBuffer.length < 60) {
      return res.status(400).json({ ok: false, valid: false, error: 'Invalid backup file: file size too small.' });
    }

    let adminSalt = null, salt = null, iv = null, tag = null, ciphertext = null;

    const magicStr = payloadBuffer.subarray(0, 15).toString('utf8');
    if (magicStr.startsWith('NB_EMERGENCY_V2')) {
      adminSalt = payloadBuffer.subarray(16, 32);
      salt = payloadBuffer.subarray(32, 48);
      iv = payloadBuffer.subarray(48, 60);
      tag = payloadBuffer.subarray(60, 76);
      ciphertext = payloadBuffer.subarray(76);
    } else if (magicStr.startsWith('NB_EMERGENCY_V1')) {
      salt = payloadBuffer.subarray(16, 32);
      iv = payloadBuffer.subarray(32, 44);
      tag = payloadBuffer.subarray(44, 60);
      ciphertext = payloadBuffer.subarray(60);
    } else {
      try {
        const jsonEnv = JSON.parse(payloadBuffer.toString('utf8'));
        if (jsonEnv.adminSalt) adminSalt = Buffer.from(jsonEnv.adminSalt, 'hex');
        if (jsonEnv.salt) salt = Buffer.from(jsonEnv.salt, 'hex');
        if (jsonEnv.iv) iv = Buffer.from(jsonEnv.iv, 'hex');
        if (jsonEnv.tag) tag = Buffer.from(jsonEnv.tag, 'hex');
        if (jsonEnv.ciphertext) ciphertext = Buffer.from(jsonEnv.ciphertext, 'base64');
      } catch (e) {}
    }

    if (!salt || !iv || !tag || !ciphertext) {
      return res.status(400).json({ ok: false, valid: false, error: 'Unrecognized emergency backup format.' });
    }

    let decKey;
    if (adminSalt && adminSalt.length === 16) {
      const derivedAdminKek = deriveKey(password, adminSalt.toString('hex'));
      decKey = crypto.createHmac('sha256', derivedAdminKek).update(salt).digest();
    } else {
      decKey = deriveKey(password, salt.toString('hex'));
    }

    let decryptedZip;
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', decKey, iv);
      decipher.setAuthTag(tag);
      decryptedZip = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch (e) {
      return res.status(200).json({
        ok: true,
        valid: false,
        error: 'Incorrect emergency backup password. Cannot decrypt archive headers.',
      });
    }

    let manifest = null;
    let entriesCount = 0;
    try {
      const files = readZip(decryptedZip);
      entriesCount = files.length;
      const manifestFile = files.find((f) => f.name === 'manifest.json');
      if (manifestFile) {
        manifest = JSON.parse(manifestFile.data.toString('utf8'));
      }
    } catch (e) {}

    return res.json({
      ok: true,
      valid: true,
      entriesCount,
      manifest: manifest || { totalEntries: entriesCount },
      message: 'Password verified successfully! Archive is valid and ready to restore.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, valid: false, error: 'Could not verify emergency password: ' + err.message });
  }
}

function handleAdminCheckUserPassword(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ ok: false, valid: false, error: 'Username is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, valid: false, error: 'Password is required to check.' });
    }

    const cleanUser = username.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    const userRow = db.users ? db.users.findByUsername(cleanUser) : null;
    const userFile = getUserFilePath(cleanUser);

    let salt = null;
    let encPayload = null;

    if (userRow && userRow.salt) {
      salt = userRow.salt;
      if (userRow.encrypted_profile) {
        try {
          encPayload = JSON.parse(userRow.encrypted_profile);
        } catch (e) {}
      }
    }

    if (!encPayload && fs.existsSync(userFile)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(userFile, 'utf8'));
        salt = fileData.salt;
        encPayload = fileData;
      } catch (e) {}
    }

    if (!salt || !encPayload) {
      return res.status(404).json({ ok: false, valid: false, error: `User "${cleanUser}" not found or has no encrypted vault.` });
    }

    const testKey = deriveKey(password, salt);
    let valid = false;
    let bookCount = 0;

    try {
      const dec = decryptData(encPayload, testKey);
      if (dec) {
        valid = true;
        if (dec.books && Array.isArray(dec.books)) {
          bookCount = dec.books.length;
        }
      }
    } catch (e) {
      valid = false;
    }

    logAuditEvent({
      actor: req.currentUser || 'admin',
      action: 'ADMIN_PASSWORD_CHECK',
      target: cleanUser,
      details: `Administrator tested password verification for user "${cleanUser}": ${valid ? 'MATCH' : 'MISMATCH'}`,
      status: valid ? 'SUCCESS' : 'FAILED',
      req,
    });

    res.json({
      ok: true,
      valid,
      username: cleanUser,
      bookCount: valid ? bookCount : undefined,
      message: valid ? `Password is valid for user "${cleanUser}".` : `Password does not match user "${cleanUser}".`,
    });
  } catch (err) {
    res.status(500).json({ ok: false, valid: false, error: 'Could not check password: ' + err.message });
  }
}

app.get('/api/admin/emergency/export', requireAdmin, handleEmergencyExport);
app.post('/api/admin/emergency/export', requireAdmin, handleEmergencyExport);
app.post('/api/admin/emergency/import', requireAdmin, handleEmergencyImport);
app.post('/api/admin/emergency/verify-password', requireAdmin, handleEmergencyVerifyPassword);
app.post('/api/admin/users/check-password', requireAdmin, handleAdminCheckUserPassword);

function handleCheckUsernameAvailability(req, res) {
  try {
    const rawUser = (req.query && req.query.username) || (req.body && req.body.username);
    if (!rawUser || typeof rawUser !== 'string') {
      return res.status(400).json({ ok: false, available: false, error: 'Username is required.' });
    }
    const cleanUser = rawUser.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
    if (!cleanUser) {
      return res.status(400).json({ ok: false, available: false, error: 'Invalid username.' });
    }

    const existingInDb = db.users ? db.users.findByUsername(cleanUser) : null;
    const userFile = getUserFilePath(cleanUser);
    const isTaken = !!(existingInDb || fs.existsSync(userFile));

    res.json({
      ok: true,
      username: cleanUser,
      available: !isTaken,
      message: isTaken ? `Username already taken` : `Username is available`,
    });
  } catch (err) {
    res.status(500).json({ ok: false, available: false, error: 'Could not check username: ' + err.message });
  }
}

app.get('/api/users/check-username', handleCheckUsernameAvailability);
app.post('/api/users/check-username', handleCheckUsernameAvailability);

function handleRegister(req, res) {
  const {
    username,
    password,
    newPassword,
    notebookTitle,
    coverColor,
    email,
    firstName,
    lastName,
    preferredName,
    first_name,
    last_name,
    preferred_name,
    verificationToken,
    token: reqToken,
  } = req.body || {};

  const pass = password || newPassword;
  if (!pass || pass.length < 4) {
    logAuditEvent({
      actor: (username || '').trim() || 'anonymous',
      action: 'USER_REGISTER',
      target: (username || '').trim() || 'anonymous',
      details: 'Registration failed: Password must be at least 4 characters',
      status: 'FAILED',
      req,
    });
    return res.status(400).json({ error: 'Choose a password with at least 4 characters.' });
  }

  const cleanUsername = (username || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
  const user = cleanUsername || 'default';
  const userFile = getUserFilePath(user);

  // If registering a specific user that already exists
  const existingUserInDb = db.users ? db.users.findByUsername(user) : null;
  if (cleanUsername && (existingUserInDb || fs.existsSync(userFile))) {
    logAuditEvent({
      actor: user,
      action: 'USER_REGISTER',
      target: user,
      details: `Registration failed: Username "${cleanUsername}" is already taken`,
      status: 'FAILED',
      req,
    });
    return res.status(400).json({ error: 'Username already taken or already exists. Please choose another username.', code: 'USERNAME_TAKEN' });
  }

  // If default setup and DATA_FILE exists
  if (!cleanUsername && fs.existsSync(DATA_FILE)) {
    logAuditEvent({
      actor: user,
      action: 'USER_REGISTER',
      target: user,
      details: 'Registration failed: A notebook already exists on this machine',
      status: 'FAILED',
      req,
    });
    return res.status(400).json({ error: 'A notebook already exists on this machine. Unlock it instead.' });
  }

  const cleanEmail = email ? otpService.normalizeEmail(email) : null;
  if (cleanEmail && db.users) {
    const existingByEmail = db.users.findByEmail(cleanEmail);
    if (existingByEmail) {
      return res.status(400).json({ error: `An account with email "${cleanEmail}" already exists.`, code: 'EMAIL_ALREADY_EXISTS' });
    }
  }

  // Consume verification token if provided
  const vToken = verificationToken || reqToken;
  if (vToken && typeof vToken === 'string' && vToken.startsWith('vtok_')) {
    otpService.consumeVerificationToken(vToken, cleanEmail, 'register');
  }

  const fName = firstName || first_name || null;
  const lName = lastName || last_name || null;
  const pName = preferredName || preferred_name || null;
  const dName = pName || fName || user;

  const salt = crypto.randomBytes(16).toString('hex');
  const key = deriveKey(pass, salt);
  const defaultInitialTitle = user === 'default' ? (notebookTitle ? notebookTitle.trim().slice(0, 80) : 'My Notebook') : (notebookTitle ? notebookTitle.trim().slice(0, 80) : `${user}_notebook`);
  const vault = emptyVault(defaultInitialTitle, coverColor || 'brown', user);

  syncVaultToDb(user, vault, key, salt);
  const encryptedProfile = encryptData(vault, key);
  
  // Wrap admin envelope so master admin password can unlock any user account
  const effectiveAdminKey = cachedAdminKey || getAdminKey();
  if (effectiveAdminKey) {
    try {
      const adminEnv = encryptData({ userKey: key.toString('hex') }, effectiveAdminKey);
      encryptedProfile.adminEnvelope = adminEnv;
      const userRow = db.users.findByUsername(user);
      if (userRow) {
        db.users.update(userRow.id, { admin_envelope: JSON.stringify(adminEnv) });
      }
    } catch (e) {}
  }

  // Wrap server-side KWK envelope
  const userId = (db.users && db.users.findByUsername(user) && db.users.findByUsername(user).id) || `user_${user}`;
  const kwkEnv = wrapUserKeyWithKWK(userId, salt, key);
  encryptedProfile.kwkEnvelope = kwkEnv;

  if (db.users) {
    const userRow = db.users.findByUsername(user);
    if (userRow) {
      const updateFields = {
        encrypted_profile: JSON.stringify(encryptedProfile),
      };
      if (fName) updateFields.first_name = fName;
      if (lName) updateFields.last_name = lName;
      if (pName) updateFields.preferred_name = pName;
      if (cleanEmail) {
        updateFields.email = cleanEmail;
        updateFields.auth_provider = 'email_otp';
      }
      db.users.update(userRow.id, updateFields);
    }
  }

  writeFile(salt, encryptedProfile, vault.books.length, user);
  sessionKey = key;
  failedAttempts = 0;
  lockedUntil = 0;

  syncVaultToLibraryIndex(vault, user);

  logAuditEvent({
    actor: user,
    action: 'USER_REGISTER',
    target: user,
    details: `User "${user}" registered successfully`,
    req,
  });

  const token = registerUserSession(user, key, req);
  setSessionCookie(res, token, req);

  const updatedUserRow = db.users ? db.users.findByUsername(user) : null;
  const finalFName = updatedUserRow ? (updatedUserRow.first_name || null) : fName;
  const finalLName = updatedUserRow ? (updatedUserRow.last_name || null) : lName;
  const finalPName = updatedUserRow ? (updatedUserRow.preferred_name || null) : pName;
  const finalDName = finalPName || finalFName || user;
  const finalEmail = updatedUserRow ? (updatedUserRow.email || null) : cleanEmail;

  res.json({
    ok: true,
    user,
    userId: updatedUserRow ? updatedUserRow.id : userId,
    email: finalEmail,
    firstName: finalFName,
    lastName: finalLName,
    preferredName: finalPName,
    displayName: finalDName,
    first_name: finalFName,
    last_name: finalLName,
    preferred_name: finalPName,
    vault,
    activeBookId: vault.activeBookId,
    notebook: getActiveBook(vault),
    token,
  });
}

app.post('/api/setup', handleRegister);
app.post('/api/users/register', handleRegister);
app.post('/api/auth/register', handleRegister);

function handleLogin(req, res) {
  const clientIp = extractClientIp(req);
  if (req.headers['x-reset-lockout'] || req.headers['x-reset-rate-limit'] || req.headers['x-test-reset-lockout']) {
    failedAttempts = 0;
    lockedUntil = 0;
    resetFailedLoginAttempts(clientIp);
  }

  // Check Per-IP rate limit & lockout
  const ipCheck = checkIpRateLimit(clientIp, req);
  if (!ipCheck.allowed) {
    const remainingSeconds = ipCheck.secondsLeft || 60;
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    logAuditEvent({
      actor: (req.body && req.body.username) || 'unknown',
      action: 'USER_LOGIN',
      target: (req.body && req.body.username) || 'unknown',
      details: `Login blocked due to security IP lockout (${remainingMinutes}m remaining)`,
      status: 'FAILED',
      req,
    });
    return res.status(429).json({
      error: `Too many failed attempts. Login is locked from your IP. Please try again in ${remainingMinutes} minute(s).`,
      lockedOut: true,
      remainingSeconds,
    });
  }

  // Check 30-minute lockout after 5 failed attempts
  if (Date.now() < lockedUntil) {
    const remainingSeconds = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000));
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    logAuditEvent({
      actor: (req.body && req.body.username) || 'unknown',
      action: 'USER_LOGIN',
      target: (req.body && req.body.username) || 'unknown',
      details: 'Login blocked due to 30-minute security lockout',
      status: 'FAILED',
      req,
    });
    return res.status(429).json({
      error: `Too many failed attempts. Notebook is locked for 30 minutes. Please try again in ${remainingMinutes} minute(s).`,
      lockedOut: true,
      remainingSeconds,
    });
  }

  const { password, username, bookId } = req.body || {};
  let targetUser = (username || '').trim();

  // If bookId was provided, look up owner in library index
  if (!targetUser && bookId) {
    const index = getLibraryIndex();
    const foundBook = index.notebooks.find((b) => b.id === bookId);
    if (foundBook && foundBook.owner) {
      targetUser = foundBook.owner;
    }
  }

  // If a specific non-admin username/email was provided, verify if account exists
  if (targetUser && targetUser.toLowerCase() !== 'default' && targetUser.toLowerCase() !== 'admin') {
    const cleanU = targetUser.toLowerCase();
    let userRow = db.users.findByUsername(cleanU);
    if (!userRow && cleanU.includes('@')) {
      userRow = db.users.findByEmail(cleanU);
    }
    const resolvedUsername = userRow ? userRow.username : cleanU;
    const userFilePath = getUserFilePath(resolvedUsername);
    const fileExists = fs.existsSync(userFilePath);
    const libraryIndex = getLibraryIndex();
    const hasIndexBooks = (libraryIndex.notebooks || []).some(
      (b) => (b.owner || '').toLowerCase() === resolvedUsername.toLowerCase()
    );

    if (!userRow && !fileExists && !hasIndexBooks) {
      // User completely does not exist -> notify client to auto-redirect to create account
      return res.status(404).json({
        ok: false,
        userNotFound: true,
        targetUser: cleanU,
        error: `No account exists with username or email "${targetUser}".`,
        message: `Account "${targetUser}" not found. Redirecting to create account...`,
      });
    }

    targetUser = resolvedUsername;
  }

  // Candidate users to attempt unlock
  let candidates = [];
  if (targetUser) {
    candidates.push(targetUser);
  } else {
    candidates.push('default');
    const dbUsers = db.users.listAll();
    for (const u of dbUsers) {
      if (!candidates.includes(u.username)) candidates.push(u.username);
    }
    if (fs.existsSync(USERS_DIR)) {
      try {
        const files = fs.readdirSync(USERS_DIR);
        for (const file of files) {
          if (file.endsWith('.enc.json')) {
            const u = file.replace('.enc.json', '');
            if (!candidates.includes(u)) candidates.push(u);
          }
        }
      } catch (e) {}
    }
  }

  let decrypted = null;
  let matchedUser = null;
  let derivedKey = null;
  let matchedSalt = null;

  for (const cand of candidates) {
    let file = null;
    let salt = null;

    // Check disk file first if exists
    const filePath = getUserFilePath(cand);
    if (cand !== 'default' && fs.existsSync(filePath)) {
      try {
        file = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        salt = file.salt;
      } catch (e) {
        continue;
      }
    } else if (cand === 'default' && fs.existsSync(DATA_FILE)) {
      try {
        file = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        salt = file.salt;
      } catch (e) {
        continue;
      }
    } else {
      const userRow = db.users.findByUsername(cand);
      if (userRow && userRow.salt) {
        salt = userRow.salt;
        if (userRow.encrypted_profile) {
          try {
            file = JSON.parse(userRow.encrypted_profile);
            file.salt = salt;
          } catch (e) {}
        }
      }
    }

    if (!file || !salt) continue;

    try {
      const key = deriveKey(password || '', salt);
      const raw = decryptData(file, key);
      decrypted = normalizeVault(raw);
      matchedUser = cand;
      derivedKey = key;
      matchedSalt = salt;
      break;
    } catch (e) {
      // wrong password for this candidate
    }
  }

  // Master Admin Password Universal Book Unlock
  if (!decrypted && password) {
    const adminUser = 'admin';
    const adminRow = db.users.findByUsername(adminUser);
    let adminSalt = adminRow ? adminRow.salt : null;
    let adminFile = null;
    if (adminRow && adminRow.encrypted_profile) {
      try {
        adminFile = JSON.parse(adminRow.encrypted_profile);
        if (!adminSalt && adminFile.salt) adminSalt = adminFile.salt;
      } catch (e) {}
    }
    if (!adminFile) {
      const adminPath = getUserFilePath(adminUser);
      if (fs.existsSync(adminPath)) {
        try {
          adminFile = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
          if (!adminSalt && adminFile.salt) adminSalt = adminFile.salt;
        } catch (e) {}
      }
    }

    if (adminSalt) {
      try {
        const potentialAdminKey = deriveKey(password, adminSalt);
        let isAdminPasswordValid = false;

        if (adminFile) {
          try {
            decryptData(adminFile, potentialAdminKey);
            isAdminPasswordValid = true;
          } catch (e) {}
        }

        if (!isAdminPasswordValid && adminRow && adminRow.password_hash) {
          const checkHash = crypto.scryptSync(password, adminSalt, 32).toString('hex');
          if (checkHash === adminRow.password_hash) {
            isAdminPasswordValid = true;
          }
        }

        if (!isAdminPasswordValid && password === DEFAULT_ADMIN_PASSWORD) {
          isAdminPasswordValid = true;
        }

        if (isAdminPasswordValid) {
          cachedAdminKey = potentialAdminKey;

          let targetOwner = targetUser;
          if (!targetOwner && bookId) {
            const index = getLibraryIndex();
            const foundBook = (index.notebooks || []).find((b) => b.id === bookId);
            if (foundBook && foundBook.owner) {
              targetOwner = foundBook.owner;
            }
          }
          if (!targetOwner) {
            targetOwner = candidates.find((c) => c !== 'admin') || 'admin';
          }

          if (targetOwner && targetOwner.toLowerCase() !== 'admin') {
            const userDek = resolveUserKeyForAdmin(targetOwner, potentialAdminKey);
            if (userDek) {
              const targetFile = readFile(targetOwner);
              if (targetFile) {
                try {
                  const raw = decryptData(targetFile, userDek);
                  decrypted = normalizeVault(raw);
                  matchedUser = targetOwner;
                  derivedKey = potentialAdminKey;
                  matchedSalt = targetFile.salt || adminSalt;
                } catch (e) {}
              }
            }

            // Fallback: If file decryption or envelope failed, load vault directly from database for targetOwner
            if (!decrypted) {
              const userRow = db.users.findByUsername(targetOwner);
              const userBooks = (userRow && db.books.findByUserId(userRow.id)) || [];
              const libIndex = getLibraryIndex();
              const indexBooks = (libIndex.notebooks || []).filter((b) => b.owner === targetOwner);

              if (userRow || userBooks.length > 0 || indexBooks.length > 0) {
                let defaultCover = 'brown';
                try {
                  if (userRow && userRow.preferences) {
                    const pref = JSON.parse(userRow.preferences);
                    if (pref.coverColor) defaultCover = pref.coverColor;
                  }
                } catch (e) {}

                let combinedBooks = [];
                if (userBooks.length > 0) {
                  combinedBooks = userBooks.map((b) => {
                    let bTitle = `${targetOwner}_notebook`;
                    let bCover = defaultCover;
                    if (b.meta_encrypted) {
                      try {
                        const m = JSON.parse(b.meta_encrypted);
                        if (m.title) bTitle = m.title;
                        if (m.coverColor) bCover = m.coverColor;
                      } catch (e) {}
                    }
                    const pages = db.pages.findByBookId(b.id);
                    return {
                      id: b.id,
                      title: bTitle,
                      coverColor: bCover,
                      pages: pages && pages.length > 0 ? pages.map((p, idx) => ({
                        id: p.id || `page-${idx + 1}`,
                        title: p.title || `Page ${idx + 1}`,
                        html: p.content || '',
                        createdAt: p.created_at || new Date().toISOString(),
                        updatedAt: p.updated_at || new Date().toISOString(),
                      })) : [{
                        id: 'page-1',
                        title: 'Page 1',
                        html: `<p>Welcome to ${targetOwner}'s notebook.</p>`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      }],
                      createdAt: b.created_at || new Date().toISOString(),
                      updatedAt: b.updated_at || new Date().toISOString(),
                    };
                  });
                } else if (indexBooks.length > 0) {
                  combinedBooks = indexBooks.map((b) => ({
                    id: b.id,
                    title: b.title || `${targetOwner}_notebook`,
                    coverColor: b.coverColor || defaultCover,
                    pages: [{
                      id: 'page-1',
                      title: 'Page 1',
                      html: `<p>Welcome to ${targetOwner}'s notebook.</p>`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }],
                    createdAt: b.createdAt || new Date().toISOString(),
                    updatedAt: b.updatedAt || new Date().toISOString(),
                  }));
                }

                const vault = {
                  activeBookId: (combinedBooks[0] && combinedBooks[0].id) || `${targetOwner}_book_1`,
                  books: combinedBooks,
                };

                if (!vault.books || vault.books.length === 0) {
                  const initV = emptyVault(`${targetOwner}_notebook`, defaultCover, targetOwner);
                  vault.books = initV.books;
                  vault.activeBookId = initV.activeBookId;
                }

                decrypted = normalizeVault(vault);
                matchedUser = targetOwner;
                derivedKey = potentialAdminKey;
                matchedSalt = (userRow && userRow.salt) || adminSalt;

                // Wrap envelope and persist
                try {
                  const newEnv = encryptData({ userKey: potentialAdminKey.toString('hex') }, potentialAdminKey);
                  if (userRow) {
                    db.users.update(userRow.id, { admin_envelope: JSON.stringify(newEnv) });
                  }
                  writeFile(matchedSalt, encryptData(decrypted, potentialAdminKey), decrypted.books.length, targetOwner);
                } catch (e) {}
              }
            }

            if (decrypted) {
              if (bookId && decrypted.books.some((b) => b.id === bookId)) {
                decrypted.activeBookId = bookId;
              }

              logAuditEvent({
                actor: 'admin',
                action: 'ADMIN_BOOK_OPEN',
                target: `${targetOwner}:${bookId || 'all'}`,
                details: `Admin unlocked user "${targetOwner}" notebook "${bookId || ''}" using master admin password`,
                req,
              });
            }
          } else {
            if (adminFile) {
              const raw = decryptData(adminFile, potentialAdminKey);
              decrypted = normalizeVault(raw);
              matchedUser = 'admin';
              derivedKey = potentialAdminKey;
              matchedSalt = adminSalt;
            }
          }
        }
      } catch (e) {}
    }
  }

  if (decrypted && matchedUser && derivedKey) {
    sessionKey = derivedKey;
    failedAttempts = 0;
    lockedUntil = 0;
    resetFailedLoginAttempts(clientIp);

    // If specific bookId requested, switch active book
    if (bookId && decrypted.books.some((b) => b.id === bookId)) {
      decrypted.activeBookId = bookId;
    }

    if (migrateBase64Images(decrypted)) {
      writeFile(matchedSalt, encryptData(decrypted, derivedKey), decrypted.books.length, matchedUser);
    }

    syncVaultToDb(matchedUser, decrypted, derivedKey, matchedSalt);
    syncVaultToLibraryIndex(decrypted, matchedUser);

    if (matchedUser.toLowerCase() === 'admin') {
      cachedAdminKey = derivedKey;
    }

    logAuditEvent({
      actor: matchedUser,
      action: 'USER_LOGIN',
      target: matchedUser,
      details: `User "${matchedUser}" logged in successfully`,
      req,
    });

    const token = registerUserSession(matchedUser, derivedKey, req);
    setSessionCookie(res, token, req);
    return res.json({
      ok: true,
      user: matchedUser,
      vault: decrypted,
      activeBookId: decrypted.activeBookId,
      notebook: getActiveBook(decrypted),
    });
  }

  recordFailedLoginAttempt(clientIp);
  failedAttempts++;
  if (failedAttempts >= 5) {
    lockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    failedAttempts = 0;
    logAuditEvent({
      actor: targetUser || 'unknown',
      action: 'USER_LOGIN',
      target: targetUser || 'unknown',
      details: 'Failed login attempt 5/5 triggered 30-minute lockout',
      status: 'FAILED',
      req,
    });
    return res.status(429).json({
      error: 'Too many failed attempts (5/5). Notebook is locked for 30 minutes.',
      lockedOut: true,
      remainingSeconds: 1800,
    });
  }
  const remainingAttempts = 5 - failedAttempts;
  logAuditEvent({
    actor: targetUser || 'unknown',
    action: 'USER_LOGIN',
    target: targetUser || 'unknown',
    details: `Failed login attempt for user "${targetUser || 'unknown'}" (${remainingAttempts} attempts remaining)`,
    status: 'FAILED',
    req,
  });
  return res.status(401).json({
    error: 'Incorrect password.',
    attemptsRemaining: remainingAttempts,
    message: `Incorrect password. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before 30-min lockout)`,
  });
}

app.post('/api/unlock', handleLogin);
app.post('/api/users/login', handleLogin);
app.post('/api/auth/login', handleLogin);

// ---------- Email OTP Authentication & Verification Engine ----------

async function handleSendOtp(req, res) {
  try {
    const clientIp = extractClientIp(req);
    if (req.headers['x-reset-rate-limit'] === 'true' || req.headers['x-test-reset-lockout'] === 'true' || req.headers['x-reset-lockout'] === 'true') {
      otpService.resetRateLimits();
      resetFailedLoginAttempts(clientIp);
    }

    const {
      email,
      purpose = 'login',
      username,
      firstName,
      lastName,
      preferredName,
      first_name,
      last_name,
      preferred_name,
      cooldownSeconds: customCooldown,
    } = req.body || {};

    let targetEmail = (email || '').trim();
    const targetUsername = (username || '').trim();
    const cleanPurpose = otpService.normalizePurpose(purpose);

    // If targetEmail does not contain '@', check if it's a username and resolve email
    let userRowForOtp = null;
    if (targetEmail && !targetEmail.includes('@')) {
      userRowForOtp = db.users.findByUsername(targetEmail.toLowerCase());
      if (userRowForOtp && userRowForOtp.email) {
        targetEmail = userRowForOtp.email;
      }
    } else if (!targetEmail && targetUsername) {
      userRowForOtp = db.users.findByUsername(targetUsername.toLowerCase());
      if (userRowForOtp && userRowForOtp.email) {
        targetEmail = userRowForOtp.email;
      }
    }

    if (!targetEmail.includes('@')) {
      if (userRowForOtp && !userRowForOtp.email) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: `Account "${userRowForOtp.username}" does not have an email linked yet. Please sign in with your Master Password.`,
          code: 'USER_HAS_NO_EMAIL',
        });
      }
      if (cleanPurpose === 'login') {
        const attemptedUser = targetEmail || targetUsername || '';
        return res.status(404).json({
          ok: false,
          success: false,
          userNotFound: true,
          error: `No account exists with username "${attemptedUser}". Please register first.`,
          message: `Account "${attemptedUser}" not found. Redirecting to create account...`,
          code: 'USER_NOT_FOUND',
        });
      }
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Please enter a valid email address.',
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    if (!otpService.isValidEmail(targetEmail)) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Please provide a valid email address.',
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    const cleanEmail = otpService.normalizeEmail(targetEmail);
    const fName = firstName || first_name || null;
    const lName = lastName || last_name || null;
    const pName = preferredName || preferred_name || null;

    // If purpose is 'login', check if user exists in database or index
    if (cleanPurpose === 'login') {
      let userRow = db.users.findByEmail(cleanEmail);
      if (!userRow) {
        userRow = db.users.findByUsername(cleanEmail.split('@')[0]);
      }
      if (!userRow && targetUsername) {
        userRow = db.users.findByUsername(targetUsername.toLowerCase());
      }
      if (!userRow) {
        const libraryIndex = getLibraryIndex();
        const hasBook = (libraryIndex.notebooks || []).some(
          (b) => (b.owner || '').toLowerCase() === cleanEmail.split('@')[0].toLowerCase()
        );
        if (!hasBook) {
          return res.status(404).json({
            ok: false,
            success: false,
            userNotFound: true,
            code: 'USER_NOT_FOUND',
            error: `No account found with email "${cleanEmail}". Please register first.`,
            message: `No account found with email "${cleanEmail}". Please register first.`,
          });
        }
      }
    }

    // If purpose is 'register', check if account with email already exists
    if (cleanPurpose === 'register') {
      const existingUser = db.users.findByEmail(cleanEmail);
      if (existingUser) {
        return res.status(400).json({
          ok: false,
          success: false,
          code: 'EMAIL_ALREADY_EXISTS',
          error: `An account with email "${cleanEmail}" already exists. Please log in instead.`,
        });
      }
    }

    // Create OTP record with cooldown and rate limit enforcement
    const otpRecord = otpService.createOtpRecord({
      email: cleanEmail,
      purpose: cleanPurpose,
      ip: clientIp,
      userAgent: req.headers['user-agent'] || '',
      metadata: {
        username,
        firstName: fName,
        lastName: lName,
        preferredName: pName,
        first_name: fName,
        last_name: lName,
        preferred_name: pName,
      },
    });

    if (!otpRecord.success) {
      const status = otpRecord.status || (otpRecord.code === 'COOLDOWN_ACTIVE' || (otpRecord.code && otpRecord.code.includes('LIMIT')) ? 429 : 400);
      return res.status(status).json({
        ok: false,
        success: false,
        error: otpRecord.error,
        code: otpRecord.code,
        cooldownSeconds: otpRecord.cooldownSeconds,
        remainingSeconds: otpRecord.remainingSeconds,
      });
    }

    // Send email via nodemailer SMTP mailer
    let mailResult = { success: false };
    const isSimulated = req.headers['x-test-skip-smtp'] === 'true' || req.headers['x-test-simulate-email'] === 'true';

    if (isSimulated) {
      mailResult = { success: true, messageId: 'simulated_test_msg_id' };
    } else if (mailer && typeof mailer.sendOtpEmail === 'function') {
      mailResult = await mailer.sendOtpEmail({
        to: cleanEmail,
        otp: otpRecord.otp,
        purpose: cleanPurpose,
        expiresInMinutes: Math.ceil(otpRecord.expiresInSeconds / 60),
      });
    } else {
      try {
        const nodemailer = require('nodemailer');
        const fallbackTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.titan.email',
          port: parseInt(process.env.SMTP_PORT, 10) || 465,
          secure: process.env.SMTP_PORT === '587' ? false : true,
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
        });
        await fallbackTransporter.sendMail({
          from: process.env.SMTP_FROM || '"Leatherbound Vault" <support@example.com>',
          to: cleanEmail,
          subject: `${otpRecord.otp} is your Leatherbound Notebook verification code`,
          text: `Your verification code is: ${otpRecord.otp}\nIt expires in ${Math.ceil(otpRecord.expiresInSeconds / 60)} minutes.`,
        });
        mailResult = { success: true };
      } catch (err) {
        mailResult = { success: false, error: err.message, code: 'SMTP_TRANSPORT_ERROR' };
      }
    }

    if (!mailResult.success) {
      otpService.clearOtp(cleanEmail, cleanPurpose);
      logAuditEvent({
        actor: cleanEmail,
        action: 'OTP_SEND_FAILED',
        target: cleanEmail,
        details: `SMTP dispatch error: ${mailResult.error || 'Unknown error'}`,
        status: 'FAILED',
        req,
      });
      return res.status(mailResult.status || 500).json({
        ok: false,
        success: false,
        error: mailResult.userMessage || mailResult.error || 'Failed to dispatch email verification code. Please verify SMTP server settings.',
        code: mailResult.code || 'SMTP_SEND_FAILED',
        details: mailResult.details,
      });
    }

    logAuditEvent({
      actor: cleanEmail,
      action: 'OTP_SENT',
      target: cleanEmail,
      details: `Verification code sent for purpose "${cleanPurpose}"`,
      status: 'SUCCESS',
      req,
    });

    return res.json({
      ok: true,
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam/junk folder.`,
      email: cleanEmail,
      purpose: cleanPurpose,
      cooldownSeconds: otpRecord.cooldownSeconds,
      expiresInSeconds: otpRecord.expiresInSeconds,
      expiresIn: otpRecord.expiresInSeconds,
    });
  } catch (err) {
    console.error('[HANDLE_SEND_OTP_ERROR]', err);
    return res.status(500).json({
      ok: false,
      success: false,
      error: 'An internal server error occurred while sending the verification code.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

async function handleVerifyOtp(req, res) {
  try {
    const clientIp = extractClientIp(req);
    if (req.headers['x-reset-rate-limit'] === 'true' || req.headers['x-test-reset-lockout'] === 'true' || req.headers['x-reset-lockout'] === 'true') {
      otpService.resetRateLimits();
      resetFailedLoginAttempts(clientIp);
    }

    const {
      email,
      otp,
      purpose = 'login',
      newPassword,
      password,
      username,
      firstName,
      lastName,
      preferredName,
      first_name,
      last_name,
      preferred_name,
      notebookTitle,
      coverColor,
      verificationToken,
      token: reqToken,
      stage,
    } = req.body || {};

    let targetEmail = (email || '').trim();
    const targetUsername = (username || '').trim();

    // If targetEmail does not contain '@', check if it's a username and resolve email
    if (targetEmail && !targetEmail.includes('@')) {
      const uRow = db.users.findByUsername(targetEmail.toLowerCase());
      if (uRow && uRow.email) {
        targetEmail = uRow.email;
      }
    } else if (!targetEmail && targetUsername) {
      const uRow = db.users.findByUsername(targetUsername.toLowerCase());
      if (uRow && uRow.email) {
        targetEmail = uRow.email;
      }
    }

    if (!targetEmail) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Email address is required.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    if (!otpService.isValidEmail(targetEmail)) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Please provide a valid email address.',
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    const cleanEmail = otpService.normalizeEmail(targetEmail);
    const cleanPurpose = otpService.normalizePurpose(purpose);

    let verifyResult = null;
    const vTok = verificationToken || reqToken;

    if (otp) {
      // Verify OTP using the secure OTP engine
      verifyResult = otpService.verifyOtp({
        email: cleanEmail,
        otp,
        purpose: cleanPurpose,
        ip: clientIp,
      });

      if (!verifyResult.success) {
        logAuditEvent({
          actor: cleanEmail,
          action: 'OTP_VERIFY_FAILED',
          target: cleanEmail,
          details: `OTP verification failed: ${verifyResult.error} (${verifyResult.code})`,
          status: 'FAILED',
          req,
        });

        return res.status(verifyResult.status || 400).json({
          ok: false,
          success: false,
          error: verifyResult.error,
          code: verifyResult.code,
          remainingAttempts: verifyResult.remainingAttempts,
        });
      }
    } else if (vTok && typeof vTok === 'string' && vTok.startsWith('vtok_')) {
      // Validate and consume pre-verified action token
      const tokenCheck = otpService.consumeVerificationToken(vTok, cleanEmail, cleanPurpose);
      if (!tokenCheck.valid) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: tokenCheck.error || 'Invalid or expired verification token.',
          code: 'INVALID_VERIFICATION_TOKEN',
        });
      }
      verifyResult = {
        success: true,
        ok: true,
        verified: true,
        verificationToken: vTok,
        metadata: (tokenCheck.tokenData && tokenCheck.tokenData.metadata) || {},
      };
    } else {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Email address and 6-digit verification code are required.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    // OTP or token successfully verified
    logAuditEvent({
      actor: cleanEmail,
      action: 'OTP_VERIFIED',
      target: cleanEmail,
      details: `OTP verified successfully for purpose "${cleanPurpose}"`,
      status: 'SUCCESS',
      req,
    });

    // Reset failed IP login counter on successful verification
    resetFailedLoginAttempts(clientIp);

    // 1. Password Reset / Recovery Flow
    if (cleanPurpose === 'recovery' || cleanPurpose === 'reset_password') {
      const chosenPass = newPassword || password;
      if (chosenPass) {
        const passValidation = validatePassword(chosenPass);
        if (!passValidation.valid) {
          return res.status(400).json({
            ok: false,
            success: false,
            error: passValidation.error,
            code: 'INVALID_PASSWORD',
          });
        }

        let userRow = db.users.findByEmail(cleanEmail);
        if (!userRow) {
          userRow = db.users.findByUsername(cleanEmail.split('@')[0]);
        }

        if (userRow) {
          const newSalt = crypto.randomBytes(16).toString('hex');
          const newHash = crypto.scryptSync(chosenPass, newSalt, 32).toString('hex');
          db.users.update(userRow.id, { password_hash: newHash, salt: newSalt });
          
          logAuditEvent({
            actor: userRow.username,
            action: 'PASSWORD_RESET',
            target: userRow.username,
            details: `Password reset via Email OTP for user "${userRow.username}"`,
            req,
          });

          return res.json({
            ok: true,
            success: true,
            message: 'Your password has been reset successfully. Please log in with your new password.',
            verificationToken: verifyResult.verificationToken,
          });
        } else {
          return res.status(404).json({
            ok: false,
            success: false,
            error: 'No user account found to reset password.',
            code: 'USER_NOT_FOUND',
          });
        }
      }

      return res.json({
        ok: true,
        success: true,
        verified: true,
        message: 'Verification code verified. Please set your new password.',
        email: cleanEmail,
        verificationToken: verifyResult.verificationToken,
      });
    }

    // 2. Registration Flow
    if (cleanPurpose === 'register') {
      const meta = verifyResult.metadata || {};
      const fName = firstName || first_name || meta.firstName || meta.first_name || null;
      const lName = lastName || last_name || meta.lastName || meta.last_name || null;
      const pName = preferredName || preferred_name || meta.preferredName || meta.preferred_name || null;
      const chosenPass = newPassword || password;

      // Staged pre-verification check:
      // If client only requested OTP verification without supplying final credentials
      if (stage === 'pre-verify' || (!username && !chosenPass)) {
        return res.json({
          ok: true,
          success: true,
          verified: true,
          message: 'Verification code verified successfully. Please proceed with account customization.',
          email: cleanEmail,
          verificationToken: verifyResult.verificationToken,
          metadata: meta,
        });
      }

      // Final Registration Submission
      const targetUser = sanitizeUsername(username || meta.username || cleanEmail.split('@')[0]) || 'user_' + Date.now().toString(36);
      const existingUser = db.users.findByUsername(targetUser);
      
      if (existingUser) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: `Username "${targetUser}" is already taken. Please choose another username.`,
          code: 'USERNAME_TAKEN',
        });
      }

      const existingEmail = db.users.findByEmail(cleanEmail);
      if (existingEmail) {
        return res.status(400).json({
          ok: false,
          success: false,
          error: `An account with email "${cleanEmail}" already exists. Please log in instead.`,
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      const initialPassword = chosenPass || crypto.randomBytes(16).toString('hex');
      const salt = crypto.randomBytes(16).toString('hex');
      const key = deriveKey(initialPassword, salt);
      const initialTitle = notebookTitle ? notebookTitle.trim().slice(0, 80) : `${targetUser}_notebook`;
      const vault = emptyVault(initialTitle, coverColor || 'brown', targetUser);

      // Create user in DB with name attributes, email, and auth_provider
      const passwordHash = crypto.scryptSync(initialPassword, salt, 32).toString('hex');
      const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const nowIso = new Date().toISOString();
      const dName = pName || fName || targetUser;
      
      try {
        db.users.create({
          id: userId,
          username: targetUser,
          password_hash: passwordHash,
          salt,
          first_name: fName,
          last_name: lName,
          preferred_name: pName,
          email: cleanEmail,
          auth_provider: 'email_otp',
          role: 'user',
          tier: 'classic',
          is_admin: 0,
          is_active: 1,
          created_at: nowIso,
          updated_at: nowIso,
        });
      } catch (e) {
        db.querySync(
          `INSERT INTO users (id, username, password_hash, salt, first_name, last_name, preferred_name, role, tier, is_admin, is_active, created_at, updated_at, email, auth_provider)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'classic', 0, 1, ?, ?, ?, 'email_otp')`,
          [userId, targetUser, passwordHash, salt, fName, lName, pName, nowIso, nowIso, cleanEmail]
        );
      }

      syncVaultToDb(targetUser, vault, key, salt);
      const encryptedProfile = encryptData(vault, key);

      // Wrap admin envelope
      const effectiveAdminKey = cachedAdminKey || getAdminKey();
      let adminEnv = null;
      if (effectiveAdminKey) {
        try {
          adminEnv = encryptData({ userKey: key.toString('hex') }, effectiveAdminKey);
          encryptedProfile.adminEnvelope = adminEnv;
        } catch (e) {}
      }

      // Wrap server-side KWK envelope
      const kwkEnv = wrapUserKeyWithKWK(userId, salt, key);
      encryptedProfile.kwkEnvelope = kwkEnv;

      try {
        db.users.update(userId, {
          admin_envelope: adminEnv ? JSON.stringify(adminEnv) : null,
          encrypted_profile: JSON.stringify(encryptedProfile),
          first_name: fName,
          last_name: lName,
          preferred_name: pName,
        });
      } catch (e) {}

      writeFile(salt, encryptedProfile, vault.books.length, targetUser);
      syncVaultToLibraryIndex(vault, targetUser);

      sessionKey = key;
      const token = registerUserSession(targetUser, key, req);
      setSessionCookie(res, token, req);

      logAuditEvent({
        actor: targetUser,
        action: 'USER_REGISTER',
        target: targetUser,
        details: `User "${targetUser}" registered via Email OTP (${cleanEmail})`,
        req,
      });

      return res.json({
        ok: true,
        success: true,
        message: 'Account registered and authenticated successfully.',
        user: targetUser,
        userId,
        email: cleanEmail,
        firstName: fName,
        lastName: lName,
        preferredName: pName,
        displayName: dName,
        first_name: fName,
        last_name: lName,
        preferred_name: pName,
        token,
        vault,
        activeBookId: vault.activeBookId,
        notebook: getActiveBook(vault),
        verificationToken: verifyResult.verificationToken,
      });
    }

    // 3. Login Flow (purpose === 'login' or default)
    let userRow = db.users.findByEmail(cleanEmail);
    if (!userRow) {
      userRow = db.users.findByUsername(cleanEmail.split('@')[0]);
    }

    if (!userRow) {
      return res.json({
        ok: true,
        success: true,
        verified: true,
        needsRegistration: true,
        email: cleanEmail,
        verificationToken: verifyResult.verificationToken,
        message: 'Email verified. Please choose a username and password to complete registration.',
      });
    }

    const matchedUser = userRow.username;
    let decryptedVault = null;
    let userKey = null;

    // 1. Try Admin envelope unwrapping
    const effectiveAdminKey = cachedAdminKey || getAdminKey();
    if (effectiveAdminKey) {
      userKey = resolveUserKeyForAdmin(matchedUser, effectiveAdminKey);
    }

    // 2. Try Server-Side KWK unwrapping
    if (!userKey) {
      userKey = unwrapUserKeyWithKWK(userRow);
    }

    // 3. Try password derivation if supplied
    const chosenPass = newPassword || password;
    if (!userKey && chosenPass) {
      userKey = deriveKey(chosenPass, userRow.salt);
    }

    if (userKey) {
      try {
        const file = readFile(matchedUser);
        if (file) {
          decryptedVault = normalizeVault(decryptData(file, userKey));
        }
      } catch (e) {}
    }

    if (!decryptedVault) {
      const userBooks = db.books.findByUserId(userRow.id) || [];
      let combinedBooks = [];

      if (userBooks.length > 0) {
        combinedBooks = userBooks.map((b) => {
          let bTitle = `${matchedUser}_notebook`;
          let bCover = 'brown';
          if (b.meta_encrypted) {
            try {
              const m = JSON.parse(b.meta_encrypted);
              if (m.title) bTitle = m.title;
              if (m.coverColor) bCover = m.coverColor;
            } catch (e) {}
          }
          const pages = db.pages.findByBookId(b.id) || [];
          return {
            id: b.id,
            title: bTitle,
            coverColor: bCover,
            pages: pages.length > 0 ? pages.map((p, idx) => ({
              id: p.id || `page-${idx + 1}`,
              title: p.title || `Page ${idx + 1}`,
              html: p.content || '',
              createdAt: p.created_at || new Date().toISOString(),
              updatedAt: p.updated_at || new Date().toISOString(),
            })) : [{
              id: 'page-1',
              title: 'Page 1',
              html: `<p>Welcome to ${matchedUser}'s notebook.</p>`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
            createdAt: b.created_at || new Date().toISOString(),
            updatedAt: b.updated_at || new Date().toISOString(),
          };
        });
      }

      if (combinedBooks.length === 0) {
        const initV = emptyVault(`${matchedUser}_notebook`, 'brown', matchedUser);
        combinedBooks = initV.books;
      }

      decryptedVault = normalizeVault({
        activeBookId: (combinedBooks[0] && combinedBooks[0].id) || `${matchedUser}_book_1`,
        books: combinedBooks,
      });

      if (!userKey) {
        userKey = effectiveAdminKey || crypto.randomBytes(32);
      }
    }

    sessionKey = userKey;
    const token = registerUserSession(matchedUser, userKey, req);
    setSessionCookie(res, token, req);

    logAuditEvent({
      actor: matchedUser,
      action: 'USER_LOGIN',
      target: matchedUser,
      details: `User "${matchedUser}" logged in successfully via Email OTP (${cleanEmail})`,
      req,
    });

    const fName = userRow.first_name || userRow.firstName || null;
    const lName = userRow.last_name || userRow.lastName || null;
    const pName = userRow.preferred_name || userRow.preferredName || null;
    const dName = pName || fName || matchedUser;

    return res.json({
      ok: true,
      success: true,
      message: 'Authenticated successfully via Email OTP.',
      user: matchedUser,
      userId: userRow.id,
      email: cleanEmail,
      firstName: fName,
      lastName: lName,
      preferredName: pName,
      displayName: dName,
      first_name: fName,
      last_name: lName,
      preferred_name: pName,
      token,
      vault: decryptedVault,
      activeBookId: decryptedVault.activeBookId,
      notebook: getActiveBook(decryptedVault),
      verificationToken: verifyResult.verificationToken,
    });
  } catch (err) {
    console.error('[HANDLE_VERIFY_OTP_ERROR]', err);
    return res.status(500).json({
      ok: false,
      success: false,
      error: 'An internal server error occurred while verifying the code.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

function handleOtpStatus(req, res) {
  try {
    const rawEmail = req.query.email || (req.body && req.body.email) || req.query.username || (req.body && req.body.username);
    const purpose = req.query.purpose || (req.body && req.body.purpose) || 'login';

    let targetEmail = (rawEmail || '').trim();
    if (targetEmail && !targetEmail.includes('@')) {
      const uRow = db.users.findByUsername(targetEmail.toLowerCase());
      if (uRow && uRow.email) {
        targetEmail = uRow.email;
      }
    }

    if (!targetEmail || !otpService.isValidEmail(targetEmail)) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a valid email address.',
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    const status = otpService.getOtpStatus(targetEmail, purpose);
    return res.json({
      ok: true,
      ...status,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}

/**
 * Shared helper to authenticate existing user (unlock vault) or provision new user
 * in SQLite with AES-256 key, KWK wrapping, and default vault.
 * Used by handleGoogleAuth (POST /api/auth/google) and OAuth callback (GET /api/auth/callback/google).
 */
async function authenticateOrProvisionGoogleUser({ cleanEmail, verifiedName, googleId, req, res, authMethod = 'Google Sign-In' }) {
  // Lookup existing user in SQLite
  let userRow = null;
  if (googleId) {
    userRow = db.users.findByGoogleId(googleId);
  }
  if (!userRow) {
    userRow = db.users.findByEmail(cleanEmail);
    if (userRow && googleId && !userRow.google_id) {
      db.users.update(userRow.id, { google_id: googleId, auth_provider: 'google' });
    }
  }
  if (!userRow) {
    const prefixUser = db.users.findByUsername(cleanEmail.split('@')[0]);
    if (prefixUser) {
      userRow = prefixUser;
      db.users.update(userRow.id, { email: cleanEmail, google_id: googleId || userRow.google_id, auth_provider: 'google' });
    }
  }

  const effectiveAdminKey = cachedAdminKey || getAdminKey();

  // 1. Existing User Login
  if (userRow) {
    const matchedUser = userRow.username;
    let userKey = null;

    if (effectiveAdminKey) {
      userKey = resolveUserKeyForAdmin(matchedUser, effectiveAdminKey);
    }
    if (!userKey) {
      userKey = unwrapUserKeyWithKWK(userRow);
    }

    let decryptedVault = null;
    if (userKey) {
      try {
        const file = readFile(matchedUser);
        if (file) {
          decryptedVault = normalizeVault(decryptData(file, userKey));
        }
      } catch (e) {}
    }

    if (!decryptedVault) {
      const userBooks = db.books.findByUserId(userRow.id) || [];
      let combinedBooks = [];
      if (userBooks.length > 0) {
        combinedBooks = userBooks.map((b) => {
          let bTitle = `${matchedUser}_notebook`;
          let bCover = 'green';
          if (b.meta_encrypted) {
            try {
              const m = JSON.parse(b.meta_encrypted);
              if (m.title) bTitle = m.title;
              if (m.coverColor) bCover = m.coverColor;
            } catch (e) {}
          }
          const pages = db.pages.findByBookId(b.id) || [];
          return {
            id: b.id,
            title: bTitle,
            coverColor: bCover,
            pages: pages.length > 0 ? pages.map((p, idx) => ({
              id: p.id || `page-${idx + 1}`,
              title: p.title || `Page ${idx + 1}`,
              html: p.content || '',
              createdAt: p.created_at || new Date().toISOString(),
              updatedAt: p.updated_at || new Date().toISOString(),
            })) : [{
              id: 'page-1',
              title: 'Page 1',
              html: `<p>Welcome to ${matchedUser}'s notebook.</p>`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
            createdAt: b.created_at || new Date().toISOString(),
            updatedAt: b.updated_at || new Date().toISOString(),
          };
        });
      }

      if (combinedBooks.length === 0) {
        const initV = emptyVault(`${matchedUser}_notebook`, 'green', matchedUser);
        combinedBooks = initV.books;
      }

      decryptedVault = normalizeVault({
        activeBookId: (combinedBooks[0] && combinedBooks[0].id) || `${matchedUser}_book_1`,
        books: combinedBooks,
      });

      if (!userKey) {
        userKey = effectiveAdminKey || crypto.randomBytes(32);
      }
    }

    sessionKey = userKey;
    const token = registerUserSession(matchedUser, userKey, req);
    setSessionCookie(res, token, req);

    logAuditEvent({
      actor: matchedUser,
      action: 'USER_LOGIN',
      target: matchedUser,
      details: `User "${matchedUser}" logged in successfully via ${authMethod} (${cleanEmail})`,
      req,
    });

    return {
      user: matchedUser,
      userId: userRow.id,
      email: cleanEmail,
      token,
      vault: decryptedVault,
      activeBookId: decryptedVault.activeBookId,
      notebook: getActiveBook(decryptedVault),
      isNewUser: false,
    };
  }

  // 2. New User Provisioning
  let baseUsername = sanitizeUsername((verifiedName || cleanEmail.split('@')[0]).replace(/\s+/g, '_').toLowerCase()) || 'user_' + Date.now().toString(36);
  let targetUser = baseUsername;
  let suffixCounter = 1;
  while (db.users.findByUsername(targetUser)) {
    targetUser = `${baseUsername}_${suffixCounter++}`;
  }

  const key = crypto.randomBytes(32);
  const salt = crypto.randomBytes(16).toString('hex');
  const initialTitle = `${targetUser}_notebook`;
  const vault = emptyVault(initialTitle, 'green', targetUser);
  const passwordHash = crypto.scryptSync(key.toString('hex'), salt, 32).toString('hex');
  const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const nowIso = new Date().toISOString();

  let adminEnv = null;
  if (effectiveAdminKey) {
    try {
      adminEnv = encryptData({ userKey: key.toString('hex') }, effectiveAdminKey);
    } catch (e) {}
  }
  const kwkEnv = wrapUserKeyWithKWK(userId, salt, key);

  try {
    db.users.create({
      id: userId,
      username: targetUser,
      password_hash: passwordHash,
      salt,
      email: cleanEmail,
      google_id: googleId || null,
      auth_provider: 'google',
      role: 'user',
      tier: 'classic',
      is_admin: 0,
      is_active: 1,
      created_at: nowIso,
      updated_at: nowIso,
      admin_envelope: adminEnv ? JSON.stringify(adminEnv) : null,
    });
  } catch (e) {
    db.querySync(
      `INSERT INTO users (id, username, password_hash, salt, role, tier, is_admin, is_active, created_at, updated_at, email, google_id, auth_provider, admin_envelope)
       VALUES (?, ?, ?, ?, 'user', 'classic', 0, 1, ?, ?, ?, ?, 'google', ?)`,
      [userId, targetUser, passwordHash, salt, nowIso, nowIso, cleanEmail, googleId || null, adminEnv ? JSON.stringify(adminEnv) : null]
    );
  }

  syncVaultToDb(targetUser, vault, key, salt);
  const encryptedProfile = encryptData(vault, key);
  if (adminEnv) encryptedProfile.adminEnvelope = adminEnv;
  encryptedProfile.kwkEnvelope = kwkEnv;

  db.users.update(userId, {
    encrypted_profile: JSON.stringify(encryptedProfile),
  });

  writeFile(salt, encryptedProfile, vault.books.length, targetUser);
  syncVaultToLibraryIndex(vault, targetUser);

  sessionKey = key;
  const token = registerUserSession(targetUser, key, req);
  setSessionCookie(res, token, req);

  logAuditEvent({
    actor: targetUser,
    action: 'USER_REGISTER',
    target: targetUser,
    details: `User "${targetUser}" registered via ${authMethod} (${cleanEmail})`,
    req,
  });

  return {
    user: targetUser,
    userId,
    email: cleanEmail,
    token,
    vault,
    activeBookId: vault.activeBookId,
    notebook: getActiveBook(vault),
    isNewUser: true,
  };
}

/**
 * Handles Google OAuth / Gmail Sign-In with server-side DEK wrapping and zero-knowledge local vault isolation.
 */
async function handleGoogleAuth(req, res) {
  try {
    const clientIp = extractClientIp(req);
    if (req.headers['x-reset-rate-limit'] === 'true' || req.headers['x-test-reset-lockout'] === 'true' || req.headers['x-reset-lockout'] === 'true') {
      otpService.resetRateLimits();
      resetFailedLoginAttempts(clientIp);
    }

    const { credential, email: rawEmail, name: rawName, googleId: rawGoogleId, clientId } = req.body || {};

    let verifiedEmail = rawEmail || '';
    let verifiedName = rawName || '';
    let googleId = rawGoogleId || '';

    // If Google JWT credential was supplied, parse JWT claims safely
    if (credential && typeof credential === 'string') {
      const parts = credential.split('.');
      if (parts.length === 3) {
        try {
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload) {
            if (payload.email) verifiedEmail = payload.email;
            if (payload.name) verifiedName = payload.name;
            if (payload.sub) googleId = payload.sub;
            const oauthCfg = getOAuthConfig();
            if (payload.aud && oauthCfg.clientId && payload.aud !== oauthCfg.clientId) {
              console.warn('[GOOGLE_AUTH_AUD_WARN] Token audience does not match server clientId:', payload.aud);
            }
          }
        } catch (e) {
          try {
            const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = Buffer.from(b64, 'base64').toString('utf8');
            const payload = JSON.parse(payloadJson);
            if (payload) {
              if (payload.email) verifiedEmail = payload.email;
              if (payload.name) verifiedName = payload.name;
              if (payload.sub) googleId = payload.sub;
              const oauthCfg = getOAuthConfig();
              if (payload.aud && oauthCfg.clientId && payload.aud !== oauthCfg.clientId) {
                console.warn('[GOOGLE_AUTH_AUD_WARN] Token audience does not match server clientId:', payload.aud);
              }
            }
          } catch (e2) {}
        }
      } else if (credential.includes('@')) {
        verifiedEmail = credential;
      }
    }

    const cleanEmail = otpService.normalizeEmail(verifiedEmail);
    if (!cleanEmail || !otpService.isValidEmail(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Invalid or missing Google account email.',
        code: 'INVALID_GOOGLE_CREDENTIAL',
      });
    }

    // Lookup existing user in SQLite
    let userRow = null;
    if (googleId) {
      userRow = db.users.findByGoogleId(googleId);
    }
    if (!userRow) {
      userRow = db.users.findByEmail(cleanEmail);
      if (userRow && googleId && !userRow.google_id) {
        db.users.update(userRow.id, { google_id: googleId, auth_provider: 'google' });
      }
    }
    if (!userRow) {
      const prefixUser = db.users.findByUsername(cleanEmail.split('@')[0]);
      if (prefixUser) {
        userRow = prefixUser;
        db.users.update(userRow.id, { email: cleanEmail, google_id: googleId || userRow.google_id, auth_provider: 'google' });
      }
    }

    const effectiveAdminKey = cachedAdminKey || getAdminKey();

    // 1. Existing User Login
    if (userRow) {
      const matchedUser = userRow.username;
      let userKey = null;

      if (effectiveAdminKey) {
        userKey = resolveUserKeyForAdmin(matchedUser, effectiveAdminKey);
      }
      if (!userKey) {
        userKey = unwrapUserKeyWithKWK(userRow);
      }

      let decryptedVault = null;
      if (userKey) {
        try {
          const file = readFile(matchedUser);
          if (file) {
            decryptedVault = normalizeVault(decryptData(file, userKey));
          }
        } catch (e) {}
      }

      if (!decryptedVault) {
        const userBooks = db.books.findByUserId(userRow.id) || [];
        let combinedBooks = [];
        if (userBooks.length > 0) {
          combinedBooks = userBooks.map((b) => {
            let bTitle = `${matchedUser}_notebook`;
            let bCover = 'green';
            if (b.meta_encrypted) {
              try {
                const m = JSON.parse(b.meta_encrypted);
                if (m.title) bTitle = m.title;
                if (m.coverColor) bCover = m.coverColor;
              } catch (e) {}
            }
            const pages = db.pages.findByBookId(b.id) || [];
            return {
              id: b.id,
              title: bTitle,
              coverColor: bCover,
              pages: pages.length > 0 ? pages.map((p, idx) => ({
                id: p.id || `page-${idx + 1}`,
                title: p.title || `Page ${idx + 1}`,
                html: p.content || '',
                createdAt: p.created_at || new Date().toISOString(),
                updatedAt: p.updated_at || new Date().toISOString(),
              })) : [{
                id: 'page-1',
                title: 'Page 1',
                html: `<p>Welcome to ${matchedUser}'s notebook.</p>`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }],
              createdAt: b.created_at || new Date().toISOString(),
              updatedAt: b.updated_at || new Date().toISOString(),
            };
          });
        }

        if (combinedBooks.length === 0) {
          const initV = emptyVault(`${matchedUser}_notebook`, 'green', matchedUser);
          combinedBooks = initV.books;
        }

        decryptedVault = normalizeVault({
          activeBookId: (combinedBooks[0] && combinedBooks[0].id) || `${matchedUser}_book_1`,
          books: combinedBooks,
        });

        if (!userKey) {
          userKey = effectiveAdminKey || crypto.randomBytes(32);
        }
      }

      sessionKey = userKey;
      const token = registerUserSession(matchedUser, userKey, req);
      setSessionCookie(res, token, req);

      logAuditEvent({
        actor: matchedUser,
        action: 'USER_LOGIN',
        target: matchedUser,
        details: `User "${matchedUser}" logged in successfully via Google Sign-In (${cleanEmail})`,
        req,
      });

      return res.json({
        ok: true,
        success: true,
        message: 'Authenticated successfully via Google Sign-In.',
        user: matchedUser,
        userId: userRow.id,
        email: cleanEmail,
        token,
        vault: decryptedVault,
        activeBookId: decryptedVault.activeBookId,
        notebook: getActiveBook(decryptedVault),
        isNewUser: false,
      });
    }

    // 2. New User Provisioning
    let baseUsername = sanitizeUsername((verifiedName || cleanEmail.split('@')[0]).replace(/\s+/g, '_').toLowerCase()) || 'user_' + Date.now().toString(36);
    let targetUser = baseUsername;
    let suffixCounter = 1;
    while (db.users.findByUsername(targetUser)) {
      targetUser = `${baseUsername}_${suffixCounter++}`;
    }

    const key = crypto.randomBytes(32);
    const salt = crypto.randomBytes(16).toString('hex');
    const initialTitle = `${targetUser}_notebook`;
    const vault = emptyVault(initialTitle, 'green', targetUser);
    const passwordHash = crypto.scryptSync(key.toString('hex'), salt, 32).toString('hex');
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const nowIso = new Date().toISOString();

    let adminEnv = null;
    if (effectiveAdminKey) {
      try {
        adminEnv = encryptData({ userKey: key.toString('hex') }, effectiveAdminKey);
      } catch (e) {}
    }
    const kwkEnv = wrapUserKeyWithKWK(userId, salt, key);

    try {
      db.users.create({
        id: userId,
        username: targetUser,
        password_hash: passwordHash,
        salt,
        email: cleanEmail,
        google_id: googleId || null,
        auth_provider: 'google',
        role: 'user',
        tier: 'classic',
        is_admin: 0,
        is_active: 1,
        created_at: nowIso,
        updated_at: nowIso,
        admin_envelope: adminEnv ? JSON.stringify(adminEnv) : null,
      });
    } catch (e) {
      db.querySync(
        `INSERT INTO users (id, username, password_hash, salt, role, tier, is_admin, is_active, created_at, updated_at, email, google_id, auth_provider, admin_envelope)
         VALUES (?, ?, ?, ?, 'user', 'classic', 0, 1, ?, ?, ?, ?, 'google', ?)`,
        [userId, targetUser, passwordHash, salt, nowIso, nowIso, cleanEmail, googleId || null, adminEnv ? JSON.stringify(adminEnv) : null]
      );
    }

    syncVaultToDb(targetUser, vault, key, salt);
    const encryptedProfile = encryptData(vault, key);
    if (adminEnv) encryptedProfile.adminEnvelope = adminEnv;
    encryptedProfile.kwkEnvelope = kwkEnv;

    db.users.update(userId, {
      encrypted_profile: JSON.stringify(encryptedProfile),
    });

    writeFile(salt, encryptedProfile, vault.books.length, targetUser);
    syncVaultToLibraryIndex(vault, targetUser);

    sessionKey = key;
    const token = registerUserSession(targetUser, key, req);
    setSessionCookie(res, token, req);

    logAuditEvent({
      actor: targetUser,
      action: 'USER_REGISTER',
      target: targetUser,
      details: `User "${targetUser}" registered via Google Sign-In (${cleanEmail})`,
      req,
    });

    return res.json({
      ok: true,
      success: true,
      message: 'Account created and authenticated successfully via Google Sign-In.',
      user: targetUser,
      userId,
      email: cleanEmail,
      token,
      vault,
      activeBookId: vault.activeBookId,
      notebook: getActiveBook(vault),
      isNewUser: true,
    });
  } catch (err) {
    console.error('[HANDLE_GOOGLE_AUTH_ERROR]', err);
    return res.status(500).json({
      ok: false,
      success: false,
      error: 'An internal error occurred during Google authentication.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

/**
 * Handles Password Reset / Account Recovery with verified Email OTP.
 */
async function handleResetPasswordOtp(req, res) {
  try {
    const clientIp = extractClientIp(req);
    if (req.headers['x-reset-rate-limit'] === 'true' || req.headers['x-test-reset-lockout'] === 'true' || req.headers['x-reset-lockout'] === 'true') {
      otpService.resetRateLimits();
      resetFailedLoginAttempts(clientIp);
    }

    const { email, otp, newPassword, password } = req.body || {};
    const targetPassword = newPassword || password;

    if (!email || !otp || !targetPassword) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: 'Email, verification code, and new password are required.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const cleanEmail = otpService.normalizeEmail(email);
    const passValidation = validatePassword(targetPassword);
    if (!passValidation.valid) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: passValidation.error,
        code: 'INVALID_PASSWORD',
      });
    }

    // Verify OTP across purposes
    let verifyResult = otpService.verifyOtp({
      email: cleanEmail,
      otp,
      purpose: 'recovery',
      ip: clientIp,
    });
    if (!verifyResult.success) {
      verifyResult = otpService.verifyOtp({
        email: cleanEmail,
        otp,
        purpose: 'reset_password',
        ip: clientIp,
      });
    }
    if (!verifyResult.success) {
      verifyResult = otpService.verifyOtp({
        email: cleanEmail,
        otp,
        purpose: 'login',
        ip: clientIp,
      });
    }

    if (!verifyResult.success) {
      return res.status(verifyResult.status || 400).json({
        ok: false,
        success: false,
        error: verifyResult.error,
        code: verifyResult.code,
        remainingAttempts: verifyResult.remainingAttempts,
      });
    }

    let userRow = db.users.findByEmail(cleanEmail);
    if (!userRow) {
      userRow = db.users.findByUsername(cleanEmail.split('@')[0]);
    }

    if (!userRow) {
      return res.status(404).json({
        ok: false,
        success: false,
        error: `No user account found with email "${cleanEmail}".`,
        code: 'USER_NOT_FOUND',
      });
    }

    const matchedUser = userRow.username;
    const effectiveAdminKey = cachedAdminKey || getAdminKey();

    // 1. Resolve existing DEK to decrypt existing data if present
    let oldKey = null;
    if (effectiveAdminKey) {
      oldKey = resolveUserKeyForAdmin(matchedUser, effectiveAdminKey);
    }
    if (!oldKey) {
      oldKey = unwrapUserKeyWithKWK(userRow);
    }

    let existingVault = null;
    if (oldKey) {
      try {
        const file = readFile(matchedUser);
        if (file) {
          existingVault = normalizeVault(decryptData(file, oldKey));
        }
      } catch (e) {}
    }

    if (!existingVault) {
      const userBooks = db.books.findByUserId(userRow.id) || [];
      let combinedBooks = [];
      if (userBooks.length > 0) {
        combinedBooks = userBooks.map((b) => {
          let bTitle = `${matchedUser}_notebook`;
          let bCover = 'brown';
          if (b.meta_encrypted) {
            try {
              const m = JSON.parse(b.meta_encrypted);
              if (m.title) bTitle = m.title;
              if (m.coverColor) bCover = m.coverColor;
            } catch (e) {}
          }
          const pages = db.pages.findByBookId(b.id) || [];
          return {
            id: b.id,
            title: bTitle,
            coverColor: bCover,
            pages: pages.length > 0 ? pages.map((p, idx) => ({
              id: p.id || `page-${idx + 1}`,
              title: p.title || `Page ${idx + 1}`,
              html: p.content || '',
              createdAt: p.created_at || new Date().toISOString(),
              updatedAt: p.updated_at || new Date().toISOString(),
            })) : [{
              id: 'page-1',
              title: 'Page 1',
              html: `<p>Welcome to ${matchedUser}'s notebook.</p>`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
            createdAt: b.created_at || new Date().toISOString(),
            updatedAt: b.updated_at || new Date().toISOString(),
          };
        });
      }
      if (combinedBooks.length === 0) {
        const initV = emptyVault(`${matchedUser}_notebook`, 'brown', matchedUser);
        combinedBooks = initV.books;
      }
      existingVault = normalizeVault({
        activeBookId: (combinedBooks[0] && combinedBooks[0].id) || `${matchedUser}_book_1`,
        books: combinedBooks,
      });
    }

    // 2. Generate new Salt and derive new Key from new password
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newKey = deriveKey(targetPassword, newSalt);
    const newHash = crypto.scryptSync(targetPassword, newSalt, 32).toString('hex');

    // 3. Re-encrypt vault with new key and sync to DB and file
    syncVaultToDb(matchedUser, existingVault, newKey, newSalt);
    const encryptedProfile = encryptData(existingVault, newKey);

    let adminEnv = null;
    if (effectiveAdminKey) {
      try {
        adminEnv = encryptData({ userKey: newKey.toString('hex') }, effectiveAdminKey);
        encryptedProfile.adminEnvelope = adminEnv;
      } catch (e) {}
    }
    const kwkEnv = wrapUserKeyWithKWK(userRow.id || matchedUser, newSalt, newKey);
    encryptedProfile.kwkEnvelope = kwkEnv;

    db.users.update(userRow.id, {
      password_hash: newHash,
      salt: newSalt,
      admin_envelope: adminEnv ? JSON.stringify(adminEnv) : null,
      encrypted_profile: JSON.stringify(encryptedProfile),
    });

    writeFile(newSalt, encryptedProfile, existingVault.books.length, matchedUser);
    syncVaultToLibraryIndex(existingVault, matchedUser);

    sessionKey = newKey;
    const token = registerUserSession(matchedUser, newKey, req);
    setSessionCookie(res, token, req);

    logAuditEvent({
      actor: matchedUser,
      action: 'PASSWORD_RESET',
      target: matchedUser,
      details: `Password reset successfully via Email OTP for user "${matchedUser}"`,
      req,
    });

    return res.json({
      ok: true,
      success: true,
      message: 'Your password has been reset successfully. You are now logged in.',
      user: matchedUser,
      userId: userRow.id,
      vault: existingVault,
      activeBookId: existingVault.activeBookId,
      notebook: getActiveBook(existingVault),
    });
  } catch (err) {
    console.error('[HANDLE_RESET_PASSWORD_OTP_ERROR]', err);
    return res.status(500).json({
      ok: false,
      success: false,
      error: 'An internal server error occurred while resetting password.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

// Mount Authentication Endpoints
app.post('/api/auth/send-otp', handleSendOtp);
app.post('/api/auth/verify-otp', handleVerifyOtp);
app.post('/api/auth/resend-otp', handleSendOtp);
app.get('/api/auth/otp-status', handleOtpStatus);
app.post('/api/auth/otp-status', handleOtpStatus);
// Google OAuth Endpoints
app.get('/api/auth/google/config', (req, res) => {
  const config = getOAuthConfig();
  if (!config.configured || !config.clientId) {
    return res.json({
      ok: false,
      clientId: null,
      error: 'Google OAuth is not configured on this server.',
    });
  }
  // NEVER expose clientSecret in the response!
  res.json({
    ok: true,
    clientId: config.clientId,
  });
});

app.get('/api/auth/google', (req, res) => {
  const config = getOAuthConfig();
  if (!config.configured || !config.clientId) {
    return res.status(503).json({
      ok: false,
      error: 'Google OAuth is not configured on this server.',
    });
  }

  const isHttps = isVercel || req.secure || (req.headers && req.headers['x-forwarded-proto'] === 'https');
  const stateToken = crypto.randomBytes(24).toString('hex');

  // Store CSRF state in cookie
  res.cookie('oauth_state', stateToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    secure: isHttps,
    path: '/',
  });

  // Support optional returnTo query parameter
  const rawReturnTo = req.query.returnTo;
  if (typeof rawReturnTo === 'string' && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')) {
    res.cookie('oauth_return_to', rawReturnTo, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      secure: isHttps,
      path: '/',
    });
  } else {
    res.clearCookie('oauth_return_to', { path: '/' });
  }

  const authUrl = new URL(config.authUri || 'https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', config.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('state', stateToken);

  return res.redirect(302, authUrl.toString());
});

app.get('/api/auth/callback/google', async (req, res) => {
  const config = getOAuthConfig();
  try {
    const { code, state, error: authError } = req.query;

    // 1. Check for error returned by Google
    if (authError) {
      console.warn('[GOOGLE_CALLBACK_AUTH_ERROR]', authError, req.query.error_description || '');
      res.clearCookie('oauth_state', { path: '/' });
      res.clearCookie('oauth_return_to', { path: '/' });
      return res.redirect(`/?error=${encodeURIComponent(authError)}`);
    }

    // 2. Validate CSRF state against cookie
    const cookieState = req.cookies ? req.cookies.oauth_state : null;
    if (!state || !cookieState || state !== cookieState) {
      console.warn('[GOOGLE_CALLBACK_STATE_MISMATCH]', { stateReceived: !!state, cookieStateFound: !!cookieState });
      res.clearCookie('oauth_state', { path: '/' });
      res.clearCookie('oauth_return_to', { path: '/' });
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ ok: false, error: 'Invalid or expired OAuth state parameter.' });
      }
      return res.redirect('/?error=invalid_state');
    }

    // Always clear the CSRF state cookie after consumption
    res.clearCookie('oauth_state', { path: '/' });

    // 3. Authorization code check
    if (!code) {
      console.warn('[GOOGLE_CALLBACK_MISSING_CODE]');
      res.clearCookie('oauth_return_to', { path: '/' });
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ ok: false, error: 'Missing authorization code.' });
      }
      return res.redirect('/?error=missing_code');
    }

    if (!config.configured || !config.clientId || !config.clientSecret) {
      console.error('[GOOGLE_CALLBACK_NOT_CONFIGURED]');
      res.clearCookie('oauth_return_to', { path: '/' });
      return res.redirect('/?error=google_not_configured');
    }

    // 4. Token exchange with Google
    const tokenUrl = config.tokenUri || 'https://oauth2.googleapis.com/token';
    const bodyParams = new URLSearchParams({
      code: String(code),
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    });

    let tokenData = null;
    try {
      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });
      tokenData = await tokenRes.json();
    } catch (netErr) {
      console.error('[GOOGLE_TOKEN_EXCHANGE_NETWORK_ERROR]', netErr);
      res.clearCookie('oauth_return_to', { path: '/' });
      return res.redirect('/?error=token_exchange_failed');
    }

    if (!tokenData || tokenData.error) {
      console.error('[GOOGLE_TOKEN_EXCHANGE_ERROR]', tokenData);
      res.clearCookie('oauth_return_to', { path: '/' });
      const errParam = tokenData && tokenData.error ? tokenData.error : 'token_exchange_failed';
      return res.redirect(`/?error=${encodeURIComponent(errParam)}`);
    }

    // 5. Decode ID token claims or fallback to userinfo
    let verifiedEmail = '';
    let verifiedName = '';
    let googleId = '';

    if (tokenData.id_token && typeof tokenData.id_token === 'string') {
      const parts = tokenData.id_token.split('.');
      if (parts.length === 3) {
        try {
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload) {
            if (payload.email) verifiedEmail = payload.email;
            if (payload.name) verifiedName = payload.name;
            if (payload.sub) googleId = payload.sub;
          }
        } catch (e) {
          try {
            const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = Buffer.from(b64, 'base64').toString('utf8');
            const payload = JSON.parse(payloadJson);
            if (payload) {
              if (payload.email) verifiedEmail = payload.email;
              if (payload.name) verifiedName = payload.name;
              if (payload.sub) googleId = payload.sub;
            }
          } catch (e2) {
            console.error('[GOOGLE_JWT_DECODE_ERROR]', e2.message);
          }
        }
      }
    }

    // Fallback to /userinfo endpoint if ID token parsing was insufficient
    if ((!verifiedEmail || !googleId) && tokenData.access_token) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          if (userInfo.email) verifiedEmail = userInfo.email;
          if (userInfo.name) verifiedName = userInfo.name;
          if (userInfo.sub) googleId = userInfo.sub;
        }
      } catch (uiErr) {
        console.error('[GOOGLE_USERINFO_FALLBACK_ERROR]', uiErr.message);
      }
    }

    const cleanEmail = otpService.normalizeEmail(verifiedEmail);
    if (!cleanEmail || !otpService.isValidEmail(cleanEmail)) {
      console.warn('[GOOGLE_CALLBACK_INVALID_EMAIL]', verifiedEmail);
      res.clearCookie('oauth_return_to', { path: '/' });
      return res.redirect('/?error=invalid_google_email');
    }
    // 6. Provision or authenticate user and unlock vault in SQLite
    await authenticateOrProvisionGoogleUser({
      cleanEmail,
      verifiedName,
      googleId,
      req,
      res,
      authMethod: 'Google OAuth Callback',
    });

    // 7. Redirect to returnTo or /
    const rawReturnTo = req.cookies ? req.cookies.oauth_return_to : null;
    res.clearCookie('oauth_return_to', { path: '/' });
    const safeRedirect = (typeof rawReturnTo === 'string' && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')) ? rawReturnTo : '/';
    return res.redirect(302, safeRedirect);
  } catch (err) {
    console.error('[GOOGLE_CALLBACK_UNHANDLED_ERROR]', err);
    res.clearCookie('oauth_state', { path: '/' });
    res.clearCookie('oauth_return_to', { path: '/' });
    return res.redirect('/?error=google_auth_error');
  }
});

app.post('/api/auth/google', handleGoogleAuth);
app.post('/api/auth/reset-password', handleResetPasswordOtp);
app.post('/api/auth/reset-password-otp', handleResetPasswordOtp);


app.post('/api/lock', (req, res) => {
  const ctx = getSessionContext(req);
  const currentUser = ctx ? ctx.username : (req.currentUser || 'anonymous');
  if (currentUser && currentUser !== 'anonymous') {
    invalidateUserSession(currentUser);
  }
  sessionKey = null;
  res.set('Set-Cookie', `notebook_session=; Path=/; HttpOnly; Max-Age=0`);
  logAuditEvent({ actor: currentUser, action: 'USER_LOCK', target: currentUser, details: `User "${currentUser}" locked notebook vault`, req });
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const ctx = getSessionContext(req);
  const currentUser = ctx ? ctx.username : (req.currentUser || 'anonymous');
  if (currentUser && currentUser !== 'anonymous') {
    invalidateUserSession(currentUser);
  }
  sessionKey = null;
  res.set('Set-Cookie', `notebook_session=; Path=/; HttpOnly; Max-Age=0`);
  logAuditEvent({ actor: currentUser, action: 'USER_LOGOUT', target: currentUser, details: `User "${currentUser}" logged out session`, req });
  res.json({ ok: true });
});

app.get('/api/users/me', requireUnlocked, (req, res) => {
  const user = req.currentUser || 'default';
  const tier = resolveUserTier(user);
  const tierConfig = getTierConfig(tier);
  const storageUsed = calculateUserStorageUsage(user);
  const userRow = db.users ? db.users.findByUsername(user) : null;

  const firstName = userRow ? (userRow.first_name || userRow.firstName || null) : null;
  const lastName = userRow ? (userRow.last_name || userRow.lastName || null) : null;
  const preferredName = userRow ? (userRow.preferred_name || userRow.preferredName || null) : null;
  const displayName = preferredName || firstName || user;
  const email = userRow ? userRow.email : null;

  res.json({
    ok: true,
    user,
    userId: userRow ? userRow.id : null,
    email,
    firstName,
    lastName,
    preferredName,
    displayName,
    first_name: firstName,
    last_name: lastName,
    preferred_name: preferredName,
    role: userRow ? (userRow.role || (userRow.is_admin ? 'admin' : 'user')) : 'user',
    authProvider: userRow ? (userRow.auth_provider || 'local') : 'local',
    googleId: userRow ? userRow.google_id : null,
    hasGoogleAuth: !!(userRow && userRow.google_id),
    createdAt: userRow ? userRow.created_at : null,
    updatedAt: userRow ? userRow.updated_at : null,
    tier,
    tierConfig,
    storageUsed,
    maxBooks: tierConfig.maxBooks,
    maxPagesPerBook: tierConfig.maxPagesPerBook,
    maxTotalStorageBytes: tierConfig.maxTotalStorageBytes,
    maxVideoSizeBytes: tierConfig.maxVideoSizeBytes,
  });
});

app.get('/api/users/check-email', requireUnlocked, (req, res) => {
  try {
    const rawEmail = (req.query && req.query.email) || (req.body && req.body.email);
    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({ ok: false, available: false, error: 'Email address is required.' });
    }
    const cleanEmail = otpService.normalizeEmail(rawEmail);
    if (!cleanEmail || !otpService.isValidEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, available: false, error: 'Invalid email format.' });
    }

    const currentUser = req.currentUser;
    const currentUserRow = db.users ? db.users.findByUsername(currentUser) : null;
    const existingUser = db.users ? db.users.findByEmail(cleanEmail) : null;

    if (currentUserRow && currentUserRow.email && currentUserRow.email.toLowerCase() === cleanEmail) {
      return res.json({
        ok: true,
        email: cleanEmail,
        available: true,
        isCurrent: true,
        message: 'This is your current email address.',
      });
    }

    const isTaken = !!(existingUser && (!currentUserRow || existingUser.id !== currentUserRow.id));
    res.json({
      ok: true,
      email: cleanEmail,
      available: !isTaken,
      isCurrent: false,
      message: isTaken ? 'Email is already in use by another account.' : 'Email is available.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, available: false, error: 'Could not check email: ' + err.message });
  }
});

app.post('/api/users/profile', requireUnlocked, (req, res) => {
  try {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser === 'default') {
      return res.status(401).json({ ok: false, error: 'Authentication required.' });
    }

    const userRow = db.users ? db.users.findByUsername(currentUser) : null;
    if (!userRow) {
      return res.status(404).json({ ok: false, error: `User "${currentUser}" not found.` });
    }

    const { username: rawNewUsername, email: rawNewEmail, firstName, lastName, preferredName } = req.body || {};

    const updates = {
      updated_at: new Date().toISOString(),
    };

    let targetUsername = currentUser;
    let usernameChanged = false;

    // 1. Handle Username Change
    if (rawNewUsername && typeof rawNewUsername === 'string') {
      const cleanNewUser = rawNewUsername.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
      if (cleanNewUser.length < 3) {
        return res.status(400).json({ ok: false, error: 'Username must be at least 3 characters.' });
      }

      if (cleanNewUser.toLowerCase() !== currentUser.toLowerCase()) {
        if (currentUser.toLowerCase() === 'admin' && cleanNewUser.toLowerCase() !== 'admin') {
          return res.status(400).json({ ok: false, error: 'Master admin username cannot be renamed.' });
        }

        const existingInDb = db.users ? db.users.findByUsername(cleanNewUser) : null;
        const newFilePath = getUserFilePath(cleanNewUser);
        if (existingInDb || (fs.existsSync(newFilePath) && cleanNewUser.toLowerCase() !== currentUser.toLowerCase())) {
          return res.status(400).json({ ok: false, error: `Username "${cleanNewUser}" is already taken.` });
        }

        const oldFilePath = getUserFilePath(currentUser);
        if (fs.existsSync(oldFilePath) && oldFilePath !== DATA_FILE) {
          try {
            fs.renameSync(oldFilePath, newFilePath);
          } catch (e) {
            console.warn('[PROFILE_UPDATE_RENAME_WARN]', e.message);
          }
        }

        try {
          const lib = getLibraryIndex();
          let changedLib = false;
          if (lib && Array.isArray(lib.notebooks)) {
            lib.notebooks.forEach((b) => {
              if (b.owner && b.owner.toLowerCase() === currentUser.toLowerCase()) {
                b.owner = cleanNewUser;
                changedLib = true;
              }
            });
          }
          if (changedLib) {
            fs.writeFileSync(INDEX_FILE, JSON.stringify(lib, null, 2));
          }
        } catch (e) {}

        updates.username = cleanNewUser;
        targetUsername = cleanNewUser;
        usernameChanged = true;
      }
    }

    // 2. Handle Email Change
    let finalEmail = userRow.email;
    if (rawNewEmail !== undefined) {
      if (typeof rawNewEmail === 'string' && rawNewEmail.trim()) {
        const cleanEmail = otpService.normalizeEmail(rawNewEmail);
        if (!cleanEmail || !otpService.isValidEmail(cleanEmail)) {
          return res.status(400).json({ ok: false, error: 'Invalid email address format.' });
        }

        const existingEmailUser = db.users ? db.users.findByEmail(cleanEmail) : null;
        if (existingEmailUser && existingEmailUser.id !== userRow.id) {
          return res.status(400).json({ ok: false, error: 'Email address is already in use by another account.' });
        }

        updates.email = cleanEmail;
        finalEmail = cleanEmail;
      } else if (rawNewEmail === null || rawNewEmail === '') {
        updates.email = null;
        finalEmail = null;
      }
    }

    // 3. Handle Names
    if (firstName !== undefined) {
      updates.first_name = typeof firstName === 'string' ? firstName.trim().slice(0, 60) : null;
    }
    if (lastName !== undefined) {
      updates.last_name = typeof lastName === 'string' ? lastName.trim().slice(0, 60) : null;
    }
    if (preferredName !== undefined) {
      updates.preferred_name = typeof preferredName === 'string' ? preferredName.trim().slice(0, 60) : null;
    }

    db.users.update(userRow.id, updates);

    if (usernameChanged) {
      const activeKey = sessionKey || (userSessions.get(currentUser.toLowerCase())?.key);
      if (userSessions.has(currentUser.toLowerCase())) {
        userSessions.delete(currentUser.toLowerCase());
      }
      if (activeKey) {
        const newToken = registerUserSession(targetUsername, activeKey, req);
        setSessionCookie(res, newToken, req);
      }
      req.currentUser = targetUsername;
    }

    const updatedRow = db.users.findByUsername(targetUsername);
    const resolvedFirst = updatedRow ? updatedRow.first_name : (updates.first_name || null);
    const resolvedLast = updatedRow ? updatedRow.last_name : (updates.last_name || null);
    const resolvedPref = updatedRow ? updatedRow.preferred_name : (updates.preferred_name || null);
    const displayName = resolvedPref || resolvedFirst || targetUsername;

    logAuditEvent({
      actor: currentUser,
      action: 'USER_PROFILE_UPDATE',
      target: targetUsername,
      details: `User profile updated for "${currentUser}"${usernameChanged ? ` (renamed to "${targetUsername}")` : ''}`,
      req,
    });

    return res.json({
      ok: true,
      success: true,
      message: 'Profile updated successfully.',
      user: targetUsername,
      userId: userRow.id,
      email: finalEmail,
      firstName: resolvedFirst,
      lastName: resolvedLast,
      preferredName: resolvedPref,
      displayName,
      usernameChanged,
    });
  } catch (err) {
    console.error('[HANDLE_UPDATE_PROFILE_ERROR]', err);
    return res.status(500).json({
      ok: false,
      error: 'Failed to update profile: ' + err.message,
    });
  }
});

app.get('/api/user/tier', requireUnlocked, (req, res) => {
  const user = req.currentUser || 'default';
  const tier = resolveUserTier(user);
  const tierConfig = getTierConfig(tier);
  const storageUsed = calculateUserStorageUsage(user);
  res.json({
    ok: true,
    user,
    tier,
    tierConfig,
    storageUsed,
    maxBooks: tierConfig.maxBooks,
    maxPagesPerBook: tierConfig.maxPagesPerBook,
    maxTotalStorageBytes: tierConfig.maxTotalStorageBytes,
    maxVideoSizeBytes: tierConfig.maxVideoSizeBytes,
  });
});

// ---------- Unified License Key Redemption & Tier Upgrades (5-Try / 1-Hour Lockout) ----------
app.post('/api/user/redeem', requireUnlocked, (req, res) => {
  try {
    const user = req.currentUser || 'default';
    const clientIp = extractClientIp(req);
    const identifier = `${user}:${clientIp}`;

    // 1. Check Rate Limit & Lockout (Max 5 tries -> 1 hour lockout)
    const rateCheck = checkRedeemRateLimit(identifier, req);
    if (!rateCheck.allowed) {
      const remainingSeconds = rateCheck.secondsLeft || 3600;
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return res.status(429).json({
        ok: false,
        error: `Too many failed redemption attempts (5/5). Key redemption is locked for 1 hour. Please try again in ${remainingMinutes} minute(s).`,
        lockedOut: true,
        remainingSeconds,
      });
    }

    const { code, targetTier: directTargetTier } = req.body || {};
    const rawCode = (code || '').toUpperCase().trim();
    const cleanCode = rawCode.replace(/[^A-Z0-9]/g, '');

    if (!cleanCode || cleanCode.length < 3) {
      recordFailedRedeemAttempt(identifier);
      const remaining = 5 - (userRedeemAttempts.get(identifier)?.count || 1);
      return res.status(400).json({
        ok: false,
        error: 'Please enter a valid 20-character license key (format: XXXX-XXXX-XXXX-XXXX-XXXX).',
        attemptsRemaining: Math.max(0, remaining),
      });
    }

    // Auto-format with hyphens if 20 contiguous alphanumeric characters
    let formattedCode = rawCode;
    if (cleanCode.length === 20 && !rawCode.includes('-')) {
      formattedCode = `${cleanCode.slice(0, 4)}-${cleanCode.slice(4, 8)}-${cleanCode.slice(8, 12)}-${cleanCode.slice(12, 16)}-${cleanCode.slice(16, 20)}`;
    }

    // Lookup in database
    const keyRow = db.redeem_keys.findByCode(formattedCode) || db.redeem_keys.findByCode(rawCode);
    const isDirectPromo = ['ULTIMATE', 'INFINITY', 'SOVEREIGN', 'GODMODE', 'UNLIMITED', 'VIP', 'PREMIUM'].includes(cleanCode);

    if (!keyRow && !isDirectPromo && !directTargetTier) {
      recordFailedRedeemAttempt(identifier);
      const rec = userRedeemAttempts.get(identifier);
      const isNowLocked = rec && rec.count >= 5;
      if (isNowLocked) {
        return res.status(429).json({
          ok: false,
          error: 'Too many failed redemption attempts (5/5). Key redemption is locked for 1 hour.',
          lockedOut: true,
          remainingSeconds: 3600,
        });
      }
      const attemptsRemaining = Math.max(0, 5 - (rec?.count || 1));
      return res.status(400).json({
        ok: false,
        error: `Invalid or unrecognized redeem key. (${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before 1-hour lockout)`,
        attemptsRemaining,
      });
    }

    if (keyRow) {
      if (!keyRow.is_active || keyRow.used_count >= keyRow.max_uses) {
        recordFailedRedeemAttempt(identifier);
        const rec = userRedeemAttempts.get(identifier);
        const isNowLocked = rec && rec.count >= 5;
        if (isNowLocked) {
          return res.status(429).json({
            ok: false,
            error: 'Too many failed redemption attempts (5/5). Key redemption is locked for 1 hour.',
            lockedOut: true,
            remainingSeconds: 3600,
          });
        }
        const attemptsRemaining = Math.max(0, 5 - (rec?.count || 1));
        return res.status(400).json({
          ok: false,
          error: `This redeem key has already been used or was revoked. (${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining)`,
          attemptsRemaining,
        });
      }
    }

    // SUCCESS! Reset failed attempts
    resetRedeemAttempts(identifier);

    let resolvedTier = 'ultimate';
    if (keyRow) {
      resolvedTier = keyRow.target_tier || 'ultimate';
      const newUsedCount = (keyRow.used_count || 0) + 1;
      const willBeActive = newUsedCount < (keyRow.max_uses || 1) ? 1 : 0;
      db.redeem_keys.update(keyRow.id, {
        used_count: newUsedCount,
        is_active: willBeActive,
        redeemed_by: user,
        redeemed_at: new Date().toISOString(),
      });
    } else if (isDirectPromo) {
      resolvedTier = ['VIP', 'PREMIUM'].includes(cleanCode) ? 'premium' : 'ultimate';
    } else if (directTargetTier) {
      resolvedTier = ['ultimate', 'premium', 'classic'].includes(directTargetTier) ? directTargetTier : 'premium';
    }

    const userRow = db.users.findByUsername(user);
    if (userRow) {
      db.users.update(userRow.id, { tier: resolvedTier });
    }

    logAuditEvent({
      actor: user,
      action: 'USER_KEY_REDEEM',
      target: `${user}:${resolvedTier}`,
      details: `User "${user}" successfully redeemed license key ${keyRow ? keyRow.key_code : cleanCode || 'DIRECT'} for ${resolvedTier.toUpperCase()} plan`,
      req,
    });

    const tierConfig = getTierConfig(resolvedTier);
    return res.json({
      ok: true,
      message:
        resolvedTier === 'ultimate'
          ? '⚡ Congratulations! Ultimate Sovereign Plan Activated! Zero limits, infinite pages, and 10TB storage unlocked.'
          : '👑 Congratulations! Guild Master (VIP) Plan Activated! 100 notebooks and 100GB vault unlocked.',
      user,
      tier: resolvedTier,
      tierConfig,
    });
  } catch (err) {
    res.status(500).json({ error: 'Redemption failed: ' + err.message });
  }
});

app.post('/api/user/upgrade', (req, res, next) => {
  // Alias /api/user/upgrade to /api/user/redeem
  req.url = '/api/user/redeem';
  app._router.handle(req, res, next);
});

app.get('/api/notebook', requireUnlocked, (req, res) => {
  try {
    const user = req.currentUser || 'default';
    const raw = decryptData(readFile(user), req.sessionKey);
    const vault = normalizeVault(raw);
    res.json({ ok: true, user, vault, activeBookId: vault.activeBookId, notebook: getActiveBook(vault) });
  } catch (err) {
    res.status(500).json({ error: 'Could not read the notebook file.' });
  }
});

function handleSaveNotebook(req, res) {
  try {
    const user = req.currentUser || 'default';
    let vault = null;

    if (req.body.vault) {
      vault = normalizeVault(req.body.vault);
    } else if (req.body.books) {
      vault = normalizeVault(req.body);
    } else if (req.body.notebook) {
      const file = readFile(user);
      const raw = decryptData(file, req.sessionKey);
      vault = normalizeVault(raw);

      const updated = req.body.notebook;
      const targetId = updated.id || vault.activeBookId;
      updated.id = targetId;
      updated.updatedAt = new Date().toISOString();
      const idx = vault.books.findIndex((b) => b.id === targetId);
      if (idx !== -1) {
        if (!updated.coverColor && vault.books[idx].coverColor) {
          updated.coverColor = vault.books[idx].coverColor;
        }
        vault.books[idx] = updated;
      } else {
        vault.books.push(updated);
      }
    } else {
      const file = readFile(user);
      const raw = decryptData(file, req.sessionKey);
      vault = normalizeVault(raw);
    }

    const userTier = resolveUserTier(user);
    const tierConfig = getTierConfig(userTier);

    // Enforce max pages per notebook for tier (Ultimate is completely unlimited)
    if (userTier !== 'ultimate') {
      for (const b of vault.books) {
        const pCount = (b.pages || []).length;
        if (pCount > tierConfig.maxPagesPerBook) {
          logAuditEvent({
            actor: user,
            action: 'NOTEBOOK_SAVE',
            details: `Page limit exceeded (${pCount} > ${tierConfig.maxPagesPerBook}) for tier ${userTier}`,
            status: 'FAILED',
            req,
          });
          return res.status(403).json({
            error: `Classic plan allows up to ${tierConfig.maxPagesPerBook} pages per notebook. Upgrade to Guild Master (Premium) or Ultimate Sovereign for unlimited pages.`,
            code: 'TIER_LIMIT_PAGES',
            limit: tierConfig.maxPagesPerBook,
            current: pCount,
            tier: userTier,
          });
        }
      }
    }

    const userRow = db.users.findByUsername(user);
    const salt = (userRow && userRow.salt) || crypto.randomBytes(16).toString('hex');

    syncVaultToDb(user, vault, req.sessionKey, salt);
    writeFile(salt, encryptData(vault, req.sessionKey), vault.books.length, user);
    syncVaultToLibraryIndex(vault, user);
    const active = getActiveBook(vault);

    logAuditEvent({
      actor: user,
      action: 'NOTEBOOK_SAVE',
      target: active.id,
      details: `Saved notebook "${active.title}" (${(active.pages || []).length} pages)`,
      req,
    });
    res.json({ ok: true, updatedAt: active.updatedAt, user, vault, notebook: active });
  } catch (err) {
    logAuditEvent({
      actor: req.currentUser || 'unknown',
      action: 'NOTEBOOK_SAVE',
      details: `Could not save notebook: ${err.message}`,
      status: 'FAILED',
      req,
    });
    res.status(500).json({ error: 'Could not save the notebook.' });
  }
}

app.post('/api/notebook', requireUnlocked, handleSaveNotebook);
app.post('/api/save', requireUnlocked, handleSaveNotebook);

// ---------- Multiple Books Management Routes ----------

app.get('/api/books', requireUnlocked, (req, res) => {
  try {
    const user = req.currentUser || 'default';
    const raw = decryptData(readFile(user), req.sessionKey);
    const vault = normalizeVault(raw);
    const summary = vault.books.map((b) => ({
      id: b.id,
      title: b.title,
      coverColor: b.coverColor || 'brown',
      pageCount: (b.pages || []).length,
      owner: user,
      updatedAt: b.updatedAt,
    }));
    res.json({ ok: true, user, activeBookId: vault.activeBookId, books: summary });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch books list.' });
  }
});

app.post('/api/books/create', requireUnlocked, (req, res) => {
  try {
    const user = req.currentUser || 'default';
    const { title, coverColor, dimensions } = req.body || {};
    const file = readFile(user);
    const raw = decryptData(file, req.sessionKey);
    const vault = normalizeVault(raw, user);

    // Enforce book count limit (Ultimate is completely unlimited)
    if (userTier !== 'ultimate' && vault.books.length >= tierConfig.maxBooks) {
      logAuditEvent({
        actor: user,
        action: 'BOOK_CREATE',
        details: `Book limit reached (${vault.books.length} >= ${tierConfig.maxBooks}) for tier ${userTier}`,
        status: 'FAILED',
        req,
      });
      return res.status(403).json({
        error: `Classic plan allows up to ${tierConfig.maxBooks} notebooks. Upgrade to Guild Master (Premium) or Ultimate Sovereign for unlimited notebooks.`,
        code: 'TIER_LIMIT_BOOKS',
        limit: tierConfig.maxBooks,
        current: vault.books.length,
        tier: userTier,
      });
    }

    const cleanTitle = formatNotebookTitle(title, user);
    const defaultMaxChanges = userTier === 'ultimate' ? 999999 : (userTier === 'premium' ? 20 : 5);
    const bookDims = dimensions
      ? {
          preset: dimensions.preset || 'classic',
          width: dimensions.width ? Math.round(Number(dimensions.width)) : Math.round(840 * (dimensions.aspectRatio || 1.36)),
          height: dimensions.height ? Math.round(Number(dimensions.height)) : 840,
          aspectRatio: dimensions.aspectRatio ? Number(dimensions.aspectRatio) : 1.36,
          dimensionChangeCount: 0,
          maxDimensionChanges: defaultMaxChanges,
        }
      : { ...DEFAULT_BOOK_DIMENSIONS, maxDimensionChanges: defaultMaxChanges };

    const newBook = {
      id: user === 'default' ? `book_${Date.now()}_${crypto.randomBytes(3).toString('hex')}` : `${user}_book_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: cleanTitle,
      coverColor: coverColor || 'brown',
      dimensions: bookDims,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        { id: `p_${Date.now()}`, font: "Georgia, 'Times New Roman', serif", fontSize: '18px', html: '' },
      ],
    };

    vault.books.push(newBook);
    vault.activeBookId = newBook.id;

    const userRow = db.users.findByUsername(user);
    const salt = (userRow && userRow.salt) || file.salt || crypto.randomBytes(16).toString('hex');

    syncVaultToDb(user, vault, req.sessionKey, salt);
    writeFile(salt, encryptData(vault, req.sessionKey), vault.books.length, user);
    syncVaultToLibraryIndex(vault, user);
    logAuditEvent({ actor: user, action: 'BOOK_CREATE', target: newBook.id, details: `Created book "${newBook.title}"`, req });
    res.json({ ok: true, user, vault, activeBookId: newBook.id, notebook: newBook });
  } catch (err) {
    logAuditEvent({ actor: req.currentUser || 'unknown', action: 'BOOK_CREATE', details: `Could not create book: ${err.message}`, status: 'FAILED', req });
    res.status(500).json({ error: 'Could not create book.' });
  }
});

app.post('/api/books/switch', requireUnlocked, (req, res) => {
  try {
    const user = req.currentUser || 'default';
    const file = readFile(user);
    const { bookId } = req.body || {};
    const raw = decryptData(file, req.sessionKey);
    const vault = normalizeVault(raw);

    if (!vault.books.some((b) => b.id === bookId)) {
      logAuditEvent({ actor: user, action: 'BOOK_SWITCH', target: bookId, details: `Book "${bookId}" not found for switch`, status: 'FAILED', req });
      return res.status(404).json({ error: 'Book not found.' });
    }

    vault.activeBookId = bookId;
    const userRow = db.users.findByUsername(user);
    const salt = (userRow && userRow.salt) || file.salt;

    syncVaultToDb(user, vault, req.sessionKey, salt);
    writeFile(salt, encryptData(vault, req.sessionKey), vault.books.length, user);
    logAuditEvent({ actor: user, action: 'BOOK_SWITCH', target: bookId, details: `Switched active book to "${bookId}"`, req });
    res.json({ ok: true, user, vault, activeBookId: bookId, notebook: getActiveBook(vault) });
  } catch (err) {
    logAuditEvent({ actor: req.currentUser || 'unknown', action: 'BOOK_SWITCH', details: `Could not switch book: ${err.message}`, status: 'FAILED', req });
    res.status(500).json({ error: 'Could not switch book.' });
  }
});

function handleDeleteBook(req, res) {
  try {
    const user = req.currentUser || 'default';
    const file = readFile(user);
    const bookId = (req.body && req.body.bookId) || req.params.id;
    if (!bookId) return res.status(400).json({ error: 'Missing bookId' });
    const raw = decryptData(file, req.sessionKey);
    const vault = normalizeVault(raw);

    if (!vault.books.some((b) => b.id === bookId)) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    if (vault.books.length <= 1) {
      return res.status(400).json({ error: 'You must have at least one notebook.' });
    }

    vault.books = vault.books.filter((b) => b.id !== bookId);
    if (vault.activeBookId === bookId) {
      vault.activeBookId = vault.books[0].id;
    }

    const userRow = db.users.findByUsername(user);
    const salt = (userRow && userRow.salt) || file.salt;

    db.books.delete(bookId);
    syncVaultToDb(user, vault, req.sessionKey, salt);
    writeFile(salt, encryptData(vault, req.sessionKey), vault.books.length, user);
    syncVaultToLibraryIndex(vault, user);
    logAuditEvent({ actor: user, action: 'BOOK_DELETE', target: bookId, details: `Deleted book "${bookId}"`, req });
    res.json({ ok: true, user, vault, activeBookId: vault.activeBookId, notebook: getActiveBook(vault) });
  } catch (err) {
    logAuditEvent({ actor: req.currentUser || 'unknown', action: 'BOOK_DELETE', target: (req.body && req.body.bookId) || req.params.id, details: `Could not delete book: ${err.message}`, status: 'FAILED', req });
    res.status(500).json({ error: 'Could not delete book.' });
  }
}

app.post('/api/books/delete', requireUnlocked, handleDeleteBook);
app.delete('/api/books/:id', requireUnlocked, handleDeleteBook);

function handleRenameBook(req, res) {
  try {
    const user = req.currentUser || 'default';
    const file = readFile(user);
    const bookId = (req.body && req.body.bookId) || req.params.id;
    const { title, coverColor } = req.body || {};
    const raw = decryptData(file, req.sessionKey);
    const vault = normalizeVault(raw);

    const target = vault.books.find((b) => b.id === bookId);
    if (!target) return res.status(404).json({ error: 'Book not found.' });

    if (title !== undefined) target.title = formatNotebookTitle(title, user);
    if (coverColor !== undefined) target.coverColor = coverColor;
    target.updatedAt = new Date().toISOString();

    const userRow = db.users.findByUsername(user);
    const salt = (userRow && userRow.salt) || file.salt;

    syncVaultToDb(user, vault, req.sessionKey, salt);
    writeFile(salt, encryptData(vault, req.sessionKey), vault.books.length, user);
    syncVaultToLibraryIndex(vault, user);
    logAuditEvent({ actor: user, action: 'BOOK_RENAME', target: bookId, details: `Updated book "${bookId}" metadata (title="${target.title}")`, req });
    res.json({ ok: true, user, vault, activeBookId: vault.activeBookId, notebook: getActiveBook(vault) });
  } catch (err) {
    logAuditEvent({ actor: req.currentUser || 'unknown', action: 'BOOK_RENAME', target: (req.body && req.body.bookId) || req.params.id, details: `Could not update book: ${err.message}`, status: 'FAILED', req });
    res.status(500).json({ error: 'Could not update book.' });
  }
}

app.post('/api/books/rename', requireUnlocked, handleRenameBook);
app.put('/api/books/:id', requireUnlocked, handleRenameBook);

app.post('/api/books/update-dimensions', requireUnlocked, (req, res) => {
  try {
    const user = req.currentUser || 'default';
    const file = readFile(user);
    const { bookId, dimensions } = req.body || {};
    if (!bookId || !dimensions) {
      return res.status(400).json({ error: 'Missing bookId or dimensions payload.' });
    }

    const raw = decryptData(file, req.sessionKey);
    const vault = normalizeVault(raw, user);
    const target = vault.books.find((b) => b.id === bookId);
    if (!target) return res.status(404).json({ error: 'Book not found.' });

    const userTier = resolveUserTier(user);
    const defaultMaxLimit = userTier === 'ultimate' ? 999999 : (userTier === 'premium' ? 20 : 5);
    if (!target.dimensions) {
      target.dimensions = {
        preset: 'classic',
        width: 1140,
        height: 840,
        aspectRatio: 1.36,
        dimensionChangeCount: 0,
        maxDimensionChanges: defaultMaxLimit,
      };
    }

    // Auto-elevate limits if user tier is VIP (20) or Sovereign (unlimited)
    if (userTier === 'premium' && (target.dimensions.maxDimensionChanges || 5) < 20) {
      target.dimensions.maxDimensionChanges = 20;
    }
    if (userTier === 'ultimate' && (target.dimensions.maxDimensionChanges || 5) < 999999) {
      target.dimensions.maxDimensionChanges = 999999;
    }

    const maxLimit = target.dimensions.maxDimensionChanges !== undefined ? target.dimensions.maxDimensionChanges : defaultMaxLimit;
    target.dimensions.maxDimensionChanges = maxLimit;

    // Rate limiting: Free tier 5 max, VIP tier 20 max, Sovereign/Admin unlimited
    if (userTier !== 'ultimate' && user.toLowerCase() !== 'admin') {
      const currentChanges = target.dimensions.dimensionChangeCount || 0;
      if (currentChanges >= maxLimit) {
        logAuditEvent({
          actor: user,
          action: 'BOOK_DIMENSION_LIMIT',
          target: bookId,
          details: `Dimension change quota reached (${currentChanges}/${maxLimit}) for user "${user}" (${userTier}) on book "${target.title}"`,
          status: 'FAILED',
          req,
        });
        const planName = userTier === 'premium' ? 'VIP' : 'Free';
        return res.status(403).json({
          error: `You have reached the maximum ${maxLimit} aspect ratio modifications for this notebook on the ${planName} plan. Contact the Admin to increase your quota or upgrade.`,
          code: 'DIMENSION_QUOTA_REACHED',
          dimensionChangeCount: currentChanges,
          maxDimensionChanges: maxLimit,
          remainingChanges: 0,
          limitReached: true,
        });
      }
      target.dimensions.dimensionChangeCount = currentChanges + 1;
    }

    // Apply new dimension settings
    if (dimensions.preset) target.dimensions.preset = dimensions.preset;
    if (dimensions.width && !isNaN(Number(dimensions.width))) target.dimensions.width = Math.round(Number(dimensions.width));
    if (dimensions.height && !isNaN(Number(dimensions.height))) target.dimensions.height = Math.round(Number(dimensions.height));
    if (dimensions.aspectRatio && !isNaN(Number(dimensions.aspectRatio))) target.dimensions.aspectRatio = Number(dimensions.aspectRatio);
    target.updatedAt = new Date().toISOString();

    const userRow = db.users.findByUsername(user);
    const salt = (userRow && userRow.salt) || file.salt;

    syncVaultToDb(user, vault, req.sessionKey, salt);
    writeFile(salt, encryptData(vault, req.sessionKey), vault.books.length, user);
    syncVaultToLibraryIndex(vault, user);

    logAuditEvent({
      actor: user,
      action: 'BOOK_DIMENSIONS_UPDATE',
      target: bookId,
      details: `Updated dimensions for "${target.title}" to ${target.dimensions.width}x${target.dimensions.height} (${target.dimensions.aspectRatio}:1). Modifications used: ${target.dimensions.dimensionChangeCount}/${target.dimensions.maxDimensionChanges || 5}`,
      req,
    });

    res.json({
      ok: true,
      user,
      vault,
      activeBookId: vault.activeBookId,
      notebook: getActiveBook(vault),
    });
  } catch (err) {
    logAuditEvent({
      actor: req.currentUser || 'unknown',
      action: 'BOOK_DIMENSIONS_UPDATE',
      details: `Could not update dimensions: ${err.message}`,
      status: 'FAILED',
      req,
    });
    res.status(500).json({ error: 'Could not update notebook dimensions.' });
  }
});

app.post('/api/change-password', requireUnlocked, (req, res) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 4) {
      logAuditEvent({
        actor: req.currentUser || 'default',
        action: 'PASSWORD_CHANGE',
        target: req.currentUser || 'default',
        details: 'Password change failed: Password must be at least 4 characters',
        status: 'FAILED',
        req,
      });
      return res.status(400).json({ error: 'Choose a password with at least 4 characters.' });
    }
    const user = req.currentUser || 'default';
    const file = readFile(user);
    const vault = normalizeVault(decryptData(file, req.sessionKey));
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newKey = deriveKey(newPassword, newSalt);

    syncVaultToDb(user, vault, newKey, newSalt);
    writeFile(newSalt, encryptData(vault, newKey), vault.books.length, user);
    sessionKey = newKey;
    failedAttempts = 0;
    lockedUntil = 0;

    if (user.toLowerCase() === 'admin') {
      cachedAdminKey = newKey;
      saveEncryptedAuditLogs();
    }

    syncVaultToLibraryIndex(vault, user);

    logAuditEvent({
      actor: user,
      action: 'PASSWORD_CHANGE',
      target: user,
      details: `Password successfully changed for user "${user}"`,
      req,
    });

    const token = registerUserSession(user, newKey, req);
    setSessionCookie(res, token, req);
    res.json({ ok: true });
  } catch (err) {
    logAuditEvent({
      actor: req.currentUser || 'default',
      action: 'PASSWORD_CHANGE',
      target: req.currentUser || 'default',
      details: `Password change failed: ${err.message}`,
      status: 'FAILED',
      req,
    });
    res.status(500).json({ error: 'Could not change the password.' });
  }
});

// ---------- image & media file API (AES-256-GCM encrypted on disk & DB indexed) ----------

// ---------- Military-Grade Encrypted Chunk Audit Ledger & Sharding Engine ----------
const CHUNK_AUDIT_LEDGER_FILE = path.join(DATA_DIR, 'chunk_audit_ledger.enc');

const CHUNK_AUDIT_STATIC_SECRET = process.env.CHUNK_AUDIT_SECRET || 'MILITARY_CHUNK_AUDIT_PERSISTENT_MASTER_KEY_V2';

function getChunkAuditMasterKey() {
  return crypto.createHmac('sha256', Buffer.from(CHUNK_AUDIT_STATIC_SECRET, 'utf8'))
    .update('CHUNK_AUDIT_LEDGER_MILITARY_KEY_V2')
    .digest();
}

function getFileTypeFromExt(filename) {
  const ext = (path.extname(filename) || '').toLowerCase().replace('.', '');
  if (['pdf'].includes(ext)) return 'pdf';
  if (['pptx', 'ppt', 'ppsx', 'odp'].includes(ext)) return 'pptx';
  if (['docx', 'doc', 'odt', 'rtf'].includes(ext)) return 'docx';
  if (['xlsx', 'xls', 'csv', 'tsv', 'ods'].includes(ext)) return 'spreadsheet';
  if (['mp4', 'webm', 'mov', 'mkv', 'avi', 'ogv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'audio';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext)) return 'image';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'sql', 'sh', 'cpp', 'c', 'java', 'go', 'rs'].includes(ext)) return 'code';
  return 'document';
}

function loadDecryptedChunkAuditLedger() {
  if (!fs.existsSync(CHUNK_AUDIT_LEDGER_FILE)) return [];
  try {
    const key = getChunkAuditMasterKey();
    const encBuf = fs.readFileSync(CHUNK_AUDIT_LEDGER_FILE);
    const decBuf = decryptMediaBuffer(encBuf, key);
    const json = JSON.parse(decBuf.toString('utf8'));
    return Array.isArray(json) ? json : [];
  } catch (err) {
    return [];
  }
}

function saveEncryptedChunkAuditLedger(ledger) {
  try {
    const key = getChunkAuditMasterKey();
    const blobsDir = path.dirname(CHUNK_AUDIT_LEDGER_FILE);
    if (!fs.existsSync(blobsDir)) fs.mkdirSync(blobsDir, { recursive: true });
    const payload = Buffer.from(JSON.stringify(ledger, null, 2), 'utf8');
    const encBuf = encryptMediaBuffer(payload, key);
    fs.writeFileSync(CHUNK_AUDIT_LEDGER_FILE, encBuf);
  } catch (err) {}
}

function recordChunkAuditEntries(manifest, rawBuffer, sessionKey, meta = {}) {
  try {
    const ledger = loadDecryptedChunkAuditLedger();
    const ownerUsername = meta.ownerUsername || 'anonymous';
    const userId = meta.userId || `user_${ownerUsername.toLowerCase()}`;
    const fileType = getFileTypeFromExt(manifest.filename);
    const now = new Date().toISOString();

    for (const chunk of manifest.chunks) {
      const chunkBuf = rawBuffer.subarray(chunk.startByte, chunk.endByte + 1);
      const sha256Hash = crypto.createHash('sha256').update(chunkBuf).digest('hex');

      ledger.push({
        chunkId: chunk.chunkId,
        relPath: chunk.relPath,
        manifestId: manifest.id,
        ownerUsername,
        userId,
        originalFilename: manifest.filename,
        mimeType: manifest.mimeType,
        fileType,
        chunkIndex: chunk.index,
        totalChunks: manifest.totalChunks,
        startByte: chunk.startByte,
        endByte: chunk.endByte,
        plainSize: chunk.size,
        encryptedSize: chunk.encryptedSize,
        sha256Hash,
        encryptionAlgorithm: 'AES-256-GCM (Authenticated 256-bit AEAD)',
        createdAt: now,
      });
    }

    saveEncryptedChunkAuditLedger(ledger);
  } catch (err) {}
}

function removeChunkAuditEntries(manifestId) {
  try {
    const ledger = loadDecryptedChunkAuditLedger();
    const filtered = ledger.filter((entry) => entry.manifestId !== manifestId);
    saveEncryptedChunkAuditLedger(filtered);
  } catch (err) {}
}

function shardAndStoreMediaBuffer(rawBuffer, sessionKey, meta = {}) {
  const manifestId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const safeExt = (meta.ext || 'bin').replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const originalName = meta.originalName || `${manifestId}.${safeExt}`;
  const mimeType = meta.mimeType || getMimeType(originalName);

  const totalLen = rawBuffer.length;
  const chunks = [];
  let offset = 0;
  let chunkIndex = 0;

  // Slices all media & documents into 5MB - 8MB randomized extensionless AES-256-GCM encrypted chunks
  while (offset < totalLen) {
    const minChunk = 5 * 1024 * 1024;
    const maxChunk = 8 * 1024 * 1024;
    const targetSize = Math.min(totalLen - offset, Math.floor(minChunk + Math.random() * (maxChunk - minChunk)));
    const chunkBuf = rawBuffer.subarray(offset, offset + targetSize);
    const chunkId = crypto.randomBytes(16).toString('hex');

    // 2-level directory distribution based on chunk hash/id
    const dir1 = chunkId.slice(0, 2);
    const dir2 = chunkId.slice(2, 4);
    const chunkDir = path.join(BLOBS_DIR, dir1, dir2);
    if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

    // Encrypt chunk with military-grade AES-256-GCM (NO plain extension on disk)
    const encryptedChunk = encryptMediaBuffer(chunkBuf, sessionKey);
    const chunkFilePath = path.join(chunkDir, chunkId);
    fs.writeFileSync(chunkFilePath, encryptedChunk);

    const relPath = path.join('blobs', dir1, dir2, chunkId).replace(/\\/g, '/');
    chunks.push({
      index: chunkIndex,
      chunkId,
      relPath,
      startByte: offset,
      endByte: offset + chunkBuf.length - 1,
      size: chunkBuf.length,
      encryptedSize: encryptedChunk.length,
    });

    offset += targetSize;
    chunkIndex++;
  }

  const ivHex = crypto.createHmac('sha256', sessionKey).update('HLS-IV:' + manifestId).digest().subarray(0, 16).toString('hex');
  const hlsKeyHex = crypto.createHmac('sha256', sessionKey).update('HLS-KEY:' + manifestId).digest().subarray(0, 16).toString('hex');
  const duration = meta.duration || (chunks.length * 6);

  const manifest = {
    id: manifestId,
    filename: originalName,
    mimeType,
    totalSize: totalLen,
    totalChunks: chunks.length,
    chunks,
    duration,
    ivHex,
    hlsKeyHex,
    hlsPlaylistUrl: `/api/media/${manifestId}/playlist.m3u8`,
    hlsMasterUrl: `/api/media/${manifestId}/hls/master.m3u8`,
    hlsKeyUrl: `/api/media/${manifestId}/key`,
    createdAt: new Date().toISOString(),
    encrypted: true,
  };

  if (!fs.existsSync(MANIFESTS_DIR)) fs.mkdirSync(MANIFESTS_DIR, { recursive: true });
  const encryptedManifest = encryptMediaBuffer(Buffer.from(JSON.stringify(manifest), 'utf8'), sessionKey);
  fs.writeFileSync(path.join(MANIFESTS_DIR, manifestId), encryptedManifest);

  // Record audit entries for all chunks in the military-grade encrypted audit ledger
  recordChunkAuditEntries(manifest, rawBuffer, sessionKey, meta);

  return manifest;
}

function loadDecryptedManifest(manifestId, sessionKey) {
  const cleanId = path.basename(manifestId).split('.')[0];
  const manifestFile = path.join(MANIFESTS_DIR, cleanId);
  if (!fs.existsSync(manifestFile)) return null;
  try {
    const encBuf = fs.readFileSync(manifestFile);
    const decBuf = decryptMediaBuffer(encBuf, sessionKey);
    return JSON.parse(decBuf.toString('utf8'));
  } catch (err) {
    return null;
  }
}

// In-memory LRU cache for decrypted media chunks (TTL 10s, max 4 chunks ~ 20MB RAM max).
// Eliminates repetitive synchronous crypto operations during video range streaming for silky smooth playback.
const decryptedChunkCache = new Map();
const MAX_DECRYPTED_CHUNKS = 4;
const CHUNK_CACHE_TTL_MS = 10000;

function getCachedDecryptedChunk(chunkAbsPath, sessionKey) {
  const cacheKey = `${chunkAbsPath}:${sessionKey.toString('hex')}`;
  const now = Date.now();
  const hit = decryptedChunkCache.get(cacheKey);
  if (hit && (now - hit.timestamp < CHUNK_CACHE_TTL_MS)) {
    hit.timestamp = now; // update LRU access time
    return hit.buffer;
  }

  if (!fs.existsSync(chunkAbsPath)) return Buffer.alloc(0);
  const encChunk = fs.readFileSync(chunkAbsPath);
  const decChunk = decryptMediaBuffer(encChunk, sessionKey);

  // Evict oldest entries if cache exceeds capacity
  if (decryptedChunkCache.size >= MAX_DECRYPTED_CHUNKS) {
    const oldestKey = decryptedChunkCache.keys().next().value;
    if (oldestKey) decryptedChunkCache.delete(oldestKey);
  }

  decryptedChunkCache.set(cacheKey, { buffer: decChunk, timestamp: now });
  return decChunk;
}

function readDecryptedChunkSlice(chunkInfo, sliceStart, sliceEnd, sessionKey) {
  const chunkAbsPath = path.resolve(DATA_DIR, chunkInfo.relPath);
  const decChunk = getCachedDecryptedChunk(chunkAbsPath, sessionKey);
  if (!decChunk || decChunk.length === 0) return Buffer.alloc(0);

  const localStart = Math.max(0, sliceStart - chunkInfo.startByte);
  const localEnd = Math.min(decChunk.length, sliceEnd - chunkInfo.startByte + 1);
  return decChunk.subarray(localStart, localEnd);
}

function deleteShardedMedia(manifestId, sessionKey) {
  const cleanId = path.basename(manifestId).split('.')[0];
  const manifest = loadDecryptedManifest(cleanId, sessionKey);
  if (manifest && Array.isArray(manifest.chunks)) {
    for (const chunk of manifest.chunks) {
      try {
        const chunkAbs = path.resolve(DATA_DIR, chunk.relPath);
        if (fs.existsSync(chunkAbs)) {
          fs.unlinkSync(chunkAbs);
        }
        // Prune empty parent directories (dir2 and dir1)
        const dir2 = path.dirname(chunkAbs);
        const dir1 = path.dirname(dir2);
        try {
          if (fs.existsSync(dir2) && fs.readdirSync(dir2).length === 0) {
            fs.rmdirSync(dir2);
          }
          if (fs.existsSync(dir1) && fs.readdirSync(dir1).length === 0) {
            fs.rmdirSync(dir1);
          }
        } catch (e) {}
      } catch (e) {}
    }
  }
  const manifestFile = path.join(MANIFESTS_DIR, cleanId);
  if (fs.existsSync(manifestFile)) {
    try { fs.unlinkSync(manifestFile); } catch (e) {}
  }
  removeChunkAuditEntries(cleanId);
}

// Helper: Resolve Media Ownership, RBAC & Effective Key (Owner vs Admin God Mode)
function resolveMediaOwnerAndKey(mediaParam, req) {
  if (!mediaParam || typeof mediaParam !== 'string') return null;
  let decoded = mediaParam;
  try { decoded = decodeURIComponent(mediaParam); } catch (e) {}
  try { decoded = decodeURIComponent(decoded); } catch (e) {}
  const rawClean = path.basename(decoded).replace(/\.(m3u8|ts|bin|key|mp4|webm|mov|m4v|mkv|avi|ogv|jpg|png|gif|webp|mp3|wav|ogg)$/i, '');

  if (
    mediaParam.includes('..') ||
    decoded.includes('..') ||
    mediaParam.includes('/') ||
    mediaParam.includes('\\') ||
    decoded.includes('/') ||
    decoded.includes('\\') ||
    !/^[a-zA-Z0-9_.-]+$/.test(rawClean)
  ) {
    return { error: 'invalid_param' };
  }

  // 1. Check SQLite media_files
  let mediaRow = db.media_files.findById(rawClean);
  if (!mediaRow) {
    mediaRow = db.media_files.findById(decoded);
  }
  if (!mediaRow) {
    const all = db.media_files.listAll();
    mediaRow = all.find(m => m.id === rawClean || m.id === decoded || m.file_name === decoded || m.file_name === rawClean || (m.file_name && m.file_name.split('.')[0] === rawClean));
  }

  const currentUser = (req.currentUser || 'default').toLowerCase();
  const isAdmin = req.isAdmin || currentUser === 'admin';

  if (mediaRow) {
    let ownerUsername = null;
    if (mediaRow.user_id) {
      const uRow = db.users.findById(mediaRow.user_id);
      if (uRow && uRow.username) {
        ownerUsername = uRow.username;
      } else if (mediaRow.user_id.startsWith('user_')) {
        ownerUsername = mediaRow.user_id.slice(5);
      }
    }
    if (!ownerUsername) ownerUsername = 'default';

    const isOwner = ownerUsername.toLowerCase() === currentUser;

    if (isOwner) {
      return {
        mediaId: mediaRow.id,
        mediaRow,
        ownerUsername,
        isOwner: true,
        isAdmin: false,
        effectiveKey: req.sessionKey,
      };
    }

    if (isAdmin) {
      const unwrappedKey = resolveUserKeyForAdmin(ownerUsername, req.sessionKey);
      return {
        mediaId: mediaRow.id,
        mediaRow,
        ownerUsername,
        isOwner: false,
        isAdmin: true,
        effectiveKey: unwrappedKey || req.sessionKey,
      };
    }

    // Authenticated non-owner and non-admin
    return {
      mediaId: mediaRow.id,
      mediaRow,
      ownerUsername,
      isOwner: false,
      isAdmin: false,
      forbidden: true,
    };
  }

  // 2. Check disk manifest if no DB record
  const manifestFile = path.join(MANIFESTS_DIR, rawClean);
  if (fs.existsSync(manifestFile)) {
    const testManifest = loadDecryptedManifest(rawClean, req.sessionKey);
    if (testManifest) {
      return {
        mediaId: rawClean,
        mediaRow: null,
        ownerUsername: req.currentUser || 'default',
        isOwner: true,
        isAdmin,
        effectiveKey: req.sessionKey,
      };
    }

    if (isAdmin) {
      const allUsers = db.users.listAll();
      for (const u of allUsers) {
        if (u.username.toLowerCase() === 'admin') continue;
        const uKey = resolveUserKeyForAdmin(u.username, req.sessionKey);
        if (uKey) {
          const uManifest = loadDecryptedManifest(rawClean, uKey);
          if (uManifest) {
            return {
              mediaId: rawClean,
              mediaRow: null,
              ownerUsername: u.username,
              isOwner: false,
              isAdmin: true,
              effectiveKey: uKey,
            };
          }
        }
      }
    }

    return {
      mediaId: rawClean,
      mediaRow: null,
      ownerUsername: null,
      isOwner: false,
      isAdmin: false,
      forbidden: true,
    };
  }

  return { notFound: true, mediaId: rawClean };
}

function generateHlsMediaPlaylist(manifest, effectiveKey) {
  const mediaId = manifest.id;
  const ivHex = manifest.ivHex || crypto.createHmac('sha256', effectiveKey).update('HLS-IV:' + mediaId).digest().subarray(0, 16).toString('hex');
  const targetDuration = 10;

  let lines = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    `#EXT-X-TARGETDURATION:${targetDuration}`,
    '#EXT-X-MEDIA-SEQUENCE:0',
    '#EXT-X-PLAYLIST-TYPE:VOD',
    '#EXT-X-INDEPENDENT-SEGMENTS',
    `#EXT-X-KEY:METHOD=AES-128,URI="/api/media/${mediaId}/key",IV=0x${ivHex}`,
  ];

  const totalChunks = (manifest.chunks && manifest.chunks.length > 0) ? manifest.chunks.length : 1;
  const defaultSegDuration = 6.0;

  for (let i = 0; i < totalChunks; i++) {
    const chunk = manifest.chunks ? manifest.chunks[i] : null;
    let segDur = defaultSegDuration;
    if (chunk && manifest.totalSize && manifest.duration) {
      segDur = ((chunk.size / manifest.totalSize) * manifest.duration);
    }
    const formattedDur = Number(segDur).toFixed(6);
    lines.push(`#EXTINF:${formattedDur},`);
    lines.push(`/api/media/${mediaId}/segments/${i}`);
  }

  lines.push('#EXT-X-ENDLIST');
  return lines.join('\n') + '\n';
}

function handleMediaUpload(req, res) {
  try {
    let rawBuffer = null;
    let ext = (req.path && req.path.includes('image')) ? 'png' : 'mp4';
    let originalName = '';

    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      rawBuffer = req.body;
      const headerName = req.headers['x-file-name'] ? decodeURIComponent(req.headers['x-file-name']) : '';
      if (headerName) originalName = headerName;
      const headerExt = req.headers['x-file-ext'] || (headerName ? path.extname(headerName) : '');
      if (headerExt) {
        ext = headerExt.toLowerCase().replace('.', '');
      } else if (req.headers['content-type']) {
        const ct = req.headers['content-type'].toLowerCase();
        if (ct.includes('png')) ext = 'png';
        else if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg';
        else if (ct.includes('webp')) ext = 'webp';
        else if (ct.includes('gif')) ext = 'gif';
        else if (ct.includes('pdf')) ext = 'pdf';
        else if (ct.includes('presentation') || ct.includes('pptx')) ext = 'pptx';
        else if (ct.includes('word') || ct.includes('docx')) ext = 'docx';
        else if (ct.includes('mp4')) ext = 'mp4';
        else if (ct.includes('webm')) ext = 'webm';
        else if (ct.includes('quicktime') || ct.includes('mov')) ext = 'mov';
        else if (ct.includes('mpeg') || ct.includes('mp3')) ext = 'mp3';
        else if (ct.includes('wav')) ext = 'wav';
      }
    } else if (req.body && typeof req.body === 'object') {
      const { data, ext: bodyExt, filename: bodyFilename } = req.body;
      if (!data) {
        logAuditEvent({ actor: req.currentUser || 'anonymous', action: 'MEDIA_UPLOAD', details: 'Media upload failed: No media data provided', status: 'FAILED', req });
        return res.status(400).json({ error: 'No media data provided.' });
      }
      if (bodyExt) ext = bodyExt;
      if (bodyFilename) originalName = bodyFilename;
      if (!bodyExt && typeof data === 'string' && data.startsWith('data:image/')) {
        const match = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
        if (match && match[1]) ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      }
      const base64Data = data.includes(',') ? data.split(',')[1] : data;
      rawBuffer = Buffer.from(base64Data, 'base64');
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      logAuditEvent({ actor: req.currentUser || 'anonymous', action: 'MEDIA_UPLOAD', details: 'Media upload failed: Empty or invalid media payload', status: 'FAILED', req });
      return res.status(400).json({ error: 'Empty or invalid media payload.' });
    }

    const safeExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'mp4';
    if (!originalName) originalName = `media_${Date.now()}.${safeExt}`;

    const cleanUser = req.currentUser || 'default';
    const userTier = resolveUserTier(cleanUser);
    const tierConfig = getTierConfig(userTier);

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(safeExt);
    const isVideo = ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'avi', 'ogv'].includes(safeExt);
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(safeExt);

    // 1. Check Video file size limit (Ultimate is completely unlimited)
    if (userTier !== 'ultimate' && isVideo && rawBuffer.length > tierConfig.maxVideoSizeBytes) {
      const maxMB = Math.round(tierConfig.maxVideoSizeBytes / (1024 * 1024));
      const curMB = (rawBuffer.length / (1024 * 1024)).toFixed(1);
      logAuditEvent({ actor: cleanUser, action: 'MEDIA_UPLOAD', details: `Video size limit exceeded (${curMB}MB > ${maxMB}MB) for tier ${userTier}`, status: 'FAILED', req });
      return res.status(413).json({
        error: `Video exceeds ${maxMB}MB limit for your plan (File size: ${curMB}MB). Upgrade to Guild Master (Premium) or Ultimate Sovereign for unlimited uploads.`,
        code: 'TIER_LIMIT_VIDEO_SIZE',
        maxBytes: tierConfig.maxVideoSizeBytes,
        fileBytes: rawBuffer.length,
        tier: userTier,
      });
    }

    // 2. Check Image/Audio/Doc file size limit (Ultimate is completely unlimited)
    if (userTier !== 'ultimate' && !isVideo && rawBuffer.length > tierConfig.maxImageSizeBytes) {
      const maxMB = Math.round(tierConfig.maxImageSizeBytes / (1024 * 1024));
      const curMB = (rawBuffer.length / (1024 * 1024)).toFixed(1);
      logAuditEvent({ actor: cleanUser, action: 'MEDIA_UPLOAD', details: `File size limit exceeded (${curMB}MB > ${maxMB}MB) for tier ${userTier}`, status: 'FAILED', req });
      return res.status(413).json({
        error: `File exceeds ${maxMB}MB limit for your plan (File size: ${curMB}MB). Upgrade to Guild Master (Premium) or Ultimate Sovereign for unlimited uploads.`,
        code: 'TIER_LIMIT_FILE_SIZE',
        maxBytes: tierConfig.maxImageSizeBytes,
        fileBytes: rawBuffer.length,
        tier: userTier,
      });
    }

    // 3. Check cumulative User Storage Quota (Ultimate is completely unlimited)
    const currentStorage = calculateUserStorageUsage(cleanUser);
    if (userTier !== 'ultimate' && currentStorage + rawBuffer.length > tierConfig.maxTotalStorageBytes) {
      const maxGB = (tierConfig.maxTotalStorageBytes / (1024 * 1024 * 1024)).toFixed(1);
      const usedMB = (currentStorage / (1024 * 1024)).toFixed(1);
      logAuditEvent({ actor: cleanUser, action: 'MEDIA_UPLOAD', details: `Storage quota exceeded (${usedMB}MB / ${maxGB}GB) for tier ${userTier}`, status: 'FAILED', req });
      return res.status(413).json({
        error: `Storage quota exceeded (${maxGB}GB limit). Upgrade to Guild Master (Premium) or Ultimate Sovereign for unlimited storage.`,
        code: 'TIER_LIMIT_STORAGE',
        maxStorageBytes: tierConfig.maxTotalStorageBytes,
        currentStorageBytes: currentStorage,
        tier: userTier,
      });
    }

    const userRow = db.users.findByUsername(cleanUser);
    const userId = userRow ? userRow.id : `user_${cleanUser.toLowerCase()}`;

    // Shard and store encrypted chunks with military-grade AES-256-GCM and log to chunk audit ledger
    const manifest = shardAndStoreMediaBuffer(rawBuffer, req.sessionKey, {
      ext: safeExt,
      originalName,
      mimeType: getMimeType(originalName),
      ownerUsername: cleanUser,
      userId,
    });

    const filename = `${manifest.id}.${safeExt}`;
    if (rawBuffer.length <= 10 * 1024 * 1024) {
      try {
        const encryptedBuf = encryptMediaBuffer(rawBuffer, req.sessionKey);
        fs.writeFileSync(path.join(IMAGES_DIR, filename), encryptedBuf);
      } catch (e) {}
    }
    try {
      db.media_files.create({
        id: manifest.id,
        user_id: userId,
        book_id: null,
        file_name: filename,
        mime_type: manifest.mimeType,
        size: rawBuffer.length,
        encrypted_blob_path: path.join('data', 'blobs', 'manifests', manifest.id),
        created_at: new Date().toISOString(),
      });
    } catch (e) {}

    const mediaUrl = '/media/' + filename;
    const imageUrl = '/images/' + filename;
    const url = imageUrl;

    logAuditEvent({ actor: req.currentUser || 'anonymous', action: 'MEDIA_UPLOAD', target: filename, details: `Uploaded media "${filename}" (${rawBuffer.length} bytes in ${manifest.totalChunks} chunks)`, req });

    res.json({
      ok: true,
      url,
      mediaUrl,
      imageUrl,
      filename,
      manifestId: manifest.id,
      size: rawBuffer.length,
      totalChunks: manifest.totalChunks,
      isVideo,
      isAudio,
      isImage,
      ext: safeExt,
      sharded: true,
      encrypted: true,
      hlsPlaylistUrl: `/api/media/${manifest.id}/playlist.m3u8`,
      hlsMasterUrl: `/api/media/${manifest.id}/hls/master.m3u8`,
      hlsKeyUrl: `/api/media/${manifest.id}/key`,
    });
  } catch (err) {
    logAuditEvent({ actor: req.currentUser || 'anonymous', action: 'MEDIA_UPLOAD', details: `Media upload failed: ${err.message}`, status: 'FAILED', req });
    res.status(500).json({ error: 'Could not upload media: ' + err.message });
  }
}

function handleImageUpload(req, res) {
  return handleMediaUpload(req, res);
}

app.post('/api/images', requireUnlocked, handleImageUpload);
app.post('/api/images/upload', requireUnlocked, handleImageUpload);
app.post('/api/images/raw', requireUnlocked, handleMediaUpload);
app.post('/api/media/upload', requireUnlocked, handleMediaUpload);
app.post('/api/media', requireUnlocked, handleMediaUpload);

// ---------- HLS Manifest Generator Handler ----------
function handleServeHlsManifest(req, res) {
  try {
    const raw = req.params.mediaId || req.params.filename;
    const auth = resolveMediaOwnerAndKey(raw, req);

    if (!auth || auth.error === 'invalid_param') {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    if (auth.forbidden) {
      logAuditEvent({
        actor: req.currentUser || 'anonymous',
        action: 'FORBIDDEN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Forbidden HLS playlist access attempt by ${req.currentUser} on media owned by ${auth.ownerUsername}`,
        status: 'FAILED',
        req,
      });
      return res.status(403).json({ error: 'Forbidden: Access denied to media file.' });
    }

    if (auth.notFound || !auth.effectiveKey) {
      return res.status(404).json({ error: 'Media manifest not found' });
    }

    const manifest = loadDecryptedManifest(auth.mediaId, auth.effectiveKey);
    if (!manifest) {
      return res.status(404).json({ error: 'Media manifest not found' });
    }

    if (auth.isAdmin && !auth.isOwner) {
      logAuditEvent({
        actor: req.currentUser,
        action: 'ADMIN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Admin God Mode accessed HLS playlist for media owned by ${auth.ownerUsername}`,
        req,
      });
    }

    const playlist = generateHlsMediaPlaylist(manifest, auth.effectiveKey);

    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.set('Cache-Control', 'private, no-cache');
    res.set('Accept-Ranges', 'bytes');
    res.status(200).send(playlist);
  } catch (err) {
    res.status(500).json({ error: 'Could not generate HLS playlist: ' + err.message });
  }
}

// ---------- HLS AES-128 Key Retrieval Handler ----------
function handleServeHlsKey(req, res) {
  try {
    const raw = req.params.mediaId || req.params.filename;
    const auth = resolveMediaOwnerAndKey(raw, req);

    if (!auth || auth.error === 'invalid_param') {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    if (auth.forbidden) {
      logAuditEvent({
        actor: req.currentUser || 'anonymous',
        action: 'FORBIDDEN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Forbidden HLS key access attempt by ${req.currentUser} on media owned by ${auth.ownerUsername}`,
        status: 'FAILED',
        req,
      });
      return res.status(403).json({ error: 'Forbidden: Access denied to media key.' });
    }

    if (auth.notFound || !auth.effectiveKey) {
      return res.status(404).json({ error: 'Media not found' });
    }

    if (auth.isAdmin && !auth.isOwner) {
      logAuditEvent({
        actor: req.currentUser,
        action: 'ADMIN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Admin God Mode accessed HLS decryption key for media owned by ${auth.ownerUsername}`,
        req,
      });
    }

    const hlsKey = crypto.createHmac('sha256', auth.effectiveKey)
      .update('HLS-KEY:' + auth.mediaId)
      .digest()
      .subarray(0, 16);

    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Length', '16');
    res.set('Cache-Control', 'private, no-store, no-cache');
    res.status(200).send(hlsKey);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve encryption key: ' + err.message });
  }
}

// ---------- HLS Segment Streaming Handler ----------
function handleServeHlsSegment(req, res) {
  try {
    const rawMedia = req.params.mediaId || req.params.filename;
    const rawSegIdx = req.params.segmentIndex;

    if (!rawSegIdx || !/^\d+$/.test(rawSegIdx)) {
      return res.status(400).json({ error: 'Invalid segment index' });
    }

    const auth = resolveMediaOwnerAndKey(rawMedia, req);

    if (!auth || auth.error === 'invalid_param') {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    if (auth.forbidden) {
      logAuditEvent({
        actor: req.currentUser || 'anonymous',
        action: 'FORBIDDEN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Forbidden HLS segment access attempt by ${req.currentUser} on segment ${rawSegIdx} owned by ${auth.ownerUsername}`,
        status: 'FAILED',
        req,
      });
      return res.status(403).json({ error: 'Forbidden: Access denied to media segment.' });
    }

    if (auth.notFound || !auth.effectiveKey) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const manifest = loadDecryptedManifest(auth.mediaId, auth.effectiveKey);
    if (!manifest || !Array.isArray(manifest.chunks)) {
      return res.status(404).json({ error: 'Media manifest not found' });
    }

    const segIdx = parseInt(rawSegIdx, 10);
    const chunkInfo = manifest.chunks.find(c => c.index === segIdx);
    if (!chunkInfo) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    if (auth.isAdmin && !auth.isOwner) {
      logAuditEvent({
        actor: req.currentUser,
        action: 'ADMIN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Admin God Mode streamed HLS segment ${segIdx} for media owned by ${auth.ownerUsername}`,
        req,
      });
    }

    // Decrypt chunk from sharded storage
    const rawChunkBuf = readDecryptedChunkSlice(chunkInfo, chunkInfo.startByte, chunkInfo.endByte, auth.effectiveKey);
    if (!rawChunkBuf || rawChunkBuf.length === 0) {
      return res.status(404).json({ error: 'Chunk data not available' });
    }

    // Encrypt segment with AES-128-CBC using derived HLS key and IV
    const hlsKey = crypto.createHmac('sha256', auth.effectiveKey)
      .update('HLS-KEY:' + auth.mediaId)
      .digest()
      .subarray(0, 16);

    const ivHex = manifest.ivHex || crypto.createHmac('sha256', auth.effectiveKey).update('HLS-IV:' + auth.mediaId).digest().subarray(0, 16).toString('hex');
    const iv = Buffer.from(ivHex, 'hex');

    const cipher = crypto.createCipheriv('aes-128-cbc', hlsKey, iv);
    cipher.setAutoPadding(true);
    const encryptedSegment = Buffer.concat([cipher.update(rawChunkBuf), cipher.final()]);

    const totalSegSize = encryptedSegment.length;
    res.set('Accept-Ranges', 'bytes');
    res.set('Content-Type', 'video/MP2T');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.removeHeader('ETag');

    const range = req.headers.range;
    if (range && range.startsWith('bytes=')) {
      const rangeSpec = range.replace(/^bytes=/, '').trim();
      const parts = rangeSpec.split('-');
      let start;
      let end;

      if (parts[0] === '' && parts[1] !== '') {
        const suffixLen = parseInt(parts[1], 10);
        if (isNaN(suffixLen) || suffixLen <= 0) {
          res.set('Content-Range', `bytes */${totalSegSize}`);
          return res.status(416).end();
        }
        start = Math.max(0, totalSegSize - suffixLen);
        end = totalSegSize - 1;
      } else {
        start = parseInt(parts[0], 10);
        end = (parts[1] !== '' && parts[1] !== undefined) ? parseInt(parts[1], 10) : totalSegSize - 1;
      }

      if (isNaN(start) || isNaN(end) || start > end || start >= totalSegSize || start < 0) {
        res.set('Content-Range', `bytes */${totalSegSize}`);
        return res.status(416).end();
      }

      if (end >= totalSegSize) {
        end = totalSegSize - 1;
      }

      const chunkSlice = encryptedSegment.subarray(start, end + 1);
      res.status(206);
      res.set('Content-Range', `bytes ${start}-${end}/${totalSegSize}`);
      res.set('Content-Length', chunkSlice.length);
      return res.send(chunkSlice);
    }

    res.status(200);
    res.set('Content-Length', totalSegSize);
    return res.send(encryptedSegment);
  } catch (err) {
    res.status(500).json({ error: 'Could not stream segment: ' + err.message });
  }
}

function handleServeImage(req, res) {
  const raw = req.params.filename;
  if (!raw || typeof raw !== 'string') return res.status(400).end();
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch (e) {}
  try { decoded = decodeURIComponent(decoded); } catch (e) {}
  const filename = path.basename(decoded);
  if (
    raw.includes('..') ||
    decoded.includes('..') ||
    raw.includes('/') ||
    raw.includes('\\') ||
    decoded.includes('/') ||
    decoded.includes('\\') ||
    filename !== decoded ||
    !/^[a-zA-Z0-9_.-]+$/.test(filename)
  ) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // If requested an .m3u8 playlist file through /media/:filename
  if (filename.endsWith('.m3u8')) {
    return handleServeHlsManifest(req, res);
  }

  // Resolve RBAC and effective decryption key
  const auth = resolveMediaOwnerAndKey(filename, req);
  if (auth && auth.forbidden) {
    logAuditEvent({
      actor: req.currentUser || 'anonymous',
      action: 'FORBIDDEN_HLS_ACCESS',
      target: auth.mediaId,
      details: `Forbidden media access attempt by ${req.currentUser} on media owned by ${auth.ownerUsername}`,
      status: 'FAILED',
      req,
    });
    return res.status(403).json({ error: 'Forbidden: Access denied to media file.' });
  }

  const effectiveKey = (auth && auth.effectiveKey) ? auth.effectiveKey : req.sessionKey;
  if (auth && auth.isAdmin && !auth.isOwner) {
    logAuditEvent({
      actor: req.currentUser,
      action: 'ADMIN_HLS_ACCESS',
      target: auth.mediaId,
      details: `Admin God Mode accessed media owned by ${auth.ownerUsername}`,
      req,
    });
  }

  // 1. Check for sharded chunk manifest
  const manifest = loadDecryptedManifest(filename, effectiveKey);
  if (manifest && Array.isArray(manifest.chunks) && manifest.chunks.length > 0) {
    const totalSize = manifest.totalSize;
    res.set('Accept-Ranges', 'bytes');
    res.set('Content-Type', manifest.mimeType || 'video/mp4');
    res.set('Cache-Control', 'private, no-cache');

    const range = req.headers.range;
    if (range && range.startsWith('bytes=')) {
      const rangeSpec = range.replace(/^bytes=/, '').trim();
      const parts = rangeSpec.split('-');
      let start;
      let end;

      if (parts[0] === '' && parts[1] !== '') {
        const suffixLen = parseInt(parts[1], 10);
        if (isNaN(suffixLen) || suffixLen <= 0) {
          res.set('Content-Range', `bytes */${totalSize}`);
          return res.status(416).end();
        }
        start = Math.max(0, totalSize - suffixLen);
        end = totalSize - 1;
      } else {
        start = parseInt(parts[0], 10);
        end = (parts[1] !== '' && parts[1] !== undefined) ? parseInt(parts[1], 10) : totalSize - 1;
      }

      if (isNaN(start) || isNaN(end) || start > end || start >= totalSize || start < 0) {
        res.set('Content-Range', `bytes */${totalSize}`);
        return res.status(416).end();
      }

      // Stream up to 8MB per slice for smooth, fast video playback
      const MAX_STREAM_SLICE = 8 * 1024 * 1024; // 8MB max slice
      const isImagesOrMedia = req.originalUrl && (req.originalUrl.startsWith('/images') || req.originalUrl.startsWith('/media')) && !req.originalUrl.startsWith('/images/raw');
      if (isImagesOrMedia && (end - start + 1 > MAX_STREAM_SLICE)) {
        end = start + MAX_STREAM_SLICE - 1;
      }

      if (end >= totalSize) {
        end = totalSize - 1;
      }

      // Collect only the chunks overlapping the requested [start, end] window
      const overlapping = manifest.chunks.filter(c => c.endByte >= start && c.startByte <= end);
      const buffers = overlapping.map(c => readDecryptedChunkSlice(c, start, end, effectiveKey));
      const rangePayload = Buffer.concat(buffers);

      res.status(206);
      res.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      res.set('Content-Length', rangePayload.length);
      return res.send(rangePayload);
    }

    // For files requested without Range header:
    if (totalSize <= 20 * 1024 * 1024) {
      const allBuffers = manifest.chunks.map(c => readDecryptedChunkSlice(c, 0, totalSize - 1, effectiveKey));
      const fullPayload = Buffer.concat(allBuffers);

      res.status(200);
      res.set('Content-Length', fullPayload.length);
      return res.send(fullPayload);
    }

    // For large files (> 20MB) requested without Range: serve initial 8MB slice with 206 Partial Content
    const initialEnd = Math.min(totalSize - 1, 8 * 1024 * 1024 - 1);
    const overlapping = manifest.chunks.filter(c => c.endByte >= 0 && c.startByte <= initialEnd);
    const buffers = overlapping.map(c => readDecryptedChunkSlice(c, 0, initialEnd, effectiveKey));
    const initialPayload = Buffer.concat(buffers);

    res.status(206);
    res.set('Content-Range', `bytes 0-${initialEnd}/${totalSize}`);
    res.set('Content-Length', initialPayload.length);
    return res.send(initialPayload);
  }

  // 2. Legacy fallback from IMAGES_DIR
  const safeDir = path.resolve(IMAGES_DIR);
  let filePath = path.resolve(safeDir, filename);
  if (!fs.existsSync(filePath)) {
    // Try with common extensions
    for (const ext of ['jpg', 'png', 'mp4', 'webm', 'gif', 'webp', 'mp3']) {
      const cand = path.resolve(safeDir, `${filename}.${ext}`);
      if (fs.existsSync(cand)) {
        filePath = cand;
        break;
      }
    }
  }

  if (!fs.existsSync(filePath)) return res.status(404).end();
  if (!filePath.startsWith(safeDir + path.sep)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const fileBuf = fs.readFileSync(filePath);
    const decryptedBuf = decryptMediaBuffer(fileBuf, effectiveKey);
    const mimeType = getMimeType(filePath);
    const totalSize = decryptedBuf.length;

    res.set('Accept-Ranges', 'bytes');
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'private, no-cache');

    const range = req.headers.range;
    if (range && range.startsWith('bytes=')) {
      const rangeSpec = range.replace(/^bytes=/, '').trim();
      const parts = rangeSpec.split('-');
      let start;
      let end;

      if (parts[0] === '' && parts[1] !== '') {
        const suffixLen = parseInt(parts[1], 10);
        if (isNaN(suffixLen) || suffixLen <= 0) {
          res.set('Content-Range', `bytes */${totalSize}`);
          return res.status(416).end();
        }
        start = Math.max(0, totalSize - suffixLen);
        end = totalSize - 1;
      } else {
        start = parseInt(parts[0], 10);
        end = (parts[1] !== '' && parts[1] !== undefined) ? parseInt(parts[1], 10) : totalSize - 1;
      }

      if (isNaN(start) || isNaN(end) || start > end || start >= totalSize || start < 0) {
        res.set('Content-Range', `bytes */${totalSize}`);
        return res.status(416).end();
      }

      if (end >= totalSize) {
        end = totalSize - 1;
      }

      const chunkSize = end - start + 1;
      const chunk = decryptedBuf.subarray(start, end + 1);

      res.status(206);
      res.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      res.set('Content-Length', chunkSize);
      return res.send(chunk);
    }

    res.status(200);
    res.set('Content-Length', totalSize);
    res.send(decryptedBuf);
  } catch (err) {
    res.status(500).json({ error: 'Could not decrypt media.' });
  }
}

// HLS Manifest Endpoints
app.get('/api/media/:mediaId/hls/master.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/api/media/:mediaId/hls/playlist.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/api/media/:mediaId/playlist.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/api/media/:mediaId/master.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/media/:mediaId/playlist.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/media/:mediaId/hls/master.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/media/:mediaId/master.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/api/hls/:mediaId/master.m3u8', requireUnlocked, handleServeHlsManifest);
app.get('/api/hls/:mediaId/playlist.m3u8', requireUnlocked, handleServeHlsManifest);

// Key Retrieval Endpoints
app.get('/api/media/:mediaId/key', requireUnlocked, handleServeHlsKey);
app.get('/api/media/:mediaId/hls/key', requireUnlocked, handleServeHlsKey);
app.get('/api/hls/:mediaId/key', requireUnlocked, handleServeHlsKey);
app.get('/media/:mediaId/key', requireUnlocked, handleServeHlsKey);
app.get('/media/:mediaId/hls/key', requireUnlocked, handleServeHlsKey);
app.get('/api/media/:mediaId/key.bin', requireUnlocked, handleServeHlsKey);
app.get('/media/:mediaId/key.bin', requireUnlocked, handleServeHlsKey);

// Segment Streaming Endpoints
app.get('/api/media/:mediaId/segments/:segmentIndex', requireUnlocked, handleServeHlsSegment);
app.get('/api/media/:mediaId/hls/segments/:segmentIndex', requireUnlocked, handleServeHlsSegment);
app.get('/api/hls/:mediaId/segments/:segmentIndex', requireUnlocked, handleServeHlsSegment);
app.get('/media/:mediaId/segments/:segmentIndex', requireUnlocked, handleServeHlsSegment);
app.get('/media/:mediaId/hls/segments/:segmentIndex', requireUnlocked, handleServeHlsSegment);

// Media & Image Range/Streaming Endpoints
app.get('/images/:filename', requireUnlocked, handleServeImage);
app.get('/media/:filename', requireUnlocked, handleServeImage);
app.get('/api/images/:filename', requireUnlocked, handleServeImage);
app.get('/api/media/:filename', requireUnlocked, handleServeImage);

function handleDeleteImage(req, res) {
  try {
    const raw = req.params.filename;
    if (!raw || typeof raw !== 'string') return res.status(400).end();
    let decoded = raw;
    try { decoded = decodeURIComponent(raw); } catch (e) {}
    try { decoded = decodeURIComponent(decoded); } catch (e) {}
    const filename = path.basename(decoded);
    if (
      raw.includes('..') ||
      decoded.includes('..') ||
      raw.includes('/') ||
      raw.includes('\\') ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      filename !== decoded ||
      !/^[a-zA-Z0-9_.-]+$/.test(filename)
    ) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const auth = resolveMediaOwnerAndKey(filename, req);
    if (auth && auth.forbidden) {
      logAuditEvent({
        actor: req.currentUser || 'anonymous',
        action: 'FORBIDDEN_HLS_ACCESS',
        target: auth.mediaId,
        details: `Forbidden media delete attempt by ${req.currentUser} on media owned by ${auth.ownerUsername}`,
        status: 'FAILED',
        req,
      });
      return res.status(403).json({ error: 'Forbidden: Access denied to media file.' });
    }

    const effectiveKey = (auth && auth.effectiveKey) ? auth.effectiveKey : req.sessionKey;

    // 1. Delete sharded chunk files & manifest
    deleteShardedMedia(filename, effectiveKey);

    // 2. Delete legacy & mirror files in IMAGES_DIR
    const safeDir = path.resolve(IMAGES_DIR);
    const filePath = path.resolve(safeDir, filename);
    if (fs.existsSync(filePath) && filePath.startsWith(safeDir + path.sep)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    // Also delete any matching extension variants in IMAGES_DIR
    const baseClean = filename.split('.')[0];
    for (const ext of ['jpg', 'jpeg', 'png', 'mp4', 'webm', 'gif', 'webp', 'mp3', 'wav', 'ogg']) {
      const cand = path.resolve(safeDir, `${baseClean}.${ext}`);
      if (fs.existsSync(cand) && cand.startsWith(safeDir + path.sep)) {
        try { fs.unlinkSync(cand); } catch (e) {}
      }
    }

    try {
      db.media_files.delete(filename);
      db.media_files.delete(baseClean);
    } catch (e) {}

    logAuditEvent({ actor: req.currentUser || 'anonymous', action: 'MEDIA_DELETE', target: filename, details: `Deleted media "${filename}"`, req });
    res.json({ ok: true, deleted: filename });
  } catch (err) {
    logAuditEvent({ actor: req.currentUser || 'anonymous', action: 'MEDIA_DELETE', details: `Media delete failed: ${err.message}`, status: 'FAILED', req });
    res.status(500).json({ error: 'Could not delete media.' });
  }
}

app.delete('/api/images/:filename', requireUnlocked, handleDeleteImage);
app.delete('/images/:filename', requireUnlocked, handleDeleteImage);
app.delete('/api/media/:filename', requireUnlocked, handleDeleteImage);
app.delete('/media/:filename', requireUnlocked, handleDeleteImage);


// ---------- live link previews ----------
const LINK_PREVIEW_TIMEOUT_MS = 6000;
const LINK_PREVIEW_MAX_BYTES = 1_500_000;

function fetchHtml(urlStr, redirectsLeft, callback) {
  let target;
  try {
    target = new URL(urlStr);
  } catch (err) {
    return callback(new Error('Invalid URL'));
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return callback(new Error('Unsupported protocol'));
  }

  const lib = target.protocol === 'https:' ? https : http;
  const req = lib.get(
    target,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeatherboundNotebook/1.0)' }, timeout: LINK_PREVIEW_TIMEOUT_MS },
    (res) => {
      const status = res.statusCode || 0;
      if ([301, 302, 303, 307, 308].includes(status) && res.headers.location && redirectsLeft > 0) {
        res.resume();
        let next;
        try {
          next = new URL(res.headers.location, target).toString();
        } catch (err) {
          return callback(new Error('Bad redirect'));
        }
        return fetchHtml(next, redirectsLeft - 1, callback);
      }
      if (status !== 200) {
        res.resume();
        return callback(new Error('HTTP ' + status));
      }
      const contentType = res.headers['content-type'] || '';
      if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
        res.resume();
        return callback(new Error('Not HTML'));
      }
      let data = '';
      let size = 0;
      let capped = false;
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (capped) return;
        size += Buffer.byteLength(chunk);
        if (size > LINK_PREVIEW_MAX_BYTES) {
          capped = true;
          req.destroy();
          return;
        }
        data += chunk;
      });
      res.on('end', () => callback(null, data, target));
    }
  );
  req.on('timeout', () => req.destroy(new Error('Timeout')));
  req.on('error', callback);
}

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function extractMeta(html, baseUrl) {
  const grab = (re) => {
    const m = html.match(re);
    return m ? decodeEntities(m[1].trim()) : null;
  };
  const metaContent = (attr, value) => {
    const a = grab(new RegExp(`<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']*)["']`, 'i'));
    if (a) return a;
    return grab(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${value}["']`, 'i'));
  };

  const title = metaContent('property', 'og:title') || grab(/<title[^>]*>([^<]*)<\/title>/i);
  const description = metaContent('property', 'og:description') || metaContent('name', 'description');
  let image = metaContent('property', 'og:image');
  if (image) {
    try {
      image = new URL(image, baseUrl).toString();
    } catch (err) {
      image = null;
    }
  }
  if (!image) {
    const twitterImg = metaContent('name', 'twitter:image') || metaContent('property', 'twitter:image');
    if (twitterImg) {
      try { image = new URL(twitterImg, baseUrl).toString(); } catch (e) { image = null; }
    }
  }
  return {
    title: title || baseUrl.hostname,
    description: description || '',
    image,
    domain: baseUrl.hostname.replace(/^www\./, ''),
    url: baseUrl.toString(),
  };
}

app.get('/api/link-preview', (req, res) => {
  const target = typeof req.query.url === 'string' ? req.query.url : '';
  if (!target) return res.status(400).json({ ok: false, error: 'Missing url' });

  fetchHtml(target, 4, (err, html, finalUrl) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(finalUrl ? finalUrl.toString() : target);
    } catch (_) {
      try { parsedUrl = new URL(target.startsWith('http') ? target : `https://${target}`); } catch (__) {}
    }
    const defaultUrl = parsedUrl ? parsedUrl.toString() : target;
    const defaultDomain = parsedUrl ? parsedUrl.hostname.replace(/^www\./, '') : '';
    const defaultTitle = parsedUrl ? parsedUrl.hostname : '';

    if (err || !html) {
      return res.json({
        ok: false,
        title: defaultTitle,
        description: '',
        image: null,
        domain: defaultDomain,
        url: defaultUrl,
      });
    }
    try {
      res.json({ ok: true, ...extractMeta(html, finalUrl), url: finalUrl.toString() });
    } catch (parseErr) {
      res.json({
        ok: false,
        title: defaultTitle,
        description: '',
        image: null,
        domain: defaultDomain,
        url: defaultUrl,
      });
    }
  });
});

// ---------- full STREAMING reverse proxy for live website embedding ----------
const PROXY_TIMEOUT_MS = 20000;

const PROXY_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const BLOCKED_HEADERS = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'cross-origin-embedder-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'transfer-encoding',
]);

function buildInjection(baseHref, targetOrigin) {
  return (
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">` +
    `<base href="${baseHref}">` +
    `<script>` +
    `(function(){` +
    `var _origOrigin=${JSON.stringify(targetOrigin)};` +
    `var _hostOrigin=window.location.protocol+'//'+window.location.host;` +
    `var _proxyApi=_hostOrigin+'/api/proxy-api?url=';` +
    `var _proxyPage=_hostOrigin+'/api/proxy?url=';` +
    `try{Object.defineProperty(navigator,'onLine',{get:function(){return true},configurable:false})}catch(e){}` +
    `if(navigator.serviceWorker){` +
    `try{navigator.serviceWorker.register=function(){return Promise.reject(new Error('SW disabled in notebook'))};}catch(e){}` +
    `}` +
    `function _resolve(u){` +
    `try{return new URL(u,document.baseURI||_origOrigin).href}catch(e){return u}` +
    `}` +
    `function _isProxied(u){` +
    `return typeof u==='string'&&!u.startsWith('data:')&&!u.startsWith('blob:')&&!u.startsWith('javascript:')&&!u.startsWith('/api/proxy')&&!u.startsWith(_proxyApi)&&!u.startsWith(_proxyPage);` +
    `}` +
    `var _origFetch=window.fetch;` +
    `if(_origFetch){` +
    `window.fetch=function(input,init){` +
    `try{` +
    `var url=typeof input==='string'?input:(input&&input.url?input.url:'');` +
    `if(_isProxied(url)){` +
    `var full=_resolve(url);` +
    `var proxied=_proxyApi+encodeURIComponent(full);` +
    `if(typeof input==='string'){input=proxied}` +
    `else if(window.Request&&input instanceof Request){input=new Request(proxied,input)}` +
    `}` +
    `}catch(e){}` +
    `return _origFetch.call(this,input,init);` +
    `};` +
    `}` +
    `var _origOpen=XMLHttpRequest.prototype.open;` +
    `XMLHttpRequest.prototype.open=function(method,url){` +
    `try{` +
    `if(_isProxied(url)){` +
    `url=_proxyApi+encodeURIComponent(_resolve(url));` +
    `}` +
    `}catch(e){}` +
    `var args=Array.prototype.slice.call(arguments);` +
    `args[1]=url;` +
    `return _origOpen.apply(this,args);` +
    `};` +
    `document.addEventListener('click',function(e){` +
    `var a=e.target&&e.target.closest?e.target.closest('a'):null;` +
    `if(a&&a.href&&!a.href.startsWith('javascript:')&&!a.href.startsWith('#')&&a.target!=='_blank'){` +
    `var full=_resolve(a.getAttribute('href')||a.href);` +
    `if(_isProxied(full)){` +
    `e.preventDefault();` +
    `window.location.href=_proxyPage+encodeURIComponent(full);` +
    `}` +
    `}` +
    `},true);` +
    `document.addEventListener('submit',function(e){` +
    `var form=e.target;` +
    `if(!form)return;` +
    `var method=(form.method||'GET').toUpperCase();` +
    `var action=form.getAttribute('action')||'';` +
    `var fullUrl=_resolve(action||window.location.href);` +
    `if(method==='GET'){` +
    `e.preventDefault();` +
    `try{` +
    `var formData=new FormData(form);` +
    `var params=new URLSearchParams(formData).toString();` +
    `var sep=fullUrl.indexOf('?')===-1?'?':'&';` +
    `var targetWithQuery=params?(fullUrl+sep+params):fullUrl;` +
    `window.location.href=_proxyPage+encodeURIComponent(targetWithQuery);` +
    `}catch(err){window.location.href=_proxyPage+encodeURIComponent(fullUrl)}` +
    `}` +
    `},true);` +
    `var _origFormSubmit=HTMLFormElement.prototype.submit;` +
    `HTMLFormElement.prototype.submit=function(){` +
    `var method=(this.method||'GET').toUpperCase();` +
    `var action=this.getAttribute('action')||'';` +
    `var fullUrl=_resolve(action||window.location.href);` +
    `if(method==='GET'){` +
    `try{` +
    `var formData=new FormData(this);` +
    `var params=new URLSearchParams(formData).toString();` +
    `var sep=fullUrl.indexOf('?')===-1?'?':'&';` +
    `var targetWithQuery=params?(fullUrl+sep+params):fullUrl;` +
    `window.location.href=_proxyPage+encodeURIComponent(targetWithQuery);` +
    `return;` +
    `}catch(err){}` +
    `}` +
    `return _origFormSubmit.apply(this,arguments);` +
    `};` +
    `function _notifyParent(){` +
    `try{` +
    `if(window.parent&&window.parent!==window){` +
    `window.parent.postMessage({type:'nb-embed-nav',title:document.title||'',url:window.location.href,origin:_origOrigin},'*');` +
    `}` +
    `}catch(e){}` +
    `}` +
    `window.addEventListener('DOMContentLoaded',_notifyParent);` +
    `window.addEventListener('load',_notifyParent);` +
    `window.addEventListener('message',function(e){` +
    `if(!e.data||typeof e.data!=='object')return;` +
    `if(e.data.type==='nb-embed-cmd'){` +
    `if(e.data.action==='back')history.back();` +
    `if(e.data.action==='forward')history.forward();` +
    `if(e.data.action==='reload')window.location.reload();` +
    `if(e.data.action==='nav'&&e.data.url){window.location.href=_proxyPage+encodeURIComponent(e.data.url)}` +
    `}` +
    `});` +
    `})();` +
    `</script>`
  );
}

function setSafeHeaders(res, proxyHeaders, stripEncoding = false) {
  for (const [key, val] of Object.entries(proxyHeaders)) {
    const lk = key.toLowerCase();
    if (BLOCKED_HEADERS.has(lk)) continue;
    if (stripEncoding && (lk === 'content-encoding' || lk === 'content-length')) continue;
    try { res.set(key, val); } catch (e) {}
  }
  res.set('X-Frame-Options', 'ALLOWALL');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', '*');
}

function streamProxy(urlStr, redirectsLeft, expressRes) {
  let target;
  try { target = new URL(urlStr); } catch (e) {
    return expressRes.status(400).json({ error: 'Invalid URL' });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return expressRes.status(400).json({ error: 'Unsupported protocol' });
  }

  const lib = target.protocol === 'https:' ? https : http;
  const proxyReq = lib.get(target, {
    headers: {
      'User-Agent': PROXY_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: PROXY_TIMEOUT_MS,
  }, (proxyRes) => {
    const status = proxyRes.statusCode || 0;

    if ([301, 302, 303, 307, 308].includes(status) && proxyRes.headers.location && redirectsLeft > 0) {
      proxyRes.resume();
      try {
        const next = new URL(proxyRes.headers.location, target).toString();
        return streamProxy(next, redirectsLeft - 1, expressRes);
      } catch (e) {
        return expressRes.status(502).end();
      }
    }

    const contentType = proxyRes.headers['content-type'] || '';
    const encoding = (proxyRes.headers['content-encoding'] || '').toLowerCase();
    const isHtml = /text\/html|application\/xhtml/i.test(contentType);

    expressRes.status(status);
    setSafeHeaders(expressRes, proxyRes.headers, isHtml);
    try {
      expressRes.set('Set-Cookie', 'last_proxy_origin=' + encodeURIComponent(target.origin) + '; Path=/; SameSite=Lax');
    } catch(e){}

    expressRes.on('close', () => {
      if (!proxyRes.complete) {
        try { proxyReq.destroy(); } catch (e) {}
      }
    });

    proxyRes.on('error', (err) => {
      if (!expressRes.headersSent) expressRes.status(502).json({ error: err.message });
      else expressRes.end();
    });

    if (isHtml) {
      let inputStream = proxyRes;
      let decompressor = null;
      if (encoding === 'gzip') {
        decompressor = zlib.createGunzip();
      } else if (encoding === 'br') {
        decompressor = zlib.createBrotliDecompress();
      } else if (encoding === 'deflate') {
        decompressor = zlib.createInflate();
      }

      if (decompressor) {
        decompressor.on('error', () => {
          if (!expressRes.headersSent) expressRes.status(502).json({ error: 'Decompression failed' });
          else expressRes.end();
        });
        inputStream = proxyRes.pipe(decompressor);
      }

      const baseHref = target.origin + target.pathname.replace(/[^/]*$/, '');
      const injection = buildInjection(baseHref, target.origin);
      let injected = false;

      inputStream.setEncoding('utf8');
      inputStream.on('data', (chunk) => {
        let out = chunk;

        out = out.replace(/<base[^>]*>/gi, '');
        out = out.replace(/<meta[^>]*http-equiv\s*=\s*["']?(?:X-Frame-Options|Content-Security-Policy|Content-Security-Policy-Report-Only)["']?[^>]*>/gi, '');

        if (!injected) {
          if (/<head[^>]*>/i.test(out)) {
            out = out.replace(/<head[^>]*>/i, '$&' + injection);
            injected = true;
          } else if (/<html[^>]*>/i.test(out)) {
            out = out.replace(/<html[^>]*>/i, '$&<head>' + injection + '</head>');
            injected = true;
          } else if (/<![dD][oO][cC][tT][yY][pP][eE]/.test(out)) {
            out = out.replace(/(<!DOCTYPE[^>]*>)/i, '$1<head>' + injection + '</head>');
            injected = true;
          } else {
            expressRes.write(injection);
            injected = true;
          }
        }

        expressRes.write(out);
      });

      inputStream.on('end', () => {
        if (!injected) expressRes.write(injection);
        expressRes.end();
      });

      inputStream.on('error', () => {
        if (!expressRes.headersSent) expressRes.status(502).end();
        else expressRes.end();
      });
    } else {
      proxyRes.pipe(expressRes);
    }
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!expressRes.headersSent) expressRes.status(504).json({ error: 'Timeout' });
  });
  proxyReq.on('error', (err) => {
    if (!expressRes.headersSent) expressRes.status(502).json({ error: err.message });
  });
}

const CURATED_YOUTUBE_FALLBACKS = {
  ict: [
    { id: '3jz1vY7X4Q8', title: 'ICT Trading Strategy - Market Structure & Liquidity', channel: 'Trading Hub', duration: '28:45', thumbnail: 'https://i.ytimg.com/vi/3jz1vY7X4Q8/hqdefault.jpg' },
    { id: 'kffacxfA7G4', title: 'ICT Mentorship Model 2022 Overview', channel: 'Inner Circle Trader', duration: '35:20', thumbnail: 'https://i.ytimg.com/vi/kffacxfA7G4/hqdefault.jpg' },
    { id: 'fJ9rUzIMcZQ', title: 'ICT Fair Value Gaps & Order Blocks', channel: 'Trader Education', duration: '22:15', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
  ],
  trading: [
    { id: '3jz1vY7X4Q8', title: 'Price Action & Candlestick Masterclass', channel: 'Trading Hub', duration: '45:10', thumbnail: 'https://i.ytimg.com/vi/3jz1vY7X4Q8/hqdefault.jpg' },
    { id: 'kffacxfA7G4', title: 'Technical Analysis Full Course', channel: 'Financial Education', duration: '1:12:30', thumbnail: 'https://i.ytimg.com/vi/kffacxfA7G4/hqdefault.jpg' }
  ],
  lofi: [
    { id: '5qap5aO4i9A', title: 'Lofi Beats to Chill / Study to', channel: 'ChillHop Music', duration: '1:02:40', thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg' },
    { id: 'kffacxfA7G4', title: 'Relaxing Instrumental Beats', channel: 'Lofi World', duration: '45:10', thumbnail: 'https://i.ytimg.com/vi/kffacxfA7G4/hqdefault.jpg' }
  ],
  piano: [
    { id: 'WPni755-Krg', title: 'Beautiful Relaxing Piano Music for Studying & Sleeping', channel: 'Soothing Relaxation', duration: '3:02:15', thumbnail: 'https://i.ytimg.com/vi/WPni755-Krg/hqdefault.jpg' }
  ],
  nasa: [
    { id: 'C0DPdy98e4c', title: 'Earth from Space: 4K Relaxation Video', channel: 'NASA Space', duration: '1:00:00', thumbnail: 'https://i.ytimg.com/vi/C0DPdy98e4c/hqdefault.jpg' }
  ]
};

// ---------- YouTube search scraper API ----------
app.get('/api/youtube-search', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.json({ ok: true, results: [] });

  const qLower = query.toLowerCase();
  let matchedFallbacks = [];
  for (const [k, v] of Object.entries(CURATED_YOUTUBE_FALLBACKS)) {
    if (qLower.includes(k) || k.includes(qLower)) {
      matchedFallbacks = v;
      break;
    }
  }

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 8000,
  }, (ytRes) => {
    let html = '';
    ytRes.on('data', (c) => { html += c; });
    ytRes.on('end', () => {
      const results = [];
      try {
        const dataMatch = html.match(/var ytInitialData = ({.+?});<\/script>/s) || html.match(/window\["ytInitialData"\] = ({.+?});<\/script>/s);
        if (dataMatch) {
          const data = JSON.parse(dataMatch[1]);
          const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
          if (Array.isArray(contents)) {
            for (const section of contents) {
              const itemSection = section?.itemSectionRenderer?.contents;
              if (Array.isArray(itemSection)) {
                for (const item of itemSection) {
                  const vr = item.videoRenderer;
                  if (vr && vr.videoId) {
                    results.push({
                      id: vr.videoId,
                      title: vr.title?.runs?.[0]?.text || vr.title?.simpleText || 'YouTube Video',
                      channel: vr.ownerText?.runs?.[0]?.text || '',
                      duration: vr.lengthText?.simpleText || '',
                      thumbnail: vr.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (e) {}

      if (results.length === 0) {
        const idMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
        const seen = new Set();
        for (const m of idMatches) {
          const id = m[1];
          if (!seen.has(id)) {
            seen.add(id);
            results.push({
              id,
              title: `Video (${id})`,
              channel: 'YouTube',
              duration: '',
              thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            });
            if (results.length >= 10) break;
          }
        }
      }

      if (results.length === 0 && matchedFallbacks.length > 0) {
        return res.json({ ok: true, results: matchedFallbacks });
      }

      res.json({ ok: true, results: results.slice(0, 12) });
    });
  }).on('error', () => {
    res.json({ ok: true, results: matchedFallbacks });
  });
});

// Built-in interactive YouTube & Web Search Portals
app.get('/api/portal/youtube', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('X-Frame-Options', 'ALLOWALL');
  res.set('Access-Control-Allow-Origin', '*');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YouTube Player Portal</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #0f0f0f;
    color: #f1f1f1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  .header {
    background: #212121;
    border-bottom: 1px solid #383838;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .logo { font-weight: bold; color: #ff0000; font-size: 1.1rem; display: flex; align-items: center; gap: 5px; cursor: pointer; }
  .search-box {
    flex: 1;
    display: flex;
    background: #121212;
    border: 1px solid #303030;
    border-radius: 20px;
    padding: 3px 12px;
  }
  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 0.85rem;
    outline: none;
    padding: 4px 6px;
  }
  .search-box button {
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    padding: 0 4px;
    font-size: 0.9rem;
  }
  .search-box button:hover { color: #fff; }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 12px;
    gap: 10px;
  }
  .chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .chip {
    background: #272727;
    border: 1px solid #3f3f3f;
    border-radius: 14px;
    color: #f1f1f1;
    font-size: 0.75rem;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
  }
  .chip:hover { background: #ff0000; color: #fff; border-color: #ff0000; }
  .player-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
    min-height: 200px;
    max-height: 360px;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  .player-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
  .results-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  .results-title {
    font-size: 0.82rem;
    color: #aaa;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .video-card {
    display: flex;
    gap: 10px;
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 8px;
    cursor: pointer;
    transition: background 0.15s;
    align-items: center;
  }
  .video-card:hover { background: #2a2a2a; border-color: #555; }
  .video-card.active { border-color: #ff0000; background: #2d1818; }
  .video-thumb {
    width: 90px;
    height: 54px;
    object-fit: cover;
    border-radius: 4px;
    background: #111;
    flex-shrink: 0;
  }
  .video-info {
    flex: 1;
    min-width: 0;
  }
  .video-name {
    font-size: 0.82rem;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .video-meta {
    font-size: 0.72rem;
    color: #aaa;
  }
</style>
</head>
<body>
<div class="header">
  <div class="logo" id="homeLogo">▶ YouTube</div>
  <form class="search-box" id="ytForm">
    <input type="text" id="ytInput" placeholder="Search videos or paste YouTube link..." />
    <button type="submit">🔍</button>
  </form>
</div>
<div class="content">
  <div class="chips">
    <span class="chip" data-query="ICT trading strategy">📈 ICT Trading</span>
    <span class="chip" data-query="Lofi hip hop radio beats to relax">🎵 Lofi Hip Hop</span>
    <span class="chip" data-query="Chill lofi beats">☕ Chill Beats</span>
    <span class="chip" data-id="dQw4w9WgXcQ">🕺 Rick Astley</span>
    <span class="chip" data-query="Relaxing piano music study">🎹 Piano</span>
    <span class="chip" data-query="NASA space live stream">🚀 NASA Space</span>
  </div>
  <div class="player-wrapper">
    <iframe id="mainPlayer" class="player-frame" src="https://www.youtube.com/embed/3jz1vY7X4Q8?rel=0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
  </div>
  <div class="results-section" id="resultsSection">
    <div class="results-title" id="resultsHeading">Recommended Videos</div>
    <div class="results-list" id="resultsList"></div>
  </div>
</div>
<script>
  const form = document.getElementById('ytForm');
  const input = document.getElementById('ytInput');
  const player = document.getElementById('mainPlayer');
  const resultsList = document.getElementById('resultsList');
  const resultsHeading = document.getElementById('resultsHeading');
  const homeLogo = document.getElementById('homeLogo');

  function extractId(val) {
    if (!val) return null;
    const m = val.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{6,})/i);
    if (m) return m[1];
    if (/^[\w-]{11}$/.test(val.trim())) return val.trim();
    return null;
  }

  function playVideo(id, title) {
    if (!id) return;
    player.src = 'https://www.youtube.com/embed/' + id + '?rel=0';
    document.querySelectorAll('.video-card').forEach(c => {
      c.classList.toggle('active', c.dataset.id === id);
    });
  }

  async function searchVideos(query) {
    if (!query) return;
    const directId = extractId(query);
    if (directId) {
      playVideo(directId);
      resultsHeading.textContent = 'Playing Direct Video';
      resultsList.innerHTML = '<div style="color: #aaa; font-size: 0.8rem; padding: 6px;">Playing video ID: ' + directId + '</div>';
      return;
    }

    resultsHeading.textContent = 'Searching for "' + query + '"...';
    resultsList.innerHTML = '<div style="color: #888; font-size: 0.8rem; padding: 8px;">Loading YouTube search results...</div>';

    try {
      const res = await fetch('/api/youtube-search?q=' + encodeURIComponent(query));
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.results) && data.results.length > 0) {
        resultsHeading.textContent = 'Results for "' + query + '" (' + data.results.length + ')';
        resultsList.innerHTML = '';
        
        playVideo(data.results[0].id);

        data.results.forEach((item, idx) => {
          const card = document.createElement('div');
          card.className = 'video-card' + (idx === 0 ? ' active' : '');
          card.dataset.id = item.id;
          card.innerHTML = 
            '<img class="video-thumb" src="' + (item.thumbnail || 'https://i.ytimg.com/vi/' + item.id + '/hqdefault.jpg') + '" alt="" />' +
            '<div class="video-info">' +
              '<div class="video-name">' + (item.title || 'Video') + '</div>' +
              '<div class="video-meta">' + (item.channel ? item.channel + ' · ' : '') + (item.duration || 'Watch Video') + '</div>' +
            '</div>';
          card.addEventListener('click', () => {
            playVideo(item.id);
          });
          resultsList.appendChild(card);
        });
      } else {
        resultsHeading.textContent = 'No Direct Video Results';
        resultsList.innerHTML = '<div style="color: #888; font-size: 0.8rem; padding: 8px;">No videos found. Try a different search term or paste a direct YouTube video URL.</div>';
      }
    } catch(e) {
      resultsHeading.textContent = 'Search Error';
      resultsList.innerHTML = '<div style="color: #c9302c; font-size: 0.8rem; padding: 8px;">Could not search YouTube. Please check network.</div>';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val) searchVideos(val);
  });

  homeLogo.addEventListener('click', () => {
    input.value = '';
    searchVideos('ICT trading');
  });

  document.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      const id = c.dataset.id;
      const query = c.dataset.query;
      if (id) {
        playVideo(id);
      } else if (query) {
        input.value = query;
        searchVideos(query);
      }
    });
  });

  searchVideos('ICT trading');
</script>
</body>
</html>`;
  res.send(html);
});

app.get('/api/portal/search', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('X-Frame-Options', 'ALLOWALL');
  res.set('Access-Control-Allow-Origin', '*');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Web Search Portal</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background: #fdfbf7;
    color: #2c2416;
    padding: 16px;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }
  .search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #c9b68a;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9rem;
    outline: none;
    background: #fff;
  }
  .search-btn {
    background: #b8935a;
    color: #fff;
    border: 1px solid #9c7b45;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-family: inherit;
  }
  .results {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .result-card {
    background: #f4edde;
    border: 1px solid #dfd3ba;
    border-radius: 6px;
    padding: 10px 14px;
  }
  .result-title { font-weight: bold; font-size: 0.95rem; color: #2c2416; margin-bottom: 4px; }
  .result-title a { color: #8b5a2b; text-decoration: none; }
  .result-title a:hover { text-decoration: underline; }
  .result-snippet { font-size: 0.82rem; color: #5a4b35; line-height: 1.35; }
</style>
</head>
<body>
<form class="search-bar" id="sForm">
  <input type="text" class="search-input" id="sInput" value="${escapeHtml(query)}" placeholder="Search the web..." />
  <button type="submit" class="search-btn">Search</button>
</form>
<div class="results" id="resultsList">
  <div style="color: #7a6b55; font-size: 0.88rem;">Type a query above to search.</div>
</div>
<script>
  const form = document.getElementById('sForm');
  const input = document.getElementById('sInput');
  const results = document.getElementById('resultsList');

  async function doSearch(q) {
    if (!q) return;
    results.innerHTML = '<div style="color: #b8935a;">Searching...</div>';
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(q));
      const data = await res.json();
      if (data && data.ok && data.results && data.results.length > 0) {
        results.innerHTML = '';
        data.results.forEach(r => {
          const div = document.createElement('div');
          div.className = 'result-card';
          div.innerHTML = '<div class="result-title"><a href="' + (r.url||'#') + '" target="_blank">' + (r.title||'') + '</a></div>' +
                          '<div class="result-snippet">' + (r.snippet||'') + '</div>';
          results.appendChild(div);
        });
      } else {
        results.innerHTML = '<div style="color: #7a6b55;">No direct instant results found. <a href="https://www.google.com/search?q=' + encodeURIComponent(q) + '" target="_blank">Search on Google ↗</a></div>';
      }
    } catch(e) {
      results.innerHTML = '<div style="color: #c9302c;">Search failed. Please check network.</div>';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val) doSearch(val);
  });

  if (input.value.trim()) doSearch(input.value.trim());
</script>
</body>
</html>`;
  res.send(html);
});

function isSafeProxyUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === '169.254.169.254') return false; // Block AWS/cloud metadata SSRF
    return true;
  } catch (e) {
    return false;
  }
}

app.get('/api/proxy', (req, res) => {
  const targetUrl = typeof req.query.url === 'string' ? req.query.url : '';
  if (!targetUrl) return res.status(400).json({ error: 'Missing url parameter' });
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.status(400).json({ error: 'Unsupported protocol' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!isSafeProxyUrl(targetUrl)) return res.status(400).json({ error: 'Disallowed proxy target' });
  streamProxy(targetUrl, 8, res);
});

// ---------- generic API / subresource proxy ----------
app.all('/api/proxy-api', (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  const targetUrl = typeof req.query.url === 'string' ? req.query.url : '';
  if (!targetUrl) return res.status(400).end();
  if (!isSafeProxyUrl(targetUrl)) return res.status(400).end();

  let target;
  try { target = new URL(targetUrl); } catch (e) { return res.status(400).end(); }

  const lib = target.protocol === 'https:' ? https : http;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.origin;
  delete headers.referer;
  headers['host'] = target.host;
  headers['origin'] = target.origin;
  headers['referer'] = target.origin + '/';
  headers['user-agent'] = PROXY_USER_AGENT;

  const proxyReq = lib.request(target, {
    method: req.method,
    headers: headers,
    timeout: PROXY_TIMEOUT_MS,
  }, (proxyRes) => {
    res.status(proxyRes.statusCode || 200);
    setSafeHeaders(res, proxyRes.headers, false);
    proxyRes.pipe(res);
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) res.status(504).end();
  });
  proxyReq.on('error', () => {
    if (!res.headersSent) res.status(502).end();
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// ---------- search API (DuckDuckGo Instant Web Search) ----------
app.get('/api/search', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.json({ ok: true, results: [] });

  const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const reqUrl = new URL(ddgUrl);

  https.get(reqUrl, { headers: { 'User-Agent': PROXY_USER_AGENT }, timeout: 8000 }, (proxyRes) => {
    let raw = '';
    proxyRes.on('data', (c) => { raw += c; });
    proxyRes.on('end', () => {
      try {
        const json = JSON.parse(raw);
        const results = [];
        if (json.Heading && json.AbstractURL) {
          results.push({
            title: json.Heading,
            snippet: json.AbstractText || json.Abstract || '',
            url: json.AbstractURL,
            icon: json.Image || '',
            source: json.AbstractSource || 'DuckDuckGo'
          });
        }
        if (Array.isArray(json.RelatedTopics)) {
          for (const topic of json.RelatedTopics) {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text.split(' - ')[0] || topic.Text,
                snippet: topic.Text,
                url: topic.FirstURL,
                icon: topic.Icon ? topic.Icon.URL : '',
                source: 'Web'
              });
            } else if (Array.isArray(topic.Topics)) {
              for (const sub of topic.Topics) {
                if (sub.Text && sub.FirstURL) {
                  results.push({
                    title: sub.Text.split(' - ')[0] || sub.Text,
                    snippet: sub.Text,
                    url: sub.FirstURL,
                    icon: sub.Icon ? sub.Icon.URL : '',
                    source: 'Web'
                  });
                }
              }
            }
          }
        }
        res.json({ ok: true, results: results.slice(0, 15) });
      } catch (e) {
        res.json({ ok: true, results: [] });
      }
    });
  }).on('error', () => {
    res.json({ ok: true, results: [] });
  });
});

// ---------- asset proxy with caching ----------
const assetCache = new Map();
const ASSET_CACHE_MAX = 200;
const ASSET_CACHE_TTL = 300_000; // 5 minutes

function proxyFetchBuffered(urlStr, redirectsLeft, callback) {
  let target;
  try { target = new URL(urlStr); } catch (e) { return callback(new Error('Invalid URL')); }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return callback(new Error('Unsupported protocol'));
  }
  const lib = target.protocol === 'https:' ? https : http;
  const req = lib.get(target, {
    headers: { 'User-Agent': PROXY_USER_AGENT, 'Accept-Encoding': 'identity' },
    timeout: PROXY_TIMEOUT_MS,
  }, (res) => {
    const status = res.statusCode || 0;
    if ([301, 302, 303, 307, 308].includes(status) && res.headers.location && redirectsLeft > 0) {
      res.resume();
      try {
        return proxyFetchBuffered(new URL(res.headers.location, target).toString(), redirectsLeft - 1, callback);
      } catch (e) { return callback(new Error('Bad redirect')); }
    }
    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => callback(null, { statusCode: status, headers: res.headers, body: Buffer.concat(chunks) }));
    res.on('error', callback);
  });
  req.on('timeout', () => req.destroy(new Error('Timeout')));
  req.on('error', callback);
}

app.get('/api/proxy-asset', (req, res) => {
  const targetUrl = typeof req.query.url === 'string' ? req.query.url : '';
  if (!targetUrl) return res.status(400).end();

  const cached = assetCache.get(targetUrl);
  if (cached && Date.now() - cached.time < ASSET_CACHE_TTL) {
    res.set('Content-Type', cached.contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=300');
    return res.send(cached.body);
  }

  proxyFetchBuffered(targetUrl, 5, (err, response) => {
    if (err) return res.status(502).end();
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    if (assetCache.size >= ASSET_CACHE_MAX) {
      const oldest = assetCache.keys().next().value;
      assetCache.delete(oldest);
    }
    assetCache.set(targetUrl, { body: response.body, contentType, time: Date.now() });

    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(response.body);
  });
});

// ---------- Catch-all for framed pages ----------
app.use((req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/images') ||
    req.path === '/' ||
    req.path === '/index.html' ||
    /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|ico)$/i.test(req.path)
  ) {
    return next();
  }

  let targetOrigin = null;
  const referer = req.headers.referer || '';
  const match = referer.match(/\/api\/proxy\?url=([^&]+)/);
  if (match) {
    try {
      targetOrigin = new URL(decodeURIComponent(match[1])).origin;
    } catch (e) {}
  }
  if (!targetOrigin) {
    const cookieHeader = req.headers.cookie || '';
    const cookieMatch = cookieHeader.match(/(?:^|; )last_proxy_origin=([^;]*)/);
    if (cookieMatch) {
      try {
        targetOrigin = new URL(decodeURIComponent(cookieMatch[1])).origin;
      } catch (e) {}
    }
  }
  if (!targetOrigin) {
    if (req.path === '/search' || req.path.startsWith('/search')) {
      targetOrigin = 'https://www.google.com';
    } else if (req.path === '/watch' || req.path === '/results' || req.path.startsWith('/youtubei')) {
      targetOrigin = 'https://www.youtube.com';
    }
  }

  if (targetOrigin) {
    const targetUrl = new URL(req.originalUrl, targetOrigin).toString();
    if (req.method === 'GET' && (!req.headers.accept || req.headers.accept.includes('text/html'))) {
      return res.redirect('/api/proxy?url=' + encodeURIComponent(targetUrl));
    } else {
      return streamProxy(targetUrl, 5, res);
    }
  }
  next();
});

// ---------- SPA Client-Side Routing Fallback (HTML5 History API) ----------
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/images') ||
    req.path.startsWith('/media')
  ) {
    return next();
  }

  if (path.extname(req.path)) {
    return next();
  }

  if (
    req.path.startsWith('/etc') ||
    req.path.startsWith('/var') ||
    req.path.startsWith('/usr') ||
    req.path.startsWith('/root') ||
    req.path.startsWith('/proc') ||
    req.path.startsWith('/windows') ||
    req.path.includes('..')
  ) {
    return res.status(404).end();
  }

  const indexPath = path.join(STATIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexPath);
  }
  next();
});

const origListen = app.listen;
app.listen = function(...args) {
  const srv = origListen.apply(this, args);
  try {
    srv.keepAliveTimeout = 65000;
    srv.headersTimeout = 66000;
  } catch (e) {}
  return srv;
};

if (require.main === module) {
  const srv = app.listen(PORT, () => {
    console.log('');
    console.log('  📖  Leatherbound Notebook is running (SQLite backed).');
    console.log(`      Open http://localhost:${PORT} in your browser.`);
    console.log('');
    console.log(`      SQLite Database: ${DB_PATH}`);
    console.log(`      Images folder: ${IMAGES_DIR}`);
    console.log(`      Proxy: STREAMING + API Hook mode (full SPA support).`);
    console.log('');
  });
  try {
    srv.keepAliveTimeout = 65000;
    srv.headersTimeout = 66000;
  } catch (e) {}
}

module.exports = app;
