// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  assignAdviser, // getAllUsers is removed from this import
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Password Reset routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// This route for assigning an adviser remains
router.put('/assign-adviser', protect, admin, assignAdviser);

// The '/users' route was removed because it now exists in adminRoutes.js

module.exports = router;