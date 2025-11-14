const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('ai_chat_model, ai_analysis_model, ai_extraction_model')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.json({
        ai_chat_model: 'gemini-2.5-flash',
        ai_analysis_model: 'gemini-2.5-flash',
        ai_extraction_model: 'gemini-2.5-flash'
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ai_chat_model, ai_analysis_model, ai_extraction_model } = req.body;

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ai_chat_model,
        ai_analysis_model,
        ai_extraction_model,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select('ai_chat_model, ai_analysis_model, ai_extraction_model')
      .single();

    if (error) throw error;

    authMiddleware.clearCache(userId);
    res.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};
