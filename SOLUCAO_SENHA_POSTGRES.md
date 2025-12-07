# 🔧 Solução Definitiva - Senha PostgreSQL

## 🚨 Problema

Mesmo após configurar a senha, ainda dá erro:
```
password authentication failed for user "postgres"
```

---

## ✅ Solução Passo a Passo

### 1. Verificar Senha Atual

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Verificar usuário e senha
\du

# Verificar se senha está configurada
SELECT rolname, rolpassword FROM pg_authid WHERE rolname = 'postgres';
```

### 2. Configurar Senha Novamente (Método Garantido)

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# No prompt do PostgreSQL, executar:
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### 3. Verificar Método de Autenticação

```bash
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$"
```

**Se estiver usando `scram-sha-256`, pode precisar mudar para `md5`:**

### 4. Alterar para md5 (Mais Compatível)

```bash
# Fazer backup
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Editar arquivo
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Alterar estas linhas:**
```
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

**Para:**
```
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Salvar:** Ctrl+O, Enter, Ctrl+X

### 5. Reiniciar PostgreSQL

```bash
sudo systemctl restart postgresql
```

### 6. Testar Conexão

```bash
# Testar com md5
PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"
```

✅ **Deve funcionar agora!**

---

## 🔄 Alternativa: Usar Trust (Apenas para Desenvolvimento)

**⚠️ CUIDADO:** Isso remove autenticação! Use apenas em desenvolvimento!

```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Alterar para:**
```
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

**Reiniciar:**
```bash
sudo systemctl restart postgresql
```

---

## 🎯 Solução Rápida (Recomendada)

```bash
# 1. Entrar no PostgreSQL
sudo -u postgres psql

# 2. Configurar senha
ALTER USER postgres WITH PASSWORD 'postgres';

# 3. Verificar
\du

# 4. Sair
\q

# 5. Alterar pg_hba.conf para md5
sudo sed -i 's/scram-sha-256/md5/g' /etc/postgresql/*/main/pg_hba.conf

# 6. Reiniciar
sudo systemctl restart postgresql

# 7. Testar
PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT 1;"
```

---

## 📋 Verificar se Funcionou

```bash
# Testar conexão
PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT current_user, current_database();"

# Deve retornar:
#  current_user | current_database 
# --------------+------------------
#  postgres     | eventos_db
```

---

## 🚀 Testar Serviço

```bash
cd ~/projeto-eventos/services/auth-service
dotnet run
```

✅ **Deve iniciar sem erro de autenticação!**

---

## 🛠️ Se Ainda Não Funcionar

### Verificar Logs do PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Verificar se PostgreSQL Está Rodando

```bash
sudo systemctl status postgresql
```

### Verificar Porta

```bash
sudo netstat -tulpn | grep 5432
```

---

**✅ Problema resolvido!**







