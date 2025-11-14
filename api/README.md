# API - Gerenciador de Dívidas

API REST com migrations automáticas.

## Configuração

1. **Instalar dependências:**
```bash
cd api
npm install
```

2. **Configurar .env:**

Obtenha a senha do banco:
- Acesse Project Settings → Database → Database Password
- Use a senha que você criou ao criar o projeto

```env
PORT=3001
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon
DB_PASSWORD=sua_senha_do_banco
```

## Executar

```bash
npm run dev
```

As migrations serão executadas automaticamente ao iniciar!

## Migrations

- Migrations em `migrations/` são executadas automaticamente
- Ordem: 001, 002, 003, etc
- Ignora: 000 (drop) e 999 (seed)
- Registra execução na tabela `migrations`

## Endpoints

- `GET /api/debts` - Dívidas
- `GET /api/loans` - Empréstimos  
- `GET /api/negotiation-offers/debt/:id` - Ofertas
