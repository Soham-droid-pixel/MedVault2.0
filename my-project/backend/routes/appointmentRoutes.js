const express = require('express');
const router = express.Router();
const { 
  addAppointment, 
  getAppointments, 
  updateAppointment, 
  deleteAppointment,
  testOneDayReminder
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, addAppointment);
router.get('/', protect, getAppointments);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);
router.post('/test-1day-reminder', protect, testOneDayReminder);
router.get('/sms-status', protect, (req, res) => {
  const smsService = require('../utils/smsService');
  
  res.json({
    smsEnabled: smsService.enabled,
    environmentVariables: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing'
    },
    twilioAccountSID: process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0, 8) + '...' : 'Not set',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not set'
  });
});
router.post('/test-sms', protect, async (req, res) => {
  try {
    const smsService = require('../utils/smsService');
    const { phoneNumber } = req.body;
    
    if (!smsService.enabled) {
      return res.json({
        success: false,
        message: 'SMS service is not enabled',
        smsEnabled: false
      });
    }
    
    const result = await smsService.sendSMS(
      phoneNumber || '+15732791616', // Replace with your phone number
      'Test SMS from MedVault - Your SMS service is working! 🎉',
      { userId: req.user.id, type: 'test' }
    );
    
    res.json({
      success: true,
      message: 'Test SMS sent successfully',
      result: result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SMS test failed',
      error: error.message
    });
  }
});

// Add this route for debugging
router.get('/debug-env', protect, (req, res) => {
  res.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_USER: process.env.EMAIL_USER ? '✅ Set' : '❌ Missing',
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? `✅ Set (${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...)` : '❌ Missing',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? `✅ Set (${process.env.TWILIO_AUTH_TOKEN.length} chars)` : '❌ Missing',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '❌ Missing'
    },
    smsServiceStatus: require('../utils/smsService').enabled
  });
});

module.exports = router;
