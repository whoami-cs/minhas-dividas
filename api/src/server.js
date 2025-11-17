require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { runMigrations } = require('./config/migrationRunner');
const { supabase } = require('./config/supabase');

const healthRoutes = require('./routes/health');
const debtsRoutes = require('./routes/debts');
const loansRoutes = require('./routes/loans');
const loanAttachmentsRoutes = require('./routes/loanAttachments');
const debtAttachmentsRoutes = require('./routes/debtAttachments');
const debtReceiptsRoutes = require('./routes/debtReceipts');
const negotiationOffersRoutes = require('./routes/negotiationOffers');
const geminiRoutes = require('./routes/gemini');
const authRoutes = require('./routes/auth');
const incomeRoutes = require('./routes/income');
const paymentPlanRoutes = require('./routes/paymentPlan');
const aiChatRoutes = require('./routes/aiChat');
const settingsRoutes = require('./routes/settings');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'API Minhas Dívidas' });
});

app.use('/api/health', healthRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/loan-attachments', loanAttachmentsRoutes);
app.use('/api/debt-attachments', debtAttachmentsRoutes);
app.use('/api/debt-receipts', debtReceiptsRoutes);
app.use('/api/negotiation-offers', negotiationOffersRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/payment-plans', paymentPlanRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email', emailRoutes);

async function ensureStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'attachments');
    
    if (!bucketExists) {
      await supabase.storage.createBucket('attachments', { public: true });
      console.log('Bucket attachments criado');
    }
  } catch (err) {
    console.error('Erro ao verificar/criar bucket:', err);
  }
}

async function startServer() {
  try {
    await runMigrations();
    await ensureStorageBucket();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

startServer();
