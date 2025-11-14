const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function runMigrations() {
  console.log('🔄 Executando migrations...');
  let client;
  let retries = 3;
  
  while (retries > 0) {
    try {
      client = await pool.connect();
      break;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      console.log(`⚠️ Tentando reconectar... (${3 - retries}/3)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, '../../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && !f.startsWith('000') && !f.startsWith('999'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT name FROM migrations WHERE name = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`✓ ${file} já executada`);
        continue;
      }

      console.log(`⏳ Executando ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query(sql);
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [file]
      );
      
      console.log(`✅ ${file} executada`);
    }

    console.log('✅ Migrations concluídas');
  } catch (error) {
    console.error('❌ Erro nas migrations:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };
