const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/', async (req, res) => {
  try {
    const { data: debts, error: debtsError } = await supabase
      .from('credit_card_debts')
      .select('*');

    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*');

    if (debtsError || loansError) {
      throw debtsError || loansError;
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      debtsCount: debts?.length || 0,
      loansCount: loans?.length || 0
    });
  } catch (error) {
    console.error('Daily query error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
