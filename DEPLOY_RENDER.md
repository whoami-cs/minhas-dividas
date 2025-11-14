# Deploy no Render - Guia Completo

## 1. Preparar Repositório

O arquivo `render.yaml` já está configurado! Ele vai criar:
- ✅ Backend API (Node.js/Express)
- ✅ Frontend (Angular)
- ✅ Cron Job (consulta diária às 9h BRT)

## 2. Deploy no Render

### Passo 1: Criar conta
1. Acesse https://render.com/
2. Clique em "Get Started for Free"
3. Conecte com GitHub

### Passo 2: Criar Blueprint
1. No dashboard, clique em "New +"
2. Selecione "Blueprint"
3. Conecte seu repositório `minhas-dividas`
4. O Render vai detectar automaticamente o `render.yaml`
5. Clique em "Apply"

### Passo 3: Configurar Variáveis de Ambiente

O Render vai pedir as variáveis. Configure:

**Para o Backend (minhas-dividas-api):**
- `DATABASE_URL` = URL do PostgreSQL do Supabase
- `SUPABASE_URL` = https://seu-projeto.supabase.co
- `SUPABASE_KEY` = sua chave anônima (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = sua service role key
- `GEMINI_API_KEYS` = suas chaves da API Gemini (separadas por vírgula)

**Para o Cron Job:**
- `SUPABASE_URL` = mesma URL acima
- `SUPABASE_KEY` = mesma chave acima

### Passo 4: Atualizar URL da API no Frontend

Após o deploy do backend, você receberá uma URL tipo:
`https://minhas-dividas-api.onrender.com`

Atualize o arquivo `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  apiUrl: 'https://minhas-dividas-api.onrender.com/api'
};
```

Commit e push:
```bash
git add src/environments/environment.prod.ts
git commit -m "update: api url production"
git push origin main
```

O Render vai fazer redeploy automático!

## 3. Verificar Deploy

Após alguns minutos:
- **Frontend:** `https://minhas-dividas-frontend.onrender.com`
- **Backend:** `https://minhas-dividas-api.onrender.com/api/health`
- **Cron Job:** Executa automaticamente todo dia às 12:00 UTC (9h BRT)

## 4. Importante - Free Tier

⚠️ **Serviços gratuitos do Render "dormem" após 15 minutos de inatividade**

Soluções:
1. **UptimeRobot** (gratuito) - Faz ping a cada 5 minutos
   - Acesse https://uptimerobot.com/
   - Adicione sua URL do backend
   - Mantém o serviço sempre ativo

2. **Cron-job.org** (gratuito)
   - Acesse https://cron-job.org/
   - Configure ping a cada 10 minutos

## 5. Monitoramento

No dashboard do Render você pode:
- Ver logs em tempo real
- Monitorar uso de recursos
- Ver histórico de deploys
- Configurar notificações

## 6. Custos

**Render Free Tier:**
- 750 horas/mês por serviço
- 100 GB bandwidth/mês
- Deploy ilimitados
- HTTPS gratuito
- Cron Jobs incluídos

Tudo gratuito! 🎉

## Troubleshooting

### Build falha
- Verifique os logs no dashboard
- Certifique-se que `npm run build` funciona localmente

### Backend não conecta ao Supabase
- Verifique se as variáveis de ambiente estão corretas
- Teste a conexão nos logs

### Frontend não conecta ao Backend
- Verifique se a URL da API está correta no `environment.prod.ts`
- Certifique-se que o backend está rodando

### Serviço muito lento
- É normal na primeira requisição (cold start)
- Use UptimeRobot para manter ativo
