# Script para corrigir problema de senha do PostgreSQL
# Este script remove os volumes antigos e recria tudo do zero

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  CORRIGINDO SENHA DO POSTGRESQL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "ATENÇÃO: Este script vai remover todos os dados do banco!" -ForegroundColor Red
Write-Host "Os containers e volumes serão recriados do zero." -ForegroundColor Yellow
Write-Host ""
$confirmacao = Read-Host "Deseja continuar? (S/N)"

if ($confirmacao -ne "S" -and $confirmacao -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[1/4] Parando containers..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "[2/4] Removendo volumes (isso apaga os dados)..." -ForegroundColor Yellow
docker-compose down -v

Write-Host ""
Write-Host "[3/4] Removendo volumes órfãos..." -ForegroundColor Yellow
docker volume prune -f

Write-Host ""
Write-Host "[4/4] Recriando containers com a senha correta..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
$contador = 0
do {
    Start-Sleep -Seconds 2
    $dbReady = docker exec eventos-postgres pg_isready -U postgres 2>&1
    $contador++
    Write-Host "  Tentativa $contador..." -ForegroundColor Gray
} while ($dbReady -notlike "*accepting connections*" -and $contador -lt 20)

if ($contador -ge 20) {
    Write-Host ""
    Write-Host "AVISO: Timeout ao aguardar o banco. Verifique os logs:" -ForegroundColor Yellow
    Write-Host "  docker logs eventos-postgres" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SENHA CORRIGIDA COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais do PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Porta: 5432" -ForegroundColor White
Write-Host "  Database: eventos_db" -ForegroundColor White
Write-Host "  Usuário: postgres" -ForegroundColor White
Write-Host "  Senha: postgres123" -ForegroundColor White
Write-Host ""
Write-Host "Agora você pode iniciar os serviços com: .\iniciar-tudo.ps1" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"





