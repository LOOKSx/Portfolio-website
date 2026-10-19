@echo off
title Portfolio Backend (Go + TiDB)
echo ========================================================
echo  Starting Portfolio Backend (Golang)
echo  Owner: นาย พุศิพงศ์ ราชรักษ์ (สทส2 เลขที่ 12)
echo  Course: 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่
echo  Instructor: ครูอ๋อน
echo  Checking TiDB Connection on localhost:4000...
echo ========================================================
cd /d "%~dp0backend"
if exist kruaon-backend.exe (
    kruaon-backend.exe
) else (
    go run main.go
)
pause
