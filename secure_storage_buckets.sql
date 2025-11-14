-- Script para configurar segurança do bucket de storage
-- Execute este script no SQL Editor do Supabase

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Public access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- BUCKET: attachments (todos os arquivos)

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can view"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can view buckets"
ON storage.buckets FOR SELECT
TO authenticated
USING (true);
