@echo off
title Leatherbound Notebook — One-Time Deployment & Support Setup
cd /d "%~dp0"

node lib\configure_smtp.js

echo.
pause
