const supabase = require('../config/supabase');
const loanAttachmentsController = require('./loanAttachmentsController');

exports.getAllLoans = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select('id, created_at, contract_number, loan_date, creditor, loan_value, interest_value, final_value, total_installments, paid_installments, remaining_installments, remaining_value, last_payment_date, status, observations')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loans')
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

exports.createLoan = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .insert([{ ...req.body, user_id: req.user.id }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loans')
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

exports.deleteLoan = async (req, res) => {
  try {
    await loanAttachmentsController.deleteAllLoanAttachmentFiles(req.params.id, req.user.id);

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

