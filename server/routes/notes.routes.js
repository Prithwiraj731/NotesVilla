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
    files: 100, // up to 100 files
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
// Multer middleware wrappers
// Properly invoke multer handler with callback so files are parsed
// before moving to the next handler.
// ──────────────────────────────────────────────────────────
function multerSingle(fieldName = 'file') {
  const handler = upload.any();
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ msg: 'File too large. Maximum size is 50MB.' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ msg: 'Too many files uploaded.' });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ msg: 'Unexpected file upload error. Please try again.' });
          }
          return res.status(400).json({ msg: 'File upload error: ' + err.message });
        }
        if (err.message) {
          return res.status(400).json({ msg: err.message });
        }
        return next(err);
      }

      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  };
}

function multerArray(fieldName = 'files', maxCount = 100) {
  const handler = upload.any();
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ msg: 'File too large. Maximum size is 50MB per file.' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ msg: `Too many files. Maximum is ${maxCount} files.` });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ msg: `Too many files or unexpected field. Maximum is ${maxCount} files.` });
          }
          return res.status(400).json({ msg: 'File upload error: ' + err.message });
        }
        if (err.message) {
          return res.status(400).json({ msg: err.message });
        }
        return next(err);
      }

      if (req.files && req.files.length > maxCount) {
        return res.status(400).json({ msg: `Too many files. Maximum is ${maxCount} files per note.` });
      }

      if (req.files && req.files.length > 0 && !req.file) {
        req.file = req.files[0];
      }

      next();
    });
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

router.get('/download/:filename', async (req, res) => {
  try {
    const storedFilename = req.params.filename;
    const originalName = req.query.name || storedFilename;
    const filePath = path.join(uploadsDir, storedFilename);

    // 1. Try local file first (works in development)
    if (fs.existsSync(filePath)) {
      return fs.readFile(filePath, (err, data) => {
        if (err) {
          return res.status(500).json({ msg: 'Error reading file' });
        }

        const ext = path.extname(originalName).toLowerCase();
        const contentType = getContentType(ext);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
        res.setHeader('Content-Length', data.length);
        res.send(data);
      });
    }

    // 2. Local file not found — look up the external URL from the database
    //    This handles Render's ephemeral filesystem where uploaded files are lost on restart
    console.log(`📂 Local file not found: ${storedFilename}, looking up external URL from database...`);

    let externalUrl = null;

    // Try Supabase first
    try {
      const supabase = require('../utils/supabase');
      // Search by file_url containing the stored filename, or by filename column
      // The filename column might store the original name, and file_url contains the multer name
      const { data: notes, error } = await supabase
        .from('notes')
        .select('file_url, files, filename')
        .or(`filename.eq.${storedFilename},file_url.ilike.%${storedFilename}%`);

      // Also try a broader search if the first query returned nothing
      let allNotes = notes;
      if ((!allNotes || allNotes.length === 0) && !error) {
        // Search within files JSONB - fetch recent notes and filter
        const { data: recentNotes } = await supabase
          .from('notes')
          .select('file_url, files, filename')
          .order('created_at', { ascending: false })
          .limit(100);
        if (recentNotes) {
          allNotes = recentNotes.filter(n =>
            (n.file_url && n.file_url.includes(storedFilename)) ||
            (Array.isArray(n.files) && n.files.some(f =>
              f.filename === storedFilename || (f.fileUrl && f.fileUrl.includes(storedFilename))
            ))
          );
        }
      }

      if (allNotes && allNotes.length > 0) {
        for (const note of allNotes) {
          // Check files array first
          if (Array.isArray(note.files)) {
            const match = note.files.find(f => 
              f.filename === storedFilename || 
              (f.fileUrl && f.fileUrl.includes(storedFilename))
            );
            if (match && match.fileUrl) {
              externalUrl = match.fileUrl;
              break;
            }
          }
          // Fallback to file_url
          if (note.file_url && (note.file_url.includes('cloudinary') || note.file_url.includes('supabase'))) {
            externalUrl = note.file_url;
            break;
          }
        }
      }
    } catch (dbErr) {
      console.log('⚠️ Supabase lookup failed:', dbErr.message);
    }

    // Try MongoDB if Supabase didn't find it
    if (!externalUrl) {
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          const Note = require('../models/Note');
          const note = await Note.findOne({
            $or: [
              { filename: storedFilename },
              { fileUrl: { $regex: storedFilename } },
              { 'files.filename': storedFilename }
            ]
          });
          if (note) {
            if (Array.isArray(note.files)) {
              const match = note.files.find(f => f.filename === storedFilename);
              if (match && match.fileUrl) externalUrl = match.fileUrl;
            }
            if (!externalUrl && note.fileUrl && (note.fileUrl.includes('cloudinary') || note.fileUrl.includes('supabase'))) {
              externalUrl = note.fileUrl;
            }
          }
        }
      } catch (mongoErr) {
        console.log('⚠️ MongoDB lookup failed:', mongoErr.message);
      }
    }

    // 3. Proxy the file from the external URL
    if (externalUrl) {
      console.log(`🔄 Proxying download from: ${externalUrl}`);
      try {
        const https = require('https');
        const http = require('http');
        const fetchModule = externalUrl.startsWith('https') ? https : http;

        return new Promise((resolve, reject) => {
          fetchModule.get(externalUrl, (proxyRes) => {
            if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
              // Follow redirect
              const redirectUrl = proxyRes.headers.location;
              fetchModule.get(redirectUrl, (redirectRes) => {
                const ext = path.extname(originalName).toLowerCase();
                const contentType = getContentType(ext);
                res.setHeader('Content-Type', redirectRes.headers['content-type'] || contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
                if (redirectRes.headers['content-length']) {
                  res.setHeader('Content-Length', redirectRes.headers['content-length']);
                }
                redirectRes.pipe(res);
              }).on('error', (err) => {
                res.status(500).json({ msg: 'Error proxying file (redirect)', error: err.message });
              });
              return;
            }

            if (proxyRes.statusCode !== 200) {
              res.status(proxyRes.statusCode).json({ msg: 'External file not accessible', status: proxyRes.statusCode });
              return;
            }

            const ext = path.extname(originalName).toLowerCase();
            const contentType = getContentType(ext);
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
            if (proxyRes.headers['content-length']) {
              res.setHeader('Content-Length', proxyRes.headers['content-length']);
            }
            proxyRes.pipe(res);
          }).on('error', (err) => {
            res.status(500).json({ msg: 'Error proxying file', error: err.message });
          });
        });
      } catch (proxyErr) {
        console.error('❌ Proxy download error:', proxyErr);
        return res.status(500).json({ msg: 'Error proxying file', error: proxyErr.message });
      }
    }

    return res.status(404).json({ msg: 'File not found locally or in cloud storage', requestedFile: storedFilename });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper for content types
function getContentType(ext) {
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
  return contentTypes[ext] || 'application/octet-stream';
}


// ──────────────────────────────────────────────────────────
// Upload routes (admin only)
// Auth runs first (reads headers only), then multer parses body+files
// ──────────────────────────────────────────────────────────

router.post('/upload',
  adminMiddleware,
  multerArray('files', 100),
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
