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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 20%, rgba(251, 54, 64, 0.09) 0%, #000F08 75%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      {/* ─── PAGE HEADER ─────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 2.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 54, 64, 0.08)',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          borderRadius: '4px',
          padding: '0.4rem 1.2rem',
          marginBottom: '1rem'
        }}>
          <BookOpen size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-tech)',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.9rem'
          }}>
            Subject-Wise & Date-Wise Repository
          </span>
        </div>

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
          margin: '0 0 1rem'
        }}>
          ACADEMIC NOTES LIBRARY
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '1.05rem',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Browse notes systematically organized by course subjects, followed by chronological lecture dates in continuity.
        </p>
      </div>

      {/* ─── SUBJECT FILTER PILLS CAROUSEL ──────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 2rem',
        display: 'flex',
        gap: '0.6rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none'
      }}>
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
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                border: isSelected ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.15)',
                background: isSelected ? 'rgba(251, 54, 64, 0.15)' : 'rgba(0, 15, 8, 0.6)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.95rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 12px rgba(251, 54, 64, 0.25)' : 'none'
              }}
            >
              <BookOpen size={14} style={{ color: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)' }} />
              <span>{subj}</span>
              <span style={{
                background: isSelected ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.1)',
                color: isSelected ? '#000000' : 'var(--accent-orange)',
                borderRadius: '10px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
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
        className="cyber-panel"
        style={{
          maxWidth: '1280px',
          margin: '0 auto 2.5rem',
          borderRadius: '8px',
          padding: '1.2rem 1.5rem'
        }}
      >
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by topic, subject, or lecture date..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '3rem',
                fontFamily: 'var(--font-tech)',
                fontSize: '1.05rem'
              }}
            />
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('timeline')}
              className="cyber-btn-wire"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                borderColor: viewMode === 'timeline' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'timeline' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'timeline' ? 'rgba(251, 54, 64, 0.1)' : 'transparent'
              }}
            >
              <Calendar size={14} /> Subject Timeline
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className="cyber-btn-wire"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                borderColor: viewMode === 'grid' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'grid' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'grid' ? 'rgba(251, 54, 64, 0.1)' : 'transparent'
              }}
            >
              <Grid size={14} /> Grid View
            </button>

            <button
              onClick={() => setViewMode('list')}
              className="cyber-btn-wire"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                borderColor: viewMode === 'list' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.2)',
                color: viewMode === 'list' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: viewMode === 'list' ? 'rgba(251, 54, 64, 0.1)' : 'transparent'
              }}
            >
              <List size={14} /> List View
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
                    className="cyber-panel"
                    style={{
                      borderRadius: '10px',
                      padding: '1.2rem 1.6rem',
                      border: '1px solid rgba(251, 54, 64, 0.3)',
                      background: 'rgba(0, 15, 8, 0.95)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: isCollapsed ? '0' : '2rem',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSubjectCollapse(subjName)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: 'rgba(251, 54, 64, 0.12)',
                        border: '1px solid rgba(251, 54, 64, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-orange)'
                      }}>
                        <BookOpen size={20} />
                      </div>

                      <div>
                        <h2 style={{
                          fontFamily: 'var(--font-cyber)',
                          fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                          color: '#ffffff',
                          margin: '0 0 0.2rem 0',
                          letterSpacing: '0.04em'
                        }}>
                          {subjName}
                        </h2>
                        <div style={{
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-tech)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}>
                          <span>{totalLectures} {totalLectures === 1 ? 'Lecture Note' : 'Lecture Notes'}</span>
                          <span>•</span>
                          <span>{dateKeys.length} {dateKeys.length === 1 ? 'Active Date' : 'Lecture Dates'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectChange(subjName);
                        }}
                        className="cyber-btn-wire"
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
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
                        color: 'var(--accent-orange)'
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
                        <div style={{ position: 'relative', paddingLeft: '2.5rem', marginLeft: '0.5rem' }}>
                          {/* Subject Vertical Timeline Spine */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            bottom: '10px',
                            left: '12px',
                            width: '2px',
                            background: 'linear-gradient(to bottom, var(--accent-orange), rgba(251, 54, 64, 0.15))'
                          }} />

                          {dateKeys.map((dateKey) => {
                            const notesOnDate = group.dates[dateKey];
                            const dateInfo = formatDate(dateKey);

                            return (
                              <div key={dateKey} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                                {/* Date Marker & Node */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.8rem',
                                  marginBottom: '1.2rem',
                                  position: 'relative'
                                }}>
                                  {/* Glowing Timeline Dot */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '-2.55rem',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-orange)',
                                    boxShadow: '0 0 10px var(--accent-orange)',
                                    border: '3px solid #000F08'
                                  }} />

                                  {/* Date Badge */}
                                  <div style={{
                                    background: 'rgba(251, 54, 64, 0.08)',
                                    border: '1px solid rgba(251, 54, 64, 0.25)',
                                    borderRadius: '6px',
                                    padding: '0.35rem 0.9rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <Calendar size={15} style={{ color: 'var(--accent-orange)' }} />
                                    <span style={{
                                      color: '#ffffff',
                                      fontFamily: 'var(--font-cyber)',
                                      fontSize: '0.95rem',
                                      fontWeight: '700',
                                      letterSpacing: '0.04em'
                                    }}>
                                      {dateInfo.full}
                                    </span>
                                    <span style={{
                                      color: 'var(--accent-orange)',
                                      fontFamily: 'var(--font-tech)',
                                      fontSize: '0.8rem',
                                      fontWeight: '700'
                                    }}>
                                      ({notesOnDate.length} {notesOnDate.length === 1 ? 'Lecture' : 'Lectures'})
                                    </span>
                                  </div>
                                </div>

                                {/* Lecture Cards Grid for this Date */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                  gap: '1.2rem'
                                }}>
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
                        <div style={{
                          display: viewMode === 'grid' ? 'grid' : 'flex',
                          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr',
                          flexDirection: viewMode === 'list' ? 'column' : 'row',
                          gap: '1.2rem'
                        }}>
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 15, 8, 0.92)',
              backdropFilter: 'blur(8px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: modalFullscreen ? '0' : '1.5rem',
              boxSizing: 'border-box'
            }}
            onClick={() => setPreviewNote(null)}
          >
            <div 
              style={{
                position: 'relative',
                maxWidth: modalFullscreen ? '100vw' : '1100px',
                width: '100%',
                height: modalFullscreen ? '100vh' : '88vh',
                borderRadius: modalFullscreen ? '0' : '12px',
                overflow: 'hidden',
                background: '#000A05',
                border: modalFullscreen ? 'none' : '1px solid rgba(251, 54, 64, 0.35)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header Bar */}
              <div style={{
                padding: '1rem 1.5rem',
                background: 'rgba(0, 15, 8, 0.98)',
                borderBottom: '1px solid rgba(251, 54, 64, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.8rem'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{
                      background: 'var(--accent-orange)',
                      color: '#000',
                      fontFamily: 'var(--font-cyber)',
                      fontSize: '0.75rem',
                      fontWeight: '900',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {previewNote.subjectName}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>
                      📅 {new Date(previewNote.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.25rem', margin: 0, letterSpacing: '0.03em' }}>
                    {previewNote.title}
                  </h2>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => shareNote(previewNote, e)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    title="Share Note Link"
                  >
                    {copiedId === previewNote._id ? <Check size={14} style={{ color: '#10B981' }} /> : <Share2 size={14} />}
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => setModalFullscreen(prev => !prev)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                    title={modalFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                  >
                    {modalFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>

                  <button
                    onClick={() => setPreviewNote(null)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Close Viewer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Embedded Interactive DocViewer Component */}
              <div style={{ flex: 1, height: 'calc(100% - 70px)', overflow: 'hidden' }}>
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
      `}</style>
    </div>
  );
}
