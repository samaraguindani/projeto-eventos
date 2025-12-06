# Script para iniciar o worker de processamento de emails
# Execute com: .\iniciar-worker-email.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO WORKER DE EMAILS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o PostgreSQL está rodando
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect("localhost", 5432)
    $tcpClient.Close()
    Write-Host "  PostgreSQL OK!" -ForegroundColor Green
} catch {
    Write-Host "ERRO: PostgreSQL não está rodando!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\iniciar-tudo.ps1" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
} finally {
    if ($tcpClient) { $tcpClient.Dispose() }
}
Write-Host ""

# Obter caminho completo atual
$projectPath = $PWD.Path

Write-Host "Iniciando worker de emails..." -ForegroundColor Yellow
Write-Host ""

# Iniciar em novo terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== EMAIL WORKER ===' -ForegroundColor Cyan; Set-Location '$projectPath\services\email-service'; php processar-fila.php"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  WORKER INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "O worker está processando a fila de emails a cada 10 segundos." -ForegroundColor Yellow
Write-Host ""
Write-Host "Para parar o worker:" -ForegroundColor Yellow
Write-Host "  Feche o terminal que foi aberto" -ForegroundColor Gray
Write-Host ""
Read-Host "Pressione Enter para continuar"

