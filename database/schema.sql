-- ============================================
-- SISTEMA DE EVENTOS - SCHEMA POSTGRESQL
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);

-- ============================================
-- TABELA: eventos
-- ============================================
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    localizacao VARCHAR(255),
    capacidade_maxima INTEGER,
    vagas_disponiveis INTEGER,
    valor_inscricao DECIMAL(10, 2) DEFAULT 0.00,
    categoria VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativo', -- ativo, cancelado, finalizado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_status ON eventos(status);

-- ============================================
-- TABELA: inscricoes
-- ============================================
CREATE TABLE IF NOT EXISTS inscricoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ativa', -- ativa, cancelada, confirmada
    presenca_registrada BOOLEAN DEFAULT FALSE,
    data_presenca TIMESTAMP,
    codigo_inscricao VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, evento_id)
);

CREATE INDEX idx_inscricoes_usuario ON inscricoes(usuario_id);
CREATE INDEX idx_inscricoes_evento ON inscricoes(evento_id);
CREATE INDEX idx_inscricoes_codigo ON inscricoes(codigo_inscricao);
CREATE INDEX idx_inscricoes_status ON inscricoes(status);

-- ============================================
-- TABELA: certificados
-- ============================================
CREATE TABLE IF NOT EXISTS certificados (
    id SERIAL PRIMARY KEY,
    inscricao_id INTEGER NOT NULL REFERENCES inscricoes(id) ON DELETE CASCADE,
    codigo_validacao VARCHAR(100) UNIQUE NOT NULL,
    caminho_arquivo VARCHAR(500),
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificados_inscricao ON certificados(inscricao_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_validacao);

-- ============================================
-- TABELA: email_queue
-- ============================================
CREATE TABLE IF NOT EXISTS email_queue (
    id SERIAL PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- inscricao, cancelamento, checkin, certificado
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, sent, failed
    tentativas INTEGER DEFAULT 0,
    erro TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processado_at TIMESTAMP
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_tipo ON email_queue(tipo);

-- ============================================
-- TABELA: logs
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo VARCHAR(10) NOT NULL,
    url VARCHAR(500) NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    status_code INTEGER,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    response_time INTEGER, -- em milissegundos
    request_body TEXT,
    response_body TEXT
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_status_code ON logs(status_code);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscricoes_updated_at BEFORE UPDATE ON inscricoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de inscrição único
CREATE OR REPLACE FUNCTION gerar_codigo_inscricao()
RETURNS VARCHAR(50) AS $$
DECLARE
    codigo VARCHAR(50);
BEGIN
    codigo := 'INS-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar código de validação de certificado
CREATE OR REPLACE FUNCTION gerar_codigo_validacao()
RETURNS VARCHAR(100) AS $$
DECLARE
    codigo VARCHAR(100);
BEGIN
    codigo := 'CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CURRENT_TIMESTAMP::TEXT) FROM 1 FOR 32));
    RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar vagas disponíveis quando houver inscrição
CREATE OR REPLACE FUNCTION atualizar_vagas_evento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ativa' THEN
        UPDATE eventos 
        SET vagas_disponiveis = vagas_disponiveis - 1
        WHERE id = NEW.evento_id AND vagas_disponiveis > 0;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'ativa' AND NEW.status = 'cancelada' THEN
            UPDATE eventos 
            SET vagas_disponiveis = vagas_disponiveis + 1
            WHERE id = NEW.evento_id;
        ELSIF OLD.status = 'cancelada' AND NEW.status = 'ativa' THEN
            UPDATE eventos 
            SET vagas_disponiveis = vagas_disponiveis - 1
            WHERE id = NEW.evento_id AND vagas_disponiveis > 0;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_vagas 
    AFTER INSERT OR UPDATE ON inscricoes
    FOR EACH ROW EXECUTE FUNCTION atualizar_vagas_evento();

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir eventos de exemplo
INSERT INTO eventos (titulo, descricao, data_inicio, data_fim, localizacao, capacidade_maxima, vagas_disponiveis, valor_inscricao, categoria, status)
VALUES 
    ('Workshop de Desenvolvimento Web', 'Workshop completo sobre desenvolvimento web moderno', 
     CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP + INTERVAL '30 days' + INTERVAL '4 hours',
     'Auditório Principal', 50, 50, 0.00, 'Tecnologia', 'ativo'),
    
    ('Conferência de Inteligência Artificial', 'Palestras sobre IA e Machine Learning', 
     CURRENT_TIMESTAMP + INTERVAL '45 days', CURRENT_TIMESTAMP + INTERVAL '45 days' + INTERVAL '8 hours',
     'Centro de Convenções', 200, 200, 150.00, 'Tecnologia', 'ativo'),
    
    ('Curso de Gestão de Projetos', 'Curso prático sobre metodologias ágeis', 
     CURRENT_TIMESTAMP + INTERVAL '60 days', CURRENT_TIMESTAMP + INTERVAL '60 days' + INTERVAL '6 hours',
     'Sala de Treinamento', 30, 30, 200.00, 'Negócios', 'ativo')
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para inscrições com detalhes
CREATE OR REPLACE VIEW vw_inscricoes_detalhadas AS
SELECT 
    i.id,
    i.codigo_inscricao,
    i.data_inscricao,
    i.status,
    i.presenca_registrada,
    i.data_presenca,
    u.id as usuario_id,
    u.nome as usuario_nome,
    u.email as usuario_email,
    e.id as evento_id,
    e.titulo as evento_titulo,
    e.data_inicio as evento_data_inicio,
    e.data_fim as evento_data_fim,
    e.localizacao as evento_localizacao
FROM inscricoes i
INNER JOIN usuarios u ON i.usuario_id = u.id
INNER JOIN eventos e ON i.evento_id = e.id;

-- View para estatísticas de eventos
CREATE OR REPLACE VIEW vw_estatisticas_eventos AS
SELECT 
    e.id,
    e.titulo,
    e.capacidade_maxima,
    e.vagas_disponiveis,
    COUNT(i.id) FILTER (WHERE i.status = 'ativa') as total_inscricoes_ativas,
    COUNT(i.id) FILTER (WHERE i.presenca_registrada = TRUE) as total_presencas,
    COUNT(c.id) as total_certificados_emitidos
FROM eventos e
LEFT JOIN inscricoes i ON e.id = i.evento_id
LEFT JOIN certificados c ON i.id = c.inscricao_id
GROUP BY e.id, e.titulo, e.capacidade_maxima, e.vagas_disponiveis;





