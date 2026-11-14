@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

REM =====================================================================
REM  Refugio · Despliegue automático a GitHub Pages
REM
REM  Rellena estas dos líneas antes de ejecutar:
REM    GH_USER  -> tu usuario de GitHub
REM    GH_REPO  -> nombre del repositorio (se creará si no existe)
REM
REM  La página quedará en:  https://GH_USER.github.io/GH_REPO/
REM =====================================================================

set "GH_USER=CoipoNorte"
set "GH_REPO=psico-playroom"

REM Rama donde vive el código y rama donde se publica la página
set "MAIN_BRANCH=main"
set "PAGES_BRANCH=gh-pages"

REM =====================================================================
REM  A partir de aquí no hace falta tocar nada
REM =====================================================================

cd /d "%~dp0"
echo.
echo  ======================================
echo   Refugio - despliegue a GitHub Pages
echo  ======================================
echo.

if "%GH_USER%"=="" (
  echo  [!] Falta GH_USER. Abre deploy.bat y escribe tu usuario de GitHub.
  goto :fin_error
)
if "%GH_REPO%"=="" (
  echo  [!] Falta GH_REPO. Abre deploy.bat y escribe el nombre del repositorio.
  goto :fin_error
)

set "REMOTE_URL=https://github.com/%GH_USER%/%GH_REPO%.git"
set "PAGES_URL=https://%GH_USER%.github.io/%GH_REPO%/"

REM ---------- Comprobar herramientas ----------
where git >nul 2>nul || (
  echo  [!] No se encuentra Git. Instalalo desde https://git-scm.com/download/win
  goto :fin_error
)
where node >nul 2>nul || (
  echo  [!] No se encuentra Node.js. Instalalo desde https://nodejs.org/
  goto :fin_error
)
where npm >nul 2>nul || (
  echo  [!] No se encuentra npm. Reinstala Node.js desde https://nodejs.org/
  goto :fin_error
)
where gh >nul 2>nul && set "HAS_GH=1"

REM ---------- Dependencias ----------
if not exist "node_modules\" (
  echo  [1/6] Instalando dependencias...
  call npm install || goto :fin_error
) else (
  echo  [1/6] Dependencias ya instaladas.
)

REM ---------- Compilar ----------
echo  [2/6] Compilando la aplicacion...
call npm run build || goto :fin_error
if not exist "dist\index.html" (
  echo  [!] La compilacion no genero dist\index.html
  goto :fin_error
)
REM Evita que GitHub Pages procese el sitio con Jekyll
type nul > "dist\.nojekyll"

REM ---------- Repositorio local ----------
if not exist ".git\" (
  echo  [3/6] Creando repositorio Git...
  git init -b %MAIN_BRANCH% >nul 2>nul || (
    git init >nul
    git checkout -b %MAIN_BRANCH% >nul 2>nul
  )
) else (
  echo  [3/6] Repositorio Git encontrado.
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin "%REMOTE_URL%"
) else (
  git remote set-url origin "%REMOTE_URL%"
)

REM ---------- Crear el repositorio remoto si hace falta ----------
if defined HAS_GH (
  gh auth status >nul 2>nul
  if errorlevel 1 (
    echo  [i] Iniciando sesion en GitHub...
    gh auth login || goto :fin_error
  )
  gh repo view "%GH_USER%/%GH_REPO%" >nul 2>nul
  if errorlevel 1 (
    echo  [i] Creando el repositorio %GH_USER%/%GH_REPO% en GitHub...
    gh repo create "%GH_USER%/%GH_REPO%" --public --source=. --remote=origin >nul || goto :fin_error
  )
) else (
  echo  [i] No se encontro GitHub CLI ^(gh^). Si el repositorio aun no existe,
  echo      crealo en https://github.com/new con el nombre "%GH_REPO%" y vuelve a ejecutar.
)

REM ---------- Identidad de Git (solo si no esta configurada) ----------
git config user.name >nul 2>nul || git config user.name "%GH_USER%"
git config user.email >nul 2>nul || git config user.email "%GH_USER%@users.noreply.github.com"

REM ---------- Subir el codigo ----------
echo  [4/6] Guardando y subiendo el codigo a la rama %MAIN_BRANCH%...
git add -A
for /f "usebackq delims=" %%t in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm'"`) do set "SELLO=%%t"
if not defined SELLO set "SELLO=%date% %time:~0,5%"
git commit -m "Actualizacion %SELLO%" >nul 2>nul
if errorlevel 1 echo  [i] No hay cambios nuevos en el codigo.
git push -u origin %MAIN_BRANCH% || goto :fin_error

REM ---------- Publicar la página ----------
echo  [5/6] Publicando la pagina en la rama %PAGES_BRANCH%...
set "TMP_DEPLOY=%TEMP%\refugio-deploy-%RANDOM%"
mkdir "%TMP_DEPLOY%" || goto :fin_error
xcopy /e /i /q /y "dist" "%TMP_DEPLOY%" >nul || goto :fin_error

pushd "%TMP_DEPLOY%"
git init -b %PAGES_BRANCH% >nul 2>nul || (
  git init >nul
  git checkout -b %PAGES_BRANCH% >nul 2>nul
)
git config user.name >nul 2>nul || git config user.name "%GH_USER%"
git config user.email >nul 2>nul || git config user.email "%GH_USER%@users.noreply.github.com"
git add -A
git commit -m "Publicacion %SELLO%" >nul
git push --force "%REMOTE_URL%" %PAGES_BRANCH% || (
  popd
  rmdir /s /q "%TMP_DEPLOY%"
  goto :fin_error
)
popd
rmdir /s /q "%TMP_DEPLOY%"

REM ---------- Activar GitHub Pages ----------
echo  [6/6] Activando GitHub Pages...
if defined HAS_GH (
  gh api -X POST "repos/%GH_USER%/%GH_REPO%/pages" -f "source[branch]=%PAGES_BRANCH%" -f "source[path]=/" >nul 2>nul
  if errorlevel 1 (
    gh api -X PUT "repos/%GH_USER%/%GH_REPO%/pages" -f "source[branch]=%PAGES_BRANCH%" -f "source[path]=/" >nul 2>nul
  )
  echo      Listo.
) else (
  echo      Sin gh no se puede activar automaticamente. Ve a:
  echo      https://github.com/%GH_USER%/%GH_REPO%/settings/pages
  echo      y elige la rama "%PAGES_BRANCH%" como origen.
)

echo.
echo  ======================================
echo   Despliegue completado
echo  ======================================
echo.
echo   Codigo:  %REMOTE_URL%
echo   Pagina:  %PAGES_URL%
echo.
echo   La primera vez puede tardar 1-2 minutos en aparecer.
echo.
pause
exit /b 0

:fin_error
echo.
echo  [!] El despliegue se detuvo por un error. Revisa el mensaje de arriba.
echo.
pause
exit /b 1
