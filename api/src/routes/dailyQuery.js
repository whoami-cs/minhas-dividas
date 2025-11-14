const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('credit_card_debts')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Daily query error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
