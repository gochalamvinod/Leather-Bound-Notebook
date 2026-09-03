# Project: Leatherbound Notebook - Google OAuth 2.0 Integration

## Architecture
Leatherbound Notebook is a local-first encrypted notebook application with a Node.js/Express backend (`server.js`), SQLite database (`db/index.js`, `db/schema.js`), and a React/TypeScript/Vite frontend (`src/`).
Authentication supports password authentication, OTP, and Google OAuth 2.0 (via Google Identity Services SDK and Authorization Code Flow).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Secret Auto-Discovery | Auto-discover Google credentials from root `client_secret_*.json` or `.env` | M1 | ORIGINAL_REQUEST § R3 |
| 2 | Environment Configuration | Ensure `.env` and `.env.example` contain client ID, client secret, redirect URI, and Vite client ID | M1 | ORIGINAL_REQUEST § R3 |
| 3 | Config Endpoint | `GET /api/auth/google/config` returning `{ ok: true, clientId }` | M2 | ORIGINAL_REQUEST § R1 |
| 4 | OAuth Initiate Endpoint | `GET /api/auth/google` with CSRF state and 302 redirect to Google accounts consent screen | M2 | ORIGINAL_REQUEST § R1 |
| 5 | OAuth Callback Endpoint | `GET /api/auth/callback/google` token exchange, ID token claims verification, vault unlock/creation in SQLite, session cookie set, 302 redirect to `/` | M2 | ORIGINAL_REQUEST § R1 |
| 6 | GIS Credential Handler | Enhanced `POST /api/auth/google` for GIS token payload decode, audience check, vault unlock/provision | M2 | ORIGINAL_REQUEST § R1 |
| 7 | GIS SDK Script Integration | `<script src="https://accounts.google.com/gsi/client" async defer></script>` in `index.html` | M3 | ORIGINAL_REQUEST § R2 |
| 8 | Login Screen Google Button | Google Sign-In button with stylized separator in `LoginTab.tsx` | M3 | ORIGINAL_REQUEST § R2 |
| 9 | Register Screen Google Button | Google Sign-In/Sign-Up button with stylized separator in `RegisterTab.tsx` | M3 | ORIGINAL_REQUEST § R2 |
| 10 | Fallback Navigation | Direct redirect to `/api/auth/google` if GIS prompt dismissed/unavailable | M3 | ORIGINAL_REQUEST § R2 |
| 11 | Acceptance Verification | Comprehensive test suite verifying all acceptance criteria (AC1–AC6) | M4 | ORIGINAL_REQUEST § Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Environment Configuration & Secret Discovery | `.env`, `.env.example`, `lib/oauthConfig.js` auto-discovery module | none | DONE |
| M2 | Backend Google OAuth Endpoints | `server.js` route handlers: `/api/auth/google/config`, `/api/auth/google`, `/api/auth/callback/google`, `/api/auth/google` | M1 interface | IN_PROGRESS |
| M3 | Frontend Google Sign-In Integration | `LoginTab.tsx`, `RegisterTab.tsx`, `GoogleAuthButton.tsx`, `index.html`, `npm run build` | M2 interface | DONE |
| M4 | E2E Acceptance Verification | Test harness and automated validation of all 6 acceptance criteria | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts
### `lib/oauthConfig.js` ↔ `server.js`
- Export: `function getGoogleOAuthConfig(): { clientId, clientSecret, redirectUri, authUri, tokenUri, configured }`
- Behavior: Inspects `process.env` first; if missing, scans workspace root for `client_secret_*.json` or `client_secret.json`; populates `process.env` and returns config object. Verified passing 8/8 tests.

### Backend ↔ Frontend
- `GET /api/auth/google/config`: Returns `{ ok: true, clientId: string }`. Does not expose client secret. Verified in M3.
- `GET /api/auth/google`: Initiates redirect (302) to `https://accounts.google.com/o/oauth2/v2/auth`.
- `GET /api/auth/callback/google`: Accepts `code` and `state`, sets `notebook_session` cookie, redirects (302) to `/`.
- `POST /api/auth/google`: Accepts `{ credential: string }`, returns `{ ok: true, success: true, user, vault, token, ... }` and sets `notebook_session` cookie.

## Code Layout & Exclusive Write Ownership
- **Milestone 1 Worker**: Exclusive write access to `.env`, `.env.example`, `lib/oauthConfig.js` (Completed).
- **Milestone 2 Worker**: Exclusive write access to `server.js` (In Progress).
- **Milestone 3 Worker**: Exclusive write access to `src/components/auth/LoginTab.tsx`, `src/components/auth/RegisterTab.tsx`, `src/components/auth/GoogleAuthButton.tsx`, `index.html` (Completed).
- **Milestone 4 Test Writer**: Exclusive write access to `tests/oauth_e2e.test.js` and verification test scripts (In Progress).
