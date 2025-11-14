const express = require('express');
const router = express.Router();
const multer = require('multer');
const debtAttachmentsController = require('../controllers/debtAttachmentsController');
const authMiddleware = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:debtId', authMiddleware, debtAttachmentsController.getDebtAttachments);
router.post('/:debtId', authMiddleware, upload.single('file'), debtAttachmentsController.uploadDebtAttachment);
router.delete('/:attachmentId', authMiddleware, debtAttachmentsController.deleteDebtAttachment);

module.exports = router;
