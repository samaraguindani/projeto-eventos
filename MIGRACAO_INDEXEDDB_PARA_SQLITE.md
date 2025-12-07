# Migração de IndexedDB para SQLite

## 📋 Resumo

O sistema foi migrado de **IndexedDB** para **SQLite** usando a biblioteca **SQL.js** para armazenamento offline. Isso oferece várias vantagens, incluindo consultas SQL nativas, melhor performance e uma interface mais familiar para desenvolvedores.

## ✅ Mudanças Implementadas

### 1. Biblioteca SQL.js

**Arquivo:** `portal/index.html`

- Adicionada biblioteca SQL.js via CDN
- SQL.js compila SQLite para WebAssembly, permitindo usar SQLite diretamente no navegador
- Banco de dados salvo no `localStorage` como array de bytes

### 2. Refatoração Completa do Database

**Arquivo:** `portal/js/database.js`

#### Mudanças Principais:

- **Antes**: Usava IndexedDB com object stores e índices
- **Agora**: Usa SQLite com tabelas SQL e índices

#### Estrutura das Tabelas:

```sql
-- Inscrições pendentes
CREATE TABLE inscricoes_pendentes (
    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    evento_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL
);

-- Presenças pendentes
CREATE TABLE presencas_pendentes (
    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_inscricao TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- Cancelamentos pendentes
CREATE TABLE cancelamentos_pendentes (
    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    inscricao_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL
);

-- Usuários cadastrados offline (check-in)
CREATE TABLE usuarios_offline (
    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT NOT NULL UNIQUE,
    senha_temporaria TEXT,
    evento_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL
);

-- Check-ins realizados offline
CREATE TABLE checkins_offline (
    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpf TEXT NOT NULL,
    evento_id INTEGER NOT NULL,
    usuario_temp_id INTEGER,
    dados_usuario TEXT,  -- JSON
    inscricao_criada INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL
);

-- Cache de eventos
CREATE TABLE eventos_cache (
    id INTEGER PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TEXT NOT NULL,
    data_fim TEXT NOT NULL,
    localizacao TEXT,
    capacidade_maxima INTEGER,
    vagas_disponiveis INTEGER,
    valor_inscricao REAL,
    categoria TEXT,
    status TEXT,
    numero_participantes INTEGER,
    data_atualizacao TEXT NOT NULL,
    dados_completos TEXT  -- JSON com dados completos
);
```

### 3. Métodos Atualizados

Todos os métodos foram refatorados para usar SQL:

- `adicionarInscricaoPendente()` → `INSERT INTO inscricoes_pendentes`
- `obterInscricoesPendentes()` → `SELECT * FROM inscricoes_pendentes`
- `removerInscricaoPendente()` → `DELETE FROM inscricoes_pendentes`
- E assim por diante para todas as operações

## 🎯 Vantagens do SQLite

### 1. **Consultas SQL Nativas**
- Pode usar JOINs, subconsultas, agregações, etc.
- Mais flexível que IndexedDB

### 2. **Melhor Performance**
- SQLite é otimizado para consultas
- Índices funcionam de forma mais eficiente

### 3. **Familiaridade**
- Desenvolvedores já conhecem SQL
- Mais fácil de debugar e manter

### 4. **Compatibilidade**
- Mesma sintaxe SQL do PostgreSQL (banco principal)
- Facilita migração de dados

### 5. **Persistência**
- Banco salvo no localStorage
- Pode ser exportado/importado facilmente

## 🔄 Funcionamento

### Inicialização

1. Carrega SQL.js (WebAssembly)
2. Tenta carregar banco salvo do localStorage
3. Se não existir, cria novo banco e tabelas
4. Salva automaticamente após cada operação

### Operações

- **INSERT**: Usa `prepare()` e `run()`
- **SELECT**: Usa `prepare()`, `step()` e `getAsObject()`
- **DELETE**: Usa `prepare()` e `run()`
- **UPDATE**: Usa `prepare()` e `run()`

### Persistência

- Banco é salvo no `localStorage` após cada operação
- Formato: Array de bytes (Uint8Array) serializado como JSON
- Limite do localStorage: ~5-10MB (suficiente para dados offline)

## 📝 Exemplo de Uso

```javascript
// Inicializar banco
await offlineDB.init();

// Adicionar inscrição pendente
await offlineDB.adicionarInscricaoPendente(usuarioId, eventoId);

// Obter todas as inscrições pendentes
const inscricoes = await offlineDB.obterInscricoesPendentes();

// Remover após sincronização
await offlineDB.removerInscricaoPendente(tempId);
```

## ⚠️ Observações Importantes

### 1. **Limite do localStorage**
- Máximo ~5-10MB dependendo do navegador
- Para dados maiores, considerar IndexedDB ou outras soluções

### 2. **Performance**
- SQL.js é compilado para WebAssembly
- Pode ser um pouco mais lento que IndexedDB nativo
- Mas oferece mais flexibilidade

### 3. **Compatibilidade**
- Requer navegadores modernos com suporte a WebAssembly
- Chrome, Firefox, Safari, Edge (versões recentes)

### 4. **Migração de Dados**
- Dados antigos do IndexedDB não são migrados automaticamente
- Usuários precisarão recriar dados offline (normalmente não é problema)

## 🚀 Como Testar

1. Abra o portal no navegador
2. Abra o DevTools → Application → Local Storage
3. Verifique se há uma chave `eventos_offline` (array de bytes)
4. Faça algumas operações offline
5. Verifique se os dados são salvos corretamente
6. Reconecte e verifique a sincronização

## 📊 Comparação

| Característica | IndexedDB | SQLite (SQL.js) |
|----------------|-----------|-----------------|
| Sintaxe | JavaScript API | SQL |
| Consultas | Limitadas | Completas (JOIN, etc) |
| Performance | Nativa (rápida) | WebAssembly (boa) |
| Tamanho | ~50KB | ~1MB (biblioteca) |
| Curva de aprendizado | Média | Baixa (SQL) |
| Debugging | DevTools | SQL queries |
| Persistência | IndexedDB | localStorage |

## ✅ Conclusão

A migração para SQLite oferece uma solução mais robusta e flexível para armazenamento offline, mantendo a mesma funcionalidade mas com melhor capacidade de consulta e manutenção.

