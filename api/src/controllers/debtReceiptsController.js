const supabase = require('../config/supabase');

exports.uploadReceipt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${debtId}_${Date.now()}.${fileExt}`;
    const filePath = `debt-receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    res.json({ publicUrl: data.publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const { url } = req.body;
    const path = url.split('/attachments/').pop();
    
    if (!path) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const { error } = await supabase.storage
      .from('attachments')
      .remove([path]);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
