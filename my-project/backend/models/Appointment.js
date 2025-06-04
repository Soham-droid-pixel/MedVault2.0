const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: String,
  date: Date,
  notes: String,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
