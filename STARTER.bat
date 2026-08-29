@echo off
setlocal enabledelayedexpansion
title Leatherbound Notebook

:: Change to the directory where this script is located
cd /d "%~dp0"

echo ===================================================
echo        Leatherbound Notebook 2.0 Launcher
echo ===================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js ^(v18 or higher^) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found in your system PATH.
    echo.
    pause
    exit /b 1
)

:: 3. Auto-install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [1/3] Installing dependencies ^(npm install^)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] npm install failed. Please check your internet connection or npm permissions.
        echo.
        pause
        exit /b %ERRORLEVEL%
    )
    echo.
) else (
    echo [1/3] Dependencies found in node_modules.
)

:: 4. Auto-build client bundle if dist/index.html is missing
if not exist "dist\index.html" (
    echo [2/3] Production build not found. Building project ^(npm run build^)...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Project build failed.
        echo.
        pause
        exit /b %ERRORLEVEL%
    )
    echo.
) else (
    echo [2/3] Production build verified.
)

:: 5. Automatically open browser and start the server
echo [3/3] Starting server...
echo.
echo Launching http://localhost:3000 in your default browser...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

call npm start
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server encountered an unexpected error and stopped.
    echo.
    pause
    exit /b %ERRORLEVEL%
)
