@echo off
rem Dois cliques: abre a Forja 3D desta pasta (a versao de desenvolvimento, com o codigo mais novo).
rem Sobe o servidor escondido e abre a janela do app. Para ja liberar o celular: abrir-forja.bat --rede
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   O Node.js nao esta instalado neste computador.
  echo   Instale em https://nodejs.org ou use o instalador da Forja, que ja vem com ele.
  echo.
  pause
  exit /b 1
)
node abrir.js %*
