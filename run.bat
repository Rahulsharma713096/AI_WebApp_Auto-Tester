@echo off
title AI Web App Auto-Tester
echo ============================================
echo   AI Web App Auto-Tester - Starting All Services
echo ============================================
echo.

:: Check prerequisites
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 20+
    pause
    exit /b 1
)

:: Get the directory of this script
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Create required directories
if not exist "data" mkdir data
if not exist "runtime\screenshots" mkdir runtime\screenshots
if not exist "reports\output" mkdir reports\output

:: Install backend dependencies
echo [1/5] Installing backend dependencies...
cd /d "%ROOT_DIR%backend"
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [WARN] pip install had issues. Continuing anyway...
)

:: Install frontend dependencies
echo [2/5] Installing frontend dependencies...
cd /d "%ROOT_DIR%frontend"
if not exist "node_modules" (
    call npm install
) else (
    echo      Frontend dependencies already installed.
)

:: Start Redis (attempt via Docker if available)
echo [3/5] Starting Redis...
cd /d "%ROOT_DIR%"
where docker >nul 2>nul
if %errorlevel% equ 0 (
    docker ps | findstr redis >nul 2>nul
    if %errorlevel% neq 0 (
        echo      Starting Redis container...
        start /B docker run --name tester-redis -p 6379:6379 -d redis:7-alpine >nul 2>nul
    ) else (
        echo      Redis is already running.
    )
) else (
    echo      Docker not found. Using default Redis connection (localhost:6379).
    echo      Make sure Redis is running manually.
)

:: Start backend
echo [4/5] Starting Backend (FastAPI) on port 8000...
cd /d "%ROOT_DIR%backend"
start "AI-Tester-Backend" cmd /c "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Start frontend
echo [5/5] Starting Frontend (Next.js) on port 3000...
cd /d "%ROOT_DIR%frontend"
start "AI-Tester-Frontend" cmd /c "npm run dev"

:: Wait a moment then open browser
echo.
echo ============================================
echo   All services starting...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo ============================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to stop all services...
pause >nul

:: Cleanup on exit
echo Stopping services...
taskkill /f /fi "WINDOWTITLE eq AI-Tester-Backend" >nul 2>nul
taskkill /f /fi "WINDOWTITLE eq AI-Tester-Frontend" >nul 2>nul
where docker >nul 2>nul
if %errorlevel% equ 0 (
    docker stop tester-redis >nul 2>nul
    docker rm tester-redis >nul 2>nul
)
echo All services stopped.
pause
