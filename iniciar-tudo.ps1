# Script para iniciar todos os serviços do Projeto Eventos
# Execute com: .\iniciar-tudo.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO PROJETO EVENTOS - 100% LOCAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o PostgreSQL local está rodando
Write-Host "[1/4] Verificando PostgreSQL local..." -ForegroundColor Yellow

# Método mais rápido e compatível para verificar porta
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect("localhost", 5432)
    $tcpClient.Close()
    Write-Host "  PostgreSQL está acessível na porta 5432!" -ForegroundColor Green
} catch {
    Write-Host "ERRO: PostgreSQL não está rodando em localhost:5432!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, certifique-se de que o PostgreSQL está:" -ForegroundColor Yellow
    Write-Host "  1. Instalado no Windows" -ForegroundColor Gray
    Write-Host "  2. Rodando (verifique nos Serviços do Windows)" -ForegroundColor Gray
    Write-Host "  3. Escutando na porta 5432" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para verificar/iniciar o serviço PostgreSQL:" -ForegroundColor Cyan
    Write-Host "  1. Win + R → digite 'services.msc'" -ForegroundColor Gray
    Write-Host "  2. Procure por 'postgresql'" -ForegroundColor Gray
    Write-Host "  3. Clique com botão direito → Iniciar" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
} finally {
    if ($tcpClient) { $tcpClient.Dispose() }
}
Write-Host ""

# Testar conexão com o banco (opcional, mas recomendado)
Write-Host "[2/4] Testando conexão com o banco de dados..." -ForegroundColor Yellow

# Verificar se psql está disponível
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlCmd) {
    $env:PGPASSWORD = "postgres"
    try {
        $testConnection = psql -h localhost -p 5432 -U postgres -d eventos_db -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Conexão com banco OK!" -ForegroundColor Green
        } else {
            Write-Host "  AVISO: Não foi possível conectar ao banco eventos_db" -ForegroundColor Yellow
            Write-Host "  Certifique-se de que:" -ForegroundColor Gray
            Write-Host "    1. O banco 'eventos_db' existe" -ForegroundColor Gray
            Write-Host "    2. O usuário 'postgres' tem acesso" -ForegroundColor Gray
            Write-Host "    3. A senha é 'postgres'" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  Criar banco: createdb -U postgres eventos_db" -ForegroundColor Cyan
            Write-Host "  Criar tabelas: .\criar-tabelas.ps1" -ForegroundColor Cyan
        }
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "  psql não encontrado no PATH - pulando teste de conexão" -ForegroundColor Yellow
    Write-Host "  (O sistema pode funcionar mesmo assim se o banco estiver configurado)" -ForegroundColor Gray
}
Write-Host ""

# Verificar se as dependências PHP estão instaladas
Write-Host "[3/4] Verificando dependências PHP..." -ForegroundColor Yellow

# Verificar se composer está instalado
$composerCmd = Get-Command composer -ErrorAction SilentlyContinue
if (-not $composerCmd) {
    Write-Host "  AVISO: Composer não encontrado!" -ForegroundColor Yellow
    Write-Host "  Instale o Composer: https://getcomposer.org/download/" -ForegroundColor Cyan
    Write-Host "  (Serviços PHP podem não funcionar sem dependências)" -ForegroundColor Gray
    Write-Host ""
} else {
    $needsInstall = $false
    
    if (-not (Test-Path "services\inscricoes-service\vendor")) {
        Write-Host "  Instalando dependências do serviço de inscrições..." -ForegroundColor Gray
        Push-Location services\inscricoes-service
        composer install --no-interaction 2>&1 | Out-Null
        Pop-Location
        $needsInstall = $true
    }

    if (-not (Test-Path "services\certificados-service\vendor")) {
        Write-Host "  Instalando dependências do serviço de certificados..." -ForegroundColor Gray
        Push-Location services\certificados-service
        composer install --no-interaction 2>&1 | Out-Null
        Pop-Location
        $needsInstall = $true
    }

    if (-not (Test-Path "services\email-service\vendor")) {
        Write-Host "  Instalando dependências do serviço de email..." -ForegroundColor Gray
        Push-Location services\email-service
        composer install --no-interaction 2>&1 | Out-Null
        Pop-Location
        $needsInstall = $true
    }
    
    if (-not $needsInstall) {
        Write-Host "  Dependências já instaladas!" -ForegroundColor Green
    } else {
        Write-Host "  Dependências instaladas com sucesso!" -ForegroundColor Green
    }
}
Write-Host ""

# Iniciar serviços em novos terminais
Write-Host "[4/4] Iniciando serviços..." -ForegroundColor Yellow

# Obter caminho completo atual
$projectPath = $PWD.Path

# Auth Service (.NET)
Write-Host "  Iniciando Auth Service (porta 5001)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== AUTH SERVICE ===' -ForegroundColor Cyan; Set-Location '$projectPath\services\auth-service'; dotnet run --urls 'http://localhost:5001'"

# Aguardar 1 segundo entre cada serviço para evitar sobrecarga
Start-Sleep -Milliseconds 500

# Eventos Service (.NET)
Write-Host "  Iniciando Eventos Service (porta 5002)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== EVENTOS SERVICE ===' -ForegroundColor Cyan; Set-Location '$projectPath\services\eventos-service'; dotnet run --urls 'http://localhost:5002'"

Start-Sleep -Milliseconds 500

# Inscrições Service (PHP)
Write-Host "  Iniciando Inscrições Service (porta 8001)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== INSCRICOES SERVICE ===' -ForegroundColor Cyan; Set-Location '$projectPath\services\inscricoes-service'; php -S localhost:8001"

Start-Sleep -Milliseconds 500

# Certificados Service (PHP)
Write-Host "  Iniciando Certificados Service (porta 8002)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== CERTIFICADOS SERVICE ===' -ForegroundColor Cyan; Set-Location '$projectPath\services\certificados-service'; php -S localhost:8002"

Start-Sleep -Milliseconds 500

# Portal (Frontend)
Write-Host "  Iniciando Portal (porta 8080)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== PORTAL FRONTEND ===' -ForegroundColor Cyan; Set-Location '$projectPath\portal'; php -S localhost:8080"

Start-Sleep -Milliseconds 500

# Email Worker
Write-Host "  Iniciando Worker de Emails..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== EMAIL WORKER ===' -ForegroundColor Cyan; Set-Location '$projectPath\services\email-service'; php processar-fila.php"

Write-Host "  Todos os serviços iniciados!" -ForegroundColor Green
Write-Host ""

# Aguardar um pouco para os serviços subirem
Write-Host "Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "  Pronto!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse o sistema em: " -NoNewline
Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Serviços rodando:" -ForegroundColor Yellow
Write-Host "  Portal:          " -NoNewline
Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Auth Service:    " -NoNewline
Write-Host "http://localhost:5001" -ForegroundColor Cyan
Write-Host "  Eventos Service: " -NoNewline
Write-Host "http://localhost:5002" -ForegroundColor Cyan
Write-Host "  Swagger Eventos: " -NoNewline
Write-Host "http://localhost:5002/swagger" -ForegroundColor Cyan
Write-Host "  Inscrições:      " -NoNewline
Write-Host "http://localhost:8001" -ForegroundColor Cyan
Write-Host "  Certificados:    " -NoNewline
Write-Host "http://localhost:8002" -ForegroundColor Cyan
Write-Host "  Email Worker:    " -NoNewline
Write-Host "Rodando em background" -ForegroundColor Green
Write-Host ""
Write-Host "Sistema de Emails:" -ForegroundColor Yellow
Write-Host "  O worker de emails esta processando automaticamente!" -ForegroundColor Green
Write-Host "  Emails serao enviados quando houver:" -ForegroundColor Gray
Write-Host "    - Novas inscricoes" -ForegroundColor Gray
Write-Host "    - Cancelamentos" -ForegroundColor Gray
Write-Host "    - Check-ins" -ForegroundColor Gray
Write-Host "    - Certificados emitidos" -ForegroundColor Gray
Write-Host ""
Write-Host "  Veja o guia completo: GUIA_EMAILS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar todos os serviços:" -ForegroundColor Yellow
Write-Host "  Execute: .\parar-tudo.ps1" -ForegroundColor Cyan
Write-Host "  OU feche todos os terminais que foram abertos" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione Enter para abrir o navegador..."
Read-Host

# Abrir navegador
Start-Process "http://localhost:8080"



