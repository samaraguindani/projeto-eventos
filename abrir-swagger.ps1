# Script para abrir o Swagger do Eventos Service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ABRINDO SWAGGER - EVENTOS SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o serviço está rodando
Write-Host "Verificando se o Eventos Service está rodando..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002/swagger/v1/swagger.json" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ Eventos Service está rodando!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Abrindo Swagger no navegador..." -ForegroundColor Cyan
    Start-Process "http://localhost:5002/swagger"
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SWAGGER ABERTO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL: http://localhost:5002/swagger" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "  ❌ Eventos Service NÃO está rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, inicie o serviço primeiro:" -ForegroundColor Yellow
    Write-Host "  1. Execute: .\iniciar-tudo.ps1" -ForegroundColor White
    Write-Host "  OU" -ForegroundColor Gray
    Write-Host "  2. Execute manualmente:" -ForegroundColor White
    Write-Host "     cd services\eventos-service" -ForegroundColor Gray
    Write-Host "     dotnet run --urls 'http://localhost:5002'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Aguarde alguns segundos para o serviço iniciar, então execute:" -ForegroundColor Yellow
    Write-Host "  .\abrir-swagger.ps1" -ForegroundColor White
    Write-Host ""
}

Read-Host "Pressione Enter para sair"







