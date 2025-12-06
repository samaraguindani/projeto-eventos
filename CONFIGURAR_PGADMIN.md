# 🗄️ Configurar Servidor PostgreSQL no pgAdmin Web

Guia para adicionar o servidor PostgreSQL no pgAdmin acessível via `http://177.44.248.102/browser/`

---

## ✅ Passo a Passo

### 1. Acessar pgAdmin

Abra no navegador: `http://177.44.248.102/browser/`

### 2. Adicionar Novo Servidor

1. **Clique com botão direito** em **"Servers"** (ou "Servidores") no painel esquerdo
2. Selecione **"Register"** → **"Server..."** (ou "Registrar" → "Servidor...")

### 3. Preencher Aba "General"

**Name:** `PostgreSQL Local` (ou qualquer nome que preferir)

### 4. Preencher Aba "Connection"

**Host name/address:** `localhost` (ou `127.0.0.1`)

**Port:** `5433`

**Maintenance database:** `postgres`

**Username:** `eventos` (ou `postgres` se preferir)

**Password:** `eventos123` (ou `postgres` se usar usuário postgres)

**⚠️ IMPORTANTE:** Marque a opção **"Save password"** para não precisar digitar toda vez!

### 5. Aba "Advanced" (Opcional)

**DB restriction:** Deixe vazio ou digite `eventos_db` para mostrar apenas esse banco

### 6. Salvar

Clique em **"Save"** (ou "Salvar")

---

## 🎯 Configuração Completa

### Dados do Servidor:

- **Name:** PostgreSQL Local
- **Host:** `localhost` (ou `127.0.0.1`)
- **Port:** `5433`
- **Database:** `postgres` (para conexão inicial)
- **Username:** `eventos`
- **Password:** `eventos123`

---

## 🔍 Verificar Conexão

Após salvar, o servidor deve aparecer em **"Servers"** no painel esquerdo.

**Clique no servidor** para expandir e ver:
- **Databases** → Deve mostrar `eventos_db`
- **Login/Group Roles** → Deve mostrar `eventos` e `postgres`
- **Tablespaces**
- etc.

---

## 🛠️ Se Não Conectar

### Verificar se PostgreSQL Está Rodando

```bash
# Na VM
sudo systemctl status postgresql
```

### Verificar Porta

```bash
# Na VM
sudo netstat -tulpn | grep 5433
```

✅ **Deve mostrar:** `0.0.0.0:5433` ou `127.0.0.1:5433`

### Testar Conexão Direta

```bash
# Na VM
PGPASSWORD=eventos123 psql -h localhost -p 5433 -U eventos -d eventos_db -c "SELECT current_database();"
```

---

## 📋 Configurações Alternativas

### Se Usar Usuário postgres:

- **Username:** `postgres`
- **Password:** `postgres`

### Se PostgreSQL Estiver na Porta Padrão (5432):

- **Port:** `5432`

---

## 🎯 Dicas

1. **Salve a senha:** Marque "Save password" para não precisar digitar toda vez
2. **Use localhost:** Como o pgAdmin está na mesma VM, use `localhost` (não o IP externo)
3. **Verifique a porta:** Confirme que é `5433` (não `5432`)
4. **Teste primeiro:** Use `psql` na VM para confirmar que a conexão funciona

---

## ✅ Checklist

- [ ] pgAdmin acessível em `http://177.44.248.102/browser/`
- [ ] Servidor adicionado com sucesso
- [ ] Conexão funcionando
- [ ] Banco `eventos_db` visível
- [ ] Tabelas acessíveis

---

**✅ Servidor configurado! Agora você pode gerenciar o banco via pgAdmin web!**




