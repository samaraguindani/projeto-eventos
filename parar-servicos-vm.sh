#!/bin/bash

# Script para parar todos os serviços na VM
# Uso: ./parar-servicos-vm.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Parando serviços...${NC}"

# Parar serviços pelos PIDs
for pidfile in /tmp/*-service.pid /tmp/*-worker.pid; do
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
            service_name=$(basename "$pidfile" .pid)
            echo -e "${GREEN}✓ Parado: $service_name (PID: $pid)${NC}"
        fi
        rm "$pidfile" 2>/dev/null
    fi
done

# Matar processos por porta (fallback)
echo -e "${YELLOW}Verificando processos restantes...${NC}"
pkill -f "dotnet.*auth-service" 2>/dev/null
pkill -f "dotnet.*eventos-service" 2>/dev/null
pkill -f "php -S.*8001" 2>/dev/null
pkill -f "php -S.*8002" 2>/dev/null
pkill -f "php -S.*8003" 2>/dev/null
pkill -f "php.*worker.php" 2>/dev/null

echo -e "${GREEN}✓ Todos os serviços foram parados${NC}"




