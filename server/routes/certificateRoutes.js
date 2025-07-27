// server/routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createRequest,
  getStudentRequests,
  getAllRequests,
  updateRequestStatus,
} = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/authMiddleware');

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Apply the upload middleware only to the 'request' route
router.route('/request').post(protect, upload.single('document'), createRequest);

// Other routes remain the same
router.route('/my-requests').get(protect, getStudentRequests);
router.route('/all').get(protect, admin, getAllRequests);
router.route('/:id/update-status').put(protect, admin, updateRequestStatus);

module.exports = router;