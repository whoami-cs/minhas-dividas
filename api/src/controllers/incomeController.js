const supabase = require('../config/supabase');

exports.getIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomeData = { ...req.body, user_id: userId };
    
    const { data, error } = await supabase
      .from('income')
      .insert([incomeData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('income')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: error.message });
  }
};
