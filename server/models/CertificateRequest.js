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
    enum: [
      'Requested',
      'In Process',
      'Signed by HOD',
      'Principal Approval',
      'Ready',
      'Collected',
      'Rejected' 
    ],
    default: 'Requested'
  },
  remarks: [{
    status: String,
    updatedBy: String,
    date: { type: Date, default: Date.now },
    comment: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('CertificateRequest', CertificateRequestSchema);