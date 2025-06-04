const express = require('express');
const router = express.Router();
const { addAppointment, getAppointments } = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, addAppointment);
router.get('/', protect, getAppointments);

module.exports = router;
