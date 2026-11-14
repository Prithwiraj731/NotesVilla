const supabase = require('../utils/supabase');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
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

  const rawFolder = row.folderName || row.folder_name || null;
  const cleanFolder = (rawFolder && typeof rawFolder === 'string' && rawFolder.trim() && rawFolder.toLowerCase() !== 'none' && rawFolder.toLowerCase() !== 'root') ? rawFolder.trim() : null;
  const folderId = row.folderId ? row.folderId.toString() : (row.folder_id ? row.folder_id.toString() : null);

  return {
    _id: id,
    id: id,
    title: row.title,
    subjectName: row.subjectName || row.subject_name,
    folderName: cleanFolder,
    folderId: folderId,
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

// In-memory cache for fast response times
const notesCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

// upload multi-file notes
exports.uploadNote = async (req, res) => {
  try {
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    let { title, subjectName, date, category, folderName, folderId } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ msg: 'Missing required subject name' });
    }

    const trimmedSubject = subjectName.trim();
    const validCategories = ['Theory', 'Lab', 'Suggestions', 'Syllabus'];
    const noteCategory = validCategories.includes(category) ? category : 'Theory';
    const noteDate = date ? new Date(date) : new Date();

    // Auto-generate title if not provided
    if (!title || !title.trim()) {
      if (files.length === 1) {
        title = files[0].originalname.replace(/\.[^/.]+$/, '');
      } else {
        title = `${trimmedSubject} ${noteCategory} Material`;
      }
    }

    // Process Folder
    let cleanFolderName = (folderName && typeof folderName === 'string' && folderName.trim() && folderName.toLowerCase() !== 'none' && folderName.toLowerCase() !== 'root') ? folderName.trim() : null;
    let targetFolderId = null;

    if (cleanFolderName && mongoose.connection.readyState === 1) {
      try {
        let folderDoc = null;
        if (folderId && mongoose.Types.ObjectId.isValid(folderId)) {
          folderDoc = await Folder.findById(folderId);
        }
        if (!folderDoc) {
          folderDoc = await Folder.findOne({
            subjectName: new RegExp(`^${trimmedSubject}$`, 'i'),
            name: new RegExp(`^${cleanFolderName}$`, 'i')
          });
        }
        if (!folderDoc) {
          folderDoc = await Folder.create({
            name: cleanFolderName,
            subjectName: trimmedSubject
          });
        }
        targetFolderId = folderDoc._id;
        cleanFolderName = folderDoc.name;
      } catch (fErr) {
        console.log('⚠️ Folder process error:', fErr.message);
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
          subject_name: trimmedSubject,
          category: noteCategory,
          folder_name: cleanFolderName,
          folder_id: targetFolderId ? targetFolderId.toString() : null,
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

    // 2. Fallback to MongoDB
    if (!savedNote && mongoose.connection.readyState === 1) {
      const mongoNote = await Note.create({
        title,
        subjectName: trimmedSubject,
        category: noteCategory,
        folderName: cleanFolderName,
        folderId: targetFolderId,
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

    let { title, subjectName, date, category, folderName, folderId } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ msg: 'Missing required subject name' });
    }

    const trimmedSubject = subjectName.trim();
    const validCategories = ['Theory', 'Lab', 'Suggestions', 'Syllabus'];
    const noteCategory = validCategories.includes(category) ? category : 'Theory';
    const noteDate = date ? new Date(date) : new Date();

    if (!title || !title.trim()) {
      title = file.originalname.replace(/\.[^/.]+$/, '');
    }

    // Process Folder
    let cleanFolderName = (folderName && typeof folderName === 'string' && folderName.trim() && folderName.toLowerCase() !== 'none' && folderName.toLowerCase() !== 'root') ? folderName.trim() : null;
    let targetFolderId = null;

    if (cleanFolderName && mongoose.connection.readyState === 1) {
      try {
        let folderDoc = null;
        if (folderId && mongoose.Types.ObjectId.isValid(folderId)) {
          folderDoc = await Folder.findById(folderId);
        }
        if (!folderDoc) {
          folderDoc = await Folder.findOne({
            subjectName: new RegExp(`^${trimmedSubject}$`, 'i'),
            name: new RegExp(`^${cleanFolderName}$`, 'i')
          });
        }
        if (!folderDoc) {
          folderDoc = await Folder.create({
            name: cleanFolderName,
            subjectName: trimmedSubject
          });
        }
        targetFolderId = folderDoc._id;
        cleanFolderName = folderDoc.name;
      } catch (fErr) {
        console.log('⚠️ Folder process error (single):', fErr.message);
      }
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
          subject_name: trimmedSubject,
          category: noteCategory,
          folder_name: cleanFolderName,
          folder_id: targetFolderId ? targetFolderId.toString() : null,
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
        subjectName: trimmedSubject,
        category: noteCategory,
        folderName: cleanFolderName,
        folderId: targetFolderId,
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

// fetch all subjects
exports.listSubjects = async (req, res) => {
  try {
    const cacheKey = 'subjects_list';
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Race MongoDB and Supabase in parallel for fastest response
    const dbPromises = [];

    // MongoDB promise
    if (mongoose.connection.readyState === 1) {
      const mongoPromise = (async () => {
        const subjects = await Note.distinct('subjectName');
        if (!subjects || subjects.length === 0) throw new Error('No MongoDB subjects');
        return subjects.filter(Boolean).sort().map(name => ({ name }));
      })().catch(() => null);
      dbPromises.push(mongoPromise);
    }

    // Supabase promise
    const supabasePromise = (async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('subject_name');

      if (error || !data || data.length === 0) throw new Error('No Supabase subjects');
      const distinct = [...new Set(data.map(r => r.subject_name).filter(Boolean))].sort();
      return distinct.map(name => ({ name }));
    })().catch(() => null);
    dbPromises.push(supabasePromise);

    const results = await Promise.all(dbPromises);
    const formatted = results.find(r => r !== null && r.length > 0);

    if (formatted) {
      setCache(cacheKey, formatted);
      return res.json(formatted);
    }

    res.json([]);
  } catch (err) {
    console.error('❌ Error in listSubjects:', err);
    res.json([]);
  }
};

// ------------------- FOLDER MANAGEMENT -------------------

// List folders (optionally filtered by subjectName), including notes count
exports.listFolders = async (req, res) => {
  try {
    const { subjectName } = req.query;

    if (mongoose.connection.readyState !== 1) {
      return res.json({ folders: [], rootCount: 0 });
    }

    const filter = {};
    if (subjectName && subjectName.trim()) {
      filter.subjectName = new RegExp(`^${subjectName.trim()}$`, 'i');
    }

    // 1. Fetch folders from Folder collection
    const dbFolders = await Folder.find(filter).sort({ name: 1 }).lean();

    // 2. Auto-sync: discover any folderNames on existing notes not yet in Folder collection
    try {
      const distinctFolderNames = await Note.distinct('folderName', {
        ...filter,
        folderName: { $exists: true, $ne: null, $nin: ['', 'none', 'root'] }
      });

      const knownNames = new Set(dbFolders.map(f => f.name.toLowerCase()));

      for (const fName of distinctFolderNames) {
        if (fName && typeof fName === 'string' && !knownNames.has(fName.toLowerCase())) {
          const sampleNote = await Note.findOne({ ...filter, folderName: fName }).lean();
          const targetSubj = sampleNote?.subjectName || subjectName || '';
          if (targetSubj) {
            try {
              const newF = await Folder.create({ name: fName.trim(), subjectName: targetSubj.trim() });
              dbFolders.push(newF.toObject ? newF.toObject() : newF);
              knownNames.add(fName.toLowerCase());
            } catch (createErr) {
              // Ignore duplicate race conditions
            }
          }
        }
      }
    } catch (syncErr) {
      console.log('Folder sync error:', syncErr.message);
    }

    // 3. Count notes per folder
    const noteCounts = await Note.aggregate([
      { 
        $match: { 
          ...filter, 
          folderName: { $exists: true, $ne: null, $nin: ['', 'none', 'root'] } 
        } 
      },
      { 
        $group: { 
          _id: { $toLower: '$folderName' }, 
          count: { $sum: 1 }
        } 
      }
    ]);

    const countMap = {};
    noteCounts.forEach(c => {
      if (c._id) countMap[c._id] = c.count;
    });

    // 4. Count root notes (notes without a folder)
    const rootCount = await Note.countDocuments({
      ...filter,
      $or: [
        { folderName: null },
        { folderName: '' },
        { folderName: 'none' },
        { folderName: 'root' },
        { folderName: { $exists: false } }
      ]
    });

    const formattedFolders = dbFolders.map(f => ({
      _id: f._id.toString(),
      id: f._id.toString(),
      name: f.name,
      subjectName: f.subjectName,
      description: f.description || '',
      notesCount: countMap[f.name.toLowerCase()] || 0,
      createdAt: f.createdAt
    }));

    // Natural alphabetical sort
    formattedFolders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    res.json({
      folders: formattedFolders,
      rootCount
    });
  } catch (err) {
    console.error('Error in listFolders:', err);
    res.status(500).json({ error: err.message, folders: [], rootCount: 0 });
  }
};

// Create a custom folder under a subject
exports.createFolder = async (req, res) => {
  try {
    const { name, subjectName, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const trimmedName = name.trim();
    const trimmedSubj = subjectName.trim();

    // Check duplicate
    const existing = await Folder.findOne({
      subjectName: new RegExp(`^${trimmedSubj}$`, 'i'),
      name: new RegExp(`^${trimmedName}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ error: `Folder "${trimmedName}" already exists for ${trimmedSubj}` });
    }

    const folder = await Folder.create({
      name: trimmedName,
      subjectName: trimmedSubj,
      description: (description || '').trim()
    });

    invalidateNotesCache();

    res.status(201).json({
      folder: {
        _id: folder._id.toString(),
        id: folder._id.toString(),
        name: folder.name,
        subjectName: folder.subjectName,
        description: folder.description,
        notesCount: 0,
        createdAt: folder.createdAt
      },
      message: `Folder "${trimmedName}" created successfully for ${trimmedSubj}!`
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update folder name
exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const oldName = folder.name;
    const newName = name.trim();

    if (oldName.toLowerCase() !== newName.toLowerCase()) {
      const duplicate = await Folder.findOne({
        _id: { $ne: folder._id },
        subjectName: new RegExp(`^${folder.subjectName}$`, 'i'),
        name: new RegExp(`^${newName}$`, 'i')
      });
      if (duplicate) {
        return res.status(400).json({ error: `Folder "${newName}" already exists for ${folder.subjectName}` });
      }
    }

    folder.name = newName;
    if (description !== undefined) folder.description = description.trim();
    folder.updatedAt = new Date();
    await folder.save();

    // Update all notes in this folder
    await Note.updateMany(
      {
        subjectName: new RegExp(`^${folder.subjectName}$`, 'i'),
        $or: [
          { folderId: folder._id },
          { folderName: oldName }
        ]
      },
      {
        $set: {
          folderName: newName,
          folderId: folder._id
        }
      }
    );

    invalidateNotesCache();

    res.json({
      folder: {
        _id: folder._id.toString(),
        id: folder._id.toString(),
        name: folder.name,
        subjectName: folder.subjectName,
        description: folder.description,
        updatedAt: folder.updatedAt
      },
      message: 'Folder updated successfully'
    });
  } catch (err) {
    console.error('Error updating folder:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteNotes } = req.query;

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (deleteNotes === 'true') {
      // Delete all notes inside this folder
      await Note.deleteMany({
        subjectName: new RegExp(`^${folder.subjectName}$`, 'i'),
        $or: [
          { folderId: folder._id },
          { folderName: folder.name }
        ]
      });
    } else {
      // Safe: unassign notes back to subject root
      await Note.updateMany(
        {
          subjectName: new RegExp(`^${folder.subjectName}$`, 'i'),
          $or: [
            { folderId: folder._id },
            { folderName: folder.name }
          ]
        },
        {
          $set: {
            folderName: null,
            folderId: null
          }
        }
      );
    }

    await Folder.findByIdAndDelete(id);

    invalidateNotesCache();

    res.json({
      message: deleteNotes === 'true' 
        ? `Folder "${folder.name}" and all its notes were deleted.`
        : `Folder "${folder.name}" deleted. Notes have been moved to subject root.`
    });
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- NOTES RETRIEVAL -------------------

exports.listNotesBySubject = async (req, res) => {
  try {
    const { subjectName } = req.params;
    const { category, folder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const cacheKey = `subject_${subjectName}_${category || 'all'}_${folder || 'all'}_${page}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Race MongoDB and Supabase in parallel
    const dbPromises = [];

    // MongoDB promise
    if (mongoose.connection.readyState === 1) {
      const mongoPromise = (async () => {
        const filter = { subjectName: new RegExp(`^${subjectName.trim()}$`, 'i') };
        if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
          filter.category = category;
        }

        if (folder) {
          if (folder === 'root' || folder === 'none') {
            filter.$or = [
              { folderName: null },
              { folderName: '' },
              { folderName: 'none' },
              { folderName: 'root' },
              { folderName: { $exists: false } }
            ];
          } else {
            filter.folderName = new RegExp(`^${folder.trim()}$`, 'i');
          }
        }

        const [total, notes] = await Promise.all([
          Note.countDocuments(filter),
          Note.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
        ]);
        if (!notes || notes.length === 0) throw new Error('No MongoDB results');
        const totalPages = Math.ceil(total / limit);
        return {
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
      })().catch(() => null);
      dbPromises.push(mongoPromise);
    }

    // Supabase promise
    const supabasePromise = (async () => {
      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' })
        .eq('subject_name', subjectName);
      
      if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
        query = query.eq('category', category);
      }

      if (folder) {
        if (folder === 'root' || folder === 'none') {
          query = query.is('folder_name', null);
        } else {
          query = query.eq('folder_name', folder.trim());
        }
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (error || !data || data.length === 0) throw new Error('No Supabase results');
      const total = count || data.length;
      const totalPages = Math.ceil(total / limit);
      return {
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
    })().catch(() => null);
    dbPromises.push(supabasePromise);

    const results = await Promise.all(dbPromises);
    const responseData = results.find(r => r !== null);

    if (responseData) {
      setCache(cacheKey, responseData);
      return res.json(responseData);
    }

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
    const limit = parseInt(req.query.limit) || 200;
    const skip = (page - 1) * limit;
    const { category, subject, folder } = req.query;

    const cacheKey = `all_notes_${subject || 'all'}_${category || 'all'}_${folder || 'all'}_${page}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Race MongoDB and Supabase in parallel
    const dbPromises = [];

    // MongoDB promise
    if (mongoose.connection.readyState === 1) {
      const mongoPromise = (async () => {
        const filter = {};
        if (subject && subject !== 'All') {
          filter.subjectName = new RegExp(`^${subject.trim()}$`, 'i');
        }
        if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
          filter.category = category;
        }
        if (folder) {
          if (folder === 'root' || folder === 'none') {
            filter.$or = [
              { folderName: null },
              { folderName: '' },
              { folderName: 'none' },
              { folderName: 'root' },
              { folderName: { $exists: false } }
            ];
          } else {
            filter.folderName = new RegExp(`^${folder.trim()}$`, 'i');
          }
        }

        const [total, notes] = await Promise.all([
          Note.countDocuments(filter),
          Note.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
        ]);
        if (!notes || notes.length === 0) throw new Error('No MongoDB results');
        const totalPages = Math.ceil(total / limit);
        return {
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
      })().catch(() => null);
      dbPromises.push(mongoPromise);
    }

    // Supabase promise
    const supabasePromise = (async () => {
      let query = supabase
        .from('notes')
        .select('*', { count: 'exact' });

      if (subject && subject !== 'All') {
        query = query.eq('subject_name', subject);
      }
      if (category && ['Theory', 'Lab', 'Suggestions', 'Syllabus'].includes(category)) {
        query = query.eq('category', category);
      }
      if (folder) {
        if (folder === 'root' || folder === 'none') {
          query = query.is('folder_name', null);
        } else {
          query = query.eq('folder_name', folder.trim());
        }
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (error || !data || data.length === 0) throw new Error('No Supabase results');
      const total = count || data.length;
      const totalPages = Math.ceil(total / limit);
      return {
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
    })().catch(() => null);
    dbPromises.push(supabasePromise);

    const results = await Promise.all(dbPromises);
    const responseData = results.find(r => r !== null);

    if (responseData) {
      setCache(cacheKey, responseData);
      return res.json(responseData);
    }

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
    const { title, subjectName, date, category, folderName } = req.body;

    // 1. Try MongoDB first (primary working store)
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const note = await Note.findById(id);
      if (note) {
        if (title) note.title = title;
        if (subjectName) note.subjectName = subjectName;
        if (date) note.date = new Date(date);
        if (category) note.category = category;

        if (folderName !== undefined) {
          const cleanF = (folderName && typeof folderName === 'string' && folderName.trim() && folderName.toLowerCase() !== 'none' && folderName.toLowerCase() !== 'root') ? folderName.trim() : null;
          let targetFolderId = null;
          if (cleanF) {
            const targetSubject = (note.subjectName || subjectName || '').trim();
            let fDoc = await Folder.findOne({
              subjectName: new RegExp(`^${targetSubject}$`, 'i'),
              name: new RegExp(`^${cleanF}$`, 'i')
            });
            if (!fDoc) {
              fDoc = await Folder.create({
                name: cleanF,
                subjectName: targetSubject
              });
            }
            targetFolderId = fDoc._id;
          }
          note.folderName = cleanF;
          note.folderId = targetFolderId;
        }

        await note.save();
        invalidateNotesCache();
        return res.json({
          note: formatNote(note),
          message: 'Note updated successfully'
        });
      }
    }

    // 2. Supabase fallback
    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (subjectName) updatePayload.subject_name = subjectName;
    if (date) updatePayload.date = new Date(date).toISOString();
    if (category) updatePayload.category = category;
    if (folderName !== undefined) {
      updatePayload.folder_name = (folderName && typeof folderName === 'string' && folderName.trim() && folderName.toLowerCase() !== 'none' && folderName.toLowerCase() !== 'root') ? folderName.trim() : null;
    }

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

    res.status(404).json({ msg: 'Note not found' });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Check MongoDB
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

    res.status(404).json({ msg: 'Note not found' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: err.message });
  }
};
