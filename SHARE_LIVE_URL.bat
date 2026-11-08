@echo off
title KISS Vocational Training Management System (KV-TMS) - Live URL Sharer
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp005 Software\tools\start_live_share.ps1"
pause
