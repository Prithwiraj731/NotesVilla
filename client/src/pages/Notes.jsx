import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';
import DocViewer, { getFileCategory } from '../components/DocViewer';
import { 
  Search, 
  Download, 
  Share2, 
  BookOpen, 
  FileText, 
  Eye, 
  X, 
  Check,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  HelpCircle,
  FolderOpen,
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2
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

  const [rawSubjects, setRawSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected subject: null means showing Subject Directory; otherwise subject string
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All' | 'Theory' | 'Lab' | 'Suggestions'
  const [searchTerm, setSearchTerm] = useState('');

  // Preview modal state
  const [previewNote, setPreviewNote] = useState(null);
  const [modalFullscreen, setModalFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Initial load
  useEffect(() => {
    loadSubjects();
    loadAllNotes();
  }, []);

  // Sync selectedSubject with URL query param ?subject=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam && subjectParam.trim()) {
      setSelectedSubject(subjectParam.trim());
    } else {
      setSelectedSubject(null);
    }
  }, [location.search]);

  const loadSubjects = async () => {
    try {
      const r = await API.get('/notes/subjects');
      if (Array.isArray(r.data)) {
        setRawSubjects(r.data.map(s => (typeof s === 'string' ? s : (s.name || s.subjectName || ''))).filter(Boolean));
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const loadAllNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const r = await API.get('/notes?limit=250');
      const dataNotes = Array.isArray(r.data) ? r.data : (r.data?.notes || []);
      setNotes(dataNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Could not load notes. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamically compute subjects from both subjects endpoint and notes in DB
  // This guarantees ANY note uploaded with a new subject automatically creates that subject here!
  const allSubjects = useMemo(() => {
    const set = new Set();
    rawSubjects.forEach(s => s && set.add(s.trim()));
    notes.forEach(n => {
      if (n.subjectName && n.subjectName.trim()) {
        set.add(n.subjectName.trim());
      }
    });
    return Array.from(set).sort();
  }, [rawSubjects, notes]);

  // Aggregate stats per subject (total notes, theory, lab, suggestions)
  const subjectStats = useMemo(() => {
    const map = {};
    allSubjects.forEach(s => {
      map[s] = { total: 0, theory: 0, lab: 0, suggestions: 0 };
    });

    notes.forEach(note => {
      const sName = note.subjectName?.trim();
      if (sName) {
        if (!map[sName]) {
          map[sName] = { total: 0, theory: 0, lab: 0, suggestions: 0 };
        }
        map[sName].total += 1;
        const cat = (note.category || 'Theory').toLowerCase();
        if (cat === 'lab') map[sName].lab += 1;
        else if (cat === 'suggestions') map[sName].suggestions += 1;
        else map[sName].theory += 1;
      }
    });
    return map;
  }, [allSubjects, notes]);

  // Notes filtered by selected subject, category, and search query
  const currentSubjectNotes = useMemo(() => {
    if (!selectedSubject) return [];
    let list = notes.filter(n => n.subjectName?.toLowerCase() === selectedSubject.toLowerCase());

    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(n => (n.category || 'Theory').toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(n => 
        n.title?.toLowerCase().includes(q) ||
        n.filename?.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [notes, selectedSubject, selectedCategory, searchTerm]);

  // Filtered subjects for Subject Directory view
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return allSubjects;
    const q = searchTerm.toLowerCase();
    return allSubjects.filter(s => s.toLowerCase().includes(q));
  }, [allSubjects, searchTerm]);

  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    setSelectedCategory('All');
    setSearchTerm('');
    navigate(`/notes?subject=${encodeURIComponent(subj)}`, { replace: false });
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedCategory('All');
    setSearchTerm('');
    navigate('/notes', { replace: false });
  };

  // Download single note files
  const handleDownload = async (note) => {
    try {
      if (note.files && note.files.length > 1) {
        const filesToDownload = note.files.map(f => ({
          fileUrl: f.fileUrl,
          filename: f.originalName || f.filename || 'download'
        }));
        await downloadMultipleFiles(filesToDownload, {
          staggerDelay: 600,
          retryAttempts: 2,
          timeout: 45000,
          enableLogging: true
        });
        return;
      }

      const fileUrl = note.fileUrl || (note.files && note.files[0]?.fileUrl);
      const filename = note.originalName || note.filename || (note.files && note.files[0]?.originalName) || `${note.title || 'note'}.pdf`;

      if (fileUrl) {
        await downloadFile(fileUrl, filename, {
          enableLogging: true,
          retryAttempts: 2,
          timeout: 45000
        });
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Download error occurred. Please try again.');
    }
  };

  // Copy share link
  const handleShare = async (note, e) => {
    e.stopPropagation();
    const noteUrl = `${window.location.origin}/note/${note._id || note.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          url: noteUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(noteUrl);
        setCopiedId(note._id || note.id);
        setTimeout(() => setCopiedId(null), 2500);
      } catch (err) {
        console.error('Failed to copy link');
      }
    }
  };

  // Category pill style helper
  const getCategoryStyle = (category) => {
    const cat = (category || 'Theory').toLowerCase();
    if (cat === 'lab') {
      return {
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.35)',
        color: '#60a5fa',
        icon: FlaskConical,
        label: 'Lab Note'
      };
    }
    if (cat === 'suggestions') {
      return {
        bg: 'rgba(168, 85, 247, 0.12)',
        border: 'rgba(168, 85, 247, 0.35)',
        color: '#c084fc',
        icon: HelpCircle,
        label: 'Suggestions / PYQ'
      };
    }
    return {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      color: '#10b981',
      icon: BookOpen,
      label: 'Theory Note'
    };
  };

  return (
    <div className="notes-page-container">
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* ─── BREADCRUMB / HEADER ─────────────────────────────── */}
        <div className="notes-header-block">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(251, 54, 64, 0.08)',
            border: '1px solid rgba(251, 54, 64, 0.3)',
            borderRadius: '30px',
            padding: '0.35rem 1.1rem',
            marginBottom: '0.85rem'
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-orange)' }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontWeight: '700',
              color: '#ffffff',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Academic Knowledge Archive
            </span>
          </div>

          <h1 className="notes-main-title">
            {selectedSubject ? selectedSubject.toUpperCase() : 'COURSE NOTES ARCHIVE'}
          </h1>
        </div>

        {/* ──────────────────────────────────────────────────────────
            VIEW 1: ALL SUBJECTS DIRECTORY (When no subject is chosen)
            ────────────────────────────────────────────────────────── */}
        {!selectedSubject ? (
          <div className="subjects-directory-view">
            {/* Search Bar for Subjects */}
            <div className="notes-search-wrapper" style={{ marginBottom: '2.5rem' }}>
              <div className="notes-search-box">
                <Search size={18} style={{ color: 'var(--accent-orange)', opacity: 0.8 }} />
                <input
                  type="text"
                  placeholder="Search subjects or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="notes-search-input"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="notes-search-clear">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="notes-loading-state">
                <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem', color: 'var(--accent-orange)' }} />
                <div>Loading academic subjects...</div>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="cyber-panel notes-empty-panel">
                <FolderOpen size={48} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.6 }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  NO SUBJECTS FOUND
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {searchTerm ? `No subjects match "${searchTerm}".` : 'No subjects available yet. Upload notes from the admin portal to get started.'}
                </p>
              </div>
            ) : (
              <div className="subjects-cards-grid">
                {filteredSubjects.map((subj, idx) => {
                  const stats = subjectStats[subj] || { total: 0, theory: 0, lab: 0, suggestions: 0 };
                  return (
                    <div
                      key={idx}
                      className="cyber-panel subject-card-item"
                      onClick={() => handleSelectSubject(subj)}
                    >
                      <div className="subject-card-top">
                        <div className="subject-icon-box">
                          <Layers size={22} />
                        </div>
                        <span className="subject-total-badge">
                          {stats.total} {stats.total === 1 ? 'Resource' : 'Resources'}
                        </span>
                      </div>

                      <h3 className="subject-card-title">
                        {subj}
                      </h3>

                      {/* Bifurcated category badges preview */}
                      <div className="subject-pills-row">
                        <span className="category-pill-preview theory-pill">
                          Theory: <strong>{stats.theory}</strong>
                        </span>
                        <span className="category-pill-preview lab-pill">
                          Lab: <strong>{stats.lab}</strong>
                        </span>
                        <span className="category-pill-preview suggestions-pill">
                          Suggestions: <strong>{stats.suggestions}</strong>
                        </span>
                      </div>

                      <div className="subject-card-footer">
                        <span className="subject-card-cta">
                          Open Subject
                        </span>
                        <ArrowRight size={16} className="subject-arrow-icon" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ──────────────────────────────────────────────────────────
             VIEW 2: SUBJECT DRILLDOWN VIEW (Theory / Lab / Suggestions)
             ────────────────────────────────────────────────────────── */
          <div className="subject-drilldown-view">
            
            {/* Back to Subjects Navigation */}
            <div className="subject-drilldown-nav">
              <button
                onClick={handleBackToSubjects}
                className="cyber-btn-wire drilldown-back-btn"
              >
                <ArrowLeft size={16} />
                <span>All Subjects</span>
              </button>

              <div className="subject-breadcrumb">
                <span style={{ color: 'var(--text-muted)' }}>Library</span>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>{selectedSubject}</span>
              </div>
            </div>

            {/* Category Bifurcation Tabs */}
            <div className="category-tabs-bar">
              {[
                { key: 'All', label: 'All Materials', icon: Layers, count: subjectStats[selectedSubject]?.total || 0 },
                { key: 'Theory', label: 'Theory Notes', icon: BookOpen, count: subjectStats[selectedSubject]?.theory || 0 },
                { key: 'Lab', label: 'Lab Notes', icon: FlaskConical, count: subjectStats[selectedSubject]?.lab || 0 },
                { key: 'Suggestions', label: 'Suggestions / PYQ', icon: HelpCircle, count: subjectStats[selectedSubject]?.suggestions || 0 }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`category-tab-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    <span className={`category-tab-count ${isActive ? 'active-count' : ''}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* In-Subject Search Bar */}
            <div className="notes-search-wrapper" style={{ marginBottom: '2rem' }}>
              <div className="notes-search-box">
                <Search size={18} style={{ color: 'var(--accent-orange)', opacity: 0.8 }} />
                <input
                  type="text"
                  placeholder={`Search ${selectedSubject} notes...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="notes-search-input"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="notes-search-clear">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Notes List for Subject & Category */}
            {loading ? (
              <div className="notes-loading-state">
                <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem', color: 'var(--accent-orange)' }} />
                <div>Loading notes...</div>
              </div>
            ) : currentSubjectNotes.length === 0 ? (
              <div className="cyber-panel notes-empty-panel">
                <FileText size={46} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.6 }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  NO NOTES IN THIS CATEGORY
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  {selectedCategory === 'Suggestions'
                    ? `No suggestions or PYQs uploaded for ${selectedSubject} yet. Important questions will be added soon!`
                    : selectedCategory === 'Lab'
                    ? `No lab notes or experiment materials found for ${selectedSubject}.`
                    : `No ${selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} notes available for ${selectedSubject}.`}
                </p>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="cyber-btn-wire"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    View All {selectedSubject} Notes
                  </button>
                )}
              </div>
            ) : (
              <div className="subject-notes-grid">
                {currentSubjectNotes.map(note => {
                  const isImage = getNoteFileType(note) === 'image';
                  const filesCount = note.files?.length || (note.fileUrl ? 1 : 0);
                  const catStyle = getCategoryStyle(note.category);
                  const CatIcon = catStyle.icon;

                  return (
                    <div key={note._id || note.id} className="cyber-panel note-card-modern">
                      <div className="note-card-top-row">
                        {/* Category badge */}
                        <div 
                          className="note-category-badge"
                          style={{
                            background: catStyle.bg,
                            border: `1px solid ${catStyle.border}`,
                            color: catStyle.color
                          }}
                        >
                          <CatIcon size={12} />
                          <span>{note.category || 'Theory'}</span>
                        </div>

                        {/* File type badge */}
                        <div className="note-file-type-badge">
                          {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                          <span>{isImage ? 'Image' : 'Document'} {filesCount > 1 ? `(${filesCount})` : ''}</span>
                        </div>
                      </div>

                      {/* Note Title */}
                      <h4 className="note-card-title">
                        {note.title || note.filename || 'Untitled Note'}
                      </h4>

                      {/* Card Action Buttons */}
                      <div className="note-card-actions">
                        <button
                          onClick={() => setPreviewNote(note)}
                          className="cyber-btn-orange note-btn-preview"
                          title="Preview Note"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleDownload(note)}
                          className="cyber-btn-wire note-btn-download"
                          title="Download Note"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={(e) => handleShare(note, e)}
                          className="cyber-btn-wire note-btn-share"
                          title="Share Link"
                        >
                          {copiedId === (note._id || note.id) ? (
                            <Check size={14} style={{ color: '#10B981' }} />
                          ) : (
                            <Share2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
            PREVIEW MODAL (Single Direct High-Performance Viewer)
            ────────────────────────────────────────────────────────── */}
        {previewNote && (
          <div className={`docviewer-modal-backdrop ${modalFullscreen ? 'fullscreen-backdrop' : ''}`}>
            <div className={`docviewer-modal-dialog ${modalFullscreen ? 'fullscreen-dialog' : ''}`}>
              <DocViewer
                files={
                  previewNote.files && previewNote.files.length > 0
                    ? previewNote.files
                    : [{
                        fileUrl: previewNote.fileUrl,
                        filename: previewNote.filename,
                        originalName: previewNote.filename || previewNote.title,
                        fileType: previewNote.fileType
                      }]
                }
                title={previewNote.title || previewNote.filename || 'Note Preview'}
                onClose={() => setPreviewNote(null)}
                isFullscreenMode={modalFullscreen}
              />
            </div>
          </div>
        )}

      </div>

      <style>{`
        .notes-page-container {
          min-height: 100vh;
          background: #000804;
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(251, 54, 64, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
            linear-gradient(rgba(251, 54, 64, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 54, 64, 0.03) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 35px 35px, 35px 35px;
          padding: 6.5rem 1.5rem 4rem;
          box-sizing: border-box;
          font-family: var(--font-body);
        }

        .notes-header-block {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .notes-main-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          color: #ffffff;
          letter-spacing: 0.04em;
          margin: 0;
          text-transform: uppercase;
        }

        .notes-search-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }

        .notes-search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 15, 8, 0.9);
          border: 1px solid rgba(251, 54, 64, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1.2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: border-color 0.2s ease;
        }

        .notes-search-box:focus-within {
          border-color: var(--accent-orange);
          box-shadow: 0 0 15px rgba(251, 54, 64, 0.25);
        }

        .notes-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: var(--font-tech);
          font-size: 0.95rem;
        }

        .notes-search-input::placeholder {
          color: var(--text-muted);
        }

        .notes-search-clear {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Subjects Grid */
        .subjects-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .subject-card-item {
          padding: 1.6rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 190px;
        }

        .subject-card-item:hover {
          transform: translateY(-4px);
          border-color: var(--accent-orange);
          box-shadow: 0 10px 30px rgba(251, 54, 64, 0.2);
        }

        .subject-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .subject-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(251, 54, 64, 0.1);
          border: 1px solid rgba(251, 54, 64, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
        }

        .subject-total-badge {
          background: rgba(251, 54, 64, 0.12);
          border: 1px solid rgba(251, 54, 64, 0.25);
          color: var(--accent-orange);
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-family: var(--font-tech);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .subject-card-title {
          font-family: var(--font-cyber);
          font-size: 1.25rem;
          color: #ffffff;
          margin: 0 0 1rem;
          word-break: break-word;
          line-height: 1.3;
        }

        .subject-pills-row {
          display: flex;
          gap: 0.45rem;
          flex-wrap: wrap;
          margin-bottom: 1.4rem;
        }

        .category-pill-preview {
          font-size: 0.72rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: var(--font-tech);
        }

        .theory-pill {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10B981;
        }

        .lab-pill {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .suggestions-pill {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #c084fc;
        }

        .subject-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.9rem;
          border-top: 1px solid rgba(251, 54, 64, 0.12);
        }

        .subject-card-cta {
          color: var(--accent-orange);
          font-family: var(--font-tech);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .subject-arrow-icon {
          color: var(--accent-orange);
          transition: transform 0.2s ease;
        }

        .subject-card-item:hover .subject-arrow-icon {
          transform: translateX(4px);
        }

        /* Drilldown View */
        .subject-drilldown-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.8rem;
        }

        .drilldown-back-btn {
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .subject-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-tech);
          font-size: 0.9rem;
        }

        /* Category Tabs Bar */
        .category-tabs-bar {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(251, 54, 64, 0.2);
          padding-bottom: 0.8rem;
        }

        .category-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 15, 8, 0.7);
          border: 1px solid rgba(251, 54, 64, 0.2);
          color: var(--text-secondary);
          padding: 0.55rem 1.1rem;
          border-radius: 6px;
          font-family: var(--font-tech);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-tab-btn:hover {
          border-color: var(--accent-orange);
          color: #ffffff;
        }

        .category-tab-btn.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000000;
          font-weight: 700;
        }

        .category-tab-count {
          background: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
          padding: 0.1rem 0.45rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .category-tab-count.active-count {
          background: #000000;
          color: #ffffff;
        }

        /* Notes Grid */
        .subject-notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.4rem;
        }

        .note-card-modern {
          padding: 1.4rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
        }

        .note-card-modern:hover {
          border-color: rgba(251, 54, 64, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .note-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
        }

        .note-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          font-family: var(--font-tech);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .note-file-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-family: var(--font-tech);
        }

        .note-card-title {
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0 0 1.3rem;
          line-height: 1.4;
          word-break: break-word;
        }

        .note-card-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .note-btn-preview {
          flex: 1;
          padding: 0.5rem 0.8rem;
          font-size: 0.8rem;
          clip-path: none;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .note-btn-download {
          padding: 0.5rem 0.8rem;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .note-btn-share {
          padding: 0.5rem 0.6rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .notes-loading-state,
        .notes-empty-panel {
          text-align: center;
          padding: 4rem 1.5rem;
          color: var(--text-muted);
        }

        /* Modal Dialog */
        .docviewer-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 8, 4, 0.88);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }

        .docviewer-modal-backdrop.fullscreen-backdrop {
          padding: 0;
        }

        .docviewer-modal-dialog {
          width: 100%;
          max-width: 1100px;
          height: 85vh;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
        }

        .docviewer-modal-dialog.fullscreen-dialog {
          max-width: 100%;
          height: 100vh;
          border-radius: 0;
        }

        @media (max-width: 768px) {
          .notes-page-container {
            padding: 5.5rem 1rem 3rem;
          }

          .subjects-cards-grid {
            grid-template-columns: 1fr;
          }

          .subject-notes-grid {
            grid-template-columns: 1fr;
          }

          .category-tabs-bar {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.6rem;
          }

          .category-tab-btn {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
