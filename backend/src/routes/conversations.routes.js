const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversations.controller');
const { auth } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/:leadId', conversationsController.getConversations);
router.post('/', conversationsController.createConversation);

module.exports = router;
