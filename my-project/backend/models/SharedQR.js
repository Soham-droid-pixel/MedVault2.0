const mongoose = require('mongoose');

const sharedQRSchema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
  token: String,
  createdAt: { type: Date, default: Date.now, expires: '24h' },
});

module.exports = mongoose.model('SharedQR', sharedQRSchema);
