# 💻 Configuração para Rodar Localmente

Configuração completa para rodar todos os serviços localmente, com banco de dados na VM.

---

## ✅ Configuração Atual

### Serviços (Rodam Localmente)
- **Auth Service:** `http://localhost:5001`
- **Eventos Service:** `http://localhost:5002`
- **Inscrições Service:** `http://localhost:8001`
- **Certificados Service:** `http://localhost:8002`
- **Email Service:** `http://localhost:8003`
- **Frontend:** `http://localhost:8080` (ou abrir `portal/index.html`)

### Banco de Dados (Na VM)
- **Host:** `177.44.248.102`
- **Port:** `5433`
- **Database:** `eventos_db`
- **Username:** `eventos`
- **Password:** `eventos123`

---

## 🚀 Como Rodar Localmente

### 1. Iniciar Auth Service

```bash
cd services/auth-service
dotnet run
```

✅ **Rodando em:** `http://localhost:5001`

### 2. Iniciar Eventos Service

```bash
cd services/eventos-service
dotnet run
```

✅ **Rodando em:** `http://localhost:5002`

### 3. Iniciar Inscrições Service

```bash
cd services/inscricoes-service
php -S localhost:8001
```

✅ **Rodando em:** `http://localhost:8001`

### 4. Iniciar Certificados Service

```bash
cd services/certificados-service
php -S localhost:8002
```

✅ **Rodando em:** `http://localhost:8002`

### 5. Iniciar Email Service

```bash
cd services/email-service
php -S localhost:8003
```

✅ **Rodando em:** `http://localhost:8003`

### 6. Abrir Frontend

**Opção 1:** Abrir diretamente no navegador
```
portal/index.html
```

**Opção 2:** Usar servidor HTTP local
```bash
cd portal
python -m http.server 8080
```

Acesse: `http://localhost:8080`

---

## 🔧 Arquivos Configurados

### Serviços C# (.NET)
- ✅ `services/auth-service/appsettings.json` - Banco na VM
- ✅ `services/auth-service/Program.cs` - Escuta em localhost:5001
- ✅ `services/eventos-service/appsettings.json` - Banco na VM
- ✅ `services/eventos-service/Program.cs` - Escuta em localhost:5002

### Serviços PHP
- ✅ `services/inscricoes-service/config/database.php` - Banco na VM
- ✅ `services/certificados-service/config/database.php` - Banco na VM
- ✅ `services/email-service/config/database.php` - Banco na VM
- ✅ Todos os `EmailService.php` - Banco na VM

### Frontend
- ✅ `portal/js/api.js` - Aponta para localhost (serviços locais)

---

## 🧪 Testar Conexão com Banco

```bash
# Testar conexão com banco na VM
PGPASSWORD=eventos123 psql -h 177.44.248.102 -p 5433 -U eventos -d eventos_db -c "SELECT current_user, current_database();"
```

✅ **Deve retornar:**
```
 current_user | current_database 
--------------+------------------
 eventos      | eventos_db
```

---

## ⚠️ Pré-requisitos

### No Seu Computador Local
- ✅ .NET 8 SDK instalado
- ✅ PHP 8.1+ instalado
- ✅ Acesso à VM (177.44.248.102) na porta 5433
- ✅ Firewall local permitindo conexões de saída para a VM

### Na VM
- ✅ PostgreSQL rodando na porta 5433
- ✅ Usuário `eventos` criado com senha `eventos123`
- ✅ Banco `eventos_db` criado
- ✅ Schema SQL executado
- ✅ Firewall permitindo conexões na porta 5433

---

## 🔥 Configurar PostgreSQL para Aceitar Conexões Externas (OBRIGATÓRIO)

### 1. Configurar PostgreSQL para Escutar em Todas as Interfaces

```bash
# Na VM - Editar postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**Procurar e alterar:**
```
#listen_addresses = 'localhost'
```

**Para:**
```
listen_addresses = '*'
```

**Ou usar sed:**
```bash
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/*/main/postgresql.conf
```

### 2. Configurar pg_hba.conf para Aceitar Conexões Externas

```bash
# Na VM - Editar pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Adicionar no final:**
```
host    all             all             0.0.0.0/0               md5
```

**Ou usar echo:**
```bash
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
```

### 3. Reiniciar PostgreSQL

```bash
sudo systemctl restart postgresql
```

### 4. Verificar se Está Escutando Corretamente

```bash
# Na VM
sudo netstat -tulpn | grep 5433
```

✅ **Deve mostrar:** `0.0.0.0:5433` (não apenas `127.0.0.1:5433`)

### 5. Configurar Firewall

```bash
# Na VM - Verificar firewall
sudo ufw status

# Permitir porta 5433 (PostgreSQL)
sudo ufw allow 5433/tcp

# Aplicar
sudo ufw reload
```

### 6. Testar Conexão do Seu Computador

**No Windows (PowerShell):**
```powershell
Test-NetConnection -ComputerName 177.44.248.102 -Port 5433
```

✅ **Deve mostrar:** `TcpTestSucceeded : True`

---

## 📋 Checklist

- [ ] .NET 8 SDK instalado localmente
- [ ] PHP 8.1+ instalado localmente
- [ ] PostgreSQL na VM acessível (porta 5433)
- [ ] Usuário `eventos` criado na VM
- [ ] Todos os serviços rodando localmente
- [ ] Frontend abrindo no navegador
- [ ] Conexão com banco funcionando
- [ ] Teste de cadastro/login funcionando

---

## 🎯 Comandos Rápidos

```bash
# Terminal 1 - Auth Service
cd services/auth-service && dotnet run

# Terminal 2 - Eventos Service
cd services/eventos-service && dotnet run

# Terminal 3 - Inscrições Service
cd services/inscricoes-service && php -S localhost:8001

# Terminal 4 - Certificados Service
cd services/certificados-service && php -S localhost:8002

# Terminal 5 - Email Service
cd services/email-service && php -S localhost:8003

# Terminal 6 - Frontend (opcional)
cd portal && python -m http.server 8080
```

---

**✅ Tudo configurado para rodar localmente com banco na VM!**

