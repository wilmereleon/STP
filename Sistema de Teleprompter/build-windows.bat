@echo off
echo ============================================
echo   Compilando Teleprompter Pro
echo ============================================
echo.

REM Configurar variables para deshabilitar firma de código
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set CSC_LINK=

REM Limpiar carpeta de salida anterior si existe
if exist release rmdir /s /q release
if exist dist rmdir /s /q dist

REM Compilar aplicación React
echo [1/3] Compilando aplicación React...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Falló la compilación de Vite
    pause
    exit /b 1
)

REM Crear carpeta release y empaquetar sin instalador
echo.
echo [2/3] Empaquetando aplicación Electron...
call npx electron-builder --win --dir
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Falló el empaquetado
    pause
    exit /b 1
)

echo.
echo ============================================
echo   COMPILACION EXITOSA!
echo ============================================
echo.
echo La aplicación está en: release\win-unpacked\
echo Ejecutable: release\win-unpacked\Teleprompter Pro.exe
echo.
pause
