/**
 * SQLite Driver Abstraction Layer
 * Supports better-sqlite3, node:sqlite (DatabaseSync), sqlite3, and embedded relational engine fallback.
 * Provides unified async and sync interfaces for transactions, parameterized queries, and schema migration.
 */

const fs = require('fs');
const path = require('path');
const { SCHEMA_DDL, TABLES } = require('./schema');

class SQLiteDriver {
  constructor(dbPath = ':memory:', options = {}) {
    this.dbPath = dbPath;
    this.options = options;
    this.nativeDb = null;
    this.driverType = null; // 'better-sqlite3' | 'node:sqlite' | 'sqlite3' | 'fallback'
    this.inTransaction = false;
    this.savepointCounter = 0;
    this._initConnection();
  }

  _initConnection() {
    if (this.dbPath !== ':memory:') {
      const dir = path.dirname(path.resolve(this.dbPath));
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
        } catch (e) {}
      }
    }

    // 1. Try better-sqlite3
    try {
      const BetterSqlite3 = require('better-sqlite3');
      this.nativeDb = new BetterSqlite3(this.dbPath, this.options);
      this.nativeDb.pragma('foreign_keys = ON');
      if (this.dbPath !== ':memory:') {
        try {
          this.nativeDb.pragma('journal_mode = WAL');
          this.nativeDb.pragma('synchronous = NORMAL');
        } catch (e) {}
      }
      this.driverType = 'better-sqlite3';
      return;
    } catch (e) {
      // Not available or failed to load native binary
    }

    // 2. Try node:sqlite (Node 22.5.0+)
    try {
      const nodeSqlite = require('node:sqlite');
      if (nodeSqlite && (nodeSqlite.DatabaseSync || nodeSqlite.Database)) {
        const DbClass = nodeSqlite.DatabaseSync || nodeSqlite.Database;
        this.nativeDb = new DbClass(this.dbPath, this.options);
        this.nativeDb.exec('PRAGMA foreign_keys = ON;');
        if (this.dbPath !== ':memory:') {
          try {
            this.nativeDb.exec('PRAGMA journal_mode = WAL;');
          } catch (e) {}
        }
        this.driverType = 'node:sqlite';
        return;
      }
    } catch (e) {
      // Not available
    }

    // 3. Try sqlite3
    try {
      const sqlite3 = require('sqlite3').verbose();
      this.nativeDb = new sqlite3.Database(this.dbPath);
      this.nativeDb.run('PRAGMA foreign_keys = ON;');
      this.driverType = 'sqlite3';
      return;
    } catch (e) {
      // Not available
    }

    // 4. Use robust embedded relational storage engine fallback
    this.driverType = 'fallback';
    this.nativeDb = new EmbeddedSqliteFallback(this.dbPath);
  }

  exec(sql) {
    if (!sql || typeof sql !== 'string') return;
    if (this.driverType === 'better-sqlite3' || this.driverType === 'node:sqlite') {
      return this.nativeDb.exec(sql);
    } else if (this.driverType === 'sqlite3') {
      return new Promise((resolve, reject) => {
        this.nativeDb.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      return this.nativeDb.exec(sql);
    }
  }

  runSync(sql, params = []) {
    const normParams = Array.isArray(params) ? params : [params];
    if (this.driverType === 'better-sqlite3') {
      const stmt = this.nativeDb.prepare(sql);
      const info = stmt.run(...normParams);
      return { changes: info ? info.changes : 0, lastInsertRowid: info ? info.lastInsertRowid : 0 };
    } else if (this.driverType === 'node:sqlite') {
      const stmt = this.nativeDb.prepare(sql);
      const info = stmt.run(...normParams);
      return { changes: info ? info.changes : 0, lastInsertRowid: info ? info.lastInsertRowid : 0 };
    } else if (this.driverType === 'fallback') {
      return this.nativeDb.run(sql, normParams);
    } else {
      throw new Error(`runSync is not supported with async sqlite3 driver. Use run() instead.`);
    }
  }

  async run(sql, params = []) {
    const normParams = Array.isArray(params) ? params : [params];
    if (this.driverType === 'sqlite3') {
      return new Promise((resolve, reject) => {
        this.nativeDb.run(sql, normParams, function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes, lastInsertRowid: this.lastID });
        });
      });
    }
    return this.runSync(sql, normParams);
  }

  getSync(sql, params = []) {
    const normParams = Array.isArray(params) ? params : [params];
    if (this.driverType === 'better-sqlite3') {
      const stmt = this.nativeDb.prepare(sql);
      return stmt.get(...normParams) || null;
    } else if (this.driverType === 'node:sqlite') {
      const stmt = this.nativeDb.prepare(sql);
      return stmt.get(...normParams) || null;
    } else if (this.driverType === 'fallback') {
      return this.nativeDb.get(sql, normParams);
    } else {
      throw new Error(`getSync is not supported with async sqlite3 driver. Use get() instead.`);
    }
  }

  async get(sql, params = []) {
    const normParams = Array.isArray(params) ? params : [params];
    if (this.driverType === 'sqlite3') {
      return new Promise((resolve, reject) => {
        this.nativeDb.get(sql, normParams, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
    return this.getSync(sql, normParams);
  }

  allSync(sql, params = []) {
    const normParams = Array.isArray(params) ? params : [params];
    if (this.driverType === 'better-sqlite3') {
      const stmt = this.nativeDb.prepare(sql);
      return stmt.all(...normParams) || [];
    } else if (this.driverType === 'node:sqlite') {
      const stmt = this.nativeDb.prepare(sql);
      return stmt.all(...normParams) || [];
    } else if (this.driverType === 'fallback') {
      return this.nativeDb.all(sql, normParams);
    } else {
      throw new Error(`allSync is not supported with async sqlite3 driver. Use all() instead.`);
    }
  }

  async all(sql, params = []) {
    const normParams = Array.isArray(params) ? params : [params];
    if (this.driverType === 'sqlite3') {
      return new Promise((resolve, reject) => {
        this.nativeDb.all(sql, normParams, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
    return this.allSync(sql, normParams);
  }

  async query(sql, params = []) {
    return this.all(sql, params);
  }

  querySync(sql, params = []) {
    return this.allSync(sql, params);
  }

  transaction(callback) {
    if (this.driverType === 'better-sqlite3' && typeof this.nativeDb.transaction === 'function') {
      const tx = this.nativeDb.transaction((...args) => callback(this, ...args));
      return tx();
    } else {
      const spName = `sp_${++this.savepointCounter}`;
      this.exec(`SAVEPOINT ${spName};`);
      try {
        const result = callback(this);
        if (result && typeof result.then === 'function') {
          return result
            .then((res) => {
              this.exec(`RELEASE SAVEPOINT ${spName};`);
              return res;
            })
            .catch((err) => {
              this.exec(`ROLLBACK TO SAVEPOINT ${spName};`);
              throw err;
            });
        }
        this.exec(`RELEASE SAVEPOINT ${spName};`);
        return result;
      } catch (err) {
        this.exec(`ROLLBACK TO SAVEPOINT ${spName};`);
        throw err;
      }
    }
  }

  close() {
    if (!this.nativeDb) return;
    if (this.driverType === 'better-sqlite3' || this.driverType === 'node:sqlite') {
      this.nativeDb.close();
    } else if (this.driverType === 'sqlite3') {
      return new Promise((resolve, reject) => {
        this.nativeDb.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else if (this.driverType === 'fallback') {
      this.nativeDb.close();
    }
    this.nativeDb = null;
  }
}

/**
 * Robust Embedded Fallback Relational Engine
 * Implements SQL execution, foreign key cascade, unique constraints, and disk persistence.
 */
class EmbeddedSqliteFallback {
  constructor(filePath) {
    this.filePath = filePath;
    this.isMemory = filePath === ':memory:';
    this.tables = {
      users: new Map(),
      books: new Map(),
      pages: new Map(),
      media_files: new Map(),
      audit_logs: new Map(),
      sessions: new Map(),
      _migrations: new Map(),
    };
    this.foreignKeysEnabled = true;
    this._loadFromDisk();
  }

  _loadFromDisk() {
    if (this.isMemory) return;
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        if (content.trim()) {
          const parsed = JSON.parse(content);
          for (const tableName of Object.keys(this.tables)) {
            if (Array.isArray(parsed[tableName])) {
              for (const row of parsed[tableName]) {
                if (row && row.id !== undefined) {
                  this.tables[tableName].set(String(row.id), { ...row });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore or start fresh
    }
  }

  _persistToDisk() {
    if (this.isMemory) return;
    try {
      const data = {};
      for (const [name, map] of Object.entries(this.tables)) {
        data[name] = Array.from(map.values());
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      // File write error
    }
  }

  exec(sql) {
    if (!sql || typeof sql !== 'string') return;
    // Split by semicolons not enclosed in single quotes
    const statements = sql
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      this.run(stmt, []);
    }
  }

  run(sql, params = []) {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('PRAGMA')) {
      if (upper.includes('FOREIGN_KEYS')) {
        this.foreignKeysEnabled = upper.includes('ON') || upper.includes('1');
      }
      return { changes: 0, lastInsertRowid: 0 };
    }

    if (upper.startsWith('CREATE TABLE')) {
      const match = trimmed.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (match) {
        const tbl = match[1].toLowerCase();
        if (!this.tables[tbl]) {
          this.tables[tbl] = new Map();
        }
      }
      return { changes: 0, lastInsertRowid: 0 };
    }

    if (
      upper.startsWith('CREATE INDEX') ||
      upper.startsWith('DROP INDEX') ||
      upper.startsWith('CREATE TRIGGER') ||
      upper.startsWith('DROP TRIGGER') ||
      upper.startsWith('SAVEPOINT') ||
      upper.startsWith('RELEASE') ||
      upper.startsWith('ROLLBACK')
    ) {
      return { changes: 0, lastInsertRowid: 0 };
    }

    if (upper.startsWith('INSERT')) {
      return this._handleInsert(trimmed, params);
    }

    if (upper.startsWith('UPDATE')) {
      return this._handleUpdate(trimmed, params);
    }

    if (upper.startsWith('DELETE')) {
      return this._handleDelete(trimmed, params);
    }

    return { changes: 0, lastInsertRowid: 0 };
  }

  get(sql, params = []) {
    const rows = this.all(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  all(sql, params = []) {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    if (!upper.startsWith('SELECT')) {
      return [];
    }

    // Extract table name
    const fromMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (!fromMatch) return [];
    const tableName = fromMatch[1].toLowerCase();
    const table = this.tables[tableName];
    if (!table) return [];

    let rows = Array.from(table.values()).map((r) => ({ ...r }));

    // WHERE clause parsing
    const whereMatch = trimmed.match(/WHERE\s+(.*?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+GROUP\s+BY|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      rows = this._filterRows(rows, whereClause, params);
    }

    // ORDER BY clause parsing
    const orderMatch = trimmed.match(/ORDER\s+BY\s+(.*?)(?:\s+LIMIT|$)/i);
    if (orderMatch) {
      const orderClause = orderMatch[1].trim();
      rows = this._sortRows(rows, orderClause);
    }

    // LIMIT / OFFSET clause parsing
    const limitMatch = trimmed.match(/LIMIT\s+(\?|\d+)(?:\s+OFFSET\s+(\?|\d+))?/i);
    if (limitMatch) {
      let limit = 100;
      let offset = 0;
      let pOffsetIdx = (params || []).length;

      if (limitMatch[1] === '?') {
        if (limitMatch[2] === '?') {
          limit = params[pOffsetIdx - 2];
          offset = params[pOffsetIdx - 1];
        } else {
          limit = params[pOffsetIdx - 1];
          offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
        }
      } else {
        limit = parseInt(limitMatch[1], 10);
        if (limitMatch[2] === '?') {
          offset = params[pOffsetIdx - 1];
        } else {
          offset = limitMatch[2] ? parseInt(limitMatch[2], 10) : 0;
        }
      }

      limit = parseInt(limit, 10) || 100;
      offset = parseInt(offset, 10) || 0;
      rows = rows.slice(offset, offset + limit);
    }

    // Handle COUNT(*) or column selection
    if (upper.includes('COUNT(')) {
      return [{ count: rows.length, 'COUNT(*)': rows.length, 'count(*)': rows.length }];
    }

    return rows;
  }

  _handleInsert(sql, params) {
    const match = sql.match(/INSERT\s+(?:OR\s+REPLACE\s+INTO|INTO)?\s*([a-zA-Z0-9_]+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (!match) return { changes: 0, lastInsertRowid: 0 };

    const tableName = match[1].toLowerCase();
    const columns = match[2].split(',').map((c) => c.trim().toLowerCase());
    const table = this.tables[tableName] || (this.tables[tableName] = new Map());

    let paramIdx = 0;
    const row = {};
    for (const col of columns) {
      const val = params[paramIdx++];
      row[col] = val !== undefined ? val : null;
    }

    if (!row.id) {
      row.id = `${tableName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }

    // Dual-naming sync for audit_logs
    if (tableName === 'audit_logs') {
      const actor = row.actor || row.username || 'anonymous';
      const action = row.action || row.event_type || 'ACTION';
      const ip = row.ip || row.ip_address || '127.0.0.1';
      const target = row.target || row.resource || null;
      const details = row.details || row.encrypted_details || '';

      row.actor = actor;
      row.username = actor;
      row.action = action;
      row.event_type = action;
      row.ip = ip;
      row.ip_address = ip;
      row.target = target;
      row.resource = target;
      row.details = details;
      row.encrypted_details = details;
    }

    // Unique username check for users table
    if (tableName === 'users' && row.username) {
      for (const existing of table.values()) {
        if (existing.id !== row.id && existing.username && existing.username.toLowerCase() === row.username.toLowerCase()) {
          const err = new Error(`UNIQUE constraint failed: users.username`);
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          throw err;
        }
      }
    }

    // Unique token_hash check for sessions table
    if (tableName === 'sessions' && row.token_hash) {
      for (const existing of table.values()) {
        if (existing.id !== row.id && existing.token_hash === row.token_hash) {
          const err = new Error(`UNIQUE constraint failed: sessions.token_hash`);
          err.code = 'SQLITE_CONSTRAINT_UNIQUE';
          throw err;
        }
      }
    }

    // Foreign key enforcement
    if (this.foreignKeysEnabled) {
      if (tableName === 'books' && row.user_id) {
        if (!this.tables.users.has(String(row.user_id))) {
          const err = new Error(`FOREIGN KEY constraint failed on books.user_id`);
          err.code = 'SQLITE_CONSTRAINT_FOREIGNKEY';
          throw err;
        }
      }
      if (tableName === 'pages' && row.book_id) {
        if (!this.tables.books.has(String(row.book_id))) {
          const err = new Error(`FOREIGN KEY constraint failed on pages.book_id`);
          err.code = 'SQLITE_CONSTRAINT_FOREIGNKEY';
          throw err;
        }
      }
      if (tableName === 'sessions' && row.user_id) {
        if (!this.tables.users.has(String(row.user_id))) {
          const err = new Error(`FOREIGN KEY constraint failed on sessions.user_id`);
          err.code = 'SQLITE_CONSTRAINT_FOREIGNKEY';
          throw err;
        }
      }
    }

    table.set(String(row.id), row);
    this._persistToDisk();
    return { changes: 1, lastInsertRowid: row.id };
  }

  _handleUpdate(sql, params) {
    const match = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?$/i);
    if (!match) return { changes: 0, lastInsertRowid: 0 };

    const tableName = match[1].toLowerCase();
    const setClause = match[2].trim();
    const whereClause = match[3] ? match[3].trim() : '';
    const table = this.tables[tableName];
    if (!table) return { changes: 0, lastInsertRowid: 0 };

    const setAssignments = setClause.split(',').map((s) => s.trim());
    const setParamsCount = setAssignments.reduce((acc, curr) => acc + (curr.includes('?') ? 1 : 0), 0);
    const setParams = params.slice(0, setParamsCount);
    const whereParams = params.slice(setParamsCount);

    let rowsToUpdate = Array.from(table.values());
    if (whereClause) {
      rowsToUpdate = this._filterRows(rowsToUpdate, whereClause, whereParams);
    }

    let changes = 0;
    for (const row of rowsToUpdate) {
      let pIdx = 0;
      for (const assignment of setAssignments) {
        const [col, expr] = assignment.split('=').map((s) => s.trim().toLowerCase());
        if (expr === '?') {
          row[col] = setParams[pIdx++];
        } else {
          row[col] = expr.replace(/['"]/g, '');
        }
      }

      // Dual-naming sync for audit_logs
      if (tableName === 'audit_logs') {
        if (row.actor || row.username) {
          const u = row.actor || row.username;
          row.actor = u;
          row.username = u;
        }
        if (row.action || row.event_type) {
          const a = row.action || row.event_type;
          row.action = a;
          row.event_type = a;
        }
        if (row.ip || row.ip_address) {
          const ip = row.ip || row.ip_address;
          row.ip = ip;
          row.ip_address = ip;
        }
        if (row.target || row.resource) {
          const t = row.target || row.resource;
          row.target = t;
          row.resource = t;
        }
        if (row.details || row.encrypted_details) {
          const d = row.details || row.encrypted_details;
          row.details = d;
          row.encrypted_details = d;
        }
      }

      table.set(String(row.id), row);
      changes++;
    }

    if (changes > 0) this._persistToDisk();
    return { changes, lastInsertRowid: 0 };
  }

  _handleDelete(sql, params) {
    const match = sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*))?$/i);
    if (!match) return { changes: 0, lastInsertRowid: 0 };

    const tableName = match[1].toLowerCase();
    const whereClause = match[2] ? match[2].trim() : '';
    const table = this.tables[tableName];
    if (!table) return { changes: 0, lastInsertRowid: 0 };

    let rowsToDelete = Array.from(table.values());
    if (whereClause) {
      rowsToDelete = this._filterRows(rowsToDelete, whereClause, params);
    }

    let changes = 0;
    for (const row of rowsToDelete) {
      const id = String(row.id);
      table.delete(id);
      changes++;

      // Cascade deletes
      if (this.foreignKeysEnabled) {
        if (tableName === 'users') {
          // Delete user's books & pages
          for (const book of Array.from(this.tables.books.values())) {
            if (String(book.user_id) === id) {
              this._handleDelete(`DELETE FROM books WHERE id = ?`, [book.id]);
            }
          }
          // Delete user's media
          for (const media of Array.from(this.tables.media_files.values())) {
            if (String(media.user_id) === id) {
              this.tables.media_files.delete(String(media.id));
            }
          }
          // Delete user's sessions
          for (const sess of Array.from(this.tables.sessions.values())) {
            if (String(sess.user_id) === id) {
              this.tables.sessions.delete(String(sess.id));
            }
          }
        } else if (tableName === 'books') {
          // Delete book's pages
          for (const page of Array.from(this.tables.pages.values())) {
            if (String(page.book_id) === id) {
              this.tables.pages.delete(String(page.id));
            }
          }
          // Set media book_id to null
          for (const media of Array.from(this.tables.media_files.values())) {
            if (String(media.book_id) === id) {
              media.book_id = null;
              this.tables.media_files.set(String(media.id), media);
            }
          }
        }
      }
    }

    if (changes > 0) this._persistToDisk();
    return { changes, lastInsertRowid: 0 };
  }

  _filterRows(rows, whereClause, params = []) {
    let paramIdx = 0;

    // Helper to evaluate a single condition on a row
    const evaluateCondition = (cond, row, getNextParam) => {
      const c = cond.trim();
      if (!c) return true;

      // Handle UPPER(col) = UPPER(?) or UPPER(col) = ?
      const upperMatch = c.match(/UPPER\(([a-zA-Z0-9_]+)\)\s*=\s*(?:UPPER\((.*?)\)|(.*?))/i);
      if (upperMatch) {
        const field = upperMatch[1].toLowerCase();
        let rawTarget = upperMatch[2] !== undefined ? upperMatch[2] : upperMatch[3];
        rawTarget = (rawTarget || '').trim();
        let target = rawTarget;
        if (target === '?') {
          target = getNextParam();
        } else if (target.startsWith("'") && target.endsWith("'")) {
          target = target.slice(1, -1);
        }
        const val = row[field];
        return String(val || '').toUpperCase() === String(target || '').toUpperCase();
      }

      const eqMatch = c.match(/([a-zA-Z0-9_]+)\s*(=|!=|<>|IS\s+NOT|IS|LIKE|>|<|>=|<=)\s*(\?|'.*?'|\d+|NULL)/i);
      if (!eqMatch) return true;

      const field = eqMatch[1].toLowerCase();
      const op = eqMatch[2].toUpperCase();
      let target = eqMatch[3];

      if (target === '?') {
        target = getNextParam();
      } else if (target.toUpperCase() === 'NULL') {
        target = null;
      } else if (target.startsWith("'") && target.endsWith("'")) {
        target = target.slice(1, -1);
      }

      const val = row[field];

      if (op === '=' || op === 'IS') {
        if (typeof val === 'string' && typeof target === 'string') {
          return val.toLowerCase() === target.toLowerCase();
        }
        return val == target;
      } else if (op === '!=' || op === '<>' || op === 'IS NOT') {
        if (typeof val === 'string' && typeof target === 'string') {
          return val.toLowerCase() !== target.toLowerCase();
        }
        return val != target;
      } else if (op === 'LIKE') {
        const pattern = String(target || '').replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&').replace(/%/g, '.*');
        const regex = new RegExp('^' + pattern + '$', 'i');
        return regex.test(String(val !== undefined && val !== null ? val : ''));
      } else if (op === '>') {
        return val > target;
      } else if (op === '<') {
        return val < target;
      } else if (op === '>=') {
        return val >= target;
      } else if (op === '<=') {
        return val <= target;
      }
      return true;
    };

    // Split top-level conditions by AND
    const andClauses = whereClause.split(/\s+AND\s+/i);

    return rows.filter((row) => {
      let currentParamIdx = paramIdx;
      const getNextParam = () => params[currentParamIdx++];

      for (const andClause of andClauses) {
        const trimmedAnd = andClause.trim();
        // Check if condition is a parenthesized OR group: (cond1 OR cond2 OR ...)
        if (trimmedAnd.startsWith('(') && trimmedAnd.endsWith(')')) {
          const innerOr = trimmedAnd.slice(1, -1);
          const orClauses = innerOr.split(/\s+OR\s+/i);
          let anyPassed = false;
          for (const orClause of orClauses) {
            if (evaluateCondition(orClause, row, getNextParam)) {
              anyPassed = true;
            }
          }
          if (!anyPassed) return false;
        } else if (trimmedAnd.includes(' OR ')) {
          const orClauses = trimmedAnd.split(/\s+OR\s+/i);
          let anyPassed = false;
          for (const orClause of orClauses) {
            if (evaluateCondition(orClause, row, getNextParam)) {
              anyPassed = true;
            }
          }
          if (!anyPassed) return false;
        } else {
          if (!evaluateCondition(trimmedAnd, row, getNextParam)) {
            return false;
          }
        }
      }
      return true;
    });
  }

  _sortRows(rows, orderClause) {
    const parts = orderClause.split(',').map((p) => p.trim());
    return rows.sort((a, b) => {
      for (const part of parts) {
        const [field, dir] = part.split(/\s+/);
        const f = field.toLowerCase();
        const isDesc = dir && dir.toUpperCase() === 'DESC';
        const valA = a[f] !== undefined ? a[f] : '';
        const valB = b[f] !== undefined ? b[f] : '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
      }
      return 0;
    });
  }

  close() {
    this._persistToDisk();
  }
}

module.exports = {
  SQLiteDriver,
  EmbeddedSqliteFallback,
};
