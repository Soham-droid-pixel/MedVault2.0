const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: String,
  fileName: String,
  doctor: String,
  hospital: String,
  condition: String,
  date: Date,
});
module.exports = mongoose.model('Record', recordSchema);
