# Script para configurar Gmail rapidamente
# Execute: .\configurar-gmail.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR EMAIL COM GMAIL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar email do Gmail
$email = Read-Host "Digite seu email do Gmail (ex: seuemail@gmail.com)"

# Solicitar senha de app (sem espacos)
Write-Host ""
Write-Host "Digite sua senha de app do Google (sem espacos):" -ForegroundColor Yellow
Write-Host "Exemplo: se a senha e 'zjsw dpka eotz nrww', digite: zjswdpkaeotznrww" -ForegroundColor Gray
$senha = Read-Host "Senha de app"

# Configurar variaveis de ambiente
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_SECURE = "tls"
$env:SMTP_USER = $email
$env:SMTP_PASS = $senha
$env:EMAIL_FROM = $email
$env:EMAIL_FROM_NAME = "Sistema de Eventos"

Write-Host ""
Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Variaveis configuradas:" -ForegroundColor Cyan
Write-Host "  SMTP_HOST: $env:SMTP_HOST" -ForegroundColor Gray
Write-Host "  SMTP_PORT: $env:SMTP_PORT" -ForegroundColor Gray
Write-Host "  SMTP_USER: $env:SMTP_USER" -ForegroundColor Gray
Write-Host "  EMAIL_FROM: $env:EMAIL_FROM" -ForegroundColor Gray
Write-Host ""
Write-Host "Agora voce pode iniciar o worker:" -ForegroundColor Yellow
Write-Host "  .\iniciar-worker-email.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTA: Estas configuracoes sao temporarias (apenas nesta sessao do PowerShell)" -ForegroundColor Yellow
Write-Host "Para configuracao permanente, crie um arquivo .env (veja GUIA_CONFIGURACAO_EMAIL.md)" -ForegroundColor Yellow
Write-Host ""






