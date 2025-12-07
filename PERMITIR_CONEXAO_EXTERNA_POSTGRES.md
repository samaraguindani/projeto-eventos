# 🔓 Permitir Conexão Externa ao PostgreSQL

O erro de timeout significa que o PostgreSQL não está aceitando conexões externas. Vamos configurar.

---

## ✅ Solução Passo a Passo

### 1. Verificar se PostgreSQL Está Rodando

```bash
# Na VM
sudo systemctl status postgresql
```

✅ **Deve estar:** `Active: active (running)`

### 2. Verificar em Qual Interface o PostgreSQL Está Escutando

```bash
# Na VM
sudo netstat -tulpn | grep 5433
```

**Se mostrar apenas `127.0.0.1:5433`**, precisa configurar para escutar em todas as interfaces.

### 3. Configurar PostgreSQL para Escutar em Todas as Interfaces

```bash
# Na VM - Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**Procurar por:**
```
#listen_addresses = 'localhost'
```

**Alterar para:**
```
listen_addresses = '*'
```

**Ou se quiser apenas IPv4:**
```
listen_addresses = '0.0.0.0'
```

**Salvar:** Ctrl+O, Enter, Ctrl+X

### 4. Configurar pg_hba.conf para Aceitar Conexões Externas

```bash
# Na VM - Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Adicionar no final do arquivo:**
```
# Permitir conexões externas
host    all             all             0.0.0.0/0               md5
```

**Ou mais seguro, apenas da sua rede:**
```
host    all             all             SEU_IP_LOCAL/32        md5
```

**Salvar:** Ctrl+O, Enter, Ctrl+X

### 5. Reiniciar PostgreSQL

```bash
# Na VM
sudo systemctl restart postgresql
```

### 6. Verificar se Está Escutando em Todas as Interfaces

```bash
# Na VM
sudo netstat -tulpn | grep 5433
```

✅ **Deve mostrar:** `0.0.0.0:5433` ou `:::5433`

### 7. Configurar Firewall

```bash
# Na VM - Verificar firewall
sudo ufw status

# Permitir porta 5433
sudo ufw allow 5433/tcp

# Aplicar
sudo ufw reload
```

### 8. Testar Conexão do Seu Computador

**No Windows (PowerShell):**

```powershell
# Testar conexão
Test-NetConnection -ComputerName 177.44.248.102 -Port 5433
```

**Ou com psql (se tiver instalado):**

```bash
PGPASSWORD=eventos123 psql -h 177.44.248.102 -p 5433 -U eventos -d eventos_db -c "SELECT current_user;"
```

---

## 🎯 Comandos Rápidos (Na VM)

```bash
# 1. Editar postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/*/main/postgresql.conf

# 2. Adicionar regra no pg_hba.conf
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# 3. Reiniciar PostgreSQL
sudo systemctl restart postgresql

# 4. Verificar
sudo netstat -tulpn | grep 5433

# 5. Configurar firewall
sudo ufw allow 5433/tcp
sudo ufw reload
```

---

## 🔍 Verificar Configuração

### Ver listen_addresses

```bash
# Na VM
sudo grep listen_addresses /etc/postgresql/*/main/postgresql.conf | grep -v "^#"
```

✅ **Deve mostrar:** `listen_addresses = '*'`

### Ver pg_hba.conf

```bash
# Na VM
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#" | grep -v "^$" | tail -5
```

✅ **Deve mostrar regra para `0.0.0.0/0` ou seu IP**

### Ver Porta Escutando

```bash
# Na VM
sudo netstat -tulpn | grep 5433
```

✅ **Deve mostrar:** `0.0.0.0:5433` ou `:::5433`

---

## ⚠️ Segurança

Para produção, use regras mais restritivas:

```bash
# Apenas do seu IP específico
host    all             all             SEU_IP_AQUI/32         md5

# Ou apenas de uma rede específica
host    all             all             192.168.1.0/24         md5
```

---

## 🧪 Teste Final

**No seu computador (Windows):**

```powershell
# Testar conexão
Test-NetConnection -ComputerName 177.44.248.102 -Port 5433
```

✅ **Deve mostrar:** `TcpTestSucceeded : True`

**Depois, teste o serviço:**

```powershell
cd C:\projeto-eventos\services\auth-service
dotnet run
```

✅ **Deve conectar sem timeout!**

---

**✅ Execute os comandos na VM e teste novamente!**






