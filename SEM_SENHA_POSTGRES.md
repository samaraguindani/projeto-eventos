# 🔓 Configurar PostgreSQL Sem Senha (Desenvolvimento)

Para desenvolvimento local na mesma VM, não precisa de senha! Use autenticação `trust`.

---

## ✅ Solução Simples

### 1. Configurar pg_hba.conf para Trust

```bash
# Fazer backup
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Alterar para trust (sem senha)
sudo sed -i 's/md5/trust/g' /etc/postgresql/*/main/pg_hba.conf
sudo sed -i 's/scram-sha-256/trust/g' /etc/postgresql/*/main/pg_hba.conf

# Verificar
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$" | grep "127.0.0.1"
```

**Deve mostrar:**
```
host    all             all             127.0.0.1/32            trust
```

### 2. Reiniciar PostgreSQL

```bash
sudo systemctl restart postgresql
```

### 3. Testar Conexão (Sem Senha)

```bash
# Não precisa de senha agora!
psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"
```

✅ **Deve funcionar sem pedir senha!**

### 4. Atualizar Connection Strings (Remover Senha)

**services/auth-service/appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres"
  }
}
```

**services/eventos-service/appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres"
  }
}
```

**Nota:** Remova a parte `Password=postgres` da connection string!

### 5. Testar Serviços

```bash
cd ~/projeto-eventos/services/auth-service
dotnet run
```

✅ **Deve funcionar sem erro de autenticação!**

---

## 🎯 Comandos Rápidos

```bash
# 1. Configurar trust
sudo sed -i 's/md5/trust/g' /etc/postgresql/*/main/pg_hba.conf
sudo sed -i 's/scram-sha-256/trust/g' /etc/postgresql/*/main/pg_hba.conf

# 2. Reiniciar
sudo systemctl restart postgresql

# 3. Testar
psql -h localhost -U postgres -d eventos_db -c "SELECT current_user;"

# 4. Testar serviço
cd ~/projeto-eventos/services/auth-service
dotnet run
```

---

## ⚠️ Importante

- **Trust = Sem Senha:** Conexões locais não precisam de senha
- **Segurança:** Use apenas em desenvolvimento/teste
- **Produção:** Em produção, use senha (md5 ou scram-sha-256)

---

## 📝 Atualizar Arquivos

Você precisa remover `Password=postgres` dos arquivos:

1. `services/auth-service/appsettings.json`
2. `services/eventos-service/appsettings.json`

**De:**
```json
"DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres;Password=postgres"
```

**Para:**
```json
"DefaultConnection": "Host=localhost;Port=5432;Database=eventos_db;Username=postgres"
```

---

**✅ Muito mais simples! Sem problemas de senha!**







