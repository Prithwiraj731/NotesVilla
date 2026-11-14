const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subjectName: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure a subject doesn't have duplicate folder names
folderSchema.index({ subjectName: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);

