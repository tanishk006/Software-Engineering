@echo off
title Smart Campus Portal - Demo Launcher
echo =====================================================================
echo        SMART CAMPUS PORTAL - FACULTY DEMONSTRATION LAUNCHER
echo =====================================================================
echo.
echo [1/2] Starting Backend REST API Server on port 5000...
start "Smart Campus Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Vite Server on port 5173...
start "Smart Campus Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo Servers launched successfully!
echo - Backend API:  http://localhost:5000/api/health
echo - Frontend UI:  http://localhost:5173/login
echo.
echo Opening browser in 3 seconds...
echo =====================================================================
timeout /t 3 >nul
start http://localhost:5173/login
