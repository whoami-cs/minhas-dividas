import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Importar rotas da API
const debtsRoutes = require('../api/src/routes/debts');
const loansRoutes = require('../api/src/routes/loans');
const authRoutes = require('../api/src/routes/auth');
const incomeRoutes = require('../api/src/routes/income');
const loanAttachmentsRoutes = require('../api/src/routes/loanAttachments');
const debtAttachmentsRoutes = require('../api/src/routes/debtAttachments');
const negotiationOffersRoutes = require('../api/src/routes/negotiationOffers');
const geminiRoutes = require('../api/src/routes/gemini');
const paymentPlanRoutes = require('../api/src/routes/paymentPlan');
const aiChatRoutes = require('../api/src/routes/aiChat');
const settingsRoutes = require('../api/src/routes/settings');

app.get('/', (req, res) => res.json({ message: 'API Minhas Dívidas' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/debts', debtsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/loan-attachments', loanAttachmentsRoutes);
app.use('/api/debt-attachments', debtAttachmentsRoutes);
app.use('/api/negotiation-offers', negotiationOffersRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/payment-plans', paymentPlanRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/settings', settingsRoutes);

app.listen(3000);
export default httpServerHandler({ port: 3000 });
