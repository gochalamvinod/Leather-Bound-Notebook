# Original User Request

## Initial Request — 2026-09-04T02:46:11Z

Requested team: complete team

Fix SMTP email delivery connectivity (using port 587 STARTTLS with automatic fallback) and add transactional emails: a congratulations/welcome message upon user signup and a security notification message upon user login.

Working directory: c:\Users\gocha\Desktop\LeatherBound-Notebook
Integrity mode: development

## Requirements

### R1. Resilient SMTP Email Dispatch & Port 587 Fallback
- Fix email delivery failures by configuring default SMTP to port 587 with STARTTLS (`secure: false`).
- Add automatic fallback in `lib/mailer.js`: if a connection on port 587 fails, automatically attempt port 465 (or vice-versa), with sensible timeout limits so OTP emails never fail due to network port blocking.
- Verify OTP dispatch works reliably to user email addresses (e.g. `gochalamannavinod@gmail.com`).

### R2. Congratulations / Welcome Signup Email
- When a new user account is successfully created (via email OTP registration, master password registration, or Google OAuth onboarding):
  - Automatically send an elegant, responsive HTML congratulations/welcome email.
  - Include account details: username, account creation timestamp, plan tier, and security tips for vault preservation.
  - Email should be sent asynchronously in the background so registration is fast and does not block.

### R3. Login Attempt Security Notification Email
- When a user successfully logs in (via OTP, password, or Google OAuth):
  - If the user has a registered email address, dispatch a security notification email ("New Login to your Leatherbound Vault").
  - Include login details: username, timestamp (UTC and localized), client IP address, and browser/device user agent.
  - Provide advice if the login was unexpected.
  - Asynchronously dispatched without adding latency to the login response.

## Acceptance Criteria

### Backend Verification
- [ ] `lib/mailer.js` transporter connects and verifies successfully via port 587.
- [ ] `POST /api/auth/send-otp` successfully dispatches verification email without `SMTP_NETWORK_ERROR`.
- [ ] Registering a new account triggers the welcome/congratulations email to the registered email address.
- [ ] Logging into an account triggers the login attempt security notification email.
- [ ] Both email notifications fail gracefully in the background if delivery encounters issues, without breaking the user auth flow.

### Frontend & Build Verification
- [ ] `npm run build` succeeds with zero errors.
- [ ] No regression on Login, Register, or Google OAuth flows.

## Follow-up — 2026-09-04T02:46:19Z

URGENT USER ADDITION for Requirement R3 (Login Notification Email):
In the login attempt security email, you MUST show:
- Client IP address
- Location (City, Region, Country - use geolocation lookup for the IP address, e.g., via free lookup API or geoip with friendly fallback if local IP/private network)
- Operating System & Device
- Browser details
- Exact date, time, and timezone
- Login authentication method (Password / Email OTP / Google OAuth)

Please incorporate this immediately into R3 and parallelize execution across all workers.

## 2026-09-05T16:02:43Z

Requested team: 15 members team stress all the agents to their peaks. Use a very large team of agents operating in high parallel performance.

Fix SMTP email delivery connectivity (using port 587 STARTTLS with automatic fallback) and add transactional emails: a congratulations/welcome message upon user signup and a security notification message upon user login (with IP, location, OS, browser, device, timestamp). Add all events to admin audit logs.

Working directory: c:\Users\gocha\Desktop\LeatherBound-Notebook
Integrity mode: development

## Requirements

### R1. Resilient SMTP Email Dispatch & Port 587 Fallback
- Fix email delivery failures (`ETIMEDOUT`) by setting default SMTP port to 587 with STARTTLS (`secure: false`) and non-pooling transport (`pool: false`).
- Add automatic port fallback in `lib/mailer.js`: if port 587 fails with timeout/network error, automatically retry on port 465 (or vice-versa), with 25s timeout limits so OTP emails never fail due to network port blocking.
- Verify OTP dispatch works reliably to user email addresses (e.g. `gochalamannavinod@gmail.com`).

### R2. Congratulations / Welcome Signup Email
- When a new user account is successfully created (via email OTP registration, master password registration, or Google OAuth onboarding):
  - Automatically send an elegant, responsive HTML congratulations/welcome email.
  - Include account details: username, account creation timestamp, plan tier, and security tips for vault preservation.
  - Email is sent asynchronously in the background so registration does not block.
  - Record `USER_REGISTER` with email details in admin audit logs.

### R3. Login Attempt Security Notification Email
- When a user successfully logs in (via OTP, password, or Google OAuth):
  - If the user has a registered email address, dispatch a security notification email ("Security Alert: New Login to your Leatherbound Vault").
  - Include login details: username, exact timestamp/date, client IP address, resolved geolocation (City, Region, Country via IP lookup), browser, OS, and authentication method.
  - Provide security advisory if the login was unexpected.
  - Asynchronously dispatched without adding latency to the login response.
  - Record `USER_LOGIN` with complete client details in admin audit logs.

### R4. Zero-Downtime Server Availability
- Keep the backend HTTP server running on port 3000 so endpoints like `/api/auth/callback/google` and `/api/auth/send-otp` respond cleanly without `ERR_CONNECTION_REFUSED`.

## Acceptance Criteria

### Backend Verification
- [ ] `lib/mailer.js` transporter connects and verifies successfully via port 587.
- [ ] `POST /api/auth/send-otp` successfully dispatches verification email to `gochalamannavinod@gmail.com` without `SMTP_NETWORK_ERROR`.
- [ ] Registering a new account triggers the welcome/congratulations email to the registered email address.
- [ ] Logging into an account triggers the login attempt security notification email with IP, location, and device details.
- [ ] All signup and login actions are logged to admin audit logs.
- [ ] Both email notifications fail gracefully in the background if delivery encounters issues, without breaking the user auth flow.

### Frontend & Build Verification
- [ ] `npm run build` succeeds with zero errors.
- [ ] No regression on Login, Register, or Google OAuth flows.
