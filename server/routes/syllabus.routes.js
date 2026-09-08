const express = require('express');
const router = express.Router();
const syllabusCtrl = require('../controllers/syllabus.controller');
const adminMiddleware = require('../middleware/admin.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'syllabus-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('File format not supported for syllabus document. Allowed: PDF, DOC, DOCX, PPT, PPTX, Images'));
  }
});

function multerSingle(fieldName = 'file') {
  const handler = upload.any();
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        return res.status(400).json({ msg: err.message || 'File upload error' });
      }
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  };
}

// Public: Get all syllabus items
router.get('/', syllabusCtrl.getAllSyllabus);

// Admin: Upload syllabus document
router.post('/upload', adminMiddleware, multerSingle('file'), syllabusCtrl.uploadSyllabus);

// Admin: Delete syllabus document
router.delete('/:id', adminMiddleware, syllabusCtrl.deleteSyllabus);

module.exports = router;
