const express = require('express');
const router = express.Router();
const EmailLog = require('../models/EmailLog');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// System statistics
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      appointments: await Appointment.countDocuments(),
      emailsSent: await EmailLog.countDocuments({ status: 'sent' }),
      emailsFailed: await EmailLog.countDocuments({ status: 'failed' }),
      emailsToday: await EmailLog.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      upcomingAppointments: await Appointment.countDocuments({
        date: { $gte: new Date() }
      })
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email logs with pagination
router.get('/email-logs', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const logs = await EmailLog.find()
      .populate('user', 'name email')
      .populate('appointment', 'doctor date')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await EmailLog.countDocuments();
    
    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;