const jwt = require('jsonwebtoken');
const Record = require('../models/Record');
const SharedQR = require('../models/SharedQR');

exports.generateQRToken = async (req, res) => {
  try {
    const { recordId } = req.body;
    const token = jwt.sign({ recordId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    await SharedQR.create({ recordId, token });

    // Use localhost in development
   res.json({ qrUrl: `${process.env.SERVER_IP}/api/share/access/${token}` });
  } catch (err) {
    res.status(500).json({ message: 'QR Generation Failed', error: err.message });
  }
};

exports.accessSharedRecord = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const record = await Record.findById(decoded.recordId);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch {
    res.status(403).json({ message: 'Invalid or expired QR token' });
  }
};
