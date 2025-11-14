const express = require('express');
const router = express.Router();
const debtsController = require('../controllers/debtsController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, debtsController.getAllDebts);
router.get('/:id', authMiddleware, debtsController.getDebtById);
router.post('/', authMiddleware, debtsController.createDebt);
router.put('/:id', authMiddleware, debtsController.updateDebt);
router.delete('/:id', authMiddleware, debtsController.deleteDebt);

module.exports = router;
