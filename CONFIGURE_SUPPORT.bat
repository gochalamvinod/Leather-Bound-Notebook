@echo off
setlocal enabledelayedexpansion
title Leatherbound Notebook — Support Email Setup

cd /d "%~dp0"

echo ===============================================================
echo       Leatherbound Notebook — Support Email & SMTP Setup       
echo ===============================================================
echo.
echo This utility configures your Support Email and SMTP credentials.
echo It writes them to your local .env file ^(which is gitignored^).
echo.
echo ===============================================================
echo.

:: 1. Prompt for Support Email
:ASK_EMAIL
set "SUP_EMAIL="
set /p SUP_EMAIL="Enter Support Email (e.g. support@gochalamvinod.tech): "
if "%SUP_EMAIL%"=="" (
    echo [ERROR] Email cannot be empty. Please enter an email address.
    echo.
    goto ASK_EMAIL
)

:: 2. Prompt for Support Password
:ASK_PASS
set "SUP_PASS="
set /p SUP_PASS="Enter Support Email Password: "
if "%SUP_PASS%"=="" (
    echo [ERROR] Password cannot be empty.
    echo.
    goto ASK_PASS
)

:: 3. Prompt for SMTP Host
set "SUP_HOST="
set /p SUP_HOST="Enter SMTP Host [Press Enter for smtp.titan.email]: "
if "%SUP_HOST%"=="" set "SUP_HOST=smtp.titan.email"

:: 4. Prompt for SMTP Port
set "SUP_PORT="
set /p SUP_PORT="Enter SMTP Port [Press Enter for 465]: "
if "%SUP_PORT%"=="" set "SUP_PORT=465"

:: 5. Determine secure flag
set "SUP_SECURE=true"
if "%SUP_PORT%"=="587" set "SUP_SECURE=false"
if "%SUP_PORT%"=="25" set "SUP_SECURE=false"

:: Write to .env
echo.
echo Saving settings to .env...

(
    echo # Server Port
    echo PORT=3000
    echo.
    echo # SMTP Email Configuration
    echo SMTP_HOST=%SUP_HOST%
    echo SMTP_PORT=%SUP_PORT%
    echo SMTP_SECURE=%SUP_SECURE%
    echo SMTP_USER=%SUP_EMAIL%
    echo SMTP_PASS=%SUP_PASS%
    echo SMTP_FROM="Leatherbound Vault" ^<%SUP_EMAIL%^>
    echo SMTP_REPLY_TO=%SUP_EMAIL%
    echo.
    echo # Security ^& Expiration Overrides
    echo OTP_EXPIRY_SECONDS=600
    echo OTP_RESEND_COOLDOWN_SECONDS=60
    echo OTP_MAX_ATTEMPTS=5
) > ".env"

echo.
echo ===============================================================
echo  [SUCCESS] SMTP Configuration Saved to .env!
echo  - Support User : %SUP_EMAIL%
echo  - SMTP Server  : %SUP_HOST%:%SUP_PORT% (Secure: %SUP_SECURE%)
echo ===============================================================
echo.
echo Testing SMTP connection...
node -e "require('dotenv').config(); const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT, 10), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }); t.verify().then(() => console.log('✅ [SUCCESS] SMTP Credentials Verified with Server!')).catch(err => console.log('⚠️ [WARNING] Could not verify with SMTP server: ' + err.message));"

echo.
echo Configuration complete! You can now start the application:
echo   npm start     (Production)
echo   npm run dev   (Development)
echo.
pause
