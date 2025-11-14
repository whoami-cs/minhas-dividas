const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');
const authMiddleware = require('../middleware/auth');

router.post('/analyze-debts', authMiddleware, geminiController.analyzeDebts);
router.post('/extract-loan-pdf', authMiddleware, geminiController.extractLoanFromPDF);
router.post('/analyze-goals', authMiddleware, geminiController.analyzeGoals);

module.exports = router;
