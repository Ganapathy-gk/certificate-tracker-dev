const CertificateRequest = require('../models/CertificateRequest');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a new certificate request
exports.createRequest = async (req, res) => {
  const { certificateType, purpose, notes } = req.body;
  
  try {
    let documentUrl = '';
    let documentPublicId = '';

    if (req.file) {
      // Create a unique filename without the extension
      const uniqueFilename = `${req.user.studentId}_${Date.now()}`;

      // Determine the resource type based on the file's mimetype
      let resource_type = 'raw';
      if (req.file.mimetype.startsWith('image/')) {
        resource_type = 'image';
      }

      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: 'certificates',
              public_id: uniqueFilename,
              resource_type: resource_type, // Use the detected resource type
            },
            (error, result) => {
              if (result) { resolve(result); } 
              else { reject(error); }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const result = await streamUpload(req);
      documentUrl = result.secure_url;
      documentPublicId = result.public_id;
    }

    const newRequest = new CertificateRequest({
      student: req.user.id,
      certificateType,
      purpose,
      notes,
      documentUrl,
      documentPublicId,
      remarks: [{ status: 'Requested', updatedBy: req.user.name, comment: 'Request submitted by student.' }],
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// --- The rest of the functions in this file remain the same ---

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
    const requests = await CertificateRequest.find({}).populate('student', 'name email studentId department').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { status, comment } = req.body;
  try {
    const request = await CertificateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    request.status = status;
    request.remarks.push({
      status,
      updatedBy: req.user.name,
      comment: comment || `Status updated to ${status}`,
    });
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};