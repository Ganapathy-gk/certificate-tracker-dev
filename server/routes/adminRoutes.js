// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getAllUsers,        // <-- IMPORT NEW
  updateUserById,     // <-- IMPORT NEW
  deleteUserById      // <-- IMPORT NEW
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route for getting dashboard stats
router.route('/stats').get(protect, admin, getDashboardStats);

// --- NEW USER MANAGEMENT ROUTES ---
router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .put(protect, admin, updateUserById)
  .delete(protect, admin, deleteUserById);
// ------------------------------------

module.exports = router;