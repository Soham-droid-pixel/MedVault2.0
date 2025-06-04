const express = require('express');
const router = express.Router();
const { generateQRToken, accessSharedRecord } = require('../controllers/shareController');
const protect = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQRToken);
router.get('/access/:token', accessSharedRecord);

module.exports = router;
