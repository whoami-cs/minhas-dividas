-- Remove a coluna offers da tabela credit_card_debts
ALTER TABLE public.credit_card_debts 
DROP COLUMN IF EXISTS offers;
