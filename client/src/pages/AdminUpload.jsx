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
  ExternalLink
} from 'lucide-react';

export default function AdminUpload() {
  const navigate = useNavigate();

  const suggestedSubjects = [
    "Data Structures & Algorithms",
    "Full Stack Development",
    "Database Systems",
    "Operating Systems",
    "Computer Networks",
    "Discrete Mathematics",
    "Artificial Intelligence",
    "Software Engineering"
  ];

  const [form, setForm] = useState({
    subjectName: '',
    date: new Date().toISOString().split('T')[0],
    files: []
  });

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
  }, []);

  const fetchNotes = async () => {
    try {
      setFetchingNotes(true);
      const response = await API.get('/notes?limit=100');
      const notesData = Array.isArray(response.data) ? response.data : (response.data.notes || []);
      setNotes(notesData);
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

      setSuccess(`🎉 Successfully uploaded note for ${form.subjectName}!`);
      
      // Reset form
      setForm({
        subjectName: '',
        date: new Date().toISOString().split('T')[0],
        files: []
      });
      setFilePreview([]);
      fetchNotes();

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
              borderColor: 'rgba(251, 54, 64, 0.4)',
              color: 'var(--accent-orange)'
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Upload Box */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '900px',
          margin: '0 auto 3.5rem',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)'
        }}
      >
        <h2 style={{
          fontSize: '1.8rem',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
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
          Simply select the Subject, choose the Date, and drop your lecture note files below.
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
              1. Subject Name
            </label>

            <input 
              type="text"
              placeholder="e.g. Data Structures & Algorithms, Operating Systems, DBMS..."
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              required
              style={{
                width: '100%',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.1rem',
                marginBottom: '0.75rem'
              }}
            />

            {/* Quick-Pick Subject Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {suggestedSubjects.map((sub, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setForm({ ...form, subjectName: sub })}
                  style={{
                    background: form.subjectName === sub ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.06)',
                    color: form.subjectName === sub ? '#000000' : 'var(--text-secondary)',
                    border: form.subjectName === sub ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.18)',
                    borderRadius: '4px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-tech)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + {sub}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Date Field */}
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
              2. Lecture / Note Date
            </label>

            <input 
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              style={{
                width: '100%',
                maxWidth: '300px',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.1rem'
              }}
            />
          </div>

          {/* 3. Drag & Drop Upload Area */}
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
              3. Note Files Upload (PDF, DOC, Images, Zip, PPT)
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive 
                  ? '2px dashed var(--accent-orange)' 
                  : '2px dashed rgba(251, 54, 64, 0.3)',
                borderRadius: '8px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: dragActive 
                  ? 'rgba(251, 54, 64, 0.12)' 
                  : 'rgba(0, 15, 8, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => document.getElementById('note-file-input').click()}
            >
              <input 
                id="note-file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
              />

              <Upload 
                size={40} 
                style={{ 
                  color: dragActive ? 'var(--accent-orange)' : 'var(--text-muted)', 
                  margin: '0 auto 1rem',
                  animation: dragActive ? 'bounce 0.5s infinite alternate' : 'none'
                }} 
              />

              <p style={{
                color: '#ffffff',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.1rem',
                fontWeight: '700',
                margin: '0 0 0.4rem'
              }}>
                Drag and drop your note file(s) here, or <span style={{ color: 'var(--accent-orange)', textDecoration: 'underline' }}>Browse</span>
              </p>
              <p style={{
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                margin: 0
              }}>
                Supports PDF, DOCX, PPTX, Images, ZIP up to 50MB per file (Up to 10 files)
              </p>
            </div>

            {/* Selected Files Preview */}
            {filePreview.length > 0 && (
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span style={{
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--accent-orange)',
                  textTransform: 'uppercase'
                }}>
                  Selected Files ({filePreview.length}):
                </span>
                
                {filePreview.map((file, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(251, 54, 64, 0.06)',
                    border: '1px solid rgba(251, 54, 64, 0.2)',
                    borderRadius: '6px',
                    padding: '0.6rem 1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={16} style={{ color: 'var(--accent-orange)' }} />
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-tech)', fontSize: '0.95rem', fontWeight: '600' }}>
                        {file.name}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>
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
              padding: '0.95rem 2rem',
              fontSize: '1.05rem',
              justifyContent: 'center',
              marginTop: '0.5rem',
              clipPath: 'none',
              borderRadius: '6px'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>UPLOADING TO SYSTEM...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>UPLOAD NOTES NOW</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Note Management / Deletion Center */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-cyber)',
            fontSize: '1.3rem',
            color: '#ffffff',
            letterSpacing: '0.04em',
            margin: 0
          }}>
            UPLOADED NOTES ARCHIVE ({notes.length})
          </h3>
          <button
            onClick={fetchNotes}
            className="cyber-btn-wire"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {fetchingNotes ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            Loading notes inventory...
          </div>
        ) : notes.length === 0 ? (
          <div className="cyber-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            No notes currently uploaded in the database.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {notes.map((note) => (
              <div
                key={note._id}
                className="cyber-panel"
                style={{
                  padding: '1.2rem 1.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid rgba(251, 54, 64, 0.15)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      background: 'rgba(251, 54, 64, 0.1)',
                      border: '1px solid rgba(251, 54, 64, 0.3)',
                      color: 'var(--accent-orange)',
                      fontFamily: 'var(--font-tech)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {note.subjectName}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>
                      📅 {new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 style={{
                    color: '#ffffff',
                    fontFamily: 'var(--font-tech)',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {note.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button
                    onClick={() => confirmDelete(note)}
                    className="cyber-btn-wire"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85rem',
                      color: '#EF4444',
                      borderColor: 'rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && noteToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 15, 8, 0.9)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="cyber-panel" style={{
            maxWidth: '450px',
            width: '100%',
            borderRadius: '8px',
            padding: '2rem',
            border: '1px solid rgba(251, 54, 64, 0.4)',
            textAlign: 'center'
          }}>
            <Trash2 size={40} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-cyber)', color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              CONFIRM NOTE DELETION
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', marginBottom: '1.8rem' }}>
              Are you sure you want to permanently delete <strong>{noteToDelete.title}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.6rem 1.4rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="cyber-btn-orange"
                style={{ padding: '0.6rem 1.4rem', clipPath: 'none', borderRadius: '4px' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
