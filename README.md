# 🎉 Sistema de Gestão de Eventos

Sistema completo de gestão de eventos com inscrições, certificados e controle de presença.

---

## 🚀 Início Rápido

### 1. Pré-requisitos
- PostgreSQL (instalado localmente)
- .NET 8 SDK
- PHP 8.1+
- Composer

### 2. Configurar
```powershell
# Criar banco
createdb -U postgres eventos_db

# Criar tabelas
.\criar-tabelas.ps1
```

### 3. Iniciar
```powershell
.\iniciar-tudo.ps1
```

### 4. Acessar
- **Portal:** http://localhost:8080
- **Swagger:** http://localhost:5002/swagger

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_ISSUER=EventosAuth
JWT_AUDIENCE=EventosApp

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_SECURE=tls
EMAIL_FROM=seu_email@gmail.com
EMAIL_FROM_NAME=Sistema de Eventos
```

**Importante:** O arquivo `.env` está no `.gitignore` e não será commitado. Nunca commite credenciais!

---

## 🏗️ Arquitetura

### Microsserviços

| Serviço | Tecnologia | Porta | Descrição |
|---------|------------|-------|-----------|
| Auth Service | .NET 8 | 5001 | Autenticação e usuários |
| Eventos Service | .NET 8 | 5002 | Gestão de eventos |
| Inscrições Service | PHP | 8001 | Inscrições em eventos |
| Certificados Service | PHP | 8002 | Geração de certificados |
| Email Service | PHP | - | Fila de emails (background) |
| Portal | HTML/JS | 8080 | Interface do usuário |

### Banco de Dados
- **PostgreSQL** (localhost:5432)
- 7 tabelas principais
- Views e functions para relatórios
- Triggers para regras de negócio

---

## 🎯 Funcionalidades

✅ **Gestão de Usuários**
- Cadastro e autenticação (JWT)
- Perfil de usuário
- Histórico de inscrições

✅ **Gestão de Eventos**
- Criar e listar eventos
- Filtros por categoria, status, data
- Controle de vagas
- Eventos gratuitos e pagos

✅ **Inscrições**
- Inscrição em eventos
- Cancelamento
- Registro de presença
- Código único por inscrição

✅ **Certificados**
- Geração automática (PDF)
- Código de validação
- Download via portal

✅ **Sistema de Emails**
- Fila assíncrona
- Confirmação de inscrição
- Lembrete de eventos
- Envio de certificados

✅ **Modo Offline**
- LocalStorage no frontend
- Sincronização automática
- Funciona sem conexão

---

## 🛠️ Scripts Úteis

```powershell
# Iniciar todos os serviços
.\iniciar-tudo.ps1

# Parar todos os serviços
.\parar-tudo.ps1

# Criar/recriar tabelas
.\criar-tabelas.ps1

# Testar APIs
.\testar-api.ps1

# Abrir Swagger
.\abrir-swagger.ps1

# Testar conexão com banco
.\testar-conexao.ps1
```

---

## 🧪 Testes

### Testar via Swagger (Recomendado)
```powershell
.\abrir-swagger.ps1
```
Acesse: http://localhost:5002/swagger

### Testar via PowerShell
```powershell
# Listar eventos
Invoke-RestMethod http://localhost:5002/api/eventos

# Buscar evento específico
Invoke-RestMethod http://localhost:5002/api/eventos/1
```

---

## 📊 Banco de Dados

### Tabelas
- `usuarios` - Usuários do sistema
- `eventos` - Eventos disponíveis
- `inscricoes` - Inscrições dos usuários
- `certificados` - Certificados emitidos
- `email_queue` - Fila de emails
- `logs` - Logs de requisições

### Comandos Úteis
```powershell
# Conectar ao banco
psql -U postgres -d eventos_db

# Listar tabelas
\dt

# Ver eventos
SELECT * FROM eventos;

# Ver inscrições
SELECT * FROM vw_inscricoes_detalhadas;

# Estatísticas
SELECT * FROM vw_estatisticas_eventos;
```

---

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Senhas hash com BCrypt
- ✅ CORS configurado
- ✅ Validação de dados
- ✅ Logs de auditoria
- ✅ Credenciais via variáveis de ambiente
- ✅ Arquivos sensíveis no .gitignore

---

## 🌐 APIs

### Auth Service (5001)
```
POST /api/auth/register  - Criar usuário
POST /api/auth/login     - Fazer login
GET  /api/usuarios       - Listar usuários
```

### Eventos Service (5002)
```
GET /api/eventos         - Listar eventos
GET /api/eventos/{id}    - Buscar evento
```

**Documentação completa:** http://localhost:5002/swagger

### Inscrições Service (8001)
```
POST /api/inscricoes     - Fazer inscrição
GET  /api/inscricoes     - Listar inscrições
```

### Certificados Service (8002)
```
POST /api/certificados   - Gerar certificado
GET  /api/certificados/{codigo} - Validar certificado
```

---

## 💻 Desenvolvimento

### Estrutura do Projeto
```
projeto-eventos/
├── services/
│   ├── auth-service/         (.NET 8)
│   ├── eventos-service/      (.NET 8)
│   ├── inscricoes-service/   (PHP)
│   ├── certificados-service/ (PHP)
│   └── email-service/        (PHP)
├── portal/                   (HTML/JS)
├── database/
│   └── schema.sql
└── *.ps1                     (Scripts)
```

### Tecnologias
- **Backend .NET:** ASP.NET Core 8, Entity Framework Core, Npgsql
- **Backend PHP:** PDO, TCPDF (certificados)
- **Frontend:** HTML, CSS, JavaScript vanilla
- **Banco:** PostgreSQL 15
- **Autenticação:** JWT
- **Documentação:** Swagger/OpenAPI

---

## 🐛 Troubleshooting

### PostgreSQL não conecta
```powershell
# Verificar se está rodando
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Iniciar serviço
Start-Service postgresql-x64-XX
```

### Erros de compilação .NET
```powershell
# Limpar cache
cd services\auth-service
Remove-Item -Recurse -Force bin, obj
dotnet clean
dotnet build
```

### Tabelas não existem
```powershell
.\criar-tabelas.ps1
```

---

## 📖 Links Úteis

- [PostgreSQL Download](https://www.postgresql.org/download/windows/)
- [.NET 8 Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PHP Download](https://windows.php.net/download/)
- [Composer Download](https://getcomposer.org/download/)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é open source.

---

## 📞 Suporte

- **Issues:** Abra uma issue no GitHub
- **Swagger:** http://localhost:5002/swagger

---

**Desenvolvido com ❤️ em Windows + PostgreSQL + .NET + PHP**
