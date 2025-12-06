# 🚀 Setup 100% Local (SEM Docker)

Este guia configura o projeto completamente local, usando PostgreSQL instalado diretamente no Windows.

---

## 📋 Pré-requisitos

### 1. PostgreSQL (Instalado no Windows)

**Download:** https://www.postgresql.org/download/windows/

Durante a instalação:
- ✅ Porta: **5432** (padrão)
- ✅ Usuário: **postgres**
- ✅ Senha: **postgres** (ou ajuste nos appsettings.json)
- ✅ Instale o **pgAdmin** (opcional, mas recomendado)

### 2. .NET 8 SDK

**Download:** https://dotnet.microsoft.com/download/dotnet/8.0

### 3. PHP 8.1+

**Download:** https://windows.php.net/download/

**Importante:** Adicione o PHP ao PATH do Windows

### 4. Composer (para dependências PHP)

**Download:** https://getcomposer.org/download/

---

## 🔧 PASSO 1: Configurar PostgreSQL

### 1.1 Verificar se PostgreSQL está rodando

Abra o PowerShell:

```powershell
# Testar se a porta 5432 está aberta
Test-NetConnection -ComputerName localhost -Port 5432
```

Se não estiver rodando:
1. Abra **Serviços do Windows** (Win + R → `services.msc`)
2. Procure por **postgresql-x64-XX** (XX = versão)
3. Clique com botão direito → **Iniciar**

### 1.2 Criar o banco de dados

```powershell
# Método 1: Via psql
createdb -U postgres eventos_db

# OU Método 2: Via SQL
psql -U postgres -c "CREATE DATABASE eventos_db;"
```

Se pedir senha, digite: `postgres`

### 1.3 Criar as tabelas

```powershell
cd C:\projeto-eventos
.\criar-tabelas.ps1
```

Este script vai:
- ✅ Ler o `database/schema.sql`
- ✅ Executar no PostgreSQL local
- ✅ Criar todas as tabelas, views, functions e triggers
- ✅ Inserir dados de exemplo (3 eventos)

---

## 🎯 PASSO 2: Verificar Configurações

### 2.1 Connection Strings (já devem estar corretas)

Os arquivos `appsettings.json` devem ter:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres;Password=postgres"
  }
}
```

**Arquivos a verificar:**
- `services/auth-service/appsettings.json` ✅
- `services/eventos-service/appsettings.json` ✅
- `services/certificados-service/config/database.php` ✅
- `services/inscricoes-service/config/database.php` ✅
- `services/email-service/config/database.php` ✅

### 2.2 Instalar dependências PHP

```powershell
# Inscrições Service
cd services\inscricoes-service
composer install
cd ..\..

# Certificados Service
cd services\certificados-service
composer install
cd ..\..

# Email Service
cd services\email-service
composer install
cd ..\..
```

---

## ▶️ PASSO 3: Iniciar Todos os Serviços

### Método Automático (Recomendado)

```powershell
.\iniciar-tudo.ps1
```

Este script vai:
1. ✅ Verificar se PostgreSQL está rodando
2. ✅ Testar conexão com o banco
3. ✅ Verificar/instalar dependências PHP
4. ✅ Abrir 5 terminais com os serviços
5. ✅ Exibir as URLs de acesso

### Método Manual

**Terminal 1: Auth Service**
```powershell
cd services\auth-service
dotnet run --urls "http://localhost:5001"
```

**Terminal 2: Eventos Service**
```powershell
cd services\eventos-service
dotnet run --urls "http://localhost:5002"
```

**Terminal 3: Inscrições Service**
```powershell
cd services\inscricoes-service
php -S localhost:8001
```

**Terminal 4: Certificados Service**
```powershell
cd services\certificados-service
php -S localhost:8002
```

**Terminal 5: Portal (Frontend)**
```powershell
cd portal
php -S localhost:8080
```

---

## 🌐 PASSO 4: Acessar o Sistema

### URLs Principais

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Portal** | http://localhost:8080 | Interface principal |
| **Swagger** | http://localhost:5002/swagger | Testar APIs |
| **Auth API** | http://localhost:5001/api | Autenticação |
| **Eventos API** | http://localhost:5002/api | Eventos |

### Testar

1. Acesse: http://localhost:8080
2. Clique em "Registrar"
3. Crie um usuário de teste
4. Faça login
5. Explore os eventos!

---

## 🔍 Gerenciar o Banco de Dados

### Via pgAdmin (Interface Visual)

1. Abra o **pgAdmin** (instalado com PostgreSQL)
2. Conecte ao servidor:
   - Host: `localhost`
   - Port: `5432`
   - Database: `eventos_db`
   - Username: `postgres`
   - Password: `postgres`

### Via psql (Linha de Comando)

```powershell
# Conectar ao banco
psql -h localhost -p 5432 -U postgres -d eventos_db

# Comandos úteis:
\dt                          # Listar tabelas
\d usuarios                  # Ver estrutura da tabela usuarios
SELECT * FROM eventos;       # Ver eventos
SELECT * FROM usuarios;      # Ver usuários
\q                          # Sair
```

---

## 🛑 Parar os Serviços

### Método Automático

```powershell
.\parar-tudo.ps1
```

### Método Manual

- Pressione `Ctrl+C` em cada terminal dos serviços

---

## 🧪 Testar o Sistema

### 1. Testar APIs via Swagger

```powershell
.\abrir-swagger.ps1
```

Ou acesse: http://localhost:5002/swagger

### 2. Testar APIs via Script

```powershell
.\testar-api.ps1
```

### 3. Testar Conexão com Banco

```powershell
.\testar-conexao.ps1
```

---

## 🔧 Comandos Úteis

### PostgreSQL

```powershell
# Verificar status
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Iniciar serviço
Start-Service postgresql-x64-XX

# Parar serviço
Stop-Service postgresql-x64-XX

# Ver bancos de dados
psql -U postgres -c "\l"

# Ver conexões ativas
psql -U postgres -d eventos_db -c "SELECT * FROM pg_stat_activity;"
```

### Backup e Restore

```powershell
# Fazer backup
pg_dump -U postgres -d eventos_db -F c -f backup.dump

# Restaurar backup
pg_restore -U postgres -d eventos_db -c backup.dump
```

---

## 🐛 Troubleshooting

### PostgreSQL não inicia

**Problema:** Porta 5432 não está acessível

**Solução:**
1. Abra Serviços do Windows (Win + R → `services.msc`)
2. Procure por serviço PostgreSQL
3. Clique com botão direito → Propriedades
4. Tipo de inicialização: **Automático**
5. Clique em **Iniciar**

### Erro "psql não encontrado"

**Problema:** psql não está no PATH

**Solução:**
1. Adicione ao PATH: `C:\Program Files\PostgreSQL\XX\bin`
2. Reinicie o PowerShell
3. Teste: `psql --version`

### Erro "Senha incorreta"

**Problema:** Senha do postgres diferente

**Solução 1: Atualizar appsettings.json**
```json
"Password=SUA_SENHA_AQUI"
```

**Solução 2: Resetar senha do postgres**
```powershell
# Via psql (como administrador)
ALTER USER postgres WITH PASSWORD 'postgres';
```

### Erro "Banco eventos_db não existe"

**Solução:**
```powershell
createdb -U postgres eventos_db
```

### Serviços .NET não iniciam

**Problema:** Cache desatualizado

**Solução:**
```powershell
# Auth Service
cd services\auth-service
Remove-Item -Recurse -Force bin, obj
dotnet clean
dotnet build

# Eventos Service
cd ..\eventos-service
Remove-Item -Recurse -Force bin, obj
dotnet clean
dotnet build

cd ..\..
```

---

## 📊 Estrutura do Setup Local

```
Windows (Seu PC)
├── PostgreSQL
│   ├── localhost:5432
│   ├── Database: eventos_db
│   └── User: postgres
│
├── Serviços .NET
│   ├── Auth Service → :5001
│   └── Eventos Service → :5002
│
├── Serviços PHP
│   ├── Inscrições → :8001
│   ├── Certificados → :8002
│   └── Portal → :8080
│
└── Ferramentas
    ├── pgAdmin (opcional)
    ├── Swagger → :5002/swagger
    └── Scripts PowerShell
```

---

## ✅ Checklist de Verificação

Antes de começar a desenvolver:

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `eventos_db` criado
- [ ] Tabelas criadas (executei `criar-tabelas.ps1`)
- [ ] .NET 8 SDK instalado
- [ ] PHP instalado e no PATH
- [ ] Composer instalado
- [ ] Dependências PHP instaladas
- [ ] Todos os 5 serviços iniciam sem erro
- [ ] Portal abre em localhost:8080
- [ ] Swagger abre em localhost:5002/swagger
- [ ] Consigo criar usuário e fazer login

---

## 🎯 Vantagens do Setup Local

✅ **Sem Docker:** Mais simples, sem overhead  
✅ **Performance:** Acesso direto ao banco  
✅ **Ferramentas nativas:** pgAdmin, psql  
✅ **Debug fácil:** Attach debugger direto  
✅ **Persistência:** Dados não se perdem ao reiniciar  

---

## 📚 Próximos Passos

1. ✅ Configure seu IDE (VS Code/Cursor)
2. ✅ Instale extensões úteis (C#, PHP, PostgreSQL)
3. ✅ Configure breakpoints para debug
4. ✅ Explore o Swagger
5. ✅ Comece a desenvolver!

---

**Seu ambiente está 100% local e pronto para desenvolvimento! 🚀**


