-- Garante que a coluna categories seja TEXT[] (corrige se foi criada como TEXT anteriormente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_settings' 
      AND column_name = 'categories' 
      AND data_type = 'text'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE store_settings ALTER COLUMN categories TYPE TEXT[] USING string_to_array(categories, ',');
  END IF;
END $$;

ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'::TEXT[];

-- Corrige categorias que vieram como array de 1 elemento com vírgulas (ex: "Cano Alto,Cano Curto")
UPDATE store_settings 
SET categories = string_to_array(categories[1], ',')
WHERE categories IS NOT NULL 
  AND array_length(categories, 1) = 1 
  AND categories[1] LIKE '%,%';

-- Remove espaços extras ao redor de cada categoria
UPDATE store_settings 
SET categories = (
  SELECT array_agg(trim(unnested)) 
  FROM unnest(categories) AS unnested
)
WHERE categories IS NOT NULL;

-- Atualiza com valores padrão se estiver vazio
UPDATE store_settings 
SET categories = ARRAY['Cano Alto', 'Cano Curto', 'Invisível', 'Social', 'Térmica', 'Esportiva', 'Compressão', 'Atacado']
WHERE categories IS NULL OR categories = '{}'::TEXT[];

-- Colunas para seção de informações abaixo do banner (mantidas para compatibilidade)
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS banner_info1 TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS banner_info2 TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS banner_info3 TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS banner_info_icon1 TEXT DEFAULT 'Truck',
ADD COLUMN IF NOT EXISTS banner_info_icon2 TEXT DEFAULT 'Clock',
ADD COLUMN IF NOT EXISTS banner_info_icon3 TEXT DEFAULT 'Shield';

-- Array dinâmico de informações do banner (JSONB)
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS banner_info_items JSONB DEFAULT '[]'::jsonb;

-- Migra dados antigos para o novo formato
UPDATE store_settings
SET banner_info_items = (
  SELECT jsonb_agg(item) FROM (
    SELECT jsonb_build_object('text', banner_info1, 'icon', COALESCE(banner_info_icon1, 'Truck')) AS item
    WHERE banner_info1 IS NOT NULL AND banner_info1 != ''
    UNION ALL
    SELECT jsonb_build_object('text', banner_info2, 'icon', COALESCE(banner_info_icon2, 'Clock'))
    WHERE banner_info2 IS NOT NULL AND banner_info2 != ''
    UNION ALL
    SELECT jsonb_build_object('text', banner_info3, 'icon', COALESCE(banner_info_icon3, 'Shield'))
    WHERE banner_info3 IS NOT NULL AND banner_info3 != ''
  ) sub
)
WHERE (banner_info_items IS NULL OR banner_info_items = '[]'::jsonb)
  AND (banner_info1 IS NOT NULL AND banner_info1 != '');

-- Terceira informação do rodapé
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS footer_info3 TEXT DEFAULT '';

-- Carrossel de banners (JSONB: array de {imageUrl})
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS banners JSONB DEFAULT '[]'::jsonb;

-- Migra banner antigo para o novo formato se existir
UPDATE store_settings
SET banners = CASE 
  WHEN banner_image_url IS NOT NULL AND banner_image_url != '' THEN
    jsonb_build_array(jsonb_build_object('imageUrl', banner_image_url))
  ELSE
    '[]'::jsonb
  END
WHERE (banners IS NULL OR banners = '[]'::jsonb) AND banner_image_url IS NOT NULL AND banner_image_url != '';

-- ============================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================

-- Habilita RLS na tabela store_settings (se ainda não estiver)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Permite SELECT para qualquer um (catálogo público)
DROP POLICY IF EXISTS "Select para todos" ON store_settings;
CREATE POLICY "Select para todos" ON store_settings
  FOR SELECT
  USING (true);

-- Permite UPDATE/INSERT/DELETE apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Admin pode modificar" ON store_settings;
CREATE POLICY "Admin pode modificar" ON store_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- POLÍTICAS DE STORAGE (bucket "images")
-- ============================================================

-- Permite leitura pública das imagens
DROP POLICY IF EXISTS "Público pode ler" ON storage.objects;
CREATE POLICY "Público pode ler" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Permite upload para usuários autenticados (admin)
DROP POLICY IF EXISTS "Autenticado pode inserir" ON storage.objects;
CREATE POLICY "Autenticado pode inserir" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );

-- Permite deletar para usuários autenticados (admin)
DROP POLICY IF EXISTS "Autenticado pode deletar" ON storage.objects;
CREATE POLICY "Autenticado pode deletar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );
