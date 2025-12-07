# Script para limpar cache e reiniciar tudo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIMPANDO CACHE E REINICIANDO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpar build do Auth Service
Write-Host "[1/5] Limpando cache do Auth Service..." -ForegroundColor Yellow
Push-Location services\auth-service
Remove-Item -Recurse -Force bin -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force obj -ErrorAction SilentlyContinue
dotnet clean --verbosity quiet
Pop-Location
Write-Host "  Cache limpo!" -ForegroundColor Green

# Limpar build do Eventos Service
Write-Host ""
Write-Host "[2/5] Limpando cache do Eventos Service..." -ForegroundColor Yellow
Push-Location services\eventos-service
Remove-Item -Recurse -Force bin -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force obj -ErrorAction SilentlyContinue
dotnet clean --verbosity quiet
Pop-Location
Write-Host "  Cache limpo!" -ForegroundColor Green

# Verificar Docker
Write-Host ""
Write-Host "[3/5] Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Docker não está rodando!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "  Docker OK!" -ForegroundColor Green

# Verificar PostgreSQL
Write-Host ""
Write-Host "[4/5] Testando conexão com PostgreSQL..." -ForegroundColor Yellow
$testResult = docker exec eventos-postgres psql -U postgres -d eventos_db -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  PostgreSQL OK!" -ForegroundColor Green
} else {
    Write-Host "ERRO: PostgreSQL não está respondendo!" -ForegroundColor Red
    Write-Host "Execute primeiro: docker-compose down -v && docker-compose up -d" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Iniciar serviços
Write-Host ""
Write-Host "[5/5] Iniciando serviços..." -ForegroundColor Yellow

# Auth Service (.NET)
Write-Host "  Iniciando Auth Service (porta 5001)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== AUTH SERVICE ===' -ForegroundColor Cyan; cd '$PWD\services\auth-service'; dotnet run --urls 'http://localhost:5001'"

# Aguardar um pouco antes de iniciar o próximo
Start-Sleep -Seconds 2

# Eventos Service (.NET)
Write-Host "  Iniciando Eventos Service (porta 5002)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== EVENTOS SERVICE ===' -ForegroundColor Cyan; cd '$PWD\services\eventos-service'; dotnet run --urls 'http://localhost:5002'"

# Aguardar um pouco
Start-Sleep -Seconds 2

# Inscrições Service (PHP)
Write-Host "  Iniciando Inscrições Service (porta 8001)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== INSCRICOES SERVICE ===' -ForegroundColor Cyan; cd '$PWD\services\inscricoes-service'; php -S localhost:8001"

# Certificados Service (PHP)
Write-Host "  Iniciando Certificados Service (porta 8002)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== CERTIFICADOS SERVICE ===' -ForegroundColor Cyan; cd '$PWD\services\certificados-service'; php -S localhost:8002"

# Portal (Frontend)
Write-Host "  Iniciando Portal (porta 8080)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== PORTAL FRONTEND ===' -ForegroundColor Cyan; cd '$PWD\portal'; php -S localhost:8080"

Write-Host "  Todos os serviços iniciados!" -ForegroundColor Green
Write-Host ""

# Aguardar serviços ficarem prontos
Write-Host "Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SISTEMA INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verifique os terminais que abriram." -ForegroundColor Yellow
Write-Host "Se o Auth Service mostrar erro, FECHE-O e execute:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd services\auth-service" -ForegroundColor Cyan
Write-Host "  dotnet run --urls 'http://localhost:5001'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Portal: " -NoNewline
Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para abrir o navegador"
Start-Process "http://localhost:8080"





