// File: routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();
require('dotenv').config();

const passport = require('passport');

// Use env urls with fallbacks for local dev
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Nodemailer setup (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: verify transporter at startup (logs but won't break server)
transporter.verify((err, success) => {
  if (err) console.warn('⚠️ Nodemailer verify failed:', err.message);
  else console.log('✅ Nodemailer ready to send emails');
});

// TEST ROUTE
router.get('/test', (req, res) => {
  res.send('✅ Google Auth route is working!');
});

// GOOGLE LOGIN (init)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GOOGLE CALLBACK
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login`, session: false }),
  async (req, res) => {
    try {
      // Passport should attach user info to req.user
      const googleUser = req.user;

      let user = await User.findOne({ email: googleUser.email });

      // If user doesn't exist, create one
      if (!user) {
        user = new User({
          name: googleUser.name || 'Google User',
          email: googleUser.email,
          password: '', // No local password for Google users
          isVerified: false,
          profilePic: googleUser.profilePic || '',
        });
        await user.save();
      } else if (googleUser.profilePic && user.profilePic !== googleUser.profilePic) {
        // Update profilePic if changed from Google
        user.profilePic = googleUser.profilePic;
        await user.save();
      }

      // If user not verified, send verification email
      if (!user.isVerified) {
        const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const verificationLink = `${BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Verify your email for Google login',
            html: `<p>Hi ${user.name},</p>
                   <p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`,
          });
        } catch (mailErr) {
          console.error('Failed to send verification email:', mailErr.message);
        }

        // Redirect frontend to inform user they need to verify
        return res.redirect(`${FRONTEND_URL}/login?verifyFirst=true`);
      }

      // If verified, generate token and redirect to frontend with token + info
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const redirectUrl = `${FRONTEND_URL}/google-continue?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&profilePic=${encodeURIComponent(user.profilePic || '')}`;

      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google callback error:', err);
      return res.redirect(`${FRONTEND_URL}/login?error=GoogleAuthFailed`);
    }
  }
);

// REGISTER WITH EMAIL VERIFICATION
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, contact, profilePic } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com', 'thapar.edu'];
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
      profilePic: profilePic || '',
    });

    await newUser.save();

    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const verificationLink = `${BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        html: `<p>Hi ${name},</p>
               <p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`,
      });
    } catch (mailErr) {
      console.error('Failed to send verification email:', mailErr.message);
      // We still return success to client, but note that email sending failed
      return res.status(201).json({
        message: 'User created. Verification email failed to send; contact admin.',
      });
    }

    return res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// EMAIL VERIFICATION
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });

    // Redirect to frontend after verification
    return res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error('Email verification failed:', err);
    return res.status(400).send('❌ Invalid or expired verification link.');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      token,
      user: {
        name: user.name,
        email: user.email,
        contact: user.contact || '',
        profilePic: user.profilePic || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    // Use FRONTEND URL for reset form
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your password',
        html: `<p>Hi ${user.name},</p>
               <p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
      });
    } catch (mailErr) {
      console.error('Failed to send reset email:', mailErr.message);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    return res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    return res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

module.exports = router;
