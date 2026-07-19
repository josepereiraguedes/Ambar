-- Adiciona a coluna categories na tabela store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'::TEXT[];

-- Atualiza com valores padrão se estiver vazio
UPDATE store_settings 
SET categories = ARRAY['Cano Alto', 'Cano Curto', 'Invisível', 'Social', 'Térmica', 'Esportiva', 'Compressão', 'Atacado']
WHERE categories IS NULL OR categories = '{}'::TEXT[];
