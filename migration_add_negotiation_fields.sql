-- Adicionar novos campos à tabela credit_card_debts
ALTER TABLE public.credit_card_debts
ADD COLUMN IF NOT EXISTS negotiated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS paid_value NUMERIC,
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Criar bucket para armazenar comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('debt-receipts', 'debt-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Política de acesso público para leitura
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'debt-receipts');

-- Política de acesso para upload
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'debt-receipts');

-- Política de acesso para atualização
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'debt-receipts');

-- Política de acesso para exclusão
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'debt-receipts');
