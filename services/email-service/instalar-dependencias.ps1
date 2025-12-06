# Script para instalar dependencias do Email Service
# Execute com: .\instalar-dependencias.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALANDO DEPENDENCIAS DO EMAIL SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = $PSScriptRoot
Set-Location $projectPath

# Verificar se Composer esta instalado
if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    Write-Host "Composer nao encontrado. Verificando se existe composer.phar..." -ForegroundColor Yellow
    
    if (Test-Path "composer.phar") {
        Write-Host "Usando composer.phar local" -ForegroundColor Green
        $composer = "php composer.phar"
    } else {
        Write-Host "ERRO: Composer nao encontrado!" -ForegroundColor Red
        Write-Host "Instale o Composer em: https://getcomposer.org/download/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Ou baixe o composer.phar:" -ForegroundColor Yellow
        Write-Host "php -r copy('https://getcomposer.org/installer', 'composer-setup.php');" -ForegroundColor Gray
        Write-Host "php composer-setup.php" -ForegroundColor Gray
        Write-Host "php -r unlink('composer-setup.php');" -ForegroundColor Gray
        exit 1
    }
} else {
    $composer = "composer"
}

Write-Host "Instalando dependencias do SendGrid..." -ForegroundColor Yellow
Write-Host ""

try {
    if ($composer -eq "composer") {
        & composer install
    } else {
        php composer.phar install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Dependencias instaladas com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Cyan
        Write-Host "1. Configure a SENDGRID_API_KEY (veja GUIA_CONFIGURACAO_EMAIL.md)" -ForegroundColor Yellow
        Write-Host "2. Inicie o worker: .\iniciar-worker-email.ps1" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "ERRO ao instalar dependencias" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
$null = Read-Host "Pressione Enter para sair"
