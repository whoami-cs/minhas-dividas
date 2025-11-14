# Instruções - Anexos de Empréstimos

## Funcionalidade Implementada

Foi implementado um sistema completo de anexos para empréstimos, similar ao sistema de comprovantes dos cartões de crédito. Agora é possível:

1. **Anexar múltiplos arquivos** a cada empréstimo (PDFs, imagens, documentos)
2. **Importar PDF via IA** e automaticamente vincular o arquivo como anexo
3. **Visualizar anexos** diretamente no painel de detalhes do empréstimo
4. **Excluir anexos** quando necessário

## Arquivos Modificados/Criados

### 1. Migration
- `migrations/016_create_loan_attachments.sql` - Cria tabela de anexos

### 2. Models
- `src/models/debt.model.ts` - Adicionada interface `LoanAttachment`

### 3. Services
- `src/services/data.service.ts` - Métodos para gerenciar anexos:
  - `uploadLoanAttachment()` - Upload de arquivo
  - `fetchLoanAttachments()` - Buscar anexos de um empréstimo
  - `deleteLoanAttachment()` - Excluir anexo

### 4. Components
- `src/components/loan-detail/loan-detail.component.ts` - Seção de anexos no detalhe
- `src/components/loans/loans.component.ts` - Salva PDF importado como anexo

## Como Usar

### 1. Executar a Migration

Execute a migration no SQL Editor do Supabase:

```sql
-- Copie e cole o conteúdo do arquivo:
-- migrations/016_create_loan_attachments.sql
```

### 2. Configurar Storage (se ainda não existir)

No Supabase, vá em **Storage** e verifique se o bucket `debt-receipts` existe. Se não existir, crie-o:

1. Vá para **Storage** no painel do Supabase
2. Clique em **New bucket**
3. Nome: `debt-receipts`
4. Marque como **Public bucket**
5. Clique em **Create bucket**

### 3. Usar a Funcionalidade

#### Importar PDF com IA
1. Na tela de empréstimos, clique em **Importar PDF**
2. Selecione o arquivo PDF do contrato
3. A IA extrairá os dados automaticamente
4. Ao salvar, o PDF será anexado ao empréstimo

#### Adicionar Anexos Manualmente
1. Abra os detalhes de um empréstimo
2. Na seção **Anexos**, clique em **Adicionar anexo**
3. Selecione o arquivo (PDF, imagem, documento)
4. O arquivo será enviado e listado

#### Visualizar Anexos
1. Na seção de anexos, clique em **Ver** no anexo desejado
2. O arquivo será exibido em um modal
3. PDFs e imagens são visualizados diretamente

#### Excluir Anexos
1. Clique no ícone de lixeira no anexo
2. Confirme a exclusão
3. O arquivo será removido do storage e do banco

## Estrutura da Tabela

```sql
loan_attachments (
  id BIGINT PRIMARY KEY,
  created_at TIMESTAMP,
  loan_id BIGINT REFERENCES loans(id),
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  description TEXT,
  user_id UUID
)
```

## Tipos de Arquivo Suportados

- **PDFs**: `.pdf`
- **Imagens**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Documentos**: `.doc`, `.docx`

## Observações

- Os anexos são armazenados no bucket `debt-receipts` do Supabase Storage
- Cada anexo é vinculado a um empréstimo específico via `loan_id`
- Quando um empréstimo é excluído, seus anexos também são excluídos (CASCADE)
- O PDF importado via IA é automaticamente salvo como anexo com a descrição "Contrato importado via IA"
- Os anexos são carregados automaticamente ao abrir os detalhes de um empréstimo

## Exemplo de Uso

```typescript
// Upload de anexo
const attachment = await dataService.uploadLoanAttachment(
  file,
  loanId,
  'Descrição opcional'
);

// Buscar anexos
const attachments = await dataService.fetchLoanAttachments(loanId);

// Excluir anexo
await dataService.deleteLoanAttachment(attachmentId, fileUrl);
```
