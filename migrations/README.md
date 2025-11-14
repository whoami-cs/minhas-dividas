# Migrations do Banco de Dados

Execute as migrations em ordem no SQL Editor do Supabase.

## Ordem de execução

### 1. Limpar banco (OPCIONAL - apenas se for recriar tudo)
```sql
-- 000_drop_tables.sql
```

### 2. Criar estrutura
```sql
-- 001_initial_schema.sql - Tabelas principais
-- 002_add_negotiation_fields.sql - Campos de negociação
-- 003_add_contract_number.sql - Número de contrato
-- 004_create_negotiation_offers.sql - Tabela de ofertas
-- 005_remove_offers_column.sql - Remove coluna offers
```

### 3. Popular dados (OPCIONAL)
```sql
-- 999_seed_data.sql - Dados iniciais
```

## Como executar

1. Acesse o SQL Editor no Supabase
2. Copie e cole cada arquivo SQL em ordem
3. Execute um por vez
4. Verifique se não há erros antes de prosseguir

## Migrations disponíveis

- `000_drop_tables.sql` - ⚠️ APAGA TUDO (use com cuidado)
- `001_initial_schema.sql` - Cria tabelas credit_card_debts e loans
- `002_add_negotiation_fields.sql` - Adiciona campos negotiated, discount_percentage, etc
- `003_add_contract_number.sql` - Adiciona contract_number em loans
- `004_create_negotiation_offers.sql` - Cria tabela negotiation_offers
- `005_remove_offers_column.sql` - Remove coluna offers de credit_card_debts
- `999_seed_data.sql` - Insere dados de exemplo
