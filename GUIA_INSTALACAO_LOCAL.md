# 🚀 Guia de Instalação e Execução LOCAL

Este guia vai te ajudar a configurar e rodar todo o projeto localmente no Windows, sem usar a VM.

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
2. **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
3. **PHP 8.1+** - [Download](https://windows.php.net/download/)
4. **Composer** (gerenciador de dependências PHP) - [Download](https://getcomposer.org/download/)
5. **Git** (se ainda não tiver) - [Download](https://git-scm.com/download/win)

---

## 🐳 PASSO 1: Iniciar o Banco de Dados (PostgreSQL)

### 1.1 Verificar se o Docker está rodando

Abra o PowerShell e execute:

```powershell
docker --version
```

Se aparecer a versão, está tudo certo!

### 1.2 Iniciar o PostgreSQL e pgAdmin

No diretório do projeto (`C:\projeto-eventos`), execute:

```powershell
docker-compose up -d
```

Este comando vai:
- ✅ Baixar a imagem do PostgreSQL
- ✅ Criar o banco de dados `eventos_db`
- ✅ Executar o schema (criar todas as tabelas)
- ✅ Iniciar o pgAdmin para você gerenciar o banco

### 1.3 Verificar se está rodando

```powershell
docker ps
```

Você deve ver dois containers:
- `eventos-postgres` (porta 5432)
- `eventos-pgadmin` (porta 5050)

### 1.4 Acessar o pgAdmin (opcional)

Abra o navegador e acesse: `http://localhost:5050`

- **Email:** admin@eventos.com
- **Senha:** admin123

Para conectar ao servidor PostgreSQL no pgAdmin:
- **Host:** postgres (nome do container) ou localhost
- **Port:** 5432
- **Database:** eventos_db
- **Username:** postgres
- **Password:** postgres123

---

## 🔧 PASSO 2: Instalar Dependências dos Serviços PHP

### 2.1 Serviço de Inscrições

```powershell
cd services\inscricoes-service
composer install
cd ..\..
```

### 2.2 Serviço de Certificados

```powershell
cd services\certificados-service
composer install
cd ..\..
```

### 2.3 Serviço de Email <<<<<<<<<<<<<<<<AQUI>>>>>>>>>>>>>>>>

```powershell
cd services\email-service
composer install
cd ..\..
```

---

## ▶️ PASSO 3: Iniciar os Serviços

Agora você vai abrir **5 terminais diferentes** (pode ser no PowerShell ou no terminal do VS Code/Cursor).

### Terminal 1: Auth Service (.NET) - Porta 5001

```powershell
cd services\auth-service
dotnet run --urls "http://localhost:5001"
```

Aguarde aparecer: `Now listening on: http://localhost:5001`

### Terminal 2: Eventos Service (.NET) - Porta 5002

```powershell
cd services\eventos-service
dotnet run --urls "http://localhost:5002"
```

Aguarde aparecer: `Now listening on: http://localhost:5002`

### Terminal 3: Inscrições Service (PHP) - Porta 8001

```powershell
cd services\inscricoes-service
php -S localhost:8001
```

### Terminal 4: Certificados Service (PHP) - Porta 8002

```powershell
cd services\certificados-service
php -S localhost:8002
```

### Terminal 5: Portal (Frontend) - Porta 8080

```powershell
cd portal
php -S localhost:8080
```

---

## 🌐 PASSO 4: Acessar o Sistema

Abra seu navegador e acesse: **http://localhost:8080**

---

## ✅ PASSO 5: Testar o Sistema

### 5.1 Criar um usuário

1. Clique em "Registrar"
2. Preencha os dados:
   - Nome: Seu Nome
   - Email: seuemail@teste.com
   - Senha: 123456
   - CPF: 12345678901
   - Telefone: (11) 99999-9999

3. Clique em "Cadastrar"

### 5.2 Fazer Login

1. Use o email e senha que você criou
2. Você será redirecionado para o painel

### 5.3 Explorar Eventos

Os eventos de exemplo já foram criados automaticamente quando o banco foi inicializado!

---

## 🛑 Parar os Serviços

### Parar os serviços .NET e PHP

Pressione `Ctrl+C` em cada terminal

### Parar o Docker (banco de dados)

```powershell
docker-compose down
```

Se quiser manter os dados:
```powershell
docker-compose stop
```

Para reiniciar depois:
```powershell
docker-compose start
```

---

## 🔍 Verificar Logs e Problemas

### Ver logs do PostgreSQL

```powershell
docker logs eventos-postgres
```

### Ver logs do pgAdmin

```powershell
docker logs eventos-pgadmin
```

### Conectar diretamente no banco (via terminal)

```powershell
docker exec -it eventos-postgres psql -U postgres -d eventos_db
```

Comandos úteis no psql:
- `\dt` - listar tabelas
- `\d nome_tabela` - ver estrutura da tabela
- `SELECT * FROM usuarios;` - ver usuários
- `SELECT * FROM eventos;` - ver eventos
- `\q` - sair

---

## 📊 Portas Utilizadas

| Serviço | Porta | URL |
|---------|-------|-----|
| PostgreSQL | 5432 | localhost:5432 |
| pgAdmin | 5050 | http://localhost:5050 |
| Auth Service | 5001 | http://localhost:5001 |
| Eventos Service | 5002 | http://localhost:5002 |
| Inscrições Service | 8001 | http://localhost:8001 |
| Certificados Service | 8002 | http://localhost:8002 |
| Portal (Frontend) | 8080 | http://localhost:8080 |

---

## 🐛 Resolução de Problemas Comuns

### Erro: "Porta já em uso"

Se alguma porta estiver em uso, você pode:

1. **Ver o que está usando a porta:**
```powershell
netstat -ano | findstr :5432
```

2. **Matar o processo:**
```powershell
taskkill /PID [número_do_pid] /F
```

### Erro: "Não consegue conectar ao banco"

1. Verifique se o Docker está rodando
2. Verifique se o container está ativo: `docker ps`
3. Reinicie o container: `docker-compose restart postgres`

### Erro: "composer não encontrado" (PHP)

Instale o Composer: https://getcomposer.org/download/

### Erro: "dotnet não encontrado"

Instale o .NET 8 SDK: https://dotnet.microsoft.com/download/dotnet/8.0

### Erro: "php não encontrado"

1. Instale o PHP: https://windows.php.net/download/
2. Adicione o PHP ao PATH do Windows

---

## 🔄 Reiniciar do Zero

Se algo der muito errado e você quiser começar do zero:

```powershell
# Parar e remover containers, volumes e dados
docker-compose down -v

# Reiniciar
docker-compose up -d
```

⚠️ **ATENÇÃO:** Isso vai apagar TODOS os dados do banco!

---

## 📝 Próximos Passos

Agora que está tudo funcionando localmente, você pode:

1. ✅ Desenvolver e testar novos recursos
2. ✅ Fazer alterações no código
3. ✅ Debugar problemas
4. ✅ Criar novos endpoints
5. ✅ Testar o sistema completo

Quando estiver pronto para colocar em produção, podemos configurar a VM novamente!

---

## 💡 Dicas Úteis

### Script para Iniciar Tudo

Crie um arquivo `iniciar-tudo.ps1`:

```powershell
# Iniciar banco de dados
Write-Host "Iniciando banco de dados..." -ForegroundColor Green
docker-compose up -d

# Aguardar banco ficar pronto
Write-Host "Aguardando banco de dados..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Iniciar serviços em novos terminais
Write-Host "Iniciando serviços..." -ForegroundColor Green

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd services\auth-service; dotnet run --urls 'http://localhost:5001'"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd services\eventos-service; dotnet run --urls 'http://localhost:5002'"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd services\inscricoes-service; php -S localhost:8001"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd services\certificados-service; php -S localhost:8002"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd portal; php -S localhost:8080"

Write-Host "Tudo iniciado! Acesse http://localhost:8080" -ForegroundColor Cyan
```

Para executar:
```powershell
.\iniciar-tudo.ps1
```

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema, verifique:
1. ✅ Docker Desktop está rodando
2. ✅ Todas as portas estão livres
3. ✅ As dependências foram instaladas (composer, dotnet)
4. ✅ Os serviços estão rodando (veja os terminais)

**Boa sorte! 🚀**




