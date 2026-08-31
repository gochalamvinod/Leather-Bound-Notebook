/**
 * SQLite Database Schema Definition
 * Leatherbound Notebook Application
 *
 * Tables:
 *  - users: User credentials, roles, salt, admin flag, and encrypted profile metadata.
 *  - books: Notebook records, user association, encrypted title & metadata, soft-delete flag.
 *  - pages: Individual notebook pages with encrypted content, drawings, ordering.
 *  - media_files: Uploaded media metadata & paths with user/book relations.
 *  - audit_logs: Encrypted tamper-evident audit trail entries with dual-naming support & GCM envelopes.
 *  - sessions: Active user sessions, token hashes, and expiration timestamps.
 */

const SCHEMA_DDL = `
-- Pragmas for integrity and concurrency
PRAGMA foreign_keys = ON;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  preferred_name TEXT,
  role TEXT DEFAULT 'user',
  tier TEXT DEFAULT 'classic',
  is_admin INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  encrypted_profile TEXT,
  admin_envelope TEXT,
  active_session_id TEXT,
  email TEXT,
  google_id TEXT,
  auth_provider TEXT DEFAULT 'local'
);

-- 2. Books table (Notebooks)
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title_encrypted TEXT,
  meta_encrypted TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Pages table
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  title_encrypted TEXT,
  content_encrypted TEXT,
  drawings_encrypted TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 4. Media Files table
CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  encrypted_blob_path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
);

-- 5. Audit Logs table (supporting both canonical and legacy naming conventions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action TEXT,
  actor TEXT,
  ip TEXT,
  target TEXT,
  details TEXT,
  status TEXT DEFAULT 'SUCCESS',
  user_agent TEXT,
  event_type TEXT,
  username TEXT,
  ip_address TEXT,
  resource TEXT,
  encrypted_details TEXT,
  iv TEXT,
  auth_tag TEXT
);

-- 6. Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Redeem Keys table (Format: XXXX-XXXX-XXXX-XXXX-XXXX)
CREATE TABLE IF NOT EXISTS redeem_keys (
  id TEXT PRIMARY KEY,
  key_code TEXT UNIQUE NOT NULL COLLATE NOCASE,
  target_tier TEXT NOT NULL DEFAULT 'ultimate',
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_by TEXT DEFAULT 'admin',
  redeemed_by TEXT,
  redeemed_at TEXT,
  created_at TEXT NOT NULL,
  notes TEXT
);

-- Relational & Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email COLLATE NOCASE) WHERE email IS NOT NULL AND email != '';
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_deleted ON books(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at);

CREATE INDEX IF NOT EXISTS idx_pages_book_id ON pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_book_page_index ON pages(book_id, page_index);
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at);

CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_book_id ON media_files(book_id);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_redeem_keys_code ON redeem_keys(key_code);
CREATE INDEX IF NOT EXISTS idx_redeem_keys_is_active ON redeem_keys(is_active);
`;

const TABLES = {
  USERS: 'users',
  BOOKS: 'books',
  PAGES: 'pages',
  MEDIA_FILES: 'media_files',
  AUDIT_LOGS: 'audit_logs',
  SESSIONS: 'sessions',
  REDEEM_KEYS: 'redeem_keys',
};

module.exports = {
  SCHEMA_DDL,
  TABLES,
};
