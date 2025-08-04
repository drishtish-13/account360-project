const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  profilePic: { type: String, default: '' },        // <-- Add this line for profile picture (base64 or URL)
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);