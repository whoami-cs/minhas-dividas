# Deploy no Netlify - Guia Completo

## 1. Preparar o Projeto

Já está tudo configurado! Os arquivos criados:
- `netlify.toml` - Configuração do Netlify
- `netlify/functions/daily-query.mts` - Função que executa diariamente às 9h (BRT)

## 2. Deploy no Netlify

### Opção A: Via GitHub (Recomendado)

1. **Criar repositório no GitHub:**
   - Vá em https://github.com/new
   - Crie um novo repositório
   - No terminal, execute:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

2. **Conectar ao Netlify:**
   - Acesse https://app.netlify.com/
   - Clique em "Add new site" > "Import an existing project"
   - Escolha "GitHub" e autorize
   - Selecione seu repositório
   - Configure:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Clique em "Deploy site"

### Opção B: Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 3. Configurar Variáveis de Ambiente

No painel do Netlify:
1. Vá em **Site settings** > **Environment variables**
2. Adicione as variáveis:
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_ANON_KEY` = sua chave anônima do Supabase

## 4. Ativar Scheduled Functions

1. No painel do Netlify, vá em **Functions**
2. Você verá a função `daily-query` listada
3. Ela executará automaticamente todo dia às 12:00 UTC (9h BRT)
4. Para testar manualmente, clique na função e em "Trigger function"

## 5. Verificar Deploy

Após o deploy:
- Seu site estará disponível em: `https://seu-site.netlify.app`
- A função rodará automaticamente todos os dias
- Você pode ver os logs em **Functions** > **daily-query** > **Function log**

## 6. Domínio Personalizado (Opcional)

1. Vá em **Domain settings**
2. Clique em "Add custom domain"
3. Siga as instruções para configurar seu domínio

## Troubleshooting

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Certifique-se que `npm run build` funciona localmente

### Função não executa
- Verifique se as variáveis de ambiente estão configuradas
- Veja os logs em **Functions** > **Function log**

### Rotas não funcionam
- O arquivo `netlify.toml` já está configurado com redirects para SPA

## Custos

- **Netlify Free Tier:**
  - 100 GB de bandwidth/mês
  - 300 minutos de build/mês
  - Scheduled Functions incluídas
  - HTTPS gratuito
  - Deploy ilimitados

Tudo gratuito para seu caso de uso! 🎉
