const CertificateRequest = require('../models/CertificateRequest');
const User = require('../models/User');
const transporter = require('../config/emailConfig');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createRequest = async (req, res) => {
  const { certificateType, purpose, notes } = req.body;
  try {
    let documentUrl = '';
    let documentPublicId = '';

    if (req.file) {
      console.log('File found, attempting to upload to Cloudinary...');
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'certificates' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(new Error(error.message || 'Cloudinary upload failed'));
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      const result = await uploadPromise;
      documentUrl = result.secure_url;
      documentPublicId = result.public_id;
      console.log('File uploaded successfully to:', documentUrl);
    }

    const newRequest = new CertificateRequest({
      student: req.user.id,
      certificateType, purpose, notes, documentUrl, documentPublicId,
      remarks: [{ status: 'Pending Adviser Approval', updatedBy: req.user.name, comment: 'Request submitted by student.' }],
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Full error in createRequest:', error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.getStudentRequests = async (req, res) => {
  try {
    const requests = await CertificateRequest.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    let query = {};
    const { role, id, department } = req.user;

    if (role === 'classAdviser') {
      const myStudents = await User.find({ adviser: id }).select('_id');
      const studentIds = myStudents.map(student => student._id);
      query = { student: { $in: studentIds } };
    } 
    else if (role === 'hod') {
      const studentsInDepartment = await User.find({ department: department }).select('_id');
      const studentIds = studentsInDepartment.map(s => s._id);
      query = { 
        student: { $in: studentIds },
        status: 'Pending HOD Approval' // Only show requests at this specific stage
      };
    }

    const requests = await CertificateRequest.find(query)
      .populate('student', 'name email studentId department')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.processRequest = async (req, res) => {
  const { action, comment } = req.body;
  const staff = req.user;
  try {
    const request = await CertificateRequest.findById(req.params.id).populate('student', 'name email');
    if (!request) { return res.status(404).json({ message: 'Request not found' }); }

    let nextStatus = '';
    const currentStatus = request.status;
    const userRole = staff.role;

    if (action === 'reject') {
      nextStatus = 'Rejected';
    } else if (action === 'approve') {
      if (userRole === 'classAdviser' && currentStatus === 'Pending Adviser Approval') nextStatus = 'Pending HOD Approval';
      else if (userRole === 'hod' && currentStatus === 'Pending HOD Approval') nextStatus = 'Pending Principal Approval';
      else if (userRole === 'principal' && currentStatus === 'Pending Principal Approval') nextStatus = 'Ready for Collection';
      else return res.status(400).json({ message: `Approval from a ${userRole} is not applicable at the '${currentStatus}' status.` });
    } else if (action === 'collect') {
      if (userRole === 'officeStaff' && currentStatus === 'Ready for Collection') nextStatus = 'Collected';
      else return res.status(400).json({ message: 'Collect action is not applicable.' });
    } else {
      return res.status(400).json({ message: 'Invalid action specified.' });
    }
    
    if (!nextStatus) { return res.status(400).json({ message: 'Action cannot be performed at the current status.' }); }

    const finalComment = comment || (action === 'reject' ? 'No reason provided.' : `Request was processed.`);
    request.status = nextStatus;
    request.remarks.push({ status: nextStatus, updatedBy: `${staff.name} (${staff.role})`, comment: finalComment });
    const updatedRequest = await request.save();

    if (request.student && request.student.email) {
      try {
        await transporter.sendMail({
          from: `"CertTrack" <${process.env.EMAIL_USER}>`,
          to: request.student.email,
          subject: `Update on your ${request.certificateType} request`,
          html: `<h1>Hi ${request.student.name},</h1><p>There has been an update on your certificate request.</p><p><b>New Status:</b> <strong>${nextStatus}</strong></p><p><b>Comment:</b> ${finalComment}</p><br><p>You can view the full details by logging into the portal.</p>`,
        });
        console.log(`Status update email sent to ${request.student.email}`);
      } catch (emailError) {
        console.error(`Failed to send status update email: ${emailError.message}`);
      }
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};