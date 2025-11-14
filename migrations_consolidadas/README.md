# Migrations Consolidadas

Estas são as migrations consolidadas, removendo contradições das migrations antigas (criar e depois deletar).

## Ordem de Execução

1. **001_initial_schema.sql** - Cria tabelas principais (credit_card_debts e loans) com TODAS as colunas necessárias
2. **002_create_negotiation_offers.sql** - Cria tabela de ofertas de negociação
3. **003_create_loan_attachments.sql** - Cria tabela de anexos de empréstimos
4. **004_create_income.sql** - Cria tabela de rendimentos
5. **005_create_savings_goals.sql** - Cria tabela de metas de quitação
6. **006_create_ai_conversations.sql** - Cria tabela de conversas com IA
7. **007_create_user_settings.sql** - Cria tabela de configurações do usuário
8. **008_secure_storage_buckets.sql** - Configura bucket de storage
9. **999_seed_data.sql** - Insere dados de backup (OPCIONAL - apenas se quiser restaurar dados)

## Mudanças em relação às migrations antigas

### Removido
- Migration 000 (drop tables) - não é necessária para banco novo
- Migration 002, 003, 005, 006 - consolidadas na 001
- Migration 010 (payment_plans) - removida pela 012 e 013
- Migration 013 (cleanup) - não necessária
- Migration 014 - context_key já incluído na 006

### Consolidado
- Todas as colunas de credit_card_debts estão na migration 001
- Todas as colunas de loans estão na migration 001
- Políticas RLS já configuradas corretamente desde o início

## Como usar

Execute as migrations em ordem no SQL Editor do Supabase:

```sql
-- Execute uma por vez, na ordem
\i 001_initial_schema.sql
\i 002_create_negotiation_offers.sql
\i 003_create_loan_attachments.sql
\i 004_create_income.sql
\i 005_create_savings_goals.sql
\i 006_create_ai_conversations.sql
\i 007_create_user_settings.sql
\i 008_secure_storage_buckets.sql

-- Opcional: restaurar dados
\i 999_seed_data.sql
```

Ou copie e cole o conteúdo de cada arquivo no SQL Editor.
