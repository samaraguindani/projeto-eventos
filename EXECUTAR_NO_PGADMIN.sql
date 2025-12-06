-- Execute este script no pgAdmin conectado ao banco eventos_db
-- Copie e cole todo este conteúdo na janela de Query do pgAdmin e clique em Execute (F5)

-- 1. Adicionar campos
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS papel VARCHAR(20) DEFAULT 'usuario';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT TRUE;

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_papel ON usuarios(papel);

-- 3. Atualizar usuários existentes
UPDATE usuarios 
SET cadastro_completo = TRUE,
    papel = 'usuario'
WHERE papel IS NULL OR papel = '';

-- 4. Criar/Atualizar ADMIN (senha hasheada BCrypt para 'password')
INSERT INTO usuarios (nome, email, senha, cpf, papel, cadastro_completo, created_at)
VALUES (
    'Administrador',
    'admin@eventos.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '000.000.000-00',
    'admin',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET papel = 'admin', cpf = '000.000.000-00', senha = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- 5. Criar/Atualizar ATENDENTE (senha hasheada BCrypt para 'password')
INSERT INTO usuarios (nome, email, senha, cpf, papel, cadastro_completo, created_at)
VALUES (
    'Atendente',
    'atendente@eventos.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '000.000.000-01',
    'atendente',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET papel = 'atendente', cpf = '000.000.000-01', senha = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- 6. Verificar
SELECT 'Script executado com sucesso!' as status;

SELECT nome, email, papel, cadastro_completo, cpf 
FROM usuarios 
WHERE email IN ('admin@eventos.com', 'atendente@eventos.com')
ORDER BY papel;

-- CREDENCIAIS:
-- Admin: admin@eventos.com | Senha: password
-- Atendente: atendente@eventos.com | Senha: password

