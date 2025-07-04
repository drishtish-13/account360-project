const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const path = require('path');
const passport = require('passport');
require('./passport'); 
const { addAbortSignal } = require('stream');
const profileRoutes = require('./routes/profileRoutes');



const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });


// Routes


// Root Route (to prevent 403 on /)
app.get('/', (req, res) => {
  res.send('✅ Backend server is running. Use /api/auth or /api/reports.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));