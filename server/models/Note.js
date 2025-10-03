const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subjectName: { type: String, required: true }, // Store subject name directly
  date: { type: Date, required: true }, // User-specified date
  files: [{
    fileUrl: { type: String, required: true }, // cloud URL (Firebase) or local fallback
    filename: { type: String, required: true },
    originalName: { type: String, required: true }
  }],
  // Keep backward compatibility for single file notes
  fileUrl: { type: String },
  filename: { type: String },
  uploadedBy: { type: String }, // 'admin' or username
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', noteSchema);
