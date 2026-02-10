const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { auth } = require('../middlewares/auth.middleware');

router.use(auth);

router.post('/respond', aiController.respondToMessage);
router.post('/test', aiController.testAI);

module.exports = router;
