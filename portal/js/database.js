// SQLite para armazenamento offline usando SQL.js
class OfflineDatabase {
    constructor() {
        this.dbName = 'eventos_offline';
        this.db = null;
        this.sqljs = null;
    }

    async init() {
        // Carregar SQL.js se ainda não foi carregado
        if (typeof initSqlJs === 'undefined') {
            throw new Error('SQL.js não foi carregado. Certifique-se de incluir o script no HTML.');
        }

        if (this.db) {
            return this.db;
        }

        try {
            // Inicializar SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
            });
            this.sqljs = SQL;

            // Tentar carregar banco existente do localStorage
            const savedDb = localStorage.getItem(this.dbName);
            
            if (savedDb) {
                try {
                    const buffer = JSON.parse(savedDb);
                    const uint8Array = new Uint8Array(buffer);
                    this.db = new SQL.Database(uint8Array);
                    // Verificar e criar tabelas que faltam (migração)
                    this.verificarECriarTabelas();
                } catch (e) {
                    console.warn('Erro ao carregar banco salvo, criando novo:', e);
                    this.db = new SQL.Database();
                    this.criarTabelas();
                    this.salvar();
                }
            } else {
                // Criar novo banco
                this.db = new SQL.Database();
                this.criarTabelas();
                this.salvar();
            }

            return this.db;
        } catch (error) {
            console.error('Erro ao inicializar SQLite:', error);
            throw error;
        }
    }

    // Verificar e criar tabelas que faltam (migração)
    verificarECriarTabelas() {
        const tabelasNecessarias = [
            'inscricoes_pendentes',
            'presencas_pendentes',
            'cancelamentos_pendentes',
            'usuarios_offline',
            'checkins_offline',
            'eventos_cache',
            'usuarios_cache' // Nova tabela
        ];
        
        const tabelasExistentes = [];
        try {
            const result = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
            if (result.length > 0) {
                tabelasExistentes.push(...result[0].values.map(v => v[0]));
            }
        } catch (e) {
            console.warn('Erro ao verificar tabelas existentes:', e);
        }
        
        // Verificar quais tabelas faltam
        const tabelasFaltando = tabelasNecessarias.filter(t => !tabelasExistentes.includes(t));
        
        if (tabelasFaltando.length > 0) {
            console.log('Criando tabelas faltantes:', tabelasFaltando);
            // Criar apenas as tabelas que faltam
            this.criarTabelasFaltantes(tabelasFaltando);
            this.salvar();
        }
    }

    // Criar apenas tabelas específicas que faltam
    criarTabelasFaltantes(tabelas) {
        const schemas = {
            'inscricoes_pendentes': `
                CREATE TABLE IF NOT EXISTS inscricoes_pendentes (
                    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    evento_id INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_inscricoes_pendentes_usuario ON inscricoes_pendentes(usuario_id);
                CREATE INDEX IF NOT EXISTS idx_inscricoes_pendentes_evento ON inscricoes_pendentes(evento_id);
            `,
            'presencas_pendentes': `
                CREATE TABLE IF NOT EXISTS presencas_pendentes (
                    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    codigo_inscricao TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_presencas_pendentes_codigo ON presencas_pendentes(codigo_inscricao);
            `,
            'cancelamentos_pendentes': `
                CREATE TABLE IF NOT EXISTS cancelamentos_pendentes (
                    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    inscricao_id INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_cancelamentos_pendentes_inscricao ON cancelamentos_pendentes(inscricao_id);
            `,
            'usuarios_offline': `
                CREATE TABLE IF NOT EXISTS usuarios_offline (
                    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    cpf TEXT NOT NULL UNIQUE,
                    senha_temporaria TEXT,
                    evento_id INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_usuarios_offline_cpf ON usuarios_offline(cpf);
                CREATE INDEX IF NOT EXISTS idx_usuarios_offline_email ON usuarios_offline(email);
            `,
            'checkins_offline': `
                CREATE TABLE IF NOT EXISTS checkins_offline (
                    temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cpf TEXT NOT NULL,
                    evento_id INTEGER NOT NULL,
                    usuario_temp_id INTEGER,
                    dados_usuario TEXT,
                    inscricao_criada INTEGER DEFAULT 0,
                    timestamp TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_checkins_offline_cpf ON checkins_offline(cpf);
                CREATE INDEX IF NOT EXISTS idx_checkins_offline_evento ON checkins_offline(evento_id);
                CREATE INDEX IF NOT EXISTS idx_checkins_offline_usuario_temp ON checkins_offline(usuario_temp_id);
            `,
            'eventos_cache': `
                CREATE TABLE IF NOT EXISTS eventos_cache (
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
                    dados_completos TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_eventos_cache_data_atualizacao ON eventos_cache(data_atualizacao);
            `,
            'usuarios_cache': `
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
            `
        };
        
        for (const tabela of tabelas) {
            if (schemas[tabela]) {
                try {
                    this.db.exec(schemas[tabela]);
                } catch (e) {
                    console.error(`Erro ao criar tabela ${tabela}:`, e);
                }
            }
        }
    }

    criarTabelas() {
        const schema = `
            -- Tabela de inscrições pendentes
            CREATE TABLE IF NOT EXISTS inscricoes_pendentes (
                temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                evento_id INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_inscricoes_pendentes_usuario ON inscricoes_pendentes(usuario_id);
            CREATE INDEX IF NOT EXISTS idx_inscricoes_pendentes_evento ON inscricoes_pendentes(evento_id);

            -- Tabela de presenças pendentes
            CREATE TABLE IF NOT EXISTS presencas_pendentes (
                temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_inscricao TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_presencas_pendentes_codigo ON presencas_pendentes(codigo_inscricao);

            -- Tabela de cancelamentos pendentes
            CREATE TABLE IF NOT EXISTS cancelamentos_pendentes (
                temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                inscricao_id INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_cancelamentos_pendentes_inscricao ON cancelamentos_pendentes(inscricao_id);

            -- Tabela de usuários cadastrados offline (check-in)
            CREATE TABLE IF NOT EXISTS usuarios_offline (
                temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                cpf TEXT NOT NULL UNIQUE,
                senha_temporaria TEXT,
                evento_id INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_usuarios_offline_cpf ON usuarios_offline(cpf);
            CREATE INDEX IF NOT EXISTS idx_usuarios_offline_email ON usuarios_offline(email);

            -- Tabela de check-ins realizados offline
            CREATE TABLE IF NOT EXISTS checkins_offline (
                temp_id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpf TEXT NOT NULL,
                evento_id INTEGER NOT NULL,
                usuario_temp_id INTEGER,
                dados_usuario TEXT,
                inscricao_criada INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_checkins_offline_cpf ON checkins_offline(cpf);
            CREATE INDEX IF NOT EXISTS idx_checkins_offline_evento ON checkins_offline(evento_id);
            CREATE INDEX IF NOT EXISTS idx_checkins_offline_usuario_temp ON checkins_offline(usuario_temp_id);

            -- Tabela de cache de eventos
            CREATE TABLE IF NOT EXISTS eventos_cache (
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
                dados_completos TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_eventos_cache_data_atualizacao ON eventos_cache(data_atualizacao);

            -- Tabela de cache de usuários do servidor (para busca offline)
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

        this.db.run(schema);
    }

    salvar() {
        // Salvar banco no localStorage
        const data = this.db.export();
        const buffer = Array.from(data);
        localStorage.setItem(this.dbName, JSON.stringify(buffer));
    }

    // ========== INSCRIÇÕES PENDENTES ==========

    async adicionarInscricaoPendente(usuarioId, eventoId) {
        await this.init();
        const stmt = this.db.prepare(`
            INSERT INTO inscricoes_pendentes (usuario_id, evento_id, timestamp)
            VALUES (?, ?, ?)
        `);
        stmt.run([usuarioId, eventoId, new Date().toISOString()]);
        stmt.free();
        this.salvar();
    }

    async obterInscricoesPendentes() {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM inscricoes_pendentes ORDER BY timestamp');
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    }

    async removerInscricaoPendente(tempId) {
        await this.init();
        const stmt = this.db.prepare('DELETE FROM inscricoes_pendentes WHERE temp_id = ?');
        stmt.run([tempId]);
        stmt.free();
        this.salvar();
    }

    // ========== PRESENÇAS PENDENTES ==========

    async adicionarPresencaPendente(codigoInscricao) {
        await this.init();
        const stmt = this.db.prepare(`
            INSERT INTO presencas_pendentes (codigo_inscricao, timestamp)
            VALUES (?, ?)
        `);
        stmt.run([codigoInscricao, new Date().toISOString()]);
        stmt.free();
        this.salvar();
    }

    async obterPresencasPendentes() {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM presencas_pendentes ORDER BY timestamp');
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    }

    async removerPresencaPendente(tempId) {
        await this.init();
        const stmt = this.db.prepare('DELETE FROM presencas_pendentes WHERE temp_id = ?');
        stmt.run([tempId]);
        stmt.free();
        this.salvar();
    }

    // ========== CANCELAMENTOS PENDENTES ==========

    async adicionarCancelamentoPendente(inscricaoId) {
        await this.init();
        const stmt = this.db.prepare(`
            INSERT INTO cancelamentos_pendentes (inscricao_id, timestamp)
            VALUES (?, ?)
        `);
        stmt.run([inscricaoId, new Date().toISOString()]);
        stmt.free();
        this.salvar();
    }

    async obterCancelamentosPendentes() {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM cancelamentos_pendentes ORDER BY timestamp');
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    }

    async removerCancelamentoPendente(tempId) {
        await this.init();
        const stmt = this.db.prepare('DELETE FROM cancelamentos_pendentes WHERE temp_id = ?');
        stmt.run([tempId]);
        stmt.free();
        this.salvar();
    }

    // ========== USUÁRIOS OFFLINE (CHECK-IN) ==========

    async adicionarUsuarioOffline(usuario) {
        await this.init();
        const stmt = this.db.prepare(`
            INSERT INTO usuarios_offline (nome, email, cpf, senha_temporaria, evento_id, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const cpfLimpo = usuario.cpf.replace(/\D/g, '');
        stmt.run([
            usuario.nome,
            usuario.email,
            cpfLimpo,
            usuario.senha_temporaria || null,
            usuario.evento_id,
            new Date().toISOString()
        ]);
        stmt.free();
        this.salvar();
        // Retornar o último ID inserido
        const lastIdStmt = this.db.prepare('SELECT last_insert_rowid() as id');
        lastIdStmt.step();
        const result = lastIdStmt.getAsObject();
        lastIdStmt.free();
        return result.id;
    }

    async buscarUsuarioOfflinePorCpf(cpf) {
        await this.init();
        const cpfLimpo = cpf.replace(/\D/g, '');
        
        // Primeiro buscar no cache de usuários do servidor (se a tabela existir)
        let result = null;
        try {
            // Verificar se tabela existe
            this.db.exec('SELECT 1 FROM usuarios_cache LIMIT 1');
            
            let stmt = this.db.prepare('SELECT * FROM usuarios_cache WHERE cpf = ? LIMIT 1');
            stmt.bind([cpfLimpo]);
            if (stmt.step()) {
                const usuarioCache = stmt.getAsObject();
                // Converter para formato esperado
                result = {
                    temp_id: usuarioCache.id,
                    id: usuarioCache.id,
                    nome: usuarioCache.nome,
                    email: usuarioCache.email,
                    cpf: usuarioCache.cpf,
                    telefone: usuarioCache.telefone,
                    data_nascimento: usuarioCache.data_nascimento,
                    papel: usuarioCache.papel,
                    cadastro_completo: usuarioCache.cadastro_completo === 1,
                    do_servidor: true // Marcar que veio do servidor
                };
            }
            stmt.free();
        } catch (e) {
            // Tabela não existe ainda, pular
            console.log('Tabela usuarios_cache não existe ainda');
        }
        
        // Se não encontrou no cache, buscar em usuarios_offline (cadastrados offline)
        if (!result) {
            stmt = this.db.prepare('SELECT * FROM usuarios_offline WHERE cpf = ? LIMIT 1');
            stmt.bind([cpfLimpo]);
            if (stmt.step()) {
                result = stmt.getAsObject();
                result.do_servidor = false;
            }
            stmt.free();
        }
        
        return result;
    }

    async obterUsuariosOffline() {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM usuarios_offline ORDER BY timestamp');
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    }

    async removerUsuarioOffline(tempId) {
        await this.init();
        const stmt = this.db.prepare('DELETE FROM usuarios_offline WHERE temp_id = ?');
        stmt.run([tempId]);
        stmt.free();
        this.salvar();
    }

    // ========== CHECK-INS OFFLINE ==========

    async adicionarCheckinOffline(cpf, eventoId, usuarioTempId = null, dadosUsuario = null) {
        await this.init();
        const stmt = this.db.prepare(`
            INSERT INTO checkins_offline (cpf, evento_id, usuario_temp_id, dados_usuario, inscricao_criada, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const cpfLimpo = cpf.replace(/\D/g, '');
        stmt.run([
            cpfLimpo,
            eventoId,
            usuarioTempId,
            dadosUsuario ? JSON.stringify(dadosUsuario) : null,
            dadosUsuario ? 1 : 0,
            new Date().toISOString()
        ]);
        stmt.free();
        this.salvar();
        // Retornar o último ID inserido
        const lastIdStmt = this.db.prepare('SELECT last_insert_rowid() as id');
        lastIdStmt.step();
        const result = lastIdStmt.getAsObject();
        lastIdStmt.free();
        return result.id;
    }

    async obterCheckinsOffline() {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM checkins_offline ORDER BY timestamp');
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            // Parse dados_usuario se existir
            if (row.dados_usuario) {
                try {
                    row.dados_usuario = JSON.parse(row.dados_usuario);
                } catch (e) {
                    console.error('Erro ao fazer parse de dados_usuario:', e);
                }
            }
            results.push(row);
        }
        stmt.free();
        return results;
    }

    async removerCheckinOffline(tempId) {
        await this.init();
        const stmt = this.db.prepare('DELETE FROM checkins_offline WHERE temp_id = ?');
        stmt.run([tempId]);
        stmt.free();
        this.salvar();
    }

    // ========== CACHE DE EVENTOS ==========

    async salvarEventosCache(eventos) {
        await this.init();
        
        // Limpar cache antigo
        const deleteStmt = this.db.prepare('DELETE FROM eventos_cache');
        deleteStmt.run();
        deleteStmt.free();
        
        // Inserir novos eventos
        const insertStmt = this.db.prepare(`
            INSERT INTO eventos_cache (
                id, titulo, descricao, data_inicio, data_fim, localizacao,
                capacidade_maxima, vagas_disponiveis, valor_inscricao, categoria,
                status, numero_participantes, data_atualizacao, dados_completos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const dataAtualizacao = new Date().toISOString();
        
        for (const evento of eventos) {
            insertStmt.run([
                evento.id,
                evento.titulo || '',
                evento.descricao || null,
                evento.data_inicio || '',
                evento.data_fim || '',
                evento.localizacao || null,
                evento.capacidade_maxima || null,
                evento.vagas_disponiveis || null,
                evento.valor_inscricao || 0,
                evento.categoria || null,
                evento.status || 'ativo',
                evento.numero_participantes || 0,
                dataAtualizacao,
                JSON.stringify(evento) // Salvar dados completos como JSON
            ]);
        }
        
        insertStmt.free();
        this.salvar();
    }

    async obterEventosCache() {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM eventos_cache ORDER BY data_inicio');
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            // Tentar restaurar dados completos do JSON
            if (row.dados_completos) {
                try {
                    const dadosCompletos = JSON.parse(row.dados_completos);
                    results.push(dadosCompletos);
                } catch (e) {
                    // Se falhar, usar dados da tabela
                    results.push(row);
                }
            } else {
                results.push(row);
            }
        }
        stmt.free();
        return results;
    }

    async obterEventoCachePorId(eventoId) {
        await this.init();
        const stmt = this.db.prepare('SELECT * FROM eventos_cache WHERE id = ? LIMIT 1');
        stmt.bind([eventoId]);
        let result = null;
        if (stmt.step()) {
            const row = stmt.getAsObject();
            // Tentar restaurar dados completos do JSON
            if (row.dados_completos) {
                try {
                    result = JSON.parse(row.dados_completos);
                } catch (e) {
                    result = row;
                }
            } else {
                result = row;
            }
        }
        stmt.free();
        return result;
    }

    // ========== CACHE DE USUÁRIOS DO SERVIDOR ==========

    // Salvar usuário do servidor no cache
    async salvarUsuarioCache(usuario) {
        await this.init();
        
        // Garantir que a tabela existe
        try {
            this.db.exec('SELECT 1 FROM usuarios_cache LIMIT 1');
        } catch (e) {
            // Tabela não existe, criar
            this.criarTabelasFaltantes(['usuarios_cache']);
        }
        
        const cpfLimpo = usuario.cpf ? usuario.cpf.replace(/\D/g, '') : null;
        
        if (!cpfLimpo) return;
        
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO usuarios_cache (
                id, nome, email, cpf, telefone, data_nascimento, papel, cadastro_completo, data_atualizacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
            usuario.id,
            usuario.nome || '',
            usuario.email || '',
            cpfLimpo,
            usuario.telefone || null,
            usuario.data_nascimento || null,
            usuario.papel || 'usuario',
            usuario.cadastro_completo ? 1 : 0,
            new Date().toISOString()
        ]);
        
        stmt.free();
        this.salvar();
    }

    // Salvar múltiplos usuários do servidor no cache
    async salvarUsuariosCache(usuarios) {
        await this.init();
        
        // Garantir que a tabela existe
        try {
            this.db.exec('SELECT 1 FROM usuarios_cache LIMIT 1');
        } catch (e) {
            // Tabela não existe, criar
            this.criarTabelasFaltantes(['usuarios_cache']);
        }
        
        // Limpar cache antigo (opcional - ou manter e atualizar)
        // const deleteStmt = this.db.prepare('DELETE FROM usuarios_cache');
        // deleteStmt.run();
        // deleteStmt.free();
        
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO usuarios_cache (
                id, nome, email, cpf, telefone, data_nascimento, papel, cadastro_completo, data_atualizacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const dataAtualizacao = new Date().toISOString();
        
        for (const usuario of usuarios) {
            const cpfLimpo = usuario.cpf ? usuario.cpf.replace(/\D/g, '') : null;
            if (!cpfLimpo) continue;
            
            stmt.run([
                usuario.id,
                usuario.nome || '',
                usuario.email || '',
                cpfLimpo,
                usuario.telefone || null,
                usuario.data_nascimento || null,
                usuario.papel || 'usuario',
                usuario.cadastro_completo ? 1 : 0,
                dataAtualizacao
            ]);
        }
        
        stmt.free();
        this.salvar();
    }

    // Buscar usuário no cache (servidor ou offline)
    async buscarUsuarioCachePorCpf(cpf) {
        return await this.buscarUsuarioOfflinePorCpf(cpf);
    }
}

const offlineDB = new OfflineDatabase();
