# 🚀 Guia Completo - Do Zero ao Sistema Funcionando na VM

Este guia completo te levará do zero até ter o sistema totalmente funcional na sua VM, incluindo testes de endpoints e frontend.

## 📋 Pré-requisitos

- Acesso SSH à VM: `ssh univates@177.44.248.102`
- Terminal/SSH client instalado (Windows: PowerShell, Git Bash, ou PuTTY)

---

## 🔌 PASSO 1: Conectar à VM

### No Windows (PowerShell ou Git Bash):

```bash
ssh univates@177.44.248.102
```

**Primeira conexão:** Digite `yes` quando perguntado sobre a autenticidade do host.

**Senha:** Digite a senha quando solicitado.

✅ **Você está conectado quando vê o prompt:** `univates@nome-da-vm:~$`

---

## 📦 PASSO 2: Verificar e Instalar Dependências

### 2.1. Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2. Verificar PostgreSQL

```bash
# Verificar se está instalado
sudo systemctl status postgresql

# Se não estiver instalado:
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3. Verificar .NET 8 SDK

```bash
# Verificar versão
dotnet --version

# Se não estiver instalado (ou versão < 8.0):
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

### 2.4. Verificar PHP 8.1+

```bash
# Verificar versão
php -v

# Se não estiver instalado (ou versão < 8.1):
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.1 php8.1-cli php8.1-pgsql php8.1-mbstring -y
```

### 2.5. Verificar Composer (Opcional, mas recomendado)

```bash
# Verificar se está instalado
composer --version

# Se não estiver instalado:
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

---

## 🗄️ PASSO 3: Configurar Banco de Dados

### 3.1. Criar Banco de Dados e Configurar Senha

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# No prompt do PostgreSQL (postgres=#), executar:
CREATE DATABASE eventos_db;
ALTER USER postgres WITH PASSWORD 'postgres';

# Sair do PostgreSQL
\q
```

**⚠️ IMPORTANTE:** A senha do usuário `postgres` DEVE ser `postgres` (sem aspas) para funcionar com os serviços!

**Ou em comandos únicos:**

```bash
# Criar banco
sudo -u postgres psql -c "CREATE DATABASE eventos_db;"

# Configurar senha (CRÍTICO - deve ser 'postgres')
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 3.2. Verificar Conexão

```bash
# Testar conexão com senha
PGPASSWORD=postgres psql -U postgres -d eventos_db -c "SELECT version();"

# Ou use sudo (sem precisar de senha)
sudo -u postgres psql -d eventos_db -c "SELECT version();"
```

✅ **Deve retornar a versão do PostgreSQL**

**⚠️ IMPORTANTE:** 
- Use `psql` (não `sql`) - é o cliente PostgreSQL!
- A senha do usuário `postgres` DEVE ser `postgres` para os serviços funcionarem!

---

## 📥 PASSO 4: Clonar Projeto do GitHub

### 4.1. Verificar se Git está Instalado

```bash
# Verificar se git está instalado
git --version

# Se não estiver instalado:
sudo apt install git -y
```

### 4.2. Configurar Git (Primeira Vez)

```bash
# Configurar nome e email (opcional, mas recomendado)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 4.3. Clonar Repositório do GitHub

**Opção A: Clonar via HTTPS (Mais Simples)**

```bash
# Navegar para o diretório home
cd ~

# Clonar o repositório (substitua pela URL do seu repositório)
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos

# Entrar no diretório
cd projeto-eventos
```

**Exemplo:**
```bash
git clone https://github.com/univates/projeto-eventos.git projeto-eventos
```

**Opção B: Clonar via SSH (Recomendado para Repositórios Privados)**

**Primeiro, configure SSH key na VM:**

```bash
# Gerar SSH key (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"

# Pressione Enter para aceitar local padrão
# Digite uma senha (ou deixe vazio)

# Ver a chave pública
cat ~/.ssh/id_ed25519.pub
```

**Copie a chave pública e adicione no GitHub:**
1. Acesse: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole o conteúdo de `~/.ssh/id_ed25519.pub`
4. Salve

**Depois, clone via SSH:**

```bash
cd ~
git clone git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos
cd projeto-eventos
```

**Exemplo:**
```bash
git clone git@github.com:univates/projeto-eventos.git projeto-eventos
```

### 4.4. Verificar se o Projeto foi Clonado Corretamente

```bash
# Verificar estrutura do projeto
ls -la

# Deve mostrar diretórios como: services/, portal/, database/, etc.
ls -la | grep -E "(services|portal|database)"
```

✅ **Deve mostrar os diretórios principais do projeto**

### 4.5. Se o Repositório for Privado e Pedir Credenciais

**Para HTTPS:**
- Use Personal Access Token do GitHub
- Crie em: https://github.com/settings/tokens
- Use o token como senha quando solicitado

**Para SSH:**
- Configure a SSH key como mostrado acima

### 4.6. Atualizar Projeto (Se Já Estiver Clonado)

```bash
# Se o projeto já existe, atualizar com as últimas mudanças
cd ~/projeto-eventos
git pull origin main
# ou
git pull origin master
```

### 4.7. Verificar Branch Atual

```bash
# Ver branch atual
git branch

# Verificar status
git status
```

---

## 🗃️ PASSO 5: Executar Script SQL

```bash
# Certifique-se de estar no diretório do projeto
cd ~/projeto-eventos

# Executar schema (use sudo -u postgres para autenticação)
sudo -u postgres psql -d eventos_db -f database/schema.sql
```

✅ **Deve mostrar mensagens de criação de tabelas**

**⚠️ IMPORTANTE:** Use `sudo -u postgres` antes do comando `psql` para evitar erro de autenticação!

### 5.1. Verificar Tabelas Criadas

```bash
psql -U postgres -d eventos_db -c "\dt"
```

✅ **Deve listar as tabelas:** usuarios, eventos, inscricoes, certificados, email_queue, logs

---

## 🔧 PASSO 6: Configurar Serviços

### 6.1. Auth Service (C#)

```bash
cd ~/projeto-eventos/services/auth-service

# Restaurar dependências
dotnet restore

# Compilar
dotnet build
```

✅ **Deve compilar sem erros**

### 6.2. Eventos Service (C#)

```bash
cd ~/projeto-eventos/services/eventos-service

# Restaurar dependências
dotnet restore

# Compilar
dotnet build
```

✅ **Deve compilar sem erros**

### 6.3. Serviços PHP (Inscrições, Certificados, Email)

```bash
# Inscrições Service
cd ~/projeto-eventos/services/inscricoes-service
composer install --no-dev 2>/dev/null || echo "Composer não necessário ou já instalado"

# Certificados Service
cd ~/projeto-eventos/services/certificados-service
composer install --no-dev 2>/dev/null || echo "Composer não necessário ou já instalado"

# Email Service
cd ~/projeto-eventos/services/email-service
composer install --no-dev 2>/dev/null || echo "Composer não necessário ou já instalado"
```

---

## 🚀 PASSO 7: Iniciar os Serviços

**IMPORTANTE:** Você precisará de **5 terminais** diferentes (ou usar `screen`/`tmux` para múltiplas sessões).

### Opção A: Usar Múltiplos Terminais SSH

Abra 5 conexões SSH diferentes:

```bash
# Terminal 1, 2, 3, 4, 5
ssh univates@177.44.248.102
```

### Opção B: Usar Screen (Recomendado)

```bash
# Instalar screen (se não tiver)
sudo apt install screen -y

# Criar sessões screen
screen -S auth
screen -S eventos
screen -S inscricoes
screen -S certificados
screen -S email

# Para alternar entre sessões: Ctrl+A, depois N (próxima) ou P (anterior)
# Para desanexar: Ctrl+A, depois D
# Para reconectar: screen -r auth
```

### 7.1. Terminal 1 - Auth Service

```bash
cd ~/projeto-eventos/services/auth-service
dotnet run
```

✅ **Aguardar mensagem:** `Now listening on: http://localhost:5001`

### 7.2. Terminal 2 - Eventos Service

```bash
cd ~/projeto-eventos/services/eventos-service
dotnet run
```

✅ **Aguardar mensagem:** `Now listening on: http://localhost:5002`

### 7.3. Terminal 3 - Inscrições Service

```bash
cd ~/projeto-eventos/services/inscricoes-service
php -S localhost:8001
```

✅ **Aguardar mensagem:** `Development Server (http://localhost:8001) started`

### 7.4. Terminal 4 - Certificados Service

```bash
cd ~/projeto-eventos/services/certificados-service
php -S localhost:8002
```

✅ **Aguardar mensagem:** `Development Server (http://localhost:8002) started`

### 7.5. Terminal 5 - Email Service

```bash
cd ~/projeto-eventos/services/email-service
php -S localhost:8003
```

✅ **Aguardar mensagem:** `Development Server (http://localhost:8003) started`

---

## ✅ PASSO 8: Verificar se Todos os Serviços Estão Rodando

### 8.1. Verificar Portas

```bash
# Em um novo terminal SSH
netstat -tulpn | grep -E ':(5001|5002|8001|8002|8003)'
```

✅ **Deve mostrar as 5 portas em LISTEN**

### 8.2. Testar Endpoints Básicos

```bash
# Testar Auth Service
curl http://localhost:5001/api/auth/login

# Testar Eventos Service
curl http://localhost:5002/api/eventos
```

✅ **Deve retornar JSON (mesmo que erro, significa que está respondendo)**

---

## 🧪 PASSO 9: Testar Endpoints com cURL

### 9.1. Cadastrar Usuário

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

**⚠️ IMPORTANTE:** Copie o `token` retornado! Você precisará dele nos próximos passos.

**Exemplo de resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@teste.com"
  }
}
```

### 9.2. Login (Alternativa)

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "senha": "senha123"
  }'
```

✅ **Deve retornar token**

### 9.3. Listar Eventos

```bash
curl http://localhost:5002/api/eventos
```

✅ **Deve retornar lista de eventos (pode estar vazia)**

### 9.4. Inscrever-se em Evento

**Substitua `SEU_TOKEN_AQUI` pelo token obtido no passo 9.1:**

```bash
curl -X POST http://localhost:8001/api/inscricoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "evento_id": 1
  }'
```

✅ **Deve retornar dados da inscrição**

### 9.5. Consultar Minhas Inscrições

```bash
curl http://localhost:8001/api/inscricoes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

✅ **Deve retornar suas inscrições**

### 9.6. Registrar Presença

```bash
curl -X POST http://localhost:8001/api/inscricoes/presenca \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_inscricao": "INS-20240101120000-1234"
  }'
```

**Nota:** Use um código de inscrição válido do passo 9.4.

### 9.7. Emitir Certificado

```bash
curl -X POST http://localhost:8002/api/certificados/emitir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "inscricao_id": 1
  }'
```

### 9.8. Validar Certificado

```bash
curl "http://localhost:8002/api/certificados/validar?codigo=CERT-ABC123DEF456"
```

**Nota:** Use um código de certificado válido do passo 9.7.

---

## 🌐 PASSO 10: Configurar Frontend

### 10.1. Opção A: Acessar Portal Localmente na VM

```bash
# Na VM, abrir portal no navegador (se tiver interface gráfica)
# Ou usar servidor HTTP simples
cd ~/projeto-eventos/portal
python3 -m http.server 8080
```

**Acessar:** `http://177.44.248.102:8080` (se porta 8080 estiver aberta no firewall)

### 10.2. Opção B: Baixar Portal para Testar Localmente (Recomendado)

**No Windows (PowerShell):**

```powershell
# Baixar portal da VM
scp -r univates@177.44.248.102:~/projeto-eventos/portal C:\projeto-eventos-portal
```

**Ou clonar do repositório se já tiver localmente.**

### 10.3. Configurar URLs da API no Frontend

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

### 10.4. Abrir Portal no Navegador

**No Windows:**

1. Abra o arquivo `portal/index.html` no navegador
2. Ou use um servidor local:

```powershell
cd C:\projeto-eventos-portal
python -m http.server 8080
```

**Acessar:** `http://localhost:8080`

---

## 🔥 PASSO 11: Configurar Firewall (Se Necessário)

Se não conseguir acessar os serviços de fora da VM, configure o firewall:

```bash
# Verificar status do firewall
sudo ufw status

# Permitir portas (se firewall estiver ativo)
sudo ufw allow 5001/tcp
sudo ufw allow 5002/tcp
sudo ufw allow 8001/tcp
sudo ufw allow 8002/tcp
sudo ufw allow 8003/tcp
sudo ufw allow 8080/tcp  # Para portal web

# Aplicar regras
sudo ufw reload
```

---

## 🧪 PASSO 12: Testar Frontend Completo

### 12.1. Teste de Cadastro

1. Abra o portal no navegador
2. Clique em "Cadastro"
3. Preencha:
   - Nome: João Silva
   - Email: joao@teste.com
   - Senha: senha123
4. Clique em "Cadastrar"

✅ **Deve mostrar mensagem de sucesso e fazer login automaticamente**

### 12.2. Teste de Listagem de Eventos

1. Após login, você verá a lista de eventos
2. Clique em um evento para ver detalhes

✅ **Deve mostrar detalhes do evento**

### 12.3. Teste de Inscrição

1. Na página de detalhes do evento
2. Clique em "Inscrever-se"

✅ **Deve mostrar mensagem de sucesso**

### 12.4. Teste de Minhas Inscrições

1. No menu, clique em "Minhas Inscrições"
2. Veja suas inscrições ativas

✅ **Deve listar suas inscrições**

### 12.5. Teste de Certificado

1. Em "Minhas Inscrições"
2. Clique em "Emitir Certificado" (se disponível)

✅ **Deve gerar e baixar o certificado**

---

## 📊 PASSO 13: Verificar Logs e Status

### 13.1. Verificar Logs do PostgreSQL

```bash
# Ver últimos logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### 13.2. Verificar Dados no Banco

```bash
# Verificar usuários
psql -U postgres -d eventos_db -c "SELECT id, nome, email FROM usuarios;"

# Verificar eventos
psql -U postgres -d eventos_db -c "SELECT id, titulo, status FROM eventos;"

# Verificar inscrições
psql -U postgres -d eventos_db -c "SELECT id, usuario_id, evento_id, status FROM inscricoes;"
```

### 13.3. Verificar Logs dos Serviços C#

Os logs aparecem diretamente nos terminais onde os serviços estão rodando.

---

## 🛠️ TROUBLESHOOTING

### Problema: Porta já em uso

```bash
# Verificar qual processo está usando a porta
sudo netstat -tulpn | grep :5001

# Matar processo (substitua PID pelo número do processo)
sudo kill -9 <PID>
```

### Problema: Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Testar conexão
psql -U postgres -d eventos_db -c "SELECT 1;"
```

### Problema: CORS Error no Frontend

- Verifique se todos os serviços estão rodando
- Verifique se as URLs no `api.js` estão corretas
- Verifique se o firewall permite as conexões

### Problema: Erro 500 nos endpoints

- Verifique os logs nos terminais dos serviços
- Verifique se o banco de dados está acessível
- Verifique se as tabelas foram criadas corretamente

---

## 📝 RESUMO DOS COMANDOS ESSENCIAIS

```bash
# 1. Conectar à VM
ssh univates@177.44.248.102

# 2. Ir para o projeto
cd ~/projeto-eventos

# 3. Verificar banco
psql -U postgres -d eventos_db -c "\dt"

# 4. Iniciar Auth Service (Terminal 1)
cd services/auth-service && dotnet run

# 5. Iniciar Eventos Service (Terminal 2)
cd services/eventos-service && dotnet run

# 6. Iniciar Inscrições Service (Terminal 3)
cd services/inscricoes-service && php -S localhost:8001

# 7. Iniciar Certificados Service (Terminal 4)
cd services/certificados-service && php -S localhost:8002

# 8. Iniciar Email Service (Terminal 5)
cd services/email-service && php -S localhost:8003

# 9. Verificar portas
netstat -tulpn | grep -E ':(5001|5002|8001|8002|8003)'
```

---

## ✅ CHECKLIST FINAL

- [ ] Conectado à VM via SSH
- [ ] PostgreSQL instalado e rodando
- [ ] .NET 8 SDK instalado
- [ ] PHP 8.1+ instalado
- [ ] Banco de dados `eventos_db` criado
- [ ] Schema SQL executado
- [ ] Todos os 5 serviços compilados/configurados
- [ ] Todos os 5 serviços rodando
- [ ] Portas 5001, 5002, 8001, 8002, 8003 abertas
- [ ] Teste de cadastro via cURL funcionando
- [ ] Teste de login via cURL funcionando
- [ ] Frontend configurado com URLs corretas
- [ ] Portal web abrindo no navegador
- [ ] Cadastro via frontend funcionando
- [ ] Login via frontend funcionando
- [ ] Listagem de eventos funcionando
- [ ] Inscrição em evento funcionando

---

**🎉 Sistema 100% Funcional!**

Se todos os itens do checklist estiverem marcados, seu sistema está completamente operacional!

Para dúvidas, consulte:
- `README.md` - Documentação geral
- `API_DOCUMENTATION.md` - Documentação completa da API
- `INSTALACAO_LINUX.md` - Guia de instalação detalhado

