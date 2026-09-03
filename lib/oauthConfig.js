/**
 * Leatherbound Notebook — Google OAuth Configuration & Auto-Discovery
 *
 * Implements Google OAuth 2.0 credential resolution:
 * 1. Checks environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, VITE_GOOGLE_CLIENT_ID).
 * 2. If credentials are missing, automatically discovers and parses client_secret_*.json
 *    or client_secret.json in the project root directory.
 * 3. Handles Google credentials structures: 'web', 'installed', or raw key-value format.
 * 4. Determines appropriate redirect URI based on port configuration and registered callback URIs.
 * 5. Populates process.env with discovered secrets to ensure runtime consistency across backend and Vite.
 * 6. Handles missing or malformed files gracefully without throwing unhandled exceptions.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Ensure dotenv is loaded if available and not yet loaded
try {
  require('dotenv').config();
} catch (_) {
  // Ignore dotenv load errors
}

const DEFAULT_AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';

/**
 * Searches directories for client secret JSON files.
 * Matches: /^client_secret_.*\.json$/i or /^client_secret\.json$/i
 *
 * @param {string[]} searchDirs
 * @returns {Array<{ filePath: string, fileName: string }>}
 */
function findClientSecretFiles(searchDirs) {
  const secretPattern = /^client_secret(_.*)?\.json$/i;
  const discoveredFiles = [];
  const visitedPaths = new Set();

  for (const dir of searchDirs) {
    if (!dir) continue;
    const resolvedDir = path.resolve(dir);
    if (visitedPaths.has(resolvedDir)) continue;
    visitedPaths.add(resolvedDir);

    try {
      if (!fs.existsSync(resolvedDir) || !fs.statSync(resolvedDir).isDirectory()) {
        continue;
      }
      const entries = fs.readdirSync(resolvedDir);
      for (const entry of entries) {
        if (secretPattern.test(entry)) {
          const fullPath = path.join(resolvedDir, entry);
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
              discoveredFiles.push({ filePath: fullPath, fileName: entry });
            }
          } catch (_) {
            // Ignore stat errors
          }
        }
      }
    } catch (_) {
      // Gracefully continue if dir cannot be read
    }
  }

  return discoveredFiles;
}

/**
 * Safely reads and parses a JSON file.
 * Returns null if the file cannot be read or parsed.
 *
 * @param {string} filePath
 * @param {boolean} silent
 * @returns {object|null}
 */
function readSecretJson(filePath, silent = false) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) {
      if (!silent) {
        console.warn(`[OAUTH_CONFIG_WARN] Client secret file is empty: ${filePath}`);
      }
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    if (!silent) {
      console.warn(`[OAUTH_CONFIG_WARN] Failed to read or parse client secret file "${filePath}": ${err.message}`);
    }
    return null;
  }
}

/**
 * Normalizes credentials from Google client secret JSON structure.
 * Handles:
 * - { "web": { ... } }
 * - { "installed": { ... } }
 * - { "client_id": ... } (raw format)
 *
 * @param {object} parsedJson
 * @returns {object}
 */
function normalizeSecretPayload(parsedJson) {
  if (!parsedJson || typeof parsedJson !== 'object') {
    return {};
  }
  return parsedJson.web || parsedJson.installed || parsedJson;
}

/**
 * Selects the most appropriate redirect URI from candidate redirect_uris.
 * Prioritizes matching current port or localhost:3000.
 *
 * @param {string[]|string} redirectUris
 * @param {string|number} port
 * @returns {string|null}
 */
function selectRedirectUri(redirectUris, port) {
  const uris = Array.isArray(redirectUris)
    ? redirectUris
    : (typeof redirectUris === 'string' && redirectUris.trim() ? [redirectUris.trim()] : []);

  if (uris.length === 0) {
    return null;
  }

  const portStr = String(port || '3000');

  // 1. Check for localhost:PORT or 127.0.0.1:PORT
  const portMatch = uris.find(u => typeof u === 'string' && (u.includes(`localhost:${portStr}`) || u.includes(`127.0.0.1:${portStr}`)));
  if (portMatch) return portMatch;

  // 2. Check for localhost:3000 or 127.0.0.1:3000
  const localhost3000Match = uris.find(u => typeof u === 'string' && (u.includes('localhost:3000') || u.includes('127.0.0.1:3000')));
  if (localhost3000Match) return localhost3000Match;

  // 3. Any localhost or 127.0.0.1 URI
  const anyLocalMatch = uris.find(u => typeof u === 'string' && (u.includes('localhost') || u.includes('127.0.0.1')));
  if (anyLocalMatch) return anyLocalMatch;

  // 4. Return the first configured redirect URI
  return uris[0] || null;
}

/**
 * Discovers and returns Google OAuth configuration.
 *
 * @param {object} [options={}]
 * @param {string} [options.rootDir] Optional directory override to search for client secrets
 * @param {boolean} [options.skipEnv=false] If true, ignore process.env values and force file discovery
 * @param {boolean} [options.silent=false] If true, suppress informational and warning console logs
 * @param {string|number} [options.port] Optional port override
 * @returns {{
 *   clientId: string|null,
 *   clientSecret: string|null,
 *   redirectUri: string|null,
 *   authUri: string,
 *   tokenUri: string,
 *   projectId: string|null,
 *   configured: boolean
 * }}
 */
function getGoogleOAuthConfig(options = {}) {
  const silent = Boolean(options.silent);
  const skipEnv = Boolean(options.skipEnv);
  const port = options.port || process.env.PORT || '3000';

  // 1. Inspect environment variables if not skipping env
  let clientId = (!skipEnv && process.env.GOOGLE_CLIENT_ID) ? process.env.GOOGLE_CLIENT_ID.trim() : null;
  let clientSecret = (!skipEnv && process.env.GOOGLE_CLIENT_SECRET) ? process.env.GOOGLE_CLIENT_SECRET.trim() : null;
  let redirectUri = (!skipEnv && process.env.GOOGLE_REDIRECT_URI) ? process.env.GOOGLE_REDIRECT_URI.trim() : null;
  let authUri = (!skipEnv && process.env.GOOGLE_AUTH_URI) ? process.env.GOOGLE_AUTH_URI.trim() : null;
  let tokenUri = (!skipEnv && process.env.GOOGLE_TOKEN_URI) ? process.env.GOOGLE_TOKEN_URI.trim() : null;
  let projectId = (!skipEnv && process.env.GOOGLE_PROJECT_ID) ? process.env.GOOGLE_PROJECT_ID.trim() : null;

  // 2. If client ID, secret, redirect URI, or project ID is missing (or env skipped), discover from root client_secret_*.json
  if (!clientId || !clientSecret || !redirectUri || !projectId) {
    const searchDirs = [];
    if (options.rootDir) {
      searchDirs.push(options.rootDir);
    } else {
      searchDirs.push(path.resolve(__dirname, '..'));
      searchDirs.push(process.cwd());
    }

    const candidateFiles = findClientSecretFiles(searchDirs);

    for (const candidate of candidateFiles) {
      const parsedJson = readSecretJson(candidate.filePath, silent);
      if (!parsedJson) continue;

      const creds = normalizeSecretPayload(parsedJson);

      if (!clientId && creds.client_id) {
        clientId = String(creds.client_id).trim();
      }
      if (!clientSecret && creds.client_secret) {
        clientSecret = String(creds.client_secret).trim();
      }
      if (!projectId && creds.project_id) {
        projectId = String(creds.project_id).trim();
      }
      if (!authUri && creds.auth_uri) {
        authUri = String(creds.auth_uri).trim();
      }
      if (!tokenUri && creds.token_uri) {
        tokenUri = String(creds.token_uri).trim();
      }

      if (!redirectUri && creds.redirect_uris) {
        const selected = selectRedirectUri(creds.redirect_uris, port);
        if (selected) {
          redirectUri = selected;
        }
      }

      // If all core fields are populated, stop searching files
      if (clientId && clientSecret && redirectUri && projectId) {
        break;
      }
    }
  }

  // 3. Fallbacks
  if (!redirectUri) {
    redirectUri = `http://localhost:${port}/api/auth/callback/google`;
  }
  if (!authUri) {
    authUri = DEFAULT_AUTH_URI;
  }
  if (!tokenUri) {
    tokenUri = DEFAULT_TOKEN_URI;
  }

  const configured = Boolean(clientId && clientSecret);

  // 4. Populate process.env for runtime synchronization across backend & Vite
  if (clientId) {
    process.env.GOOGLE_CLIENT_ID = clientId;
    process.env.VITE_GOOGLE_CLIENT_ID = clientId;
  }
  if (clientSecret) {
    process.env.GOOGLE_CLIENT_SECRET = clientSecret;
  }
  if (redirectUri) {
    process.env.GOOGLE_REDIRECT_URI = redirectUri;
  }
  if (projectId) {
    process.env.GOOGLE_PROJECT_ID = projectId;
  }

  // 5. Logging
  if (!silent) {
    if (configured) {
      console.log(`[OAUTH_CONFIG] Google OAuth configured with client ID: ${clientId} and redirect URI: ${redirectUri}`);
    } else {
      console.warn('[OAUTH_CONFIG] Google OAuth credentials not found in environment or client_secret_*.json.');
    }
  }

  return {
    clientId: clientId || null,
    clientSecret: clientSecret || null,
    redirectUri: redirectUri || null,
    authUri,
    tokenUri,
    projectId: projectId || null,
    configured
  };
}

module.exports = {
  getGoogleOAuthConfig,
  discoverGoogleOAuthCredentials: getGoogleOAuthConfig,
  default: { getGoogleOAuthConfig }
};
