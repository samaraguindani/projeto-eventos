# Sistema de Eventos - Microsserviços

Sistema completo de gerenciamento de eventos baseado em arquitetura de microsserviços, com suporte a operação offline e sincronização automática.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Sistema](#executando-o-sistema)
- [Testando com Postman](#testando-com-postman)
- [Simulando Modo Offline](#simulando-modo-offline)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação da API](#documentação-da-api)

## 🎯 Visão Geral

O Sistema de Eventos permite:
- ✅ Cadastro e autenticação de usuários
- ✅ Listagem e busca de eventos
- ✅ Inscrição em eventos
- ✅ Cancelamento de inscrições
- ✅ Check-in presencial
- ✅ Operação offline com sincronização
- ✅ Emissão e validação de certificados
- ✅ Envio automático de emails

## 🏗️ Arquitetura

O sistema é composto por 5 microsserviços:

1. **Auth Service** (C# .NET 8) - Porta 5001
   - Cadastro e login de usuários
   - Geração e validação de tokens JWT
   - Sistema de logs

2. **Eventos Service** (C# .NET 8) - Porta 5002
   - Listagem e busca de eventos
   - Filtros por categoria, status, data

3. **Inscrições Service** (PHP) - Porta 8001
   - Registro de inscrições
   - Cancelamento
   - Registro de presença
   - Sincronização offline

4. **Certificados Service** (PHP) - Porta 8002
   - Emissão de certificados em PDF
   - Validação de certificados
   - Geração de códigos únicos

5. **Email Service** (PHP) - Porta 8003
   - Processamento de fila de emails
   - Templates de email
   - Worker para processamento assíncrono

**Banco de Dados:** PostgreSQL (Porta 5432)

**Frontend:** Portal Web (HTML + JavaScript) com IndexedDB para offline

## 🛠️ Tecnologias

### Backend
- **C# .NET 8** - Auth Service e Eventos Service
- **PHP 8.1+** - Inscrições, Certificados e Email Services
- **PostgreSQL 14+** - Banco de dados
- **JWT** - Autenticação
- **Entity Framework Core** - ORM para C#
- **PDO** - Acesso ao banco em PHP

### Frontend
- **HTML5 + CSS3 + JavaScript (ES6+)**
- **IndexedDB** - Armazenamento offline
- **Fetch API** - Requisições HTTP

## 📦 Pré-requisitos

### Para Linux (VM)
- .NET 8 SDK
- PHP 8.1 ou superior
- PostgreSQL 14 ou superior
- Apache/Nginx (opcional, para PHP)
- Git

### Para Windows
- Visual Studio 2022 ou .NET 8 SDK
- PHP 8.1 ou superior
- PostgreSQL 14 ou superior
- Git

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd projeto-eventos
```

### 2. Configurar Banco de Dados

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE eventos_db;

# Criar usuário (opcional)
CREATE USER eventos_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE eventos_db TO eventos_user;

# Sair do psql
\q
```

### 3. Executar Scripts SQL

```bash
psql -U postgres -d eventos_db -f database/schema.sql
```

### 4. Configurar Serviços C# .NET

#### Auth Service
```bash
cd services/auth-service
dotnet restore
dotnet build
```

#### Eventos Service
```bash
cd services/eventos-service
dotnet restore
dotnet build
```

### 5. Configurar Serviços PHP

#### Instalar Dependências (se usar Composer)
```bash
cd services/inscricoes-service
composer install

cd ../certificados-service
composer install

cd ../email-service
composer install
```

#### Configurar Servidor PHP

**Opção 1: PHP Built-in Server (Desenvolvimento)**
```bash
# Inscrições Service
cd services/inscricoes-service
php -S localhost:8001

# Certificados Service
cd services/certificados-service
php -S localhost:8002

# Email Service
cd services/email-service
php -S localhost:8003
```

**Opção 2: Apache/Nginx (Produção)**

Configure virtual hosts apontando para cada diretório de serviço.

### 6. Configurar Variáveis de Ambiente

Crie arquivos `.env` ou configure variáveis de ambiente:

```bash
# Database (PostgreSQL na VM)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=eventos_db
export DB_USER=postgres
export DB_PASSWORD=postgres

# JWT
export JWT_SECRET=MinhaChaveSecretaSuperSeguraParaJWT2024!@#$%

# SMTP (opcional)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=seu_email@gmail.com
export SMTP_PASS=sua_senha
export SMTP_FROM=noreply@eventos.com
```

## ▶️ Executando o Sistema

### 1. Iniciar PostgreSQL

```bash
sudo systemctl start postgresql
# ou
sudo service postgresql start
```

### 2. Iniciar Auth Service

```bash
cd services/auth-service
dotnet run
```

Serviço estará disponível em: `http://localhost:5001`

### 3. Iniciar Eventos Service

```bash
cd services/eventos-service
dotnet run
```

Serviço estará disponível em: `http://localhost:5002`

### 4. Iniciar Inscrições Service

```bash
cd services/inscricoes-service
php -S localhost:8001
```

Serviço estará disponível em: `http://localhost:8001`

### 5. Iniciar Certificados Service

```bash
cd services/certificados-service
php -S localhost:8002
```

Serviço estará disponível em: `http://localhost:8002`

### 6. Iniciar Email Service

```bash
cd services/email-service
php -S localhost:8003
```

Serviço estará disponível em: `http://localhost:8003`

### 7. Abrir Portal Web

Abra o arquivo `portal/index.html` no navegador ou configure um servidor web:

```bash
cd portal
python3 -m http.server 8080
```

Acesse: `http://localhost:8080`

### 8. Processar Fila de Emails (Opcional)

Configure um cron job para processar emails periodicamente:

```bash
# Adicionar ao crontab
crontab -e

# Processar a cada 5 minutos
*/5 * * * * cd /caminho/para/services/email-service && php worker.php
```

Ou execute manualmente:

```bash
cd services/email-service
php worker.php
```

## 🧪 Testando com Postman

### 1. Importar Collection

Crie uma nova collection no Postman e adicione as requisições abaixo.

### 2. Fluxo Completo de Testes

#### Passo 1: Cadastro de Usuário
```
POST http://localhost:5001/api/auth/cadastro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@teste.com",
  "senha": "senha123"
}
```

**Salve o token retornado em uma variável do Postman.**

#### Passo 2: Login (Alternativa)
```
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "joao@teste.com",
  "senha": "senha123"
}
```

#### Passo 3: Listar Eventos
```
GET http://localhost:5002/api/eventos
```

#### Passo 4: Inscrever-se em Evento
```
POST http://localhost:8001/api/inscricoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "evento_id": 1
}
```

#### Passo 5: Consultar Minhas Inscrições
```
GET http://localhost:8001/api/inscricoes
Authorization: Bearer {token}
```

#### Passo 6: Registrar Presença
```
POST http://localhost:8001/api/inscricoes/presenca
Content-Type: application/json

{
  "codigo_inscricao": "INS-20240101120000-1234"
}
```

#### Passo 7: Emitir Certificado
```
POST http://localhost:8002/api/certificados/emitir
Authorization: Bearer {token}
Content-Type: application/json

{
  "inscricao_id": 1
}
```

#### Passo 8: Validar Certificado
```
GET http://localhost:8002/api/certificados/validar?codigo=CERT-ABC123DEF456
```

#### Passo 9: Cancelar Inscrição
```
PUT http://localhost:8001/api/inscricoes/1
Authorization: Bearer {token}
```

### 3. Configurar Variáveis no Postman

1. Crie uma variável de ambiente `base_url_auth` = `http://localhost:5001/api`
2. Crie uma variável `base_url_eventos` = `http://localhost:5002/api`
3. Crie uma variável `base_url_inscricoes` = `http://localhost:8001/api/inscricoes`
4. Crie uma variável `base_url_certificados` = `http://localhost:8002/api/certificados`
5. Crie uma variável `token` para armazenar o JWT

## 📱 Simulando Modo Offline

### No Navegador (Chrome DevTools)

1. Abra o Portal Web
2. Abra DevTools (F12)
3. Vá para a aba "Network"
4. Selecione "Offline" no dropdown de throttling
5. Tente fazer uma inscrição
6. A ação será salva no IndexedDB
7. Volte para "Online"
8. A sincronização ocorrerá automaticamente

### Via JavaScript (Console do Navegador)

```javascript
// Forçar modo offline
window.dispatchEvent(new Event('offline'));
navigator.onLine = false;

// Forçar modo online
window.dispatchEvent(new Event('online'));
navigator.onLine = true;

// Sincronizar manualmente
sincronizarDados();
```

### Verificar Dados Offline

```javascript
// No console do navegador
await offlineDB.init();
const inscricoes = await offlineDB.obterInscricoesPendentes();
console.log(inscricoes);
```

## 📁 Estrutura do Projeto

```
projeto-eventos/
├── ARQUITETURA.md              # Documentação da arquitetura
├── API_DOCUMENTATION.md        # Documentação completa da API
├── README.md                   # Este arquivo
├── database/
│   └── schema.sql              # Scripts SQL do banco
├── services/
│   ├── auth-service/           # Auth Service (C#)
│   ├── eventos-service/        # Eventos Service (C#)
│   ├── inscricoes-service/     # Inscrições Service (PHP)
│   ├── certificados-service/   # Certificados Service (PHP)
│   └── email-service/          # Email Service (PHP)
└── portal/                      # Portal Web
    ├── index.html
    ├── styles.css
    └── js/
        ├── app.js
        ├── api.js
        ├── auth.js
        ├── database.js
        ├── eventos.js
        ├── inscricoes.js
        ├── certificados.js
        └── sync.js
```

## 🔍 Troubleshooting

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais em `appsettings.json` (C#) ou variáveis de ambiente (PHP)
- Teste a conexão: `psql -U postgres -d eventos_db`

### Erro de CORS
- Verifique se os serviços têm CORS habilitado
- No Auth Service e Eventos Service, o CORS está configurado para permitir todas as origens

### Erro de JWT
- Verifique se a chave secreta JWT é a mesma em todos os serviços
- Confirme que o token está sendo enviado no header `Authorization: Bearer {token}`

### Erro de Porta em Uso
- Verifique se as portas 5001, 5002, 8001, 8002, 8003 estão livres
- Use `netstat -tulpn | grep :5001` (Linux) ou `netstat -ano | findstr :5001` (Windows)

## 📚 Documentação Adicional

- [Arquitetura Detalhada](ARQUITETURA.md)
- [Documentação da API](API_DOCUMENTATION.md)

## 👥 Contribuindo

Este é um projeto acadêmico. Para contribuições, abra uma issue ou pull request.

## 📄 Licença

Este projeto é para fins acadêmicos.

---

**Desenvolvido como projeto acadêmico de microsserviços**

