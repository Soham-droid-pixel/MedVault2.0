const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const shareRoutes = require('./routes/shareRoutes');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios =require('axios');

dotenv.config();        // Load environment variables
connectDB();            // Connect to MongoDB
cloudinary();           // Configure Cloudinary

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 100 }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/share', shareRoutes);

// Import appointment controller to start cron jobs
require('./controllers/appointmentController');

// Error Handling
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';  // <-- important for network access
app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
