# Script para adicionar CPF e criar usuário admin
# Execute com: .\criar-admin.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRIAR USUARIO ADMIN E ATENDENTE" -ForegroundColor Cyan
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

Write-Host "Executando script SQL..." -ForegroundColor Yellow
Write-Host ""

# Executar o SQL
$env:PGPASSWORD = "postgres"
try {
    $scriptPath = Join-Path $PSScriptRoot "database\adicionar-cpf-e-admin.sql"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "ERRO: Arquivo SQL não encontrado em $scriptPath" -ForegroundColor Red
        exit 1
    }
    
    psql -h localhost -p 5432 -U postgres -d eventos_db -f $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  USUARIOS CRIADOS COM SUCESSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "CREDENCIAIS DE ACESSO:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ADMIN:" -ForegroundColor Cyan
        Write-Host "  Email: admin@eventos.com" -ForegroundColor White
        Write-Host "  Senha: password" -ForegroundColor White
        Write-Host ""
        Write-Host "ATENDENTE:" -ForegroundColor Cyan
        Write-Host "  Email: atendente@eventos.com" -ForegroundColor White
        Write-Host "  Senha: password" -ForegroundColor White
        Write-Host ""
        Write-Host "Use estas credenciais para fazer login no sistema." -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "ERRO: Falha ao executar o script!" -ForegroundColor Red
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

