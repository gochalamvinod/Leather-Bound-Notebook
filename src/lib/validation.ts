/**
 * Leatherbound Notebook — Input Validation, Sanitization & SQL Parameterization Module (TypeScript)
 */

import { CoverTheme } from '../types/notebook';

export const VALID_COVER_THEMES: Set<string> = new Set([
  'brown', 'black', 'blue', 'green', 'burgundy', 'obsidian', 'gold',
  'navy', 'crimson', 'forest', 'amber', 'purple', 'slate', 'teal', 'vintage-tan'
]);

export interface ValidationResult<T = string> {
  valid: boolean;
  value?: T;
  error?: string;
}

export function sanitizeString(val: unknown, maxLen = 255, defaultVal = ''): string {
  if (val === null || val === undefined) return defaultVal;
  const str = typeof val !== 'string' ? String(val) : val;
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLen);
}

export function sanitizeUsername(username: unknown): string {
  if (!username || typeof username !== 'string') return '';
  return username.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
}

export function validateUsername(username: unknown): { valid: boolean; username: string; error?: string } {
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

export function validatePassword(password: unknown, minLen = 4, maxLen = 1024): { valid: boolean; error?: string } {
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

export function sanitizeTitle(title: unknown, maxLen = 80, defaultVal = 'My Notebook'): string {
  if (!title || typeof title !== 'string') return defaultVal;
  const cleaned = sanitizeString(title, maxLen, defaultVal);
  return cleaned.length > 0 ? cleaned : defaultVal;
}

export function validateCoverColor(color: unknown, defaultColor: CoverTheme = 'brown'): CoverTheme {
  if (!color || typeof color !== 'string') return defaultColor;
  const normalized = color.trim().toLowerCase();
  if (VALID_COVER_THEMES.has(normalized)) {
    return normalized as CoverTheme;
  }
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized as CoverTheme;
  }
  return defaultColor;
}

export function validateBookId(id: unknown): { valid: boolean; id: string; error?: string } {
  if (!id || typeof id !== 'string') {
    return { valid: false, id: '', error: 'Book ID is required and must be a string.' };
  }
  const trimmed = id.trim();
  if (trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, id: '', error: 'Invalid Book ID format.' };
  }
  return { valid: true, id: trimmed };
}

export function validatePageId(id: unknown): { valid: boolean; id: string; error?: string } {
  if (!id || typeof id !== 'string') {
    return { valid: false, id: '', error: 'Page ID is required and must be a string.' };
  }
  const trimmed = id.trim();
  if (trimmed.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, id: '', error: 'Invalid Page ID format.' };
  }
  return { valid: true, id: trimmed };
}

export function sanitizeHtmlContent(html: unknown, maxSizeBytes = 10 * 1024 * 1024): string {
  if (html === null || html === undefined) return '';
  const str = typeof html !== 'string' ? String(html) : html;
  if (str.length > maxSizeBytes) {
    throw new Error(`Page content exceeds maximum size of ${maxSizeBytes} bytes.`);
  }
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function validateFilename(filename: unknown): { valid: boolean; filename: string; error?: string } {
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

export function validateUrl(urlStr: unknown, allowedProtocols = ['http:', 'https:']): { valid: boolean; url?: URL; error?: string } {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, error: 'URL is required.' };
  }
  try {
    const parsed = new URL(urlStr.trim());
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: `Protocol ${parsed.protocol} is not allowed.` };
    }
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { valid: false, error: 'Access to cloud metadata endpoints is prohibited.' };
    }
    return { valid: true, url: parsed };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

export function sanitizeSearchQuery(query: unknown, maxLen = 200): string {
  if (!query || typeof query !== 'string') return '';
  return sanitizeString(query, maxLen, '');
}

export function sanitizePagination(limit: unknown, offset: unknown, maxLimit = 1000, defaultLimit = 100): { limit: number; offset: number } {
  let parsedLimit = parseInt(String(limit), 10);
  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = defaultLimit;
  parsedLimit = Math.min(maxLimit, Math.max(1, parsedLimit));

  let parsedOffset = parseInt(String(offset), 10);
  if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;

  return { limit: parsedLimit, offset: parsedOffset };
}

export function validateAuditAction(action: unknown): string {
  if (!action || typeof action !== 'string') return 'ACTION';
  const clean = action.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 60);
  return clean || 'ACTION';
}

export function validateAuditStatus(status: unknown): 'SUCCESS' | 'FAILED' {
  if (typeof status === 'string' && status.toUpperCase() === 'FAILED') {
    return 'FAILED';
  }
  return 'SUCCESS';
}

export function sanitizeIp(ip: unknown): string {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  return ip.replace(/[^a-fA-F0-9:.]/g, '').slice(0, 45) || '127.0.0.1';
}

// SQL Parameterization Types & Helpers
export interface ParameterizedQuery {
  sql: string;
  params: any[];
}

export interface SqlAuditResult {
  safe: boolean;
  reason?: string;
  paramCount: number;
}

export function isSafeIdentifier(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export function assertSafeIdentifier(name: string, context = 'SQL identifier'): string {
  if (!isSafeIdentifier(name)) {
    throw new Error(`Invalid or unsafe ${context}: "${name}". Must match /^[a-zA-Z_][a-zA-Z0-9_]*$/`);
  }
  return name;
}

export function auditSqlStatement(sql: string, params: any[] = []): SqlAuditResult {
  if (!sql || typeof sql !== 'string') {
    return { safe: false, reason: 'SQL must be a non-empty string', paramCount: 0 };
  }

  const trimmed = sql.trim();
  if (/--|\/\*/.test(trimmed)) {
    return { safe: false, reason: 'SQL query contains inline comments which may indicate injection.', paramCount: 0 };
  }

  let placeholderCount = 0;
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inQuote) {
      if (ch === quoteChar) {
        if (trimmed[i + 1] === quoteChar) {
          i++;
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

export function assertParameterizedQuery(sql: string, params: any[] = []): void {
  const audit = auditSqlStatement(sql, params);
  if (!audit.safe) {
    throw new Error(`SQL Parameterization Violation: ${audit.reason}`);
  }
}

export function buildParameterizedInsert(tableName: string, data: Record<string, any>): ParameterizedQuery {
  assertSafeIdentifier(tableName, 'table name');
  if (!data || typeof data !== 'object') {
    throw new Error('Data for INSERT must be an object.');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error('Cannot build INSERT with empty data object.');
  }

  const cols: string[] = [];
  const placeholders: string[] = [];
  const params: any[] = [];

  for (const k of keys) {
    assertSafeIdentifier(k, 'column name');
    cols.push(k);
    placeholders.push('?');
    params.push(data[k]);
  }

  const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`;
  return { sql, params };
}

export function buildParameterizedUpdate(tableName: string, data: Record<string, any>, whereCol: string, whereVal: any): ParameterizedQuery {
  assertSafeIdentifier(tableName, 'table name');
  assertSafeIdentifier(whereCol, 'WHERE column name');
  if (!data || typeof data !== 'object') {
    throw new Error('Data for UPDATE must be an object.');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error('Cannot build UPDATE with empty data object.');
  }

  const setClauses: string[] = [];
  const params: any[] = [];

  for (const k of keys) {
    assertSafeIdentifier(k, 'column name');
    setClauses.push(`${k} = ?`);
    params.push(data[k]);
  }

  params.push(whereVal);
  const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereCol} = ?`;
  return { sql, params };
}

export function buildParameterizedSelect(tableName: string, options: {
  columns?: string[];
  where?: Record<string, any>;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
} = {}): ParameterizedQuery {
  assertSafeIdentifier(tableName, 'table name');
  const { columns = ['*'], where = {}, orderBy = undefined, orderDir = 'ASC', limit = undefined, offset = undefined } = options;

  let colStr = '*';
  if (Array.isArray(columns) && columns.length > 0 && columns[0] !== '*') {
    columns.forEach((c) => assertSafeIdentifier(c, 'column name'));
    colStr = columns.join(', ');
  }

  let sql = `SELECT ${colStr} FROM ${tableName}`;
  const params: any[] = [];

  const whereKeys = Object.keys(where || {});
  if (whereKeys.length > 0) {
    const whereClauses: string[] = [];
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
    const parsedLimit = parseInt(String(limit), 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      sql += ' LIMIT ?';
      params.push(parsedLimit);

      if (offset !== null && offset !== undefined) {
        const parsedOffset = parseInt(String(offset), 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          sql += ' OFFSET ?';
          params.push(parsedOffset);
        }
      }
    }
  }

  return { sql, params };
}

export function buildParameterizedDelete(tableName: string, whereCol: string, whereVal: any): ParameterizedQuery {
  assertSafeIdentifier(tableName, 'table name');
  assertSafeIdentifier(whereCol, 'WHERE column name');
  const sql = `DELETE FROM ${tableName} WHERE ${whereCol} = ?`;
  return { sql, params: [whereVal] };
}
