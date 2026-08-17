import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';
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
  ChevronRight, 
  X, 
  Check,
  Image as ImageIcon
} from 'lucide-react';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'svg'];

function isImageFile(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function isImageUrl(url) {
  if (!url) return false;
  // Check common image URL patterns
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url)) return true;
  // Cloudinary image URLs
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
  const [viewMode, setViewMode] = useState('timeline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [previewNote, setPreviewNote] = useState(null);
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
      const r = await API.get('/notes?limit=100');

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
        note.description?.toLowerCase().includes(q) ||
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

  const groupedByDate = filteredNotes.reduce((acc, note) => {
    const dateKey = new Date(note.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(note);
    return acc;
  }, {});

  const allSubjectNames = [
    'All',
    ...new Set([
      ...subjects.map(s => s.name),
      ...notes.map(n => n.subjectName).filter(Boolean)
    ])
  ];

  // ──────────────────────────────────────────────
  // Reusable Note Card component
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
          border: `1px solid ${isImage ? 'rgba(16, 185, 129, 0.18)' : 'rgba(251, 54, 64, 0.18)'}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={() => setPreviewNote(note)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isImage ? '#10B981' : 'var(--accent-orange)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 8px 25px ${isImage ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 54, 64, 0.15)'}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isImage ? 'rgba(16, 185, 129, 0.18)' : 'rgba(251, 54, 64, 0.18)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Image thumbnail at top of card */}
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
              background: 'rgba(16, 185, 129, 0.9)',
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

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div>
            {/* Subject and Files Tag */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.8rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{
                background: 'rgba(251, 54, 64, 0.1)',
                border: '1px solid rgba(251, 54, 64, 0.3)',
                color: 'var(--accent-orange)',
                fontFamily: 'var(--font-tech)',
                fontSize: '0.85rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {note.subjectName}
              </span>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {note.files && note.files.length > 0 && (
                  <span style={{
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-tech)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {isImage ? <ImageIcon size={13} /> : <FileText size={13} />}
                    {note.files.length} {note.files.length === 1 ? 'File' : 'Files'}
                  </span>
                )}
                {showDate && (
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>
                    📅 {dateInfo.full}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-tech)',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 0.6rem',
              lineHeight: '1.3',
              wordBreak: 'break-word'
            }}>
              {note.title}
            </h3>

            {note.description && (
              <p style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                margin: '0 0 1.2rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {note.description}
              </p>
            )}
          </div>

          {/* Card Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: `1px solid ${isImage ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 54, 64, 0.1)'}`
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewNote(note); }}
              className="cyber-btn-wire"
              style={{ flex: '1', padding: '0.45rem', fontSize: '0.85rem', justifyContent: 'center' }}
            >
              <Eye size={14} /> Preview
            </button>

            <button
              onClick={(e) => handleDownload(note, e)}
              className="cyber-btn-orange"
              style={{
                flex: '1.2',
                padding: '0.45rem',
                fontSize: '0.85rem',
                justifyContent: 'center',
                clipPath: 'none',
                borderRadius: '4px'
              }}
            >
              <Download size={14} /> Download
            </button>

            <button
              onClick={(e) => shareNote(note, e)}
              className="cyber-btn-wire"
              style={{ padding: '0.45rem 0.75rem' }}
              title="Share Link"
            >
              {copiedId === note._id ? <Check size={14} style={{ color: '#10B981' }} /> : <Share2 size={14} />}
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
      {/* Header */}
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
            Chronological Lecture Archive
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
          ACADEMIC NOTES REPOSITORY
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '1.05rem',
          maxWidth: '650px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Select a subject to view date-wise lecture notes and images in continuity, preview in-browser, share with peers, or download.
        </p>
      </div>

      {/* Subject Filter Carousel Pills */}
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
                fontSize: '1rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 12px rgba(251, 54, 64, 0.25)' : 'none'
              }}
            >
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

      {/* Search & View Mode Switcher */}
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
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search lectures by topic, keywords, or date..."
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
              <Calendar size={14} /> Date Continuity
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
              <Grid size={14} /> Grid
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
              <List size={14} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
            <p style={{ fontFamily: 'var(--font-tech)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>FETCHING LECTURE TIMELINE...</p>
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
            <h3 style={{ fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>NO NOTES RECORDED FOR THIS SELECTION</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
              {selectedSubject !== 'All' 
                ? `No notes uploaded yet for ${selectedSubject}.` 
                : 'No notes match your active search terms.'}
            </p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* ===== TIMELINE VIEW ===== */
          <div style={{ position: 'relative', paddingLeft: '3rem' }}>
            {/* Timeline Spine */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '20px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--accent-orange), rgba(251, 54, 64, 0.2))'
            }} />

            {Object.keys(groupedByDate).map((dateKey) => {
              const notesForDate = groupedByDate[dateKey];
              const dateInfo = formatDate(dateKey);

              return (
                <div key={dateKey} style={{ marginBottom: '3rem', position: 'relative' }}>
                  {/* Date Marker */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '-2.65rem',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--accent-orange)',
                      boxShadow: '0 0 12px var(--accent-orange)',
                      border: '3px solid #000F08'
                    }} />

                    <div style={{
                      background: 'rgba(251, 54, 64, 0.1)',
                      border: '1px solid rgba(251, 54, 64, 0.3)',
                      borderRadius: '6px',
                      padding: '0.4rem 1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.6rem'
                    }}>
                      <Calendar size={16} style={{ color: 'var(--accent-orange)' }} />
                      <span style={{
                        color: '#ffffff',
                        fontFamily: 'var(--font-cyber)',
                        fontSize: '1rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em'
                      }}>
                        {dateInfo.full}
                      </span>
                      <span style={{
                        color: 'var(--accent-orange)',
                        fontFamily: 'var(--font-tech)',
                        fontSize: '0.85rem',
                        fontWeight: '700'
                      }}>
                        ({notesForDate.length} {notesForDate.length === 1 ? 'Lecture' : 'Lectures'})
                      </span>
                    </div>
                  </div>

                  {/* Notes Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '1.2rem'
                  }}>
                    {notesForDate.map((note) => (
                      <NoteCard key={note._id} note={note} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ===== GRID / LIST VIEW ===== */
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(360px, 1fr))' : '1fr',
            flexDirection: viewMode === 'list' ? 'column' : 'row',
            gap: '1.5rem'
          }}>
            {filteredNotes.map((note) => (
              <NoteCard key={note._id} note={note} showDate={true} />
            ))}
          </div>
        )}
      </div>

      {/* ===== PREVIEW MODAL ===== */}
      {previewNote && (() => {
        const previewType = getNoteFileType(previewNote);
        const previewIsImage = previewType === 'image';
        const previewImageUrl = previewIsImage 
          ? (previewNote.files && previewNote.files.length > 0 ? previewNote.files[0].fileUrl : previewNote.fileUrl)
          : null;

        return (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 15, 8, 0.95)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setPreviewNote(null)}
          >
            <div 
              className="cyber-panel"
              style={{
                position: 'relative',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#000F08',
                border: `1px solid ${previewIsImage ? 'rgba(16, 185, 129, 0.35)' : 'rgba(251, 54, 64, 0.35)'}`,
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.2rem 1.5rem',
                background: previewIsImage ? 'rgba(16, 185, 129, 0.08)' : 'rgba(251, 54, 64, 0.08)',
                borderBottom: `1px solid ${previewIsImage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.2)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{
                      background: 'var(--accent-orange)',
                      color: '#000',
                      fontFamily: 'var(--font-cyber)',
                      fontSize: '0.8rem',
                      fontWeight: '900',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {previewNote.subjectName}
                    </span>
                    {previewIsImage && (
                      <span style={{
                        background: '#10B981',
                        color: '#fff',
                        fontFamily: 'var(--font-cyber)',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        📸 IMAGE
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>
                      📅 {new Date(previewNote.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.3rem', margin: 0 }}>
                    {previewNote.title}
                  </h3>
                </div>

                <button
                  onClick={() => setPreviewNote(null)}
                  className="cyber-btn-wire"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.9rem' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                {previewNote.description && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    padding: '0.8rem 1rem',
                    background: 'rgba(251, 54, 64, 0.04)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${previewIsImage ? '#10B981' : 'var(--accent-orange)'}`
                  }}>
                    {previewNote.description}
                  </p>
                )}

                {/* Inline Image Preview */}
                {previewIsImage && previewImageUrl && (
                  <div style={{
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    background: 'rgba(0, 5, 2, 0.5)',
                    textAlign: 'center'
                  }}>
                    <img 
                      src={previewImageUrl}
                      alt={previewNote.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* All images in files array */}
                {previewNote.files && previewNote.files.length > 1 && previewNote.files.some(f => 
                  isImageFile(f.originalName || f.filename) || f.fileType === 'image'
                ) && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.8rem',
                    marginBottom: '1.5rem'
                  }}>
                    {previewNote.files
                      .filter(f => isImageFile(f.originalName || f.filename) || f.fileType === 'image')
                      .map((file, fIdx) => (
                        <div key={`img-${fIdx}`} style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          background: 'rgba(0, 5, 2, 0.5)'
                        }}>
                          <img 
                            src={file.fileUrl}
                            alt={file.originalName || `Image ${fIdx + 1}`}
                            style={{
                              width: '100%',
                              height: '180px',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-body)',
                            borderTop: '1px solid rgba(16, 185, 129, 0.1)'
                          }}>
                            {file.originalName || `Image ${fIdx + 1}`}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Files Attached List */}
                <h4 style={{
                  fontFamily: 'var(--font-cyber)',
                  fontSize: '1rem',
                  color: '#ffffff',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Attached Files ({previewNote.files?.length || 1})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {(previewNote.files && previewNote.files.length > 0 ? previewNote.files : [{
                    fileUrl: previewNote.fileUrl,
                    originalName: previewNote.originalName || previewNote.filename || 'Download File'
                  }]).map((file, fIdx) => {
                    const fileIsImage = isImageFile(file.originalName || file.filename) || file.fileType === 'image';
                    return (
                      <div
                        key={fIdx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(0, 15, 8, 0.7)',
                          border: `1px solid ${fileIsImage ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 54, 64, 0.2)'}`,
                          borderRadius: '6px',
                          padding: '0.8rem 1.2rem',
                          flexWrap: 'wrap',
                          gap: '0.8rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {fileIsImage 
                            ? <ImageIcon size={20} style={{ color: '#10B981' }} />
                            : <FileText size={20} style={{ color: 'var(--accent-orange)' }} />
                          }
                          <span style={{ color: '#ffffff', fontFamily: 'var(--font-tech)', fontSize: '1rem', fontWeight: '600' }}>
                            {file.originalName || `File ${fIdx + 1}`}
                          </span>
                          {fileIsImage && (
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              fontSize: '0.65rem',
                              fontWeight: '700'
                            }}>
                              IMAGE
                            </span>
                          )}
                        </div>

                        <button
                          onClick={async () => {
                            const ok = await downloadFile(file.fileUrl, file.originalName || 'lecture-note');
                            if (!ok) alert('Download failed.');
                          }}
                          className="cyber-btn-wire"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          <Download size={13} /> Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                background: 'rgba(0, 15, 8, 0.9)',
                borderTop: `1px solid ${previewIsImage ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 54, 64, 0.15)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.8rem'
              }}>
                <button
                  onClick={(e) => shareNote(previewNote, e)}
                  className="cyber-btn-wire"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  <Share2 size={14} /> Share
                </button>

                <button
                  onClick={() => handleDownload(previewNote)}
                  className="cyber-btn-orange"
                  style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', clipPath: 'none', borderRadius: '4px' }}
                >
                  <Download size={14} /> Download All Files
                </button>
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
