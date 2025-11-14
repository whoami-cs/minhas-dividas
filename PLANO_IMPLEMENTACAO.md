# Plano de Implementação - Gestão de Rendimentos e Planejamento com IA

## Visão Geral
Adicionar funcionalidades de gestão de rendimentos e planejamento de quitação de dívidas com assistência de IA (Gemini).

---

## FASE 1: Estrutura de Rendimentos ✅ (CONCLUÍDA)

### 1.1 Banco de Dados
- [x] Criar migration `009_create_income.sql`
- [ ] Executar migration no Supabase (MANUAL)

### 1.2 Backend API
- [x] Criar `api/src/controllers/incomeController.js`
- [x] Criar `api/src/routes/income.js`
- [x] Registrar rota no `server.js`

### 1.3 Frontend - Model
- [x] Adicionar interface `Income` em `src/models/debt.model.ts`

### 1.4 Frontend - Service
- [x] Adicionar métodos de income em `src/services/data.service.ts`:
  - `income = signal<Income[]>([])`
  - `fetchIncome()`
  - `addIncome()`
  - `updateIncome()`
  - `deleteIncome()`

### 1.5 Frontend - Componente
- [x] Criar `src/components/income/income.component.ts`
  - Listagem em cards
  - Modal de formulário
  - Filtros e ordenação
  - Totalizadores

### 1.6 Integração
- [x] Adicionar 'income' ao view signal em `app.component.ts`
- [x] Adicionar botão de navegação no menu
- [x] Adicionar rota no template

---

## FASE 2: Planejamento de Quitação ✅ (CONCLUÍDA)

### 2.1 Banco de Dados
- [x] Criar migration `010_create_payment_plans.sql`
- [ ] Executar migration no Supabase (MANUAL)

### 2.2 Backend API
- [x] Criar `api/src/controllers/paymentPlanController.js`
- [x] Criar `api/src/routes/paymentPlan.js`
- [x] Registrar rota no `server.js`

### 2.3 Frontend - Model
- [x] Adicionar interfaces em `src/models/debt.model.ts`:
  - `PaymentPlan`
  - `PaymentSimulation`
  - `MonthlyProjection`

### 2.4 Frontend - Service
- [x] Adicionar métodos em `src/services/data.service.ts`

### 2.5 Frontend - Componente
- [x] Criar `src/components/payment-planner/payment-planner.component.ts`
  - Formulário completo
  - Simulador básico
  - Listagem em cards
  - Gerenciamento CRUD

### 2.6 Integração
- [x] Adicionar 'planner' ao view signal
- [x] Adicionar navegação

---

## FASE 3: Integração com IA (Gemini) - EXPANDIDA ✅ (CONCLUÍDA)

### 3.1 Backend - Novos Endpoints
- [x] Atualizar `api/src/controllers/geminiController.js`:
  - `analyzeFinancialSituation()` - Análise completa
  - `suggestPaymentPlan()` - Sugestão de plano

- [x] Atualizar `api/src/routes/gemini.js` com novas rotas

### 3.2 Frontend - Service
- [x] Atualizar `src/services/gemini.service.ts`:
  - `analyzeFinancialSituation()`
  - `suggestPaymentPlan()`

### 3.3 Frontend - Componente
- [x] Criar `src/components/ai-assistant/ai-assistant.component.ts`
  - Botões de ação rápida
  - Análise financeira completa
  - Sugestão de plano de quitação
  - Streaming de respostas

### 3.4 Integração
- [x] Adicionar 'ai-assistant' ao view signal
- [x] Adicionar navegação

---

## FASE 4: Dashboard Aprimorado

### 4.1 Novos Computeds
- [ ] Adicionar em `app.component.ts`:
  - `totalMonthlyIncome`
  - `paymentCapacity`
  - `debtToIncomeRatio`

### 4.2 Novos Cards
- [ ] Card "Capacidade de Pagamento"
- [ ] Card "Previsão de Quitação com IA"
- [ ] Card "Próximas Ações Recomendadas"

### 4.3 Novos Gráficos
- [ ] Gráfico de fluxo de caixa (rendimentos vs dívidas)
- [ ] Gráfico de projeção de quitação
- [ ] Gráfico de distribuição de pagamentos

---

## Padrões a Seguir

✅ **Signals** para estado reativo  
✅ **Computed** para valores derivados  
✅ **Standalone components**  
✅ **ChangeDetectionStrategy.OnPush**  
✅ **Template inline** com backticks  
✅ **Tailwind CSS** para estilização  
✅ **Chart.js** para gráficos  
✅ **Modais com backdrop blur**  
✅ **Mensagens de sucesso/erro** com timeout  
✅ **Formulários reativos** com FormBuilder  
✅ **Autenticação** via Supabase Auth  
✅ **API REST** com Express.js  
✅ **Streaming** para respostas de IA (Gemini)  

---

## Ordem de Execução

1. **Sprint 1-2:** FASE 1 completa
2. **Sprint 3-4:** FASE 2 completa
3. **Sprint 5-6:** FASE 3 completa
4. **Sprint 7:** FASE 4 + refinamentos

---

## Status Atual
- **Fase Atual:** FASE 3 - Integração com IA (Gemini) ✅ CONCLUÍDA
- **Próximo Passo:** Executar migrations no Supabase e testar todas as funcionalidades
- **Próxima Fase:** FASE 4 - Dashboard Aprimorado (Opcional)

---

## Instruções para Testar

### Migrations no Supabase
Execute no SQL Editor do Supabase:
1. `migrations/009_create_income.sql`
2. `migrations/010_create_payment_plans.sql`

### Testar FASE 1 - Rendimentos

1. **Executar migration no Supabase:**
   - Acesse o SQL Editor no painel do Supabase
   - Execute o conteúdo de `migrations/009_create_income.sql`

2. **Reiniciar o servidor backend:**
   ```bash
   cd api
   npm start
   ```

3. **Testar no frontend:**
   - Acessar a aba "Rendimentos"
   - Adicionar um novo rendimento
   - Editar e excluir rendimentos
   - Verificar filtros e totalizadores
