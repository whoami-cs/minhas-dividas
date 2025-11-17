const { supabase } = require('../config/supabase');

exports.getLoanAttachments = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { data, error } = await supabase
      .from('loan_attachments')
      .select('*')
      .eq('loan_id', loanId)
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

exports.uploadLoanAttachment = async (req, res) => {
  try {
    const { loanId } = req.params;
    const file = req.file;
    const { description } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${loanId}_${Date.now()}.${fileExt}`;
    const filePath = `loan-attachments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('loan_attachments')
      .insert([{
        loan_id: loanId,
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

exports.getAttachmentIdsByLoanId = async (loanId, userId) => {
  const { data } = await supabase
    .from('loan_attachments')
    .select('id')
    .eq('loan_id', loanId)
    .eq('user_id', userId);
  return data || [];
};

exports.deleteAttachmentFile = async (attachmentId, userId) => {
  const { data: attachment } = await supabase
    .from('loan_attachments')
    .select('file_url')
    .eq('id', attachmentId)
    .eq('user_id', userId)
    .single();

  if (attachment?.file_url) {
    await supabase.storage.from('attachments').remove([attachment.file_url]);
  }
};

exports.deleteLoanAttachmentById = async (attachmentId, userId) => {
  await exports.deleteAttachmentFile(attachmentId, userId);
  await supabase
    .from('loan_attachments')
    .delete()
    .eq('id', attachmentId)
    .eq('user_id', userId);
};

exports.deleteAllLoanAttachmentFiles = async (loanId, userId) => {
  const attachments = await exports.getAttachmentIdsByLoanId(loanId, userId);
  for (const att of attachments) {
    await exports.deleteAttachmentFile(att.id, userId);
  }
};

exports.deleteLoanAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    await exports.deleteLoanAttachmentById(attachmentId, req.user.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
