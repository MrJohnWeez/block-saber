@echo off
cd /d "%~dp0website"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH.
    pause
    exit /b
)

echo Starting Node.js server from %CD% ...
start "" http://localhost:5000
node server.js
pause