const emailService = require('../services/emailService');
const { supabase } = require('../config/supabase');
const crypto = require('crypto');

const sendWelcomeEmail = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }

    const result = await emailService.sendWelcomeEmail(email, firstName);
    
    res.json({ 
      message: 'Email de boas-vindas enviado com sucesso',
      emailId: result.id 
    });
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const sendPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se o usuário existe
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);
    
    if (userError || !user) {
      // Por segurança, não revelamos se o email existe ou não
      return res.json({ message: 'Se o email existir, um link de redefinição será enviado' });
    }

    // Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco (você precisa criar uma tabela para isso)
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error('Erro ao salvar token:', tokenError);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Enviar email
    const firstName = user.user_metadata?.firstName || 'Usuário';
    await emailService.sendPasswordResetEmail(email, resetToken, firstName);
    
    res.json({ message: 'Email de redefinição enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email de redefinição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const sendEmailVerification = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000); // 24 horas

    // Salvar token no banco
    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        email,
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error('Erro ao salvar token de verificação:', tokenError);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Enviar email
    await emailService.sendEmailVerification(email, verificationToken, firstName);
    
    res.json({ message: 'Email de verificação enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    // Verificar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Verificar se não expirou
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Marcar token como usado
    const { error: updateError } = await supabase
      .from('email_verification_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Erro ao atualizar token:', updateError);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Validando token:', token);

    if (!token) {
      console.log('Token não fornecido');
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    console.log('Resultado da consulta:', { tokenData, tokenError });

    if (tokenError || !tokenData) {
      console.log('Token não encontrado ou erro na consulta');
      return res.status(400).json({ error: 'Token inválido ou já utilizado' });
    }

    if (new Date() > new Date(tokenData.expires_at)) {
      console.log('Token expirado');
      return res.status(400).json({ error: 'Token expirado' });
    }

    console.log('Token válido');
    res.json({ message: 'Token válido' });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    // Verificar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Verificar se não expirou
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Atualizar senha do usuário
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('Erro ao atualizar senha:', passwordError);
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }

    // Marcar token como usado
    const { error: updateError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Erro ao atualizar token:', updateError);
      return res.status(500).json({ error: 'Erro ao invalidar token' });
    }

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordReset,
  sendEmailVerification,
  verifyEmail,
  resetPassword,
  validateResetToken
};