const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
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
    const { title, description, subjectName, topicName, date } = req.body;

    // Validate required fields
    if (!title || !subjectName || !topicName || !date) {
      console.log('Missing required fields');
      return res.status(400).json({
        msg: 'Missing required fields',
        received: {
          title: !!title,
          subjectName: !!subjectName,
          topicName: !!topicName,
          date: !!date,
          filesCount: files.length
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
          const cloud = await uploadLocalFile(localPath, publicIdBase, 'auto');
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
      topicName,
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

    // Check if file was uploaded
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const file = req.file;
    const { title, description, subjectName, topicName, date } = req.body;

    // Validate required fields
    if (!title || !subjectName || !topicName || !date) {
      console.log('Missing required fields');
      return res.status(400).json({
        msg: 'Missing required fields',
        received: {
          title: !!title,
          subjectName: !!subjectName,
          topicName: !!topicName,
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
        const cloud = await uploadLocalFile(pathLib.join(__dirname, '..', 'uploads', file.filename), publicIdBase, 'auto');
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
          topicName,
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
      topicName,
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
    res.status(500).json({
      error: err.message,
      details: 'Check server console for more details'
    });
  }
};

exports.listSubjects = async (req, res) => {
  try {
    console.log('📋 Fetching subjects...');

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected for subjects fetch');
      return res.json([]); // Return empty array if DB not connected
    }

    // Get unique subject names from notes in MongoDB
    const subjects = await Note.distinct('subjectName');
    const subjectList = subjects.map(name => ({ name }));
    console.log('✅ Subjects found:', subjectList.length);
    res.json(subjectList);
  } catch (err) {
    console.error('❌ Error fetching subjects:', err);
    res.json([]); // Return empty array on error instead of 500
  }
};

exports.listTopics = async (req, res) => {
  try {
    const { subjectName } = req.params;
    // Get unique topic names for the given subject from MongoDB
    const topics = await Note.distinct('topicName', { subjectName });
    const topicList = topics.map(name => ({ name }));
    res.json(topicList);
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listNotesByTopic = async (req, res) => {
  try {
    const { subjectName, topicName } = req.params;
    const notes = await Note.find({ subjectName, topicName }).sort({ date: -1, createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes by topic:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listNotesBySubject = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const notes = await Note.find({ subjectName }).sort({ date: -1, createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes by subject:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    console.log('📋 Fetching all notes...');

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected for notes fetch');
      return res.json([]); // Return empty array if DB not connected
    }

    const notes = await Note.find().sort({ date: -1, createdAt: -1 });
    console.log('✅ Notes found:', notes.length);
    res.json(notes);
  } catch (err) {
    console.error('❌ Error fetching all notes:', err);
    res.json([]); // Return empty array on error instead of 500
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Fetching note by ID:', id);

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected for single note fetch');
      return res.status(503).json({ error: 'Database not available' });
    }

    const note = await Note.findById(id);
    if (!note) {
      console.log('❌ Note not found with ID:', id);
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('✅ Note found:', note.title);
    res.json(note);
  } catch (err) {
    console.error('❌ Error fetching note by ID:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};
