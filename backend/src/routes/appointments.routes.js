const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { auth } = require('../middlewares/auth.middleware');

router.use(auth);

router.post('/', appointmentsController.createAppointment);
router.get('/', appointmentsController.getAppointments);
router.put('/:appointmentId', appointmentsController.updateAppointment);

module.exports = router;
