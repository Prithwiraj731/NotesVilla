const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subjectName: { type: String, required: true }, // Store subject name directly
  folderName: { type: String, default: null, trim: true }, // Folder under subject, or null/empty for root
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  date: { type: Date, default: Date.now },
  category: { type: String, enum: ['Theory', 'Lab', 'Suggestions', 'Syllabus'], default: 'Theory' },
  files: [{
    fileUrl: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String }
  }],
  fileUrl: { type: String },
  filename: { type: String },
  fileType: { type: String },
  uploadedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { strict: false });

noteSchema.index({ createdAt: -1 });
noteSchema.index({ subjectName: 1 });
noteSchema.index({ subjectName: 1, folderName: 1 });
noteSchema.index({ subjectName: 1, category: 1, createdAt: -1 });
noteSchema.index({ title: 'text' });

module.exports = mongoose.model('Note', noteSchema);
