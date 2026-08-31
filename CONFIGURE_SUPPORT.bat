@echo off
setlocal enabledelayedexpansion
title Leatherbound Notebook — Support & SMTP Setup

cd /d "%~dp0"

echo ===============================================================
echo       Leatherbound Notebook — Support Email & SMTP Setup       
echo ===============================================================
echo.
echo This utility configures your Support Email and SMTP settings.
echo These credentials will be stored in your local .env file.
echo (Your .env file is gitignored and will NOT be pushed to Git)
echo.
echo ===============================================================
echo.

:: 1. Prompt for Support Email
:ASK_EMAIL
set "SUP_EMAIL="
set /p SUP_EMAIL="[1/4] Enter Support Email (e.g. support@yourdomain.com): "
if "%SUP_EMAIL%"=="" (
    echo [ERROR] Email cannot be empty. Please enter an email address.
    goto ASK_EMAIL
)

:: 2. Prompt for Support Password
:ASK_PASS
set "SUP_PASS="
set /p SUP_PASS="[2/4] Enter Support Email Password / App Password: "
if "%SUP_PASS%"=="" (
    echo [ERROR] Password cannot be empty.
    goto ASK_PASS
)

:: 3. Prompt for SMTP Host
set "SUP_HOST="
set /p SUP_HOST="[3/4] Enter SMTP Host [Press Enter for smtp.titan.email]: "
if "%SUP_HOST%"=="" set "SUP_HOST=smtp.titan.email"

:: 4. Prompt for SMTP Port
set "SUP_PORT="
set /p SUP_PORT="[4/4] Enter SMTP Port [Press Enter for 465]: "
if "%SUP_PORT%"=="" set "SUP_PORT=465"

:: 5. Determine secure flag
set "SUP_SECURE=true"
if "%SUP_PORT%"=="587" set "SUP_SECURE=false"
if "%SUP_PORT%"=="25" set "SUP_SECURE=false"

:: Write to .env
echo.
echo Writing settings to .env...

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
echo You can now run STARTER.bat or 'npm start' to launch your notebook.
echo.
pause
