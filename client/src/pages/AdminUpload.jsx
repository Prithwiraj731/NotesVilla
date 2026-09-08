import React, { useState, useEffect } from 'react';
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
  FolderPlus
} from 'lucide-react';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

export default function AdminUpload() {
  const navigate = useNavigate();

  // Active section tab: 'notes' | 'syllabus'
  const [activeTab, setActiveTab] = useState('notes');

  // Notes Form state
  const [form, setForm] = useState({
    title: '',
    subjectName: '',
    category: 'Theory', // 'Theory' | 'Lab' | 'Suggestions'
    files: []
  });

  // Syllabus Form state
  const [syllabusForm, setSyllabusForm] = useState({
    title: '',
    subjectName: '',
    description: '',
    file: null
  });

  const [existingSubjects, setExistingSubjects] = useState([]);
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

  // Syllabus management states
  const [syllabi, setSyllabi] = useState([]);
  const [fetchingSyllabi, setFetchingSyllabi] = useState(false);
  const [deleteSyllabusModalOpen, setDeleteSyllabusModalOpen] = useState(false);
  const [syllabusToDelete, setSyllabusToDelete] = useState(null);

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
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

  const fetchNotes = async () => {
    try {
      setFetchingNotes(true);
      const response = await API.get('/notes?limit=150');
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
      const res = await API.get('/syllabus');
      setSyllabi(res.data?.syllabi || []);
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

  // Delete note
  const confirmDeleteNote = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

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

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      setLoading(true);
      await API.delete(`/notes/note/${noteToDelete._id || noteToDelete.id}`);
      setSuccess('Note deleted successfully');
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      fetchNotes();
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

    try {
      const data = new FormData();
      data.append('title', noteTitle);
      data.append('subjectName', form.subjectName.trim());
      data.append('category', form.category || 'Theory');
      data.append('description', form.category || 'Theory');
      data.append('topicName', form.category || 'Theory');
      data.append('date', new Date().toISOString());

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

      setSuccess(`🎉 Successfully uploaded "${noteTitle}" (${form.category}) for ${form.subjectName.trim()}!`);
      
      // Reset form
      setForm({
        title: '',
        subjectName: '',
        category: 'Theory',
        files: []
      });
      setFilePreview([]);
      fetchNotes();
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

      await API.post('/syllabus/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

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
      const serverMsg = err.response?.data?.msg || err.message || 'Failed to upload syllabus';
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
      await API.delete(`/syllabus/${syllabusToDelete._id || syllabusToDelete.id}`);
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
          <span>Upload Course Notes</span>
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

      {/* ──────────────────────────────────────────────────────────
          TAB 1: NOTES UPLOAD & ARCHIVE
          ────────────────────────────────────────────────────────── */}
      {activeTab === 'notes' && (
        <>
          <div className="cyber-panel admin-upload-card">
            <h2 className="admin-card-title">
              UPLOAD COURSE NOTES
            </h2>
            <p className="admin-card-subtitle">
              Enter your subject name, choose category (Theory, Lab, Suggestions), and upload documents or images directly.
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

              {/* 2. Category Selection (Bifurcation: Theory, Lab, Suggestions) */}
              <div>
                <label className="admin-field-label">
                  <Layers size={16} style={{ color: 'var(--accent-orange)' }} />
                  2. Resource Category *
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

              {/* 3. Note Title (Optional) */}
              <div>
                <label className="admin-field-label">
                  <Type size={16} style={{ color: 'var(--accent-orange)' }} />
                  3. Note Title <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'none', fontWeight: 'normal' }}>(Optional - auto-named if left blank)</span>
                </label>

                <input 
                  type="text"
                  placeholder="e.g. Unit 1 Architecture & Instructions, Experiment 3 Code..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="admin-text-input"
                />
              </div>

              {/* 4. Drag & Drop File Upload Area */}
              <div>
                <label className="admin-field-label">
                  <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
                  4. Upload Notes Files & Documents *
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

          {/* Published Notes Archive */}
          <div className="admin-archive-wrapper">
            <div className="admin-archive-header">
              <div>
                <h3 className="admin-archive-title">
                  PUBLISHED NOTES ARCHIVE ({notes.length})
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Manage, review, or delete uploaded notes in real-time.
                </p>
              </div>

              <button
                onClick={fetchNotes}
                className="cyber-btn-wire"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} className={fetchingNotes ? 'spin-animate' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {fetchingNotes ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spin-animate" style={{ margin: '0 auto 0.5rem' }} />
                <div>Loading uploaded notes...</div>
              </div>
            ) : notes.length === 0 ? (
              <div className="cyber-panel admin-empty-box">
                <BookOpen size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.8rem', opacity: 0.6 }} />
                <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.3rem' }}>
                  No notes published yet
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {notes.map((note) => {
                  const noteIsImage = note.fileType === 'image' || isImageFile(note.filename);
                  const cat = resolveNoteCategory(note);

                  return (
                    <div key={note._id || note.id} className="cyber-panel admin-note-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                        <div className="admin-item-icon">
                          {noteIsImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                            {note.title || note.filename}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <span className="admin-badge-subject">
                              {note.subjectName}
                            </span>
                            
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
                              style={{
                                background: 'rgba(0, 20, 10, 0.85)',
                                border: '1px solid rgba(251, 54, 64, 0.3)',
                                borderRadius: '4px',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                padding: '0.15rem 0.4rem',
                                outline: 'none',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-tech)'
                              }}
                              title="Switch Category"
                            >
                              <option value="Theory">Theory</option>
                              <option value="Lab">Lab</option>
                              <option value="Suggestions">Suggestions</option>
                            </select>
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

      {/* ──────────────────────────────────────────────────────────
          TAB 2: SYLLABUS UPLOAD & ARCHIVE
          ────────────────────────────────────────────────────────── */}
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
          background: radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.05) 0%, #000804 70%);
          padding: 6rem 1.5rem 4rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: var(--font-body);
          box-sizing: border-box;
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
          border-bottom: 1px solid rgba(251, 54, 64, 0.2);
          padding-bottom: 0.8rem;
        }

        .admin-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: rgba(0, 15, 8, 0.7);
          border: 1px solid rgba(251, 54, 64, 0.25);
          color: var(--text-secondary);
          border-radius: 6px;
          font-family: var(--font-tech);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-tab-btn:hover {
          border-color: var(--accent-orange);
          color: #ffffff;
        }

        .admin-tab-btn.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000000;
          font-weight: 700;
        }

        .admin-alert-box {
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .admin-alert-box.error {
          background: rgba(251, 54, 64, 0.1);
          border: 1px solid rgba(251, 54, 64, 0.4);
          color: var(--accent-orange);
        }

        .admin-alert-box.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #10B981;
        }

        .admin-upload-card {
          padding: 2.2rem;
          border-radius: 10px;
          margin-bottom: 2.5rem;
        }

        .admin-card-title {
          font-family: var(--font-cyber);
          font-size: 1.6rem;
          color: #ffffff;
          margin: 0 0 0.5rem;
        }

        .admin-card-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin: 0 0 2rem;
          line-height: 1.5;
        }

        .admin-field-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-family: var(--font-cyber);
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
          text-transform: uppercase;
        }

        .admin-text-input {
          width: 100%;
          font-family: var(--font-tech);
          font-size: 1rem;
          padding: 0.85rem 1.2rem;
          border-radius: 6px;
          background: rgba(0, 5, 2, 0.8);
          border: 1px solid rgba(251, 54, 64, 0.25);
          color: #ffffff;
          box-sizing: border-box;
          outline: none;
        }

        .admin-text-input:focus {
          border-color: var(--accent-orange);
        }

        .admin-category-btn {
          flex: 1;
          min-width: 160px;
          padding: 0.85rem 1rem;
          border-radius: 6px;
          background: rgba(0, 5, 2, 0.8);
          border: 1px solid rgba(251, 54, 64, 0.2);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          transition: all 0.2s ease;
          font-family: var(--font-body);
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

        .admin-dropzone {
          border: 2px dashed rgba(251, 54, 64, 0.35);
          border-radius: 8px;
          padding: 2.8rem 1.5rem;
          text-align: center;
          cursor: pointer;
          background: rgba(0, 5, 2, 0.6);
          transition: all 0.2s ease;
        }

        .admin-dropzone:hover,
        .admin-dropzone.drag-active {
          border-color: var(--accent-orange);
          background: rgba(251, 54, 64, 0.05);
        }

        .admin-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .admin-preview-card {
          background: rgba(0, 15, 8, 0.8);
          border: 1px solid rgba(251, 54, 64, 0.2);
          border-radius: 6px;
          padding: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .admin-preview-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 4px;
        }

        .admin-preview-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
          background: rgba(251, 54, 64, 0.1);
          border-radius: 4px;
        }

        .admin-preview-info {
          min-width: 0;
          flex: 1;
        }

        .admin-preview-name {
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-preview-size {
          color: var(--text-muted);
          font-size: 0.72rem;
        }

        .admin-submit-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }

        .admin-archive-wrapper {
          margin-top: 2.5rem;
        }

        .admin-archive-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-archive-title {
          font-family: var(--font-cyber);
          font-size: 1.3rem;
          color: #ffffff;
          margin: 0 0 0.3rem;
        }

        .admin-empty-box {
          padding: 2.5rem;
          text-align: center;
          border-radius: 8px;
          border: 1px dashed rgba(251, 54, 64, 0.25);
          background: rgba(0, 15, 8, 0.6);
        }

        .admin-note-item {
          padding: 1rem 1.3rem;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(0, 10, 5, 0.7);
        }

        .admin-item-icon {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          background: rgba(251, 54, 64, 0.1);
          border: 1px solid rgba(251, 54, 64, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
          flex-shrink: 0;
        }

        .admin-badge-subject {
          background: rgba(251, 54, 64, 0.12);
          border: 1px solid rgba(251, 54, 64, 0.25);
          color: var(--accent-orange);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .admin-badge-category {
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .admin-note-actions {
          display: flex;
          gap: 0.6rem;
          align-items: center;
        }

        .admin-delete-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
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
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 9999;
        }

        .admin-modal-box {
          max-width: 480px;
          width: 100%;
          padding: 1.8rem;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .admin-upload-page {
            padding: 5rem 1rem 3rem;
          }
          .admin-category-btn {
            min-width: 100%;
          }
          .admin-note-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-note-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
