# Script para parar todos os serviços do Projeto Eventos
# Execute com: .\parar-tudo.ps1

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  PARANDO PROJETO EVENTOS - LOCAL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Encerrando processos..." -ForegroundColor Yellow

# Parar processos PHP
Write-Host "  Parando serviços PHP..." -ForegroundColor Gray
Get-Process | Where-Object {$_.ProcessName -eq "php"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Parar processos .NET (dotnet)
Write-Host "  Parando serviços .NET..." -ForegroundColor Gray
Get-Process | Where-Object {$_.ProcessName -like "*ProjetoEventos*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {$_.ProcessName -like "*EventosService*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "  Processos encerrados!" -ForegroundColor Green
Write-Host ""

# Parar containers Docker
Write-Host "Parando containers Docker..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TUDO PARADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para reiniciar, execute: .\iniciar-tudo.ps1" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"




