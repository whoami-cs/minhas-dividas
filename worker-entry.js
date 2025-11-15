import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Importar rotas
import debtsRoutes from './api/src/routes/debts.js';
import loansRoutes from './api/src/routes/loans.js';
import authRoutes from './api/src/routes/auth.js';
import incomeRoutes from './api/src/routes/income.js';

app.use('/api/debts', debtsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (!url.pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request);
    }

    return new Promise((resolve) => {
      app(request, {
        status: (code) => ({ json: (data) => resolve(Response.json(data, { status: code })) }),
        json: (data) => resolve(Response.json(data))
      });
    });
  }
};
