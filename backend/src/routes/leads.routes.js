const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { auth } = require('../middlewares/auth.middleware');

router.use(auth); // All lead routes require authentication

router.post('/', leadsController.createLead);
router.get('/', leadsController.getLeads);
router.get('/:leadId', leadsController.getLeadById);
router.put('/:leadId', leadsController.updateLead);
router.post('/:leadId/score', leadsController.updateLeadScore);

module.exports = router;
