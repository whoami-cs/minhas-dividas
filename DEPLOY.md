# 🚀 Guia de Deploy - Vercel + Render

## ⚠️ PRÉ-REQUISITOS

Você precisa ter:
- ✅ Código no GitHub: https://github.com/whoami-cs/minhas-dividas
- ✅ Conta Vercel (gratuita): https://vercel.com
- ✅ Conta Render (gratuita, requer cartão): https://render.com
- ✅ Credenciais Supabase
- ✅ API Key Google Gemini

---

## 📦 PASSO 1: Deploy do Backend (Render)

### 1.1 - Criar Web Service
1. Acesse: https://dashboard.render.com/create?type=web
2. Clique em **"Connect GitHub"** e autorize
3. Selecione o repositório: **minhas-dividas**
4. Configure:

```
Name: minhasdividas-api
Region: Oregon (US West)
Branch: main
Root Directory: api
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### 1.2 - Adicionar Variáveis de Ambiente

Clique em **"Advanced"** e adicione:

```
GEMINI_API_KEYS=sua_chave_gemini_aqui
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_supabase
NODE_ENV=production
PORT=3001
```

### 1.3 - Criar Serviço
- Clique em **"Create Web Service"**
- Aguarde 3-5 minutos
- Copie a URL gerada (ex: https://minhasdividas-api.onrender.com)

---

## 🌐 PASSO 2: Deploy do Frontend (Vercel)

### 2.1 - Importar Projeto
1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione: **whoami-cs/minhas-dividas**
4. Configure:

```
Framework Preset: Angular
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.2 - Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
VITE_API_URL=https://minhasdividas-api.onrender.com/api
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

⚠️ **IMPORTANTE**: Use a URL do Render do Passo 1.3

### 2.3 - Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- Acesse a URL gerada (ex: https://minhas-dividas.vercel.app)

---

## ✅ PASSO 3: Testar

### 3.1 - Testar Backend
Abra no navegador:
```
https://minhasdividas-api.onrender.com/api/health
```
Deve retornar: `{"status": "ok"}`

### 3.2 - Testar Frontend
Abra no navegador:
```
https://minhas-dividas.vercel.app
```
Teste:
- ✅ Login/Cadastro
- ✅ Criar dívida
- ✅ Chat AI
- ✅ Upload de arquivo

---

## 🔧 TROUBLESHOOTING

### Backend não inicia
- Verifique logs: https://dashboard.render.com
- Confirme todas as variáveis de ambiente
- Verifique se o branch está correto (main)

### Frontend não conecta ao backend
- Verifique se `VITE_API_URL` está correto na Vercel
- Teste a URL do backend diretamente
- Verifique console do navegador (F12)

### Erro de CORS
- O CORS já está configurado para aceitar todas as origens
- Se precisar restringir, edite `api/src/server.js`

---

## 📝 PRÓXIMOS PASSOS

### Domínio Customizado (Opcional)
- **Vercel**: Settings → Domains → Add Domain
- **Render**: Settings → Custom Domain

### Monitoramento
- Configure notificações de deploy em ambas plataformas
- Monitore logs regularmente

### Backup
- Configure backup automático do Supabase
- Exporte dados importantes regularmente

---

## 🎉 PRONTO!

Seu projeto está no ar:
- **Frontend**: https://minhas-dividas.vercel.app
- **Backend**: https://minhasdividas-api.onrender.com

Qualquer dúvida, consulte os logs das plataformas.
