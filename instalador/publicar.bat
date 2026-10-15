@echo off
rem Dois cliques: monta o setup e anexa na release da versao que esta no arquivo VERSION (na raiz).
rem Precisa do Inno Setup 6 e do GitHub CLI logado (gh auth login).
chcp 65001 >nul
cd /d "%~dp0"
set /p VER=<"..\VERSION"
title Publicar Forja 3D %VER%
echo.
echo   ==  Publicar Forja 3D %VER%  ==
echo   (Se o numero nao e o que voce queria, feche esta janela e mude o VERSION.)
echo.
pause
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1" -Publicar
if errorlevel 1 (echo. & echo   *** Nao deu certo: leia a mensagem em vermelho acima. ***) else (echo. & echo   Pronto! Versao %VER% publicada.)
echo.
pause
