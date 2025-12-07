# 👤 Criar Usuário eventos no PostgreSQL

Guia para criar o usuário `eventos` com senha `eventos123` no PostgreSQL.

---

## ✅ Comandos para Executar na VM

```bash
# 1. Entrar no PostgreSQL
sudo -u postgres psql -p 5433

# 2. Criar usuário eventos
CREATE USER eventos WITH PASSWORD 'eventos123';

# 3. Dar permissões no banco eventos_db
GRANT ALL PRIVILEGES ON DATABASE eventos_db TO eventos;
ALTER DATABASE eventos_db OWNER TO eventos;

# 4. Dar permissões em todas as tabelas
\c eventos_db
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eventos;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eventos;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO eventos;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO eventos;

# 5. Sair
\q
```

**Ou em comandos únicos:**

```bash
# Criar usuário
sudo -u postgres psql -p 5433 -c "CREATE USER eventos WITH PASSWORD 'eventos123';"

# Dar permissões no banco
sudo -u postgres psql -p 5433 -c "GRANT ALL PRIVILEGES ON DATABASE eventos_db TO eventos;"
sudo -u postgres psql -p 5433 -c "ALTER DATABASE eventos_db OWNER TO eventos;"

# Dar permissões nas tabelas
sudo -u postgres psql -p 5433 -d eventos_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eventos;"
sudo -u postgres psql -p 5433 -d eventos_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eventos;"
sudo -u postgres psql -p 5433 -d eventos_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO eventos;"
sudo -u postgres psql -p 5433 -d eventos_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO eventos;"
```

---

## 🧪 Testar Conexão

```bash
# Testar conexão com novo usuário
PGPASSWORD=eventos123 psql -h localhost -p 5433 -U eventos -d eventos_db -c "SELECT current_user, current_database();"
```

✅ **Deve retornar:**
```
 current_user | current_database 
--------------+------------------
 eventos      | eventos_db
```

---

## 📋 Arquivos Atualizados

Todos os arquivos foram atualizados para usar:
- **Username:** `eventos`
- **Password:** `eventos123`
- **Port:** `5433`

**Arquivos atualizados:**
- ✅ `services/auth-service/appsettings.json`
- ✅ `services/auth-service/Program.cs`
- ✅ `services/eventos-service/appsettings.json`
- ✅ `services/eventos-service/Program.cs`
- ✅ `services/inscricoes-service/config/database.php`
- ✅ `services/inscricoes-service/services/EmailService.php`
- ✅ `services/certificados-service/config/database.php`
- ✅ `services/certificados-service/services/EmailService.php`
- ✅ `services/email-service/config/database.php`

---

**✅ Execute os comandos acima para criar o usuário!**






