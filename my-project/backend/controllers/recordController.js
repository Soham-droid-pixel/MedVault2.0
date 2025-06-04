const Record = require('../models/Record');
const cloudinary = require('cloudinary').v2;

exports.uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'medvault',
    });

    // Create record in DB
    const record = await Record.create({
      user: req.user.id,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      doctor: req.body.doctor,
      hospital: req.body.hospital,
      condition: req.body.condition,
      date: req.body.date,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
  }
};

// New function to get all records of logged-in user
exports.getAllRecords = async (req, res) => {
  try {
    // Fetch all records for the authenticated user
    const records = await Record.find({ user: req.user.id }).sort({ date: -1 }); // sorted by date desc

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get records', error: err.message });
  }
};
