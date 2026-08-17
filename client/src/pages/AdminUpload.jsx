import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { 
  Upload, 
  FileText, 
  BookOpen, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Type
} from 'lucide-react';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

export default function AdminUpload() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    subjectName: '',
    date: new Date().toISOString().split('T')[0],
    files: []
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

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/notes/subjects');
      if (Array.isArray(res.data)) {
        setExistingSubjects(res.data.map(s => s.name || s));
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchNotes = async () => {
    try {
      setFetchingNotes(true);
      const response = await API.get('/notes?limit=100');
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

  const confirmDelete = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      setLoading(true);
      await API.delete(`/notes/note/${noteToDelete._id}`);
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

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.subjectName?.trim()) {
      setError('Please provide or select a Subject Name');
      setLoading(false);
      return;
    }

    if (!form.date) {
      setError('Please select a valid date');
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
        const formattedDate = new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        noteTitle = `${form.subjectName.trim()} Notes (${formattedDate})`;
      }
    }

    try {
      const data = new FormData();
      data.append('title', noteTitle);
      data.append('subjectName', form.subjectName.trim());
      data.append('date', form.date);

      const isSingleFile = form.files.length === 1;
      const uploadUrl = isSingleFile ? '/notes/upload-single' : '/notes/upload';

      if (isSingleFile) {
        data.append('file', form.files[0]);
      } else {
        form.files.forEach(file => data.append('files', file));
      }

      await API.post(uploadUrl, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const hasImages = form.files.some(f => isImageFile(f.name));
      setSuccess(`🎉 Successfully uploaded "${noteTitle}" for ${form.subjectName.trim()}!`);
      
      // Reset form
      setForm({
        title: '',
        subjectName: '',
        date: new Date().toISOString().split('T')[0],
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      {/* Top Admin Bar */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.4rem 1rem'
        }}>
          <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            Admin Upload Portal
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={() => navigate('/notes')}
            className="cyber-btn-wire"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            <BookOpen size={14} /> View Notes Library
          </button>

          <button
            onClick={handleLogout}
            className="cyber-btn-wire"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#ef4444'
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="cyber-panel" style={{
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: '12px',
        padding: '2.5rem',
        border: '1px solid rgba(251, 54, 64, 0.25)',
        background: 'rgba(0, 15, 8, 0.95)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
      }}>
        
        <h2 style={{
          fontFamily: 'var(--font-cyber)',
          fontSize: '1.6rem',
          color: '#ffffff',
          marginBottom: '0.5rem'
        }}>
          UPLOAD COURSE NOTES
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          marginBottom: '2rem'
        }}>
          Enter your subject name, lecture date, and upload <strong style={{ color: 'var(--accent-orange)' }}>pictures, PDFs, or documents</strong> directly.
        </p>

        {/* Notifications */}
        {error && (
          <div style={{
            background: 'rgba(251, 54, 64, 0.1)',
            border: '1px solid rgba(251, 54, 64, 0.4)',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--accent-orange)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#10B981',
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          
          {/* 1. Subject Name Field */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ffffff',
              fontFamily: 'var(--font-cyber)',
              fontSize: '0.9rem',
              fontWeight: '700',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}>
              <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} />
              1. Subject Name *
            </label>

            <input 
              type="text"
              list="existing-subjects-list"
              placeholder="e.g. E-Commerce & it's Application, Cloud Computing, Cyber Security..."
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              required
              style={{
                width: '100%',
                fontFamily: 'var(--font-tech)',
                fontSize: '1rem',
                padding: '0.85rem 1.2rem',
                borderRadius: '6px',
                background: 'rgba(0, 5, 2, 0.8)',
                border: '1px solid rgba(251, 54, 64, 0.25)',
                color: '#ffffff',
                boxSizing: 'border-box'
              }}
            />

            <datalist id="existing-subjects-list">
              {existingSubjects.map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>

            {existingSubjects.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  Active Subjects:
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

          {/* 2. Note Title (Optional) */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ffffff',
              fontFamily: 'var(--font-cyber)',
              fontSize: '0.9rem',
              fontWeight: '700',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}>
              <Type size={16} style={{ color: 'var(--accent-orange)' }} />
              2. Note / Lecture Title <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'none', fontWeight: 'normal' }}>(Optional - auto-named if left blank)</span>
            </label>

            <input 
              type="text"
              placeholder="e.g. Unit 1 Introduction & Architecture, Chapter 3 Diagrams..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{
                width: '100%',
                fontFamily: 'var(--font-tech)',
                fontSize: '1rem',
                padding: '0.85rem 1.2rem',
                borderRadius: '6px',
                background: 'rgba(0, 5, 2, 0.8)',
                border: '1px solid rgba(251, 54, 64, 0.25)',
                color: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 3. Lecture Date */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ffffff',
              fontFamily: 'var(--font-cyber)',
              fontSize: '0.9rem',
              fontWeight: '700',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}>
              <Calendar size={16} style={{ color: 'var(--accent-orange)' }} />
              3. Lecture Date *
            </label>

            <input 
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              style={{
                width: '100%',
                fontFamily: 'var(--font-tech)',
                fontSize: '1rem',
                padding: '0.85rem 1.2rem',
                borderRadius: '6px',
                background: 'rgba(0, 5, 2, 0.8)',
                border: '1px solid rgba(251, 54, 64, 0.25)',
                color: '#ffffff',
                colorScheme: 'dark',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 4. Drag & Drop File Upload Area */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ffffff',
              fontFamily: 'var(--font-cyber)',
              fontSize: '0.9rem',
              fontWeight: '700',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}>
              <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
              4. Upload Files (Pictures / PDF / DOCX / PPT / ZIP) *
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.3)'}`,
                borderRadius: '8px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: dragActive ? 'rgba(251, 54, 64, 0.08)' : 'rgba(0, 5, 2, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => document.getElementById('note-file-input').click()}
            >
              <input
                id="note-file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.svg"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <Upload size={32} style={{ color: 'var(--accent-orange)', opacity: 0.8 }} />
                <ImageIcon size={32} style={{ color: '#10B981', opacity: 0.7 }} />
              </div>
              
              <div style={{
                fontFamily: 'var(--font-tech)',
                fontWeight: '700',
                color: '#ffffff',
                fontSize: '1.05rem',
                marginBottom: '0.4rem'
              }}>
                Drag and drop your files or photos here
              </div>
              
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
                or click to browse files from your device
              </div>
              <div style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.78rem', 
                fontFamily: 'var(--font-body)',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ color: '#10B981', fontWeight: '600' }}>📸 Photos (JPG, PNG, WebP, GIF)</span>
                <span>•</span>
                <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>📄 Documents (PDF, DOC, PPT, TXT)</span>
                <span>•</span>
                <span style={{ fontWeight: '600' }}>📦 Archives (ZIP, RAR)</span>
              </div>
            </div>

            {/* Selected File Previews with Image Thumbnails */}
            {filePreview.length > 0 && (
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '700', fontFamily: 'var(--font-body)' }}>
                  Selected Files ({filePreview.length}):
                </div>
                
                {/* Image thumbnails grid */}
                {filePreview.some(f => f.isImage && f.thumbnailUrl) && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                    gap: '0.6rem',
                    marginBottom: '0.5rem'
                  }}>
                    {filePreview.filter(f => f.isImage && f.thumbnailUrl).map((file, idx) => (
                      <div key={`thumb-${idx}`} style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        background: 'rgba(0, 5, 2, 0.8)'
                      }}>
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                          padding: '0.3rem 0.4rem',
                          fontSize: '0.65rem',
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document / Image file list */}
                {filePreview.map((file, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    background: file.isImage ? 'rgba(16, 185, 129, 0.06)' : 'rgba(251, 54, 64, 0.06)',
                    border: `1px solid ${file.isImage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.2)'}`,
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {file.isImage 
                        ? <ImageIcon size={16} style={{ color: '#10B981' }} /> 
                        : <FileText size={16} style={{ color: 'var(--accent-orange)' }} />
                      }
                      <span style={{ color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
                        {file.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {file.isImage && (
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          fontFamily: 'var(--font-tech)'
                        }}>
                          IMAGE
                        </span>
                      )}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
                        {file.size}
                      </span>
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
            className="cyber-btn-orange"
            style={{
              padding: '1rem',
              justifyContent: 'center',
              fontSize: '1rem',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin-animate" />
                <span>Uploading Note...</span>
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

      {/* =========================================================================
          EXISTING UPLOADED NOTES MANAGEMENT
          ========================================================================= */}
      <div style={{
        maxWidth: '900px',
        margin: '3rem auto 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-cyber)',
              fontSize: '1.3rem',
              color: '#ffffff',
              margin: '0 0 0.3rem 0'
            }}>
              PUBLISHED NOTES ARCHIVE ({notes.length})
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', margin: 0 }}>
              Manage, review, or delete uploaded lecture notes and images in real-time.
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
          <div className="cyber-panel" style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderRadius: '8px',
            border: '1px dashed rgba(251, 54, 64, 0.25)',
            background: 'rgba(0, 15, 8, 0.6)'
          }}>
            <BookOpen size={32} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.8rem', opacity: 0.6 }} />
            <div style={{ color: '#ffffff', fontFamily: 'var(--font-body)', fontWeight: '600', marginBottom: '0.3rem' }}>
              No notes published yet
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              Use the upload form above to add your first 4th-year subject notes or images.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {notes.map((note) => {
              const noteIsImage = note.fileType === 'image' || 
                isImageFile(note.filename) || 
                (note.files && note.files.length > 0 && note.files.some(f => isImageFile(f.originalName || f.filename)));

              return (
                <div
                  key={note._id}
                  className="cyber-panel"
                  style={{
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    border: `1px solid ${noteIsImage ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 54, 64, 0.15)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: 'rgba(0, 15, 8, 0.8)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      background: noteIsImage ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 54, 64, 0.1)',
                      border: `1px solid ${noteIsImage ? 'rgba(16, 185, 129, 0.25)' : 'rgba(251, 54, 64, 0.25)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: noteIsImage ? '#10B981' : 'var(--accent-orange)'
                    }}>
                      {noteIsImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                    </div>

                    <div>
                      <div style={{ color: '#ffffff', fontWeight: '700', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
                        {note.title || note.filename}
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span style={{
                          background: 'rgba(251, 54, 64, 0.12)',
                          border: '1px solid rgba(251, 54, 64, 0.25)',
                          color: 'var(--accent-orange)',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {note.subjectName}
                        </span>
                        {noteIsImage && (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            color: '#10B981',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '700'
                          }}>
                            📸 IMAGE
                          </span>
                        )}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} />
                          {new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cyber-btn-wire"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      <ExternalLink size={13} />
                      <span>View File</span>
                    </a>

                    <button
                      onClick={() => confirmDelete(note)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        padding: '0.45rem 0.65rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      title="Delete Note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="cyber-panel" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: '#000F08'
          }}>
            <h3 style={{ color: '#ef4444', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              CONFIRM DELETION
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete <strong style={{ color: '#ffffff' }}>{noteToDelete?.title || noteToDelete?.filename}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.2rem',
                  fontFamily: 'var(--font-cyber)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animate {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
