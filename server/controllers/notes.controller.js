const supabase = require('../utils/supabase');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');

// helpers
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'tiff', 'svg'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar'];

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

function getBaseUrl() {
  return process.env.BACKEND_URL
    || process.env.RENDER_EXTERNAL_URL
    || (process.env.NODE_ENV === 'production' ? 'https://notesvilla-sige.onrender.com' : 'http://localhost:5000');
}

// format note for frontend
function formatNote(row) {
  if (!row) return null;
  const id = row._id ? row._id.toString() : (row.id ? row.id.toString() : '');

  let category = row.category;
  if (!category || !['Theory', 'Lab', 'Suggestions'].includes(category)) {
    const text = `${row.title || ''} ${row.filename || ''} ${row.originalName || ''}`.toLowerCase();
    if (/\b(lab|practical|experiment|manual|viva)\b/i.test(text) || /lab\s*[-_]?\s*\d+/i.test(text)) {
      category = 'Lab';
    } else if (/\b(pyq|pyqs|suggestion|suggestions|important\s*questions?|model\s*paper|question\s*paper)\b/i.test(text)) {
      category = 'Suggestions';
    } else {
      category = 'Theory';
    }
  }

  let fileUrl = row.fileUrl || row.file_url || '';
  if (fileUrl.includes('notesvilla.onrender.com')) {
    fileUrl = fileUrl.replace(/https?:\/\/notesvilla\.onrender\.com/g, getBaseUrl());
  }

  const rawFiles = Array.isArray(row.files) ? row.files : [];
  const files = rawFiles.map(f => {
    let fUrl = f.fileUrl || '';
    if (fUrl.includes('notesvilla.onrender.com')) {
      fUrl = fUrl.replace(/https?:\/\/notesvilla\.onrender\.com/g, getBaseUrl());
    }
    return { ...f, fileUrl: fUrl };
  });

  return {
    _id: id,
    id: id,
    title: row.title,
    subjectName: row.subjectName || row.subject_name,
    category: category,
    date: row.date || row.createdAt || row.created_at,
    fileUrl: fileUrl,
    filename: row.filename,
    fileType: row.fileType || row.file_type || detectFileType(row.filename || fileUrl || ''),
    files: files,
    uploadedBy: row.uploadedBy || row.uploaded_by || 'admin',
    createdAt: row.createdAt || row.created_at
  };
}

// upload multi-file notes
exports.uploadNote = async (req, res) => {
  try {
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    let { title, subjectName, date, category } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ msg: 'Missing required subject name' });
    }

    const validCategories = ['Theory', 'Lab', 'Suggestions', 'Syllabus'];
    const noteCategory = validCategories.includes(category) ? category : 'Theory';
    const noteDate = date ? new Date(date) : new Date();

    // Auto-generate title if not provided
    if (!title || !title.trim()) {
      if (files.length === 1) {
        title = files[0].originalname.replace(/\.[^/.]+$/, '');
      } else {
        title = `${subjectName} ${noteCategory} Material`;
      }
    }

    const primaryFileType = detectFileType(files[0].originalname);

    const baseUrl = getBaseUrl();

    let filesArray = files.map(file => ({
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      fileType: detectFileType(file.originalname)
    }));

    // Cloudinary upload if configured (parallel upload for speed)
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const cloudResults = await Promise.all(
          files.map(async (f, idx) => {
            const localPath = path.join(__dirname, '..', 'uploads', f.filename);
            const publicIdBase = `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}-${f.filename.replace(/\.[^.]+$/, '')}`;
            const resourceType = getCloudinaryResourceType(f.originalname);
            const cloud = await uploadLocalFile(localPath, publicIdBase, resourceType);
            return {
              fileUrl: cloud.url,
              filename: f.filename,
              originalName: f.originalname,
              publicId: cloud.publicId,
              fileType: detectFileType(f.originalname)
            };
          })
        );
        if (cloudResults.length === files.length) filesArray = cloudResults;
      }
    } catch (cloudErr) {
      console.log('⚠️ Cloud upload skipped:', cloudErr.message);
    }

    let savedNote = null;

    // 1. Try Supabase
    try {
      const { data: insertedNote, error: supabaseError } = await supabase
        .from('notes')
        .insert({
          title,
          subject_name: subjectName,
          category: noteCategory,
          date: noteDate.toISOString(),
          file_url: filesArray[0].fileUrl,
          filename: filesArray[0].originalName || filesArray[0].filename,
          file_type: primaryFileType,
          files: filesArray,
          uploaded_by: req.admin?.username || 'admin'
        })
        .select()
        .single();

      if (!supabaseError && insertedNote) {
        savedNote = formatNote(insertedNote);
      }
    } catch (e) {
      console.log('⚠️ Supabase insert exception:', e.message);
    }

    // 2. Fallback to MongoDB if Supabase failed or table is missing
    if (!savedNote && mongoose.connection.readyState === 1) {
      const mongoNote = await Note.create({
        title,
        subjectName,
        category: noteCategory,
        date: noteDate,
        fileUrl: filesArray[0].fileUrl,
        filename: filesArray[0].originalName || filesArray[0].filename,
        fileType: primaryFileType,
        files: filesArray,
        uploadedBy: req.admin?.username || 'admin'
      });
      savedNote = formatNote(mongoNote);
      console.log('✅ Note saved successfully to MongoDB!');
    }

    if (!savedNote) {
      return res.status(500).json({ error: 'Failed to save note to database' });
    }

    invalidateNotesCache();

    res.json({
      note: savedNote,
      message: `Note uploaded successfully with ${filesArray.length} file(s)!`,
      filesUploaded: files.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

// upload single file
exports.uploadSingleNote = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    let { title, subjectName, date, category } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ msg: 'Missing required subject name' });
    }

    const validCategories = ['Theory', 'Lab', 'Suggestions', 'Syllabus'];
    const noteCategory = validCategories.includes(category) ? category : 'Theory';
    const noteDate = date ? new Date(date) : new Date();

    if (!title || !title.trim()) {
      title = file.originalname.replace(/\.[^/.]+$/, '');
    }

    const fileType = detectFileType(file.originalname);

    const baseUrl = getBaseUrl();
    let fileUrl = `${baseUrl}/uploads/${file.filename}`;

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const publicIdBase = `${Date.now()}-${file.filename.replace(/\.[^.]+$/, '')}`;
        const resourceType = getCloudinaryResourceType(file.originalname);
        const cloud = await uploadLocalFile(path.join(__dirname, '..', 'uploads', file.filename), publicIdBase, resourceType);
        if (cloud?.url) fileUrl = cloud.url;
      }
    } catch (cloudErr) {
      console.log('⚠️ Cloud upload skipped:', cloudErr.message);
    }

    let savedNote = null;

    // 1. Try Supabase
    try {
      const { data: insertedNote, error: supabaseError } = await supabase
        .from('notes')
        .insert({
          title,
          subject_name: subjectName,
          category: noteCategory,
          date: noteDate.toISOString(),
          file_url: fileUrl,
          filename: file.originalname,
          file_type: fileType,
          files: [{ fileUrl, filename: file.filename, originalName: file.originalname, fileType }],
          uploaded_by: req.admin?.username || 'admin'
        })
        .select()
        .single();

      if (!supabaseError && insertedNote) {
        savedNote = formatNote(insertedNote);
      }
    } catch (e) {
      console.log('⚠️ Supabase single upload exception:', e.message);
    }

    // 2. Fallback to MongoDB
    if (!savedNote && mongoose.connection.readyState === 1) {
      const mongoNote = await Note.create({
        title,
        subjectName,
        category: noteCategory,
        date: noteDate,
        fileUrl: fileUrl,
        filename: file.originalname,
        fileType: fileType,
        files: [{ fileUrl, filename: file.filename, originalName: file.originalname, fileType }],
        uploadedBy: req.admin?.username || 'admin'
      });
      savedNote = formatNote(mongoNote);
      console.log('✅ Single note saved successfully to MongoDB!');
    }

    if (!savedNote) {
      return res.status(500).json({ error: 'Failed to save single note to database' });
    }

    invalidateNotesCache();

    res.json({
      note: savedNote,
      message: 'Note uploaded successfully!'
    });
  } catch (err) {
    console.error('Single upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

// In-memory cache for fast response times
const notesCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCached(key) {
  const item = notesCache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data;
  }
  return null;
}

function setCache(key, data) {
  notesCache.set(key, { data, timestamp: Date.now() });
}

function invalidateNotesCache() {
  notesCache.clear();
}
exports.invalidateNotesCache = invalidateNotesCache;

// fetch all subjects
exports.listSubjects = async (req, res) => {
  try {
    const cacheKey = 'subjects_list';
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // 1. Prioritize MongoDB if connected (primary source of truth)
    if (mongoose.connection.readyState === 1) {
      try {
        const subjects = await Note.distinct('subjectName');
        if (subjects && subjects.length > 0) {
          const formatted = subjects.filter(Boolean).sort().map(name => ({ name }));
          setCache(cacheKey, formatted);
          return res.json(formatted);
        }
      } catch (mErr) {
        console.warn('⚠️ MongoDB listSubjects query error:', mErr.message);
      }
    }

    // 2. Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('subject_name');

      if (!error && data && data.length > 0) {
        const distinct = [...new Set(data.map(r => r.subject_name).filter(Boolean))].sort();
        const formatted = distinct.map(name => ({ name }));
        setCache(cacheKey, formatted);
        return res.json(formatted);
      }
    } catch (sErr) {
      // Supabase table may not exist
    }

    res.json([]);
  } catch (err) {
    console.error('❌ Error in listSubjects:', err);
    res.json([]);
  }
};

exports.listNotesBySubject = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const { category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const cacheKey = `subject_${subjectName}_${category || 'all'}_${page}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // 1. Prioritize MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const filter = { subjectName: new RegExp(`^${subjectName.trim()}$`, 'i') };
        if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
          filter.category = category;
        }
        const total = await Note.countDocuments(filter);
        const notes = await Note.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
        const totalPages = Math.ceil(total / limit);
        const responseData = {
          notes: notes.map(formatNote),
          pagination: {
            currentPage: page,
            totalPages,
            totalNotes: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        };
        setCache(cacheKey, responseData);
        return res.json(responseData);
      } catch (mErr) {
        console.warn('⚠️ MongoDB listNotesBySubject error:', mErr.message);
      }
    }

    // 2. Fallback to Supabase
    try {
      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' })
        .eq('subject_name', subjectName);
      
      if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
        query = query.eq('category', category);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (!error && data && data.length > 0) {
        const total = count || data.length;
        const totalPages = Math.ceil(total / limit);
        const responseData = {
          notes: data.map(formatNote),
          pagination: {
            currentPage: page,
            totalPages,
            totalNotes: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        };
        setCache(cacheKey, responseData);
        return res.json(responseData);
      }
    } catch (sErr) {}

    res.json({
      notes: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalNotes: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit
      }
    });
  } catch (err) {
    console.error('Error in listNotesBySubject:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const { category, subject } = req.query;

    const cacheKey = `all_notes_${subject || 'all'}_${category || 'all'}_${page}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // 1. Prioritize MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const filter = {};
        if (subject && subject !== 'All') {
          filter.subjectName = new RegExp(`^${subject.trim()}$`, 'i');
        }
        if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
          filter.category = category;
        }
        const total = await Note.countDocuments(filter);
        const notes = await Note.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
        const totalPages = Math.ceil(total / limit);
        const responseData = {
          notes: notes.map(formatNote),
          pagination: {
            currentPage: page,
            totalPages,
            totalNotes: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        };
        setCache(cacheKey, responseData);
        return res.json(responseData);
      } catch (mErr) {
        console.warn('⚠️ MongoDB getAllNotes error:', mErr.message);
      }
    }

    // 2. Fallback to Supabase
    try {
      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' });

      if (subject && subject !== 'All') {
        query = query.eq('subject_name', subject);
      }
      if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
        query = query.eq('category', category);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (!error && data && data.length > 0) {
        const total = count || data.length;
        const totalPages = Math.ceil(total / limit);
        const responseData = {
          notes: data.map(formatNote),
          pagination: {
            currentPage: page,
            totalPages,
            totalNotes: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        };
        setCache(cacheKey, responseData);
        return res.json(responseData);
      }
    } catch (sErr) {}

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
  } catch (err) {
    console.error('❌ Error fetching all notes:', err);
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

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return res.json(formatNote(data));
    }

    // Fallback to MongoDB
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const note = await Note.findById(id);
      if (note) {
        return res.json(formatNote(note));
      }
    }

    return res.status(404).json({ error: 'Note not found' });
  } catch (err) {
    console.error('Error fetching note by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// update note
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subjectName, date, category } = req.body;

    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (subjectName) updatePayload.subject_name = subjectName;
    if (date) updatePayload.date = new Date(date).toISOString();
    if (category) updatePayload.category = category;

    const { data, error } = await supabase
      .from('notes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      invalidateNotesCache();
      return res.json({
        note: formatNote(data),
        message: 'Note updated successfully'
      });
    }

    // Fallback to MongoDB
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const note = await Note.findById(id);
      if (note) {
        if (title) note.title = title;
        if (subjectName) note.subjectName = subjectName;
        if (date) note.date = new Date(date);
        if (category) note.category = category;
        await note.save();
        invalidateNotesCache();
        return res.json({
          note: formatNote(note),
          message: 'Note updated successfully'
        });
      }
    }

    res.status(404).json({ msg: 'Note not found' });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Check Supabase
    const { data: note, error: fetchErr } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (!fetchErr && note) {
      await supabase.from('notes').delete().eq('id', id);
      if (note.file_url && note.file_url.includes('/uploads/')) {
        const filename = note.filename || path.basename(note.file_url);
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      invalidateNotesCache();
      return res.json({ msg: 'Note deleted successfully' });
    }

    // Fallback to MongoDB
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const mongoNote = await Note.findById(id);
      if (mongoNote) {
        await Note.findByIdAndDelete(id);
        if (mongoNote.fileUrl && mongoNote.fileUrl.includes('/uploads/')) {
          const filename = mongoNote.filename || path.basename(mongoNote.fileUrl);
          const filePath = path.join(__dirname, '..', 'uploads', filename);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
          }
        }
        invalidateNotesCache();
        return res.json({ msg: 'Note deleted successfully' });
      }
    }

    res.status(404).json({ msg: 'Note not found' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: err.message });
  }
};
