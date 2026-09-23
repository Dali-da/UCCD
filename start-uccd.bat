@echo off
cd /d "%~dp0"
start "UCCD server" "%ComSpec%" /k "cd /d ""%~dp0"" && py -m http.server 4173"
ping 127.0.0.1 -n 3 >nul
start "" "http://localhost:4173/"
