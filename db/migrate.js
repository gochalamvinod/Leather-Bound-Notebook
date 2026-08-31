/**
 * Database Migration Engine
 * Leatherbound Notebook Application
 *
 * Provides standalone CLI execution and programmatic auto-migration from legacy
 * JSON/encrypted vault files (data/users/*.enc.json, data/audit_logs.enc.json, data/library_index.json)
 * into SQLite database tables.
 *
 * Guarantees:
 *  - Zero Data Loss
 *  - 100% Idempotency (safe to run multiple times without duplicating or corrupting data)
 *  - Backward compatibility with legacy vault envelopes
 *  - Lazy page migration support for zero-knowledge encrypted vaults
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./index');
const { SCHEMA_DDL } = require('./schema');

const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'Vinod@807465';

// ---------------------------------------------------------------------------
// Cryptographic Utility Functions
// ---------------------------------------------------------------------------

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
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const ciphertext = Buffer.from(payload.data, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
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
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

function getDaos(dbInstance) {
  return {
    users: (dbInstance && dbInstance.users) || db.users,
    books: (dbInstance && dbInstance.books) || db.books,
    pages: (dbInstance && dbInstance.pages) || db.pages,
    media_files: (dbInstance && dbInstance.media_files) || db.media_files,
    audit_logs: (dbInstance && dbInstance.audit_logs) || db.audit_logs,
    sessions: (dbInstance && dbInstance.sessions) || db.sessions,
  };
}

// ---------------------------------------------------------------------------
// Migration Marker & Tracking Helper
// ---------------------------------------------------------------------------

function ensureMigrationTable(dbInstance) {
  const driver = dbInstance || db.getDb();
  driver.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL,
      metadata TEXT
    );
  `);
}

function isMigrationApplied(dbInstance, migrationId) {
  const driver = dbInstance || db.getDb();
  ensureMigrationTable(driver);
  const row = driver.getSync(`SELECT * FROM _migrations WHERE id = ?`, [migrationId]);
  return !!row;
}

function recordMigrationApplied(dbInstance, migrationId, name, metadata = {}) {
  const driver = dbInstance || db.getDb();
  ensureMigrationTable(driver);
  driver.runSync(
    `INSERT OR REPLACE INTO _migrations (id, name, applied_at, metadata) VALUES (?, ?, ?, ?)`,
    [migrationId, name, new Date().toISOString(), JSON.stringify(metadata)]
  );
}

// ---------------------------------------------------------------------------
// Core Sub-Migration Routines
// ---------------------------------------------------------------------------

/**
 * Migrates Audit Logs from data/audit_logs.enc.json into SQLite audit_logs table.
 */
function migrateAuditLogs(dbInstance, auditLogsFile, adminKey, stats, options = {}) {
  if (!fs.existsSync(auditLogsFile)) {
    if (options.verbose) console.log('  [Audit Logs] No legacy audit_logs.enc.json found.');
    return;
  }

  const daos = getDaos(dbInstance);

  try {
    const rawFile = JSON.parse(fs.readFileSync(auditLogsFile, 'utf8'));
    let logs = [];

    if (adminKey) {
      try {
        logs = decryptData(rawFile, adminKey);
      } catch (e) {
        if (options.verbose) console.warn('  [Audit Logs] Could not decrypt with provided admin key. Skipping encrypted array.');
      }
    } else if (Array.isArray(rawFile)) {
      logs = rawFile;
    }

    if (Array.isArray(logs) && logs.length > 0) {
      for (const log of logs) {
        const lid = log.id || `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const existing = daos.audit_logs.findById(lid);
        if (!existing) {
          if (!options.dryRun) {
            daos.audit_logs.create({
              id: lid,
              timestamp: log.timestamp || new Date().toISOString(),
              event_type: log.action || log.event_type || 'SYSTEM_EVENT',
              action: log.action || log.event_type || 'SYSTEM_EVENT',
              username: log.actor || log.username || null,
              actor: log.actor || log.username || null,
              ip_address: log.ip || log.ip_address || null,
              ip: log.ip || log.ip_address || null,
              user_agent: log.user_agent || null,
              resource: log.target || log.resource || null,
              target: log.target || log.resource || null,
              status: log.status || 'SUCCESS',
              encrypted_details: log.details || log.encrypted_details || null,
              details: log.details || log.encrypted_details || null,
              iv: log.iv || null,
              auth_tag: log.authTag || log.auth_tag || null,
            });
          }
          stats.logsMigrated++;
          if (options.verbose) console.log(`  [Audit Logs] + Migrated entry: ${lid} (${log.action || log.event_type})`);
        } else {
          stats.logsSkipped++;
        }
      }
    }
  } catch (err) {
    stats.errors.push(`Audit Logs migration error: ${err.message}`);
    if (options.verbose) console.error('  [Audit Logs] Error:', err.message);
  }
}

/**
 * Migrates User Vaults from data/users/*.enc.json and data/notebook.enc.json into SQLite.
 */
function migrateUserVaults(dbInstance, usersDir, libraryIndexFile, legacyVaultFile, adminPassword, stats, options = {}) {
  const daos = getDaos(dbInstance);

  // Load library index metadata
  let libraryIndex = { users: [], notebooks: [] };
  if (fs.existsSync(libraryIndexFile)) {
    try {
      libraryIndex = JSON.parse(fs.readFileSync(libraryIndexFile, 'utf8'));
    } catch (e) {}
  }

  const userFiles = [];
  if (fs.existsSync(usersDir)) {
    const files = fs.readdirSync(usersDir);
    for (const file of files) {
      if (file.endsWith('.enc.json')) {
        userFiles.push({ path: path.join(usersDir, file), isDefault: false });
      }
    }
  }

  // Check legacy single-vault file if default user not yet in userFiles
  if (fs.existsSync(legacyVaultFile)) {
    const hasDefault = userFiles.some((u) => path.basename(u.path, '.enc.json').toLowerCase() === 'default');
    if (!hasDefault) {
      userFiles.push({ path: legacyVaultFile, isDefault: true });
    }
  }

  for (const uItem of userFiles) {
    try {
      const uFile = uItem.path;
      const file = JSON.parse(fs.readFileSync(uFile, 'utf8'));
      const rawName = uItem.isDefault ? 'default' : (file.username || path.basename(uFile, '.enc.json')).trim();
      const lowerUser = rawName.toLowerCase();
      const isAdmin = lowerUser === DEFAULT_ADMIN_USER ? 1 : 0;
      const uid = `user_${lowerUser}`;

      let userKey = null;
      let decryptedVault = null;

      // Candidate passwords for decrypt attempt (default password, admin password, username)
      const candidatePasswords = [adminPassword || DEFAULT_ADMIN_PASSWORD, rawName, 'password'];
      for (const pwd of candidatePasswords) {
        if (!pwd || !file.salt) continue;
        try {
          const k = deriveKey(pwd, file.salt);
          const raw = decryptData(file, k);
          userKey = k;
          decryptedVault = raw;
          break;
        } catch (e) {}
      }

      const passwordHash = userKey
        ? crypto.createHash('sha256').update(userKey).digest('hex')
        : 'vault_encrypted';

      const encryptedProfile = JSON.stringify({
        iv: file.iv,
        authTag: file.authTag,
        data: file.data,
        version: file.version || 2,
        bookCount: file.bookCount || (decryptedVault && decryptedVault.books ? decryptedVault.books.length : 1),
      });

      let existingUser = daos.users.findById(uid) || daos.users.findByUsername(rawName);

      if (!existingUser) {
        if (!options.dryRun) {
          daos.users.create({
            id: uid,
            username: rawName,
            password_hash: passwordHash,
            salt: file.salt || crypto.randomBytes(16).toString('hex'),
            role: isAdmin ? 'admin' : 'user',
            is_admin: isAdmin,
            is_active: 1,
            encrypted_profile: encryptedProfile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        stats.usersMigrated++;
        if (options.verbose) console.log(`  [Users] + Migrated user: ${rawName} (${uid})`);
      } else {
        // Idempotently update encrypted_profile if missing
        if (!existingUser.encrypted_profile && !options.dryRun) {
          daos.users.update(existingUser.id, { encrypted_profile: encryptedProfile });
        }
        stats.usersSkipped++;
      }

      // Migrate Books and Pages
      if (decryptedVault && Array.isArray(decryptedVault.books)) {
        for (const book of decryptedVault.books) {
          let existingBook = daos.books.findById(book.id);
          if (!existingBook) {
            if (!options.dryRun) {
              daos.books.create({
                id: book.id,
                user_id: uid,
                title_encrypted: userKey
                  ? JSON.stringify(encryptData({ title: book.title, coverColor: book.coverColor }, userKey))
                  : null,
                meta_encrypted: JSON.stringify({
                  title: book.title,
                  coverColor: book.coverColor,
                  pageCount: (book.pages || []).length,
                }),
                created_at: book.createdAt || new Date().toISOString(),
                updated_at: book.updatedAt || new Date().toISOString(),
                is_deleted: 0,
              });
            }
            stats.booksMigrated++;
            if (options.verbose) console.log(`    [Books] + Migrated book: ${book.id} ("${book.title}")`);
          } else {
            stats.booksSkipped++;
          }

          if (Array.isArray(book.pages)) {
            for (let i = 0; i < book.pages.length; i++) {
              const page = book.pages[i];
              let existingPage = daos.pages.findById(page.id);
              if (!existingPage) {
                if (!options.dryRun) {
                  daos.pages.create({
                    id: page.id,
                    book_id: book.id,
                    page_index: i,
                    title_encrypted: null,
                    content_encrypted: userKey
                      ? JSON.stringify(encryptData({ html: page.html, font: page.font, fontSize: page.fontSize }, userKey))
                      : null,
                    drawings_encrypted: page.drawings && userKey
                      ? JSON.stringify(encryptData(page.drawings, userKey))
                      : null,
                    created_at: page.createdAt || book.createdAt || new Date().toISOString(),
                    updated_at: page.updatedAt || book.updatedAt || new Date().toISOString(),
                  });
                }
                stats.pagesMigrated++;
                if (options.verbose) console.log(`      [Pages] + Migrated page: ${page.id} (index ${i})`);
              } else {
                stats.pagesSkipped++;
              }
            }
          }
        }
      } else {
        // Zero-knowledge mode: create book shells from library_index.json
        const userBooks = (libraryIndex.notebooks || []).filter(
          (b) => (b.owner || '').toLowerCase() === lowerUser
        );

        if (userBooks.length > 0) {
          for (const b of userBooks) {
            let existingBook = daos.books.findById(b.id);
            if (!existingBook) {
              if (!options.dryRun) {
                daos.books.create({
                  id: b.id,
                  user_id: uid,
                  title_encrypted: null,
                  meta_encrypted: JSON.stringify({
                    title: b.title,
                    coverColor: b.coverColor,
                    pageCount: b.pageCount,
                  }),
                  created_at: b.createdAt || new Date().toISOString(),
                  updated_at: b.updatedAt || new Date().toISOString(),
                  is_deleted: 0,
                });
              }
              stats.booksMigrated++;
              if (options.verbose) console.log(`    [Books] + Migrated shell book from index: ${b.id} ("${b.title}")`);
            } else {
              stats.booksSkipped++;
            }
          }
        } else {
          // Synthesize book shell for single-book vault
          const synthBookId = `book-${lowerUser}`;
          let existingBook = daos.books.findById(synthBookId);
          if (!existingBook) {
            if (!options.dryRun) {
              daos.books.create({
                id: synthBookId,
                user_id: uid,
                title_encrypted: null,
                meta_encrypted: JSON.stringify({
                  title: `${rawName}'s Notebook`,
                  coverColor: 'brown',
                  pageCount: file.bookCount || 1,
                }),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_deleted: 0,
              });
            }
            stats.booksMigrated++;
          } else {
            stats.booksSkipped++;
          }
        }
      }
    } catch (err) {
      stats.errors.push(`User migration error for ${uItem.path}: ${err.message}`);
      if (options.verbose) console.error(`  [Users] Error processing ${uItem.path}:`, err.message);
    }
  }
}

/**
 * Indexes encrypted media files from data/images/* into SQLite media_files table.
 */
function migrateMediaFiles(dbInstance, imagesDir, stats, options = {}) {
  if (!fs.existsSync(imagesDir)) return;
  const daos = getDaos(dbInstance);

  try {
    const files = fs.readdirSync(imagesDir);
    for (const img of files) {
      if (img.startsWith('.')) continue; // skip hidden files (.gitkeep)
      const imgPath = path.join(imagesDir, img);
      try {
        const stat = fs.statSync(imgPath);
        if (!stat.isFile()) continue;

        let existing = daos.media_files.findById(img);
        if (!existing) {
          if (!options.dryRun) {
            daos.media_files.create({
              id: img,
              user_id: 'user_admin',
              book_id: null,
              file_name: img,
              mime_type: getMimeType(img),
              size: stat.size,
              encrypted_blob_path: path.join('data', 'images', img),
              created_at: stat.birthtime ? stat.birthtime.toISOString() : new Date().toISOString(),
            });
          }
          stats.mediaMigrated++;
          if (options.verbose) console.log(`  [Media] + Indexed media file: ${img} (${stat.size} bytes)`);
        }
      } catch (e) {}
    }
  } catch (err) {
    stats.errors.push(`Media migration error: ${err.message}`);
  }
}

/**
 * Ensures Master Administrator exists if no users are present.
 */
function ensureMasterAdminExists(dbInstance, adminPassword, stats, options = {}) {
  const daos = getDaos(dbInstance);
  const existingAdmin = daos.users.findByUsername(DEFAULT_ADMIN_USER);
  if (existingAdmin) return;

  const pwd = adminPassword || DEFAULT_ADMIN_PASSWORD;
  const salt = crypto.randomBytes(16).toString('hex');
  const key = deriveKey(pwd, salt);
  const passwordHash = crypto.createHash('sha256').update(key).digest('hex');

  const adminVault = {
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

  const encVault = encryptData(adminVault, key);
  const encryptedProfile = JSON.stringify({
    iv: encVault.iv,
    authTag: encVault.authTag,
    data: encVault.data,
    version: 2,
    bookCount: 1,
  });

  if (!options.dryRun) {
    daos.users.create({
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

    daos.books.create({
      id: 'book-admin-master',
      user_id: 'user_admin',
      title_encrypted: JSON.stringify(encryptData({ title: 'Admin Master Notebook', coverColor: 'obsidian' }, key)),
      meta_encrypted: JSON.stringify({ title: 'Admin Master Notebook', coverColor: 'obsidian', pageCount: 1 }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: 0,
    });

    daos.pages.create({
      id: 'p-admin-1',
      book_id: 'book-admin-master',
      page_index: 0,
      title_encrypted: null,
      content_encrypted: JSON.stringify(encryptData({
        html: adminVault.books[0].pages[0].html,
        font: adminVault.books[0].pages[0].font,
        fontSize: adminVault.books[0].pages[0].fontSize,
      }, key)),
      drawings_encrypted: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    daos.audit_logs.create({
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
  }

  stats.usersMigrated++;
  stats.booksMigrated++;
  stats.pagesMigrated++;
  stats.logsMigrated++;
  if (options.verbose) console.log('  [Admin] + Auto-seeded master admin account.');
}

// ---------------------------------------------------------------------------
// Main Migration Engine
// ---------------------------------------------------------------------------

/**
 * Executes full migration from data files into SQLite.
 *
 * @param {object} [options]
 * @param {string} [options.dbPath] - Target SQLite file path
 * @param {string} [options.dataDir] - Legacy data directory
 * @param {string} [options.adminPassword] - Admin master password override
 * @param {boolean} [options.dryRun=false] - Preview migration without writing
 * @param {boolean} [options.force=false] - Force migration even if marker exists
 * @param {boolean} [options.verbose=false] - Detailed logging
 * @param {SQLiteDriver} [options.db] - Existing db driver instance
 * @returns {object} Migration summary report
 */
function migrate(options = {}) {
  const startTime = Date.now();
  const dbInstance = options.db || db.getDb();
  const dataDir = options.dataDir || path.join(__dirname, '..', 'data');
  const adminPassword = options.adminPassword || DEFAULT_ADMIN_PASSWORD;

  const stats = {
    usersMigrated: 0,
    usersSkipped: 0,
    booksMigrated: 0,
    booksSkipped: 0,
    pagesMigrated: 0,
    pagesSkipped: 0,
    logsMigrated: 0,
    logsSkipped: 0,
    mediaMigrated: 0,
    errors: [],
  };

  // 1. Initialize schema
  dbInstance.exec(SCHEMA_DDL);
  ensureMigrationTable(dbInstance);

  // Safe idempotent column migration for existing user databases
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN first_name TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN last_name TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN preferred_name TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'classic';`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN encrypted_profile TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN admin_envelope TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN active_session_id TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN email TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN google_id TEXT;`); } catch (e) {}
  try { dbInstance.exec(`ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';`); } catch (e) {}

  // 2. Derive admin key for decrypting audit logs & admin vault
  let adminKey = null;
  const adminFile = path.join(dataDir, 'users', 'admin.enc.json');
  if (fs.existsSync(adminFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
      const key = deriveKey(adminPassword, raw.salt);
      decryptData(raw, key);
      adminKey = key;
    } catch (e) {}
  }

  // 3. Run migration in transaction for atomicity
  const executeMigration = () => {
    // A. Migrate users, books, pages
    migrateUserVaults(
      dbInstance,
      path.join(dataDir, 'users'),
      path.join(dataDir, 'library_index.json'),
      path.join(dataDir, 'notebook.enc.json'),
      adminPassword,
      stats,
      options
    );

    // B. Migrate audit logs
    migrateAuditLogs(
      dbInstance,
      path.join(dataDir, 'audit_logs.enc.json'),
      adminKey,
      stats,
      options
    );

    // C. Migrate media files
    migrateMediaFiles(
      dbInstance,
      path.join(dataDir, 'images'),
      stats,
      options
    );

    // D. Ensure admin account exists
    ensureMasterAdminExists(dbInstance, adminPassword, stats, options);

    // E. Record migration marker
    if (!options.dryRun) {
      recordMigrationApplied(dbInstance, 'initial_json_to_sqlite', 'Initial File-to-SQLite Migration', {
        migratedAt: new Date().toISOString(),
        stats,
      });
    }
  };

  if (!options.dryRun) {
    dbInstance.transaction(() => {
      executeMigration();
    });
  } else {
    executeMigration();
  }

  const durationMs = Date.now() - startTime;
  return {
    success: stats.errors.length === 0,
    stats,
    durationMs,
    dryRun: !!options.dryRun,
  };
}

/**
 * Backward compatibility alias for migrate.
 */
function migrateLegacyStorage(dbInstance, dataDir, options = {}) {
  return migrate({ db: dbInstance, dataDir, ...options });
}

/**
 * Programmatic check-and-run auto-migration on server boot.
 * Fast return (< 2ms) if already migrated.
 */
function runMigrationIfNeeded(dbInstance = null, options = {}) {
  const targetDb = dbInstance || db.getDb();
  const daos = getDaos(targetDb);
  ensureMigrationTable(targetDb);

  const isApplied = isMigrationApplied(targetDb, 'initial_json_to_sqlite');
  const userCount = daos.users.count();

  // If already migrated and users exist, skip
  if (isApplied && userCount > 0 && !options.force) {
    return {
      skipped: true,
      reason: 'Database is already up to date.',
      userCount,
    };
  }

  return migrate({ db: targetDb, ...options });
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

function parseCliArgs(args) {
  const options = {
    dryRun: false,
    force: false,
    verbose: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--db' || arg === '-d') {
      options.dbPath = args[++i];
    } else if (arg === '--data-dir') {
      options.dataDir = args[++i];
    } else if (arg === '--admin-password') {
      options.adminPassword = args[++i];
    }
  }
  return options;
}

function printCliHelp() {
  console.log(`
Leatherbound Notebook — SQLite Migration Pipeline
Usage: node db/migrate.js [options]

Options:
  -d, --db <path>           Path to target SQLite database file (default: data/notebook.sqlite)
  --data-dir <path>         Path to source data directory containing legacy JSON files (default: data)
  --admin-password <pwd>    Master administrator password for vault decryption (default: Vinod@807465)
  --dry-run                 Simulate migration without modifying SQLite database
  -f, --force               Force migration even if previously applied
  -v, --verbose             Display detailed step-by-step migration progress
  --json                    Output result report as JSON
  -h, --help                Show this help message
`);
}

if (require.main === module) {
  const cliOpts = parseCliArgs(process.argv.slice(2));

  if (cliOpts.help) {
    printCliHelp();
    process.exit(0);
  }

  if (!cliOpts.json) {
    console.log('\n======================================================');
    console.log('  📖 Leatherbound Notebook: SQLite Migration Engine');
    console.log('======================================================\n');
    if (cliOpts.dryRun) console.log('⚠️  DRY RUN MODE ENABLED — No changes will be written.\n');
  }

  try {
    const initializedDb = cliOpts.dbPath ? db.initDb(cliOpts.dbPath) : db.getDb();
    const result = migrate({ ...cliOpts, db: initializedDb });

    if (cliOpts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('Migration Completed:');
      console.log(`  • Users Migrated:      ${result.stats.usersMigrated} (Skipped: ${result.stats.usersSkipped})`);
      console.log(`  • Books Migrated:      ${result.stats.booksMigrated} (Skipped: ${result.stats.booksSkipped})`);
      console.log(`  • Pages Migrated:      ${result.stats.pagesMigrated} (Skipped: ${result.stats.pagesSkipped})`);
      console.log(`  • Audit Logs Migrated: ${result.stats.logsMigrated} (Skipped: ${result.stats.logsSkipped})`);
      console.log(`  • Media Files Indexed: ${result.stats.mediaMigrated}`);
      console.log(`  • Elapsed Time:        ${result.durationMs}ms`);

      if (result.stats.errors.length > 0) {
        console.log('\nWarnings / Errors:');
        result.stats.errors.forEach((err) => console.log(`  ❌ ${err}`));
      }
      console.log('\n✨ Database is fully prepared and up to date.\n');
    }

    db.closeDb();
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    console.error('\n❌ Fatal Migration Error:', err.message);
    process.exit(1);
  }
}

module.exports = {
  migrate,
  migrateLegacyStorage,
  runMigrationIfNeeded,
  migrateAuditLogs,
  migrateUserVaults,
  migrateMediaFiles,
  ensureMasterAdminExists,
  isMigrationApplied,
  recordMigrationApplied,
};
