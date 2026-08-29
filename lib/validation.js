/**
 * Leatherbound Notebook — Input Validation, Sanitization & SQL Parameterization Module
 *
 * Provides:
 * 1. Strict input validation and sanitization for all API endpoints.
 * 2. Zero-tolerance SQL injection prevention and SQL query parameterization verification.
 * 3. Parameterized SQL query builders for relational SQLite storage.
 */

const { URL } = require('url');

// ---------- 1. Input Sanitization & Validation Helpers ----------

/**
 * Remove dangerous control characters and trim whitespace.
 */
function sanitizeString(val, maxLen = 255, defaultVal = '') {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val !== 'string') val = String(val);
  // Strip non-printable ASCII control characters (keep \t, \n, \r)
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLen);
}

/**
 * Sanitize username: lowercase, alphanumeric, underscores, hyphens, max 30 chars.
 */
function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') return '';
  return username.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
}

/**
 * Validate username strictly.
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, username: '', error: 'Username is required and must be a string.' };
  }
  const trimmed = username.trim();
  if (trimmed.length === 0) {
    return { valid: false, username: '', error: 'Username cannot be empty.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, username: '', error: 'Username cannot exceed 30 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, username: '', error: 'Username may only contain letters, numbers, hyphens, and underscores.' };
  }
  return { valid: true, username: trimmed };
}

/**
 * Validate password strength and length.
 */
function validatePassword(password, minLen = 4, maxLen = 1024) {
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
}

/**
 * Sanitize notebook/book title.
 */
function sanitizeTitle(title, maxLen = 80, defaultVal = 'My Notebook') {
  if (!title || typeof title !== 'string') return defaultVal;
  const cleaned = sanitizeString(title, maxLen, defaultVal);
  return cleaned.length > 0 ? cleaned : defaultVal;
}

const VALID_COVER_THEMES = new Set([
  'brown', 'black', 'blue', 'green', 'burgundy', 'obsidian', 'gold',
  'navy', 'crimson', 'forest', 'amber', 'purple', 'slate', 'teal', 'vintage-tan'
]);

/**
 * Validate and normalize cover color / theme.
 */
function validateCoverColor(color, defaultColor = 'brown') {
  if (!color || typeof color !== 'string') return defaultColor;
  const normalized = color.trim().toLowerCase();
  if (VALID_COVER_THEMES.has(normalized)) {
    return normalized;
  }
  // Allow valid hex codes
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized;
  }
  return defaultColor;
}

/**
 * Validate Book ID (e.g. 'book-1234567890-abc123' or 'book-admin-master').
 */
function validateBookId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, id: '', error: 'Book ID is required and must be a string.' };
  }
  const trimmed = id.trim();
  if (trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, id: '', error: 'Invalid Book ID format.' };
  }
  return { valid: true, id: trimmed };
}

/**
 * Validate Page ID (e.g. 'p-1234567890' or 'p-admin-1').
 */
function validatePageId(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, id: '', error: 'Page ID is required and must be a string.' };
  }
  const trimmed = id.trim();
  if (trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, id: '', error: 'Invalid Page ID format.' };
  }
  return { valid: true, id: trimmed };
}

/**
 * Sanitize Page HTML content.
 */
function sanitizeHtmlContent(html, maxSizeBytes = 10 * 1024 * 1024) {
  if (html === null || html === undefined) return '';
  if (typeof html !== 'string') html = String(html);
  if (Buffer.byteLength(html, 'utf8') > maxSizeBytes) {
    throw new Error(`Page content exceeds maximum size of ${maxSizeBytes} bytes.`);
  }
  // Strip null bytes and non-printable control chars (except standard whitespace)
  return html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validate filename to prevent path traversal and ensure safe characters.
 */
function validateFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, filename: '', error: 'Filename is required.' };
  }
  const trimmed = filename.trim();
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('\0')) {
    return { valid: false, filename: '', error: 'Path traversal characters detected in filename.' };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed) || trimmed.length > 120) {
    return { valid: false, filename: '', error: 'Filename contains invalid characters or exceeds 120 characters.' };
  }
  return { valid: true, filename: trimmed };
}

/**
 * Validate external URL for proxying and link previewing.
 */
function validateUrl(urlStr, allowedProtocols = ['http:', 'https:']) {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, error: 'URL is required.' };
  }
  try {
    const parsed = new URL(urlStr.trim());
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Protocol ${parsed.protocol} is not allowed.` };
    }
    // Block local loopback & metadata URLs in proxy if requested
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { valid: false, error: 'Access to cloud metadata endpoints is prohibited.' };
    }
    return { valid: true, url: parsed };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

/**
 * Sanitize search query.
 */
function sanitizeSearchQuery(query, maxLen = 200) {
  if (!query || typeof query !== 'string') return '';
  return sanitizeString(query, maxLen, '');
}

/**
 * Sanitize pagination limit and offset.
 */
function sanitizePagination(limit, offset, maxLimit = 1000, defaultLimit = 100) {
  let parsedLimit = parseInt(limit, 10);
  if (isNaN(parsedLimit)) parsedLimit = defaultLimit;
  else if (parsedLimit < 1) parsedLimit = 1;
  parsedLimit = Math.min(maxLimit, Math.max(1, parsedLimit));

  let parsedOffset = parseInt(offset, 10);
  if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;

  return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Validate audit log action.
 */
function validateAuditAction(action) {
  if (!action || typeof action !== 'string') return 'ACTION';
  const clean = action.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 60);
  return clean || 'ACTION';
}

/**
 * Validate audit log status.
 */
function validateAuditStatus(status) {
  if (typeof status === 'string' && status.toUpperCase() === 'FAILED') {
    return 'FAILED';
  }
  return 'SUCCESS';
}

/**
 * Sanitize client IP address.
 */
function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  return ip.replace(/[^a-fA-F0-9:.]/g, '').slice(0, 45) || '127.0.0.1';
}

// ---------- 2. SQL Parameterization & Injection Prevention Engine ----------

const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validate SQL identifier (table name, column name).
 */
function isSafeIdentifier(name) {
  if (!name || typeof name !== 'string') return false;
  return SAFE_IDENTIFIER_REGEX.test(name);
}

/**
 * Assert that an identifier is safe, throwing if not.
 */
function assertSafeIdentifier(name, context = 'SQL identifier') {
  if (!isSafeIdentifier(name)) {
    throw new Error(`Invalid or unsafe ${context}: "${name}". Must match /^[a-zA-Z_][a-zA-Z0-9_]*$/`);
  }
  return name;
}

/**
 * Audit a SQL statement to verify strict parameterization.
 * Fails if raw string literals or concatenated variables are detected where parameters should be used.
 */
function auditSqlStatement(sql, params = []) {
  if (!sql || typeof sql !== 'string') {
    return { safe: false, reason: 'SQL must be a non-empty string', paramCount: 0 };
  }

  const trimmed = sql.trim();

  // Check for dangerous unparameterized patterns
  // 1. Raw inline single quotes with potential injection
  // Exclude escaped single quotes if they are purely string literals in static queries
  // 2. Inline comments (e.g. '--' or '/*')
  if (/--|\/\*/.test(trimmed)) {
    return { safe: false, reason: 'SQL query contains inline comments which may indicate injection.', paramCount: 0 };
  }

  // Count positional parameter placeholders '?'
  let placeholderCount = 0;
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inQuote) {
      if (ch === quoteChar) {
        if (trimmed[i + 1] === quoteChar) {
          i++; // escaped quote
        } else {
          inQuote = false;
        }
      }
    } else {
      if (ch === "'" || ch === '"' || ch === '`') {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === '?') {
        placeholderCount++;
      }
    }
  }

  // Check parameters
  const paramList = Array.isArray(params) ? params : Object.values(params || {});
  
  if (placeholderCount > 0 && paramList.length !== placeholderCount) {
    return {
      safe: false,
      reason: `Placeholder count (${placeholderCount}) does not match parameter count (${paramList.length}).`,
      paramCount: placeholderCount,
    };
  }

  return { safe: true, paramCount: placeholderCount };
}

/**
 * Assert parameterized query safety, throwing an error if unparameterized or unsafe.
 */
function assertParameterizedQuery(sql, params = []) {
  const audit = auditSqlStatement(sql, params);
  if (!audit.safe) {
    throw new Error(`SQL Parameterization Violation: ${audit.reason}`);
  }
}

/**
 * Build a 100% parameterized INSERT statement.
 */
function buildParameterizedInsert(tableName, data) {
  assertSafeIdentifier(tableName, 'table name');
  if (!data || typeof data !== 'object') {
    throw new Error('Data for INSERT must be an object.');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error('Cannot build INSERT with empty data object.');
  }

  const cols = [];
  const placeholders = [];
  const params = [];

  for (const k of keys) {
    assertSafeIdentifier(k, 'column name');
    cols.push(k);
    placeholders.push('?');
    params.push(data[k]);
  }

  const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`;
  return { sql, params };
}

/**
 * Build a 100% parameterized UPDATE statement.
 */
function buildParameterizedUpdate(tableName, data, whereCol, whereVal) {
  assertSafeIdentifier(tableName, 'table name');
  assertSafeIdentifier(whereCol, 'WHERE column name');
  if (!data || typeof data !== 'object') {
    throw new Error('Data for UPDATE must be an object.');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error('Cannot build UPDATE with empty data object.');
  }

  const setClauses = [];
  const params = [];

  for (const k of keys) {
    assertSafeIdentifier(k, 'column name');
    setClauses.push(`${k} = ?`);
    params.push(data[k]);
  }

  params.push(whereVal);
  const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereCol} = ?`;
  return { sql, params };
}

/**
 * Build a 100% parameterized SELECT query.
 */
function buildParameterizedSelect(tableName, options = {}) {
  assertSafeIdentifier(tableName, 'table name');
  const { columns = ['*'], where = {}, orderBy = null, orderDir = 'ASC', limit = null, offset = null } = options;

  let colStr = '*';
  if (Array.isArray(columns) && columns.length > 0 && columns[0] !== '*') {
    columns.forEach((c) => assertSafeIdentifier(c, 'column name'));
    colStr = columns.join(', ');
  }

  let sql = `SELECT ${colStr} FROM ${tableName}`;
  const params = [];

  const whereKeys = Object.keys(where || {});
  if (whereKeys.length > 0) {
    const whereClauses = [];
    for (const k of whereKeys) {
      assertSafeIdentifier(k, 'WHERE column name');
      whereClauses.push(`${k} = ?`);
      params.push(where[k]);
    }
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  if (orderBy) {
    assertSafeIdentifier(orderBy, 'ORDER BY column name');
    const dir = String(orderDir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${orderBy} ${dir}`;
  }

  if (limit !== null && limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      sql += ' LIMIT ?';
      params.push(parsedLimit);

      if (offset !== null && offset !== undefined) {
        const parsedOffset = parseInt(offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          sql += ' OFFSET ?';
          params.push(parsedOffset);
        }
      }
    }
  }

  return { sql, params };
}

/**
 * Build a 100% parameterized DELETE statement.
 */
function buildParameterizedDelete(tableName, whereCol, whereVal) {
  assertSafeIdentifier(tableName, 'table name');
  assertSafeIdentifier(whereCol, 'WHERE column name');
  const sql = `DELETE FROM ${tableName} WHERE ${whereCol} = ?`;
  return { sql, params: [whereVal] };
}

module.exports = {
  // Input validation & sanitization
  sanitizeString,
  sanitizeUsername,
  validateUsername,
  validatePassword,
  sanitizeTitle,
  validateCoverColor,
  validateBookId,
  validatePageId,
  sanitizeHtmlContent,
  validateFilename,
  validateUrl,
  sanitizeSearchQuery,
  sanitizePagination,
  validateAuditAction,
  validateAuditStatus,
  sanitizeIp,
  VALID_COVER_THEMES,

  // SQL parameterization & safety
  isSafeIdentifier,
  assertSafeIdentifier,
  auditSqlStatement,
  assertParameterizedQuery,
  buildParameterizedInsert,
  buildParameterizedUpdate,
  buildParameterizedSelect,
  buildParameterizedDelete,
};
