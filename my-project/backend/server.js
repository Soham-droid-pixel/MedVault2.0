const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const shareRoutes = require('./routes/shareRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
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
app.use('/api/preferences', preferencesRoutes);

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

// Add to server.js for production
if (process.env.NODE_ENV === 'production') {
  // Enhanced security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // Enhanced rate limiting
  const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', limiter);
  
  // Specific rate limits for sensitive endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later'
  });
  
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}
