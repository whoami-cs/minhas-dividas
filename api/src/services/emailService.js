const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = 'noreply@saldopositivo.shop';
  }

  async sendWelcomeEmail(to, firstName) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Bem-vindo ao Minhas Dívidas!',
        html: this.getWelcomeTemplate(firstName),
      });

      if (error) {
        console.error('Erro ao enviar email de boas-vindas:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to, resetToken, firstName) {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000';
      const resetUrl = `${baseUrl}/redefinir-senha?token=${resetToken}`;
      
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Redefinição de Senha - Minhas Dívidas',
        html: this.getPasswordResetTemplate(firstName, resetUrl),
      });

      if (error) {
        console.error('Erro ao enviar email de redefinição:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de email:', error);
      throw error;
    }
  }

  async sendEmailVerification(to, verificationToken, firstName) {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Confirme seu Email - Minhas Dívidas',
        html: this.getEmailVerificationTemplate(firstName, verificationUrl),
      });

      if (error) {
        console.error('Erro ao enviar email de verificação:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de email:', error);
      throw error;
    }
  }

  getWelcomeTemplate(firstName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Minhas Dívidas</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo ao Minhas Dívidas!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${firstName}!</h2>
          
          <p>Seja bem-vindo(a) ao <strong>Minhas Dívidas</strong>, sua plataforma completa para gerenciar e organizar suas finanças!</p>
          
          <p>Com nossa plataforma, você poderá:</p>
          <ul style="padding-left: 20px;">
            <li>📊 Acompanhar todas as suas dívidas em um só lugar</li>
            <li>💳 Gerenciar cartões de crédito e empréstimos</li>
            <li>📈 Visualizar a evolução dos seus débitos</li>
            <li>🤖 Receber conselhos financeiros personalizados com IA</li>
            <li>🎯 Definir e acompanhar metas de economia</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000'}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Começar Agora
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Se você não criou esta conta, pode ignorar este email com segurança.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(firstName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - Minhas Dívidas</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Redefinir Senha</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${firstName}!</h2>
          
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Minhas Dívidas</strong>.</p>
          
          <p>Para criar uma nova senha, clique no botão abaixo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Este link expira em 1 hora por motivos de segurança.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Se você não solicitou esta redefinição, pode ignorar este email com segurança. Sua senha não será alterada.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(firstName, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmar Email - Minhas Dívidas</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Confirme seu Email</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${firstName}!</h2>
          
          <p>Obrigado por se cadastrar no <strong>Minhas Dívidas</strong>!</p>
          
          <p>Para completar seu cadastro e começar a usar nossa plataforma, confirme seu endereço de email clicando no botão abaixo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #00f2fe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Confirmar Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Este link expira em 24 horas por motivos de segurança.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Se você não criou esta conta, pode ignorar este email com segurança.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();