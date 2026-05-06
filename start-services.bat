@echo off
setlocal

echo.
echo ========================================
echo SalesAPE local services
echo ========================================
echo.

cd /d "%~dp0"

if not exist "app\backend\package.json" (
    echo ERROR: app\backend\package.json not found
    exit /b 1
)

if not exist "app\frontend\package.json" (
    echo ERROR: app\frontend\package.json not found
    exit /b 1
)

echo Starting backend on port 3001...
start "SalesAPE Backend" cmd /k "npm run dev:backend"

timeout /t 3 /nobreak > nul

echo Starting frontend on port 3002...
start "SalesAPE Frontend" cmd /k "npm run dev:frontend"

echo.
echo Services started in new windows
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3002
echo.

endlocal
