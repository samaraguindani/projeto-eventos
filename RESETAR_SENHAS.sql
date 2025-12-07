-- Resetar senhas para funcionarem com o backend .NET
-- Execute no pgAdmin

-- Primeiro, vamos ver quais usuários existem
SELECT id, nome, email, papel FROM usuarios;

-- OPÇÃO 1: Deletar admin e atendente antigos e deixar o sistema recriar
-- DELETE FROM usuarios WHERE email IN ('admin@eventos.com', 'atendente@eventos.com');

-- OPÇÃO 2: Atualizar apenas os papéis dos usuários existentes
-- Primeiro usuário vira admin
UPDATE usuarios SET papel = 'admin', cpf = '000.000.000-00' WHERE id = 1;

-- Se você tiver um segundo usuário, ele vira atendente
-- UPDATE usuarios SET papel = 'atendente', cpf = '000.000.000-01' WHERE id = 2;

-- Verificar resultado
SELECT id, nome, email, papel, cpf FROM usuarios ORDER BY id;



