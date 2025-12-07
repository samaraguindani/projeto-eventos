# 🔧 Corrigir Autenticação Npgsql (.NET)

O problema é que o Npgsql não está conseguindo autenticar com SCRAM-SHA-256. Vamos mudar para md5.

---

## ✅ Solução

### 1. Mudar para md5 e Recriar Senha

```bash
# 1. Mudar pg_hba.conf para md5
sudo sed -i 's/scram-sha-256/md5/g' /etc/postgresql/*/main/pg_hba.conf

# 2. Verificar
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$" | grep "127.0.0.1"

# 3. Reiniciar PostgreSQL
sudo systemctl restart postgresql

# 4. Recriar senha (importante: depois de mudar para md5)
sudo -u postgres psql -p 5433 -c "ALTER USER postgres WITH PASSWORD NULL;"
sudo -u postgres psql -p 5433 -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 5. Verificar hash (deve mostrar md5, não SCRAM)
sudo -u postgres psql -p 5433 -c "SELECT rolname, substring(rolpassword, 1, 10) as hash FROM pg_authid WHERE rolname = 'postgres';"

# 6. Testar com psql
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d eventos_db -c "SELECT current_user;"
```

### 2. Testar Serviço

```bash
cd ~/projeto-eventos/services/auth-service
dotnet run
```

---

## 🔍 Se Ainda Não Funcionar

### Verificar Versão do Npgsql

O problema pode ser versão antiga do Npgsql. Verifique se está atualizado:

```bash
cd ~/projeto-eventos/services/auth-service
cat *.csproj | grep Npgsql
```

### Alternativa: Usar Trust Temporariamente

Se nada funcionar, use trust apenas para desenvolvimento:

```bash
sudo sed -i 's/md5/trust/g' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
```

E remova a senha das connection strings (mas você disse que quer manter senha, então vamos tentar md5 primeiro).

---

## 📋 Comandos Rápidos

```bash
# Mudar para md5
sudo sed -i 's/scram-sha-256/md5/g' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Recriar senha
sudo -u postgres psql -p 5433 -c "ALTER USER postgres WITH PASSWORD NULL;"
sudo -u postgres psql -p 5433 -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Testar
cd ~/projeto-eventos/services/auth-service
dotnet run
```

---

**✅ Execute os comandos acima!**







