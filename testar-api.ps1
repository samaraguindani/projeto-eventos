# Script para testar a API Eventos Service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTANDO API - EVENTOS SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$erros = 0
$sucessos = 0

# Teste 1: Listar todos os eventos
Write-Host "[1/5] Listando todos os eventos..." -ForegroundColor Yellow
try {
    $eventos = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos" -Method GET
    Write-Host "  ✅ Sucesso! Total de eventos: $($eventos.total)" -ForegroundColor Green
    $sucessos++
} catch {
    Write-Host "  ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
    $erros++
}

# Teste 2: Buscar evento específico
Write-Host "`n[2/5] Buscando evento ID 1..." -ForegroundColor Yellow
try {
    $evento = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos/1" -Method GET
    Write-Host "  ✅ Sucesso! Evento: $($evento.titulo)" -ForegroundColor Green
    $sucessos++
} catch {
    Write-Host "  ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
    $erros++
}

# Teste 3: Filtrar por status
Write-Host "`n[3/5] Filtrando eventos ativos..." -ForegroundColor Yellow
try {
    $ativos = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos?status=ativo" -Method GET
    Write-Host "  ✅ Sucesso! Eventos ativos: $($ativos.total)" -ForegroundColor Green
    $sucessos++
} catch {
    Write-Host "  ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
    $erros++
}

# Teste 4: Filtrar por categoria
Write-Host "`n[4/5] Filtrando por categoria 'Tecnologia'..." -ForegroundColor Yellow
try {
    $tecnologia = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos?categoria=Tecnologia" -Method GET
    Write-Host "  ✅ Sucesso! Eventos de tecnologia: $($tecnologia.total)" -ForegroundColor Green
    $sucessos++
} catch {
    Write-Host "  ❌ Falhou: $($_.Exception.Message)" -ForegroundColor Red
    $erros++
}

# Teste 5: Testar 404
Write-Host "`n[5/5] Testando erro 404 (evento inexistente)..." -ForegroundColor Yellow
try {
    $inexistente = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos/999" -Method GET
    Write-Host "  ⚠️  Deveria retornar 404, mas retornou sucesso" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  ✅ Sucesso! 404 funcionando corretamente" -ForegroundColor Green
        $sucessos++
    } else {
        Write-Host "  ❌ Falhou com código diferente: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $erros++
    }
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Sucessos: $sucessos" -ForegroundColor Green
Write-Host "  ❌ Erros: $erros" -ForegroundColor Red
Write-Host ""

if ($erros -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acesse o Swagger para mais testes:" -ForegroundColor Cyan
    Write-Host "  http://localhost:5002/swagger" -ForegroundColor White
} else {
    Write-Host "⚠️  ALGUNS TESTES FALHARAM!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifique se:" -ForegroundColor Yellow
    Write-Host "  1. O Eventos Service está rodando" -ForegroundColor Gray
    Write-Host "  2. O banco de dados está ativo" -ForegroundColor Gray
    Write-Host "  3. As tabelas foram criadas" -ForegroundColor Gray
}

Write-Host ""
Read-Host "Pressione Enter para sair"




