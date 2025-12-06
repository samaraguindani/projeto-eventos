-- Script para adicionar CPF e criar usuário admin
-- Execute: psql -h localhost -U postgres -d eventos_db -f database/adicionar-cpf-e-admin.sql

-- 1. Adicionar campo CPF na tabela usuarios (se não existir)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE;

-- 2. Adicionar campo papel/role (admin, atendente, usuario)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS papel VARCHAR(20) DEFAULT 'usuario';

-- 3. Adicionar flag para indicar se cadastro está completo
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT TRUE;

-- 4. Criar índice no CPF para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);

-- 5. Criar índice no papel
CREATE INDEX IF NOT EXISTS idx_usuarios_papel ON usuarios(papel);

-- 6. Criar usuário ADMIN
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, cpf, papel, cadastro_completo, created_at)
VALUES (
    'Administrador',
    'admin@eventos.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: password
    '000.000.000-00',
    'admin',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET papel = 'admin', cpf = '000.000.000-00';

-- 7. Criar usuário ATENDENTE
INSERT INTO usuarios (nome, email, senha, cpf, papel, cadastro_completo, created_at)
VALUES (
    'Atendente',
    'atendente@eventos.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: password
    '000.000.000-01',
    'atendente',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET papel = 'atendente', cpf = '000.000.000-01';

-- 8. Atualizar usuários existentes para terem cadastro completo
UPDATE usuarios 
SET cadastro_completo = TRUE,
    papel = 'usuario'
WHERE papel IS NULL OR papel = '';

-- Confirmar
SELECT 
    'Script executado com sucesso!' as status,
    COUNT(*) FILTER (WHERE papel = 'admin') as admins,
    COUNT(*) FILTER (WHERE papel = 'atendente') as atendentes,
    COUNT(*) FILTER (WHERE papel = 'usuario') as usuarios
FROM usuarios;

-- Exibir credenciais
SELECT '=== CREDENCIAIS DE ACESSO ===' as info
UNION ALL
SELECT 'Admin - Email: admin@eventos.com | Senha: password'
UNION ALL  
SELECT 'Atendente - Email: atendente@eventos.com | Senha: password';

