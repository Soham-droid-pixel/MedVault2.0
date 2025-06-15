const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: String, required: true },
  date: { type: Date, required: true },
  notes: String,
  remindersSent: {
    type: String,
    enum: ['7day', '3day', '1day'],
    default: undefined
  }
}, {
  timestamps: true
});

// Index for efficient reminder queries
appointmentSchema.index({ date: 1, remindersSent: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
