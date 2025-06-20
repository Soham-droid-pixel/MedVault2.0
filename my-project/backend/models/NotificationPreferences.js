const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailReminders: {
    enabled: { type: Boolean, default: true },
    reminderDays: {
      sevenDay: { type: Boolean, default: true },
      threeDay: { type: Boolean, default: true },
      oneDay: { type: Boolean, default: true }
    },
    reminderTime: {
      type: String,
      default: '09:00', // 9 AM
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:MM format'
      }
    }
  },
  smsReminders: {
    enabled: { type: Boolean, default: false },
    phoneNumber: { type: String },
    reminderDays: {
      sevenDay: { type: Boolean, default: false },
      threeDay: { type: Boolean, default: true },
      oneDay: { type: Boolean, default: true }
    }
  },
  recordSharing: {
    allowEmailSharing: { type: Boolean, default: true },
    allowLinkSharing: { type: Boolean, default: true },
    defaultShareExpiry: { type: Number, default: 7 } // days
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationPreferences', notificationPreferencesSchema);