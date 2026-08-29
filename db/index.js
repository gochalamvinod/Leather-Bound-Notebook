/**
 * Database Module for Leatherbound Notebook
 * Manages SQLite connection, schema initialization, transactional helpers,
 * and comprehensive Data Access Objects (DAOs) for all relational entities.
 */

const path = require('path');
const fs = require('fs');
const { SCHEMA_DDL, TABLES } = require('./schema');
const { SQLiteDriver } = require('./driver');

let defaultDbInstance = null;

function resolveDefaultDbPath() {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {}
  }
  return path.join(dataDir, 'notebook.sqlite');
}

// ---------------------------------------------------------------------------
// Generic Parameterized Query Helpers
// ---------------------------------------------------------------------------

function normalizeParam(val) {
  return val === undefined ? null : val;
}

function normalizeParams(params) {
  if (!params) return [];
  if (Array.isArray(params)) {
    return params.map(normalizeParam);
  }
  return [normalizeParam(params)];
}

async function run(sql, params = []) {
  return getDb().run(sql, normalizeParams(params));
}

function runSync(sql, params = []) {
  return getDb().runSync(sql, normalizeParams(params));
}

async function get(sql, params = []) {
  return getDb().get(sql, normalizeParams(params));
}

function getSync(sql, params = []) {
  return getDb().getSync(sql, normalizeParams(params));
}

async function all(sql, params = []) {
  return getDb().all(sql, normalizeParams(params));
}

function allSync(sql, params = []) {
  return getDb().allSync(sql, normalizeParams(params));
}

async function query(sql, params = []) {
  return all(sql, params);
}

function querySync(sql, params = []) {
  return allSync(sql, params);
}

function exec(sql) {
  return getDb().exec(sql);
}

function transaction(callback) {
  return getDb().transaction(callback);
}

// ---------------------------------------------------------------------------
// Audit Log Field Normalization Helper
// ---------------------------------------------------------------------------

function normalizeAuditLogRow(row) {
  if (!row) return null;
  const actor = row.actor !== undefined && row.actor !== null ? row.actor : (row.username || 'anonymous');
  const action = row.action !== undefined && row.action !== null ? row.action : (row.event_type || 'UNKNOWN');
  const ip = row.ip !== undefined && row.ip !== null ? row.ip : (row.ip_address || '127.0.0.1');
  const target = row.target !== undefined && row.target !== null ? row.target : (row.resource || null);
  const details = row.details !== undefined && row.details !== null ? row.details : (row.encrypted_details || '');
  const status = row.status || 'SUCCESS';

  return {
    id: row.id,
    timestamp: row.timestamp,
    status,
    // Legacy API aliases
    actor,
    action,
    ip,
    target,
    details,
    // Schema column names
    username: actor,
    event_type: action,
    ip_address: ip,
    resource: target,
    encrypted_details: details,
    user_agent: row.user_agent || null,
    iv: row.iv || null,
    auth_tag: row.auth_tag || null,
  };
}

// ---------------------------------------------------------------------------
// Specialized Table DAOs
// ---------------------------------------------------------------------------

const users = {
  create({
    id,
    username,
    password_hash = null,
    salt = null,
    role = 'user',
    tier = 'classic',
    is_admin = 0,
    is_active = 1,
    encrypted_profile = null,
    admin_envelope = null,
    created_at,
    updated_at,
  } = {}) {
    const now = new Date().toISOString();
    const uid = id || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const uname = normalizeParam(username);
    const pHash = password_hash !== undefined && password_hash !== null ? password_hash : '';
    const s = salt !== undefined && salt !== null ? salt : '';
    const r = role !== undefined && role !== null ? role : 'user';
    const t = tier !== undefined && tier !== null ? tier : 'classic';
    const cAt = created_at || now;
    const uAt = updated_at || now;
    const adminFlag = is_admin ? 1 : 0;
    const activeFlag = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    const encProfile = normalizeParam(encrypted_profile);
    const adminEnv = normalizeParam(admin_envelope);

    runSync(
      `INSERT INTO users (id, username, password_hash, salt, role, tier, is_admin, is_active, created_at, updated_at, encrypted_profile, admin_envelope)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uid, uname, pHash, s, r, t, adminFlag, activeFlag, cAt, uAt, encProfile, adminEnv]
    );
    return this.findById(uid);
  },

  findByUsername(username) {
    if (!username) return null;
    return getSync(`SELECT * FROM users WHERE username = ? COLLATE NOCASE`, [normalizeParam(username)]);
  },

  findById(id) {
    if (!id) return null;
    return getSync(`SELECT * FROM users WHERE id = ?`, [normalizeParam(id)]);
  },

  update(id, fields = {}) {
    const sets = [];
    const params = [];
    for (const [key, val] of Object.entries(fields)) {
      if (key === 'id') continue;
      sets.push(`${key} = ?`);
      params.push(normalizeParam(val));
    }
    if (sets.length === 0) return this.findById(id);
    if (!fields.updated_at) {
      sets.push(`updated_at = ?`);
      params.push(new Date().toISOString());
    }
    params.push(normalizeParam(id));

    runSync(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  delete(id) {
    if (!id) return { changes: 0 };
    return runSync(`DELETE FROM users WHERE id = ?`, [normalizeParam(id)]);
  },

  listAll() {
    return allSync(`SELECT id, username, role, tier, is_admin, is_active, created_at, updated_at, encrypted_profile, admin_envelope FROM users ORDER BY created_at ASC`);
  },

  list(options = {}) {
    return this.listAll();
  },

  count() {
    const row = getSync(`SELECT COUNT(*) as count FROM users`);
    return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
  },
};

const books = {
  create({
    id,
    user_id,
    title_encrypted = null,
    meta_encrypted = null,
    created_at,
    updated_at,
    is_deleted = 0,
  } = {}) {
    const now = new Date().toISOString();
    const bid = id || `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const uId = normalizeParam(user_id);
    const titleEnc = normalizeParam(title_encrypted);
    const metaEnc = normalizeParam(meta_encrypted);
    const cAt = created_at || now;
    const uAt = updated_at || now;
    const del = is_deleted ? 1 : 0;

    runSync(
      `INSERT INTO books (id, user_id, title_encrypted, meta_encrypted, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bid, uId, titleEnc, metaEnc, cAt, uAt, del]
    );
    return this.findById(bid);
  },

  findById(id) {
    if (!id) return null;
    return getSync(`SELECT * FROM books WHERE id = ?`, [normalizeParam(id)]);
  },

  findByBookId(bookId) {
    return this.findById(bookId);
  },

  findByUserId(userId, includeDeleted = false) {
    if (!userId) return [];
    if (includeDeleted) {
      return allSync(`SELECT * FROM books WHERE user_id = ? ORDER BY created_at ASC`, [normalizeParam(userId)]);
    }
    return allSync(`SELECT * FROM books WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at ASC`, [normalizeParam(userId)]);
  },

  listByUser(userId, includeDeleted = false) {
    return this.findByUserId(userId, includeDeleted);
  },

  listAll(includeDeleted = false) {
    if (includeDeleted) {
      return allSync(`SELECT * FROM books ORDER BY created_at ASC`);
    }
    return allSync(`SELECT * FROM books WHERE is_deleted = 0 ORDER BY created_at ASC`);
  },

  listPublic() {
    return allSync(
      `SELECT b.*, u.username AS owner, u.is_admin
       FROM books b
       JOIN users u ON b.user_id = u.id
       WHERE b.is_deleted = 0
       ORDER BY b.created_at ASC`
    );
  },

  update(id, fields = {}) {
    const sets = [];
    const params = [];
    for (const [key, val] of Object.entries(fields)) {
      if (key === 'id') continue;
      sets.push(`${key} = ?`);
      params.push(normalizeParam(val));
    }
    if (sets.length === 0) return this.findById(id);
    if (!fields.updated_at) {
      sets.push(`updated_at = ?`);
      params.push(new Date().toISOString());
    }
    params.push(normalizeParam(id));

    runSync(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  softDelete(id) {
    return this.update(id, { is_deleted: 1 });
  },

  delete(id) {
    if (!id) return { changes: 0 };
    return runSync(`DELETE FROM books WHERE id = ?`, [normalizeParam(id)]);
  },

  count(includeDeleted = false) {
    const sql = includeDeleted
      ? `SELECT COUNT(*) as count FROM books`
      : `SELECT COUNT(*) as count FROM books WHERE is_deleted = 0`;
    const row = getSync(sql);
    return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
  },
};

const pages = {
  create({
    id,
    book_id,
    page_index = 0,
    title_encrypted = null,
    content_encrypted = null,
    drawings_encrypted = null,
    created_at,
    updated_at,
  } = {}) {
    const now = new Date().toISOString();
    const pid = id || `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const bId = normalizeParam(book_id);
    const pIndex = page_index !== undefined && page_index !== null ? page_index : 0;
    const titleEnc = normalizeParam(title_encrypted);
    const contentEnc = normalizeParam(content_encrypted);
    const drawingsEnc = normalizeParam(drawings_encrypted);
    const cAt = created_at || now;
    const uAt = updated_at || now;

    runSync(
      `INSERT INTO pages (id, book_id, page_index, title_encrypted, content_encrypted, drawings_encrypted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, bId, pIndex, titleEnc, contentEnc, drawingsEnc, cAt, uAt]
    );
    return this.findById(pid);
  },

  upsert({
    id,
    book_id,
    page_index = 0,
    title_encrypted = null,
    content_encrypted = null,
    drawings_encrypted = null,
    created_at,
    updated_at,
  } = {}) {
    if (id) {
      const existing = this.findById(id);
      if (existing) {
        return this.update(id, {
          book_id: book_id !== undefined ? book_id : existing.book_id,
          page_index: page_index !== undefined ? page_index : existing.page_index,
          title_encrypted: title_encrypted !== undefined ? title_encrypted : existing.title_encrypted,
          content_encrypted: content_encrypted !== undefined ? content_encrypted : existing.content_encrypted,
          drawings_encrypted: drawings_encrypted !== undefined ? drawings_encrypted : existing.drawings_encrypted,
          updated_at: updated_at || new Date().toISOString(),
        });
      }
    }

    if (book_id !== undefined && page_index !== undefined) {
      const existingByIndex = this.findByPageIndex(book_id, page_index);
      if (existingByIndex) {
        return this.update(existingByIndex.id, {
          title_encrypted: title_encrypted !== undefined ? title_encrypted : existingByIndex.title_encrypted,
          content_encrypted: content_encrypted !== undefined ? content_encrypted : existingByIndex.content_encrypted,
          drawings_encrypted: drawings_encrypted !== undefined ? drawings_encrypted : existingByIndex.drawings_encrypted,
          updated_at: updated_at || new Date().toISOString(),
        });
      }
    }

    return this.create({
      id,
      book_id,
      page_index,
      title_encrypted,
      content_encrypted,
      drawings_encrypted,
      created_at,
      updated_at,
    });
  },

  findById(id) {
    if (!id) return null;
    return getSync(`SELECT * FROM pages WHERE id = ?`, [normalizeParam(id)]);
  },

  findByBookId(bookId) {
    if (!bookId) return [];
    return allSync(`SELECT * FROM pages WHERE book_id = ? ORDER BY page_index ASC`, [normalizeParam(bookId)]);
  },

  listByBook(bookId) {
    return this.findByBookId(bookId);
  },

  findByPageIndex(bookId, pageIndex) {
    if (!bookId || pageIndex === undefined) return null;
    return getSync(`SELECT * FROM pages WHERE book_id = ? AND page_index = ?`, [normalizeParam(bookId), normalizeParam(pageIndex)]);
  },

  getByPageNumber(bookId, pageNumber) {
    return this.findByPageIndex(bookId, pageNumber);
  },

  update(id, fields = {}) {
    const sets = [];
    const params = [];
    for (const [key, val] of Object.entries(fields)) {
      if (key === 'id') continue;
      sets.push(`${key} = ?`);
      params.push(normalizeParam(val));
    }
    if (sets.length === 0) return this.findById(id);
    if (!fields.updated_at) {
      sets.push(`updated_at = ?`);
      params.push(new Date().toISOString());
    }
    params.push(normalizeParam(id));

    runSync(`UPDATE pages SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  delete(id) {
    if (!id) return { changes: 0 };
    return runSync(`DELETE FROM pages WHERE id = ?`, [normalizeParam(id)]);
  },

  deleteByBookId(bookId) {
    if (!bookId) return { changes: 0 };
    return runSync(`DELETE FROM pages WHERE book_id = ?`, [normalizeParam(bookId)]);
  },

  deleteByBook(bookId) {
    return this.deleteByBookId(bookId);
  },

  count(bookId = null) {
    if (bookId) {
      const row = getSync(`SELECT COUNT(*) as count FROM pages WHERE book_id = ?`, [normalizeParam(bookId)]);
      return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
    }
    const row = getSync(`SELECT COUNT(*) as count FROM pages`);
    return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
  },

  listAll() {
    return allSync(`SELECT * FROM pages ORDER BY book_id ASC, page_index ASC`);
  },
};

const media_files = {
  create({
    id,
    user_id,
    book_id = null,
    file_name,
    mime_type,
    size,
    encrypted_blob_path,
    created_at,
  } = {}) {
    const mid = id || `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const uId = normalizeParam(user_id);
    const bId = normalizeParam(book_id);
    const fName = normalizeParam(file_name);
    const mType = normalizeParam(mime_type);
    const s = normalizeParam(size);
    const blobPath = normalizeParam(encrypted_blob_path);
    const cAt = created_at || new Date().toISOString();

    runSync(
      `INSERT INTO media_files (id, user_id, book_id, file_name, mime_type, size, encrypted_blob_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [mid, uId, bId, fName, mType, s, blobPath, cAt]
    );
    return this.findById(mid);
  },

  findById(id) {
    if (!id) return null;
    return getSync(`SELECT * FROM media_files WHERE id = ?`, [normalizeParam(id)]);
  },

  findByUserId(userId) {
    if (!userId) return [];
    return allSync(`SELECT * FROM media_files WHERE user_id = ? ORDER BY created_at DESC`, [normalizeParam(userId)]);
  },

  listByUser(userId) {
    return this.findByUserId(userId);
  },

  findByBookId(bookId) {
    if (!bookId) return [];
    return allSync(`SELECT * FROM media_files WHERE book_id = ? ORDER BY created_at DESC`, [normalizeParam(bookId)]);
  },

  delete(id) {
    if (!id) return { changes: 0 };
    return runSync(`DELETE FROM media_files WHERE id = ?`, [normalizeParam(id)]);
  },

  listAll() {
    return allSync(`SELECT * FROM media_files ORDER BY created_at DESC`);
  },

  count(userId = null) {
    if (userId) {
      const row = getSync(`SELECT COUNT(*) as count FROM media_files WHERE user_id = ?`, [normalizeParam(userId)]);
      return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
    }
    const row = getSync(`SELECT COUNT(*) as count FROM media_files`);
    return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
  },
};

const audit_logs = {
  create({
    id,
    timestamp,
    event_type,
    action,
    username,
    actor,
    ip_address,
    ip,
    user_agent = null,
    resource,
    target,
    status = 'SUCCESS',
    encrypted_details,
    details,
    iv = null,
    auth_tag = null,
  } = {}) {
    const lid = id || `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const ts = timestamp || new Date().toISOString();
    const cleanEventType = (event_type !== undefined && event_type !== null) ? event_type : ((action !== undefined && action !== null) ? action : 'UNKNOWN');
    const cleanUsername = (username !== undefined && username !== null) ? username : ((actor !== undefined && actor !== null) ? actor : 'anonymous');
    const cleanIp = (ip_address !== undefined && ip_address !== null) ? ip_address : ((ip !== undefined && ip !== null) ? ip : '127.0.0.1');
    const cleanResource = resource !== undefined ? resource : (target !== undefined ? target : null);
    const cleanDetails = encrypted_details !== undefined ? encrypted_details : (details !== undefined ? details : '');
    const cleanStatus = status || 'SUCCESS';
    const cleanUserAgent = user_agent !== undefined ? user_agent : null;
    const cleanIv = iv !== undefined ? iv : null;
    const cleanAuthTag = auth_tag !== undefined ? auth_tag : null;

    runSync(
      `INSERT INTO audit_logs (id, timestamp, action, actor, ip, target, details, status, user_agent, event_type, username, ip_address, resource, encrypted_details, iv, auth_tag)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lid,
        ts,
        cleanEventType,
        cleanUsername,
        cleanIp,
        cleanResource,
        cleanDetails,
        cleanStatus,
        cleanUserAgent,
        cleanEventType,
        cleanUsername,
        cleanIp,
        cleanResource,
        cleanDetails,
        cleanIv,
        cleanAuthTag,
      ]
    );
    return this.findById(lid);
  },

  findById(id) {
    if (!id) return null;
    const row = getSync(`SELECT * FROM audit_logs WHERE id = ?`, [normalizeParam(id)]);
    return normalizeAuditLogRow(row);
  },

  delete(id) {
    if (!id) return { changes: 0 };
    return runSync(`DELETE FROM audit_logs WHERE id = ?`, [normalizeParam(id)]);
  },

  clear() {
    return runSync(`DELETE FROM audit_logs`);
  },

  _buildWhereClause(filters = {}) {
    const conds = [];
    const params = [];

    const actor = filters.actor || filters.username;
    if (actor && typeof actor === 'string' && actor.trim()) {
      conds.push(`(actor LIKE ? OR username LIKE ?)`);
      params.push(`%${actor.trim()}%`, `%${actor.trim()}%`);
    }

    const action = filters.action || filters.event_type;
    if (action && typeof action === 'string' && action.trim()) {
      conds.push(`(UPPER(action) = UPPER(?) OR UPPER(event_type) = UPPER(?))`);
      params.push(action.trim(), action.trim());
    }

    if (filters.status && typeof filters.status === 'string' && filters.status.trim()) {
      conds.push(`UPPER(status) = UPPER(?)`);
      params.push(filters.status.trim());
    }

    if (filters.startDate && typeof filters.startDate === 'string' && filters.startDate.trim()) {
      conds.push(`timestamp >= ?`);
      params.push(filters.startDate.trim());
    }

    if (filters.endDate && typeof filters.endDate === 'string' && filters.endDate.trim()) {
      conds.push(`timestamp <= ?`);
      params.push(filters.endDate.trim());
    }

    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      conds.push(
        `(actor LIKE ? OR username LIKE ? OR action LIKE ? OR event_type LIKE ? OR target LIKE ? OR resource LIKE ? OR details LIKE ? OR encrypted_details LIKE ? OR ip LIKE ? OR ip_address LIKE ?)`
      );
      params.push(q, q, q, q, q, q, q, q, q, q);
    }

    return {
      whereClause: conds.length > 0 ? conds.join(' AND ') : '',
      params: params.map(normalizeParam),
    };
  },

  count(filters = {}) {
    const { whereClause, params } = this._buildWhereClause(filters);
    const sql = `SELECT COUNT(*) as count FROM audit_logs` + (whereClause ? ` WHERE ${whereClause}` : '');
    const row = getSync(sql, params);
    return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
  },

  query(options = {}) {
    const {
      limit = 100,
      offset = 0,
      search,
      action,
      event_type,
      actor,
      username,
      status,
      startDate,
      endDate,
    } = options;

    const { whereClause, params } = this._buildWhereClause({
      search,
      action: action || event_type,
      actor: actor || username,
      status,
      startDate,
      endDate,
    });

    const parsedLimit = Math.max(1, parseInt(limit, 10) || 100);
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

    let sql = `SELECT * FROM audit_logs`;
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }
    sql += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    const finalParams = [...params, parsedLimit, parsedOffset].map(normalizeParam);

    const rows = allSync(sql, finalParams);
    return rows.map(normalizeAuditLogRow);
  },
};

const sessions = {
  create({ id, user_id, token_hash, expires_at, created_at } = {}) {
    const sid = id || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const uId = normalizeParam(user_id);
    const tHash = normalizeParam(token_hash);
    const expAt = normalizeParam(expires_at);
    const cAt = created_at || new Date().toISOString();

    runSync(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [sid, uId, tHash, expAt, cAt]
    );
    return this.findById(sid);
  },

  findById(id) {
    if (!id) return null;
    return getSync(`SELECT * FROM sessions WHERE id = ?`, [normalizeParam(id)]);
  },

  findByTokenHash(tokenHash) {
    if (!tokenHash) return null;
    return getSync(`SELECT * FROM sessions WHERE token_hash = ?`, [normalizeParam(tokenHash)]);
  },

  get(tokenHash) {
    return this.findByTokenHash(tokenHash);
  },

  delete(tokenHashOrId) {
    if (!tokenHashOrId) return { changes: 0 };
    const p = normalizeParam(tokenHashOrId);
    return runSync(`DELETE FROM sessions WHERE token_hash = ? OR id = ?`, [p, p]);
  },

  deleteByTokenHash(tokenHash) {
    if (!tokenHash) return { changes: 0 };
    return runSync(`DELETE FROM sessions WHERE token_hash = ?`, [normalizeParam(tokenHash)]);
  },

  deleteExpired(nowIso = null) {
    const now = nowIso || new Date().toISOString();
    return runSync(`DELETE FROM sessions WHERE expires_at < ?`, [now]);
  },

  cleanup(nowIso = null) {
    return this.deleteExpired(nowIso);
  },

  deleteByUserId(userId) {
    if (!userId) return { changes: 0 };
    return runSync(`DELETE FROM sessions WHERE user_id = ?`, [normalizeParam(userId)]);
  },
};

const redeemKeys = {
  create({
    id,
    key_code,
    target_tier = 'ultimate',
    max_uses = 1,
    used_count = 0,
    is_active = 1,
    created_by = 'admin',
    redeemed_by = null,
    redeemed_at = null,
    created_at,
    notes = null,
  } = {}) {
    const keyId = id || `key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = created_at || new Date().toISOString();
    runSync(
      `INSERT INTO redeem_keys (id, key_code, target_tier, max_uses, used_count, is_active, created_by, redeemed_by, redeemed_at, created_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [keyId, key_code, target_tier, max_uses, used_count, is_active, created_by, redeemed_by, redeemed_at, now, notes]
    );
    return this.findById(keyId);
  },

  findById(id) {
    if (!id) return null;
    return getSync(`SELECT * FROM redeem_keys WHERE id = ?`, [normalizeParam(id)]);
  },

  findByCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return getSync(`SELECT * FROM redeem_keys WHERE key_code = ? COLLATE NOCASE`, [clean]);
  },

  listAll(limit = 200) {
    return allSync(`SELECT * FROM redeem_keys ORDER BY created_at DESC LIMIT ?`, [limit]);
  },

  listActive() {
    return allSync(`SELECT * FROM redeem_keys WHERE is_active = 1 AND used_count < max_uses ORDER BY created_at DESC`);
  },

  update(id, fields = {}) {
    const sets = [];
    const params = [];
    for (const [key, val] of Object.entries(fields)) {
      if (key === 'id') continue;
      sets.push(`${key} = ?`);
      params.push(normalizeParam(val));
    }
    if (sets.length === 0) return this.findById(id);
    params.push(normalizeParam(id));
    runSync(`UPDATE redeem_keys SET ${sets.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  revoke(id) {
    return this.update(id, { is_active: 0 });
  },

  delete(id) {
    if (!id) return { changes: 0 };
    return runSync(`DELETE FROM redeem_keys WHERE id = ?`, [normalizeParam(id)]);
  },

  count() {
    const row = getSync(`SELECT COUNT(*) as count FROM redeem_keys`);
    return row ? (row.count !== undefined ? row.count : (row['COUNT(*)'] || 0)) : 0;
  },
};

/**
 * Initializes the SQLite database and executes the schema DDL.
 * @param {string} [dbPath] - Custom SQLite file path or ':memory:'
 * @param {object} [options] - Connection options
 * @returns {SQLiteDriver} The initialized database driver instance.
 */
function initDb(dbPath, options = {}) {
  const resolvedPath = dbPath || resolveDefaultDbPath();
  const driver = new SQLiteDriver(resolvedPath, options);
  driver.exec(SCHEMA_DDL);
  try {
    driver.exec(`ALTER TABLE users ADD COLUMN admin_envelope TEXT;`);
  } catch (e) {}
  try {
    driver.exec(`ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'classic';`);
  } catch (e) {}
  try {
    driver.exec(`ALTER TABLE users ADD COLUMN active_session_id TEXT;`);
  } catch (e) {}
  driver.users = users;
  driver.books = books;
  driver.pages = pages;
  driver.media_files = media_files;
  driver.audit_logs = audit_logs;
  driver.sessions = sessions;
  driver.redeem_keys = redeemKeys;
  driver.redeemKeys = redeemKeys;
  defaultDbInstance = driver;
  return driver;
}

/**
 * Gets the current active database instance, initializing if not already created.
 * @returns {SQLiteDriver}
 */
function getDb() {
  if (!defaultDbInstance) {
    return initDb();
  }
  return defaultDbInstance;
}

/**
 * Closes the active database connection.
 */
function closeDb() {
  if (defaultDbInstance) {
    defaultDbInstance.close();
    defaultDbInstance = null;
  }
}

module.exports = {
  SCHEMA_DDL,
  TABLES,
  initDb,
  getDb,
  closeDb,
  run,
  runSync,
  get,
  getSync,
  all,
  allSync,
  query,
  querySync,
  exec,
  transaction,
  normalizeAuditLogRow,
  users,
  books,
  pages,
  media_files,
  audit_logs,
  sessions,
  redeem_keys: redeemKeys,
  redeemKeys,
};
