# 🎯 Projeto Eventos - Configuração LOCAL

Este é o guia rápido para rodar o projeto localmente no Windows.

## 🚀 Início Rápido

### Pré-requisitos
- Docker Desktop instalado e rodando
- .NET 8 SDK
- PHP 8.1+
- Composer

### Iniciar TUDO de uma vez

```powershell
.\iniciar-tudo.ps1
```

Este script vai:
1. ✅ Iniciar o PostgreSQL no Docker
2. ✅ Instalar dependências (se necessário)
3. ✅ Iniciar todos os 5 serviços
4. ✅ Abrir o navegador automaticamente

### Parar TUDO

```powershell
.\parar-tudo.ps1
```

## 📊 URLs e Portas

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Portal** | http://localhost:8080 | Interface do usuário |
| **Swagger API** | http://localhost:5002/swagger | Testar APIs (Swagger UI) 🆕 |
| **pgAdmin** | http://localhost:5050 | Gerenciamento do banco |
| Auth Service | http://localhost:5001 | Autenticação |
| Eventos Service | http://localhost:5002 | Gestão de eventos |
| Inscrições | http://localhost:8001 | Inscrições |
| Certificados | http://localhost:8002 | Certificados |
| PostgreSQL | localhost:5432 | Banco de dados |

## 🔐 Credenciais

### pgAdmin
- **URL:** http://localhost:5050
- **Email:** admin@eventos.com
- **Senha:** admin123

### PostgreSQL
- **Host:** localhost
- **Porta:** 5432
- **Database:** eventos_db
- **Usuário:** postgres
- **Senha:** postgres123

## 📖 Documentação Completa

Para o guia completo passo a passo, veja: [GUIA_INSTALACAO_LOCAL.md](./GUIA_INSTALACAO_LOCAL.md)

## 🧪 Testar APIs com Swagger

### Abrir Swagger rapidamente

```powershell
.\abrir-swagger.ps1
```

Ou acesse: **http://localhost:5002/swagger**

### Testar todos os endpoints

```powershell
.\testar-api.ps1
```

📖 **Guia completo:** [GUIA_SWAGGER.md](./GUIA_SWAGGER.md)

---

## 🛠️ Comandos Úteis

### Docker

```powershell
# Ver containers rodando
docker ps

# Ver logs do PostgreSQL
docker logs eventos-postgres

# Reiniciar banco de dados
docker-compose restart postgres

# Parar sem remover dados
docker-compose stop

# Iniciar novamente
docker-compose start

# Remover tudo (APAGA DADOS!)
docker-compose down -v
```

### Conectar no Banco via Terminal

```powershell
docker exec -it eventos-postgres psql -U postgres -d eventos_db
```

Comandos úteis no psql:
- `\dt` - listar tabelas
- `\d usuarios` - estrutura da tabela usuarios
- `SELECT * FROM usuarios;` - ver usuários
- `\q` - sair

### Testar APIs Manualmente

```powershell
# Testar Auth Service
Invoke-WebRequest -Uri "http://localhost:5001/api/auth/health" -UseBasicParsing

# Testar Eventos Service
Invoke-WebRequest -Uri "http://localhost:5002/api/eventos" -UseBasicParsing
```

## 🐛 Problemas Comuns

### "Porta já em uso"

```powershell
# Ver o que está usando a porta
netstat -ano | findstr :5432

# Matar o processo (substitua PID pelo número que apareceu)
taskkill /PID [PID] /F
```

### "Docker não responde"

1. Reinicie o Docker Desktop
2. Execute: `docker-compose down`
3. Execute: `docker-compose up -d`

### "Erro ao conectar no banco"

```powershell
# Verificar se o container está rodando
docker ps

# Ver logs
docker logs eventos-postgres

# Reiniciar
docker-compose restart postgres
```

## 📁 Estrutura do Projeto

```
projeto-eventos/
├── docker-compose.yml          # Configuração Docker (PostgreSQL + pgAdmin)
├── iniciar-tudo.ps1           # Script para iniciar tudo
├── parar-tudo.ps1             # Script para parar tudo
├── database/
│   └── schema.sql             # Schema do banco de dados
├── services/
│   ├── auth-service/          # Serviço de autenticação (.NET)
│   ├── eventos-service/       # Serviço de eventos (.NET)
│   ├── inscricoes-service/    # Serviço de inscrições (PHP)
│   ├── certificados-service/  # Serviço de certificados (PHP)
│   └── email-service/         # Serviço de emails (PHP)
└── portal/                    # Frontend (HTML/JS)
```

## 🎓 Fluxo do Sistema

1. **Usuário** acessa o portal (localhost:8080)
2. **Login/Registro** → Auth Service (5001)
3. **Ver Eventos** → Eventos Service (5002)
4. **Se Inscrever** → Inscrições Service (8001)
5. **Receber Certificado** → Certificados Service (8002)
6. **Email** → Email Service (processamento assíncrono)

## ✅ Checklist de Verificação

Antes de começar a desenvolver, verifique:

- [ ] Docker Desktop está rodando
- [ ] Containers PostgreSQL e pgAdmin estão ativos (`docker ps`)
- [ ] Auth Service está respondendo (http://localhost:5001)
- [ ] Eventos Service está respondendo (http://localhost:5002)
- [ ] Portal está acessível (http://localhost:8080)
- [ ] Consegue fazer login no sistema

## 🚀 Próximos Passos

Agora que está tudo local:

1. Faça alterações no código
2. Teste localmente
3. Commite no Git quando estiver funcionando
4. Quando estiver pronto, configure a VM para produção

---

**Desenvolvido com ❤️ localmente!**



