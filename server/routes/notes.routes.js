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
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Allow up to 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept specific file types - prioritizing PNG for multiple uploads
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed!'));
    }
  }
});

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

// Admin upload (only admin) - support both single and multiple files
router.post('/upload', adminMiddleware, upload.array('files', 10), notesCtrl.uploadNote);
router.post('/upload-single', adminMiddleware, upload.single('file'), notesCtrl.uploadSingleNote);

// Public endpoints - no authentication required for viewing notes
router.get('/subjects', (req, res, next) => {
  console.log('📋 GET /api/notes/subjects called');
  next();
}, notesCtrl.listSubjects);

router.get('/topics/:subjectName', (req, res, next) => {
  console.log('📋 GET /api/notes/topics/:subjectName called with:', req.params.subjectName);
  next();
}, notesCtrl.listTopics);

// Download endpoint with proper headers and CORS - MOVED UP to avoid conflicts
router.get('/download/:filename', (req, res) => {
  console.log('📥 GET /api/notes/download/:filename called with:', req.params.filename);
  console.log('📁 Looking for file at:', uploadsDir);
  console.log('📄 Full file path:', path.join(uploadsDir, req.params.filename));

  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

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
    console.log('❌ Requested filename:', filename);
    return res.status(404).json({ error: 'File not found', requestedFile: filename });
  }

  // Get original filename from query parameter if provided
  const originalName = req.query.name || filename;

  // Set CORS headers for cross-origin downloads
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set proper headers for download
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // Send file
  res.download(filePath, originalName, (err) => {
    if (err) {
      console.error('❌ Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    } else {
      console.log('✅ File downloaded successfully:', originalName);
    }
  });
});

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

router.get('/subject/:subjectName/topic/:topicName', (req, res, next) => {
  console.log('📋 GET /api/notes/subject/:subjectName/topic/:topicName called');
  next();
}, notesCtrl.listNotesByTopic);

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
      'GET /api/notes/topics/:subjectName',
      'GET /api/notes/download/:filename',
      'POST /api/notes/upload (admin only)'
    ]
  });
});

module.exports = router;
