@echo off
title Push KV-TMS to GitHub
cd /d "%~dp0"
echo ===============================================================================
echo                PUSHING KV-TMS TO GITHUB (mansisinha-dev/kv-tms)
echo ===============================================================================
echo.
git branch -M main
git push -u origin main
echo.
echo ===============================================================================
echo Done! Check your repository at: https://github.com/mansisinha-dev/kv-tms
echo ===============================================================================
pause
