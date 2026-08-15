const supabase = require('../utils/supabase');
const path = require('path');
const fs = require('fs');

// Helper to format Supabase database row to match frontend expectation (_id and camelCase)
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
    files: Array.isArray(row.files) ? row.files : [],
    uploadedBy: row.uploaded_by || 'admin',
    createdAt: row.created_at
  };
}

exports.uploadNote = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    const files = req.files;
    let { title, description, subjectName, date } = req.body;

    if (!subjectName || !date) {
      return res.status(400).json({
        msg: 'Missing required subject name or date'
      });
    }

    if (!title || !title.trim()) {
      if (files.length === 1) {
        title = files[0].originalname.replace(/\.[^/.]+$/, "");
      } else {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        title = `${subjectName} Notes (${formattedDate})`;
      }
    }
    description = description ? description.trim() : '';

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';

    let filesArray = files.map(file => ({
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname
    }));

    // Cloudinary upload if configured
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const pathLib = require('path');
        const cloudResults = [];
        for (const f of files) {
          const localPath = pathLib.join(__dirname, '..', 'uploads', f.filename);
          const publicIdBase = `${Date.now()}-${f.filename.replace(/\.[^.]+$/, '')}`;
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
      }
    } catch (cloudErr) {
      console.log('⚠️ Cloud upload skipped:', cloudErr.message);
    }

    console.log('Inserting note into Supabase...');
    const { data: insertedNote, error } = await supabase
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

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    const note = formatNote(insertedNote);
    console.log('🎉 Note created in Supabase:', note._id);

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
      title = file.originalname.replace(/\.[^/.]+$/, "");
    }
    description = description ? description.trim() : '';

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://notesvilla.onrender.com'
      : 'http://localhost:5000';
    let fileUrl = `${baseUrl}/uploads/${file.filename}`;

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const { uploadLocalFile } = require('../utils/cloudinary');
        const pathLib = require('path');
        const publicIdBase = `${Date.now()}-${file.filename.replace(/\.[^.]+$/, '')}`;
        const ext = file.filename.split('.').pop()?.toLowerCase();
        const isDocument = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar'].includes(ext);
        const resourceType = isDocument ? 'raw' : 'auto';
        const cloud = await uploadLocalFile(pathLib.join(__dirname, '..', 'uploads', file.filename), publicIdBase, resourceType);
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
        files: [{ fileUrl, filename: file.filename, originalName: file.originalname }],
        uploaded_by: req.admin?.username || 'admin'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    const note = formatNote(insertedNote);
    res.json({
      note,
      message: 'Note uploaded and saved to Supabase database successfully!'
    });
  } catch (err) {
    console.error('Single upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.listSubjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('subject_name');

    if (error) {
      console.error('❌ Error fetching subjects from Supabase:', error);
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
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalNotes: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
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

    if (error || !data) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(formatNote(data));
  } catch (err) {
    console.error('Error fetching note by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

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
      message: 'Note updated successfully in Supabase'
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

    if (note.file_url && note.file_url.includes('/uploads/')) {
      const filename = note.filename || path.basename(note.file_url);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    res.json({ msg: 'Note deleted successfully from Supabase' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: err.message });
  }
};
