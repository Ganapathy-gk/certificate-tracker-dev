// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'classAdviser', 'hod', 'principal', 'officeStaff'], 
    default: 'student' 
  },
  studentId: { type: String, unique: true, required: true },
  department: { type: String, required: true },
  adviser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // --- ADDED FOR PASSWORD RESET ---
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  // --------------------------------
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);