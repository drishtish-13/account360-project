// File: backend/routes/profileRoutes.js

const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Middleware to authenticate user by JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// GET Profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE Profile
router.put('/', authenticate, async (req, res) => {
  const { name, contact, email, password } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (contact) updateData.contact = contact;
  if (email) updateData.email = email;
  if (password) updateData.password = await bcrypt.hash(password, 10);

  try {
    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      select: '-password',
    });

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// DELETE Profile
router.delete('/', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed' });
  }
});

module.exports = router;
