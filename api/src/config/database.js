const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada no .env');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
  statement_timeout: 30000
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexão:', err);
});

module.exports = pool;
