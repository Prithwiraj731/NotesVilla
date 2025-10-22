const Subject = require('../models/Subject');
const Note = require('../models/Note');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

exports.uploadNote = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    const files = req.files;
    const { title, description, subjectName, date } = req.body;

    // Debug logging
    console.log('📝 Received request body:', req.body);
    console.log('📁 Received files:', files);
    console.log('🔍 Parsed fields:', { title, description, subjectName, date });

    // Validate required fields
    if (!title || !subjectName || !date) {
      console.log('❌ Missing required fields');
      console.log('📊 Field validation:', {
        title: !!title,
        subjectName: !!subjectName,
        date: !!date,
        filesCount: files ? files.length : 0
      });
      return res.status(400).json({
        msg: 'Missing required fields',
        received: {
          title: !!title,
          subjectName: !!subjectName,
          date: !!date,
          filesCount: files ? files.length : 0
        }
      });
    }

    console.log('Creating notes in database...');
    console.log('🔗 MongoDB connection state:', mongoose.connection.readyState);

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, returning early without saving to DB');
      return res.status(200).json({
        message: `${files.length} files uploaded successfully! (Database temporarily unavailable)`,
        filesCount: files.length
      });
    }

    console.log('✅ MongoDB is connected, proceeding to save note...');

    // Create file array for multiple files
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';
    let filesArray = files.map(file => ({
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      publicId: undefined
    }));

    // Optional: upload to Firebase Storage if configured
    try {
      // Prefer Cloudinary if available
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const pathLib = require('path');
        const cloudResults = [];
        for (const f of files) {
          const localPath = pathLib.join(__dirname, '..', 'uploads', f.filename);
          const publicIdBase = `${Date.now()}-${f.filename.replace(/\.[^.]+$/, '')}`;
          // Explicitly set resource type for PDFs and other documents
          const ext = f.filename.split('.').pop()?.toLowerCase();
          const isDocument = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar'].includes(ext);
          const resourceType = isDocument ? 'raw' : 'auto';
          const cloud = await uploadLocalFile(localPath, publicIdBase, resourceType);
          cloudResults.push({
            fileUrl: cloud.url,
            filename: f.filename,
            originalName: f.originalname,
            publicId: cloud.publicId
          });
        }
        if (cloudResults.length === files.length) filesArray = cloudResults;
      } else if (process.env.FIREBASE_BUCKET) {
        const { uploadFile } = require('../utils/firebase');
        const cloudResults = [];
        for (const f of files) {
          const destName = `notes/${Date.now()}-${f.filename}`;
          const publicUrl = await uploadFile(require('path').join(__dirname, '..', 'uploads', f.filename), destName);
          cloudResults.push({
            fileUrl: publicUrl,
            filename: f.filename,
            originalName: f.originalname
          });
        }
        if (cloudResults.length === files.length) filesArray = cloudResults;
      }
    } catch (cloudErr) {
      console.log('⚠️ Cloud upload skipped:', cloudErr.message);
    }

    // Create single note with multiple files
    const noteData = {
      title,
      description,
      subjectName,
      date: new Date(date),
      files: filesArray,
      // For backward compatibility, use first file as primary
      fileUrl: filesArray[0].fileUrl,
      filename: filesArray[0].originalName,
      uploadedBy: req.admin?.username || 'admin'
    };

    console.log('📝 Note data to save:', noteData);
    const note = await Note.create(noteData);

    console.log('🎉 Single note created successfully with multiple files!');
    console.log('📌 Note ID:', note._id);
    console.log('📄 Files count:', filesArray.length);

    res.json({
      note,
      message: `Note uploaded successfully with ${filesArray.length} file(s)!`,
      filesUploaded: files.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      error: err.message,
      details: 'Check server console for more details'
    });
  }
};

// Keep the original single file upload as a backup
exports.uploadSingleNote = async (req, res) => {
  try {
    console.log('Single file upload request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('Admin user:', req.admin);

    // Check if file was uploaded
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const file = req.file;
    const { title, description, subjectName, date } = req.body;

    // Debug logging
    console.log('📝 Single file upload - Received request body:', req.body);
    console.log('📁 Single file upload - Received file:', file);
    console.log('🔍 Single file upload - Parsed fields:', { title, description, subjectName, date });

    // Validate required fields
    if (!title || !subjectName || !date) {
      console.log('❌ Single file upload - Missing required fields');
      console.log('📊 Single file upload - Field validation:', {
        title: !!title,
        subjectName: !!subjectName,
        date: !!date,
        hasFile: !!file
      });
      return res.status(400).json({
        msg: 'Missing required fields',
        received: {
          title: !!title,
          subjectName: !!subjectName,
          date: !!date,
          hasFile: !!file
        }
      });
    }

    // Use appropriate base URL for file access
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';
    let fileUrl = `${baseUrl}/uploads/${file.filename}`;

    // Optional: upload to Firebase Storage if configured
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const pathLib = require('path');
        const publicIdBase = `${Date.now()}-${file.filename.replace(/\.[^.]+$/, '')}`;
        // Explicitly set resource type for PDFs and other documents
        const ext = file.filename.split('.').pop()?.toLowerCase();
        const isDocument = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar'].includes(ext);
        const resourceType = isDocument ? 'raw' : 'auto';
        const cloud = await uploadLocalFile(pathLib.join(__dirname, '..', 'uploads', file.filename), publicIdBase, resourceType);
        if (cloud?.url) fileUrl = cloud.url;
      } else if (process.env.FIREBASE_BUCKET) {
        const { uploadFile } = require('../utils/firebase');
        const destName = `notes/${Date.now()}-${file.filename}`;
        const publicUrl = await uploadFile(require('path').join(__dirname, '..', 'uploads', file.filename), destName);
        if (publicUrl) fileUrl = publicUrl;
      }
    } catch (cloudErr) {
      console.log('⚠️ Cloud upload skipped:', cloudErr.message);
    }

    console.log('Creating note in database...');
    console.log('🔗 MongoDB connection state:', mongoose.connection.readyState);

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, returning early without saving to DB');
      return res.status(200).json({
        message: 'File uploaded successfully! (Database temporarily unavailable)',
        fileUrl,
        note: {
          title,
          description,
          subjectName,
          date: new Date(date),
          fileUrl,
          filename: file.originalname,
          uploadedBy: req.admin?.username || 'admin'
        }
      });
    }

    console.log('✅ MongoDB is connected, proceeding to save note...');

    // Create note record with direct subject/topic names in MongoDB
    const noteData = {
      title,
      description,
      subjectName,
      date: new Date(date),
      fileUrl,
      filename: file.originalname,
      uploadedBy: req.admin?.username || 'admin'
    };

    console.log('📝 Note data to save:', noteData);
    const note = await Note.create(noteData);

    console.log('🎉 Note created successfully in MongoDB!');
    console.log('📌 Note ID:', note._id);
    res.json({
      note,
      message: 'Note uploaded and saved to database successfully!'
    });
  } catch (err) {
    console.error('Upload error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      error: err.message,
      details: 'Check server console for more details',
      type: err.name || 'UnknownError'
    });
  }
};

exports.listSubjects = async (req, res) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('📋 Fetching subjects...');
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      if (isDevelopment) {
        console.log('⚠️ MongoDB not connected for subjects fetch');
      }
      return res.json([]); // Return empty array if DB not connected
    }

    // Get unique subject names from notes in MongoDB
    const subjects = await Note.distinct('subjectName');
    const subjectList = subjects.map(name => ({ name }));

    if (isDevelopment) {
      console.log('✅ Subjects found:', subjectList.length);
    }

    res.json(subjectList);
  } catch (err) {
    console.error('❌ Error fetching subjects:', err);
    res.json([]); // Return empty array on error instead of 500
  }
};


exports.listNotesBySubject = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.log(`📋 Fetching notes for subject: ${subjectName}`);
    }

    // Add pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count for this subject
    const total = await Note.countDocuments({ subjectName });

    // Fetch notes with pagination
    const notes = await Note.find({ subjectName })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    if (isDevelopment) {
      console.log(`✅ Found ${notes.length}/${total} notes for subject: ${subjectName}`);
    }

    res.json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching notes by subject:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('📋 Fetching notes with pagination...');
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      if (isDevelopment) {
        console.log('⚠️ MongoDB not connected for notes fetch');
      }
      return res.json({
        notes: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalNotes: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    // Add pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default 20 notes per page
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await Note.countDocuments();

    // Fetch notes with pagination and lean() for better performance
    const notes = await Note.find()
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const totalPages = Math.ceil(total / limit);

    if (isDevelopment) {
      console.log(`✅ Notes found: ${notes.length}/${total} (page ${page}/${totalPages})`);
    }

    res.json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (err) {
    console.error('❌ Error fetching notes:', err);
    res.json({
      notes: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalNotes: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.log('📋 Fetching note by ID:', id);
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      if (isDevelopment) {
        console.log('⚠️ MongoDB not connected for single note fetch');
      }
      return res.status(503).json({ error: 'Database not available' });
    }

    const note = await Note.findById(id);
    if (!note) {
      if (isDevelopment) {
        console.log('❌ Note not found with ID:', id);
      }
      return res.status(404).json({ error: 'Note not found' });
    }

    if (isDevelopment) {
      console.log('✅ Note found:', note.title);
    }

    res.json(note);
  } catch (err) {
    console.error('❌ Error fetching note by ID:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};
