@echo off
title Portfolio Frontend (Angular) - Pusiphong Ratcharak
echo ========================================================
echo  Starting Portfolio Frontend (Angular 19)
echo  Owner: นาย พุศิพงศ์ ราชรักษ์ (สทส2 เลขที่ 12 กลุ่ม 1)
echo  Course: 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่
echo  Serving on http://localhost:4200
echo ========================================================
cd /d "%~dp0frontend"
npx ng serve --open
pause
