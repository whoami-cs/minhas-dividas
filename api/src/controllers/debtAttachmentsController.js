const { supabase } = require('../config/supabase');

exports.getDebtAttachments = async (req, res) => {
  try {
    const { debtId } = req.params;
    const { data, error } = await supabase
      .from('debt_attachments')
      .select('*')
      .eq('debt_id', debtId)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const attachmentsWithUrls = await Promise.all(data.map(async (att) => {
      const { data: signedUrl } = await supabase.storage
        .from('attachments')
        .createSignedUrl(att.file_url, 3600);
      return { ...att, file_url: signedUrl?.signedUrl || att.file_url };
    }));

    res.json(attachmentsWithUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadDebtAttachment = async (req, res) => {
  try {
    const { debtId } = req.params;
    const file = req.file;
    const { description } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${debtId}_${Date.now()}.${fileExt}`;
    const filePath = `debt-attachments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('debt_attachments')
      .insert([{
        debt_id: debtId,
        file_name: file.originalname,
        file_url: filePath,
        file_type: file.mimetype,
        file_size: file.size,
        description,
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    const { data: signedUrl } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 3600);

    res.status(201).json({ ...data, file_url: signedUrl?.signedUrl || data.file_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDebtAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const { data: attachment } = await supabase
      .from('debt_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .eq('user_id', req.user.id)
      .single();

    if (attachment?.file_url) {
      await supabase.storage.from('attachments').remove([attachment.file_url]);
    }

    await supabase
      .from('debt_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('user_id', req.user.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
