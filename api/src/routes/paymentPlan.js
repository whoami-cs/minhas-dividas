const express = require('express');
const router = express.Router();
const savingsGoalController = require('../controllers/savingsGoalController');
const auth = require('../middleware/auth');

router.get('/', savingsGoalController.getSavingsGoals);
router.post('/', savingsGoalController.createSavingsGoal);
router.put('/:id', savingsGoalController.updateSavingsGoal);
router.delete('/:id', savingsGoalController.deleteSavingsGoal);
router.post('/simulate', savingsGoalController.simulateGoal);
router.post('/simulate-amortization', savingsGoalController.simulateAmortization);

module.exports = router;
