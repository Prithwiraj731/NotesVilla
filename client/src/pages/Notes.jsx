import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { downloadFile } from '../utils/downloadUtils';
import { Search, Download, Share2, Calendar, BookOpen, FileText, Filter, Grid, List } from 'lucide-react';

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
    
    // Parse URL subject parameter if coming from Homepage selector
    const params = new URLSearchParams(window.location.search);
    const subjectParam = params.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedSubject, searchTerm]);

  const loadSubjects = async () => {
    try {
      const r = await API.get('/notes/subjects');
      if (Array.isArray(r.data)) {
        setSubjects(r.data);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError('Failed to load subjects.');
    }
  };

  const loadAllNotes = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const r = await API.get(`/notes?page=${page}&limit=20`);

      if (r.data && r.data.notes && Array.isArray(r.data.notes)) {
        setNotes(r.data.notes);
        setPaginationInfo(r.data.pagination);
        if (r.data.notes.length === 0 && page === 1) {
          setError('No notes found. Upload some notes first!');
        }
      } else if (Array.isArray(r.data)) {
        setNotes(r.data);
        setPaginationInfo({
          currentPage: 1,
          totalPages: 1,
          totalNotes: r.data.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: r.data.length
        });
        if (r.data.length === 0) {
          setError('No notes found. Upload some notes first!');
        }
      } else {
        setError('Invalid response format from server.');
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (note) => {
    navigate(`/note/${note._id}`);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
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
    // Remove query parameter from URL
    navigate('/notes', { replace: true });
  };

  const handleDownload = async (note) => {
    try {
      if (note.files && note.files.length > 1) {
        handleCardClick(note);
        return;
      }

      const fileUrl = note.files && note.files.length > 0 ? note.files[0].fileUrl : note.fileUrl;
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

      if (!ok) alert('Download failed. Please try again.');
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed due to an unexpected error.');
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
      {/* Header Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 3rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: '900',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 1rem',
        }}>
          NOTES LIBRARY
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          fontFamily: 'var(--font-body)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Explore and download educational content organized by subjects and topics.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 2rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.3)',
          borderRadius: '8px',
          padding: '1.25rem',
          color: 'var(--accent-orange)',
          fontFamily: 'var(--font-body)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>⚠️ Loading Warning</div>
          <div style={{ fontSize: '0.95rem' }}>{error}</div>
        </div>
      )}

      {/* Filters and Search Section */}
      <div 
        className="cyber-panel"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 2.5rem',
          padding: '1.5rem',
          borderRadius: '8px'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: '1.2rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search notes by title, topic..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '3rem !important',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.1rem'
              }}
            />
          </div>

          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={{
              width: window.innerWidth < 768 ? '100%' : '240px',
              fontFamily: 'var(--font-tech)',
              fontSize: '1.1rem'
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>

          {/* View Mode Toggle Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="cyber-btn-wire"
              style={{
                flex: '1',
                borderColor: viewMode === 'grid' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'grid' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'grid' ? 'rgba(251, 54, 64, 0.08)' : 'transparent'
              }}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="cyber-btn-wire"
              style={{
                flex: '1',
                borderColor: viewMode === 'list' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'list' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'list' ? 'rgba(251, 54, 64, 0.08)' : 'transparent'
              }}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {(selectedSubject || searchTerm) && (
          <button
            onClick={clearFilters}
            className="cyber-btn-wire"
            style={{
              marginTop: '1.2rem',
              borderColor: 'rgba(251, 54, 64, 0.3)',
              color: 'var(--accent-orange)',
              padding: '0.4rem 1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(251, 54, 64, 0.08)';
              e.currentTarget.style.borderColor = 'var(--accent-orange)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.3)';
            }}
          >
            <Filter size={14} /> Clear Active Filters
          </button>
        )}
      </div>

      {/* Notes Listing Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(251, 54, 64, 0.2)',
              borderTop: '3px solid var(--accent-orange)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <p style={{ fontFamily: 'var(--font-tech)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>FETCHING NOTES SYSTEMS...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div 
            className="cyber-panel"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '8px',
              color: 'var(--text-secondary)'
            }}
          >
            <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>NO RECORD FOUND</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>No notes match your active filter/search configurations.</p>
          </div>
        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? (window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))') : '1fr',
            flexDirection: viewMode === 'list' ? 'column' : 'row',
            gap: '1.5rem'
          }}>
            {filteredNotes.map((note, idx) => (
              <div
                key={note._id}
                onClick={() => handleCardClick(note)}
                className="cyber-panel"
                style={{
                  borderRadius: '8px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'fadeInUpUp 0.4s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(251, 54, 64, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.15)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
                }}
              >
                {/* Note Details Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: 0,
                    fontFamily: 'var(--font-cyber)',
                    flex: '1',
                    wordBreak: 'break-word',
                    lineHeight: '1.3'
                  }}>{note.title}</h3>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-tech)',
                    fontSize: '0.9rem',
                    marginLeft: '1rem'
                  }}>
                    <Calendar size={14} />
                    {formatDate(note.date)}
                  </div>
                </div>

                {/* Description */}
                {note.description && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    fontFamily: 'var(--font-body)',
                    margin: '0 0 1.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{note.description}</p>
                )}

                {/* Tags section */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(251, 54, 64, 0.08)',
                    border: '1px solid rgba(251, 54, 64, 0.25)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.8rem',
                    color: 'var(--accent-orange)',
                    fontFamily: 'var(--font-tech)',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    <BookOpen size={12} />
                    {note.subjectName}
                  </span>
                  
                  {note.files && note.files.length > 1 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(251, 54, 64, 0.08)',
                      border: '1px solid rgba(251, 54, 64, 0.25)',
                      borderRadius: '4px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.8rem',
                      color: 'var(--accent-amber)',
                      fontFamily: 'var(--font-tech)',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      <FileText size={12} />
                      {note.files.length} Files
                    </span>
                  )}
                </div>

                {/* CTA Action Buttons */}
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    onClick={async (e) => {
                      handleActionClick(e);
                      await handleDownload(note);
                    }}
                    className="cyber-btn-orange"
                    style={{
                      flex: '1',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)'
                    }}
                  >
                    <Download size={14} />
                    {note.files && note.files.length > 1 ? `View files` : 'Download'}
                  </button>
                  
                  <button
                    onClick={(e) => { handleActionClick(e); share(note); }}
                    className="cyber-btn-wire"
                    style={{ padding: '0.5rem' }}
                  >
                    <Share2 size={14} />
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
          margin: '3rem auto 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => loadAllNotes(paginationInfo.currentPage - 1)}
            disabled={!paginationInfo.hasPrevPage}
            className="cyber-btn-wire"
            style={{ opacity: paginationInfo.hasPrevPage ? 1 : 0.5, cursor: paginationInfo.hasPrevPage ? 'pointer' : 'not-allowed' }}
          >
            ← Prev System
          </button>

          <div style={{
            fontFamily: 'var(--font-tech)',
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em'
          }}>
            SYSTEM BLOCK {paginationInfo.currentPage} OF {paginationInfo.totalPages} ({paginationInfo.totalNotes} TOTAL CODES)
          </div>

          <button
            onClick={() => loadAllNotes(paginationInfo.currentPage + 1)}
            disabled={!paginationInfo.hasNextPage}
            className="cyber-btn-wire"
            style={{ opacity: paginationInfo.hasNextPage ? 1 : 0.5, cursor: paginationInfo.hasNextPage ? 'pointer' : 'not-allowed' }}
          >
            Next System →
          </button>
        </div>
      )}

      {/* Animations styling */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUpUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
