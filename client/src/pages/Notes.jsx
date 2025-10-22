import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { downloadFile } from '../utils/downloadUtils';

import { Search, Download, Share2, Calendar, BookOpen, Tag, FileText, Filter, Grid, List } from 'lucide-react';

export default function Notes() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotes: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  useEffect(() => {
    loadSubjects();
    loadAllNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedSubject, searchTerm]);

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

  const loadAllNotes = async (page = 1, append = false) => {
    try {
      const isDevelopment = import.meta.env.DEV;
      if (isDevelopment) {
        console.log(`🔍 Loading notes (page ${page})...`);
      }

      setLoading(true);
      setError('');

      const r = await API.get(`/notes?page=${page}&limit=20`);

      if (isDevelopment) {
        console.log('✅ Notes response:', r.data);
      }

      // Handle both new pagination format and old format for backward compatibility
      if (r.data && r.data.notes && Array.isArray(r.data.notes)) {
        // New pagination format
        if (append && page > 1) {
          setNotes(prev => [...prev, ...r.data.notes]);
        } else {
          setNotes(r.data.notes);
        }

        setPaginationInfo(r.data.pagination);
        setDebugInfo(prev => prev + `Notes: ${r.data.notes.length} loaded (page ${page}). `);

        if (r.data.notes.length === 0 && page === 1) {
          setError('No notes found in the database. Upload some notes first!');
        }
      } else if (Array.isArray(r.data)) {
        // Old format - direct array of notes
        setNotes(r.data);
        setPaginationInfo({
          currentPage: 1,
          totalPages: 1,
          totalNotes: r.data.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: r.data.length
        });
        setDebugInfo(prev => prev + `Notes: ${r.data.length} loaded (legacy format). `);

        if (r.data.length === 0) {
          setError('No notes found in the database. Upload some notes first!');
        }
      } else {
        console.error('❌ Invalid response format:', r.data);
        setError('Invalid response format from server.');
      }
    } catch (err) {
      console.error('❌ Error loading notes:', err);

      let errorMessage = 'Failed to load notes.';
      if (err.response?.status === 404) {
        errorMessage += ' Endpoint not found (404). Check if server is running.';
      } else if (err.response?.status >= 500) {
        errorMessage += ' Server error. Check server console for details.';
      } else if (!err.response) {
        errorMessage += ' Cannot connect to server. Make sure server is running.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage += ' Request timed out. Please try again.';
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
    e.preventDefault(); // Also prevent default browser behavior
  };

  const filterNotes = () => {
    let filtered = notes;

    if (selectedSubject) {
      filtered = filtered.filter(note => note.subjectName === selectedSubject);
    }


    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };


  const share = async (note) => {
    const shareUrl = `${window.location.origin}/note/${note._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, url: shareUrl });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
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
    setSearchTerm('');
  };

  // Robust download using shared utility
  const handleDownload = async (note) => {
    try {
      console.log('🔽 handleDownload called with note:', note);
      if (note.files && note.files.length > 1) {
        // For multiple files, navigate to details page for explicit downloads
        handleCardClick(note);
        return;
      }

      // Single-file path (or first file fallback)
      const fileUrl = note.files && note.files.length > 0
        ? note.files[0].fileUrl
        : note.fileUrl;
      const filename = note.files && note.files.length > 0
        ? (note.files[0].originalName || note.files[0].filename || 'download')
        : (note.originalName || note.filename || 'download');

      if (!fileUrl) {
        alert('Error: No file URL found for this note');
        return;
      }

      const ok = await downloadFile(fileUrl, filename, {
        enableLogging: true,
        retryAttempts: 2,
        timeout: 45000,
      });

      if (!ok) {
        alert('Download failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Download failed due to an unexpected error.');
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
        {(selectedSubject || searchTerm) && (
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

                {/* Subject Tag */}
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
                    onClick={async (e) => {
                      try {
                        handleActionClick(e);
                        console.log('🔽 Button clicked, event handled');

                        if (note.files && note.files.length > 1) {
                          // For multiple files, navigate to details page
                          console.log('🔽 Multiple files, navigating to details');
                          handleCardClick(note);
                        } else if (note.fileUrl) {
                          // For single file, use simplified download function
                          console.log('🔽 Single file, starting download');
                          console.log('🔽 Full note object:', JSON.stringify(note, null, 2));

                          await handleDownload(note);
                          console.log('🔽 Download function completed');
                        }
                      } catch (error) {
                        console.error('🔽 Click handler error:', error);
                        e.preventDefault();
                        e.stopPropagation();
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

      {/* Pagination Controls */}
      {!loading && filteredNotes.length > 0 && paginationInfo.totalPages > 1 && (
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Previous Button */}
          <button
            onClick={() => loadAllNotes(paginationInfo.currentPage - 1)}
            disabled={!paginationInfo.hasPrevPage}
            style={{
              padding: '0.75rem 1.5rem',
              background: paginationInfo.hasPrevPage
                ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #6366f1 100%)'
                : 'rgba(100, 116, 139, 0.3)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: paginationInfo.hasPrevPage ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: paginationInfo.hasPrevPage ? 1 : 0.5
            }}
          >
            ← Previous
          </button>

          {/* Page Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            <span>Page {paginationInfo.currentPage} of {paginationInfo.totalPages}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>{paginationInfo.totalNotes} total notes</span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => loadAllNotes(paginationInfo.currentPage + 1)}
            disabled={!paginationInfo.hasNextPage}
            style={{
              padding: '0.75rem 1.5rem',
              background: paginationInfo.hasNextPage
                ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #6366f1 100%)'
                : 'rgba(100, 116, 139, 0.3)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: paginationInfo.hasNextPage ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: paginationInfo.hasNextPage ? 1 : 0.5
            }}
          >
            Next →
          </button>
        </div>
      )}

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
