# Configuração de Segurança do Storage

## Objetivo
Garantir que apenas usuários autenticados possam fazer upload, visualizar e deletar arquivos no bucket do Supabase.

## Passos para Configurar

### 1. Acesse o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com/)
2. Acesse seu projeto
3. Vá para **Storage** no menu lateral

### 2. Configure o Bucket

#### Bucket: `attachments`
1. Se não existir, crie o bucket:
   - Clique em **New bucket**
   - Nome: `attachments`
   - **NÃO** marque "Public bucket"
   - Clique em **Create bucket**
2. Se já existir:
   - Clique no bucket `attachments`
   - Vá para **Policies**
   - Desabilite "Public bucket" se estiver habilitado

### 3. Execute o Script SQL

1. Vá para **SQL Editor** no menu lateral
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `secure_storage_buckets.sql`
4. Clique em **Run**

### 4. Verifique as Políticas

Após executar o script, verifique se as seguintes políticas foram criadas:

**Para `attachments`:**
- ✅ Authenticated users can upload
- ✅ Authenticated users can view
- ✅ Authenticated users can update
- ✅ Authenticated users can delete
- ✅ Authenticated users can view buckets

## Resultado

Após a configuração:
- ❌ Usuários não autenticados **NÃO** podem acessar os arquivos
- ✅ Usuários autenticados **PODEM** fazer upload, visualizar e deletar arquivos
- ✅ A API backend gerencia o acesso usando tokens de autenticação

## Testando

Para testar se está funcionando:

1. **Sem autenticação:** Tente acessar uma URL pública de um arquivo
   - Deve retornar erro 401 ou 403

2. **Com autenticação:** Use a API para fazer upload
   - Deve funcionar normalmente

## Troubleshooting

Se os uploads não funcionarem:

1. Verifique se RLS está habilitado:
   ```sql
   SELECT * FROM pg_tables WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

2. Verifique as políticas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   ```

3. Verifique se o bucket existe:
   ```sql
   SELECT * FROM storage.buckets;
   ```
