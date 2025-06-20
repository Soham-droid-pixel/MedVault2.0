const express = require('express');
const router = express.Router();
const NotificationPreferences = require('../models/NotificationPreferences');
const protect = require('../middleware/authMiddleware');

// Get user preferences
router.get('/', protect, async (req, res) => {
  try {
    let preferences = await NotificationPreferences.findOne({ user: req.user.id });
    
    if (!preferences) {
      // Create default preferences
      preferences = await NotificationPreferences.create({ user: req.user.id });
    }
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
});

// Update user preferences
router.put('/', protect, async (req, res) => {
  try {
    const preferences = await NotificationPreferences.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
});

module.exports = router;