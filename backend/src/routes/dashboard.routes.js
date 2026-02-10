const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { auth } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/stats', dashboardController.getStats);

module.exports = router;
