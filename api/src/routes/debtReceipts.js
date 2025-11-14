const express = require('express');
const router = express.Router();
const multer = require('multer');
const debtReceiptsController = require('../controllers/debtReceiptsController');
const authMiddleware = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/:debtId', authMiddleware, upload.single('file'), debtReceiptsController.uploadReceipt);
router.delete('/', authMiddleware, debtReceiptsController.deleteReceipt);

module.exports = router;
