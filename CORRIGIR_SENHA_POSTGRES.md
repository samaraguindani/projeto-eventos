# 🔧 Corrigir Senha do PostgreSQL

Guia rápido para corrigir o erro "password authentication failed for user postgres".

---

## 🚨 Problema

Erro ao rodar serviços:
```
password authentication failed for user "postgres"
```

---

## ✅ Solução Rápida

### 1. Configurar Senha do Usuário postgres

```bash
# Configurar senha para 'postgres'
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 2. Verificar se Funcionou

```bash
# Testar conexão com senha
PGPASSWORD=postgres psql -U postgres -d eventos_db -c "SELECT 1;"
```

✅ **Deve retornar:** `?column?` com valor `1`

### 3. Testar Conexão dos Serviços

```bash
# Testar Auth Service
cd ~/projeto-eventos/services/auth-service
dotnet run
```

✅ **Deve iniciar sem erro de autenticação**

---

## 🔍 Verificar Configuração Atual

### Ver Método de Autenticação

```bash
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$"
```

**Configuração esperada:**
- `host all all 127.0.0.1/32 scram-sha-256` ✅ (correto)
- `host all all ::1/128 scram-sha-256` ✅ (correto)

### Verificar Senha Configurada

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Verificar usuário
\du

# Deve mostrar postgres com atributos
```

---

## 🛠️ Se Ainda Não Funcionar

### Opção 1: Reiniciar PostgreSQL

```bash
sudo systemctl restart postgresql
```

### Opção 2: Verificar se Senha Foi Aplicada

```bash
# Testar conexão direta
PGPASSWORD=postgres psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"
```

### Opção 3: Recriar Senha

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# No prompt, executar:
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### Opção 4: Verificar Connection String

Verifique se os arquivos `appsettings.json` estão corretos:

**services/auth-service/appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres;Password=postgres"
  }
}
```

**services/eventos-service/appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres;Password=postgres"
  }
}
```

---

## 📋 Checklist

- [ ] Senha configurada: `ALTER USER postgres WITH PASSWORD 'postgres';`
- [ ] Teste de conexão funcionou: `PGPASSWORD=postgres psql -U postgres -d eventos_db -c "SELECT 1;"`
- [ ] PostgreSQL reiniciado (se necessário): `sudo systemctl restart postgresql`
- [ ] Connection strings corretas nos appsettings.json
- [ ] Serviços testados: `dotnet run` sem erro de autenticação

---

## 🎯 Comandos Resumidos

```bash
# 1. Configurar senha
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 2. Testar conexão
PGPASSWORD=postgres psql -U postgres -d eventos_db -c "SELECT 1;"

# 3. Reiniciar PostgreSQL (se necessário)
sudo systemctl restart postgresql

# 4. Testar serviço
cd ~/projeto-eventos/services/auth-service
dotnet run
```

---

**✅ Problema resolvido!**





