# Script para atualizar o trigger de vagas no PostgreSQL
# Execute com: .\atualizar-trigger.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ATUALIZAR TRIGGER DE VAGAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se psql está disponível
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "ERRO: psql não encontrado no PATH!" -ForegroundColor Red
    Write-Host "Certifique-se de que o PostgreSQL está instalado e configurado." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "Atualizando trigger de vagas no banco de dados..." -ForegroundColor Yellow
Write-Host ""

# Executar o SQL
$env:PGPASSWORD = "postgres"
try {
    $scriptPath = Join-Path $PSScriptRoot "database\atualizar-trigger-vagas.sql"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "ERRO: Arquivo SQL não encontrado em $scriptPath" -ForegroundColor Red
        exit 1
    }
    
    psql -h localhost -p 5432 -U postgres -d eventos_db -f $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  TRIGGER ATUALIZADO COM SUCESSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora as inscrições canceladas serão REMOVIDAS" -ForegroundColor Yellow
        Write-Host "do banco ao invés de apenas mudar o status." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Você pode se inscrever novamente após cancelar!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "ERRO: Falha ao atualizar o trigger!" -ForegroundColor Red
        Write-Host "Verifique as mensagens de erro acima." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "ERRO: $_" -ForegroundColor Red
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Read-Host "Pressione Enter para sair"

