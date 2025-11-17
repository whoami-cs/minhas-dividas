const axios = require('axios');
const { supabase } = require('../config/supabase');
const emailService = require('../services/emailService');

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const response = await axios.post(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
      {
        headers: {
          'apikey': process.env.SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
};

exports.signOut = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await axios.post(
        `${process.env.SUPABASE_URL}/auth/v1/logout`,
        {},
        {
          headers: {
            'apikey': process.env.SUPABASE_KEY,
            'Authorization': `Bearer ${token}`
          }
        }
      );
    }
    res.status(204).send();
  } catch (error) {
    res.status(204).send();
  }
};

exports.signUp = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName) {
    return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
  }

  try {
    // Criar usuário no Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        firstName,
        lastName
      },
      email_confirm: false // Vamos confirmar via nosso sistema
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Enviar email de boas-vindas
    try {
      await emailService.sendWelcomeEmail(email, firstName);
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
      // Não falha o cadastro se o email não for enviado
    }

    res.status(201).json({ 
      message: 'Usuário criado com sucesso',
      user: data.user
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    // Usar nosso sistema de email personalizado
    const response = await axios.post(
      `${req.protocol}://${req.get('host')}/api/email/password-reset`,
      { email }
    );

    res.json({ message: 'Se o email existir, um link de redefinição será enviado' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição:', error);
    res.json({ message: 'Se o email existir, um link de redefinição será enviado' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    res.json({ session: { access_token: token, user } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token é obrigatório' });
  }

  try {
    const response = await axios.post(
      `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      { refresh_token },
      {
        headers: {
          'apikey': process.env.SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
};

exports.updatePassword = async (req, res) => {
  const { password } = req.body;
  const authHeader = req.headers.authorization;

  if (!password) {
    return res.status(400).json({ error: 'Senha é obrigatória' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);

  try {
    const response = await axios.put(
      `${process.env.SUPABASE_URL}/auth/v1/user`,
      { password },
      {
        headers: {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
};
