# Script DEFINITIVO para resetar tudo e usar senha simples

Write-Host "============================================" -ForegroundColor Red
Write-Host "  RESETAR TUDO - PostgreSQL do Zero" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host ""
Write-Host "Este script vai:" -ForegroundColor Yellow
Write-Host "  1. Parar todos os containers" -ForegroundColor Gray
Write-Host "  2. Remover TODOS os volumes (apaga dados)" -ForegroundColor Gray
Write-Host "  3. Recriar PostgreSQL com senha: postgres" -ForegroundColor Gray
Write-Host "  4. Testar a conexão" -ForegroundColor Gray
Write-Host ""

$confirmacao = Read-Host "Deseja continuar? (S/N)"
if ($confirmacao -ne "S" -and $confirmacao -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[1/8] Parando containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

Write-Host "[2/8] Removendo volumes..." -ForegroundColor Yellow
docker-compose down -v 2>&1 | Out-Null

Write-Host "[3/8] Limpando volumes órfãos..." -ForegroundColor Yellow
docker volume rm projeto-eventos_postgres_data -f 2>&1 | Out-Null
docker volume rm projeto-eventos_pgadmin_data -f 2>&1 | Out-Null

Write-Host "[4/8] Verificando se volumes foram removidos..." -ForegroundColor Yellow
$volumes = docker volume ls -q | Select-String "eventos"
if ($volumes) {
    Write-Host "  AVISO: Alguns volumes ainda existem:" -ForegroundColor Yellow
    docker volume ls | Select-String "eventos"
}

Write-Host "[5/8] Recriando containers..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "[6/8] Aguardando PostgreSQL iniciar (20 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "[7/8] Testando conexão..." -ForegroundColor Yellow
$testResult = docker exec eventos-postgres psql -U postgres -d eventos_db -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ PostgreSQL respondendo!" -ForegroundColor Green
} else {
    Write-Host "  ❌ PostgreSQL não respondeu. Logs:" -ForegroundColor Red
    docker logs eventos-postgres --tail 20
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "[8/8] Verificando variáveis de ambiente..." -ForegroundColor Yellow
docker exec eventos-postgres env | Select-String "POSTGRES"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  POSTGRESQL RESETADO COM SUCESSO!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Porta: 5432" -ForegroundColor White
Write-Host "  Database: eventos_db" -ForegroundColor White
Write-Host "  Usuário: postgres" -ForegroundColor White
Write-Host "  Senha: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Testando com .NET agora..." -ForegroundColor Yellow
Write-Host ""

# Testar com .NET
.\testar-conexao.ps1

Read-Host "Pressione Enter para sair"



