// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  studentId: { type: String, unique: true, required: true },
  department: { type: String, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);