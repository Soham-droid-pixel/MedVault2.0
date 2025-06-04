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

dotenv.config();
connectDB();
cloudinary();

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/share', shareRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
