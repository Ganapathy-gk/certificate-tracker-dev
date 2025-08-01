// server/models/CertificateRequest.js
const mongoose = require('mongoose');

const CertificateRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateType: { type: String, required: true },
  purpose: { type: String, required: true },
  notes: { type: String },
  documentUrl: { type: String }, 
  documentPublicId: { type: String },
  status: {
    type: String,
    // UPDATED: New, descriptive statuses for the workflow
    enum: [
      'Pending Adviser Approval',
      'Pending HOD Approval',
      'Pending Principal Approval',
      'Ready for Collection',
      'Collected',
      'Rejected'
    ],
    default: 'Pending Adviser Approval' // UPDATED: New default status
  },
  remarks: [{
    status: String,
    updatedBy: String,
    date: { type: Date, default: Date.now },
    comment: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('CertificateRequest', CertificateRequestSchema);