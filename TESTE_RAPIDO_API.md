# 🧪 Teste Rápido da API

## 🎯 Objetivo

Testar rapidamente se todos os endpoints estão funcionando.

---

## 📋 Pré-requisitos

1. ✅ PostgreSQL rodando (Docker)
2. ✅ Tabelas criadas no banco
3. ✅ Eventos Service rodando na porta 5002

---

## 🚀 Método 1: Usando Swagger (RECOMENDADO)

### Passo 1: Abrir Swagger

```powershell
.\abrir-swagger.ps1
```

Ou acesse diretamente: **http://localhost:5002/swagger**

### Passo 2: Testar Endpoints

1. **Listar Eventos**
   - Clique em `GET /api/eventos`
   - Clique em "Try it out"
   - Clique em "Execute"
   - ✅ Deve retornar lista de eventos

2. **Buscar Evento por ID**
   - Clique em `GET /api/eventos/{id}`
   - Clique em "Try it out"
   - Digite ID: `1`
   - Clique em "Execute"
   - ✅ Deve retornar detalhes do evento

---

## 💻 Método 2: Usando PowerShell

### Teste 1: Listar Todos os Eventos

```powershell
Invoke-RestMethod -Uri "http://localhost:5002/api/eventos" -Method GET
```

**Resposta esperada:**
```json
{
  "total": 3,
  "eventos": [...]
}
```

### Teste 2: Listar Eventos Ativos

```powershell
Invoke-RestMethod -Uri "http://localhost:5002/api/eventos?status=ativo" -Method GET
```

### Teste 3: Listar por Categoria

```powershell
Invoke-RestMethod -Uri "http://localhost:5002/api/eventos?categoria=Tecnologia" -Method GET
```

### Teste 4: Buscar Evento Específico

```powershell
Invoke-RestMethod -Uri "http://localhost:5002/api/eventos/1" -Method GET
```

**Resposta esperada:**
```json
{
  "id": 1,
  "titulo": "Workshop de Desenvolvimento Web",
  "descricao": "...",
  "dataInicio": "2025-01-15T09:00:00",
  ...
}
```

### Teste 5: Buscar Evento Inexistente (deve dar erro 404)

```powershell
Invoke-RestMethod -Uri "http://localhost:5002/api/eventos/999" -Method GET
```

**Resposta esperada:**
```json
{
  "message": "Evento não encontrado"
}
```

---

## 🌐 Método 3: Usando cURL (Linux/Mac/Git Bash)

### Listar Eventos

```bash
curl -X GET "http://localhost:5002/api/eventos" -H "accept: application/json"
```

### Buscar Evento por ID

```bash
curl -X GET "http://localhost:5002/api/eventos/1" -H "accept: application/json"
```

### Com Filtros

```bash
curl -X GET "http://localhost:5002/api/eventos?status=ativo&categoria=Tecnologia" -H "accept: application/json"
```

---

## 🎨 Método 4: Usando o Navegador

### Teste Simples

Apenas abra no navegador:

1. **Listar eventos:**
   ```
   http://localhost:5002/api/eventos
   ```

2. **Buscar evento ID 1:**
   ```
   http://localhost:5002/api/eventos/1
   ```

3. **Filtrar por status:**
   ```
   http://localhost:5002/api/eventos?status=ativo
   ```

---

## ✅ Checklist de Testes

### Testes Básicos
- [ ] GET /api/eventos retorna lista
- [ ] GET /api/eventos/1 retorna evento
- [ ] GET /api/eventos/999 retorna 404

### Testes com Filtros
- [ ] ?status=ativo funciona
- [ ] ?categoria=Tecnologia funciona
- [ ] ?dataInicio=2025-01-01 funciona

### Testes de Performance
- [ ] Resposta em menos de 500ms
- [ ] Sem erros 500
- [ ] JSON válido

---

## 🐛 Troubleshooting

### Erro: "Sem conexão com servidor"

**Solução:**
```powershell
# Verificar se o serviço está rodando
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}

# Se não estiver, iniciar:
cd services\eventos-service
dotnet run --urls "http://localhost:5002"
```

### Erro: "Tabela não existe"

**Solução:**
```powershell
# Criar as tabelas
.\criar-tabelas.ps1
```

### Erro: "Erro de autenticação"

**Solução:**
```powershell
# Resetar banco de dados
.\resetar-tudo.ps1
.\criar-tabelas.ps1
```

---

## 📊 Exemplo Completo de Teste

### Script PowerShell para Testar Tudo

```powershell
# Teste completo da API
Write-Host "Testando API Eventos Service..." -ForegroundColor Cyan

# Teste 1
Write-Host "`n[1/4] Listando todos os eventos..." -ForegroundColor Yellow
$eventos = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos"
Write-Host "  Total de eventos: $($eventos.total)" -ForegroundColor Green

# Teste 2
Write-Host "`n[2/4] Buscando evento ID 1..." -ForegroundColor Yellow
$evento = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos/1"
Write-Host "  Título: $($evento.titulo)" -ForegroundColor Green

# Teste 3
Write-Host "`n[3/4] Filtrando eventos ativos..." -ForegroundColor Yellow
$ativos = Invoke-RestMethod -Uri "http://localhost:5002/api/eventos?status=ativo"
Write-Host "  Eventos ativos: $($ativos.total)" -ForegroundColor Green

# Teste 4
Write-Host "`n[4/4] Testando erro 404..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5002/api/eventos/999"
} catch {
    Write-Host "  404 funcionando corretamente!" -ForegroundColor Green
}

Write-Host "`n✅ Todos os testes passaram!" -ForegroundColor Green
```

Salve como `testar-api.ps1` e execute:
```powershell
.\testar-api.ps1
```

---

## 🎉 Sucesso!

Se todos os testes passaram, sua API está funcionando perfeitamente! 🚀

**Próximos passos:**
1. ✅ Teste no Swagger: http://localhost:5002/swagger
2. ✅ Integre com o frontend
3. ✅ Adicione mais endpoints conforme necessário

---

**Happy Testing! 🧪**




