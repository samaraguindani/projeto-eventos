# Script para criar todas as tabelas no banco de dados LOCAL

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRIANDO TABELAS NO BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o schema.sql existe
if (-not (Test-Path "database\schema.sql")) {
    Write-Host "ERRO: Arquivo database\schema.sql não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se o psql está disponível
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERRO: psql não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "O psql (cliente PostgreSQL) não está instalado ou não está no PATH." -ForegroundColor Yellow
    Write-Host "Por favor, instale o PostgreSQL que inclui o psql." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "[1/3] Lendo schema.sql..." -ForegroundColor Yellow
$schema = Get-Content "database\schema.sql" -Raw -Encoding UTF8

Write-Host "[2/3] Executando SQL no PostgreSQL local..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"

try {
    $schema | psql -h localhost -p 5432 -U postgres -d eventos_db
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ SQL executado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Erro ao executar SQL!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Verifique se:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL está rodando" -ForegroundColor Gray
        Write-Host "  2. Banco 'eventos_db' existe" -ForegroundColor Gray
        Write-Host "  3. Usuário 'postgres' tem permissão" -ForegroundColor Gray
        Write-Host "  4. Senha está correta: 'postgres'" -ForegroundColor Gray
        Remove-Item Env:\PGPASSWORD
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "[3/3] Verificando tabelas criadas..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
psql -h localhost -p 5432 -U postgres -d eventos_db -c "\dt"
Remove-Item Env:\PGPASSWORD

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TABELAS CRIADAS COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agora você pode iniciar os serviços com:" -ForegroundColor Cyan
Write-Host "  .\iniciar-tudo.ps1" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para sair"


