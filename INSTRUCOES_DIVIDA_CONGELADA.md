# Controle de Dívidas Congeladas

## O que foi implementado

Foi adicionado um controle para indicar quando uma dívida para de crescer (juros congelados). Quando uma dívida está marcada como "congelada", o campo de estimativa do próximo mês é automaticamente zerado.

## Como usar

### 1. Executar a Migration no Supabase

Acesse o **SQL Editor** no painel do Supabase e execute o script da migration `006_add_frozen_field.sql`:

```sql
ALTER TABLE public.credit_card_debts 
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.credit_card_debts.is_frozen IS 'Indica se a dívida parou de crescer (juros congelados)';
```

### 2. Marcar uma dívida como congelada

No formulário de adicionar/editar dívida, você verá um novo checkbox:

- **"Dívida congelada (não cresce mais)"**

Marque este checkbox quando:
- A dívida foi negociada e os juros foram congelados
- O banco parou de cobrar juros adicionais
- A dívida não está mais crescendo por qualquer motivo

### 3. Comportamento

Quando uma dívida está marcada como congelada:

1. ❄️ O campo **"Estimativa próximo mês"** será automaticamente zerado
2. 🏷️ Um badge azul **"Congelada"** aparecerá no card da dívida
3. 📊 A estimativa total do próximo mês (no rodapé) não incluirá essa dívida
4. 📈 O percentual de crescimento e valor dos juros continuam sendo calculados normalmente (histórico)

### 4. Indicadores visuais

- **Badge verde "Negociado"**: Dívida foi negociada
- **Badge azul "Congelada"**: Dívida parou de crescer
- **Badge cinza com %**: Dívida ativa com crescimento normal

Uma dívida pode ter ambos os badges (negociada E congelada) ao mesmo tempo.

## Exemplo de uso

**Cenário**: Você negociou com o Nubank e eles congelaram os juros da sua dívida.

1. Abra a dívida do Nubank para editar
2. Marque o checkbox **"Negociado"**
3. Marque o checkbox **"Dívida congelada (não cresce mais)"**
4. Preencha os campos de desconto e valor pago (se aplicável)
5. Salve

Resultado: A dívida aparecerá com os badges "Negociado" e "Congelada", e a estimativa do próximo mês será R$ 0,00.

## Observações

- Dívidas congeladas ainda aparecem no total atual
- Apenas a estimativa futura é zerada
- Você pode desmarcar o checkbox a qualquer momento se a dívida voltar a crescer
