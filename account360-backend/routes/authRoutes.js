const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();
require('dotenv').config();

const passport = require('passport');

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ TEST ROUTE
router.get('/test', (req, res) => {
  res.send('✅ Google Auth route is working!');
});

// ✅ GOOGLE LOGIN
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      let user = await User.findOne({ email: req.user.email });

      // If user doesn't exist, create one
      if (!user) {
        user = new User({
          name: req.user.name,
          email: req.user.email,
          password: '', // No password for Google users
          isVerified: false,
          profilePic: req.user.profilePic || '', // Save Google profile pic if available
        });
        await user.save();
      } else if (req.user.profilePic && user.profilePic !== req.user.profilePic) {
        // Update profilePic if changed from Google
        user.profilePic = req.user.profilePic;
        await user.save();
      }

      // ✅ If user not verified, send verification email
      if (!user.isVerified) {
        const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const verificationLink = `http://localhost:3001/api/auth/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Verify your email for Google login',
          html: `<p>Hi ${user.name},</p>
                 <p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`,
        });

        return res.redirect('http://localhost:3000/login?verifyFirst=true');
      }

      // ✅ If verified, generate token and redirect
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const redirectUrl = `http://localhost:3000/google-continue?token=${token}&name=${encodeURIComponent(user.name)}&email=${user.email}&profilePic=${encodeURIComponent(user.profilePic || '')}`;
      res.redirect(redirectUrl);

    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect('http://localhost:3000/login?error=GoogleAuthFailed');
    }
  }
);

// ✅ REGISTER WITH EMAIL VERIFICATION
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, contact, profilePic } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com','thapar.edu'];
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!allowedDomains.includes(emailDomain)) {
      return res.status(400).json({ message: 'Email domain is not allowed. Use a valid email address.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please log in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contact,
      isVerified: false,
      profilePic: profilePic || '', // Save profilePic if provided
    });

    await newUser.save();

    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const verificationLink = `http://localhost:3001/api/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      html: `<p>Hi ${name},</p>
             <p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`,
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ EMAIL VERIFICATION
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });

    // Redirect to frontend after verification
    res.redirect('http://localhost:3000/login?verified=true');
  } catch (err) {
    console.error('Email verification failed:', err);
    res.status(400).send('❌ Invalid or expired verification link.');
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      token,
      user: {
        name: user.name,
        email: user.email,
        contact: user.contact || '',
        profilePic: user.profilePic || '', // Return profilePic on login
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html: `<p>Hi ${user.name},</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
    });

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

module.exports = router;