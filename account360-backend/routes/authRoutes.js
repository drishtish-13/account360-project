const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
require('dotenv').config();

const passport = require('passport');

// ✅ TEST ROUTE to verify authRoutes is working
router.get('/test', (req, res) => {
  res.send('✅ Google Auth route is working!');
});

// ✅ GOOGLE LOGIN
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    const redirectUrl = `http://localhost:3000/google-continue?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${req.user.email}`;
    res.redirect(redirectUrl);
  }
);

// ✅ KEEP THE REST OF YOUR AUTH LOGIC UNCHANGED

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contact,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log(req.body);
  console.log("📩 Login route hit");

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    console.log('✅ Login successful:', user.name);
    console.log('Sending user:', {
      name: user.name,
      email: user.email,
      contact: user.contact
    });

    res.status(200).json({
      token,
      user: {
        name: user.name || 'Anonymous',
        email: user.email,
        contact: user.contact || ''
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
