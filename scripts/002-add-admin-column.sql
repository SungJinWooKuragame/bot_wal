-- Adicionar coluna is_admin na tabela users
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Tornar o primeiro usuário admin (ajuste o discord_id para o seu)
-- UPDATE users SET is_admin = TRUE WHERE discord_id = 'SEU_DISCORD_ID_AQUI';
