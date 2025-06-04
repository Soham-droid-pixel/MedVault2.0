const express = require('express');
const router = express.Router();
const { uploadRecord,getAllRecords } = require('../controllers/recordController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, upload.single('file'), uploadRecord);
router.get('/all', protect, getAllRecords);

module.exports = router;
