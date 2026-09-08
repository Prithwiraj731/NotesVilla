const mongoose = require('mongoose');
const Syllabus = require('../models/Syllabus');
const path = require('path');
const fs = require('fs');

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];

function detectFileType(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  return 'document';
}

function getCloudinaryResourceType(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'raw';
  return 'auto';
}

function formatSyllabus(doc) {
  if (!doc) return null;
  const id = doc._id ? doc._id.toString() : (doc.id ? doc.id.toString() : '');
  return {
    _id: id,
    id: id,
    title: doc.title,
    subjectName: doc.subjectName,
    description: doc.description || '',
    fileUrl: doc.fileUrl,
    filename: doc.filename,
    fileType: doc.fileType || detectFileType(doc.filename || doc.fileUrl || ''),
    uploadedBy: doc.uploadedBy || 'admin',
    createdAt: doc.createdAt
  };
}

// ──────────────────────────────────────────────────────────
// List all syllabus documents
// ──────────────────────────────────────────────────────────
exports.getAllSyllabus = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = {};
    if (subject && subject !== 'All') {
      filter.subjectName = subject;
    }

    const items = await Syllabus.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      syllabi: items.map(formatSyllabus)
    });
  } catch (err) {
    console.error('Error fetching syllabus archive:', err);
    res.status(500).json({ error: 'Failed to load syllabus documents' });
  }
};

// ──────────────────────────────────────────────────────────
// Upload Syllabus (Admin only)
// ──────────────────────────────────────────────────────────
exports.uploadSyllabus = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ msg: 'Please select a syllabus document file to upload' });
    }

    let { title, subjectName, description } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ msg: 'Subject name is required' });
    }

    if (!title || !title.trim()) {
      title = `${subjectName.trim()} Syllabus`;
    }

    const fileType = detectFileType(file.originalname);
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';
    let fileUrl = `${baseUrl}/uploads/${file.filename}`;

    // Cloudinary upload if configured
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const publicIdBase = `syllabus-${Date.now()}-${file.filename.replace(/\.[^.]+$/, '')}`;
        const resourceType = getCloudinaryResourceType(file.originalname);
        const cloud = await uploadLocalFile(path.join(__dirname, '..', 'uploads', file.filename), publicIdBase, resourceType);
        if (cloud?.url) fileUrl = cloud.url;
      }
    } catch (cloudErr) {
      console.log('⚠️ Syllabus cloud upload skipped:', cloudErr.message);
    }

    const syllabusDoc = await Syllabus.create({
      title: title.trim(),
      subjectName: subjectName.trim(),
      description: (description || '').trim(),
      fileUrl,
      filename: file.originalname,
      fileType,
      uploadedBy: req.admin?.username || 'admin'
    });

    res.json({
      syllabus: formatSyllabus(syllabusDoc),
      message: 'Syllabus uploaded successfully!'
    });
  } catch (err) {
    console.error('Error uploading syllabus:', err);
    res.status(500).json({ error: err.message || 'Failed to upload syllabus' });
  }
};

// ──────────────────────────────────────────────────────────
// Delete Syllabus (Admin only)
// ──────────────────────────────────────────────────────────
exports.deleteSyllabus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid syllabus ID' });
    }

    const syllabus = await Syllabus.findById(id);
    if (!syllabus) {
      return res.status(404).json({ msg: 'Syllabus not found' });
    }

    await Syllabus.findByIdAndDelete(id);

    // Delete local file if stored locally
    if (syllabus.fileUrl && syllabus.fileUrl.includes('/uploads/')) {
      const filename = syllabus.filename || path.basename(syllabus.fileUrl);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    res.json({ msg: 'Syllabus deleted successfully' });
  } catch (err) {
    console.error('Error deleting syllabus:', err);
    res.status(500).json({ error: 'Failed to delete syllabus' });
  }
};
