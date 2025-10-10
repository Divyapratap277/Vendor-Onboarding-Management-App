const mongoose = require('mongoose');

const onboardingTokenSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
  },
  vendorEmail: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  documents: [
    {
      fileName: { type: String, required: true },
      fileKey: { type: String, required: true }, // S3 object key
      fileType: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('OnboardingToken', onboardingTokenSchema);
