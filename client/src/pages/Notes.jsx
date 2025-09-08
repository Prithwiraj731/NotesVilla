import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Search, Download, Share2, Calendar, BookOpen, Tag, FileText, Filter, Grid, List } from 'lucide-react';

export default function Notes() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    loadSubjects();
    loadAllNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedSubject, selectedTopic, searchTerm]);

  const loadSubjects = async () => {
    try {
      console.log('🔍 Loading subjects...');
      console.log('📡 Making request to: /api/notes/subjects');
      const r = await API.get('/notes/subjects');
      console.log('✅ Subjects response status:', r.status);
      console.log('✅ Subjects loaded:', r.data);

      if (Array.isArray(r.data)) {
        setSubjects(r.data);
        setDebugInfo(prev => prev + `Subjects: ${r.data.length} loaded. `);
      } else {
        console.error('❌ Subjects response is not an array:', typeof r.data);
        setSubjects([]);
      }
    } catch (err) {
      console.error('❌ Error loading subjects:', err);
      console.error('❌ Error response:', err.response?.data);

      let errorMessage = 'Failed to load subjects.';
      if (err.response?.status === 404) {
        errorMessage += ' Subjects endpoint not found (404).';
      }

      setError(errorMessage + ' ' + (err.response?.data?.msg || err.message));
      setDebugInfo(prev => prev + `Subjects failed: ${err.message}. `);
    }
  };

  const loadAllNotes = async () => {
    try {
      console.log('🔍 Loading all notes...');
      console.log('🌐 API base URL:', import.meta.env.VITE_API_BASE || 'http://localhost:5000/api');
      console.log('📡 Making request to: /api/notes');
      setLoading(true);
      setError('');

      const r = await API.get('/notes');
      console.log('✅ Raw response:', r);
      console.log('✅ Response status:', r.status);
      console.log('✅ Response headers:', r.headers);
      console.log('✅ Notes loaded:', r.data);
      console.log('📝 Number of notes:', r.data.length);

      if (Array.isArray(r.data)) {
        setNotes(r.data);
        setDebugInfo(prev => prev + `Notes: ${r.data.length} loaded. `);

        if (r.data.length === 0) {
          setError('No notes found in the database. Upload some notes first!');
        }
      } else {
        console.error('❌ Response is not an array:', typeof r.data);
        setError('Invalid response format from server.');
      }
    } catch (err) {
      console.error('❌ Error loading notes:', err);
      console.error('❌ Error config:', err.config);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error request:', err.request);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error data:', err.response?.data);

      let errorMessage = 'Failed to load notes.';
      if (err.response?.status === 404) {
        errorMessage += ' Endpoint not found (404). Check if server is running on localhost:5000.';
      } else if (err.response?.status >= 500) {
        errorMessage += ' Server error. Check server console for details.';
      } else if (!err.response) {
        errorMessage += ' Cannot connect to server. Make sure server is running.';
      } else {
        errorMessage += ' ' + (err.response?.data?.msg || err.message);
      }

      setError(errorMessage);
      setDebugInfo(prev => prev + `Notes failed: ${err.message}. `);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (note) => {
    // Navigate to note details page
    navigate(`/note/${note._id}`);
  };

  const handleActionClick = (e) => {
    // Prevent card click when clicking action buttons
    e.stopPropagation();
  };

  const filterNotes = () => {
    let filtered = notes;

    if (selectedSubject) {
      filtered = filtered.filter(note => note.subjectName === selectedSubject);
    }

    if (selectedTopic) {
      filtered = filtered.filter(note => note.topicName === selectedTopic);
    }

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.topicName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const getUniqueTopics = () => {
    if (!selectedSubject) return [];
    return [...new Set(notes.filter(note => note.subjectName === selectedSubject).map(note => note.topicName))];
  };

  const share = async (note) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, url: note.fileUrl });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(note.fileUrl);
        // You could add a toast notification here
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSelectedSubject('');
    setSelectedTopic('');
    setSearchTerm('');
  };

  // Robust download function using fetch + blob
  const downloadViaFetch = async (url, suggestedName) => {
    try {
      console.log('Starting fetch download:', suggestedName, url);

      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit' // Don't send cookies for downloads
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Download failed: ${res.status} ${text}`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = suggestedName || 'download';
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 100);

      console.log('✅ Download completed:', suggestedName);

    } catch (error) {
      console.error('❌ Fetch download failed:', error);

      // Fallback: try direct link method
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('⚠️ Used fallback download method');
      } catch (fallbackError) {
        console.error('❌ Fallback download also failed:', fallbackError);
        // Show user-friendly error
        alert(`Download failed: ${error.message}. Please try again or contact support.`);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: 'clamp(1rem, 3vw, 2rem) clamp(0.5rem, 2vw, 1rem)',
      paddingTop: 'clamp(5rem, 12vh, 7rem)'
    }}>
      {/* Header Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 3rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem',
          letterSpacing: '-0.02em'
        }}>Notes Library</h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '1.125rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>Explore and download educational content organized by subjects and topics</p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          padding: '1rem 1.5rem',
          color: '#f87171'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>⚠️ Loading Error</div>
          <div style={{ fontSize: '0.9rem' }}>{error}</div>
          {debugInfo && (
            <details style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
              <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
              <div style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>{debugInfo}</div>
            </details>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 2rem',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '1rem',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: window.innerWidth < 768 ? '1' : '2', minWidth: '250px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '0.5rem',
                padding: 'clamp(0.75rem, 3vw, 1rem) 1rem clamp(0.75rem, 3vw, 1rem) 3rem',
                color: '#e2e8f0',
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                minHeight: '48px' // Touch-friendly
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(168, 85, 247, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}
            style={{
              flex: window.innerWidth < 768 ? '1' : 'none',
              minWidth: '150px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '0.5rem',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              color: '#e2e8f0',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              outline: 'none',
              cursor: 'pointer',
              minHeight: '48px' // Touch-friendly
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            disabled={!selectedSubject}
            style={{
              flex: window.innerWidth < 768 ? '1' : 'none',
              minWidth: '150px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '0.5rem',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              color: selectedSubject ? '#e2e8f0' : '#64748b',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              outline: 'none',
              cursor: selectedSubject ? 'pointer' : 'not-allowed',
              minHeight: '48px' // Touch-friendly
            }}
          >
            <option value="">All Topics</option>
            {getUniqueTopics().map(topic => <option key={topic} value={topic}>{topic}</option>)}
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: viewMode === 'grid' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px solid ${viewMode === 'grid' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '0.5rem',
                color: viewMode === 'grid' ? '#a855f7' : '#94a3b8',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: viewMode === 'list' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px solid ${viewMode === 'list' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '0.5rem',
                color: viewMode === 'list' ? '#a855f7' : '#94a3b8',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedSubject || selectedTopic || searchTerm) && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              color: '#f87171',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <Filter size={16} /> Clear Filters
          </button>
        )}
      </div>

      {/* Notes Display */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '1.125rem' }}>Loading notes...</div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '1rem',
            color: '#94a3b8'
          }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No notes found</div>
            <div>Try adjusting your search or filter criteria</div>
          </div>
        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? (window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))') : '1fr',
            flexDirection: viewMode === 'list' ? 'column' : 'row',
            gap: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            {filteredNotes.map((note, index) => (
              <div
                key={note._id}
                onClick={() => handleCardClick(note)}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '1rem',
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  animation: `slideInUp 0.6s ease ${index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{
                    color: '#e2e8f0',
                    fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                    fontWeight: '700',
                    margin: 0,
                    lineHeight: '1.4',
                    flex: 1,
                    wordBreak: 'break-word'
                  }}>{note.title}</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginLeft: '1rem'
                  }}>
                    <Calendar size={14} />
                    {formatDate(note.date)}
                  </div>
                </div>

                {/* Description */}
                {note.description && (
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    margin: '0 0 1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{note.description}</p>
                )}

                {/* Subject and Topic Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '1rem',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    color: '#a855f7',
                    fontWeight: '500'
                  }}>
                    <BookOpen size={12} />
                    {note.subjectName}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '1rem',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    color: '#6366f1',
                    fontWeight: '500'
                  }}>
                    <Tag size={12} />
                    {note.topicName}
                  </span>
                  {/* File count indicator for multiple files */}
                  {note.files && note.files.length > 1 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '1rem',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#22c55e',
                      fontWeight: '500'
                    }}>
                      <FileText size={12} />
                      {note.files.length} files
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => {
                      handleActionClick(e);
                      if (note.files && note.files.length > 1) {
                        // For multiple files, navigate to details page
                        handleCardClick(note);
                      } else if (note.fileUrl) {
                        // For single file, use proper download endpoint
                        const filename = note.fileUrl.split('/').pop(); // Extract filename from URL
                        const originalName = note.filename || filename;

                        // Create download URL with proper backend endpoint
                        const baseUrl = window.location.hostname === 'localhost'
                          ? 'http://localhost:5000'
                          : 'https://notesvilla.onrender.com'; // Point to backend server
                        const downloadUrl = `${baseUrl}/api/notes/download/${filename}?name=${encodeURIComponent(originalName)}`;

                        downloadViaFetch(downloadUrl, originalName);
                      }
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minHeight: '44px' // Touch-friendly
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <Download size={16} />
                    {note.files && note.files.length > 1 ? `View ${note.files.length} Files` : 'Download'}
                  </button>
                  <button
                    onClick={(e) => { handleActionClick(e); share(note); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem',
                      background: 'rgba(148, 163, 184, 0.1)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                      e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                      e.target.style.color = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(148, 163, 184, 0.1)';
                      e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                      e.target.style.color = '#94a3b8';
                    }}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
