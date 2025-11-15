# Deploy no Cloudflare Workers

## Passos para deploy:

### 1. Instalar Wrangler
```bash
npm install -g wrangler
```

### 2. Login no Cloudflare
```bash
wrangler login
```

### 3. Configurar secrets
```bash
wrangler secret put SUPABASE_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put GEMINI_API_KEYS
```

### 4. Build do frontend
```bash
npm run build
```

### 5. Deploy
```bash
wrangler deploy
```

## Estrutura:
- `/worker` - Código do Cloudflare Worker (API)
- `/dist/browser` - Build do Angular (Frontend)
- `wrangler.toml` - Configuração do Worker

## URLs após deploy:
- Frontend e API: https://minhasdividas.{seu-subdominio}.workers.dev
