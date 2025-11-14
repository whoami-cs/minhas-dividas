const supabase = require('../config/supabase');

exports.getAllDebts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('credit_card_debts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDebtById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('credit_card_debts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDebt = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('credit_card_debts')
      .insert([{ ...req.body, user_id: req.user.id }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDebt = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('credit_card_debts')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDebt = async (req, res) => {
  try {
    const { error } = await supabase
      .from('credit_card_debts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
