-- Execute no pgAdmin para tornar SEU usuário atual em ADMIN ou ATENDENTE

-- 1. Ver todos os usuários
SELECT id, nome, email, papel, cpf FROM usuarios ORDER BY id;

-- 2. ESCOLHA UMA OPÇÃO:

-- OPÇÃO A: Tornar o primeiro usuário (ID=1) em ADMIN
UPDATE usuarios 
SET papel = 'admin', cpf = '000.000.000-00'
WHERE id = 1;

-- OPÇÃO B: Tornar o primeiro usuário (ID=1) em ATENDENTE
-- UPDATE usuarios 
-- SET papel = 'atendente', cpf = '000.000.000-01'
-- WHERE id = 1;

-- 3. Verificar
SELECT id, nome, email, papel, cpf FROM usuarios ORDER BY id;

-- Agora faça login com SEU email e senha normal!
-- O sistema detectará que você é admin/atendente e mostrará os botões corretos

