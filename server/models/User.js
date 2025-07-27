// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 'student' or 'admin'
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  studentId: { type: String, unique: true, required: true } // This line is updated
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);