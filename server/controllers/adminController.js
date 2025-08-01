// server/controllers/adminController.js
const User = require('../models/User');
const CertificateRequest = require('../models/CertificateRequest');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, requestCount] = await Promise.all([
      User.countDocuments(),
      CertificateRequest.countDocuments()
    ]);

    const requestStats = await CertificateRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = requestStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      users: userCount,
      requests: requestCount,
      statusCounts: statusCounts,
    });

  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// --- NEW USER MANAGEMENT FUNCTIONS ---

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // We get all users but exclude their passwords for security
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update a user by ID
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.department = req.body.department || user.department;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Optional: Before deleting a user, you might want to handle their related documents,
      // like reassigning certificate requests or deleting them. For now, we'll just delete the user.
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};