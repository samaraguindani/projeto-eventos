# Guia de Instalação no Linux (VM)

Este guia detalha passo a passo como instalar e executar o Sistema de Eventos em uma VM Linux.

## 🔌 Acesso à VM

**Servidor:** `177.44.248.102`  
**Usuário:** `univates`  
**Acesso SSH:** `ssh univates@177.44.248.102`

### Conectar via SSH
```bash
ssh univates@177.44.248.102
```

Após conectar, você estará no diretório home do usuário `univates`. O projeto deve estar localizado em `/home/univates/projeto-eventos` ou similar.

## 1. Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Instalar PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 3. Configurar PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE eventos_db;

# Configurar senha do usuário postgres (se necessário)
ALTER USER postgres WITH PASSWORD 'postgres';

# Sair
\q
```

**Nota:** O banco de dados está configurado com:
- **Database:** `eventos_db`
- **User:** `postgres`
- **Password:** `postgres`
- **Port:** `5432`
- **Host:** `localhost` (quando os serviços rodam na mesma VM)

## 4. Executar Script SQL

```bash
# A partir do diretório do projeto
psql -U postgres -d eventos_db -f database/schema.sql
```

**Configuração do Banco de Dados:**
- **Host:** `localhost` (PostgreSQL na mesma VM)
- **Port:** `5432`
- **Database:** `eventos_db`
- **User:** `postgres`
- **Password:** `postgres`

Todos os serviços estão configurados para usar essas credenciais por padrão.

## 5. Instalar .NET 8 SDK

```bash
# Adicionar repositório Microsoft
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update

# Instalar .NET 8 SDK
sudo apt-get install -y dotnet-sdk-8.0
```

## 6. Instalar PHP 8.1+

```bash
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.1 php8.1-cli php8.1-pgsql php8.1-mbstring -y
```

## 6.1. Configurar Acesso ao PostgreSQL

Se necessário, ajustar o arquivo `pg_hba.conf` para permitir conexões:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Adicionar ou verificar a linha:
```
host    all             all             127.0.0.1/32            md5
```

Reiniciar PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 7. Instalar Composer (Opcional)

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

## 8. Configurar Serviços

### Auth Service
```bash
cd services/auth-service
dotnet restore
dotnet build
```

### Eventos Service
```bash
cd services/eventos-service
dotnet restore
dotnet build
```

### Serviços PHP
```bash
# Instalar dependências (se usar composer)
cd services/inscricoes-service
composer install --no-dev

cd ../certificados-service
composer install --no-dev

cd ../email-service
composer install --no-dev
```

## 9. Criar Scripts de Inicialização

### Criar arquivo: `start-services.sh`

```bash
#!/bin/bash

# Iniciar Auth Service
cd services/auth-service
dotnet run &
AUTH_PID=$!
echo "Auth Service iniciado (PID: $AUTH_PID)"

# Iniciar Eventos Service
cd ../eventos-service
dotnet run &
EVENTOS_PID=$!
echo "Eventos Service iniciado (PID: $EVENTOS_PID)"

# Iniciar Inscrições Service
cd ../inscricoes-service
php -S localhost:8001 &
INSCRICOES_PID=$!
echo "Inscrições Service iniciado (PID: $INSCRICOES_PID)"

# Iniciar Certificados Service
cd ../certificados-service
php -S localhost:8002 &
CERTIFICADOS_PID=$!
echo "Certificados Service iniciado (PID: $CERTIFICADOS_PID)"

# Iniciar Email Service
cd ../email-service
php -S localhost:8003 &
EMAIL_PID=$!
echo "Email Service iniciado (PID: $EMAIL_PID)"

echo "Todos os serviços iniciados!"
echo "PIDs: Auth=$AUTH_PID, Eventos=$EVENTOS_PID, Inscrições=$INSCRICOES_PID, Certificados=$CERTIFICADOS_PID, Email=$EMAIL_PID"
echo "Para parar os serviços, execute: kill $AUTH_PID $EVENTOS_PID $INSCRICOES_PID $CERTIFICADOS_PID $EMAIL_PID"

# Salvar PIDs em arquivo
echo "$AUTH_PID $EVENTOS_PID $INSCRICOES_PID $CERTIFICADOS_PID $EMAIL_PID" > /tmp/eventos-services.pids
```

### Tornar executável
```bash
chmod +x start-services.sh
```

## 10. Configurar Systemd Services (Produção)

### Criar: `/etc/systemd/system/eventos-auth.service`

```ini
[Unit]
Description=Eventos Auth Service
After=network.target postgresql.service

[Service]
Type=simple
User=univates
WorkingDirectory=/home/univates/projeto-eventos/services/auth-service
ExecStart=/usr/bin/dotnet run
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Criar: `/etc/systemd/system/eventos-eventos.service`

```ini
[Unit]
Description=Eventos Service
After=network.target postgresql.service

[Service]
Type=simple
User=univates
WorkingDirectory=/home/univates/projeto-eventos/services/eventos-service
ExecStart=/usr/bin/dotnet run
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Ativar serviços
```bash
sudo systemctl daemon-reload
sudo systemctl enable eventos-auth
sudo systemctl enable eventos-eventos
sudo systemctl start eventos-auth
sudo systemctl start eventos-eventos
```

## 11. Configurar Nginx (Opcional - para PHP)

### Criar: `/etc/nginx/sites-available/eventos`

```nginx
server {
    listen 80;
    server_name localhost;

    # Inscrições Service
    location /api/inscricoes {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Certificados Service
    location /api/certificados {
        proxy_pass http://localhost:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Email Service
    location /api/email {
        proxy_pass http://localhost:8003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Portal Web
    location / {
        root /home/univates/projeto-eventos/portal;
        index index.html;
    }
}
```

### Ativar configuração
```bash
sudo ln -s /etc/nginx/sites-available/eventos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 12. Configurar Cron para Email Worker

```bash
crontab -e

# Adicionar linha:
*/5 * * * * cd /home/univates/projeto-eventos/services/email-service && php worker.php >> /var/log/email-worker.log 2>&1
```

## 13. Verificar Instalação

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar .NET
dotnet --version

# Verificar PHP
php -v

# Testar conexão com banco
psql -U postgres -d eventos_db -c "SELECT COUNT(*) FROM usuarios;"
```

## 14. Iniciar Sistema

```bash
# Opção 1: Script manual
./start-services.sh

# Opção 2: Systemd (produção)
sudo systemctl start eventos-auth
sudo systemctl start eventos-eventos
# PHP services via script ou systemd separado
```

## 15. Acessar Sistema

### Acesso Local (na VM)
- Portal Web: `http://localhost` (se configurado Nginx) ou abra `portal/index.html` diretamente
- Auth Service: `http://localhost:5001`
- Eventos Service: `http://localhost:5002`
- Inscrições Service: `http://localhost:8001`
- Certificados Service: `http://localhost:8002`
- Email Service: `http://localhost:8003`

### Acesso Remoto (de fora da VM)
Se configurado firewall e portas abertas, acesse via IP da VM:
- Portal Web: `http://177.44.248.102` (se configurado Nginx)
- Auth Service: `http://177.44.248.102:5001`
- Eventos Service: `http://177.44.248.102:5002`
- Inscrições Service: `http://177.44.248.102:8001`
- Certificados Service: `http://177.44.248.102:8002`
- Email Service: `http://177.44.248.102:8003`

**Nota:** Certifique-se de que as portas estão abertas no firewall da VM.

## Troubleshooting

### Porta já em uso
```bash
# Verificar portas
sudo netstat -tulpn | grep -E ':(5001|5002|8001|8002|8003)'

# Matar processo
sudo kill -9 <PID>
```

### Erro de permissão
```bash
# Dar permissão de escrita para certificados
chmod -R 755 services/certificados-service/certificados/
```

### Logs
```bash
# Ver logs do systemd
sudo journalctl -u eventos-auth -f
sudo journalctl -u eventos-eventos -f

# Ver logs do PHP
tail -f /var/log/php-errors.log
```

