# Sincronização Bidirecional - Servidor ↔ SQLite Local

## 📋 Resumo

Implementada sincronização bidirecional entre o banco de dados do servidor (PostgreSQL) e o banco local (SQLite), permitindo que dados sejam sincronizados em ambas as direções e que o sistema funcione corretamente offline.

## ✅ Funcionalidades Implementadas

### 1. Cache de Usuários do Servidor

**Arquivo:** `portal/js/database.js`

- **Nova Tabela**: `usuarios_cache` - Armazena usuários do servidor para busca offline
- **Sincronização Automática**: Quando um usuário é buscado online, é automaticamente salvo no cache local
- **Busca Unificada**: A função `buscarUsuarioOfflinePorCpf()` busca primeiro no cache do servidor, depois em usuários cadastrados offline

### 2. Campos Obrigatórios no Cadastro Offline

**Arquivo:** `portal/js/checkin.js`

- **Nome**: Obrigatório
- **Email**: Obrigatório  
- **CPF**: Obrigatório (já estava)
- **Validação**: Formulário não permite submissão sem todos os campos preenchidos

### 3. Sincronização Bidirecional

#### Servidor → Local (Cache)
- Quando busca participante online → salva no cache local
- Quando sincroniza check-ins → usuários encontrados são salvos no cache
- Cache permite busca offline de usuários que já existem no servidor

#### Local → Servidor (Sincronização)
- Cadastros offline → sincronizados para o servidor
- Check-ins offline → sincronizados para o servidor
- Inscrições offline → sincronizadas para o servidor

## 🔄 Fluxo Completo

### Cenário 1: Usuário existe no servidor, busca offline

1. **Atendente busca por CPF** (offline)
2. **Sistema busca no cache local**:
   - Primeiro no `usuarios_cache` (usuários do servidor)
   - Depois em `usuarios_offline` (cadastrados offline)
3. **Se encontrar no cache**: Mostra dados e permite check-in
4. **Check-in é salvo offline** e sincronizado quando houver conexão

### Cenário 2: Usuário não existe, cadastro offline

1. **Atendente busca por CPF** (offline)
2. **Sistema não encontra** no cache local
3. **Mostra formulário de cadastro** (nome, email, CPF obrigatórios)
4. **Atendente preenche dados** e confirma
5. **Sistema salva**:
   - Usuário em `usuarios_offline`
   - Check-in em `checkins_offline`
6. **Quando sincronizar**: Cria usuário no servidor, inscreve e faz check-in

### Cenário 3: Busca online (atualiza cache)

1. **Atendente busca por CPF** (online)
2. **Sistema busca no servidor**
3. **Se encontrar**: Salva automaticamente no `usuarios_cache`
4. **Próxima busca offline**: Usuário já estará no cache

## 📊 Estrutura de Dados

### Tabela: `usuarios_cache`

Armazena usuários do servidor para busca offline:

```sql
CREATE TABLE usuarios_cache (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT,
    data_nascimento TEXT,
    papel TEXT,
    cadastro_completo INTEGER DEFAULT 0,
    data_atualizacao TEXT NOT NULL
);
```

### Tabela: `usuarios_offline`

Armazena usuários cadastrados offline (ainda não sincronizados):

```sql
CREATE TABLE usuarios_offline (
    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT NOT NULL UNIQUE,
    senha_temporaria TEXT,
    evento_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL
);
```

## 🔧 Funções Principais

### `buscarUsuarioOfflinePorCpf(cpf)`

Busca unificada que verifica:
1. `usuarios_cache` (usuários do servidor)
2. `usuarios_offline` (cadastrados offline)

Retorna o usuário encontrado ou `null`.

### `salvarUsuarioCache(usuario)`

Salva um usuário do servidor no cache local para busca offline.

### `fazerCheckinDiretoOffline(cpf)`

Cadastro rápido offline com validação:
- Nome obrigatório
- Email obrigatório
- CPF obrigatório
- Gera senha temporária
- Salva usuário e check-in offline

## 📝 Validações

### Cadastro Offline

- ✅ **Nome**: Obrigatório (required)
- ✅ **Email**: Obrigatório (required + type="email")
- ✅ **CPF**: Obrigatório (já estava)
- ✅ **Validação JavaScript**: Verifica se campos estão preenchidos antes de salvar

### Sincronização

- ✅ **Verifica conexão**: Só sincroniza quando online
- ✅ **Valida dados**: Backend valida dados antes de criar usuário
- ✅ **Tratamento de erros**: Retorna erros claros se dados insuficientes

## 🎯 Benefícios

1. **Busca Offline Melhorada**: Usuários do servidor podem ser encontrados offline
2. **Dados Consistentes**: Sincronização bidirecional mantém dados atualizados
3. **Cadastro Completo**: Campos obrigatórios garantem dados suficientes para sincronização
4. **Performance**: Cache local reduz necessidade de buscar no servidor

## ⚠️ Observações

- **Cache não expira automaticamente**: Usuários ficam no cache até serem atualizados
- **Limite de cache**: Depende do espaço disponível no localStorage (~5-10MB)
- **Sincronização manual**: Pode ser acionada pelo botão "Sincronizar Agora"
- **Sincronização automática**: Quando conexão é restaurada

## 🚀 Como Testar

1. **Buscar usuário online**: Verificar se é salvo no cache
2. **Desconectar internet**: Buscar mesmo usuário (deve encontrar no cache)
3. **Cadastrar novo usuário offline**: Preencher todos os campos obrigatórios
4. **Reconectar**: Sincronizar e verificar se usuário foi criado no servidor
5. **Buscar novamente offline**: Deve encontrar no cache do servidor

