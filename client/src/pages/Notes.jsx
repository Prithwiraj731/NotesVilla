import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';
import DocViewer, { getFileCategory } from '../components/DocViewer';
import { 
  Search, 
  Download, 
  Share2, 
  Calendar, 
  BookOpen, 
  FileText, 
  Grid, 
  List, 
  Eye, 
  X, 
  Check,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Sparkles,
  Layers
} from 'lucide-react';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function isImageUrl(url) {
  if (!url) return false;
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url)) return true;
  if (/res\.cloudinary\.com.*\/image\/upload/i.test(url)) return true;
  return false;
}

function getNoteFileType(note) {
  if (note.fileType === 'image') return 'image';
  if (isImageFile(note.filename)) return 'image';
  if (note.files && note.files.length > 0) {
    const hasImage = note.files.some(f => 
      (f.fileType === 'image') || isImageFile(f.originalName || f.filename)
    );
    if (hasImage) return 'image';
  }
  if (isImageUrl(note.fileUrl)) return 'image';
  return 'document';
}

export default function Notes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'grid' | 'list'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Collapsed state for subject sections (all expanded by default)
  const [collapsedSubjects, setCollapsedSubjects] = useState({});

  // Preview modal state
  const [previewNote, setPreviewNote] = useState(null);
  const [modalFullscreen, setModalFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadSubjects();
    loadAllNotes();
    
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
  }, [location.search]);

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
    }
  };

  const loadAllNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const r = await API.get('/notes?limit=150');

      if (r.data && r.data.notes && Array.isArray(r.data.notes)) {
        const sorted = r.data.notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotes(sorted);
      } else if (Array.isArray(r.data)) {
        const sorted = r.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotes(sorted);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Could not load notes. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (selectedSubject && selectedSubject !== 'All') {
      filtered = filtered.filter(note => 
        note.subjectName?.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(q) ||
        note.subjectName?.toLowerCase().includes(q) ||
        note.date?.includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredNotes(filtered);
  };

  const handleSubjectChange = (subj) => {
    setSelectedSubject(subj);
    if (subj === 'All') {
      navigate('/notes', { replace: true });
    } else {
      navigate(`/notes?subject=${encodeURIComponent(subj)}`, { replace: true });
    }
  };

  const toggleSubjectCollapse = (subjName) => {
    setCollapsedSubjects(prev => ({
      ...prev,
      [subjName]: !prev[subjName]
    }));
  };

  const shareNote = async (note, e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/note/${note._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: `Study Notes: ${note.title} (${note.subjectName})`,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(note._id);
        setTimeout(() => setCopiedId(null), 2500);
      } catch (err) {
        console.error('Failed to copy');
      }
    }
  };

  const handleDownload = async (note, e) => {
    if (e) e.stopPropagation();
    try {
      if (note.files && note.files.length > 1) {
        const files = note.files.map(f => ({
          fileUrl: f.fileUrl,
          filename: f.originalName || f.filename || 'download'
        }));
        await downloadMultipleFiles(files, {
          staggerDelay: 500,
          retryAttempts: 2,
          timeout: 45000
        });
        return;
      }

      const fileUrl = note.files && note.files.length > 0 ? note.files[0].fileUrl : note.fileUrl;
      const filename = note.files && note.files.length > 0
        ? (note.files[0].originalName || note.files[0].filename || 'download')
        : (note.originalName || note.filename || 'download');

      if (!fileUrl) {
        alert('File URL not found');
        return;
      }

      const ok = await downloadFile(fileUrl, filename, {
        enableLogging: true,
        retryAttempts: 2,
        timeout: 45000
      });

      if (!ok) alert('Download failed. Opening in new tab...');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      day: d.toLocaleDateString('en-US', { day: '2-digit' }),
      year: d.getFullYear(),
      full: d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    };
  };

  // ──────────────────────────────────────────────────────────
  // Hierarchical Grouping: Subject-Wise -> Date-Wise
  // ──────────────────────────────────────────────────────────
  const subjectGroups = filteredNotes.reduce((acc, note) => {
    const subj = note.subjectName || 'General Notes';
    if (!acc[subj]) {
      acc[subj] = {
        subjectName: subj,
        notes: [],
        dates: {}
      };
    }
    acc[subj].notes.push(note);

    const dateKey = new Date(note.date).toISOString().split('T')[0];
    if (!acc[subj].dates[dateKey]) {
      acc[subj].dates[dateKey] = [];
    }
    acc[subj].dates[dateKey].push(note);

    return acc;
  }, {});

  // Distinct subjects list for top carousel
  const allSubjectNames = [
    'All',
    ...new Set([
      ...subjects.map(s => s.name),
      ...notes.map(n => n.subjectName).filter(Boolean)
    ])
  ];

  // ──────────────────────────────────────────────
  // Note Card Component
  // ──────────────────────────────────────────────
  const NoteCard = ({ note, showDate = false }) => {
    const noteType = getNoteFileType(note);
    const isImage = noteType === 'image';
    const dateInfo = formatDate(note.date);
    const imageUrl = isImage 
      ? (note.files && note.files.length > 0 ? note.files[0].fileUrl : note.fileUrl) 
      : null;

    return (
      <div
        className="cyber-panel"
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${isImage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.2)'}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          background: 'rgba(0, 15, 8, 0.85)'
        }}
        onClick={() => setPreviewNote(note)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isImage ? '#10B981' : 'var(--accent-orange)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 8px 25px ${isImage ? 'rgba(16, 185, 129, 0.18)' : 'rgba(251, 54, 64, 0.18)'}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isImage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image thumbnail header if it's an image note */}
        {isImage && imageUrl && (
          <div style={{
            width: '100%',
            height: '160px',
            overflow: 'hidden',
            background: 'rgba(0, 5, 2, 0.8)',
            position: 'relative'
          }}>
            <img 
              src={imageUrl} 
              alt={note.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(16, 185, 129, 0.95)',
              color: '#fff',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: '700',
              fontFamily: 'var(--font-tech)'
            }}>
              📸 IMAGE
            </div>
          </div>
        )}

        <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div>
            {/* Meta Tags Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.8rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{
                  background: isImage ? 'rgba(16, 185, 129, 0.12)' : 'rgba(251, 54, 64, 0.12)',
                  border: `1px solid ${isImage ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 54, 64, 0.3)'}`,
                  color: isImage ? '#10B981' : 'var(--accent-orange)',
                  fontFamily: 'var(--font-tech)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                  <span>{isImage ? 'IMAGE NOTE' : 'DOCUMENT'}</span>
                </span>

                {note.files && note.files.length > 1 && (
                  <span style={{
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-tech)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Layers size={12} />
                    {note.files.length} Files
                  </span>
                )}
              </div>

              {showDate && (
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>
                  📅 {dateInfo.full}
                </span>
              )}
            </div>

            {/* Note Title */}
            <h3 style={{
              fontFamily: 'var(--font-tech)',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 0.8rem',
              lineHeight: '1.35',
              wordBreak: 'break-word'
            }}>
              {note.title}
            </h3>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            paddingTop: '0.8rem',
            borderTop: `1px solid ${isImage ? 'rgba(16, 185, 129, 0.12)' : 'rgba(251, 54, 64, 0.12)'}`
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewNote(note); }}
              className="cyber-btn-wire"
              style={{ flex: '1.2', padding: '0.45rem 0.6rem', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              <Eye size={13} /> Preview
            </button>

            <button
              onClick={(e) => handleDownload(note, e)}
              className="cyber-btn-orange"
              style={{
                flex: '1',
                padding: '0.45rem 0.6rem',
                fontSize: '0.82rem',
                justifyContent: 'center',
                clipPath: 'none',
                borderRadius: '4px'
              }}
            >
              <Download size={13} /> Download
            </button>

            <button
              onClick={(e) => shareNote(note, e)}
              className="cyber-btn-wire"
              style={{ padding: '0.45rem 0.6rem' }}
              title="Share Link"
            >
              {copiedId === note._id ? <Check size={13} style={{ color: '#10B981' }} /> : <Share2 size={13} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="notes-page-container">
      {/* ─── PAGE HEADER ─────────────────────────────────────── */}
      <div className="notes-header-wrapper">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.35rem 1rem',
          marginBottom: '0.8rem'
        }}>
          <BookOpen size={15} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.82rem'
          }}>
            Subject-Wise & Date-Wise Repository
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)',
          fontWeight: '900',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-orange) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.8rem',
          lineHeight: '1.2'
        }}>
          ACADEMIC NOTES LIBRARY
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.55'
        }}>
          Browse notes systematically organized by course subjects, followed by chronological lecture dates in continuity.
        </p>
      </div>

      {/* ─── SUBJECT FILTER PILLS CAROUSEL ──────────────────── */}
      <div className="notes-subject-carousel hide-scrollbar touch-scroll">
        {allSubjectNames.map((subj, idx) => {
          const isSelected = selectedSubject === subj;
          const count = subj === 'All' 
            ? notes.length 
            : notes.filter(n => n.subjectName?.toLowerCase() === subj.toLowerCase()).length;
          
          return (
            <button
              key={idx}
              onClick={() => handleSubjectChange(subj)}
              className="cyber-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: isSelected ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.15)',
                background: isSelected ? 'rgba(251, 54, 64, 0.15)' : 'rgba(0, 15, 8, 0.6)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.88rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 12px rgba(251, 54, 64, 0.25)' : 'none',
                flexShrink: 0
              }}
            >
              <BookOpen size={13} style={{ color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)' }} />
              <span>{subj}</span>
              <span style={{
                background: isSelected ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.1)',
                color: isSelected ? '#000000' : 'var(--accent-orange)',
                borderRadius: '10px',
                padding: '0.1rem 0.4rem',
                fontSize: '0.72rem',
                fontWeight: '700'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── SEARCH & VIEW SWITCHER ─────────────────────────── */}
      <div 
        className="cyber-panel notes-toolbar-panel"
      >
        <div className="notes-toolbar-inner">
          {/* Search Bar */}
          <div className="notes-search-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by topic, subject, or lecture date..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input-with-icon"
              style={{
                width: '100%',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* View Mode Switcher */}
          <div className="notes-view-switcher">
            <button
              onClick={() => setViewMode('timeline')}
              className="cyber-btn-wire view-toggle-btn"
              style={{
                borderColor: viewMode === 'timeline' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'timeline' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'timeline' ? 'rgba(251, 54, 64, 0.1)' : 'transparent'
              }}
            >
              <Calendar size={14} />
              <span className="view-btn-text-full">Subject Timeline</span>
              <span className="view-btn-text-short">Timeline</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className="cyber-btn-wire view-toggle-btn"
              style={{
                borderColor: viewMode === 'grid' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'grid' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'grid' ? 'rgba(251, 54, 64, 0.1)' : 'transparent'
              }}
            >
              <Grid size={14} />
              <span className="view-btn-text-full">Grid View</span>
              <span className="view-btn-text-short">Grid</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className="cyber-btn-wire view-toggle-btn"
              style={{
                borderColor: viewMode === 'list' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'list' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'list' ? 'rgba(251, 54, 64, 0.1)' : 'transparent'
              }}
            >
              <List size={14} />
              <span className="view-btn-text-full">List View</span>
              <span className="view-btn-text-short">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT: SUBJECT-WISE & DATE-WISE SECTIONS ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto 4rem' }}>
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
            <p style={{ fontFamily: 'var(--font-tech)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>ORGANIZING SUBJECTS & DATES...</p>
          </div>
        ) : Object.keys(subjectGroups).length === 0 ? (
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
            <h3 style={{ fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>NO NOTES RECORDED FOR THIS SELECTION</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
              {selectedSubject !== 'All' 
                ? `No notes uploaded yet for ${selectedSubject}.` 
                : 'No notes match your active search terms.'}
            </p>
          </div>
        ) : (
          /* Render Each Subject Group */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            {Object.keys(subjectGroups).map((subjName) => {
              const group = subjectGroups[subjName];
              const isCollapsed = !!collapsedSubjects[subjName];
              const totalLectures = group.notes.length;
              const dateKeys = Object.keys(group.dates);

              return (
                <div key={subjName} style={{ position: 'relative' }}>
                  {/* ─── SUBJECT HEADER BANNER ──────────────────────── */}
                  <div 
                    className="cyber-panel notes-subject-banner"
                    style={{
                      marginBottom: isCollapsed ? '0' : '1.5rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSubjectCollapse(subjName)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(251, 54, 64, 0.12)',
                        border: '1px solid rgba(251, 54, 64, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-orange)',
                        flexShrink: 0
                      }}>
                        <BookOpen size={18} />
                      </div>

                      <div>
                        <h2 style={{
                          fontFamily: 'var(--font-cyber)',
                          fontSize: 'clamp(1.1rem, 3vw, 1.45rem)',
                          color: '#ffffff',
                          margin: '0 0 0.15rem 0',
                          letterSpacing: '0.03em',
                          lineHeight: '1.3'
                        }}>
                          {subjName}
                        </h2>
                        <div style={{
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-tech)',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          <span>{totalLectures} {totalLectures === 1 ? 'Lecture Note' : 'Lecture Notes'}</span>
                          <span>•</span>
                          <span>{dateKeys.length} {dateKeys.length === 1 ? 'Active Date' : 'Lecture Dates'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectChange(subjName);
                        }}
                        className="cyber-btn-wire"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Focus Subject
                      </button>

                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(251, 54, 64, 0.08)',
                        border: '1px solid rgba(251, 54, 64, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-orange)',
                        flexShrink: 0
                      }}>
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* ─── DATE-WISE LECTURES UNDER THIS SUBJECT ─────── */}
                  {!isCollapsed && (
                    <>
                      {viewMode === 'timeline' ? (
                        /* === 1. TIMELINE: Date-wise continuity inside this subject === */
                        <div className="notes-timeline-container">
                          {/* Subject Vertical Timeline Spine */}
                          <div className="notes-timeline-spine" />

                          {dateKeys.map((dateKey) => {
                            const notesOnDate = group.dates[dateKey];
                            const dateInfo = formatDate(dateKey);

                            return (
                              <div key={dateKey} style={{ marginBottom: '2.2rem', position: 'relative' }}>
                                {/* Date Marker & Node */}
                                <div className="notes-date-marker-row">
                                  {/* Glowing Timeline Dot */}
                                  <div className="notes-timeline-dot" />

                                  {/* Date Badge */}
                                  <div className="notes-date-badge">
                                    <Calendar size={14} style={{ color: 'var(--accent-orange)' }} />
                                    <span style={{
                                      color: '#ffffff',
                                      fontFamily: 'var(--font-cyber)',
                                      fontSize: '0.88rem',
                                      fontWeight: '700',
                                      letterSpacing: '0.03em'
                                    }}>
                                      {dateInfo.full}
                                    </span>
                                    <span style={{
                                      color: 'var(--accent-orange)',
                                      fontFamily: 'var(--font-tech)',
                                      fontSize: '0.78rem',
                                      fontWeight: '700'
                                    }}>
                                      ({notesOnDate.length} {notesOnDate.length === 1 ? 'Lecture' : 'Lectures'})
                                    </span>
                                  </div>
                                </div>

                                {/* Lecture Cards Grid for this Date */}
                                <div className="notes-card-grid">
                                  {notesOnDate.map((note) => (
                                    <NoteCard key={note._id} note={note} />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* === 2. GRID / LIST: Date-sorted cards for this subject === */
                        <div className={viewMode === 'grid' ? 'notes-card-grid' : 'notes-card-list'}>
                          {group.notes.map((note) => (
                            <NoteCard key={note._id} note={note} showDate={true} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── IN-WEBSITE INTERACTIVE DOCUMENT & PDF PREVIEW MODAL ─── */}
      {previewNote && (() => {
        const attachedFiles = (previewNote.files && previewNote.files.length > 0)
          ? previewNote.files
          : [{
              fileUrl: previewNote.fileUrl,
              filename: previewNote.filename,
              originalName: previewNote.originalName || previewNote.filename || previewNote.title,
              fileType: previewNote.fileType
            }];

        return (
          <div 
            className="notes-modal-overlay"
            onClick={() => setPreviewNote(null)}
          >
            <div 
              className={`notes-modal-wrapper ${modalFullscreen ? 'modal-fullscreen' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header Bar */}
              <div className="notes-modal-header">
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'var(--accent-orange)',
                      color: '#000',
                      fontFamily: 'var(--font-cyber)',
                      fontSize: '0.72rem',
                      fontWeight: '900',
                      padding: '0.12rem 0.45rem',
                      borderRadius: '4px'
                    }}>
                      {previewNote.subjectName}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.8rem' }}>
                      📅 {new Date(previewNote.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', margin: 0, letterSpacing: '0.02em', lineHeight: '1.3' }}>
                    {previewNote.title}
                  </h2>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <button
                    onClick={(e) => shareNote(previewNote, e)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                    title="Share Note Link"
                  >
                    {copiedId === previewNote._id ? <Check size={13} style={{ color: '#10B981' }} /> : <Share2 size={13} />}
                    <span className="modal-btn-label">Share</span>
                  </button>

                  <button
                    onClick={() => setModalFullscreen(prev => !prev)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem' }}
                    title={modalFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                  >
                    {modalFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>

                  <button
                    onClick={() => setPreviewNote(null)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    title="Close Viewer"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Embedded Interactive DocViewer Component */}
              <div style={{ flex: 1, height: 'calc(100% - 60px)', overflow: 'hidden' }}>
                <DocViewer
                  files={attachedFiles}
                  title={previewNote.title}
                  onClose={() => setPreviewNote(null)}
                  isFullscreenMode={modalFullscreen}
                />
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .notes-page-container {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%);
          padding: 2rem 1.5rem;
          padding-top: 6.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .notes-page-container {
            padding: 1.2rem 1.1rem;
            padding-top: 5.2rem;
          }
        }

        .notes-header-wrapper {
          max-width: 1280px;
          margin: 0 auto 2.5rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .notes-header-wrapper {
            margin-bottom: 1.8rem;
          }
        }

        .notes-subject-carousel {
          max-width: 1280px;
          margin: 0 auto 1.8rem;
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding-bottom: 0.4rem;
        }

        .notes-toolbar-panel {
          max-width: 1280px;
          margin: 0 auto 2.5rem;
          border-radius: 8px;
          padding: 1.2rem 1.5rem;
        }

        @media (max-width: 768px) {
          .notes-toolbar-panel {
            padding: 1rem;
            margin-bottom: 1.8rem;
          }
        }

        .notes-toolbar-inner {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .notes-toolbar-inner {
            flex-direction: column;
            gap: 0.8rem;
          }
        }

        .notes-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 240px;
          width: 100%;
        }

        .notes-view-switcher {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .notes-view-switcher {
            width: 100%;
            gap: 0.35rem;
          }
        }

        .view-toggle-btn {
          padding: 0.5rem 0.9rem;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .view-toggle-btn {
            flex: 1;
            justify-content: center;
            padding: 0.5rem 0.35rem;
            font-size: 0.8rem;
          }
        }

        .view-btn-text-short {
          display: none;
        }

        @media (max-width: 640px) {
          .view-btn-text-full {
            display: none;
          }
          .view-btn-text-short {
            display: inline;
          }
        }

        .notes-subject-banner {
          border-radius: 10px;
          padding: 1.1rem 1.4rem;
          border: 1px solid rgba(251, 54, 64, 0.3);
          background: rgba(0, 15, 8, 0.95);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.8rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.5);
        }

        @media (max-width: 640px) {
          .notes-subject-banner {
            padding: 0.9rem 1rem;
          }
        }

        .notes-timeline-container {
          position: relative;
          padding-left: 2.5rem;
          margin-left: 0.5rem;
        }

        @media (max-width: 640px) {
          .notes-timeline-container {
            padding-left: 1.25rem;
            margin-left: 0;
          }
        }

        .notes-timeline-spine {
          position: absolute;
          top: 10px;
          bottom: 10px;
          left: 12px;
          width: 2px;
          background: linear-gradient(to bottom, var(--accent-orange), rgba(251, 54, 64, 0.15));
        }

        @media (max-width: 640px) {
          .notes-timeline-spine {
            left: 4px;
          }
        }

        .notes-date-marker-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;
          position: relative;
        }

        .notes-timeline-dot {
          position: absolute;
          left: -2.55rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-orange);
          box-shadow: 0 0 10px var(--accent-orange);
          border: 3px solid #000F08;
        }

        @media (max-width: 640px) {
          .notes-timeline-dot {
            left: -1.45rem;
            width: 12px;
            height: 12px;
            border-width: 2px;
          }
        }

        .notes-date-badge {
          background: rgba(251, 54, 64, 0.08);
          border: 1px solid rgba(251, 54, 64, 0.25);
          borderRadius: 6px;
          padding: 0.3rem 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .notes-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
          gap: 1.2rem;
        }

        @media (max-width: 640px) {
          .notes-card-grid {
            grid-template-columns: 1fr;
            gap: 0.9rem;
          }
        }

        .notes-card-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Modal Styles */
        .notes-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 15, 8, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .notes-modal-overlay {
            padding: 0;
          }
        }

        .notes-modal-wrapper {
          position: relative;
          max-width: 1100px;
          width: 100%;
          height: 88vh;
          border-radius: 12px;
          overflow: hidden;
          background: #000A05;
          border: 1px solid rgba(251, 54, 64, 0.35);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 640px) {
          .notes-modal-wrapper {
            max-width: 100vw;
            height: 100vh;
            border-radius: 0;
            border: none;
          }
        }

        .notes-modal-wrapper.modal-fullscreen {
          max-width: 100vw;
          height: 100vh;
          border-radius: 0;
          border: none;
        }

        .notes-modal-header {
          padding: 0.85rem 1.25rem;
          background: rgba(0, 15, 8, 0.98);
          border-bottom: 1px solid rgba(251, 54, 64, 0.25);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.6rem;
        }

        @media (max-width: 480px) {
          .notes-modal-header {
            padding: 0.7rem 0.9rem;
          }
          .modal-btn-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
