@echo off
title KISS Vocational Training Management System (KV-TMS) Launcher
echo ===============================================================================
echo            KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)
echo ===============================================================================
echo.
echo Starting Spring Boot Backend Server on Port 8080...
start "KV-TMS Backend (Port 8080)" cmd /k "cd /d "%~dp005 Software\kv-tms" && "C:\Program Files\Java\jdk-26.0.1\bin\java.exe" -jar target\kv-tms-0.0.1-SNAPSHOT.jar"

timeout /t 5 >nul

echo Starting Vite Frontend on Port 5173...
start "KV-TMS Frontend (Port 5173)" cmd /k "cd /d "%~dp005 Software\frontend" && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo Open your browser at: http://localhost:5173/
echo.
pause
