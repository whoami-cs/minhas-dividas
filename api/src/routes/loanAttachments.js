const express = require('express');
const router = express.Router();
const multer = require('multer');
const loanAttachmentsController = require('../controllers/loanAttachmentsController');
const authMiddleware = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:loanId', authMiddleware, loanAttachmentsController.getLoanAttachments);
router.post('/:loanId', authMiddleware, upload.single('file'), loanAttachmentsController.uploadLoanAttachment);
router.delete('/:attachmentId', authMiddleware, loanAttachmentsController.deleteLoanAttachment);

module.exports = router;
