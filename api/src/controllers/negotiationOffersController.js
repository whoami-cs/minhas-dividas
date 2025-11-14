const supabase = require('../config/supabase');

exports.getOffersByDebtId = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('negotiation_offers')
      .select('*')
      .eq('debt_id', req.params.debtId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('negotiation_offers')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('negotiation_offers')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const { error } = await supabase
      .from('negotiation_offers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
