# 📚 Guia do Swagger - API Testing

## 🌐 Acessar o Swagger

Depois de iniciar o `eventos-service`, acesse:

**http://localhost:5002/swagger**

---

## 🎯 O que é Swagger?

O Swagger (OpenAPI) é uma interface visual interativa para testar APIs REST. Com ele você pode:

- ✅ Ver todos os endpoints disponíveis
- ✅ Testar requisições diretamente no navegador
- ✅ Ver os parâmetros necessários
- ✅ Ver exemplos de resposta
- ✅ Testar autenticação JWT

---

## 🔧 Como Usar

### 1️⃣ Iniciar o Eventos Service

```powershell
cd services\eventos-service
dotnet run --urls "http://localhost:5002"
```

### 2️⃣ Abrir o Swagger

Acesse no navegador: **http://localhost:5002/swagger**

### 3️⃣ Explorar os Endpoints

Você verá uma lista de todos os endpoints:

#### **GET /api/eventos**
- **Descrição:** Lista todos os eventos
- **Autenticação:** Não requer
- **Parâmetros opcionais:**
  - `status` - Filtrar por status (ativo, cancelado, finalizado)
  - `categoria` - Filtrar por categoria
  - `dataInicio` - Data de início
  - `dataFim` - Data de término

#### **GET /api/eventos/{id}**
- **Descrição:** Busca um evento específico
- **Autenticação:** Não requer
- **Parâmetros:**
  - `id` - ID do evento (obrigatório)

---

## 🧪 Testando Endpoints

### Testar GET /api/eventos

1. Clique em **GET /api/eventos**
2. Clique em **"Try it out"**
3. (Opcional) Preencha os filtros:
   - Status: `ativo`
   - Categoria: `Tecnologia`
4. Clique em **"Execute"**
5. Veja a resposta abaixo!

**Exemplo de resposta:**

```json
{
  "total": 3,
  "eventos": [
    {
      "id": 1,
      "titulo": "Workshop de Desenvolvimento Web",
      "descricao": "Workshop completo sobre desenvolvimento web moderno",
      "dataInicio": "2025-01-15T09:00:00",
      "dataFim": "2025-01-15T17:00:00",
      "localizacao": "Auditório Principal",
      "capacidadeMaxima": 50,
      "vagasDisponiveis": 50,
      "valorInscricao": 0.00,
      "categoria": "Tecnologia",
      "status": "ativo"
    }
  ]
}
```

### Testar GET /api/eventos/{id}

1. Clique em **GET /api/eventos/{id}**
2. Clique em **"Try it out"**
3. Digite o ID do evento: `1`
4. Clique em **"Execute"**
5. Veja os detalhes completos do evento!

---

## 🔐 Testando com Autenticação (JWT)

Alguns endpoints podem requerer autenticação. Para testar:

### 1️⃣ Obter um Token

Primeiro, faça login no Auth Service:

```bash
# Via terminal (PowerShell):
$body = @{
    email = "seu@email.com"
    senha = "sua_senha"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

Copie o `token` da resposta.

### 2️⃣ Autenticar no Swagger

1. No Swagger, clique no botão **"Authorize"** (cadeado verde no topo)
2. Digite: `Bearer SEU_TOKEN_AQUI`
   - Exemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Clique em **"Authorize"**
4. Clique em **"Close"**

Agora todos os testes usarão esse token automaticamente! 🎉

---

## 📊 Códigos de Resposta HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos enviados |
| 401 | Unauthorized | Token inválido ou ausente |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## 🎨 Interface do Swagger

### Seções Principais:

1. **Schemas** (no final da página)
   - Mostra a estrutura dos objetos (modelos)
   - Exemplo: estrutura do objeto "Evento"

2. **Endpoints** (lista principal)
   - Cada endpoint tem cor diferente:
     - 🟢 **GET** - Verde (leitura)
     - 🔵 **POST** - Azul (criação)
     - 🟡 **PUT** - Amarelo (atualização)
     - 🔴 **DELETE** - Vermelho (exclusão)

3. **Try it out**
   - Botão para testar o endpoint
   - Preenche formulários automaticamente

---

## 💡 Dicas Úteis

### 1. Testar Filtros

```
GET /api/eventos?status=ativo&categoria=Tecnologia
```

### 2. Ver Requisição cURL

O Swagger gera o comando cURL automaticamente! Você pode copiar e usar no terminal:

```bash
curl -X 'GET' \
  'http://localhost:5002/api/eventos?status=ativo' \
  -H 'accept: application/json'
```

### 3. Salvar Exemplos

Você pode salvar os exemplos de resposta para documentação ou testes posteriores.

---

## 🔍 Troubleshooting

### Swagger não abre

**Problema:** Erro 404 ao acessar /swagger

**Solução:**
```powershell
# 1. Parar o serviço
# 2. Limpar e recompilar
cd services\eventos-service
Remove-Item -Recurse -Force bin, obj
dotnet clean
dotnet build
dotnet run --urls "http://localhost:5002"
```

### Endpoint retorna 401 (Unauthorized)

**Problema:** Endpoint protegido requer autenticação

**Solução:**
1. Faça login no Auth Service
2. Copie o token
3. Use "Authorize" no Swagger
4. Tente novamente

### Endpoint retorna 500 (Server Error)

**Problema:** Erro no servidor

**Solução:**
1. Verifique os logs no terminal do service
2. Verifique se o banco de dados está rodando
3. Verifique se as tabelas existem

---

## 📖 Recursos Adicionais

### Swagger UI Features

- **Expand/Collapse:** Clique para ver detalhes
- **Model:** Clique em "Model" para ver a estrutura JSON
- **Example Value:** Exemplo de payload
- **Download:** Baixe a especificação OpenAPI

### Exportar Especificação

Você pode baixar a especificação da API em JSON:

**http://localhost:5002/swagger/v1/swagger.json**

Útil para:
- Gerar clientes automaticamente
- Importar no Postman
- Documentação externa

---

## 🚀 Próximos Passos

1. ✅ Teste todos os endpoints no Swagger
2. ✅ Experimente diferentes filtros
3. ✅ Teste com autenticação JWT
4. ✅ Veja os códigos de resposta
5. ✅ Copie exemplos cURL

**Agora você tem uma interface completa para testar a API! 🎉**

---

## 📞 URLs Importantes

| Serviço | URL | Swagger |
|---------|-----|---------|
| **Eventos Service** | http://localhost:5002 | http://localhost:5002/swagger |
| **Auth Service** | http://localhost:5001 | *(em breve)* |

---

**Happy Testing! 🧪✨**




