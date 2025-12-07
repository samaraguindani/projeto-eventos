# Guia: Como Acessar Dados do SQLite Local

## 📋 Visão Geral

O sistema usa SQLite no navegador (via SQL.js) para armazenamento offline. Os dados são salvos no `localStorage` do navegador como um array de bytes. Este guia mostra como acessar e visualizar esses dados.

---

## 🔧 Método 1: Via Console do Navegador (Recomendado)

### Passo 1: Abrir o Portal

1. Abra o portal no navegador: `portal/index.html`
2. Faça login (se necessário)
3. Abra o **DevTools** (F12 ou Ctrl+Shift+I)

### Passo 2: Acessar o Console

1. Vá para a aba **Console**
2. Execute os comandos abaixo

### Comandos Úteis

#### Inicializar o Banco e Ver Todas as Tabelas

```javascript
// Inicializar o banco
await offlineDB.init();

// Ver todas as tabelas
const tables = offlineDB.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
console.table(tables[0].values);
```

#### Ver Todos os Usuários do Cache (Servidor)

```javascript
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT * FROM usuarios_cache');
const usuarios = [];
while (stmt.step()) {
    usuarios.push(stmt.getAsObject());
}
stmt.free();
console.table(usuarios);
```

#### Ver Usuários Cadastrados Offline

```javascript
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT * FROM usuarios_offline');
const usuarios = [];
while (stmt.step()) {
    usuarios.push(stmt.getAsObject());
}
stmt.free();
console.table(usuarios);
```

#### Ver Check-ins Pendentes

```javascript
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT * FROM checkins_offline');
const checkins = [];
while (stmt.step()) {
    const row = stmt.getAsObject();
    if (row.dados_usuario) {
        try {
            row.dados_usuario = JSON.parse(row.dados_usuario);
        } catch (e) {}
    }
    checkins.push(row);
}
stmt.free();
console.table(checkins);
```

#### Ver Inscrições Pendentes

```javascript
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT * FROM inscricoes_pendentes');
const inscricoes = [];
while (stmt.step()) {
    inscricoes.push(stmt.getAsObject());
}
stmt.free();
console.table(inscricoes);
```

#### Ver Presenças Pendentes

```javascript
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT * FROM presencas_pendentes');
const presencas = [];
while (stmt.step()) {
    presencas.push(stmt.getAsObject());
}
stmt.free();
console.table(presencas);
```

#### Ver Eventos em Cache

```javascript
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT id, titulo, data_inicio, vagas_disponiveis FROM eventos_cache');
const eventos = [];
while (stmt.step()) {
    eventos.push(stmt.getAsObject());
}
stmt.free();
console.table(eventos);
```

#### Buscar Usuário por CPF

```javascript
// Substitua '12345678901' pelo CPF desejado (apenas números)
const cpf = '12345678901';
await offlineDB.init();
const usuario = await offlineDB.buscarUsuarioOfflinePorCpf(cpf);
console.log(usuario);
```

#### Ver Estatísticas Gerais

```javascript
await offlineDB.init();

const stats = {
    usuarios_cache: 0,
    usuarios_offline: 0,
    checkins_offline: 0,
    inscricoes_pendentes: 0,
    presencas_pendentes: 0,
    eventos_cache: 0
};

// Contar registros
const tables = ['usuarios_cache', 'usuarios_offline', 'checkins_offline', 
                'inscricoes_pendentes', 'presencas_pendentes', 'eventos_cache'];

for (const table of tables) {
    try {
        const stmt = offlineDB.db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
        stmt.step();
        const result = stmt.getAsObject();
        stats[table] = result.count;
        stmt.free();
    } catch (e) {
        console.warn(`Tabela ${table} não encontrada ou erro:`, e);
    }
}

console.table(stats);
```

---

## 🔧 Método 2: Via Application/Storage do DevTools

### Passo 1: Abrir DevTools

1. Abra o portal no navegador
2. Pressione **F12** ou **Ctrl+Shift+I**
3. Vá para a aba **Application** (Chrome) ou **Storage** (Firefox)

### Passo 2: Localizar os Dados

1. No painel esquerdo, expanda **Local Storage**
2. Clique no domínio do site (geralmente `file://` ou `http://localhost`)
3. Procure pela chave: `eventos_offline`

### Passo 3: Ver o Conteúdo

- O valor será um array JSON de bytes
- Você pode copiar o valor, mas não é legível diretamente
- Use o Método 1 (Console) para visualizar os dados

---

## 🔧 Método 3: Exportar Banco SQLite Completo

### Exportar para Arquivo

```javascript
// No console do navegador
await offlineDB.init();

// Exportar banco
const data = offlineDB.db.export();
const buffer = Array.from(data);

// Criar blob e fazer download
const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'eventos_offline.sqlite';
a.click();
URL.revokeObjectURL(url);

console.log('Banco exportado!');
```

### Importar Banco SQLite

```javascript
// No console do navegador
// Primeiro, selecione o arquivo .sqlite
const input = document.createElement('input');
input.type = 'file';
input.accept = '.sqlite';
input.onchange = async (e) => {
    const file = e.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Carregar no banco
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    
    offlineDB.db = new SQL.Database(uint8Array);
    offlineDB.salvar();
    
    console.log('Banco importado com sucesso!');
};
input.click();
```

---

## 🔧 Método 4: Usar SQL Diretamente

### Executar Queries SQL

```javascript
await offlineDB.init();

// Exemplo: SELECT com JOIN
const query = `
    SELECT 
        u.nome,
        u.email,
        u.cpf,
        c.evento_id,
        c.timestamp
    FROM usuarios_offline u
    LEFT JOIN checkins_offline c ON u.temp_id = c.usuario_temp_id
    ORDER BY c.timestamp DESC
`;

const result = offlineDB.db.exec(query);
if (result.length > 0) {
    console.table(result[0].values);
    console.log('Colunas:', result[0].columns);
}
```

### Ver Schema das Tabelas

```javascript
await offlineDB.init();

// Ver estrutura de uma tabela
const query = "SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios_cache'";
const result = offlineDB.db.exec(query);
if (result.length > 0) {
    console.log(result[0].values[0][0]);
}
```

---

## 🔧 Método 5: Script Helper Completo

Cole este script no console para ter acesso a funções úteis:

```javascript
// Helper para acessar dados do SQLite
window.sqliteHelper = {
    // Inicializar
    async init() {
        await offlineDB.init();
        console.log('✅ Banco inicializado');
    },
    
    // Ver todas as tabelas e contagens
    async stats() {
        await this.init();
        const tables = ['usuarios_cache', 'usuarios_offline', 'checkins_offline', 
                       'inscricoes_pendentes', 'presencas_pendentes', 'cancelamentos_pendentes', 
                       'eventos_cache'];
        
        const stats = {};
        for (const table of tables) {
            try {
                const stmt = offlineDB.db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
                stmt.step();
                stats[table] = stmt.getAsObject().count;
                stmt.free();
            } catch (e) {
                stats[table] = 'N/A';
            }
        }
        console.table(stats);
        return stats;
    },
    
    // Ver usuários do cache
    async usuariosCache() {
        await this.init();
        const stmt = offlineDB.db.prepare('SELECT * FROM usuarios_cache');
        const usuarios = [];
        while (stmt.step()) {
            usuarios.push(stmt.getAsObject());
        }
        stmt.free();
        console.table(usuarios);
        return usuarios;
    },
    
    // Ver usuários offline
    async usuariosOffline() {
        await this.init();
        const stmt = offlineDB.db.prepare('SELECT * FROM usuarios_offline');
        const usuarios = [];
        while (stmt.step()) {
            usuarios.push(stmt.getAsObject());
        }
        stmt.free();
        console.table(usuarios);
        return usuarios;
    },
    
    // Ver check-ins
    async checkins() {
        await this.init();
        const stmt = offlineDB.db.prepare('SELECT * FROM checkins_offline');
        const checkins = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            if (row.dados_usuario) {
                try {
                    row.dados_usuario = JSON.parse(row.dados_usuario);
                } catch (e) {}
            }
            checkins.push(row);
        }
        stmt.free();
        console.table(checkins);
        return checkins;
    },
    
    // Buscar por CPF
    async buscarCPF(cpf) {
        await this.init();
        const usuario = await offlineDB.buscarUsuarioOfflinePorCpf(cpf);
        console.log(usuario);
        return usuario;
    },
    
    // Executar SQL customizado
    async sql(query) {
        await this.init();
        const result = offlineDB.db.exec(query);
        if (result.length > 0) {
            console.table(result[0].values);
            console.log('Colunas:', result[0].columns);
        }
        return result;
    },
    
    // Exportar banco
    async exportar() {
        await this.init();
        const data = offlineDB.db.export();
        const buffer = Array.from(data);
        const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eventos_offline_${new Date().toISOString().split('T')[0]}.sqlite`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ Banco exportado!');
    },
    
    // Limpar banco (CUIDADO!)
    async limpar() {
        if (confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os dados offline! Continuar?')) {
            localStorage.removeItem('eventos_offline');
            offlineDB.db = null;
            console.log('✅ Banco limpo! Recarregue a página.');
        }
    }
};

console.log(`
📊 SQLite Helper carregado!

Comandos disponíveis:
- sqliteHelper.stats()           - Ver estatísticas
- sqliteHelper.usuariosCache()   - Ver usuários do cache
- sqliteHelper.usuariosOffline()  - Ver usuários offline
- sqliteHelper.checkins()         - Ver check-ins
- sqliteHelper.buscarCPF('123')   - Buscar por CPF
- sqliteHelper.sql('SELECT...')   - Executar SQL
- sqliteHelper.exportar()         - Exportar banco
- sqliteHelper.limpar()           - Limpar banco (CUIDADO!)
`);
```

### Uso do Helper

Após carregar o script, use:

```javascript
// Ver estatísticas
await sqliteHelper.stats();

// Ver usuários
await sqliteHelper.usuariosCache();

// Buscar por CPF
await sqliteHelper.buscarCPF('12345678901');

// Executar SQL
await sqliteHelper.sql('SELECT * FROM checkins_offline LIMIT 5');
```

---

## 🔧 Método 6: Usar Ferramentas Externas

### Exportar e Abrir em SQLite Browser

1. **Exportar o banco** (usando Método 3)
2. **Baixar SQLite Browser**: https://sqlitebrowser.org/
3. **Abrir o arquivo** `.sqlite` exportado
4. **Navegar pelas tabelas** visualmente

### Usar SQLite Online

1. **Exportar o banco** (usando Método 3)
2. **Acessar**: https://sqliteviewer.app/
3. **Fazer upload** do arquivo `.sqlite`
4. **Visualizar e editar** os dados

---

## 📊 Estrutura das Tabelas

### Tabelas Disponíveis

1. **usuarios_cache** - Usuários do servidor (cache)
2. **usuarios_offline** - Usuários cadastrados offline
3. **checkins_offline** - Check-ins realizados offline
4. **inscricoes_pendentes** - Inscrições pendentes de sincronização
5. **presencas_pendentes** - Presenças pendentes de sincronização
6. **cancelamentos_pendentes** - Cancelamentos pendentes
7. **eventos_cache** - Eventos em cache

---

## ⚠️ Observações Importantes

1. **LocalStorage**: Os dados estão no `localStorage` do navegador
2. **Por Domínio**: Cada domínio tem seu próprio `localStorage`
3. **Limite de Tamanho**: ~5-10MB dependendo do navegador
4. **Backup**: Sempre exporte antes de limpar dados
5. **Privacidade**: Dados são locais, não são enviados automaticamente

---

## 🐛 Troubleshooting

### Banco não inicializa

```javascript
// Verificar se SQL.js está carregado
console.log(typeof initSqlJs);

// Verificar localStorage
console.log(localStorage.getItem('eventos_offline'));

// Tentar recriar banco
localStorage.removeItem('eventos_offline');
await offlineDB.init();
```

### Dados não aparecem

```javascript
// Verificar se há dados
await offlineDB.init();
const stmt = offlineDB.db.prepare('SELECT COUNT(*) as count FROM usuarios_cache');
stmt.step();
console.log('Total:', stmt.getAsObject().count);
stmt.free();
```

### Erro ao executar query

```javascript
// Verificar se tabela existe
await offlineDB.init();
const tables = offlineDB.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
console.log('Tabelas:', tables[0].values.map(v => v[0]));
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Ver todos os check-ins pendentes com detalhes

```javascript
await offlineDB.init();
const query = `
    SELECT 
        c.temp_id,
        c.cpf,
        c.evento_id,
        c.timestamp,
        u.nome,
        u.email
    FROM checkins_offline c
    LEFT JOIN usuarios_offline u ON c.usuario_temp_id = u.temp_id
    ORDER BY c.timestamp DESC
`;
const result = offlineDB.db.exec(query);
if (result.length > 0) {
    console.table(result[0].values);
}
```

### Exemplo 2: Contar check-ins por evento

```javascript
await offlineDB.init();
const query = `
    SELECT 
        evento_id,
        COUNT(*) as total
    FROM checkins_offline
    GROUP BY evento_id
`;
const result = offlineDB.db.exec(query);
if (result.length > 0) {
    console.table(result[0].values);
}
```

### Exemplo 3: Ver usuários sem check-in

```javascript
await offlineDB.init();
const query = `
    SELECT u.*
    FROM usuarios_offline u
    LEFT JOIN checkins_offline c ON u.temp_id = c.usuario_temp_id
    WHERE c.temp_id IS NULL
`;
const result = offlineDB.db.exec(query);
if (result.length > 0) {
    console.table(result[0].values);
}
```

---

## ✅ Resumo Rápido

**Método mais rápido:**
1. Abra o console (F12)
2. Cole o script do Método 5
3. Use `await sqliteHelper.stats()` para ver tudo

**Para exportar:**
```javascript
await sqliteHelper.exportar();
```

**Para buscar:**
```javascript
await sqliteHelper.buscarCPF('12345678901');
```

