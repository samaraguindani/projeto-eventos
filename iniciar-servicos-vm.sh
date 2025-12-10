#!/bin/bash

# Script para iniciar todos os serviços na VM
# Uso: ./iniciar-servicos-vm.sh

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_DIR="$HOME/projeto-eventos"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Iniciando Serviços - Sistema de Eventos${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar se o diretório existe
if [ ! -d "$BASE_DIR" ]; then
    echo -e "${RED}Erro: Diretório $BASE_DIR não encontrado!${NC}"
    exit 1
fi

# Auth Service
echo -e "${YELLOW}[1/6] Iniciando Auth Service (porta 5001)...${NC}"
cd "$BASE_DIR/services/auth-service"
nohup dotnet run > /tmp/auth-service.log 2>&1 &
echo $! > /tmp/auth-service.pid
sleep 3
if ps -p $(cat /tmp/auth-service.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Auth Service iniciado (PID: $(cat /tmp/auth-service.pid))${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar Auth Service. Verifique /tmp/auth-service.log${NC}"
fi

# Eventos Service
echo -e "${YELLOW}[2/6] Iniciando Eventos Service (porta 5002)...${NC}"
cd "$BASE_DIR/services/eventos-service"
nohup dotnet run > /tmp/eventos-service.log 2>&1 &
echo $! > /tmp/eventos-service.pid
sleep 3
if ps -p $(cat /tmp/eventos-service.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Eventos Service iniciado (PID: $(cat /tmp/eventos-service.pid))${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar Eventos Service. Verifique /tmp/eventos-service.log${NC}"
fi

# Inscrições Service
echo -e "${YELLOW}[3/6] Iniciando Inscrições Service (porta 8001)...${NC}"
cd "$BASE_DIR/services/inscricoes-service"
nohup php -S 0.0.0.0:8001 router.php > /tmp/inscricoes-service.log 2>&1 &
echo $! > /tmp/inscricoes-service.pid
sleep 2
if ps -p $(cat /tmp/inscricoes-service.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Inscrições Service iniciado (PID: $(cat /tmp/inscricoes-service.pid))${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar Inscrições Service. Verifique /tmp/inscricoes-service.log${NC}"
fi

# Certificados Service
echo -e "${YELLOW}[4/6] Iniciando Certificados Service (porta 8002)...${NC}"
cd "$BASE_DIR/services/certificados-service"
nohup php -S 0.0.0.0:8002 router.php > /tmp/certificados-service.log 2>&1 &
echo $! > /tmp/certificados-service.pid
sleep 2
if ps -p $(cat /tmp/certificados-service.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Certificados Service iniciado (PID: $(cat /tmp/certificados-service.pid))${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar Certificados Service. Verifique /tmp/certificados-service.log${NC}"
fi

# Email Service
echo -e "${YELLOW}[5/6] Iniciando Email Service (porta 8003)...${NC}"
cd "$BASE_DIR/services/email-service"
nohup php -S 0.0.0.0:8003 index.php > /tmp/email-service.log 2>&1 &
echo $! > /tmp/email-service.pid
sleep 2
if ps -p $(cat /tmp/email-service.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Email Service iniciado (PID: $(cat /tmp/email-service.pid))${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar Email Service. Verifique /tmp/email-service.log${NC}"
fi

# Email Worker
echo -e "${YELLOW}[6/6] Iniciando Email Worker...${NC}"
cd "$BASE_DIR/services/email-service"
nohup php worker.php > /tmp/email-worker.log 2>&1 &
echo $! > /tmp/email-worker.pid
sleep 2
if ps -p $(cat /tmp/email-worker.pid) > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Email Worker iniciado (PID: $(cat /tmp/email-worker.pid))${NC}"
else
    echo -e "${RED}✗ Erro ao iniciar Email Worker. Verifique /tmp/email-worker.log${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Serviços Iniciados!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Portal: ${YELLOW}http://177.44.248.110${NC}"
echo -e "Auth Swagger: ${YELLOW}http://177.44.248.110:5001/swagger${NC}"
echo -e "Eventos Swagger: ${YELLOW}http://177.44.248.110:5002/swagger${NC}"
echo -e "Inscrições Swagger: ${YELLOW}http://177.44.248.110:8001/swagger${NC}"
echo -e "Certificados Swagger: ${YELLOW}http://177.44.248.110:8002/swagger${NC}"
echo ""
echo -e "Ver logs: ${YELLOW}tail -f /tmp/*-service.log${NC}"
echo -e "Parar serviços: ${YELLOW}./parar-servicos-vm.sh${NC}"




