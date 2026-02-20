@echo off
REM SalesAPE A+ Service Startup Script
REM Starts backend, frontend, and verifies configuration

setlocal enabledelayedexpansion

echo.
echo ========================================
echo SalesAPE A+ Service Startup
echo ========================================
echo.

REM Change to backend directory
cd /d "c:\Users\Lambert\gitclones\salesape_mvp\app\backend"

REM Verify .env.local exists
if not exist ".env.local" (
    echo ERROR: .env.local not found in backend directory
    exit /b 1
)

echo ✓ Backend directory confirmed
echo ✓ .env.local found

REM Start backend in a new window (non-blocking)
echo.
echo Starting Backend on port 3001...
start "SalesAPE Backend" cmd /k "npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new window
cd /d "c:\Users\Lambert\gitclones\salesape_mvp\app\frontend"

if exist "package.json" (
    echo.
    echo Starting Frontend on port 5173...
    start "SalesAPE Frontend" cmd /k "npm run dev"
) else (
    echo ERROR: Frontend package.json not found
)

echo.
echo ========================================
echo Services started in new windows
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo ========================================
echo.

timeout /t 60
