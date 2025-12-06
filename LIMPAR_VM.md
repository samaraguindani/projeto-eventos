# 🗑️ Guia de Limpeza Completa da VM

**⚠️ ATENÇÃO:** Estes comandos vão **DELETAR** dados e configurações. Use com cuidado!

---

## 🧹 PASSO 1: Parar Todos os Serviços

### 1.1. Parar Serviços .NET (Auth e Eventos)

```bash
# Verificar processos rodando
ps aux | grep dotnet

# Matar processos do dotnet
pkill -f "dotnet run"
# ou
killall dotnet
```

### 1.2. Parar Serviços PHP

```bash
# Verificar processos PHP
ps aux | grep "php -S"

# Matar processos PHP
pkill -f "php -S"
# ou
killall php
```

### 1.3. Verificar Portas e Matar Processos

```bash
# Ver processos nas portas
sudo netstat -tulpn | grep -E ':(5001|5002|8001|8002|8003)'

# Matar por PID (substitua <PID> pelo número)
sudo kill -9 <PID>
```

---

## 🗑️ PASSO 2: Remover Projeto

```bash
# Remover diretório do projeto
rm -rf ~/projeto-eventos

# Verificar se foi removido
ls -la ~ | grep projeto
```

---

## 🗄️ PASSO 3: Remover Banco de Dados

### 3.1. Remover Banco eventos_db

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# No prompt do PostgreSQL:
DROP DATABASE IF EXISTS eventos_db;

# Sair
\q
```

**Ou em um comando:**

```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS eventos_db;"
```

### 3.2. Verificar se foi removido

```bash
sudo -u postgres psql -l | grep eventos_db
```

✅ **Não deve aparecer nada**

---

## 🔧 PASSO 4: Remover Systemd Services (Se Configurados)

```bash
# Parar serviços
sudo systemctl stop eventos-auth
sudo systemctl stop eventos-eventos

# Desabilitar serviços
sudo systemctl disable eventos-auth
sudo systemctl disable eventos-eventos

# Remover arquivos de serviço
sudo rm /etc/systemd/system/eventos-auth.service
sudo rm /etc/systemd/system/eventos-eventos.service

# Recarregar systemd
sudo systemctl daemon-reload
```

---

## 📦 PASSO 5: Remover Dependências (OPCIONAL)

**⚠️ CUIDADO:** Isso remove software instalado. Só faça se não precisar mais!

### 5.1. Remover .NET SDK (OPCIONAL)

```bash
# Remover .NET SDK
sudo apt remove --purge dotnet-sdk-8.0 -y
sudo apt autoremove -y
```

### 5.2. Remover PHP (OPCIONAL)

```bash
# Remover PHP
sudo apt remove --purge php8.1 php8.1-cli php8.1-pgsql php8.1-mbstring -y
sudo apt autoremove -y
```

### 5.3. Remover PostgreSQL (OPCIONAL - CUIDADO!)

```bash
# ⚠️ ATENÇÃO: Isso remove TODOS os bancos de dados!

# Parar PostgreSQL
sudo systemctl stop postgresql

# Remover PostgreSQL
sudo apt remove --purge postgresql postgresql-contrib -y
sudo apt autoremove -y

# Remover dados (opcional - remove TODOS os dados!)
sudo rm -rf /var/lib/postgresql
```

### 5.4. Remover Composer (OPCIONAL)

```bash
sudo rm /usr/local/bin/composer
```

### 5.5. Remover Git (OPCIONAL)

```bash
sudo apt remove --purge git -y
```

---

## 🧹 PASSO 6: Limpar Arquivos Temporários

```bash
# Limpar logs
sudo journalctl --vacuum-time=1d

# Limpar cache do apt
sudo apt clean
sudo apt autoclean

# Limpar arquivos temporários
rm -rf /tmp/eventos-*
```

---

## 📋 COMANDOS RÁPIDOS - Limpeza Completa

```bash
# 1. Parar todos os serviços
pkill -f "dotnet run"
pkill -f "php -S"

# 2. Remover projeto
rm -rf ~/projeto-eventos

# 3. Remover banco de dados
sudo -u postgres psql -c "DROP DATABASE IF EXISTS eventos_db;"

# 4. Verificar limpeza
ps aux | grep -E "(dotnet|php)"
ls -la ~ | grep projeto
sudo -u postgres psql -l | grep eventos_db
```

---

## ✅ Verificação Final

```bash
# Verificar se não há processos rodando
ps aux | grep -E "(dotnet|php)" | grep -v grep

# Verificar se projeto foi removido
ls -la ~ | grep projeto

# Verificar se banco foi removido
sudo -u postgres psql -l | grep eventos_db

# Verificar portas livres
sudo netstat -tulpn | grep -E ':(5001|5002|8001|8002|8003)'
```

✅ **Se não aparecer nada, a limpeza foi concluída!**

---

## 🔄 Limpeza Parcial (Manter Dependências)

Se você quer apenas remover o projeto e banco, mas manter as dependências instaladas:

```bash
# Parar serviços
pkill -f "dotnet run"
pkill -f "php -S"

# Remover projeto
rm -rf ~/projeto-eventos

# Remover banco
sudo -u postgres psql -c "DROP DATABASE IF EXISTS eventos_db;"
```

Isso mantém .NET, PHP, PostgreSQL e outras dependências instaladas para uso futuro.

---

## ⚠️ AVISOS IMPORTANTES

1. **Backup:** Se tiver dados importantes, faça backup antes!
2. **PostgreSQL:** Remover PostgreSQL apaga TODOS os bancos de dados!
3. **Irreversível:** A remoção de dados é permanente!
4. **Dependências:** Só remova dependências se tiver certeza que não precisa mais!

---

## 🆘 Como Fazer Backup Antes de Limpar

```bash
# Backup do banco de dados
sudo -u postgres pg_dump eventos_db > ~/backup_eventos_db.sql

# Backup do projeto (se quiser)
tar -czf ~/backup_projeto-eventos.tar.gz ~/projeto-eventos
```

Para restaurar depois:

```bash
# Restaurar banco
sudo -u postgres psql -c "CREATE DATABASE eventos_db;"
sudo -u postgres psql -d eventos_db < ~/backup_eventos_db.sql

# Restaurar projeto
tar -xzf ~/backup_projeto-eventos.tar.gz -C ~/
```

---

**✅ Limpeza concluída! VM pronta para começar do zero!**





