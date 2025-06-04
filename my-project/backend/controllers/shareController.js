const jwt = require('jsonwebtoken');

exports.generateQRToken = (req, res) => {
  const { recordId } = req.body;
  const token = jwt.sign({ recordId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ qrUrl: `https://medvault-backend.onrender.com/api/share/access/${token}` });
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
