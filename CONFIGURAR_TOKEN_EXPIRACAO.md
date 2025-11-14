# Configurar Expiração do Token JWT para 1 Dia

A expiração do token JWT do Supabase é configurada no painel do Supabase.

## Passos para Configurar

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem no menu lateral)
4. Clique em **Auth** no menu lateral de configurações
5. Procure por **JWT Expiry** ou **Access Token Lifetime**
6. Altere o valor para **86400** (segundos = 1 dia)
7. Clique em **Save** para salvar

**Nota:** Se não encontrar essa opção no painel, a expiração do token é controlada pelo Supabase e não pode ser alterada diretamente. Neste caso, o sistema de refresh automático que implementamos garante que o usuário não precise fazer login novamente.

## Valores de Referência

- 1 hora = 3600 segundos (padrão do Supabase)
- 1 dia = 86400 segundos
- 7 dias = 604800 segundos
- 30 dias = 2592000 segundos

## Observações

- Após alterar, os novos tokens gerados terão a nova expiração
- Tokens já emitidos continuarão com a expiração antiga até expirarem
- O refresh token continua válido por mais tempo (padrão: 30 dias)
- Com o interceptor implementado, o sistema fará refresh automático quando o token expirar
