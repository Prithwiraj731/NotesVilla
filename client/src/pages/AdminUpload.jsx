import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { resolveNoteCategory } from '../utils/categoryUtils';
import { 
  Upload, 
  FileText, 
  BookOpen, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Type,
  Layers,
  FlaskConical,
  HelpCircle,
  FolderPlus,
  Folder,
  FolderOpen,
  Edit3,
  Filter,
  X
} from 'lucide-react';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

export function getNoteFolder(note) {
  if (!note) return null;
  if (note.folderName && typeof note.folderName === 'string' && note.folderName.trim() && note.folderName.toLowerCase() !== 'none' && note.folderName.toLowerCase() !== 'root') {
    return note.folderName.trim();
  }
  if (note.topicName && typeof note.topicName === 'string' && note.topicName.trim()) {
    const t = note.topicName.trim();
    if (!['theory', 'lab', 'suggestions', 'syllabus'].includes(t.toLowerCase())) {
      return t;
    }
  }
  if (note.description && typeof note.description === 'string' && note.description.includes('[Folder:')) {
    const m = note.description.match(/\[Folder:\s*([^\]]+)\]/);
    if (m && m[1] && m[1].trim()) return m[1].trim();
  }
  return null;
}

export default function AdminUpload() {
  const navigate = useNavigate();

  // Active section tab: 'notes' | 'folders' | 'syllabus'
  const [activeTab, setActiveTab] = useState('notes');

  // Notes Form state
  const [form, setForm] = useState({
    title: '',
    subjectName: '',
    destination: 'root', // 'root' | 'folder'
    folderName: '',
    category: 'Theory', // 'Theory' | 'Lab' | 'Suggestions'
    files: []
  });

  // Quick inline folder create inside Notes Upload form
  const [showQuickFolderCreate, setShowQuickFolderCreate] = useState(false);
  const [quickFolderName, setQuickFolderName] = useState('');
  const [creatingQuickFolder, setCreatingQuickFolder] = useState(false);

  // Dedicated Folder Management form state
  const [folderForm, setFolderForm] = useState({
    subjectName: '',
    name: '',
    description: ''
  });
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Syllabus Form state
  const [syllabusForm, setSyllabusForm] = useState({
    title: '',
    subjectName: '',
    description: '',
    file: null
  });

  const [existingSubjects, setExistingSubjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [fetchingFolders, setFetchingFolders] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState([]);

  // Note management states
  const [notes, setNotes] = useState([]);
  const [fetchingNotes, setFetchingNotes] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Note archive filter states
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFolder, setFilterFolder] = useState('All');
  const [filterSearch, setFilterSearch] = useState('');

  // Folder delete/rename modals
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deleteFolderWithNotes, setDeleteFolderWithNotes] = useState(false);

  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Syllabus management states
  const [syllabi, setSyllabi] = useState([]);
  const [fetchingSyllabi, setFetchingSyllabi] = useState(false);
  const [deleteSyllabusModalOpen, setDeleteSyllabusModalOpen] = useState(false);
  const [syllabusToDelete, setSyllabusToDelete] = useState(null);

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
    fetchFolders();
    fetchSyllabi();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/notes/subjects');
      if (Array.isArray(res.data)) {
        setExistingSubjects(res.data.map(s => (typeof s === 'string' ? s : (s.name || s.subjectName || ''))).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      setFetchingFolders(true);
      let list = [];
      try {
        const res = await API.get('/notes/folders');
        list = res.data?.folders || (Array.isArray(res.data) ? res.data : []);
      } catch (apiErr) {
        if (apiErr.response?.status === 404 || apiErr.message?.includes('404')) {
          console.warn('⚠️ /notes/folders 404, using notes & local registry fallback');
        } else {
          throw apiErr;
        }
      }

      // Merge with localStorage custom folders
      let localFolders = [];
      try {
        localFolders = JSON.parse(localStorage.getItem('custom_folders') || '[]');
      } catch (e) {}

      // Discover folders from notes list in memory
      const discoveredFromNotes = [];
      notes.forEach(n => {
        const f = getNoteFolder(n);
        if (f) {
          discoveredFromNotes.push({
            id: 'disc_' + f,
            _id: 'disc_' + f,
            name: f,
            subjectName: n.subjectName,
            notesCount: 0
          });
        }
      });

      const combinedMap = new Map();
      [...list, ...localFolders, ...discoveredFromNotes].forEach(f => {
        if (f && f.name && f.subjectName) {
          const key = `${f.subjectName.toLowerCase()}:::${f.name.toLowerCase()}`;
          if (!combinedMap.has(key)) {
            combinedMap.set(key, f);
          }
        }
      });

      setFolders(Array.from(combinedMap.values()));
    } catch (err) {
      console.error('Error fetching folders:', err);
    } finally {
      setFetchingFolders(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setFetchingNotes(true);
      const response = await API.get('/notes?limit=300');
      const notesData = Array.isArray(response.data) ? response.data : (response.data.notes || []);
      setNotes(notesData);
      
      const distinct = [...new Set(notesData.map(n => n.subjectName).filter(Boolean))];
      if (distinct.length > 0) {
        setExistingSubjects(prev => [...new Set([...prev, ...distinct])]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setFetchingNotes(false);
    }
  };

  const fetchSyllabi = async () => {
    try {
      setFetchingSyllabi(true);
      try {
        const res = await API.get('/syllabus');
        if (res.data?.syllabi) {
          setSyllabi(res.data.syllabi);
          return;
        }
      } catch (err) {
        if (err.response?.status === 404 || err.message?.includes('404')) {
          const notesRes = await API.get('/notes?limit=250');
          const notesList = Array.isArray(notesRes.data) ? notesRes.data : (notesRes.data?.notes || []);
          const syllabusNotes = notesList.filter(n => 
            n.category === 'Syllabus' || 
            /syllabus/i.test(n.title || '') || 
            /syllabus/i.test(n.filename || '')
          ).map(n => ({
            _id: n._id || n.id,
            id: n._id || n.id,
            subjectName: n.subjectName,
            title: n.title,
            description: n.description || '',
            fileUrl: n.fileUrl,
            filename: n.filename,
            fileType: n.fileType,
            uploadedBy: n.uploadedBy || 'admin',
            createdAt: n.createdAt
          }));
          setSyllabi(syllabusNotes);
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error('Error fetching syllabi:', err);
    } finally {
      setFetchingSyllabi(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    navigate('/');
  };

  // Folders for currently selected subject in form
  const formSubjectFolders = useMemo(() => {
    if (!form.subjectName?.trim()) return [];
    const sLower = form.subjectName.trim().toLowerCase();
    return folders.filter(f => f.subjectName?.toLowerCase() === sLower);
  }, [folders, form.subjectName]);

  // Handle files selection
  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setForm(prev => {
      const updated = { ...prev, files: fileArray };
      if (!prev.title && fileArray.length === 1) {
        updated.title = fileArray[0].name.replace(/\.[^/.]+$/, '');
      }
      return updated;
    });

    if (fileArray.length > 0) {
      const previews = fileArray.map(file => {
        const preview = {
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type || file.name.split('.').pop().toUpperCase(),
          isImage: isImageFile(file.name),
          thumbnailUrl: null
        };
        if (preview.isImage && file.type.startsWith('image/')) {
          preview.thumbnailUrl = URL.createObjectURL(file);
        }
        return preview;
      });
      setFilePreview(previews);
    }
  };

  useEffect(() => {
    return () => {
      filePreview.forEach(p => {
        if (p.thumbnailUrl) URL.revokeObjectURL(p.thumbnailUrl);
      });
    };
  }, [filePreview]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Quick inline folder create with resilient fallback
  const handleQuickCreateFolder = async () => {
    if (!form.subjectName?.trim()) {
      setError('Please specify the Subject Name first before creating a folder.');
      return;
    }
    if (!quickFolderName?.trim()) {
      setError('Please provide a Folder Name.');
      return;
    }

    const trimmedSubj = form.subjectName.trim();
    const trimmedFolder = quickFolderName.trim();

    try {
      setCreatingQuickFolder(true);
      setError('');
      
      let createdFolder = null;
      try {
        const res = await API.post('/notes/folders', {
          name: trimmedFolder,
          subjectName: trimmedSubj
        });
        createdFolder = res.data?.folder;
      } catch (apiErr) {
        // Fallback: If backend is still deploying or returned 404/error, store folder locally and proceed seamlessly
        console.warn('⚠️ Server /notes/folders endpoint unavailable, registering folder locally:', apiErr.message);
        createdFolder = {
          _id: 'local_' + Date.now(),
          id: 'local_' + Date.now(),
          name: trimmedFolder,
          subjectName: trimmedSubj,
          notesCount: 0
        };
        try {
          const cur = JSON.parse(localStorage.getItem('custom_folders') || '[]');
          const filtered = cur.filter(f => !(f.name.toLowerCase() === trimmedFolder.toLowerCase() && f.subjectName.toLowerCase() === trimmedSubj.toLowerCase()));
          filtered.push(createdFolder);
          localStorage.setItem('custom_folders', JSON.stringify(filtered));
        } catch (e) {}
      }

      setSuccess(`📁 Folder "${trimmedFolder}" ready! Notes can now be uploaded into it.`);
      setQuickFolderName('');
      setShowQuickFolderCreate(false);

      // Add to folders state
      setFolders(prev => {
        const key = `${trimmedSubj.toLowerCase()}:::${trimmedFolder.toLowerCase()}`;
        const exists = prev.some(f => `${f.subjectName?.toLowerCase()}:::${f.name?.toLowerCase()}` === key);
        if (!exists && createdFolder) {
          return [...prev, createdFolder];
        }
        return prev;
      });

      // Automatically select the newly created folder
      setForm(prev => ({
        ...prev,
        destination: 'folder',
        folderName: trimmedFolder
      }));
    } catch (err) {
      console.error('Quick folder creation error:', err);
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to create folder');
    } finally {
      setCreatingQuickFolder(false);
    }
  };

  // Dedicated Folder creation with resilient fallback
  const handleCreateDedicatedFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.subjectName?.trim() || !folderForm.name?.trim()) {
      setError('Subject name and folder name are required');
      return;
    }

    const trimmedSubj = folderForm.subjectName.trim();
    const trimmedFolder = folderForm.name.trim();

    try {
      setCreatingFolder(true);
      setError('');
      setSuccess('');

      let createdFolder = null;
      try {
        const res = await API.post('/notes/folders', {
          name: trimmedFolder,
          subjectName: trimmedSubj,
          description: folderForm.description.trim()
        });
        createdFolder = res.data?.folder;
      } catch (apiErr) {
        // Fallback: If backend is still deploying or returned 404/error, store folder locally and proceed seamlessly
        console.warn('⚠️ Server /notes/folders endpoint unavailable, registering folder locally:', apiErr.message);
        createdFolder = {
          _id: 'local_' + Date.now(),
          id: 'local_' + Date.now(),
          name: trimmedFolder,
          subjectName: trimmedSubj,
          description: folderForm.description.trim(),
          notesCount: 0
        };
        try {
          const cur = JSON.parse(localStorage.getItem('custom_folders') || '[]');
          const filtered = cur.filter(f => !(f.name.toLowerCase() === trimmedFolder.toLowerCase() && f.subjectName.toLowerCase() === trimmedSubj.toLowerCase()));
          filtered.push(createdFolder);
          localStorage.setItem('custom_folders', JSON.stringify(filtered));
        } catch (e) {}
      }

      setSuccess(`📁 Folder "${trimmedFolder}" created successfully for ${trimmedSubj}!`);
      setFolderForm({ subjectName: '', name: '', description: '' });
      
      setFolders(prev => {
        const key = `${trimmedSubj.toLowerCase()}:::${trimmedFolder.toLowerCase()}`;
        const exists = prev.some(f => `${f.subjectName?.toLowerCase()}:::${f.name?.toLowerCase()}` === key);
        if (!exists && createdFolder) {
          return [...prev, createdFolder];
        }
        return prev;
      });
      fetchSubjects();
    } catch (err) {
      console.error('Folder create error:', err);
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  // Rename folder
  const openRenameFolderModal = (folder) => {
    setFolderToRename(folder);
    setRenameValue(folder.name);
    setRenameFolderModalOpen(true);
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !renameValue.trim()) return;
    try {
      setLoading(true);
      try {
        await API.put(`/notes/folders/${folderToRename._id || folderToRename.id}`, {
          name: renameValue.trim()
        });
      } catch (apiErr) {
        console.warn('⚠️ Server folder rename 404, updating in local registry');
      }

      // Update in localStorage
      try {
        const cur = JSON.parse(localStorage.getItem('custom_folders') || '[]');
        const updated = cur.map(f => {
          if (f.name === folderToRename.name && f.subjectName === folderToRename.subjectName) {
            return { ...f, name: renameValue.trim() };
          }
          return f;
        });
        localStorage.setItem('custom_folders', JSON.stringify(updated));
      } catch (e) {}

      setSuccess(`Folder renamed to "${renameValue.trim()}"`);
      setRenameFolderModalOpen(false);
      setFolderToRename(null);
      fetchFolders();
      fetchNotes();
    } catch (err) {
      console.error('Rename error:', err);
      setError(err.response?.data?.error || 'Failed to rename folder');
    } finally {
      setLoading(false);
    }
  };

  // Delete folder
  const openDeleteFolderModal = (folder) => {
    setFolderToDelete(folder);
    setDeleteFolderWithNotes(false);
    setDeleteFolderModalOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      setLoading(true);
      const id = folderToDelete._id || folderToDelete.id;
      try {
        await API.delete(`/notes/folders/${id}?deleteNotes=${deleteFolderWithNotes ? 'true' : 'false'}`);
      } catch (apiErr) {
        console.warn('⚠️ Server folder delete 404, removing from local registry');
      }

      // Remove from localStorage
      try {
        const cur = JSON.parse(localStorage.getItem('custom_folders') || '[]');
        const filtered = cur.filter(f => !(f.name === folderToDelete.name && f.subjectName === folderToDelete.subjectName));
        localStorage.setItem('custom_folders', JSON.stringify(filtered));
      } catch (e) {}

      setSuccess(`Folder "${folderToDelete.name}" removed.`);
      setDeleteFolderModalOpen(false);
      setFolderToDelete(null);
      fetchFolders();
      fetchNotes();
    } catch (err) {
      console.error('Delete folder error:', err);
      setError(err.response?.data?.error || 'Failed to delete folder');
    } finally {
      setLoading(false);
    }
  };

  // Update note's category
  const handleUpdateCategory = async (note, newCategory) => {
    try {
      setLoading(true);
      await API.put(`/notes/note/${note._id || note.id}`, { category: newCategory });
      setSuccess(`Updated category for "${note.title || note.filename}" to ${newCategory}`);
      fetchNotes();
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update note category');
    } finally {
      setLoading(false);
    }
  };

  // Update note's folder (Move note to folder or root)
  const handleUpdateNoteFolder = async (note, newFolderName) => {
    try {
      setLoading(true);
      const folderVal = newFolderName === '__root__' ? '' : newFolderName;
      try {
        await API.put(`/notes/note/${note._id || note.id}`, { 
          folderName: folderVal,
          topicName: folderVal || (note.category || 'Theory'),
          description: folderVal ? `[Folder: ${folderVal}]` : (note.category || 'Theory')
        });
      } catch (apiErr) {
        // Fallback update on older server versions
        await API.put(`/notes/note/${note._id || note.id}`, {
          topicName: folderVal || (note.category || 'Theory'),
          description: folderVal ? `[Folder: ${folderVal}]` : (note.category || 'Theory')
        });
      }
      setSuccess(`Moved note "${note.title || note.filename}" to ${folderVal ? `folder "${folderVal}"` : 'Subject Root'}`);
      fetchNotes();
      fetchFolders();
    } catch (err) {
      console.error('Failed to move note folder:', err);
      setError('Failed to update note folder');
    } finally {
      setLoading(false);
    }
  };

  // Delete note
  const confirmDeleteNote = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      setLoading(true);
      await API.delete(`/notes/note/${noteToDelete._id || noteToDelete.id}`);
      setSuccess('Note deleted successfully');
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      fetchNotes();
      fetchFolders();
      fetchSubjects();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.msg || 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  // Submit note upload
  const submitNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.subjectName?.trim()) {
      setError('Please provide or select a Subject Name');
      setLoading(false);
      return;
    }

    if (form.files.length === 0) {
      setError('Please select at least one file or image to upload');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      navigate('/admin/login');
      return;
    }

    let noteTitle = form.title?.trim();
    if (!noteTitle) {
      if (form.files.length === 1) {
        noteTitle = form.files[0].name.replace(/\.[^/.]+$/, '');
      } else {
        noteTitle = `${form.subjectName.trim()} ${form.category} Material`;
      }
    }

    const folderToUpload = form.destination === 'folder' && form.folderName?.trim()
      ? form.folderName.trim()
      : '';

    try {
      const data = new FormData();
      data.append('title', noteTitle);
      data.append('subjectName', form.subjectName.trim());
      data.append('category', form.category || 'Theory');
      data.append('date', new Date().toISOString());

      // Resilience: pass folder in folderName, topicName, and description so both new and old servers preserve folder
      if (folderToUpload) {
        data.append('folderName', folderToUpload);
        data.append('topicName', folderToUpload);
        data.append('description', `[Folder: ${folderToUpload}] ${form.category || 'Theory'}`);
      } else {
        data.append('topicName', form.category || 'Theory');
        data.append('description', form.category || 'Theory');
      }

      const isSingleFile = form.files.length === 1;
      const uploadUrl = isSingleFile ? '/notes/upload-single' : '/notes/upload';

      if (isSingleFile) {
        data.append('file', form.files[0]);
        data.append('files', form.files[0]);
      } else {
        form.files.forEach(file => data.append('files', file));
      }

      await API.post(uploadUrl, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (folderToUpload) {
        try {
          const cur = JSON.parse(localStorage.getItem('custom_folders') || '[]');
          if (!cur.some(f => f.name.toLowerCase() === folderToUpload.toLowerCase() && f.subjectName.toLowerCase() === form.subjectName.trim().toLowerCase())) {
            cur.push({
              _id: 'local_' + Date.now(),
              id: 'local_' + Date.now(),
              name: folderToUpload,
              subjectName: form.subjectName.trim(),
              notesCount: 1
            });
            localStorage.setItem('custom_folders', JSON.stringify(cur));
          }
        } catch (e) {}
      }

      setSuccess(
        `🎉 Successfully uploaded "${noteTitle}" (${form.category}) ${
          folderToUpload ? `into folder "${folderToUpload}"` : 'directly under subject'
        } for ${form.subjectName.trim()}!`
      );
      
      // Reset form
      setForm({
        title: '',
        subjectName: form.subjectName,
        destination: form.destination,
        folderName: form.folderName,
        category: form.category,
        files: []
      });
      setFilePreview([]);
      fetchNotes();
      fetchFolders();
      fetchSubjects();

    } catch (err) {
      console.error('Upload error:', err);
      const serverMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Upload failed';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // Submit syllabus upload
  const submitSyllabus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!syllabusForm.subjectName?.trim()) {
      setError('Please provide a Subject Name for the syllabus');
      setLoading(false);
      return;
    }

    if (!syllabusForm.file) {
      setError('Please select a syllabus document file to upload');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('subjectName', syllabusForm.subjectName.trim());
      data.append('title', syllabusForm.title.trim() || `${syllabusForm.subjectName.trim()} Syllabus`);
      data.append('description', syllabusForm.description.trim());
      data.append('file', syllabusForm.file);

      try {
        await API.post('/syllabus/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        if (err.response?.status === 404 || err.message?.includes('404')) {
          console.warn('⚠️ /syllabus/upload 404, using /notes/upload-single fallback');
          const fallbackData = new FormData();
          fallbackData.append('subjectName', syllabusForm.subjectName.trim());
          fallbackData.append('title', syllabusForm.title.trim() || `${syllabusForm.subjectName.trim()} Syllabus`);
          fallbackData.append('category', 'Syllabus');
          fallbackData.append('description', syllabusForm.description.trim() || 'Official Course Syllabus');
          fallbackData.append('date', new Date().toISOString());
          fallbackData.append('file', syllabusForm.file);
          fallbackData.append('files', syllabusForm.file);

          await API.post('/notes/upload-single', fallbackData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          throw err;
        }
      }

      setSuccess(`🎉 Successfully uploaded syllabus for ${syllabusForm.subjectName.trim()}!`);
      setSyllabusForm({
        title: '',
        subjectName: '',
        description: '',
        file: null
      });
      fetchSyllabi();
      fetchSubjects();
    } catch (err) {
      console.error('Syllabus upload error:', err);
      const serverMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Failed to upload syllabus';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete syllabus
  const confirmDeleteSyllabus = (syllabus) => {
    setSyllabusToDelete(syllabus);
    setDeleteSyllabusModalOpen(true);
  };

  const handleDeleteSyllabus = async () => {
    if (!syllabusToDelete) return;
    try {
      setLoading(true);
      const id = syllabusToDelete._id || syllabusToDelete.id;
      try {
        await API.delete(`/syllabus/${id}`);
      } catch (err) {
        if (err.response?.status === 404 || err.message?.includes('404')) {
          await API.delete(`/notes/note/${id}`);
        } else {
          throw err;
        }
      }
      setSuccess('Syllabus document deleted successfully');
      setDeleteSyllabusModalOpen(false);
      setSyllabusToDelete(null);
      fetchSyllabi();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete syllabus');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes archive using resilient getNoteFolder
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (filterSubject !== 'All' && note.subjectName?.toLowerCase() !== filterSubject.toLowerCase()) {
        return false;
      }
      if (filterCategory !== 'All' && resolveNoteCategory(note).toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }
      const noteFolder = getNoteFolder(note);
      if (filterFolder !== 'All') {
        if (filterFolder === '__root__') {
          if (noteFolder) return false;
        } else {
          if (noteFolder?.toLowerCase() !== filterFolder.toLowerCase()) {
            return false;
          }
        }
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const matchTitle = (note.title || '').toLowerCase().includes(q);
        const matchFile = (note.filename || '').toLowerCase().includes(q);
        const matchFolder = (noteFolder || '').toLowerCase().includes(q);
        if (!matchTitle && !matchFile && !matchFolder) return false;
      }
      return true;
    });
  }, [notes, filterSubject, filterCategory, filterFolder, filterSearch]);

  // Unique folders for the archive filter
  const archiveFilterFolders = useMemo(() => {
    if (filterSubject === 'All') {
      return [...new Set(folders.map(f => f.name).filter(Boolean))].sort();
    }
    return folders
      .filter(f => f.subjectName?.toLowerCase() === filterSubject.toLowerCase())
      .map(f => f.name)
      .sort();
  }, [folders, filterSubject]);

  return (
    <div className="admin-upload-page">
      {/* Top Admin Bar */}
      <div className="admin-upload-topbar">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.35rem 0.9rem'
        }}>
          <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.85rem'
          }}>
            Admin Control Center
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/notes')}
            className="cyber-btn-wire"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
          >
            <BookOpen size={14} /> <span>View Notes</span>
          </button>

          <button
            onClick={() => navigate('/syllabus')}
            className="cyber-btn-wire"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
          >
            <Layers size={14} /> <span>View Syllabus</span>
          </button>

          <button
            onClick={handleLogout}
            className="cyber-btn-wire"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#ef4444'
            }}
          >
            <LogOut size={14} /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="admin-tabs-row">
        <button
          type="button"
          onClick={() => { setActiveTab('notes'); setError(''); setSuccess(''); }}
          className={`admin-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Upload & Manage Notes</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('folders'); setError(''); setSuccess(''); }}
          className={`admin-tab-btn ${activeTab === 'folders' ? 'active' : ''}`}
        >
          <FolderOpen size={16} />
          <span>Manage Folders ({folders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('syllabus'); setError(''); setSuccess(''); }}
          className={`admin-tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>Manage Syllabus</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="admin-alert-box error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-alert-box success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* ================= TAB 1: NOTES UPLOAD & ARCHIVE ================= */}
      {activeTab === 'notes' && (
        <>
          <div className="cyber-panel admin-upload-card">
            <h2 className="admin-card-title">
              UPLOAD COURSE NOTES
            </h2>
            <p className="admin-card-subtitle">
              Choose whether to upload directly under the subject or file inside a specific folder (e.g. Lab 8, Lab 1-3, Modules).
            </p>

            <form onSubmit={submitNote} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              
              {/* 1. Subject Name */}
              <div>
                <label className="admin-field-label">
                  <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} />
                  1. Subject Name *
                </label>

                <input 
                  type="text"
                  list="existing-subjects-list"
                  placeholder="e.g. DBMS, Computer Architecture, Cloud Computing, Web Designing..."
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  required
                  className="admin-text-input"
                />

                <datalist id="existing-subjects-list">
                  {existingSubjects.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>

                {existingSubjects.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                      Quick Select:
                    </span>
                    {existingSubjects.map((subj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, subjectName: subj })}
                        style={{
                          background: form.subjectName === subj ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.08)',
                          color: form.subjectName === subj ? '#000000' : 'var(--text-secondary)',
                          border: '1px solid rgba(251, 54, 64, 0.2)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-body)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Destination / Folder Selection */}
              <div>
                <label className="admin-field-label">
                  <FolderOpen size={16} style={{ color: 'var(--accent-orange)' }} />
                  2. Upload Destination *
                </label>

                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, destination: 'root', folderName: '' }))}
                    className={`admin-category-btn ${form.destination === 'root' ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FileText size={16} />
                      <strong>Subject Root (Direct)</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>No folder • Visible directly in subject view</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, destination: 'folder' }))}
                    className={`admin-category-btn ${form.destination === 'folder' ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Folder size={16} />
                      <strong>Inside a Folder</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>e.g. Lab 8, Lab 1-3, Printing Materials</span>
                  </button>
                </div>

                {form.destination === 'folder' && (
                  <div className="folder-selection-subcard">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-tech)', display: 'block', marginBottom: '0.6rem' }}>
                      Choose an Existing Folder for <strong>"{form.subjectName || 'Current Subject'}"</strong> or create a custom one:
                    </label>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        value={form.folderName}
                        onChange={(e) => setForm(prev => ({ ...prev, folderName: e.target.value }))}
                        className="admin-text-input"
                        style={{ flex: 1, minWidth: '220px', cursor: 'pointer' }}
                      >
                        <option value="">-- Choose Existing Folder --</option>
                        {formSubjectFolders.map(f => (
                          <option key={f.id || f._id || f.name} value={f.name}>
                            📁 {f.name} ({f.notesCount || 0} {f.notesCount === 1 ? 'resource' : 'resources'})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowQuickFolderCreate(!showQuickFolderCreate)}
                        className="cyber-btn-wire"
                        style={{ padding: '0.65rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                      >
                        <FolderPlus size={15} />
                        <span>{showQuickFolderCreate ? 'Cancel New Folder' : '+ Create New Folder'}</span>
                      </button>
                    </div>

                    {/* Inline Quick Folder Creator */}
                    {showQuickFolderCreate && (
                      <div className="quick-folder-create-box">
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Custom folder name (e.g. Lab 8, Printing Materials)..."
                            value={quickFolderName}
                            onChange={(e) => setQuickFolderName(e.target.value)}
                            className="admin-text-input"
                            style={{ flex: 1, minWidth: '200px' }}
                          />
                          <button
                            type="button"
                            onClick={handleQuickCreateFolder}
                            disabled={creatingQuickFolder || !quickFolderName.trim()}
                            className="cyber-btn-orange"
                            style={{ padding: '0.65rem 1rem', fontSize: '0.82rem' }}
                          >
                            {creatingQuickFolder ? 'Creating...' : 'Create & Select'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Category Selection */}
              <div>
                <label className="admin-field-label">
                  <Layers size={16} style={{ color: 'var(--accent-orange)' }} />
                  3. Resource Category *
                </label>
                
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'Theory', label: 'Theory Notes', icon: BookOpen, desc: 'Lectures, concepts, modules' },
                    { key: 'Lab', label: 'Lab Notes', icon: FlaskConical, desc: 'Practicals, manuals, code' },
                    { key: 'Suggestions', label: 'Suggestions / PYQ', icon: HelpCircle, desc: 'Exam tips, questions, PYQs' }
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = form.category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.key })}
                        className={`admin-category-btn ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Icon size={16} />
                          <strong>{cat.label}</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{cat.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Note Title (Optional) */}
              <div>
                <label className="admin-field-label">
                  <Type size={16} style={{ color: 'var(--accent-orange)' }} />
                  4. Note Title <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'none', fontWeight: 'normal' }}>(Optional - auto-named if left blank)</span>
                </label>

                <input 
                  type="text"
                  placeholder="e.g. Unit 1 Architecture & Instructions, Lab 8 Observation Sheet..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="admin-text-input"
                />
              </div>

              {/* 5. Drag & Drop File Upload Area */}
              <div>
                <label className="admin-field-label">
                  <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
                  5. Upload Notes Files & Documents *
                </label>

                <div 
                  className={`admin-dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('note-file-input').click()}
                >
                  <input 
                    id="note-file-input"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.svg"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                  />

                  <Upload size={40} style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem', opacity: 0.8 }} />
                  <div style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                    CHOOSE FILES OR DRAG & DROP HERE
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Supports PDF, DOCX, PPT, Images (JPG, PNG, WebP) up to 50MB per file
                  </div>
                </div>

                {/* Previews */}
                {filePreview.length > 0 && (
                  <div className="admin-preview-grid">
                    {filePreview.map((f, i) => (
                      <div key={i} className="admin-preview-card">
                        {f.isImage && f.thumbnailUrl ? (
                          <img src={f.thumbnailUrl} alt={f.name} className="admin-preview-img" />
                        ) : (
                          <div className="admin-preview-icon">
                            <FileText size={28} />
                          </div>
                        )}
                        <div className="admin-preview-info">
                          <div className="admin-preview-name">{f.name}</div>
                          <div className="admin-preview-size">{f.size} • {f.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cyber-btn-orange admin-submit-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin-animate" />
                    <span>Uploading Note Material...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload & Publish Note</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Published Notes Archive with Folder bifurcation */}
          <div className="admin-archive-wrapper">
            <div className="admin-archive-header">
              <div>
                <h3 className="admin-archive-title">
                  PUBLISHED NOTES ARCHIVE ({filteredNotes.length} of {notes.length})
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Manage, categorize, or reassign notes to folders in real-time.
                </p>
              </div>

              <button
                onClick={() => { fetchNotes(); fetchFolders(); }}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} className={fetchingNotes ? 'spin-animate' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: 1 }}>
                {/* Subject filter */}
                <select
                  value={filterSubject}
                  onChange={(e) => {
                    setFilterSubject(e.target.value);
                    setFilterFolder('All');
                  }}
                  className="admin-filter-select"
                >
                  <option value="All">All Subjects</option>
                  {existingSubjects.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>

                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="All">All Categories</option>
                  <option value="Theory">Theory Notes</option>
                  <option value="Lab">Lab Notes</option>
                  <option value="Suggestions">Suggestions / PYQ</option>
                </select>

                {/* Folder filter */}
                <select
                  value={filterFolder}
                  onChange={(e) => setFilterFolder(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="All">All Folders / Root</option>
                  <option value="__root__">Subject Root Only (No Folder)</option>
                  {archiveFilterFolders.map((fName, idx) => (
                    <option key={idx} value={fName}>📁 Folder: {fName}</option>
                  ))}
                </select>
              </div>

              {/* Search in archive */}
              <input
                type="text"
                placeholder="Search note title or file..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="admin-filter-search"
              />
            </div>

            {fetchingNotes ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 0.5rem' }} />
                <div>Loading uploaded notes...</div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="cyber-panel admin-empty-box">
                <BookOpen size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.8rem', opacity: 0.6 }} />
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.3rem' }}>
                  No notes match your filters
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {filteredNotes.map((note) => {
                  const noteIsImage = note.fileType === 'image' || isImageFile(note.filename);
                  const cat = resolveNoteCategory(note);
                  const noteFolder = getNoteFolder(note);
                  const noteSubjectFolders = folders.filter(
                    f => f.subjectName?.toLowerCase() === note.subjectName?.toLowerCase()
                  );

                  return (
                    <div key={note._id || note.id} className="cyber-panel admin-note-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                        <div className="admin-item-icon">
                          {noteIsImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                            {note.title || note.filename}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                            <span className="admin-badge-subject">
                              {note.subjectName}
                            </span>
                            
                            {/* Category Badge & Switcher */}
                            <span 
                              className="admin-badge-category"
                              style={{
                                background: cat === 'Lab' ? 'rgba(59, 130, 246, 0.15)' : (cat === 'Suggestions' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                                color: cat === 'Lab' ? '#60a5fa' : (cat === 'Suggestions' ? '#c084fc' : '#10b981'),
                                border: `1px solid ${cat === 'Lab' ? 'rgba(59, 130, 246, 0.3)' : (cat === 'Suggestions' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`
                              }}
                            >
                              {cat}
                            </span>

                            <select
                              value={cat}
                              onChange={(e) => handleUpdateCategory(note, e.target.value)}
                              className="admin-inline-select"
                              title="Switch Category"
                            >
                              <option value="Theory">Theory</option>
                              <option value="Lab">Lab</option>
                              <option value="Suggestions">Suggestions</option>
                            </select>

                            {/* Folder Badge & Folder Reassignment Switcher */}
                            <span 
                              className="admin-badge-folder"
                              style={{
                                background: noteFolder ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: noteFolder ? '#facc15' : 'var(--text-muted)',
                                border: `1px solid ${noteFolder ? 'rgba(234, 179, 8, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`
                              }}
                            >
                              <Folder size={11} />
                              <span>{noteFolder || 'Subject Root'}</span>
                            </span>

                            <select
                              value={noteFolder || '__root__'}
                              onChange={(e) => handleUpdateNoteFolder(note, e.target.value)}
                              className="admin-inline-select folder-select"
                              title="Change Folder"
                            >
                              <option value="__root__">📁 Subject Root (Direct)</option>
                              {noteSubjectFolders.map(f => (
                                <option key={f.id || f._id || f.name} value={f.name}>
                                  📂 {f.name}
                                </option>
                              ))}
                            </select>

                            {note.filename && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {note.filename}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="admin-note-actions">
                        <a
                          href={note.fileUrl || (note.files && note.files[0]?.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="cyber-btn-wire"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} />
                          <span>View File</span>
                        </a>

                        <button
                          onClick={() => confirmDeleteNote(note)}
                          className="admin-delete-btn"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= TAB 2: FOLDER MANAGEMENT ================= */}
      {activeTab === 'folders' && (
        <>
          <div className="cyber-panel admin-upload-card">
            <h2 className="admin-card-title">
              CREATE CUSTOM SUBJECT FOLDER
            </h2>
            <p className="admin-card-subtitle">
              Create custom folders (e.g. Lab 8, Lab 1-3, Modules, Printing Materials) for any subject so students can find specific materials effortlessly.
            </p>

            <form onSubmit={handleCreateDedicatedFolder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Subject Name */}
              <div>
                <label className="admin-field-label">
                  <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} />
                  Subject Name *
                </label>

                <input 
                  type="text"
                  list="existing-subjects-folders-list"
                  placeholder="e.g. Web Designing, Cloud Computing, DBMS..."
                  value={folderForm.subjectName}
                  onChange={(e) => setFolderForm({ ...folderForm, subjectName: e.target.value })}
                  required
                  className="admin-text-input"
                />

                <datalist id="existing-subjects-folders-list">
                  {existingSubjects.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>

                {existingSubjects.length > 0 && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quick Select:</span>
                    {existingSubjects.map((subj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFolderForm({ ...folderForm, subjectName: subj })}
                        style={{
                          background: folderForm.subjectName === subj ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.08)',
                          color: folderForm.subjectName === subj ? '#000000' : 'var(--text-secondary)',
                          border: '1px solid rgba(251, 54, 64, 0.2)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Folder Name */}
              <div>
                <label className="admin-field-label">
                  <FolderPlus size={16} style={{ color: 'var(--accent-orange)' }} />
                  Custom Folder Name *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Lab 8, Lab 1-3, Unit 1 Notes, Printing Sheets..."
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  required
                  className="admin-text-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="admin-field-label">
                  <FileText size={16} style={{ color: 'var(--accent-orange)' }} />
                  Folder Description <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Lab 8 experiment manuals, observation printouts, code..."
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                  className="admin-text-input"
                />
              </div>

              <button
                type="submit"
                disabled={creatingFolder}
                className="cyber-btn-orange admin-submit-btn"
              >
                {creatingFolder ? (
                  <>
                    <RefreshCw size={18} className="spin-animate" />
                    <span>Creating Folder...</span>
                  </>
                ) : (
                  <>
                    <FolderPlus size={18} />
                    <span>Create Subject Folder</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Existing Folders List */}
          <div className="admin-archive-wrapper">
            <div className="admin-archive-header">
              <div>
                <h3 className="admin-archive-title">
                  ALL CREATED FOLDERS ({folders.length})
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Manage or delete subject folders. Deleting a folder safely keeps all notes in the subject root.
                </p>
              </div>

              <button
                onClick={fetchFolders}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} className={fetchingFolders ? 'spin-animate' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {fetchingFolders ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 0.5rem' }} />
                <div>Loading folders...</div>
              </div>
            ) : folders.length === 0 ? (
              <div className="cyber-panel admin-empty-box">
                <Folder size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.8rem', opacity: 0.6 }} />
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.3rem' }}>
                  No custom folders created yet
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Use the form above to create your first folder (e.g. "Lab 8").
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {folders.map((folder) => (
                  <div key={folder._id || folder.id} className="cyber-panel admin-note-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                      <div className="admin-item-icon" style={{ color: '#facc15' }}>
                        <FolderOpen size={18} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.98rem', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{folder.name}</span>
                          <span className="folder-notes-badge" style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem' }}>
                            {folder.notesCount || 0} {folder.notesCount === 1 ? 'Resource' : 'Resources'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="admin-badge-subject">
                            {folder.subjectName}
                          </span>
                          {folder.description && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                              {folder.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="admin-note-actions">
                      <button
                        onClick={() => navigate(`/notes?subject=${encodeURIComponent(folder.subjectName)}&folder=${encodeURIComponent(folder.name)}`)}
                        className="cyber-btn-wire"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <ExternalLink size={13} />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => openRenameFolderModal(folder)}
                        className="cyber-btn-wire"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Edit3 size={13} />
                        <span>Rename</span>
                      </button>

                      <button
                        onClick={() => openDeleteFolderModal(folder)}
                        className="admin-delete-btn"
                        title="Delete folder"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= TAB 3: SYLLABUS MANAGEMENT ================= */}
      {activeTab === 'syllabus' && (
        <>
          <div className="cyber-panel admin-upload-card">
            <h2 className="admin-card-title">
              UPLOAD COURSE SYLLABUS
            </h2>
            <p className="admin-card-subtitle">
              Upload the official syllabus document (PDF / DOC) for any academic subject. It will directly appear on the public /syllabus page.
            </p>

            <form onSubmit={submitSyllabus} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              
              {/* 1. Subject Name */}
              <div>
                <label className="admin-field-label">
                  <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} />
                  1. Subject Name *
                </label>

                <input 
                  type="text"
                  list="existing-subjects-list-syllabus"
                  placeholder="e.g. DBMS, Web Designing, Cloud Computing..."
                  value={syllabusForm.subjectName}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, subjectName: e.target.value })}
                  required
                  className="admin-text-input"
                />

                <datalist id="existing-subjects-list-syllabus">
                  {existingSubjects.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>

                {existingSubjects.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                      Quick Select:
                    </span>
                    {existingSubjects.map((subj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSyllabusForm({ ...syllabusForm, subjectName: subj })}
                        style={{
                          background: syllabusForm.subjectName === subj ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.08)',
                          color: syllabusForm.subjectName === subj ? '#000000' : 'var(--text-secondary)',
                          border: '1px solid rgba(251, 54, 64, 0.2)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-body)',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Syllabus Title */}
              <div>
                <label className="admin-field-label">
                  <Type size={16} style={{ color: 'var(--accent-orange)' }} />
                  2. Syllabus Title <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'none', fontWeight: 'normal' }}>(Optional - e.g. "Full Semester Syllabus")</span>
                </label>

                <input 
                  type="text"
                  placeholder="e.g. Complete Syllabus & Module Breakdown"
                  value={syllabusForm.title}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, title: e.target.value })}
                  className="admin-text-input"
                />
              </div>

              {/* 3. Description (Optional) */}
              <div>
                <label className="admin-field-label">
                  <FileText size={16} style={{ color: 'var(--accent-orange)' }} />
                  3. Description / Notes <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'none', fontWeight: 'normal' }}>(Optional)</span>
                </label>

                <input 
                  type="text"
                  placeholder="e.g. Prescribed syllabus by MAKAUT / Autonomous University Curriculum"
                  value={syllabusForm.description}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, description: e.target.value })}
                  className="admin-text-input"
                />
              </div>

              {/* 4. Syllabus Document File */}
              <div>
                <label className="admin-field-label">
                  <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
                  4. Select Syllabus Document (PDF / DOC) *
                </label>

                <div 
                  className="admin-dropzone"
                  onClick={() => document.getElementById('syllabus-file-input').click()}
                >
                  <input 
                    id="syllabus-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpeg,.jpg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSyllabusForm({ ...syllabusForm, file: e.target.files[0] });
                      }
                    }}
                    style={{ display: 'none' }}
                  />

                  <FileText size={38} style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem', opacity: 0.8 }} />
                  <div style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                    {syllabusForm.file ? syllabusForm.file.name : 'CHOOSE SYLLABUS DOCUMENT'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {syllabusForm.file 
                      ? `${(syllabusForm.file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                      : 'Upload syllabus PDF, DOC, or image file'}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cyber-btn-orange admin-submit-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin-animate" />
                    <span>Uploading Syllabus...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload & Publish Syllabus</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Published Syllabus Archive */}
          <div className="admin-archive-wrapper">
            <div className="admin-archive-header">
              <div>
                <h3 className="admin-archive-title">
                  PUBLISHED SYLLABI ARCHIVE ({syllabi.length})
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Manage or delete uploaded syllabus documents.
                </p>
              </div>

              <button
                onClick={fetchSyllabi}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} className={fetchingSyllabi ? 'spin-animate' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {fetchingSyllabi ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 0.5rem' }} />
                <div>Loading syllabus archive...</div>
              </div>
            ) : syllabi.length === 0 ? (
              <div className="cyber-panel admin-empty-box">
                <Layers size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.8rem', opacity: 0.6 }} />
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.3rem' }}>
                  No syllabus uploaded yet
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Use the form above to upload your first course syllabus document.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {syllabi.map((s) => (
                  <div key={s._id || s.id} className="cyber-panel admin-note-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                      <div className="admin-item-icon">
                        <Layers size={18} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                          {s.title}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="admin-badge-subject">
                            {s.subjectName}
                          </span>
                          {s.filename && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {s.filename}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="admin-note-actions">
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cyber-btn-wire"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={13} />
                        <span>View File</span>
                      </a>

                      <button
                        onClick={() => confirmDeleteSyllabus(s)}
                        className="admin-delete-btn"
                        title="Delete syllabus"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Note Confirmation Modal */}
      {deleteModalOpen && noteToDelete && (
        <div className="admin-modal-backdrop">
          <div className="cyber-panel admin-modal-box">
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              CONFIRM DELETE NOTE
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete <strong>"{noteToDelete.title || noteToDelete.filename}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                className="admin-delete-btn"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Confirmation Modal */}
      {deleteFolderModalOpen && folderToDelete && (
        <div className="admin-modal-backdrop">
          <div className="cyber-panel admin-modal-box">
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              CONFIRM DELETE FOLDER
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              Are you sure you want to delete folder <strong>"{folderToDelete.name}"</strong> under <strong>{folderToDelete.subjectName}</strong>?
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={deleteFolderWithNotes}
                onChange={(e) => setDeleteFolderWithNotes(e.target.checked)}
              />
              <span>Also permanently delete all notes inside this folder? (Unchecked: keeps notes safe in subject root)</span>
            </label>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteFolderModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFolder}
                className="admin-delete-btn"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {renameFolderModalOpen && folderToRename && (
        <div className="admin-modal-backdrop">
          <div className="cyber-panel admin-modal-box">
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              RENAME FOLDER
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              Renaming will update folder name for all notes assigned to <strong>"{folderToRename.name}"</strong>.
            </p>

            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="admin-text-input"
              style={{ marginBottom: '1.5rem' }}
              placeholder="Enter new folder name..."
            />

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRenameFolderModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                className="cyber-btn-orange"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Syllabus Confirmation Modal */}
      {deleteSyllabusModalOpen && syllabusToDelete && (
        <div className="admin-modal-backdrop">
          <div className="cyber-panel admin-modal-box">
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              CONFIRM DELETE SYLLABUS
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to delete syllabus for <strong>"{syllabusToDelete.subjectName}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteSyllabusModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSyllabus}
                className="admin-delete-btn"
                style={{ padding: '0.4rem 0.9rem' }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-upload-page {
          min-height: 100vh;
          background-color: #090d12;
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(251, 54, 64, 0.05) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.03) 0%, transparent 45%),
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px;
          padding: 6.5rem 1.5rem 4rem;
          box-sizing: border-box;
          max-width: 1200px;
          margin: 0 auto;
          font-family: var(--font-body);
        }

        .admin-upload-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-tabs-row {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .admin-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(18, 24, 32, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 0.7rem 1.3rem;
          border-radius: 6px;
          font-family: var(--font-tech);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-tab-btn:hover {
          border-color: rgba(251, 54, 64, 0.4);
          color: #ffffff;
        }

        .admin-tab-btn.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #ffffff;
          box-shadow: 0 0 16px rgba(251, 54, 64, 0.3);
        }

        .admin-alert-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.2rem;
          border-radius: 6px;
          margin-bottom: 1.8rem;
          font-family: var(--font-tech);
          font-size: 0.88rem;
        }

        .admin-alert-box.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #ef4444;
        }

        .admin-alert-box.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
        }

        .admin-upload-card {
          padding: 2.2rem;
          border-radius: 10px;
          margin-bottom: 3rem;
        }

        .admin-card-title {
          font-family: var(--font-cyber);
          color: #ffffff;
          font-size: 1.5rem;
          margin: 0 0 0.5rem;
          letter-spacing: 0.04em;
        }

        .admin-card-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0 0 2rem;
        }

        .admin-field-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-family: var(--font-tech);
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.6rem;
        }

        .admin-text-input {
          width: 100%;
          background: rgba(0, 15, 8, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 0.85rem 1rem;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.95rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-text-input:focus {
          border-color: var(--accent-orange);
          box-shadow: 0 0 12px rgba(251, 54, 64, 0.2);
        }

        .admin-category-btn {
          flex: 1;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0.9rem 1.1rem;
          background: rgba(0, 15, 8, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .admin-category-btn:hover {
          border-color: rgba(251, 54, 64, 0.4);
          color: #ffffff;
        }

        .admin-category-btn.active {
          background: rgba(251, 54, 64, 0.15);
          border-color: var(--accent-orange);
          color: #ffffff;
        }

        .folder-selection-subcard {
          background: rgba(0, 10, 5, 0.55);
          border: 1px solid rgba(234, 179, 8, 0.25);
          border-radius: 6px;
          padding: 1.1rem;
        }

        .quick-folder-create-box {
          margin-top: 0.9rem;
          padding-top: 0.9rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .folder-notes-badge {
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.35);
          color: #facc15;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-family: var(--font-tech);
          font-weight: 700;
        }

        .admin-dropzone {
          border: 2px dashed rgba(251, 54, 64, 0.3);
          border-radius: 8px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          background: rgba(251, 54, 64, 0.02);
          transition: all 0.2s ease;
        }

        .admin-dropzone:hover,
        .admin-dropzone.drag-active {
          border-color: var(--accent-orange);
          background: rgba(251, 54, 64, 0.06);
        }

        .admin-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .admin-preview-card {
          background: rgba(0, 20, 10, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .admin-preview-img {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 4px;
        }

        .admin-preview-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
        }

        .admin-preview-info {
          min-width: 0;
          flex: 1;
        }

        .admin-preview-name {
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-preview-size {
          color: var(--text-muted);
          font-size: 0.7rem;
        }

        .admin-submit-btn {
          padding: 0.9rem 1.8rem;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }

        .admin-archive-wrapper {
          margin-top: 2rem;
        }

        .admin-archive-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .admin-archive-title {
          font-family: var(--font-cyber);
          color: #ffffff;
          font-size: 1.2rem;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .admin-filter-bar {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          background: rgba(18, 24, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }

        .admin-filter-select {
          background: rgba(0, 15, 8, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          color: #ffffff;
          font-family: var(--font-tech);
          font-size: 0.82rem;
          padding: 0.45rem 0.8rem;
          outline: none;
          cursor: pointer;
        }

        .admin-filter-search {
          flex: 1;
          min-width: 180px;
          background: rgba(0, 15, 8, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          color: #ffffff;
          font-family: var(--font-tech);
          font-size: 0.82rem;
          padding: 0.45rem 0.8rem;
          outline: none;
        }

        .admin-empty-box {
          padding: 3rem;
          text-align: center;
          border-radius: 8px;
        }

        .admin-note-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 1.2rem;
          border-radius: 6px;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .admin-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
          flex-shrink: 0;
        }

        .admin-badge-subject {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: var(--font-tech);
        }

        .admin-badge-category {
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-family: var(--font-tech);
          font-weight: 700;
        }

        .admin-badge-folder {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-family: var(--font-tech);
          font-weight: 700;
        }

        .admin-inline-select {
          background: rgba(0, 20, 10, 0.85);
          border: 1px solid rgba(251, 54, 64, 0.3);
          border-radius: 4px;
          color: #ffffff;
          font-size: 0.72rem;
          padding: 0.15rem 0.4rem;
          outline: none;
          cursor: pointer;
          font-family: var(--font-tech);
        }

        .admin-inline-select.folder-select {
          border-color: rgba(234, 179, 8, 0.35);
          color: #facc15;
        }

        .admin-note-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .admin-delete-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          font-family: var(--font-tech);
          transition: all 0.2s ease;
        }

        .admin-delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .admin-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 8, 4, 0.88);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }

        .admin-modal-box {
          width: 100%;
          max-width: 480px;
          padding: 2rem;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .admin-upload-page {
            padding: 5rem 1rem 3rem;
          }
          .admin-category-btn {
            min-width: 100%;
          }
          .admin-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
