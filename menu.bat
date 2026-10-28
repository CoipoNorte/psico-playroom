@echo off
title PSICO PLAYROOM - Menu

:menu
cls
echo ========================================
echo   PSICO PLAYROOM - Menu de Opciones
echo ========================================
echo.
echo   1 - Instalar dependencias (npm install)
echo   2 - Compilar proyecto (npm run build)
echo   3 - Iniciar desarrollo (npm run dev)
echo   4 - Limpiar cache y node_modules
echo   5 - Desplegar a GitHub Pages
echo   6 - Git: Agregar archivos (git add)
echo   7 - Git: Commit cambios
echo   8 - Git: Push a GitHub
echo   9 - Git: Pull cambios
echo   10 - Git: Ver estado (git status)
echo   11 - Abrir en navegador (index-simple.html)
echo   12 - Ver estructura del proyecto
echo   0 - Salir
echo.
set /p choice="Selecciona una opcion: "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto build
if "%choice%"=="3" goto dev
if "%choice%"=="4" goto clean
if "%choice%"=="5" goto deploy
if "%choice%"=="6" goto gitadd
if "%choice%"=="7" goto gitcommit
if "%choice%"=="8" goto gitpush
if "%choice%"=="9" goto gitpull
if "%choice%"=="10" goto gitstatus
if "%choice%"=="11" goto browser
if "%choice%"=="12" goto structure
if "%choice%"=="0" goto exit

echo Opcion invalida. Intenta de nuevo.
timeout /t 2 >nul
goto menu

:install
cls
echo ========================================
echo   Instalando dependencias...
echo ========================================
echo.
cd /d "%~dp0"
call npm install
echo.
pause
goto menu

:build
cls
echo ========================================
echo   Compilando proyecto...
echo ========================================
echo.
cd /d "%~dp0"
call npm run build
echo.
if %errorlevel% equ 0 (
    echo Build exitoso!
) else (
    echo Error en el build. Revisa los errores arriba.
)
pause
goto menu

:dev
cls
echo ========================================
echo   Iniciando servidor de desarrollo...
echo ========================================
echo.
echo Abre tu navegador en: http://localhost:5173
echo Presiona Ctrl+C para detener el servidor
echo.
cd /d "%~dp0"
call npm run dev
pause
goto menu

:clean
cls
echo ========================================
echo   Limpiando cache y node_modules...
echo ========================================
echo.
cd /d "%~dp0"
echo [1/3] Eliminando node_modules...
if exist node_modules rmdir /s /q node_modules
echo [2/3] Eliminando dist...
if exist dist rmdir /s /q dist
echo [3/3] Eliminando cache de npm...
call npm cache clean --force
echo.
echo Limpieza completada!
pause
goto menu

:deploy
cls
echo ========================================
echo   Desplegando a GitHub Pages...
echo ========================================
echo.
cd /d "%~dp0"
echo [1/3] Compilando proyecto...
call npm run build
if %errorlevel% neq 0 (
    echo Error en la compilacion.
    pause
    goto menu
)
echo [2/3] Preparando archivos...
if not exist "gh-pages" mkdir gh-pages
xcopy /s /y /q "dist\*" "gh-pages\" >nul
echo [3/3] Build completado!
echo.
echo Archivos listos en: gh-pages\
echo.
echo Para desplegar a GitHub:
echo 1. git add .
echo 2. git commit -m "deploy"
echo 3. git push origin main
echo.
pause
goto menu

:gitadd
cls
echo ========================================
echo   Agregando archivos a Git...
echo ========================================
echo.
cd /d "%~dp0"
git add .
echo Archivos agregados!
echo.
git status --short
pause
goto menu

:gitcommit
cls
echo ========================================
echo   Creando commit...
echo ========================================
echo.
cd /d "%~dp0"
set /p commit_msg="Mensaje del commit: "
if "%commit_msg%"=="" set commit_msg=update: cambios en psico-playroom
git commit -m "%commit_msg%"
echo.
pause
goto menu

:gitpush
cls
echo ========================================
echo   Subiendo a GitHub...
echo ========================================
echo.
cd /d "%~dp0"
git push origin main
if %errorlevel% neq 0 (
    echo Error en el push. Revisa los errores arriba.
) else (
    echo Push completado!
)
pause
goto menu

:gitpull
cls
echo ========================================
echo   Descargando cambios de GitHub...
echo ========================================
echo.
cd /d "%~dp0"
git pull origin main
echo.
pause
goto menu

:gitstatus
cls
echo ========================================
echo   Estado de Git...
echo ========================================
echo.
cd /d "%~dp0"
git status
echo.
pause
goto menu

:browser
cls
echo ========================================
echo   Abriendo en navegador...
echo ========================================
echo.
cd /d "%~dp0"
start "" "index-simple.html"
echo Abierto en el navegador!
timeout /t 2 >nul
goto menu

:structure
cls
echo ========================================
echo   Estructura del Proyecto
echo ========================================
echo.
cd /d "%~dp0"
tree /f /a | more
echo.
pause
goto menu

:exit
cls
echo Hasta luego!
timeout /t 2 >nul
exit /b 0