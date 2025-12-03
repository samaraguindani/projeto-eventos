# Documentação da API - Sistema de Eventos

## Visão Geral

O Sistema de Eventos é composto por múltiplos microsserviços que se comunicam via HTTP/REST. Todos os endpoints protegidos requerem autenticação JWT no header `Authorization: Bearer {token}`.

## Autenticação

### Obter Token JWT

Todos os endpoints protegidos requerem um token JWT no header:
```
Authorization: Bearer {token}
```

O token é obtido através dos endpoints de login ou cadastro no Auth Service.

---

## Auth Service (Porta 5001)

### Base URL
```
http://localhost:5001/api
```

### Endpoints

#### POST /auth/cadastro
Cria um novo usuário e retorna token JWT.

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "cpf": "123.456.789-00",
  "telefone": "(11) 99999-9999",
  "data_nascimento": "1990-01-01"
}
```

**Response (201):**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Erros:**
- `400`: Dados inválidos
- `409`: Email ou CPF já cadastrado

---

#### POST /auth/login
Autentica um usuário e retorna token JWT.

**Request:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Erros:**
- `400`: Dados inválidos
- `401`: Email ou senha inválidos

---

#### GET /auth/me
Obtém informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "cpf": "123.456.789-00",
  "telefone": "(11) 99999-9999",
  "dataNascimento": "1990-01-01"
}
```

**Erros:**
- `401`: Token inválido ou ausente

---

#### GET /usuarios/{id}
Obtém informações de um usuário específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com"
}
```

---

## Eventos Service (Porta 5002)

### Base URL
```
http://localhost:5002/api
```

### Endpoints

#### GET /eventos
Lista todos os eventos disponíveis.

**Query Parameters:**
- `status` (opcional): Filtrar por status (ativo, finalizado, cancelado)
- `categoria` (opcional): Filtrar por categoria
- `dataInicio` (opcional): Filtrar eventos a partir desta data
- `dataFim` (opcional): Filtrar eventos até esta data

**Response (200):**
```json
{
  "total": 2,
  "eventos": [
    {
      "id": 1,
      "titulo": "Workshop de Desenvolvimento Web",
      "descricao": "Workshop completo...",
      "dataInicio": "2024-02-01T10:00:00Z",
      "dataFim": "2024-02-01T14:00:00Z",
      "localizacao": "Auditório Principal",
      "capacidadeMaxima": 50,
      "vagasDisponiveis": 45,
      "valorInscricao": 0.00,
      "categoria": "Tecnologia",
      "status": "ativo"
    }
  ]
}
```

---

#### GET /eventos/{id}
Obtém detalhes de um evento específico.

**Response (200):**
```json
{
  "id": 1,
  "titulo": "Workshop de Desenvolvimento Web",
  "descricao": "Workshop completo...",
  "dataInicio": "2024-02-01T10:00:00Z",
  "dataFim": "2024-02-01T14:00:00Z",
  "localizacao": "Auditório Principal",
  "capacidadeMaxima": 50,
  "vagasDisponiveis": 45,
  "valorInscricao": 0.00,
  "categoria": "Tecnologia",
  "status": "ativo",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Erros:**
- `404`: Evento não encontrado

---

## Inscrições Service (Porta 8001)

### Base URL
```
http://localhost:8001/api/inscricoes
```

### Endpoints

#### POST /inscricoes
Registra uma nova inscrição em um evento.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "evento_id": 1
}
```

**Response (201):**
```json
{
  "message": "Inscrição realizada com sucesso",
  "data": {
    "id": 1,
    "codigo_inscricao": "INS-20240101120000-1234",
    "data_inscricao": "2024-01-01T12:00:00Z"
  }
}
```

**Erros:**
- `400`: Evento não encontrado, sem vagas disponíveis ou já inscrito
- `401`: Token inválido

---

#### GET /inscricoes
Lista todas as inscrições do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total": 2,
  "inscricoes": [
    {
      "id": 1,
      "codigo_inscricao": "INS-20240101120000-1234",
      "data_inscricao": "2024-01-01T12:00:00Z",
      "status": "ativa",
      "presenca_registrada": false,
      "evento_titulo": "Workshop de Desenvolvimento Web",
      "evento_data_inicio": "2024-02-01T10:00:00Z",
      "evento_data_fim": "2024-02-01T14:00:00Z",
      "evento_localizacao": "Auditório Principal"
    }
  ]
}
```

---

#### GET /inscricoes/{id}
Obtém detalhes de uma inscrição específica.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "codigo_inscricao": "INS-20240101120000-1234",
  "usuario_nome": "João Silva",
  "usuario_email": "joao@email.com",
  "evento_titulo": "Workshop de Desenvolvimento Web",
  "data_inscricao": "2024-01-01T12:00:00Z",
  "status": "ativa",
  "presenca_registrada": false
}
```

---

#### PUT /inscricoes/{id}
Cancela uma inscrição.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Inscrição cancelada com sucesso",
  "data": {
    "id": 1,
    "evento_id": 1
  }
}
```

**Erros:**
- `404`: Inscrição não encontrada ou já cancelada

---

#### POST /inscricoes/presenca
Registra presença em um evento usando o código de inscrição.

**Request:**
```json
{
  "codigo_inscricao": "INS-20240101120000-1234"
}
```

**Response (200):**
```json
{
  "message": "Presença registrada com sucesso",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "evento_id": 1
  }
}
```

**Erros:**
- `400`: Código de inscrição inválido
- `404`: Inscrição não encontrada ou presença já registrada

---

#### POST /inscricoes/sincronizar
Sincroniza múltiplas inscrições feitas offline.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "inscricoes": [
    {
      "usuario_id": 1,
      "evento_id": 1,
      "temp_id": 1
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Sincronização concluída",
  "resultados": [
    {
      "temp_id": 1,
      "success": true,
      "data": {
        "id": 1,
        "codigo_inscricao": "INS-20240101120000-1234"
      }
    }
  ]
}
```

---

#### POST /inscricoes/presenca/sincronizar
Sincroniza múltiplas presenças registradas offline.

**Request:**
```json
{
  "presencas": [
    {
      "codigo_inscricao": "INS-20240101120000-1234",
      "temp_id": 1
    }
  ]
}
```

---

#### POST /inscricoes/cancelar/sincronizar
Sincroniza múltiplos cancelamentos feitos offline.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "cancelamentos": [
    {
      "inscricao_id": 1,
      "temp_id": 1
    }
  ]
}
```

---

## Certificados Service (Porta 8002)

### Base URL
```
http://localhost:8002/api/certificados
```

### Endpoints

#### POST /certificados/emitir
Emite um certificado para uma inscrição com presença registrada.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "inscricao_id": 1
}
```

**Response (200):**
```json
{
  "message": "Certificado emitido com sucesso",
  "data": {
    "id": 1,
    "codigo_validacao": "CERT-ABC123DEF456",
    "data_emissao": "2024-01-01T12:00:00Z",
    "arquivo": "/api/certificados/download/1"
  }
}
```

**Erros:**
- `400`: Inscrição não encontrada ou presença não registrada
- `401`: Token inválido

---

#### GET /certificados/validar?codigo={codigo}
Valida um certificado pelo código de validação.

**Response (200):**
```json
{
  "valido": true,
  "data": {
    "usuario_nome": "João Silva",
    "evento_titulo": "Workshop de Desenvolvimento Web",
    "data_emissao": "2024-01-01T12:00:00Z",
    "data_evento": "2024-02-01T10:00:00Z"
  }
}
```

**Erros:**
- `400`: Código de validação não fornecido
- `404`: Certificado não encontrado ou código inválido

---

#### GET /certificados/{id}
Obtém informações de um certificado específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "codigo_validacao": "CERT-ABC123DEF456",
  "codigo_inscricao": "INS-20240101120000-1234",
  "usuario_nome": "João Silva",
  "evento_titulo": "Workshop de Desenvolvimento Web",
  "data_emissao": "2024-01-01T12:00:00Z"
}
```

---

## Email Service (Porta 8003)

### Base URL
```
http://localhost:8003/api/email
```

### Endpoints

#### POST /email/processar
Processa emails pendentes na fila.

**Request:**
```json
{
  "limite": 10
}
```

**Response (200):**
```json
{
  "message": "Processamento concluído",
  "processados": 8,
  "erros": 2,
  "total": 10
}
```

---

#### GET /email/status
Obtém estatísticas da fila de emails.

**Response (200):**
```json
{
  "total": 50,
  "por_status": {
    "pending": 30,
    "processing": 5,
    "sent": 10,
    "failed": 5
  }
}
```

---

#### GET /email/fila
Lista emails na fila.

**Query Parameters:**
- `limite` (opcional): Limite de resultados (padrão: 50)

**Response (200):**
```json
{
  "total": 10,
  "emails": [
    {
      "id": 1,
      "destinatario": "joao@email.com",
      "assunto": "Confirmação de Inscrição",
      "tipo": "inscricao",
      "status": "pending",
      "tentativas": 0,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autorizado (token inválido ou ausente)
- `404`: Recurso não encontrado
- `409`: Conflito (ex: email já cadastrado)
- `500`: Erro interno do servidor

---

## Exemplos de Uso com cURL

### Cadastro
```bash
curl -X POST http://localhost:5001/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

### Listar Eventos
```bash
curl http://localhost:5002/api/eventos
```

### Inscrever-se em Evento
```bash
curl -X POST http://localhost:8001/api/inscricoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "evento_id": 1
  }'
```

### Registrar Presença
```bash
curl -X POST http://localhost:8001/api/inscricoes/presenca \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_inscricao": "INS-20240101120000-1234"
  }'
```

### Emitir Certificado
```bash
curl -X POST http://localhost:8002/api/certificados/emitir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "inscricao_id": 1
  }'
```

### Validar Certificado
```bash
curl "http://localhost:8002/api/certificados/validar?codigo=CERT-ABC123DEF456"
```

