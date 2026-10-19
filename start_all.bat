@echo off
title Portfolio Fullstack Starter - Pusiphong Ratcharak
echo ========================================================
echo  🚀 Starting Portfolio Fullstack System
echo  - Owner: นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1
echo  - Course: 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่
echo  - Instructor: ครูอ๋อน
echo  - Backend: Go (Golang) + TiDB / Distributed SQL
echo  - Frontend: Angular 19 (HTML, CSS, TypeScript)
echo ========================================================

echo 1. Starting Backend in new window...
start "Portfolio Backend (Go)" cmd /k "cd /d %~dp0backend && (if exist kruaon-backend.exe (kruaon-backend.exe) else (go run main.go))"

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend (Angular) and opening browser...
start "Portfolio Frontend (Angular)" cmd /k "cd /d %~dp0frontend && npx ng serve --open"

echo.
echo ✅ Done! Backend runs at http://localhost:8080 and Frontend at http://localhost:4200
pause
