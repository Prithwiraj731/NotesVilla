const express = require('express');
const router = express.Router();
const notesCtrl = require('../controllers/notes.controller');
const adminMiddleware = require('../middleware/admin.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists in server folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file (increased from 10MB)
    fileCount: 10 // Allow up to 10 files
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 Multer file filter - Processing file:', file.originalname, 'Type:', file.mimetype);
    // Accept a wide range of file types for notes
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar|mp4|mp3|wav|avi|mov|gif|bmp|tiff|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      console.log('✅ File accepted:', file.originalname);
      return cb(null, true);
    } else {
      console.log('❌ File rejected:', file.originalname, 'Mimetype:', file.mimetype, 'Extension:', path.extname(file.originalname));
      cb(new Error('File type not supported. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP, RAR, Images, Videos, Audio files'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('❌ Multer error:', err.message);
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
  if (err.message && err.message.includes('files are allowed')) {
    return res.status(400).json({ msg: err.message });
  }
  next(err);
};

// Need to add middleware to allow authentication but not require admin for getting notes
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid' });
  }
};

// Add a simple test route for downloads (must be before the main download route)
router.get('/download-test', (req, res) => {
  console.log('📋 GET /api/notes/download-test called');
  res.json({
    message: 'Download route is accessible',
    uploadsDir: uploadsDir,
    timestamp: new Date().toISOString()
  });
});

// IMPORTANT: Download route must be FIRST to avoid conflicts with other routes
// Express 5 / path-to-regexp v6 compatible wildcard using a named splat
// Matches any filename including dots and subpaths
router.get('/download/:filename', (req, res) => {
  try {
    // Extract filename from named wildcard parameter
    const storedFilename = req.params.filename; // stored in uploads
    console.log('📥 GET /api/notes/download/:filename called with:', storedFilename);
    console.log('📁 Looking for file at:', uploadsDir);
    const originalName = req.query.name || storedFilename;
    const filePath = path.join(uploadsDir, storedFilename);

    console.log('📄 Stored filename:', storedFilename);
    console.log('📄 Original name:', originalName);
    console.log('📄 Full file path:', filePath);

    // List all files in uploads directory for debugging
    try {
      const allFiles = fs.readdirSync(uploadsDir);
      console.log('📂 Available files in uploads:', allFiles);
    } catch (err) {
      console.log('❌ Error reading uploads directory:', err.message);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      console.log('❌ Requested stored filename:', storedFilename);
      return res.status(404).json({ msg: 'File not found', requestedFile: storedFilename });
    }

    console.log('✅ File found, reading file content...');

    // Read file content and send with explicit download headers
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('❌ Error reading file:', err);
        return res.status(500).json({ msg: 'Error reading file' });
      }

      // Get file extension to determine content type
      const ext = path.extname(originalName).toLowerCase();
      let contentType = 'application/octet-stream'; // default

      // Set appropriate content type based on file extension
      const contentTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed'
      };

      if (contentTypes[ext]) {
        contentType = contentTypes[ext];
      }

      // Set headers to force download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
      res.setHeader('Content-Length', data.length);

      // Send the file content
      res.send(data);
      console.log('✅ File downloaded successfully:', originalName);
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin upload (only admin) - support both single and multiple files
router.post('/upload', (req, res, next) => {
  console.log('📤 POST /api/notes/upload - Route hit');
  console.log('📤 Headers:', req.headers);
  console.log('📤 Content-Type:', req.headers['content-type']);
  console.log('📤 Body keys:', Object.keys(req.body || {}));
  console.log('📤 Files before multer:', req.files);
  next();
}, adminMiddleware, upload.array('files', 10), (req, res, next) => {
  console.log('📤 Files after multer:', req.files);
  console.log('📤 Body after multer:', req.body);
  next();
}, handleMulterError, notesCtrl.uploadNote);
router.post('/upload-single', (req, res, next) => {
  console.log('📤 POST /api/notes/upload-single - Route hit');
  console.log('📤 Headers:', req.headers);
  console.log('📤 Content-Type:', req.headers['content-type']);
  console.log('📤 Body keys:', Object.keys(req.body || {}));
  console.log('📤 Files before multer:', req.files);
  next();
}, adminMiddleware, upload.single('file'), (req, res, next) => {
  console.log('📤 File after multer:', req.file);
  console.log('📤 Body after multer:', req.body);
  next();
}, handleMulterError, notesCtrl.uploadSingleNote);

// Public endpoints - no authentication required for viewing notes
router.get('/subjects', (req, res, next) => {
  console.log('📋 GET /api/notes/subjects called');
  next();
}, notesCtrl.listSubjects);


// Single note by ID - needs to be before other routes that might conflict
router.get('/note/:id', (req, res, next) => {
  console.log('📋 GET /api/notes/note/:id called with ID:', req.params.id);
  next();
}, notesCtrl.getNoteById);

// FIXED: Move the main notes endpoint BEFORE the more specific routes
router.get('/', (req, res, next) => {
  console.log('📋 GET /api/notes/ (root) called - fetching all notes');
  next();
}, notesCtrl.getAllNotes);


router.get('/subject/:subjectName', (req, res, next) => {
  console.log('📋 GET /api/notes/subject/:subjectName called');
  next();
}, notesCtrl.listNotesBySubject);

// Add a debug endpoint
router.get('/debug', (req, res) => {
  console.log('📋 GET /api/notes/debug called');
  res.json({
    message: 'Notes API is working',
    availableEndpoints: [
      'GET /api/notes/ (all notes)',
      'GET /api/notes/subjects',
      'GET /api/notes/download/:filename (download files)',
      'GET /api/notes/download-test (test download route)',
      'POST /api/notes/upload (admin only)'
    ]
  });
});

// Catch-all route removed to avoid path-to-regexp issues

module.exports = router;
