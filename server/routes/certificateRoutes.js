const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createRequest,
  getStudentRequests,
  getAllRequests,
  processRequest, // Use the new function for approvals/rejections
} = require('../controllers/certificateController');
const { protect, isStaff } = require('../middleware/authMiddleware'); // Use the new isStaff middleware

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Student Routes
router.route('/request').post(protect, upload.single('document'), createRequest);
router.route('/my-requests').get(protect, getStudentRequests);

// Staff Routes (for Adviser, HOD, Principal, etc.)
router.route('/all').get(protect, isStaff, getAllRequests); // Any staff can get requests
router.route('/:id/process').put(protect, isStaff, processRequest); // The new route for all staff actions

module.exports = router;