const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['confirmation', '7day', '3day', '1day', 'update', 'cancellation', 'share'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'bounced', 'delivered'],
    default: 'sent'
  },
  messageId: {
    type: String
  },
  error: {
    type: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailLog', emailLogSchema);