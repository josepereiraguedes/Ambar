/**
 * Script de migração do banco de dados Supabase.
 * 
 * Como usar:
 * 1. Vá em https://supabase.com/dashboard/project/scymudgqdvqqcqsddvhm/sql/new
 * 2. Copie e cole o conteúdo do arquivo supabase-migration.sql
 * 3. Clique em "Run"
 * 
 * OU (se tiver a senha do banco):
 *   DATABASE_URL="postgresql://postgres:SUA_SENHA@db.scymudgqdvqqcqsddvhm.supabase.co:5432/postgres" node scripts/migrate.cjs
 */

const sql = `
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'::TEXT[];

UPDATE store_settings 
SET categories = ARRAY['Cano Alto', 'Cano Curto', 'Invisível', 'Social', 'Térmica', 'Esportiva', 'Compressão', 'Atacado']
WHERE categories IS NULL OR categories = '{}'::TEXT[];
`;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  const { Client } = require('pg');
  const client = new Client({ connectionString: dbUrl });
  client.connect().then(() => {
    console.log('Conectado ao banco. Executando migração...');
    return client.query(sql);
  }).then(() => {
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  }).catch(err => {
    console.error('Erro na migração:', err.message);
    process.exit(1);
  });
} else {
  console.log('=== SQL DE MIGRAÇÃO ===');
  console.log(sql);
  console.log('=======================');
  console.log('\nDefina DATABASE_URL ou acesse o SQL Editor do Supabase para executar este SQL.');
}
