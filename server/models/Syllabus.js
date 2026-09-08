const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subjectName: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  filename: { type: String, required: true },
  fileType: { type: String, default: 'document' },
  uploadedBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

syllabusSchema.index({ subjectName: 1 });
syllabusSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
