-- Adiciona a coluna contract_number na tabela loans
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS contract_number TEXT;

-- Cria um índice para melhorar a performance de busca por número de contrato
CREATE INDEX IF NOT EXISTS idx_loans_contract_number ON public.loans(contract_number);
