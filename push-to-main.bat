@echo off
echo ========================================
echo Substituindo branch main
echo ========================================
echo.

REM Renomear branch atual para main
echo [1/3] Renomeando branch para main...
git branch -M main

REM Fazer push forcado para substituir main remota
echo [2/3] Fazendo push forcado...
git push -f origin main

REM Configurar upstream
echo [3/3] Configurando upstream...
git push --set-upstream origin main

echo.
echo ========================================
echo CONCLUIDO! Branch main substituida
echo ========================================
echo.
echo Agora siga o guia DEPLOY.md para fazer deploy
echo.
pause
