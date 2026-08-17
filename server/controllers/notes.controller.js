const supabase = require('../utils/supabase');
const path = require('path');
const fs = require('fs');

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

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

/** Format Supabase row to match frontend expectation */
function formatNote(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description || '',
    subjectName: row.subject_name,
    date: row.date,
    fileUrl: row.file_url,
    filename: row.filename,
    fileType: row.file_type || detectFileType(row.filename || row.file_url || ''),
    files: Array.isArray(row.files) ? row.files : [],
    uploadedBy: row.uploaded_by || 'admin',
    createdAt: row.created_at
  };
}

// ──────────────────────────────────────────────────────────
// Upload (multi-file)
// ──────────────────────────────────────────────────────────

exports.uploadNote = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    const files = req.files;
    let { title, description, subjectName, date } = req.body;

    if (!subjectName || !date) {
      return res.status(400).json({ msg: 'Missing required subject name or date' });
    }

    // Auto-generate title if not provided
    if (!title || !title.trim()) {
      if (files.length === 1) {
        title = files[0].originalname.replace(/\.[^/.]+$/, '');
      } else {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        title = `${subjectName} Notes (${formattedDate})`;
      }
    }
    description = description ? description.trim() : '';

    // Determine the dominant file type (image if first file is image)
    const primaryFileType = detectFileType(files[0].originalname);

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';

    let filesArray = files.map(file => ({
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      fileType: detectFileType(file.originalname)
    }));

    // Cloudinary upload if configured
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const cloudResults = [];
        for (const f of files) {
          const localPath = path.join(__dirname, '..', 'uploads', f.filename);
          const publicIdBase = `${Date.now()}-${f.filename.replace(/\.[^.]+$/, '')}`;
          const resourceType = getCloudinaryResourceType(f.originalname);
          const cloud = await uploadLocalFile(localPath, publicIdBase, resourceType);
          cloudResults.push({
            fileUrl: cloud.url,
            filename: f.filename,
            originalName: f.originalname,
            publicId: cloud.publicId,
            fileType: detectFileType(f.originalname)
          });
        }
        if (cloudResults.length === files.length) filesArray = cloudResults;
      }
    } catch (cloudErr) {
      console.log('⚠️ Cloud upload skipped:', cloudErr.message);
    }

    const { data: insertedNote, error } = await supabase
      .from('notes')
      .insert({
        title,
        description,
        subject_name: subjectName,
        date: new Date(date).toISOString(),
        file_url: filesArray[0].fileUrl,
        filename: filesArray[0].originalName || filesArray[0].filename,
        file_type: primaryFileType,
        files: filesArray,
        uploaded_by: req.admin?.username || 'admin'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      // If file_type column doesn't exist yet, retry without it
      if (error.message && error.message.includes('file_type')) {
        const { data: retryNote, error: retryErr } = await supabase
          .from('notes')
          .insert({
            title,
            description,
            subject_name: subjectName,
            date: new Date(date).toISOString(),
            file_url: filesArray[0].fileUrl,
            filename: filesArray[0].originalName || filesArray[0].filename,
            files: filesArray,
            uploaded_by: req.admin?.username || 'admin'
          })
          .select()
          .single();
        if (retryErr) return res.status(500).json({ error: retryErr.message });
        return res.json({
          note: formatNote(retryNote),
          message: `Note uploaded successfully with ${filesArray.length} file(s)!`,
          filesUploaded: files.length
        });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({
      note: formatNote(insertedNote),
      message: `Note uploaded successfully with ${filesArray.length} file(s)!`,
      filesUploaded: files.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────
// Upload (single file)
// ──────────────────────────────────────────────────────────

exports.uploadSingleNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const file = req.file;
    let { title, description, subjectName, date } = req.body;

    if (!subjectName || !date) {
      return res.status(400).json({ msg: 'Missing required subject name or date' });
    }

    if (!title || !title.trim()) {
      title = file.originalname.replace(/\.[^/.]+$/, '');
    }
    description = description ? description.trim() : '';

    const fileType = detectFileType(file.originalname);

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';
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

    const { data: insertedNote, error } = await supabase
      .from('notes')
      .insert({
        title,
        description,
        subject_name: subjectName,
        date: new Date(date).toISOString(),
        file_url: fileUrl,
        filename: file.originalname,
        file_type: fileType,
        files: [{ fileUrl, filename: file.filename, originalName: file.originalname, fileType }],
        uploaded_by: req.admin?.username || 'admin'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      // If file_type column doesn't exist, retry without it
      if (error.message && error.message.includes('file_type')) {
        const { data: retryNote, error: retryErr } = await supabase
          .from('notes')
          .insert({
            title,
            description,
            subject_name: subjectName,
            date: new Date(date).toISOString(),
            file_url: fileUrl,
            filename: file.originalname,
            files: [{ fileUrl, filename: file.filename, originalName: file.originalname, fileType }],
            uploaded_by: req.admin?.username || 'admin'
          })
          .select()
          .single();
        if (retryErr) return res.status(500).json({ error: retryErr.message });
        return res.json({
          note: formatNote(retryNote),
          message: 'Note uploaded successfully!'
        });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({
      note: formatNote(insertedNote),
      message: 'Note uploaded successfully!'
    });
  } catch (err) {
    console.error('Single upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────
// Read endpoints
// ──────────────────────────────────────────────────────────

exports.listSubjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('subject_name');

    if (error) {
      console.error('❌ Error fetching subjects:', error);
      return res.json([]);
    }

    const distinct = [...new Set((data || []).map(r => r.subject_name).filter(Boolean))].sort();
    const subjectList = distinct.map(name => ({ name }));
    res.json(subjectList);
  } catch (err) {
    console.error('❌ Error in listSubjects:', err);
    res.json([]);
  }
};

exports.listNotesBySubject = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('subject_name', subjectName)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) {
      console.error('Error fetching notes by subject:', error);
      return res.status(500).json({ error: error.message });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const notes = (data || []).map(formatNote);

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
    console.error('Error in listNotesBySubject:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) {
      console.error('❌ Supabase getAllNotes error:', error);
      return res.json({
        notes: [],
        pagination: { currentPage: 1, totalPages: 0, totalNotes: 0, hasNextPage: false, hasPrevPage: false }
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const notes = (data || []).map(formatNote);

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
    console.error('❌ Error fetching all notes:', err);
    res.json({
      notes: [],
      pagination: { currentPage: 1, totalPages: 0, totalNotes: 0, hasNextPage: false, hasPrevPage: false }
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

    if (error || !data) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(formatNote(data));
  } catch (err) {
    console.error('Error fetching note by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────
// Update / Delete
// ──────────────────────────────────────────────────────────

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subjectName, date } = req.body;

    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (subjectName) updatePayload.subject_name = subjectName;
    if (date) updatePayload.date = new Date(date).toISOString();

    const { data, error } = await supabase
      .from('notes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      note: formatNote(data),
      message: 'Note updated successfully'
    });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: note, error: fetchErr } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    const { error: delErr } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (delErr) {
      return res.status(500).json({ error: delErr.message });
    }

    // Clean up local file if stored locally
    if (note.file_url && note.file_url.includes('/uploads/')) {
      const filename = note.filename || path.basename(note.file_url);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    res.json({ msg: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: err.message });
  }
};
