# 📝 Resumo das Mudanças para Ambiente LOCAL

## ✅ Arquivos Criados

### 1. **docker-compose.yml**
- Container PostgreSQL (porta 5432)
- Container pgAdmin (porta 5050)
- Configuração de volumes persistentes
- Network dedicada para os containers

### 2. **.env.example**
- Template com todas as variáveis de ambiente
- Configurações locais (localhost:5432)
- Credenciais padrão para desenvolvimento

### 3. **GUIA_INSTALACAO_LOCAL.md**
- Guia completo passo a passo
- Instalação de pré-requisitos
- Como iniciar cada serviço
- Resolução de problemas comuns

### 4. **iniciar-tudo.ps1**
- Script PowerShell para iniciar tudo automaticamente
- Verifica Docker
- Inicia containers
- Aguarda banco ficar pronto
- Instala dependências PHP se necessário
- Abre todos os serviços em terminais separados
- Abre o navegador automaticamente

### 5. **parar-tudo.ps1**
- Script PowerShell para parar todos os serviços
- Para processos PHP e .NET
- Para containers Docker
- Limpeza completa

### 6. **README-LOCAL.md**
- Guia de referência rápida
- Comandos úteis
- URLs e portas
- Troubleshooting

## 🔧 Arquivos Modificados

### 1. **services/auth-service/appsettings.json**
```json
Antes: "Host=177.44.248.102;Port=5433;..."
Depois: "Host=localhost;Port=5432;..."
```
- Alterado host para localhost
- Alterada porta para 5432
- Alterada senha para postgres123

### 2. **services/eventos-service/appsettings.json**
```json
Antes: "Host=177.44.248.102;Port=5433;..."
Depois: "Host=localhost;Port=5432;..."
```
- Alterado host para localhost
- Alterada porta para 5432
- Alterado usuário para postgres
- Alterada senha para postgres123

### 3. **services/inscricoes-service/config/database.php**
```php
Antes: $host = getenv('DB_HOST') ?: '177.44.248.102';
Depois: $host = getenv('DB_HOST') ?: 'localhost';
```
- Alterado host padrão para localhost
- Alterada porta padrão para 5432
- Alterado usuário padrão para postgres
- Alterada senha padrão para postgres123

### 4. **services/certificados-service/config/database.php**
```php
Antes: $host = getenv('DB_HOST') ?: '177.44.248.102';
Depois: $host = getenv('DB_HOST') ?: 'localhost';
```
- Alterado host padrão para localhost
- Alterada porta padrão para 5432
- Alterado usuário padrão para postgres
- Alterada senha padrão para postgres123

### 5. **services/email-service/config/database.php**
```php
Antes: $host = getenv('DB_HOST') ?: '177.44.248.102';
Depois: $host = getenv('DB_HOST') ?: 'localhost';
```
- Alterado host padrão para localhost
- Alterada porta padrão para 5432
- Alterado usuário padrão para postgres
- Alterada senha padrão para postgres123

## 📊 Configuração do Ambiente LOCAL

### Banco de Dados
- **Host:** localhost (ao invés de 177.44.248.102)
- **Porta:** 5432 (ao invés de 5433)
- **Database:** eventos_db
- **Usuário:** postgres
- **Senha:** postgres123

### Serviços
Todos rodando em localhost:

| Serviço | Porta | Antes (VM) | Agora (Local) |
|---------|-------|------------|---------------|
| PostgreSQL | 5432 | VM (5433) | Docker Local |
| pgAdmin | 5050 | - | Docker Local |
| Auth Service | 5001 | VM | Local |
| Eventos Service | 5002 | VM | Local |
| Inscrições | 8001 | VM | Local |
| Certificados | 8002 | VM | Local |
| Portal | 8080 | VM | Local |

## 🎯 Principais Mudanças

### De VM para Local

**ANTES (VM):**
```
Servidor: 177.44.248.102:5433
- PostgreSQL na VM
- Todos os serviços na VM
- Acesso remoto via IP público
```

**AGORA (LOCAL):**
```
Servidor: localhost
- PostgreSQL no Docker local (porta 5432)
- Todos os serviços rodando localmente
- Sem necessidade de conexão externa
```

## 🔐 Credenciais Atualizadas

### PostgreSQL Local
```
Host: localhost
Port: 5432
Database: eventos_db
Username: postgres
Password: postgres123
```

### pgAdmin
```
URL: http://localhost:5050
Email: admin@eventos.com
Password: admin123
```

## 🚀 Como Usar

### Opção 1: Script Automático (RECOMENDADO)
```powershell
.\iniciar-tudo.ps1
```

### Opção 2: Manual
```powershell
# 1. Iniciar banco
docker-compose up -d

# 2. Aguardar 10 segundos

# 3. Em terminais separados:
cd services\auth-service; dotnet run --urls "http://localhost:5001"
cd services\eventos-service; dotnet run --urls "http://localhost:5002"
cd services\inscricoes-service; php -S localhost:8001
cd services\certificados-service; php -S localhost:8002
cd portal; php -S localhost:8080

# 4. Acessar http://localhost:8080
```

### Para Parar
```powershell
.\parar-tudo.ps1
```

## ✅ Vantagens do Ambiente Local

1. **Desenvolvimento Rápido**
   - Sem latência de rede
   - Alterações instantâneas
   - Debug facilitado

2. **Independência**
   - Não precisa de internet
   - Não depende da VM
   - Trabalha offline

3. **Isolamento**
   - Ambiente próprio
   - Sem conflitos com outros
   - Testes sem medo

4. **Performance**
   - Tudo local = mais rápido
   - Sem latência de rede
   - Respostas imediatas

## 📝 Próximos Passos

1. ✅ Execute `.\iniciar-tudo.ps1`
2. ✅ Acesse http://localhost:8080
3. ✅ Crie um usuário de teste
4. ✅ Explore os eventos
5. ✅ Faça uma inscrição
6. ✅ Desenvolva novas features!

## 🔄 Sincronização com VM (Futuro)

Quando quiser voltar para a VM:
1. Commit suas alterações no Git
2. Pull na VM
3. Atualize as configurações para o IP da VM
4. Reinicie os serviços na VM

---

**Tudo pronto para desenvolver localmente! 🎉**




