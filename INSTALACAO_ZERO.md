# 🚀 Instalação Completa do Zero - VM Nova

Guia passo a passo completo para instalar e configurar o Sistema de Eventos em uma VM Linux completamente nova.

**VM:** `ssh univates@177.44.248.102`

---

## 📋 Índice

1. [Conectar à VM](#1-conectar-à-vm)
2. [Atualizar Sistema](#2-atualizar-sistema)
3. [Instalar PostgreSQL](#3-instalar-postgresql)
4. [Instalar .NET 8 SDK](#4-instalar-net-8-sdk)
5. [Instalar PHP 8.1+](#5-instalar-php-81)
6. [Instalar Git](#6-instalar-git)
7. [Instalar Composer](#7-instalar-composer)
8. [Clonar Projeto do GitHub](#8-clonar-projeto-do-github)
9. [Configurar Banco de Dados](#9-configurar-banco-de-dados)
10. [Executar Schema SQL](#10-executar-schema-sql)
11. [Configurar Serviços](#11-configurar-serviços)
12. [Iniciar Serviços](#12-iniciar-serviços)
13. [Testar Sistema](#13-testar-sistema)
14. [Configurar Frontend](#14-configurar-frontend)

---

## 1. Conectar à VM

```bash
ssh univates@177.44.248.102
```

**Primeira conexão:** Digite `yes` quando perguntado.

**Senha:** Digite a senha quando solicitado.

✅ **Conectado quando ver:** `univates@nome-da-vm:~$`

---

## 2. Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

⏱️ **Tempo:** ~2-5 minutos

---

## 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

✅ **Deve mostrar:** `Active: active (running)`

⏱️ **Tempo:** ~2-3 minutos

---

## 4. Instalar .NET 8 SDK

```bash
# Adicionar repositório Microsoft
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update

# Instalar .NET 8 SDK
sudo apt-get install -y dotnet-sdk-8.0

# Verificar instalação
dotnet --version
```

✅ **Deve mostrar:** `8.0.x` ou superior

⏱️ **Tempo:** ~5-10 minutos

---

## 5. Instalar PHP 8.1+

```bash
# Adicionar repositório PHP
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Instalar PHP e extensões necessárias
sudo apt install php8.1 php8.1-cli php8.1-pgsql php8.1-mbstring -y

# Verificar instalação
php -v
```

✅ **Deve mostrar:** `PHP 8.1.x` ou superior

⏱️ **Tempo:** ~2-3 minutos

---

## 6. Instalar Git

```bash
# Instalar Git
sudo apt install git -y

# Verificar instalação
git --version

# Configurar Git (opcional)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

✅ **Deve mostrar:** versão do Git

⏱️ **Tempo:** ~1 minuto

---

## 7. Instalar Composer

```bash
# Baixar e instalar Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Verificar instalação
composer --version
```

✅ **Deve mostrar:** versão do Composer

⏱️ **Tempo:** ~1 minuto

---

## 8. Clonar Projeto do GitHub

### 8.1. Via HTTPS (Mais Simples)

```bash
# Ir para diretório home
cd ~

# Clonar repositório (SUBSTITUA pela URL do seu repositório)
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos

# Entrar no diretório
cd projeto-eventos
```

**Exemplo:**
```bash
git clone https://github.com/univates/projeto-eventos.git projeto-eventos
```

### 8.2. Via SSH (Para Repositórios Privados)

**Primeiro, configure SSH key:**

```bash
# Gerar SSH key
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"
# Pressione Enter 3 vezes

# Ver e copiar chave pública
cat ~/.ssh/id_ed25519.pub
```

**Adicione a chave no GitHub:**
1. Acesse: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole a chave copiada
4. Salve

**Depois, clone:**

```bash
cd ~
git clone git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos
cd projeto-eventos
```

### 8.3. Verificar Estrutura

```bash
# Verificar se projeto foi clonado corretamente
ls -la

# Deve mostrar: services/, portal/, database/, etc.
ls -la | grep -E "(services|portal|database)"
```

✅ **Deve mostrar os diretórios principais**

---

## 9. Configurar Banco de Dados

### 9.1. Criar Banco de Dados

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# No prompt do PostgreSQL (postgres=#), executar:
CREATE DATABASE eventos_db;
ALTER USER postgres WITH PASSWORD 'postgres';

# Sair do PostgreSQL
\q
```

**Ou em um comando:**

```bash
sudo -u postgres psql -c "CREATE DATABASE eventos_db;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 9.2. Verificar Banco Criado

```bash
sudo -u postgres psql -l | grep eventos_db
```

✅ **Deve mostrar:** `eventos_db`

---

## 10. Executar Schema SQL

```bash
# Certifique-se de estar no diretório do projeto
cd ~/projeto-eventos

# Executar schema SQL
sudo -u postgres psql -d eventos_db -f database/schema.sql
```

✅ **Deve mostrar mensagens de criação de tabelas**

### 10.1. Verificar Tabelas Criadas

```bash
sudo -u postgres psql -d eventos_db -c "\dt"
```

✅ **Deve listar:** usuarios, eventos, inscricoes, certificados, email_queue, logs

---

## 11. Configurar Serviços

### 11.1. Auth Service (C#)

```bash
cd ~/projeto-eventos/services/auth-service

# Restaurar dependências
dotnet restore

# Compilar
dotnet build
```

✅ **Deve compilar sem erros**

### 11.2. Eventos Service (C#)

```bash
cd ~/projeto-eventos/services/eventos-service

# Restaurar dependências
dotnet restore

# Compilar
dotnet build
```

✅ **Deve compilar sem erros**

### 11.3. Serviços PHP

```bash
# Inscrições Service
cd ~/projeto-eventos/services/inscricoes-service
composer install --no-dev 2>/dev/null || echo "Composer não necessário"

# Certificados Service
cd ~/projeto-eventos/services/certificados-service
composer install --no-dev 2>/dev/null || echo "Composer não necessário"

# Email Service
cd ~/projeto-eventos/services/email-service
composer install --no-dev 2>/dev/null || echo "Composer não necessário"
```

---

## 12. Iniciar Serviços

**IMPORTANTE:** Você precisa de **5 terminais** diferentes ou usar `screen`/`tmux`.

### Opção A: Múltiplos Terminais SSH

Abra 5 conexões SSH:
```bash
ssh univates@177.44.248.102
```

### Opção B: Usar Screen (Recomendado)

```bash
# Instalar screen
sudo apt install screen -y

# Criar sessões
screen -S auth
screen -S eventos
screen -S inscricoes
screen -S certificados
screen -S email

# Alternar entre sessões: Ctrl+A, depois N (próxima) ou P (anterior)
# Desanexar: Ctrl+A, depois D
# Reconectar: screen -r auth
```

### 12.1. Terminal 1 - Auth Service

```bash
cd ~/projeto-eventos/services/auth-service
dotnet run
```

✅ **Aguardar:** `Now listening on: http://localhost:5001`

### 12.2. Terminal 2 - Eventos Service

```bash
cd ~/projeto-eventos/services/eventos-service
dotnet run
```

✅ **Aguardar:** `Now listening on: http://localhost:5002`

### 12.3. Terminal 3 - Inscrições Service

```bash
cd ~/projeto-eventos/services/inscricoes-service
php -S localhost:8001
```

✅ **Aguardar:** `Development Server (http://localhost:8001) started`

### 12.4. Terminal 4 - Certificados Service

```bash
cd ~/projeto-eventos/services/certificados-service
php -S localhost:8002
```

✅ **Aguardar:** `Development Server (http://localhost:8002) started`

### 12.5. Terminal 5 - Email Service

```bash
cd ~/projeto-eventos/services/email-service
php -S localhost:8003
```

✅ **Aguardar:** `Development Server (http://localhost:8003) started`

---

## 13. Testar Sistema

### 13.1. Verificar Portas

```bash
# Em um novo terminal SSH
netstat -tulpn | grep -E ':(5001|5002|8001|8002|8003)'
```

✅ **Deve mostrar as 5 portas em LISTEN**

### 13.2. Testar Endpoints Básicos

```bash
# Testar Auth Service
curl http://localhost:5001/api/auth/login

# Testar Eventos Service
curl http://localhost:5002/api/eventos
```

✅ **Deve retornar JSON (mesmo que erro, significa que está respondendo)**

### 13.3. Testar Cadastro de Usuário

```bash
curl -X POST http://localhost:5001/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@teste.com",
    "senha": "senha123"
  }'
```

✅ **Deve retornar:** `{"token": "...", "usuario": {...}}`

**⚠️ IMPORTANTE:** Copie o `token` retornado!

### 13.4. Testar Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "senha": "senha123"
  }'
```

✅ **Deve retornar token**

### 13.5. Testar Listar Eventos

```bash
curl http://localhost:5002/api/eventos
```

✅ **Deve retornar lista de eventos**

---

## 14. Configurar Frontend

### 14.1. Baixar Portal para Testar Localmente

**No Windows (PowerShell):**

```powershell
# Baixar portal da VM
scp -r univates@177.44.248.102:~/projeto-eventos/portal C:\projeto-eventos-portal
```

### 14.2. Configurar URLs da API

**Editar:** `portal/js/api.js`

**Alterar de:**
```javascript
const API_CONFIG = {
    AUTH: 'http://localhost:5001/api',
    EVENTOS: 'http://localhost:5002/api',
    INSCRICOES: 'http://localhost:8001/api/inscricoes',
    CERTIFICADOS: 'http://localhost:8002/api/certificados'
};
```

**Para:**
```javascript
const API_CONFIG = {
    AUTH: 'http://177.44.248.102:5001/api',
    EVENTOS: 'http://177.44.248.102:5002/api',
    INSCRICOES: 'http://177.44.248.102:8001/api/inscricoes',
    CERTIFICADOS: 'http://177.44.248.102:8002/api/certificados'
};
```

### 14.3. Configurar Firewall (Se Necessário)

```bash
# Verificar status do firewall
sudo ufw status

# Permitir portas
sudo ufw allow 5001/tcp
sudo ufw allow 5002/tcp
sudo ufw allow 8001/tcp
sudo ufw allow 8002/tcp
sudo ufw allow 8003/tcp

# Aplicar
sudo ufw reload
```

### 14.4. Abrir Portal no Navegador

**No Windows:**

1. Abra o arquivo `portal/index.html` no navegador
2. Ou use servidor local:

```powershell
cd C:\projeto-eventos-portal
python -m http.server 8080
```

**Acessar:** `http://localhost:8080`

---

## ✅ Checklist Final

- [ ] Conectado à VM via SSH
- [ ] Sistema atualizado
- [ ] PostgreSQL instalado e rodando
- [ ] .NET 8 SDK instalado
- [ ] PHP 8.1+ instalado
- [ ] Git instalado
- [ ] Composer instalado
- [ ] Projeto clonado do GitHub
- [ ] Banco de dados `eventos_db` criado
- [ ] Schema SQL executado
- [ ] Tabelas criadas (usuarios, eventos, inscricoes, certificados, email_queue, logs)
- [ ] Auth Service compilado
- [ ] Eventos Service compilado
- [ ] Todos os 5 serviços rodando
- [ ] Portas 5001, 5002, 8001, 8002, 8003 abertas
- [ ] Teste de cadastro via cURL funcionando
- [ ] Teste de login via cURL funcionando
- [ ] Frontend configurado com URLs corretas
- [ ] Portal web abrindo no navegador
- [ ] Cadastro via frontend funcionando
- [ ] Login via frontend funcionando

---

## 🎯 Comandos Resumidos Essenciais

```bash
# 1. Conectar à VM
ssh univates@177.44.248.102

# 2. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 3. Instalar dependências
sudo apt install postgresql postgresql-contrib -y
sudo apt install git -y
# ... (ver seções acima para .NET e PHP)

# 4. Clonar projeto
cd ~
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos

# 5. Criar banco
sudo -u postgres psql -c "CREATE DATABASE eventos_db;"

# 6. Executar schema
cd ~/projeto-eventos
sudo -u postgres psql -d eventos_db -f database/schema.sql

# 7. Compilar serviços C#
cd services/auth-service && dotnet restore && dotnet build
cd ../eventos-service && dotnet restore && dotnet build

# 8. Iniciar serviços (5 terminais diferentes)
# Terminal 1: cd services/auth-service && dotnet run
# Terminal 2: cd services/eventos-service && dotnet run
# Terminal 3: cd services/inscricoes-service && php -S localhost:8001
# Terminal 4: cd services/certificados-service && php -S localhost:8002
# Terminal 5: cd services/email-service && php -S localhost:8003
```

---

## 🛠️ Troubleshooting

### Erro: "Porta já em uso"

```bash
# Verificar processo
sudo netstat -tulpn | grep :5001

# Matar processo
sudo kill -9 <PID>
```

### Erro: "Database does not exist"

```bash
# Criar banco
sudo -u postgres psql -c "CREATE DATABASE eventos_db;"
```

### Erro: "Connection refused"

- Verifique se o serviço está rodando
- Verifique se a porta está correta
- Verifique firewall

### Erro: "Permission denied"

```bash
# Usar sudo quando necessário
sudo -u postgres psql ...
```

---

## 📚 Próximos Passos

Após instalação completa:
- Consulte `API_DOCUMENTATION.md` para todos os endpoints
- Veja `GUIA_COMPLETO_VM.md` para testes detalhados
- Leia `README.md` para documentação geral

---

**🎉 Sistema 100% Instalado e Funcional!**

