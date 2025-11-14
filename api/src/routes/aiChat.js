const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChatController');
const authMiddleware = require('../middleware/auth');

console.log('authMiddleware:', authMiddleware);

router.post('/stream', authMiddleware, aiChatController.chatStream);
router.get('/conversations', aiChatController.getConversations);
router.get('/conversations/:id', aiChatController.getConversation);
router.delete('/conversations/:id', aiChatController.deleteConversation);

module.exports = router;
