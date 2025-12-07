# 🔧 Resolver Autenticação PostgreSQL - Método Definitivo

## 🚨 Problema Persistente

Mesmo após configurar senha e mudar para md5, ainda dá erro de autenticação.

---

## ✅ Solução Passo a Passo

### 1. Verificar Logs do PostgreSQL

```bash
# Ver últimos erros
sudo tail -20 /var/log/postgresql/postgresql-*-main.log
```

Isso vai mostrar o erro exato.

### 2. Verificar se Senha Foi Aplicada

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Verificar hash da senha
SELECT rolname, rolpassword FROM pg_authid WHERE rolname = 'postgres';

# Deve mostrar um hash (não deve estar NULL)
\q
```

### 3. Recriar Senha com Método Diferente

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Limpar senha primeiro
ALTER USER postgres WITH PASSWORD NULL;

# Configurar senha novamente
ALTER USER postgres WITH PASSWORD 'postgres';

# Verificar
\du

# Sair
\q
```

### 4. Usar Trust Temporariamente (Para Testar)

**⚠️ ATENÇÃO:** Isso remove autenticação! Use apenas para testar!

```bash
# Fazer backup
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Editar
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Alterar estas linhas:**
```
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Para:**
```
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

**Salvar e reiniciar:**
```bash
sudo systemctl restart postgresql
```

**Testar:**
```bash
psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"
```

Se funcionar com `trust`, o problema é a senha. Volte para `md5` e tente o passo 5.

### 5. Recriar Usuário postgres (Último Recurso)

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar novo usuário temporário
CREATE USER postgres_temp WITH PASSWORD 'postgres' SUPERUSER;

# Dar todas as permissões
GRANT ALL PRIVILEGES ON DATABASE eventos_db TO postgres_temp;
ALTER DATABASE eventos_db OWNER TO postgres_temp;

# Sair
\q
```

**Atualizar appsettings.json para usar postgres_temp temporariamente:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres_temp;Password=postgres"
  }
}
```

**Ou melhor, voltar e corrigir o postgres original:**

```bash
sudo -u postgres psql

# Deletar usuário postgres e recriar
DROP USER IF EXISTS postgres;
CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER CREATEDB CREATEROLE;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE eventos_db TO postgres;
ALTER DATABASE eventos_db OWNER TO postgres;

\q
```

---

## 🎯 Solução Rápida Recomendada

```bash
# 1. Usar trust temporariamente para testar
sudo sed -i 's/md5/trust/g' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# 2. Testar se funciona
psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"

# 3. Se funcionar, voltar para md5 e recriar senha
sudo sed -i 's/trust/md5/g' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# 4. Entrar no PostgreSQL
sudo -u postgres psql

# 5. Recriar senha
ALTER USER postgres WITH PASSWORD NULL;
ALTER USER postgres WITH PASSWORD 'postgres';

# 6. Verificar hash
SELECT rolname, substring(rolpassword, 1, 20) FROM pg_authid WHERE rolname = 'postgres';

# 7. Sair
\q

# 8. Testar
PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"
```

---

## 🔍 Verificar Problema Específico

### Ver Logs em Tempo Real

```bash
# Em um terminal, monitorar logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log

# Em outro terminal, tentar conectar
PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT 1;"
```

Isso vai mostrar o erro exato no log.

---

## 🛠️ Alternativa: Usar Usuário Diferente

Se nada funcionar, criar um novo usuário:

```bash
sudo -u postgres psql

CREATE USER eventos_user WITH PASSWORD 'postgres' SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE eventos_db TO eventos_user;
ALTER DATABASE eventos_db OWNER TO eventos_user;

\q
```

**Atualizar appsettings.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=eventos_user;Password=postgres"
  }
}
```

---

## 📋 Checklist Final

- [ ] Logs verificados: `sudo tail -20 /var/log/postgresql/postgresql-*-main.log`
- [ ] Hash da senha verificado: `SELECT rolpassword FROM pg_authid WHERE rolname = 'postgres';`
- [ ] Testado com trust: funciona?
- [ ] Senha recriada: `ALTER USER postgres WITH PASSWORD NULL;` depois `ALTER USER postgres WITH PASSWORD 'postgres';`
- [ ] PostgreSQL reiniciado: `sudo systemctl restart postgresql`
- [ ] Teste final: `PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"`

---

**✅ Execute os passos e me mostre os logs se ainda não funcionar!**







