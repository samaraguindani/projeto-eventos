// Script de migração para adicionar tabela usuarios_cache
// Execute no console do navegador se encontrar erro "no such table: usuarios_cache"

async function migrarBanco() {
    try {
        // Carregar SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        
        // Carregar banco existente
        const savedDb = localStorage.getItem('eventos_offline');
        if (!savedDb) {
            console.log('Nenhum banco encontrado. O banco será criado automaticamente na próxima inicialização.');
            return;
        }
        
        const buffer = JSON.parse(savedDb);
        const uint8Array = new Uint8Array(buffer);
        const db = new SQL.Database(uint8Array);
        
        // Verificar se tabela usuarios_cache existe
        let tabelaExiste = false;
        try {
            db.exec('SELECT 1 FROM usuarios_cache LIMIT 1');
            tabelaExiste = true;
            console.log('✅ Tabela usuarios_cache já existe!');
        } catch (e) {
            console.log('⚠️ Tabela usuarios_cache não existe. Criando...');
        }
        
        if (!tabelaExiste) {
            // Criar tabela usuarios_cache
            const schema = `
                CREATE TABLE IF NOT EXISTS usuarios_cache (
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
                
                CREATE INDEX IF NOT EXISTS idx_usuarios_cache_cpf ON usuarios_cache(cpf);
                CREATE INDEX IF NOT EXISTS idx_usuarios_cache_email ON usuarios_cache(email);
            `;
            
            db.exec(schema);
            console.log('✅ Tabela usuarios_cache criada com sucesso!');
            
            // Salvar banco atualizado
            const data = db.export();
            const newBuffer = Array.from(data);
            localStorage.setItem('eventos_offline', JSON.stringify(newBuffer));
            console.log('✅ Banco atualizado e salvo!');
        }
        
        db.close();
        console.log('✅ Migração concluída! Recarregue a página.');
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
}

// Executar migração
migrarBanco();

