const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);
router.post('/reset-password', authController.resetPassword);
router.get('/session', authController.getSession);
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken);

module.exports = router;
