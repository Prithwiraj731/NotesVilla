import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { Upload, FileText, BookOpen, Tag, Folder, CheckCircle, AlertCircle, Loader, Edit, Trash2, X, RefreshCw } from 'lucide-react';

export default function AdminUpload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
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
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setFetchingNotes(true);
      const response = await API.get('/notes');
      const notesData = Array.isArray(response.data) ? response.data : (response.data.notes || []);
      setNotes(notesData);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setFetchingNotes(false);
    }
  };

  const forceRelogin = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    navigate('/admin/login');
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setForm({ ...form, files: fileArray });
    if (fileArray.length > 0) {
      const previews = fileArray.map(file => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type
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

  const startEditing = (note) => {
    setEditingId(note._id);
    setForm({
      title: note.title,
      description: note.description || '',
      subjectName: note.subjectName,
      date: new Date(note.date).toISOString().split('T')[0],
      files: []
    });
    setFilePreview([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      subjectName: '',
      date: new Date().toISOString().split('T')[0],
      files: []
    });
    setFilePreview([]);
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

    // Validate fields
    const missingFields = [];
    if (!form.title?.trim()) missingFields.push('Title');
    if (!form.subjectName?.trim()) missingFields.push('Subject');
    if (!form.date?.trim()) missingFields.push('Date');

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    if (!editingId && form.files.length === 0) {
      setError('Please select at least one file to upload');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login as admin first.');
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        await API.put(`/notes/note/${editingId}`, {
          title: form.title,
          description: form.description,
          subjectName: form.subjectName,
          date: form.date
        });
        setSuccess('Note updated successfully!');
        setEditingId(null);
      } else {
        const data = new FormData();
        data.append('title', form.title);
        data.append('description', form.description || '');
        data.append('subjectName', form.subjectName);
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
        setSuccess(`${form.files.length} note(s) uploaded successfully!`);
      }

      setForm({
        title: '',
        description: '',
        subjectName: '',
        date: new Date().toISOString().split('T')[0],
        files: []
      });
      setFilePreview([]);
      fetchNotes();

    } catch (err) {
      console.error('Operation error:', err);
      setError(err.response?.data?.msg || err.response?.data?.error || err.message || 'Operation failed');

      if (err.response?.status === 401 || err.message.includes('token')) {
        setTimeout(forceRelogin, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%)',
      padding: '2rem 1.5rem',
      paddingTop: '7rem',
      boxSizing: 'border-box'
    }}>
      {/* Header Info Section */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 3rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.5rem 1.25rem',
          marginBottom: '1.5rem'
        }}>
          <Upload size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{ 
            color: 'var(--text-primary)', 
            fontFamily: 'var(--font-tech)', 
            fontWeight: '700', 
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            Secure Admin Portal
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: '900',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem'
        }}>
          {editingId ? 'Edit Note System' : 'Upload Note System'}
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Manage academic notes and upload new resources to the database portal.
        </p>
      </div>

      {/* Main Staging Form */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '800px',
          margin: '0 auto 4rem',
          borderRadius: '8px',
          padding: '2.5rem 2rem'
        }}
      >
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Note Title */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              <FileText size={16} style={{ color: 'var(--accent-orange)' }} /> Note Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="ENTER NOTE TITLE"
              style={{
                width: '100%',
                fontFamily: 'var(--font-tech)'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              <FileText size={16} style={{ color: 'var(--accent-orange)' }} /> Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="ENTER NOTE DESCRIPTION DETAILS..."
              style={{
                width: '100%',
                background: 'rgba(0, 15, 8, 0.6)',
                border: '1px solid rgba(251, 54, 64, 0.15)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                padding: '0.8rem 1.2rem',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-orange)';
                e.target.style.boxShadow = '0 0 10px rgba(251, 54, 64, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(251, 54, 64, 0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Subject & Date Split Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} /> Subject Name
              </label>
              <input
                type="text"
                value={form.subjectName}
                onChange={e => setForm({ ...form, subjectName: e.target.value })}
                required
                placeholder="e.g. DATA STRUCTURES"
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-tech)'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                <Tag size={16} style={{ color: 'var(--accent-orange)' }} /> Date Record
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-tech)',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          {!editingId && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                <Folder size={16} style={{ color: 'var(--accent-orange)' }} /> Note Files
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.25)'}`,
                  borderRadius: '6px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: dragActive ? 'rgba(251, 54, 64, 0.08)' : 'rgba(0, 15, 8, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-tech)',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  if (!dragActive) e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.6)';
                }}
                onMouseLeave={(e) => {
                  if (!dragActive) e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.25)';
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
                {filePreview.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ color: 'var(--accent-orange)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {filePreview.length} FILE(S) STAGED
                    </div>
                    {filePreview.map((f, i) => (
                      <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.name} ({f.size})</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    DRAG & DROP FILES HERE OR CLICK TO BROWSE SYSTEM
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="cyber-btn-orange"
              style={{
                flex: 1,
                justifyContent: 'center',
                clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)',
                boxShadow: `0 0 15px rgba(251, 54, 64, 0.25)`
              }}
            >
              {loading ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(0,0,0,0.2)',
                  borderTop: '2px solid #000',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : editingId ? (
                <RefreshCw size={18} />
              ) : (
                <Upload size={18} />
              )}
              <span>{loading ? 'PROCESSING...' : editingId ? 'UPDATE NOTE' : 'UPLOAD NOTE'}</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="cyber-btn-wire"
                style={{ borderColor: 'rgba(251, 54, 64, 0.4)', color: 'var(--accent-orange)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 54, 64, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.4)';
                }}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Database Notes Management List */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ 
          color: '#ffffff', 
          fontFamily: 'var(--font-cyber)', 
          fontSize: '1.4rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <BookOpen size={22} style={{ color: 'var(--accent-orange)' }} /> Note Records Management
        </h2>

        {fetchingNotes ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(251, 54, 64, 0.2)',
              borderTop: '3px solid var(--accent-orange)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ fontFamily: 'var(--font-tech)' }}>SYNCING RECORDS...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {notes.map(note => (
              <div 
                key={note._id}
                className="cyber-panel"
                style={{
                  borderRadius: '6px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                    {note.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center', fontFamily: 'var(--font-tech)' }}>
                    <span style={{
                      background: 'rgba(251, 54, 64, 0.08)',
                      border: '1px solid rgba(251, 54, 64, 0.2)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      color: 'var(--accent-orange)',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {note.subjectName}
                    </span>
                    <span>•</span>
                    <span>{new Date(note.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Edit & Delete CTA actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => startEditing(note)}
                    className="cyber-btn-wire"
                    style={{
                      borderColor: 'rgba(251, 54, 64, 0.4)',
                      color: 'var(--accent-orange)',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => confirmDelete(note)}
                    className="cyber-btn-wire"
                    style={{
                      borderColor: 'rgba(251, 54, 64, 0.4)',
                      color: 'var(--accent-orange)',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 54, 64, 0.08)';
                      e.currentTarget.style.borderColor = 'var(--accent-orange)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.4)';
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <div 
                className="cyber-panel"
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px'
                }}
              >
                No note records registered on the database server.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Banner Notification */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: 'rgba(0, 15, 8, 0.95)',
          border: '1px solid rgba(251, 54, 64, 0.4)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '4px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 3000,
          fontFamily: 'var(--font-tech)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} style={{ color: 'var(--accent-orange)' }} />
          <span>{success}</span>
          <button 
            onClick={() => setSuccess('')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Banner Notification */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: 'rgba(0, 15, 8, 0.95)',
          border: '1px solid var(--accent-orange)',
          color: 'var(--accent-orange)',
          padding: '1rem 1.5rem',
          borderRadius: '4px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 3000,
          fontFamily: 'var(--font-tech)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button 
            onClick={() => setError('')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-orange)', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Secure Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div 
            className="cyber-panel"
            style={{
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '90%',
              background: '#000F08'
            }}
          >
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Confirm Record Purge
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete note <strong>{noteToDelete?.title}</strong>? This will purge the file from database structures.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="cyber-btn-wire"
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                className="cyber-btn-orange"
                style={{
                  background: 'var(--accent-orange)',
                  boxShadow: '0 0 15px rgba(251, 54, 64, 0.3)',
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.95rem',
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 54, 64, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-orange)';
                }}
              >
                Purge Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation specs */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
