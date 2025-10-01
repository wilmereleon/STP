@echo off
echo ============================================
echo   Teleprompter Pro - Build Rapido
echo ============================================
echo.

REM Configurar variables
set CSC_IDENTITY_AUTO_DISCOVERY=false

REM Limpiar
if exist release rmdir /s /q release
if exist dist rmdir /s /q dist

REM Compilar React
echo [1/2] Compilando aplicacion React...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo la compilacion
    pause
    exit /b 1
)

REM Empaquetar con Electron
echo.
echo [2/2] Empaquetando con Electron...
call npx electron-builder --win --dir --config.win.sign=null
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo el empaquetado
    pause
    exit /b 1
)

echo.
echo ============================================
echo   LISTO! Tu ejecutable esta en:
echo   release\win-unpacked\Teleprompter Pro.exe
echo ============================================
echo.
pause
