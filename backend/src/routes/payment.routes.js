const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { auth } = require('../middlewares/auth.middleware');

router.post('/create-subscription', auth, paymentController.createSubscription);
router.post('/webhook', paymentController.handleWebhook); // No auth for webhooks
router.get('/subscription-status', auth, paymentController.getSubscriptionStatus);

module.exports = router;
