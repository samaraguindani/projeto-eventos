# Início Rápido - Sistema de Eventos

## 🚀 Setup em 5 Minutos

### 1. Banco de Dados (2 min)
```bash
# Criar banco (se ainda não existir)
sudo -u postgres psql -c "CREATE DATABASE eventos_db;" || true

# Executar schema (use sudo -u postgres)
sudo -u postgres psql -d eventos_db -f database/schema.sql
```

**Configuração do PostgreSQL na VM:**
- **Host:** `localhost` (quando serviços rodam na VM)
- **Port:** `5432`
- **Database:** `eventos_db`
- **User:** `postgres`
- **Password:** `postgres`

### 2. Iniciar Serviços (3 min)

#### Terminal 1 - Auth Service
```bash
cd services/auth-service
dotnet run
```
✅ Rodando em: http://localhost:5001

#### Terminal 2 - Eventos Service
```bash
cd services/eventos-service
dotnet run
```
✅ Rodando em: http://localhost:5002

#### Terminal 3 - Inscrições Service
```bash
cd services/inscricoes-service
php -S localhost:8001
```
✅ Rodando em: http://localhost:8001

#### Terminal 4 - Certificados Service
```bash
cd services/certificados-service
php -S localhost:8002
```
✅ Rodando em: http://localhost:8002

#### Terminal 5 - Email Service
```bash
cd services/email-service
php -S localhost:8003
```
✅ Rodando em: http://localhost:8003

### 3. Abrir Portal
Abra `portal/index.html` no navegador ou:
```bash
cd portal
python3 -m http.server 8080
```
Acesse: http://localhost:8080

## ✅ Teste Rápido

### 1. Cadastrar Usuário
- Abra o portal
- Clique em "Cadastro"
- Preencha os dados
- Clique em "Cadastrar"

### 2. Ver Eventos
- Após login, você verá a lista de eventos
- Clique em um evento para ver detalhes

### 3. Inscrever-se
- Na página de detalhes do evento
- Clique em "Inscrever-se"

### 4. Ver Minhas Inscrições
- No menu, clique em "Minhas Inscrições"
- Veja suas inscrições ativas

## 🧪 Teste com Postman

### 1. Cadastro
```http
POST http://localhost:5001/api/auth/cadastro
Content-Type: application/json

{
  "nome": "Teste",
  "email": "teste@teste.com",
  "senha": "senha123"
}
```

**Copie o token retornado!**

### 2. Listar Eventos
```http
GET http://localhost:5002/api/eventos
```

### 3. Inscrever-se
```http
POST http://localhost:8001/api/inscricoes
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "evento_id": 1
}
```

## 📱 Teste Offline

1. Abra o portal no navegador
2. Faça login
3. Abra DevTools (F12)
4. Vá em "Network"
5. Selecione "Offline"
6. Tente se inscrever em um evento
7. Volte para "Online"
8. A sincronização ocorrerá automaticamente

## ⚠️ Problemas Comuns

### Porta já em uso
```bash
# Verificar
sudo netstat -tulpn | grep :5001

# Matar processo
sudo kill -9 <PID>
```

### Erro de conexão com banco
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Testar conexão
psql -U postgres -d eventos_db
```

### CORS Error
- Verifique se todos os serviços estão rodando
- Verifique as URLs no `portal/js/api.js`

## 📚 Próximos Passos

- Leia `README.md` para instruções completas
- Consulte `API_DOCUMENTATION.md` para todos os endpoints
- Veja `INSTALACAO_LINUX.md` para setup em produção

---

**Pronto! Sistema funcionando! 🎉**

