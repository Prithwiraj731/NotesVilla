const express = require('express');
const router = express.Router();
const notesCtrl = require('../controllers/notes.controller');
const adminMiddleware = require('../middleware/admin.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists in server folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept documents + images
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|heic|tiff|svg|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar|mp4|mp3|wav|avi|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not supported. Allowed: Images (JPG, PNG, GIF, WebP, HEIC), Documents (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT), Archives (ZIP, RAR), Media (MP4, MP3)'));
    }
  }
});

// ──────────────────────────────────────────────────────────
// Multer 2.x + Express 5 compatibility wrapper
// multer 2.x returns a Promise instead of calling next().
// We must await it inside an async route handler.
// ──────────────────────────────────────────────────────────
function multerSingle(fieldName) {
  return async (req, res, next) => {
    try {
      await upload.single(fieldName)(req, res);
      next();
    } catch (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ msg: 'File too large. Maximum size is 50MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ msg: 'Unexpected field name for file upload.' });
        }
        return res.status(400).json({ msg: 'File upload error: ' + err.message });
      }
      if (err.message) {
        return res.status(400).json({ msg: err.message });
      }
      next(err);
    }
  };
}

function multerArray(fieldName, maxCount) {
  return async (req, res, next) => {
    try {
      await upload.array(fieldName, maxCount)(req, res);
      next();
    } catch (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ msg: 'File too large. Maximum size is 50MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ msg: 'Too many files. Maximum is 10 files.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ msg: 'Unexpected field name for file upload.' });
        }
        return res.status(400).json({ msg: 'File upload error: ' + err.message });
      }
      if (err.message) {
        return res.status(400).json({ msg: err.message });
      }
      next(err);
    }
  };
}

// ──────────────────────────────────────────────────────────
// Download routes (public, no auth)
// ──────────────────────────────────────────────────────────

router.get('/download-test', (req, res) => {
  res.json({
    message: 'Download route is accessible',
    uploadsDir: uploadsDir,
    timestamp: new Date().toISOString()
  });
});

router.get('/download/:filename', (req, res) => {
  try {
    const storedFilename = req.params.filename;
    const originalName = req.query.name || storedFilename;
    const filePath = path.join(uploadsDir, storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: 'File not found', requestedFile: storedFilename });
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(500).json({ msg: 'Error reading file' });
      }

      const ext = path.extname(originalName).toLowerCase();
      const contentTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.heic': 'image/heic',
        '.svg': 'image/svg+xml',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed'
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
      res.setHeader('Content-Length', data.length);
      res.send(data);
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────
// Upload routes (admin only)
// Auth runs first (reads headers only), then multer parses body+files
// ──────────────────────────────────────────────────────────

router.post('/upload',
  adminMiddleware,
  multerArray('files', 10),
  notesCtrl.uploadNote
);

router.post('/upload-single',
  adminMiddleware,
  multerSingle('file'),
  notesCtrl.uploadSingleNote
);

// ──────────────────────────────────────────────────────────
// Public read endpoints
// ──────────────────────────────────────────────────────────

router.get('/subjects', notesCtrl.listSubjects);

router.get('/note/:id', notesCtrl.getNoteById);

router.put('/note/:id', adminMiddleware, notesCtrl.updateNote);

router.delete('/note/:id', adminMiddleware, notesCtrl.deleteNote);

router.get('/', notesCtrl.getAllNotes);

router.get('/subject/:subjectName', notesCtrl.listNotesBySubject);

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    message: 'Notes API is working',
    availableEndpoints: [
      'GET /api/notes/ (all notes)',
      'GET /api/notes/subjects',
      'GET /api/notes/download/:filename',
      'POST /api/notes/upload (admin, multi-file)',
      'POST /api/notes/upload-single (admin, single file)',
      'GET /api/notes/note/:id',
      'PUT /api/notes/note/:id (admin)',
      'DELETE /api/notes/note/:id (admin)'
    ]
  });
});

module.exports = router;
