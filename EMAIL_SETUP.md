# Configuração do Sistema de Email com Resend

Este documento explica como configurar e usar o sistema de email integrado com Resend no projeto Minhas Dívidas.

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `api/.env`:

```env
RESEND_API_KEY=re_gqNQaoDM_GVTKWVaTRSFabgCev3xNn6GE
FRONTEND_URL=http://localhost:3000
```

### 2. Domínio Verificado (Importante!)

⚠️ **ATENÇÃO**: Para usar em produção, você precisa configurar um domínio verificado no Resend.

1. Acesse o [Dashboard do Resend](https://resend.com/domains)
2. Adicione seu domínio (ex: `minhasdividas.com`)
3. Configure os registros DNS conforme instruído
4. Atualize o `fromEmail` no arquivo `api/src/services/emailService.js`:

```javascript
this.fromEmail = 'noreply@seudominio.com'; // Substitua pelo seu domínio
```

### 3. Executar Migrações

Execute a migração para criar as tabelas de tokens:

```bash
cd api
npm run migrate # ou execute manualmente a migration 010_create_email_tokens.sql
```

## 📧 Funcionalidades Disponíveis

### 1. Email de Boas-vindas
- Enviado automaticamente no cadastro
- Template responsivo com gradiente
- Inclui informações sobre a plataforma

### 2. Redefinição de Senha
- Sistema seguro com tokens temporários (1 hora)
- Email personalizado com link de redefinição
- Validação de token no backend

### 3. Verificação de Email
- Tokens com validade de 24 horas
- Confirmação de email para novos usuários
- Sistema de verificação completo

## 🛠️ Como Usar

### Backend - Endpoints Disponíveis

```javascript
// Enviar email de boas-vindas
POST /api/email/welcome
{
  "email": "usuario@email.com",
  "firstName": "João"
}

// Solicitar redefinição de senha
POST /api/email/password-reset
{
  "email": "usuario@email.com"
}

// Redefinir senha com token
POST /api/email/reset-password
{
  "token": "token_recebido_por_email",
  "newPassword": "nova_senha_123"
}

// Enviar verificação de email
POST /api/email/verification
{
  "email": "usuario@email.com",
  "firstName": "João"
}

// Verificar email
POST /api/email/verify
{
  "token": "token_de_verificacao"
}
```

### Frontend - Serviços Disponíveis

```typescript
import { EmailService } from './services/email.service';

// Injetar o serviço
private emailService = inject(EmailService);

// Usar os métodos
await this.emailService.sendWelcomeEmail(email, firstName);
await this.emailService.sendPasswordReset(email);
await this.emailService.resetPassword(token, newPassword);
await this.emailService.sendEmailVerification(email, firstName);
await this.emailService.verifyEmail(token);
```

### Componentes Prontos

1. **SignupComponent** (`src/components/auth/signup.component.ts`)
   - Formulário de cadastro completo
   - Integração automática com email de boas-vindas
   - Validação de senhas

2. **ResetPasswordComponent** (`src/components/auth/reset-password.component.ts`)
   - Solicitação de redefinição
   - Formulário de nova senha
   - Suporte a tokens via URL

## 🎨 Templates de Email

### Características dos Templates

- **Responsivos**: Funcionam em desktop e mobile
- **Gradientes**: Design moderno com cores atrativas
- **Branded**: Personalizados para "Minhas Dívidas"
- **Acessíveis**: Boa legibilidade e contraste

### Personalização

Para personalizar os templates, edite os métodos no arquivo `api/src/services/emailService.js`:

- `getWelcomeTemplate(firstName)`
- `getPasswordResetTemplate(firstName, resetUrl)`
- `getEmailVerificationTemplate(firstName, verificationUrl)`

## 🔒 Segurança

### Tokens de Segurança
- **Redefinição**: Expira em 1 hora
- **Verificação**: Expira em 24 horas
- **Únicos**: Cada token é gerado com crypto.randomBytes(32)
- **Uso único**: Tokens são marcados como usados após utilização

### Validações
- Verificação de expiração
- Validação de formato de email
- Proteção contra uso múltiplo de tokens
- Logs de segurança para auditoria

## 🚀 Deploy em Produção

### 1. Configurar Domínio
```bash
# No Resend Dashboard, adicione seu domínio
# Configure DNS: SPF, DKIM, DMARC
```

### 2. Variáveis de Ambiente
```env
RESEND_API_KEY=sua_api_key_de_producao
FRONTEND_URL=https://seudominio.com
```

### 3. Atualizar fromEmail
```javascript
// Em emailService.js
this.fromEmail = 'noreply@seudominio.com';
```

## 📊 Monitoramento

### Logs Disponíveis
- Envios bem-sucedidos com ID do email
- Erros de envio com detalhes
- Tentativas de uso de tokens inválidos
- Operações de redefinição de senha

### Métricas do Resend
- Acesse o dashboard para ver:
  - Taxa de entrega
  - Emails bounced
  - Clicks e opens (se configurado)

## 🔧 Troubleshooting

### Problemas Comuns

1. **Email não enviado**
   - Verifique a API key do Resend
   - Confirme se o domínio está verificado
   - Verifique logs do servidor

2. **Token inválido**
   - Verifique se não expirou
   - Confirme se não foi usado anteriormente
   - Verifique se o token está correto na URL

3. **Domínio não verificado**
   - Configure registros DNS no seu provedor
   - Aguarde propagação (até 48h)
   - Verifique status no dashboard Resend

### Debug

```javascript
// Ativar logs detalhados
console.log('Enviando email para:', email);
console.log('Token gerado:', token);
console.log('Resposta Resend:', data);
```

## 📝 Próximos Passos

1. **Templates Avançados**: Usar React Email para templates mais complexos
2. **Notificações**: Emails para lembretes de pagamento
3. **Analytics**: Tracking de abertura e cliques
4. **Webhooks**: Processar eventos do Resend
5. **Batch Emails**: Envios em massa para newsletters

## 🤝 Suporte

Para dúvidas sobre:
- **Resend**: [Documentação oficial](https://resend.com/docs)
- **Implementação**: Verifique os arquivos de exemplo criados
- **Bugs**: Verifique logs do servidor e console do navegador