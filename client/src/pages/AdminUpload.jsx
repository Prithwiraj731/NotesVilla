import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { 
  Upload, 
  FileText, 
  BookOpen, 
  Calendar, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  LogOut,
  Layers,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function AdminUpload() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
      
      // Update distinct subjects from notes
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
    setForm(prev => ({ ...prev, files: fileArray }));
    if (fileArray.length > 0) {
      const previews = fileArray.map(file => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type || file.name.split('.').pop().toUpperCase()
      }));
      setFilePreview(previews);
    }
  };

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
      setError('Please select at least one file to upload');
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

    try {
      const data = new FormData();
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

      setSuccess(`🎉 Successfully uploaded note for ${form.subjectName.trim()}!`);
      
      // Reset form
      setForm({
        subjectName: '',
        date: new Date().toISOString().split('T')[0],
        files: []
      });
      setFilePreview([]);
      fetchNotes();
      fetchSubjects();

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.msg || err.response?.data?.error || err.message || 'Upload failed');
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
          Enter your 4th-year subject name, select the lecture date, and upload PDF/document files.
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
          
          {/* 1. Subject Name Field with dynamic auto-suggestions */}
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
              1. Subject Name
            </label>

            <input 
              type="text"
              list="existing-subjects-list"
              placeholder="e.g. Cloud Computing, Cyber Security, Deep Learning, Distributed Systems..."
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

            {/* Datalist for fast auto-complete of existing uploaded subjects */}
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

          {/* 2. Lecture Date */}
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
              2. Lecture Date
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

          {/* 3. Drag & Drop File Upload Area */}
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
              3. Upload Files (PDF / DOCX / PPT / ZIP)
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
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
              />

              <Upload size={36} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.8 }} />
              
              <div style={{
                fontFamily: 'var(--font-tech)',
                fontWeight: '700',
                color: '#ffffff',
                fontSize: '1.05rem',
                marginBottom: '0.4rem'
              }}>
                Drag and drop your lecture note files here
              </div>
              
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
                or click to browse files from your device
              </div>
            </div>

            {/* Selected File Previews */}
            {filePreview.length > 0 && (
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '700', fontFamily: 'var(--font-body)' }}>
                  Selected Files ({filePreview.length}):
                </div>
                {filePreview.map((file, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    background: 'rgba(251, 54, 64, 0.06)',
                    border: '1px solid rgba(251, 54, 64, 0.2)',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={16} style={{ color: 'var(--accent-orange)' }} />
                      <span style={{ color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
                        {file.name}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
                      {file.size}
                    </span>
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
              Manage, review, or delete uploaded lecture notes in real-time.
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
              Use the upload form above to add your first 4th-year subject notes.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {notes.map((note) => (
              <div
                key={note._id}
                className="cyber-panel"
                style={{
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  border: '1px solid rgba(251, 54, 64, 0.15)',
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
                    background: 'rgba(251, 54, 64, 0.1)',
                    border: '1px solid rgba(251, 54, 64, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-orange)'
                  }}>
                    <FileText size={18} />
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
            ))}
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
      <style jsx>{`
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
