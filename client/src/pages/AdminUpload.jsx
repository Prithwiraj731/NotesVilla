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

  // New state for note management
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
      // Handle both array and paginated response structures
      const notesData = Array.isArray(response.data) ? response.data : (response.data.notes || []);
      setNotes(notesData);
    } catch (err) {
      console.error('Error fetching notes:', err);
      // Don't show error to user for fetch, just log it
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
      files: [] // We don't pre-fill files for security/complexity reasons
    });
    setFilePreview([]);
    // Scroll to top
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
      fetchNotes(); // Refresh list
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

    // Validate required fields
    const missingFields = [];
    if (!form.title?.trim()) missingFields.push('Title');
    if (!form.subjectName?.trim()) missingFields.push('Subject');
    if (!form.date?.trim()) missingFields.push('Date');

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // If creating new note, require file
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
        // Update existing note
        await API.put(`/notes/note/${editingId}`, {
          title: form.title,
          description: form.description,
          subjectName: form.subjectName,
          date: form.date
        });
        setSuccess('Note updated successfully!');
        setEditingId(null);
      } else {
        // Create new note
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

      // Reset form and refresh list
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
      setError(err.response?.data?.msg || err.message || 'Operation failed');

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
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '2rem 1rem',
      paddingTop: '6rem'
    }}>
      {/* Header Section */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 3rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '2rem',
          padding: '0.75rem 1.5rem',
          marginBottom: '2rem'
        }}>
          <Upload size={20} style={{ color: '#a855f7' }} />
          <span style={{ color: '#e2e8f0', fontWeight: '500', letterSpacing: '0.05em' }}>ADMIN PORTAL</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem',
          letterSpacing: '-0.02em'
        }}>
          {editingId ? 'Edit Note' : 'Upload Note'}
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '1.125rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>Manage your educational content: upload new notes, or edit and delete existing ones.</p>
      </div>

      {/* Main Form */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 4rem',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Title Input */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontWeight: '600', marginBottom: '0.75rem' }}>
              <FileText size={18} style={{ color: '#a855f7' }} /> Note Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                fontSize: '1rem',
                outline: 'none',
                color: 'white'
              }}
              placeholder="Enter note title"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontWeight: '600', marginBottom: '0.75rem' }}>
              <FileText size={18} style={{ color: '#a855f7' }} /> Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '2px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                color: 'white'
              }}
              placeholder="Enter description"
            />
          </div>

          {/* Subject & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontWeight: '600', marginBottom: '0.75rem' }}>
                <BookOpen size={18} style={{ color: '#a855f7' }} /> Subject
              </label>
              <input
                type="text"
                value={form.subjectName}
                onChange={e => setForm({ ...form, subjectName: e.target.value })}
                required
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '2px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  fontSize: '1rem',
                  outline: 'none',
                  color: 'white'
                }}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontWeight: '600', marginBottom: '0.75rem' }}>
                <Tag size={18} style={{ color: '#a855f7' }} /> Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '2px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>

          {/* File Upload (Only show if not editing or if we want to allow file replacement later) */}
          {!editingId && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontWeight: '600', marginBottom: '0.75rem' }}>
                <Folder size={18} style={{ color: '#a855f7' }} /> Upload Files
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
                style={{
                  border: `2px dashed ${dragActive ? 'rgba(168, 85, 247, 0.6)' : 'rgba(148, 163, 184, 0.3)'}`,
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  background: dragActive ? 'rgba(168, 85, 247, 0.05)' : 'rgba(30, 41, 59, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: '#a855f7', fontWeight: '600' }}>{filePreview.length} file(s) selected</div>
                    {filePreview.map((f, i) => (
                      <div key={i} style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{f.name}</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8' }}>Drag & drop files or click to browse</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? 'rgba(100, 116, 139, 0.5)' : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #6366f1 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s'
              }}
            >
              {loading ? <Loader size={20} className="animate-spin" /> : (editingId ? <RefreshCw size={20} /> : <Upload size={20} />)}
              {loading ? 'Processing...' : (editingId ? 'Update Note' : 'Upload Note')}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  color: '#f87171',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Notes List Section */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={24} style={{ color: '#a855f7' }} /> Manage Notes
        </h2>

        {fetchingNotes ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <Loader size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            Loading notes...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {notes.map(note => (
              <div key={note._id} style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ color: '#e2e8f0', fontWeight: '600', marginBottom: '0.25rem', fontSize: '1.1rem' }}>{note.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', color: '#a855f7' }}>{note.subjectName}</span>
                    <span>•</span>
                    <span>{new Date(note.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => startEditing(note)}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#a855f7',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    title="Edit Note"
                  >
                    <Edit size={18} />
                    <span style={{ fontSize: '0.9rem' }}>Edit</span>
                  </button>
                  <button
                    onClick={() => confirmDelete(note)}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#f87171',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    title="Delete Note"
                  >
                    <Trash2 size={18} />
                    <span style={{ fontSize: '0.9rem' }}>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'rgba(30, 41, 59, 0.2)', borderRadius: '1rem' }}>
                No notes found. Upload your first note above!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: '#f0fdf4',
          color: '#166534',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: '#fef2f2',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Delete Note?</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{noteToDelete?.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
