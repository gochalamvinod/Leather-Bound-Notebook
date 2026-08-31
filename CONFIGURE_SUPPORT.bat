@echo off
title Leatherbound Notebook — Support Email Setup
cd /d "%~dp0"

node lib\configure_smtp.js

echo.
pause
