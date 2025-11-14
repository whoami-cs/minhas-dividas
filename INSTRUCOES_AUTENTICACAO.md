# Sistema de Autenticação Supabase

## Configuração Implementada

O sistema agora possui autenticação completa usando Supabase Auth.

### Funcionalidades

1. **Login**: Tela de autenticação com email e senha
2. **Recuperação de senha**: Link enviado por email
3. **Logout**: Botão para sair da conta
4. **Proteção de dados**: Cada usuário vê apenas seus próprios dados

### Criação de Usuários

Usuários devem ser criados diretamente no Supabase:

1. Acesse o painel do Supabase
2. Vá em **Authentication** > **Users**
3. Clique em **Add user** > **Create new user**
4. Insira email e senha
5. O usuário poderá fazer login na aplicação

### Configuração no Supabase

Execute a migration SQL no Supabase SQL Editor:

```sql
-- migrations/007_add_user_id_to_tables.sql
```

Esta migration:
- Adiciona coluna `user_id` às tabelas
- Atualiza as políticas RLS para filtrar dados por usuário
- Garante que cada usuário acesse apenas seus próprios dados

### Como Funciona

1. **Criação no Supabase**: Admin cria usuários no painel do Supabase
2. **Sem autenticação**: Usuário vê tela de login
3. **Após login**: Acesso completo ao dashboard e funcionalidades
4. **Dados isolados**: Cada usuário tem seus próprios cartões e empréstimos
5. **Sessão persistente**: Login mantido entre recarregamentos

### Arquivos Criados/Modificados

- `src/services/auth.service.ts` - Serviço de autenticação
- `src/components/auth/auth.component.ts` - Componente de login/cadastro
- `src/app.component.ts` - Integração com autenticação
- `src/services/data.service.ts` - Atualizado para incluir user_id
- `migrations/007_add_user_id_to_tables.sql` - Migration do banco

### Próximos Passos

1. Execute a migration no Supabase SQL Editor
2. Crie usuários no painel do Supabase (Authentication > Users)
3. Reinicie a aplicação
4. Faça login com as credenciais criadas
5. Seus dados estarão protegidos e isolados por usuário
