const express = require('express');
const router = express.Router();
const { 
  addAppointment, 
  getAppointments, 
  updateAppointment, 
  deleteAppointment 
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, addAppointment);
router.get('/', protect, getAppointments);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
