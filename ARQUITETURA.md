# Arquitetura do Sistema de Eventos

## Visão Geral

Sistema baseado em microsserviços para gerenciamento de eventos, permitindo cadastro de usuários, inscrições, check-in presencial, operação offline e emissão de certificados.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         PORTAL WEB                               │
│                    (HTML + JavaScript)                           │
│  - Login/Cadastro                                                │
│  - Listagem de Eventos                                           │
│  - Inscrições                                                    │
│  - Check-in                                                      │
│  - Certificados                                                  │
│  - Sincronização Offline (IndexedDB)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth Service │    │Eventos Service│   │Inscrições    │
│  (C# .NET 8) │    │  (C# .NET 8) │    │  Service     │
│              │    │              │    │  (PHP)       │
│ - Cadastro   │    │ - Listar     │    │ - Registrar  │
│ - Login      │    │ - Buscar     │    │ - Consultar  │
│ - JWT        │    │              │    │ - Cancelar   │
│ - Logs       │    │              │    │ - Presença   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Certificados │    │ Email Service│    │  Log Service │
│   Service    │    │    (PHP)     │    │  (C# .NET 8) │
│    (PHP)     │    │              │    │              │
│ - Emitir PDF │    │ - Enviar     │    │ - Registrar  │
│ - Validar    │    │ - Templates  │    │ - Consultar  │
│              │    │ - Fila       │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  RabbitMQ/Kafka │
                    │  (Fila de Email)│
                    └─────────────────┘
```

## Tecnologias Utilizadas

### Auth Service (C# .NET 8)
- **Framework**: ASP.NET Core 8.0
- **Autenticação**: JWT (JSON Web Tokens)
- **ORM**: Entity Framework Core
- **Banco**: PostgreSQL
- **Porta**: 5001

### Eventos Service (C# .NET 8)
- **Framework**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core
- **Banco**: PostgreSQL
- **Porta**: 5002

### Inscrições Service (PHP)
- **Framework**: PHP 8.1+
- **ORM**: PDO
- **Banco**: PostgreSQL
- **Porta**: 8001

### Certificados Service (PHP)
- **Framework**: PHP 8.1+
- **Biblioteca PDF**: TCPDF ou FPDF
- **Porta**: 8002

### Email Service (PHP)
- **Framework**: PHP 8.1+
- **SMTP**: PHPMailer
- **Fila**: RabbitMQ (ou implementação simples com banco)
- **Porta**: 8003

### Portal Web
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Armazenamento Offline**: IndexedDB
- **HTTP Client**: Fetch API

### Banco de Dados
- **SGBD**: PostgreSQL 14+
- **Porta**: 5432

## Fluxo de Comunicação

### 1. Fluxo de Autenticação
```
Portal → Auth Service → PostgreSQL → JWT Token → Portal
```

### 2. Fluxo de Inscrição
```
Portal → Inscrições Service → PostgreSQL
     ↓
Inscrições Service → Email Service (via fila) → Email enviado
     ↓
Inscrições Service → Log Service → Log registrado
```

### 3. Fluxo de Check-in
```
Portal → Inscrições Service → PostgreSQL (registra presença)
     ↓
Inscrições Service → Certificados Service → PDF gerado
     ↓
Certificados Service → Email Service (via fila) → Email com certificado
```

### 4. Fluxo Offline
```
Portal (offline) → IndexedDB (armazena ações)
     ↓
Portal (online) → Sincronização → Inscrições Service → PostgreSQL
```

## Estratégia de Autenticação

### JWT (JSON Web Tokens)
- **Algoritmo**: HS256
- **Expiração**: 24 horas
- **Refresh Token**: Não implementado (pode ser adicionado)
- **Middleware**: Validação automática em todos os endpoints protegidos

### Estrutura do Token
```json
{
  "userId": "123",
  "email": "usuario@email.com",
  "nome": "Nome do Usuário",
  "exp": 1234567890,
  "iat": 1234567890
}
```

## Estratégia de Logs

### Middleware de Logging
- Registra todas as requisições HTTP
- Armazena: timestamp, método, URL, IP, user-agent, status code
- Persiste em PostgreSQL (tabela `logs`)
- Serviço dedicado para consulta de logs

### Estrutura de Log
```json
{
  "id": 1,
  "timestamp": "2024-01-01T10:00:00Z",
  "method": "POST",
  "url": "/api/inscricoes",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "statusCode": 200,
  "userId": 123,
  "responseTime": 150
}
```

## Estratégia de Sincronização Offline

### Armazenamento Local (IndexedDB)
- **Database**: `eventos_offline`
- **Stores**:
  - `inscricoes_pendentes`: Inscrições feitas offline
  - `presencas_pendentes`: Check-ins feitos offline
  - `cancelamentos_pendentes`: Cancelamentos feitos offline

### Modelo de Sincronização
1. **Detecção de Conectividade**: `navigator.onLine`
2. **Armazenamento Local**: Todas as ações são salvas no IndexedDB
3. **Sincronização Automática**: Quando online, sincroniza automaticamente
4. **Sincronização Manual**: Botão para forçar sincronização
5. **Resolução de Conflitos**: Última ação prevalece

### Endpoints de Sincronização
- `POST /api/inscricoes/sincronizar` - Sincroniza múltiplas inscrições
- `POST /api/inscricoes/presenca/sincronizar` - Sincroniza check-ins
- `POST /api/inscricoes/cancelar/sincronizar` - Sincroniza cancelamentos

## Estratégia de Filas de Email

### Opção 1: RabbitMQ (Recomendado para produção)
- **Exchange**: `emails`
- **Queue**: `emails.pending`
- **Routing Key**: `email.send`

### Opção 2: Implementação Simples (Para desenvolvimento)
- Tabela `email_queue` no PostgreSQL
- Worker PHP que processa a fila periodicamente
- Status: `pending`, `processing`, `sent`, `failed`

## Segurança

### Autenticação
- JWT com chave secreta forte
- Validação de token em todos os endpoints protegidos
- CORS configurado adequadamente

### Validação
- Validação de entrada em todos os endpoints
- Sanitização de dados
- Proteção contra SQL Injection (usando ORM/Prepared Statements)

### Logs de Segurança
- Registro de tentativas de login falhadas
- Registro de acessos não autorizados
- Monitoramento de atividades suspeitas

## Escalabilidade

### Horizontal Scaling
- Cada microsserviço pode ser escalado independentemente
- Load balancer na frente dos serviços
- Banco de dados com replicação

### Cache
- Redis para cache de tokens JWT (opcional)
- Cache de eventos mais acessados

### Monitoramento
- Health checks em todos os serviços
- Métricas de performance
- Alertas para falhas

## Deploy

### Containers (Docker)
- Cada serviço em container separado
- Docker Compose para orquestração local
- Kubernetes para produção (opcional)

### VM Linux
- Systemd services para cada microsserviço
- Nginx como reverse proxy
- PostgreSQL como serviço do sistema





