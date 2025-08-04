const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// GET /api/reports (Protected Route)
router.get('/', verifyToken, (req, res) => {
  res.json({ message: 'Protected Report data' });
});

module.exports = router;