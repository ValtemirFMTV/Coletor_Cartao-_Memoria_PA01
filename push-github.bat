@echo off
REM Script para fazer push inicial do projeto PA01 no GitHub

echo ========================================
echo PA01 - Push Inicial para GitHub
echo ========================================
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Git nao foi encontrado. Instale em: https://git-scm.com
    pause
    exit /b 1
)

REM Inicializar repositório Git local (se ainda não estiver)
if not exist .git (
    echo Inicializando repositório Git...
    git init
    echo ✓ Repositório inicializado
) else (
    echo ✓ Repositório Git já existe
)

echo.
echo Adicionando todos os arquivos...
git add .
echo ✓ Arquivos adicionados

echo.
echo Fazendo commit inicial...
git commit -m "Versão inicial: PWA PA01 com BLE + Service Worker"
echo ✓ Commit realizado

echo.
echo Configurando remote (GitHub)...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/ValtemirFMTV/Coletor_Cartao-_Memoria_PA01.git
echo ✓ Remote configurado

echo.
echo Enviando para GitHub (pode pedir seu token/senha)...
git branch -M main
git push -u origin main

if errorlevel 0 (
    echo.
    echo ========================================
    echo ✓ SUCESSO! Seu projeto está no GitHub
    echo ========================================
    echo.
    echo Link do repositório:
    echo https://github.com/ValtemirFMTV/Coletor_Cartao-_Memoria_PA01
    echo.
    echo Próximos passos:
    echo 1. Vá em Settings ^> Pages
    echo 2. Branch: main, Folder: / ^(root^)
    echo 3. Clique Save
    echo.
    echo Sua URL PWA será:
    echo https://valtemirfmtv.github.io/Coletor_Cartao-_Memoria_PA01
    echo.
    pause
) else (
    echo.
    echo ✗ ERRO ao fazer push. Verifique:
    echo - Credenciais do GitHub
    echo - Token de acesso pessoal (PAT)
    echo - Conexão com internet
    pause
    exit /b 1
)
