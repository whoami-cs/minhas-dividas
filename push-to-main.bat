@echo off
echo ========================================
echo Preparando para substituir branch main
echo ========================================
echo.

REM Adicionar todos os arquivos
echo [1/6] Adicionando arquivos...
git add .

REM Fazer commit
echo [2/6] Fazendo commit...
git commit -m "Deploy: Configuracao Vercel + Render"

REM Verificar branch atual
echo [3/6] Verificando branch atual...
git branch --show-current

REM Fazer push da branch atual
echo [4/6] Fazendo push da branch atual...
git push origin HEAD

REM Deletar branch main remota
echo [5/6] Deletando branch main remota...
git push origin --delete main

REM Renomear branch atual para main e fazer push
echo [6/6] Criando nova branch main...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo CONCLUIDO! Branch main substituida
echo ========================================
echo.
echo Proximos passos:
echo 1. Acesse GitHub e configure 'main' como branch padrao
echo 2. Siga o guia DEPLOY.md para fazer deploy
echo.
pause
