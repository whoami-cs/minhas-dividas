const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Enviar email de boas-vindas
router.post('/welcome', emailController.sendWelcomeEmail);

// Enviar email de redefinição de senha
router.post('/password-reset', emailController.sendPasswordReset);

// Validar token de redefinição
router.post('/validate-reset-token', emailController.validateResetToken);

// Redefinir senha
router.post('/reset-password', emailController.resetPassword);

// Enviar email de verificação
router.post('/verification', emailController.sendEmailVerification);

// Verificar email
router.post('/verify', emailController.verifyEmail);

module.exports = router;