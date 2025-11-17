const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

router.get('/', async (req, res) => {
  try {
    // Tenta fazer uma query simples no banco
    const { data, error } = await supabase
      .from('credit_card_debts')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
