// server/models/CertificateRequest.js
const mongoose = require('mongoose');

const CertificateRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateType: { type: String, required: true },
  purpose: { type: String, required: true },
  notes: { type: String },
  documentUrl: { type: String }, // New field for file link
  documentPublicId: { type: String }, // To manage the file on Cloudinary
  status: {
    type: String,
    enum: ['Requested', 'In Process', 'Signed by HOD', 'Principal Approval', 'Ready', 'Collected'],
    default: 'Requested'
  },
  remarks: [{ /* ... */ }],
}, { timestamps: true });

module.exports = mongoose.model('CertificateRequest', CertificateRequestSchema);