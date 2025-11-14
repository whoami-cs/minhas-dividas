const express = require('express');
const router = express.Router();
const negotiationOffersController = require('../controllers/negotiationOffersController');

router.get('/debt/:debtId', negotiationOffersController.getOffersByDebtId);
router.post('/', negotiationOffersController.createOffer);
router.put('/:id', negotiationOffersController.updateOffer);
router.delete('/:id', negotiationOffersController.deleteOffer);

module.exports = router;
