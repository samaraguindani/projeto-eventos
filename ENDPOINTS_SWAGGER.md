# Endpoints das APIs - URLs do Swagger

Este documento lista todos os endpoints de cada serviço e suas respectivas URLs do Swagger para testes.

---

## 🔐 Auth Service (C# .NET 8)

**Base URL:** `http://localhost:5001`  
**Swagger UI:** `http://localhost:5001/swagger`  
**API Base:** `http://localhost:5001/api`

### Endpoints Disponíveis:

#### Autenticação
- **POST** `/api/auth/cadastro` - Cadastrar novo usuário
- **POST** `/api/auth/login` - Fazer login
- **GET** `/api/auth/me` - Obter usuário autenticado (requer autenticação)

#### Usuários
- **GET** `/api/usuarios/{id}` - Obter usuário por ID (requer autenticação)
- **PUT** `/api/usuarios/{id}` - Atualizar usuário (requer autenticação)

### Como testar no Swagger:
1. Acesse: `http://localhost:5001/swagger`
2. Para endpoints protegidos, clique em "Authorize" e cole o token JWT obtido do login
3. O token deve ser no formato: `Bearer {seu_token}`

---

## 📅 Eventos Service (C# .NET 8)

**Base URL:** `http://localhost:5002`  
**Swagger UI:** `http://localhost:5002/swagger`  
**API Base:** `http://localhost:5002/api`

### Endpoints Disponíveis:

#### Eventos
- **GET** `/api/eventos` - Listar todos os eventos (público)
  - Query params: `status`, `categoria`, `dataInicio`, `dataFim`
- **GET** `/api/eventos/{id}` - Obter evento por ID (público)

### Como testar no Swagger:
1. Acesse: `http://localhost:5002/swagger`
2. Os endpoints de eventos são públicos, não requerem autenticação

---

## 📝 Inscrições Service (PHP)

**Base URL:** `http://localhost:8001`  
**Swagger UI:** `http://localhost:8001/swagger`  
**API Base:** `http://localhost:8001/api/inscricoes`

### Endpoints Disponíveis:

#### Inscrições
- **POST** `/api/inscricoes` - Registrar nova inscrição (requer autenticação)
- **GET** `/api/inscricoes` - Listar inscrições do usuário (requer autenticação)
- **GET** `/api/inscricoes/{id}` - Obter inscrição por ID (requer autenticação)
- **PUT** `/api/inscricoes/{id}` - Cancelar inscrição (requer autenticação)

#### Presença
- **POST** `/api/inscricoes/presenca` - Registrar presença por código de inscrição

#### Sincronização
- **POST** `/api/inscricoes/sincronizar` - Sincronizar inscrições offline (requer autenticação)
- **POST** `/api/inscricoes/presenca/sincronizar` - Sincronizar presenças offline
- **POST** `/api/inscricoes/cancelar/sincronizar` - Sincronizar cancelamentos offline (requer autenticação)

#### Check-in
- **POST** `/api/inscricoes/checkin/buscar` - Buscar participante por CPF
- **POST** `/api/inscricoes/checkin/registrar` - Registrar check-in por CPF
- **POST** `/api/inscricoes/checkin/cadastro-rapido` - Cadastro rápido + inscrição + check-in
- **POST** `/api/inscricoes/checkin/sincronizar-cadastros` - Sincronizar cadastros rápidos offline
- **POST** `/api/inscricoes/checkin/sincronizar` - Sincronizar check-ins offline

### Como testar no Swagger:
1. Acesse: `http://localhost:8001/swagger`
2. Para endpoints protegidos, clique em "Authorize" e cole o token JWT
3. O token deve ser no formato: `Bearer {seu_token}`

---

## 🎓 Certificados Service (PHP)

**Base URL:** `http://localhost:8002`  
**Swagger UI:** `http://localhost:8002/swagger`  
**API Base:** `http://localhost:8002/api/certificados`

### Endpoints Disponíveis:

#### Certificados
- **POST** `/api/certificados/emitir` - Emitir certificado (requer autenticação)
- **GET** `/api/certificados/validar` - Validar certificado (público)
  - Query params: `codigo`
- **GET** `/api/certificados/{id}` - Obter certificado por ID
- **GET** `/api/certificados/inscricao/{inscricao_id}` - Obter certificado por inscrição
- **GET** `/api/certificados/download/{id}` - Download do certificado (PDF)

### Como testar no Swagger:
1. Acesse: `http://localhost:8002/swagger`
2. Para endpoints protegidos, clique em "Authorize" e cole o token JWT
3. O token deve ser no formato: `Bearer {seu_token}`

---

## 📧 Email Service (PHP)

**Base URL:** `http://localhost:8003`  
**Swagger UI:** Não possui Swagger nativo  
**API Base:** `http://localhost:8003/api/email`

### Endpoints Disponíveis:

#### Email
- **POST** `/api/email/enviar` - Enviar email
- **POST** `/api/email/processar-fila` - Processar fila de emails

### Nota:
Este serviço é usado internamente pelo sistema. Normalmente não precisa ser testado diretamente.

---

## 🔑 Autenticação JWT

Todos os endpoints protegidos requerem o header:
```
Authorization: Bearer {token}
```

### Como obter o token:

1. **Via Swagger (Auth Service):**
   - Acesse: `http://localhost:5001/swagger`
   - Use o endpoint `POST /api/auth/login` ou `POST /api/auth/cadastro`
   - Copie o `token` da resposta
   - Clique em "Authorize" no Swagger e cole: `Bearer {token}`

2. **Via cURL:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@email.com", "senha": "senha123"}'
```

3. **Via Postman/Insomnia:**
   - Faça uma requisição POST para `/api/auth/login`
   - Copie o token da resposta
   - Use no header `Authorization: Bearer {token}`

---

## 📋 Resumo das URLs do Swagger

| Serviço | URL Swagger | Porta | Tecnologia |
|---------|------------|-------|------------|
| Auth Service | http://localhost:5001/swagger | 5001 | C# .NET 8 |
| Eventos Service | http://localhost:5002/swagger | 5002 | C# .NET 8 |
| Inscrições Service | http://localhost:8001/swagger | 8001 | PHP |
| Certificados Service | http://localhost:8002/swagger | 8002 | PHP |
| Email Service | ❌ Não possui | 8003 | PHP |

---

## 🧪 Testando Endpoints (Alternativas)

Para testar os endpoints, você pode usar:

### 1. Usar Postman
- Importar collection ou criar manualmente
- Configurar variáveis de ambiente (base_url, token)

### 2. Usar Insomnia
- Criar requisições manualmente
- Configurar variáveis de ambiente

### 3. Usar Thunder Client (VS Code)
- Extensão gratuita do VS Code
- Interface similar ao Postman

### 4. Usar cURL
```bash
# Exemplo: Listar eventos
curl http://localhost:5002/api/eventos

# Exemplo: Fazer login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "senha": "senha123"}'

# Exemplo: Buscar participante (Inscrições Service)
curl -X POST http://localhost:8001/api/inscricoes/checkin/buscar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"cpf": "123.456.789-00", "evento_id": 1}'

# Exemplo: Validar certificado
curl -X GET "http://localhost:8002/api/certificados/validar?codigo=CERT-123456"
```

---

## 📝 Notas Importantes

1. **CORS:** Todos os serviços estão configurados para aceitar requisições de qualquer origem
2. **JWT:** O token expira em 24 horas
3. **Formato de Data:** Use ISO 8601 (ex: `2024-01-01T10:00:00Z`)
4. **CPF:** Pode ser enviado com ou sem formatação (pontos e hífen)
5. **Content-Type:** Use `application/json` para requisições POST/PUT

---

## 🔍 Exemplos de Requisições Completas

### 1. Fluxo Completo: Cadastro → Login → Listar Eventos → Inscrever

```bash
# 1. Cadastrar
curl -X POST http://localhost:5001/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123",
    "cpf": "123.456.789-00"
  }'

# 2. Login (se já tiver cadastro)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'

# 3. Listar eventos (público)
curl http://localhost:5002/api/eventos

# 4. Inscrever-se (substitua {token} pelo token obtido)
curl -X POST http://localhost:8001/api/inscricoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"evento_id": 1}'
```

---

## 🚀 Iniciando os Serviços

Para testar no Swagger, certifique-se de que os serviços estão rodando:

```bash
# Auth Service (C#)
cd services/auth-service
dotnet run
# Acesse: http://localhost:5001/swagger

# Eventos Service (C#)
cd services/eventos-service
dotnet run
# Acesse: http://localhost:5002/swagger

# Inscrições Service (PHP)
cd services/inscricoes-service
php -S localhost:8001 router.php
# Acesse: http://localhost:8001/swagger

# Certificados Service (PHP)
cd services/certificados-service
php -S localhost:8002 router.php
# Acesse: http://localhost:8002/swagger

# Email Service (PHP)
cd services/email-service
php -S localhost:8003
```

**Nota importante para serviços PHP:**
- Use `router.php` como arquivo router para garantir que as rotas do Swagger funcionem corretamente
- Se não usar o router, acesse diretamente: `http://localhost:8001/index.php?path=/swagger`

---

**Última atualização:** 2024

