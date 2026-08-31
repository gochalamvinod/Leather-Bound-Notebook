/**
 * Leatherbound Notebook — Secure OTP Generation, Verification & Rate-Limiting Engine
 *
 * Provides:
 * 1. Cryptographically secure 6-digit numeric OTP generation using crypto.randomInt.
 * 2. Salted HMAC-SHA256 storage and constant-time (timingSafeEqual) verification.
 * 3. Configurable expiration timestamps (default 10 minutes / 600s).
 * 4. Per-email resend cooldowns (default 60s) to prevent spamming.
 * 5. Multi-tier brute-force attempt limiting (default 5 attempts max per OTP).
 * 6. IP and email hourly rate limiting with automated background garbage collection.
 * 7. Verification token issuance for multi-step flows (registration, password recovery).
 */

const crypto = require('crypto');

// Configuration Defaults & Environment Overrides
const DEFAULT_OTP_LENGTH = 6;
const DEFAULT_EXPIRY_SECONDS = parseInt(process.env.OTP_EXPIRY_SECONDS, 10) || 600; // 10 minutes
const DEFAULT_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60; // 60 seconds
const COOLDOWN_TIERS = [60, 120, 180]; // Tier 1: 60s, Tier 2: 120s, Tier 3: 180s, then lockout
const MAX_RESEND_ATTEMPTS = 3; // Maximum allowed resends before lockout
const RESEND_LOCKOUT_WINDOW_MS = 60 * 60 * 1000; // 1 hour lockout window
const DEFAULT_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5; // 5 attempts
const MAX_SENDS_PER_EMAIL_PER_HOUR = parseInt(process.env.OTP_MAX_HOURLY_EMAIL_SENDS, 10) || 10;
const MAX_SENDS_PER_IP_PER_HOUR = parseInt(process.env.OTP_MAX_HOURLY_IP_SENDS, 10) || 30;
const VERIFICATION_TOKEN_EXPIRY_SECONDS = 900; // 15 minutes for verified action tokens

/**
 * In-memory stores
 */
// Key: `${normalizedEmail}:${normalizedPurpose}` -> OtpRecord
const otpRecords = new Map();

// Key: `${normalizedEmail}:${normalizedPurpose}` -> { count: number, lastRequestTime: number }
const resendTrackers = new Map();

// Key: `${normalizedEmail}` -> Array of request timestamps (epoch ms)
const emailSendTimestamps = new Map();

// Key: `${clientIp}` -> Array of request timestamps (epoch ms)
const ipSendTimestamps = new Map();

// Key: `${token}` -> { email, purpose, createdAt, expiresAt, used: boolean }
const verificationTokens = new Map();

/**
 * Validates email format strictly against RFC standard and prevents CRLF header injection.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // Disallow CRLF or null bytes (header injection prevention)
  if (/[\r\n\0\t\x00-\x1F\x7F]/.test(trimmed)) return false;
  // Standard RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Normalizes email address (trimmed, lowercase).
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Normalizes purpose string.
 * @param {string} purpose
 * @returns {string}
 */
function normalizePurpose(purpose) {
  if (!purpose || typeof purpose !== 'string') return 'login';
  return purpose.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'login';
}

/**
 * Generates a compound storage key for an email and purpose.
 * @param {string} email
 * @param {string} purpose
 * @returns {string}
 */
function makeKey(email, purpose) {
  return `${normalizeEmail(email)}:${normalizePurpose(purpose)}`;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP string.
 * Range: 100000 - 999999 inclusive.
 * @param {number} [length=6]
 * @returns {string}
 */
function generateSecureOtp(length = DEFAULT_OTP_LENGTH) {
  if (length === 6) {
    // Guaranteed 6 digits numeric without leading-zero ambiguity
    return crypto.randomInt(100000, 1000000).toString();
  }
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length);
  return crypto.randomInt(min, max).toString();
}

/**
 * Computes a salted HMAC-SHA256 hash of the OTP for secure storage.
 * @param {string} otp
 * @param {string} salt
 * @returns {string} Hex-encoded hash
 */
function hashOtp(otp, salt) {
  return crypto.createHmac('sha256', salt).update(String(otp)).digest('hex');
}

/**
 * Constant-time comparison between two hex strings to prevent timing attacks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checks and records rate limits for a given email address and IP address.
 * @param {string} email
 * @param {string} ip
 * @param {Object} [options]
 * @returns {{ allowed: boolean, reason?: string, code?: string, remainingSeconds?: number, message?: string }}
 */
function checkRateLimits(email, ip, options = {}) {
  const now = Date.now();
  const cleanEmail = normalizeEmail(email);
  const oneHourAgo = now - 60 * 60 * 1000;

  // Check hourly limit per email
  if (cleanEmail) {
    let emailHistory = emailSendTimestamps.get(cleanEmail) || [];
    emailHistory = emailHistory.filter((t) => t > oneHourAgo);
    emailSendTimestamps.set(cleanEmail, emailHistory);

    if (emailHistory.length >= MAX_SENDS_PER_EMAIL_PER_HOUR) {
      const oldest = emailHistory[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldest + 60 * 60 * 1000 - now) / 1000));
      return {
        allowed: false,
        code: 'EMAIL_HOURLY_LIMIT_EXCEEDED',
        remainingSeconds: resetInSeconds,
        message: `Too many verification codes requested for this email. Please try again in ${Math.ceil(resetInSeconds / 60)} minute(s).`,
      };
    }
  }

  // Check hourly limit per IP
  if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
    let ipHistory = ipSendTimestamps.get(ip) || [];
    ipHistory = ipHistory.filter((t) => t > oneHourAgo);
    ipSendTimestamps.set(ip, ipHistory);

    if (ipHistory.length >= MAX_SENDS_PER_IP_PER_HOUR) {
      const oldest = ipHistory[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldest + 60 * 60 * 1000 - now) / 1000));
      return {
        allowed: false,
        code: 'IP_HOURLY_LIMIT_EXCEEDED',
        remainingSeconds: resetInSeconds,
        message: `Too many requests from your network. Please try again in ${Math.ceil(resetInSeconds / 60)} minute(s).`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Records a successful OTP dispatch timestamp against email and IP.
 * @param {string} email
 * @param {string} ip
 */
function recordSendTimestamp(email, ip) {
  const now = Date.now();
  const cleanEmail = normalizeEmail(email);
  if (cleanEmail) {
    const history = emailSendTimestamps.get(cleanEmail) || [];
    history.push(now);
    emailSendTimestamps.set(cleanEmail, history);
  }
  if (ip) {
    const history = ipSendTimestamps.get(ip) || [];
    history.push(now);
    ipSendTimestamps.set(ip, history);
  }
}

/**
 * Creates and stores a new OTP record for a given email and purpose.
 * Enforces cooldown, expiry, and rate limits.
 *
 * @param {Object} params
 * @param {string} params.email - Recipient email address
 * @param {string} [params.purpose='login'] - Purpose (e.g. 'login', 'register', 'recovery')
 * @param {string} [params.ip='127.0.0.1'] - Requesting client IP
 * @param {string} [params.userAgent=''] - Requesting client User-Agent
 * @param {Object} [params.metadata={}] - Optional metadata to bind to the OTP session
 * @param {number} [params.expirySeconds] - Custom expiration in seconds
 * @param {number} [params.cooldownSeconds] - Custom resend cooldown in seconds
 * @param {number} [params.maxAttempts] - Custom max verification attempts
 * @param {boolean} [params.ignoreCooldown=false] - For testing/admin bypass
 * @returns {Object} Result payload
 */
function createOtpRecord({
  email,
  purpose = 'login',
  ip = '127.0.0.1',
  userAgent = '',
  metadata = {},
  expirySeconds = DEFAULT_EXPIRY_SECONDS,
  cooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  ignoreCooldown = false,
}) {
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      ok: false,
      code: 'INVALID_EMAIL_FORMAT',
      error: 'Please provide a valid email address.',
      status: 400,
    };
  }

  const cleanEmail = normalizeEmail(email);
  const cleanPurpose = normalizePurpose(purpose);
  const key = makeKey(cleanEmail, cleanPurpose);
  const now = Date.now();

  let tracker = resendTrackers.get(key) || { count: 0, lastRequestTime: 0 };

  // Check escalating resend tier and lockout
  if (!ignoreCooldown) {
    if (tracker.count >= MAX_RESEND_ATTEMPTS) {
      if (now - tracker.lastRequestTime < RESEND_LOCKOUT_WINDOW_MS) {
        return {
          success: false,
          ok: false,
          code: 'RESEND_LIMIT_EXCEEDED',
          error: 'Too many verification code requests. Please try again later.',
          status: 429,
        };
      } else {
        tracker = { count: 0, lastRequestTime: 0 };
        resendTrackers.set(key, tracker);
      }
    }

    // Check existing active record for resend cooldown
    const existing = otpRecords.get(key);
    if (existing) {
      if (now < existing.resendAvailableAt) {
        const remainingSeconds = Math.max(1, Math.ceil((existing.resendAvailableAt - now) / 1000));
        return {
          success: false,
          ok: false,
          code: 'COOLDOWN_ACTIVE',
          error: `Please wait ${remainingSeconds} second(s) before requesting another code.`,
          cooldownSeconds: remainingSeconds,
          remainingSeconds,
          status: 429,
        };
      }
    }
  }

  // Check hourly rate limits
  const rateLimitCheck = checkRateLimits(cleanEmail, ip);
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      ok: false,
      code: rateLimitCheck.code,
      error: rateLimitCheck.message,
      remainingSeconds: rateLimitCheck.remainingSeconds,
      status: 429,
    };
  }

  // Calculate escalating cooldown tier: [60s, 120s, 180s]
  const currentTierIndex = Math.min(tracker.count, COOLDOWN_TIERS.length - 1);
  const tierCooldown = COOLDOWN_TIERS[currentTierIndex];
  // Honor explicitly provided customCooldown if different from DEFAULT_COOLDOWN_SECONDS
  const effectiveCooldown = (cooldownSeconds && cooldownSeconds !== DEFAULT_COOLDOWN_SECONDS)
    ? cooldownSeconds
    : tierCooldown;

  if (!ignoreCooldown) {
    tracker.count += 1;
    tracker.lastRequestTime = now;
    resendTrackers.set(key, tracker);
  }

  // Generate 6-digit cryptographic OTP and salt
  const otp = generateSecureOtp(DEFAULT_OTP_LENGTH);
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);

  const expiresAt = now + expirySeconds * 1000;
  const resendAvailableAt = now + effectiveCooldown * 1000;

  const record = {
    key,
    email: cleanEmail,
    purpose: cleanPurpose,
    otpHash,
    salt,
    createdAt: now,
    expiresAt,
    resendAvailableAt,
    cooldownSeconds: effectiveCooldown,
    attempts: 0,
    maxAttempts,
    ip,
    userAgent,
    metadata,
    used: false,
    verifiedAt: null,
  };

  otpRecords.set(key, record);
  recordSendTimestamp(cleanEmail, ip);

  return {
    success: true,
    ok: true,
    otp, // Note: raw OTP returned to caller service (e.g. mailer dispatcher) to send via email
    email: cleanEmail,
    purpose: cleanPurpose,
    expiresInSeconds: expirySeconds,
    expiresIn: expirySeconds,
    cooldownSeconds: effectiveCooldown,
    expiresAt,
    resendAvailableAt,
    resendCount: tracker.count,
    resendBlocked: tracker.count >= MAX_RESEND_ATTEMPTS,
    maxAttempts,
    status: 200,
  };
}

/**
 * Verifies a submitted OTP against the stored record.
 * Handles attempts tracking, expiry checking, brute-force locking, and single-use consumption.
 *
 * @param {Object} params
 * @param {string} params.email - Target email address
 * @param {string} params.otp - User-submitted 6-digit OTP
 * @param {string} [params.purpose='login'] - Purpose
 * @param {string} [params.ip='127.0.0.1'] - Verifying client IP
 * @returns {Object} Result payload
 */
function verifyOtp({
  email,
  otp,
  purpose = 'login',
  ip = '127.0.0.1',
}) {
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      ok: false,
      code: 'INVALID_EMAIL_FORMAT',
      error: 'Please provide a valid email address.',
      status: 400,
    };
  }

  if (!otp || typeof otp !== 'string' && typeof otp !== 'number') {
    return {
      success: false,
      ok: false,
      code: 'INVALID_OTP_FORMAT',
      error: 'Please provide a 6-digit verification code.',
      status: 400,
    };
  }

  const cleanEmail = normalizeEmail(email);
  const cleanPurpose = normalizePurpose(purpose);
  const rawOtp = String(otp).trim();

  if (!/^\d{6}$/.test(rawOtp)) {
    return {
      success: false,
      ok: false,
      code: 'INVALID_OTP_FORMAT',
      error: 'The verification code must be exactly 6 numeric digits.',
      status: 400,
    };
  }

  const key = makeKey(cleanEmail, cleanPurpose);
  const record = otpRecords.get(key);
  const now = Date.now();

  // No active OTP record found
  if (!record) {
    return {
      success: false,
      ok: false,
      code: 'OTP_NOT_FOUND',
      error: 'No active verification code found for this email. Please request a new code.',
      status: 404,
    };
  }

  // Already used / consumed
  if (record.used) {
    otpRecords.delete(key);
    return {
      success: false,
      ok: false,
      code: 'OTP_ALREADY_USED',
      error: 'This verification code has already been used. Please request a new one.',
      status: 400,
    };
  }

  // Expired OTP
  if (now > record.expiresAt) {
    otpRecords.delete(key);
    return {
      success: false,
      ok: false,
      code: 'OTP_EXPIRED',
      error: 'Verification code has expired. Please request a new code.',
      status: 400,
    };
  }

  // Max attempts already exceeded
  if (record.attempts >= record.maxAttempts) {
    otpRecords.delete(key);
    return {
      success: false,
      ok: false,
      code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
      remainingAttempts: 0,
      error: 'Too many incorrect attempts. This code has been invalidated for security. Please request a new code.',
      status: 429,
    };
  }

  // Increment attempt count
  record.attempts += 1;

  // Compute hash of entered OTP
  const candidateHash = hashOtp(rawOtp, record.salt);
  const isMatch = safeCompare(candidateHash, record.otpHash);

  if (!isMatch) {
    const remainingAttempts = Math.max(0, record.maxAttempts - record.attempts);

    if (remainingAttempts <= 0) {
      otpRecords.delete(key);
      return {
        success: false,
        ok: false,
        code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
        remainingAttempts: 0,
        error: 'Too many incorrect attempts. This code has been invalidated for security. Please request a new code.',
        status: 429,
      };
    }

    return {
      success: false,
      ok: false,
      code: 'OTP_INVALID',
      remainingAttempts,
      error: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
      status: 400,
    };
  }

  // Successful verification! Mark as used and remove from active store
  record.used = true;
  record.verifiedAt = now;
  otpRecords.delete(key);
  resendTrackers.delete(key);

  // Generate a verified action token (useful for multi-step flows like password recovery or profile setup)
  const verificationToken = 'vtok_' + crypto.randomBytes(32).toString('hex');
  verificationTokens.set(verificationToken, {
    token: verificationToken,
    email: cleanEmail,
    purpose: cleanPurpose,
    createdAt: now,
    expiresAt: now + VERIFICATION_TOKEN_EXPIRY_SECONDS * 1000,
    used: false,
  });

  return {
    success: true,
    ok: true,
    message: 'Verification code verified successfully.',
    email: cleanEmail,
    purpose: cleanPurpose,
    verified: true,
    verificationToken,
    metadata: record.metadata || {},
    status: 200,
  };
}

/**
 * Validates and consumes a verification token for downstream actions (e.g. password reset).
 * @param {string} token
 * @param {string} email
 * @param {string} [expectedPurpose]
 * @returns {{ valid: boolean, error?: string, tokenData?: Object }}
 */
function consumeVerificationToken(token, email, expectedPurpose) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Verification token is required.' };
  }

  const data = verificationTokens.get(token);
  if (!data) {
    return { valid: false, error: 'Invalid or expired verification token.' };
  }

  const now = Date.now();
  if (data.used || now > data.expiresAt) {
    verificationTokens.delete(token);
    return { valid: false, error: 'Verification token has expired or already been used.' };
  }

  if (email && normalizeEmail(email) !== normalizeEmail(data.email)) {
    return { valid: false, error: 'Verification token does not match the specified email address.' };
  }

  if (expectedPurpose && normalizePurpose(expectedPurpose) !== normalizePurpose(data.purpose)) {
    return { valid: false, error: 'Verification token was issued for a different purpose.' };
  }

  // Consume token
  data.used = true;
  verificationTokens.delete(token);

  return { valid: true, tokenData: data };
}

/**
 * Retrieves the status of an active OTP (without exposing the code).
 * @param {string} email
 * @param {string} [purpose='login']
 * @returns {Object}
 */
function getOtpStatus(email, purpose = 'login') {
  if (!email || !isValidEmail(email)) {
    return { ok: false, hasActiveOtp: false, error: 'Invalid email' };
  }

  const cleanEmail = normalizeEmail(email);
  const cleanPurpose = normalizePurpose(purpose);
  const key = makeKey(cleanEmail, cleanPurpose);
  const record = otpRecords.get(key);
  const tracker = resendTrackers.get(key) || { count: 0, lastRequestTime: 0 };
  const now = Date.now();
  const isLockedOut = tracker.count >= MAX_RESEND_ATTEMPTS && (now - tracker.lastRequestTime < RESEND_LOCKOUT_WINDOW_MS);

  if (!record || record.used || now > record.expiresAt) {
    return {
      ok: true,
      hasActiveOtp: false,
      cooldownRemainingSeconds: 0,
      expiresInSeconds: 0,
      attemptsRemaining: DEFAULT_MAX_ATTEMPTS,
      resendCount: tracker.count,
      resendBlocked: isLockedOut,
    };
  }

  const cooldownRemaining = Math.max(0, Math.ceil((record.resendAvailableAt - now) / 1000));
  const expiresIn = Math.max(0, Math.ceil((record.expiresAt - now) / 1000));
  const attemptsRemaining = Math.max(0, record.maxAttempts - record.attempts);

  return {
    ok: true,
    hasActiveOtp: true,
    email: record.email,
    purpose: record.purpose,
    cooldownRemainingSeconds: cooldownRemaining,
    cooldownSeconds: record.cooldownSeconds || DEFAULT_COOLDOWN_SECONDS,
    expiresInSeconds: expiresIn,
    attemptsRemaining,
    createdAt: record.createdAt,
    resendCount: tracker.count,
    resendBlocked: isLockedOut,
  };
}

/**
 * Retrieves the resend tracking state for an email and purpose.
 * @param {string} email
 * @param {string} [purpose='login']
 * @returns {{ count: number, lastRequestTime: number, isLockedOut: boolean }}
 */
function getResendTracker(email, purpose = 'login') {
  const cleanEmail = normalizeEmail(email);
  const cleanPurpose = normalizePurpose(purpose);
  const key = makeKey(cleanEmail, cleanPurpose);
  const tracker = resendTrackers.get(key) || { count: 0, lastRequestTime: 0 };
  const now = Date.now();
  const isLockedOut = tracker.count >= MAX_RESEND_ATTEMPTS && (now - tracker.lastRequestTime < RESEND_LOCKOUT_WINDOW_MS);
  return {
    count: tracker.count,
    lastRequestTime: tracker.lastRequestTime,
    isLockedOut,
  };
}

/**
 * Resets the resend tracking state for an email or all emails.
 * @param {string} [email]
 * @param {string} [purpose]
 */
function resetResendTracker(email, purpose) {
  if (!email) {
    resendTrackers.clear();
    return;
  }
  const cleanEmail = normalizeEmail(email);
  if (purpose) {
    const key = makeKey(cleanEmail, purpose);
    resendTrackers.delete(key);
  } else {
    for (const key of resendTrackers.keys()) {
      if (key.startsWith(`${cleanEmail}:`)) {
        resendTrackers.delete(key);
      }
    }
  }
}

/**
 * Clears an OTP record for an email and purpose.
 * @param {string} email
 * @param {string} [purpose='login']
 */
function clearOtp(email, purpose = 'login') {
  const key = makeKey(email, purpose);
  otpRecords.delete(key);
}

/**
 * Resets all rate limits and active OTPs (for testing / admin recovery).
 * @param {string} [identifier] - Specific email, IP, or null for all
 */
function resetRateLimits(identifier) {
  if (!identifier) {
    otpRecords.clear();
    resendTrackers.clear();
    emailSendTimestamps.clear();
    ipSendTimestamps.clear();
    verificationTokens.clear();
    return;
  }

  const clean = String(identifier).trim().toLowerCase();
  emailSendTimestamps.delete(clean);
  ipSendTimestamps.delete(clean);

  // Clear matching OTPs
  for (const [key, record] of otpRecords.entries()) {
    if (record.email === clean || record.ip === clean) {
      otpRecords.delete(key);
    }
  }

  for (const key of resendTrackers.keys()) {
    if (key.startsWith(`${clean}:`) || key === clean) {
      resendTrackers.delete(key);
    }
  }
}

/**
 * Periodic cleanup of expired records to prevent memory leak.
 */
function cleanupExpired() {
  const now = Date.now();

  // Purge expired OTP records
  for (const [key, record] of otpRecords.entries()) {
    if (record.used || now > record.expiresAt) {
      otpRecords.delete(key);
    }
  }

  // Purge stale resend trackers
  for (const [key, data] of resendTrackers.entries()) {
    if (now - data.lastRequestTime > RESEND_LOCKOUT_WINDOW_MS) {
      resendTrackers.delete(key);
    }
  }

  // Purge expired verification tokens
  for (const [token, data] of verificationTokens.entries()) {
    if (data.used || now > data.expiresAt) {
      verificationTokens.delete(token);
    }
  }

  // Purge stale send history (older than 2 hours)
  const twoHoursAgo = now - 2 * 60 * 60 * 1000;
  for (const [email, timestamps] of emailSendTimestamps.entries()) {
    const fresh = timestamps.filter((t) => t > twoHoursAgo);
    if (fresh.length === 0) {
      emailSendTimestamps.delete(email);
    } else {
      emailSendTimestamps.set(email, fresh);
    }
  }

  for (const [ip, timestamps] of ipSendTimestamps.entries()) {
    const fresh = timestamps.filter((t) => t > twoHoursAgo);
    if (fresh.length === 0) {
      ipSendTimestamps.delete(ip);
    } else {
      ipSendTimestamps.set(ip, fresh);
    }
  }
}

// Run periodic cleanup every 2 minutes (unref so it doesn't hold the process open)
const cleanupTimer = setInterval(cleanupExpired, 2 * 60 * 1000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Returns memory statistics for monitoring.
 */
function getStoreStats() {
  return {
    activeOtps: otpRecords.size,
    resendTrackers: resendTrackers.size,
    trackedEmails: emailSendTimestamps.size,
    trackedIps: ipSendTimestamps.size,
    activeVerificationTokens: verificationTokens.size,
  };
}

module.exports = {
  // Constants
  DEFAULT_OTP_LENGTH,
  DEFAULT_EXPIRY_SECONDS,
  DEFAULT_COOLDOWN_SECONDS,
  DEFAULT_MAX_ATTEMPTS,
  COOLDOWN_TIERS,
  MAX_RESEND_ATTEMPTS,
  RESEND_LOCKOUT_WINDOW_MS,
  MAX_SENDS_PER_EMAIL_PER_HOUR,
  MAX_SENDS_PER_IP_PER_HOUR,
  VERIFICATION_TOKEN_EXPIRY_SECONDS,

  // Validation & Formatting
  isValidEmail,
  normalizeEmail,
  normalizePurpose,
  generateSecureOtp,
  hashOtp,
  safeCompare,

  // Core Operations
  createOtpRecord,
  generateOtp: createOtpRecord,
  verifyOtp,
  consumeVerificationToken,
  getOtpStatus,
  getResendTracker,
  resetResendTracker,
  clearOtp,
  resetRateLimits,
  cleanupExpired,
  getStoreStats,
};
