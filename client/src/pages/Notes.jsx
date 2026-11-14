import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { downloadFile, downloadMultipleFiles } from '../utils/downloadUtils';
import DocViewer, { getFileCategory } from '../components/DocViewer';
import { resolveNoteCategory } from '../utils/categoryUtils';
import { getCachedData, setCachedData } from '../utils/cacheUtils';
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
  Folder,
  FolderOpen,
  RefreshCw,
  FolderCheck,
  Sparkles
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

export function getNoteFolder(note, knownFolders = []) {
  if (!note) return null;

  // 1. Explicit folderName from DB
  if (note.folderName && typeof note.folderName === 'string' && note.folderName.trim() && note.folderName.toLowerCase() !== 'none' && note.folderName.toLowerCase() !== 'root') {
    return note.folderName.trim();
  }

  // 2. topicName fallback
  if (note.topicName && typeof note.topicName === 'string' && note.topicName.trim()) {
    const t = note.topicName.trim();
    if (!['theory', 'lab', 'suggestions', 'syllabus'].includes(t.toLowerCase())) {
      return t;
    }
  }

  // 3. description fallback: [Folder: ...]
  if (note.description && typeof note.description === 'string' && note.description.includes('[Folder:')) {
    const m = note.description.match(/\[Folder:\s*([^\]]+)\]/);
    if (m && m[1] && m[1].trim()) return m[1].trim();
  }

  // 4. Client-side local registry mapping
  try {
    const noteId = note.id || note._id;
    if (noteId) {
      const idMap = JSON.parse(localStorage.getItem('notesvilla_note_folders') || '{}');
      if (idMap[noteId]) return idMap[noteId];
    }
  } catch (e) {}

  // 5. Title bracket prefix fallback: [Lab 5] or [Folder: Lab 5]
  if (note.title && typeof note.title === 'string') {
    const bracketMatch = note.title.match(/^\[(?:Folder:\s*)?([^\]]+)\]/i);
    if (bracketMatch && bracketMatch[1] && bracketMatch[1].trim()) {
      return bracketMatch[1].trim();
    }

    // 6. Match against known folders
    const titleLower = note.title.trim().toLowerCase();
    if (Array.isArray(knownFolders) && knownFolders.length > 0) {
      for (const f of knownFolders) {
        const fName = typeof f === 'string' ? f.trim() : (f?.name || '').trim();
        if (!fName) continue;
        const fLower = fName.toLowerCase();
        if (titleLower === fLower) return fName;
        if (titleLower.startsWith(fLower + ' ') || titleLower.startsWith(fLower + '-') || titleLower.startsWith(fLower + ':')) {
          return fName;
        }
      }
    }
  }

  return null;
}

export function getDisplayNoteTitle(note) {
  if (!note || !note.title) return note?.filename || 'Untitled Note';
  return note.title.replace(/^\[(?:Folder:\s*)?[^\]]+\]\s*/i, '').trim() || note.title;
}

export default function Notes() {
  const navigate = useNavigate();
  const location = useLocation();

  const cachedNotes = getCachedData('notes_all') || [];
  const cachedSubjs = getCachedData('subjects_list') || [];

  const [rawSubjects, setRawSubjects] = useState(() => (Array.isArray(cachedSubjs) ? cachedSubjs.map(s => (typeof s === 'string' ? s : (s.name || s.subjectName || ''))).filter(Boolean) : []));
  const [notes, setNotes] = useState(() => (Array.isArray(cachedNotes) ? cachedNotes : []));
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(() => (!cachedNotes || cachedNotes.length === 0));
  const [error, setError] = useState('');

  // Selected subject & folder: initialized directly from URL query param
  const [selectedSubject, setSelectedSubject] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const subj = params.get('subject');
      return subj && subj.trim() ? subj.trim() : null;
    }
    return null;
  });

  const [selectedFolder, setSelectedFolder] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fld = params.get('folder');
      return fld && fld.trim() ? fld.trim() : null;
    }
    return null;
  });

  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All' | 'Theory' | 'Lab' | 'Suggestions'
  const [searchTerm, setSearchTerm] = useState('');

  // Preview modal state
  const [previewNote, setPreviewNote] = useState(null);
  const [modalFullscreen, setModalFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Initial load
  const hasFetchedRef = React.useRef(false);
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadSubjects();
      loadAllNotes();
      loadAllFolders();
    }
  }, []);

  // Sync selectedSubject and selectedFolder with URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    const folderParam = params.get('folder');

    const cleanSubj = subjectParam && subjectParam.trim() ? subjectParam.trim() : null;
    const cleanFld = folderParam && folderParam.trim() ? folderParam.trim() : null;

    setSelectedSubject(cleanSubj);
    setSelectedFolder(cleanFld);

    if (cleanSubj) {
      loadFoldersForSubject(cleanSubj);
    }
  }, [location.search]);

  const loadSubjects = async () => {
    try {
      const r = await API.get('/notes/subjects');
      if (Array.isArray(r.data) && r.data.length > 0) {
        const subjs = r.data.map(s => (typeof s === 'string' ? s : (s.name || s.subjectName || ''))).filter(Boolean);
        setRawSubjects(subjs);
        setCachedData('subjects_list', r.data);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const loadAllFolders = async () => {
    try {
      let list = [];
      try {
        const r = await API.get('/notes/folders');
        list = r.data?.folders || (Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        // Silently handle 404 when server route is deploying
      }

      let localFolders = [];
      try {
        localFolders = JSON.parse(localStorage.getItem('custom_folders') || '[]');
      } catch (e) {}

      const map = new Map();
      [...list, ...localFolders].forEach(f => {
        if (f && f.name && f.subjectName) {
          map.set(`${f.subjectName.toLowerCase()}:::${f.name.toLowerCase()}`, f);
        }
      });
      setFolders(Array.from(map.values()));
    } catch (err) {
      console.warn('Error loading all folders:', err);
    }
  };

  const loadFoldersForSubject = async (subj) => {
    if (!subj) return;
    try {
      let list = [];
      try {
        const r = await API.get(`/notes/folders?subjectName=${encodeURIComponent(subj)}`);
        list = r.data?.folders || (Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        // Silently handle 404
      }

      let localFolders = [];
      try {
        localFolders = JSON.parse(localStorage.getItem('custom_folders') || '[]');
      } catch (e) {}

      setFolders(prev => {
        const map = new Map();
        prev.forEach(f => map.set(`${f.subjectName?.toLowerCase()}:::${f.name?.toLowerCase()}`, f));
        localFolders.forEach(f => {
          if (f && f.name && f.subjectName) {
            map.set(`${f.subjectName.toLowerCase()}:::${f.name.toLowerCase()}`, f);
          }
        });
        list.forEach(f => {
          if (f && f.name && f.subjectName) {
            map.set(`${f.subjectName.toLowerCase()}:::${f.name.toLowerCase()}`, f);
          }
        });
        return Array.from(map.values());
      });
    } catch (err) {
      console.warn('Error loading folders for subject:', err);
    }
  };

  const loadAllNotes = async (retryCount = 0) => {
    const hasCachedNotes = notes && notes.length > 0;
    let shouldRetry = false;
    try {
      if (!hasCachedNotes) {
        setLoading(true);
      }
      setError('');
      const r = await API.get('/notes?limit=300');
      const dataNotes = Array.isArray(r.data) ? r.data : (r.data?.notes || []);
      if (Array.isArray(dataNotes) && dataNotes.length > 0) {
        setNotes(dataNotes);
        setCachedData('notes_all', dataNotes);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      if (!hasCachedNotes) {
        if (retryCount < 2) {
          shouldRetry = true;
          const delay = (retryCount + 1) * 1500;
          setTimeout(() => loadAllNotes(retryCount + 1), delay);
        } else {
          setError('Could not load notes. Please check connection.');
        }
      }
    } finally {
      if (!shouldRetry) {
        setLoading(false);
      }
    }
  };

  // Unique list of subjects
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

  // Aggregate stats per subject (total notes, theory, lab, suggestions, folders count)
  const subjectStats = useMemo(() => {
    const map = {};
    allSubjects.forEach(s => {
      map[s] = { total: 0, theory: 0, lab: 0, suggestions: 0, foldersCount: 0 };
    });

    // Count folders
    folders.forEach(f => {
      const sName = f.subjectName?.trim();
      if (sName && map[sName]) {
        map[sName].foldersCount += 1;
      }
    });

    // Count notes
    notes.forEach(note => {
      if (note.category === 'Syllabus') return;
      const sName = note.subjectName?.trim();
      if (sName) {
        if (!map[sName]) {
          map[sName] = { total: 0, theory: 0, lab: 0, suggestions: 0, foldersCount: 0 };
        }
        map[sName].total += 1;
        const cat = resolveNoteCategory(note);
        if (cat === 'Lab') map[sName].lab += 1;
        else if (cat === 'Suggestions') map[sName].suggestions += 1;
        else map[sName].theory += 1;
      }
    });
    return map;
  }, [allSubjects, notes, folders]);

  // Folders belonging to the currently selected subject
  const currentSubjectFolders = useMemo(() => {
    if (!selectedSubject) return [];
    const sLower = selectedSubject.toLowerCase();

    const folderMap = new Map();

    // 1. Folders from DB API
    folders
      .filter(f => f.subjectName?.toLowerCase() === sLower)
      .forEach(f => {
        folderMap.set(f.name.toLowerCase(), {
          id: f.id || f._id,
          name: f.name,
          subjectName: f.subjectName,
          description: f.description || '',
          notesCount: f.notesCount || 0,
          theoryCount: 0,
          labCount: 0,
          suggestionsCount: 0
        });
      });

    const knownFoldersList = Array.from(folderMap.values());

    // 2. Discover from notes in memory & aggregate category counts
    notes.forEach(n => {
      if (n.subjectName?.toLowerCase() !== sLower) return;
      if (n.category === 'Syllabus') return;
      const fName = getNoteFolder(n, knownFoldersList);
      if (fName) {
        const key = fName.toLowerCase();
        if (!folderMap.has(key)) {
          folderMap.set(key, {
            id: n.folderId || key,
            name: fName,
            subjectName: selectedSubject,
            description: '',
            notesCount: 0,
            theoryCount: 0,
            labCount: 0,
            suggestionsCount: 0
          });
        }
        const item = folderMap.get(key);
        const cat = resolveNoteCategory(n);
        if (cat === 'Lab') item.labCount += 1;
        else if (cat === 'Suggestions') item.suggestionsCount += 1;
        else item.theoryCount += 1;
      }
    });

    // Ensure notesCount reflects computed note count
    folderMap.forEach(item => {
      const computedTotal = item.theoryCount + item.labCount + item.suggestionsCount;
      if (computedTotal > item.notesCount) {
        item.notesCount = computedTotal;
      }
    });

    const list = Array.from(folderMap.values());
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }, [folders, notes, selectedSubject]);

  // All notes for the current subject (non-syllabus)
  const currentSubjectAllNotes = useMemo(() => {
    if (!selectedSubject) return [];
    return notes
      .filter(n => n.subjectName?.toLowerCase() === selectedSubject.toLowerCase())
      .filter(n => n.category !== 'Syllabus')
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [notes, selectedSubject]);

  // Folder stats when inside a specific folder
  const currentFolderStats = useMemo(() => {
    if (!selectedFolder) return null;
    const fLower = selectedFolder.toLowerCase();
    const inFolder = currentSubjectAllNotes.filter(n => {
      const fName = getNoteFolder(n, currentSubjectFolders);
      return fName && fName.toLowerCase() === fLower;
    });
    
    let theory = 0;
    let lab = 0;
    let suggestions = 0;

    inFolder.forEach(n => {
      const cat = resolveNoteCategory(n);
      if (cat === 'Lab') lab += 1;
      else if (cat === 'Suggestions') suggestions += 1;
      else theory += 1;
    });

    return {
      total: inFolder.length,
      theory,
      lab,
      suggestions
    };
  }, [selectedFolder, currentSubjectAllNotes, currentSubjectFolders]);

  // Notes filtered according to view: Folder drilldown vs Subject overview
  const displayedNotes = useMemo(() => {
    if (!selectedSubject) return [];

    let list = currentSubjectAllNotes;

    if (selectedFolder) {
      // Inside specific folder
      list = list.filter(n => {
        const fName = getNoteFolder(n, currentSubjectFolders);
        return fName && fName.toLowerCase() === selectedFolder.toLowerCase();
      });
    } else {
      // At subject level: if folders exist and not searching, show root/direct notes
      if (currentSubjectFolders.length > 0 && !searchTerm.trim()) {
        list = list.filter(n => !getNoteFolder(n, currentSubjectFolders));
      }
    }

    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(n => resolveNoteCategory(n).toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(n => {
        const fName = getNoteFolder(n, currentSubjectFolders);
        const dispTitle = getDisplayNoteTitle(n);
        return (
          (dispTitle && dispTitle.toLowerCase().includes(q)) ||
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.filename && n.filename.toLowerCase().includes(q)) ||
          (fName && fName.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [currentSubjectAllNotes, selectedFolder, currentSubjectFolders, selectedCategory, searchTerm, selectedSubject]);

  // Filtered folders by search query (for folder cards grid)
  const filteredFolders = useMemo(() => {
    if (!searchTerm.trim()) return currentSubjectFolders;
    const q = searchTerm.toLowerCase();
    return currentSubjectFolders.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.description?.toLowerCase().includes(q)
    );
  }, [currentSubjectFolders, searchTerm]);

  // Filtered subjects for Subject Directory view
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return allSubjects;
    const q = searchTerm.toLowerCase();
    return allSubjects.filter(s => s.toLowerCase().includes(q));
  }, [allSubjects, searchTerm]);

  // Navigation handlers
  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    setSelectedFolder(null);
    setSelectedCategory('All');
    setSearchTerm('');
    navigate(`/notes?subject=${encodeURIComponent(subj)}`);
    loadFoldersForSubject(subj);
  };

  const handleSelectFolder = (folderName) => {
    setSelectedFolder(folderName);
    setSelectedCategory('All');
    setSearchTerm('');
    navigate(`/notes?subject=${encodeURIComponent(selectedSubject)}&folder=${encodeURIComponent(folderName)}`);
  };

  const handleBackToSubjectRoot = () => {
    setSelectedFolder(null);
    setSelectedCategory('All');
    setSearchTerm('');
    navigate(`/notes?subject=${encodeURIComponent(selectedSubject)}`);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedFolder(null);
    setSelectedCategory('All');
    setSearchTerm('');
    navigate('/notes');
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

  // Active counts for Category Tab Bar
  const activeTabCounts = useMemo(() => {
    if (selectedFolder && currentFolderStats) {
      return {
        all: currentFolderStats.total,
        theory: currentFolderStats.theory,
        lab: currentFolderStats.lab,
        suggestions: currentFolderStats.suggestions
      };
    }
    const stats = selectedSubject ? subjectStats[selectedSubject] : null;
    return {
      all: stats?.total || 0,
      theory: stats?.theory || 0,
      lab: stats?.lab || 0,
      suggestions: stats?.suggestions || 0
    };
  }, [selectedFolder, currentFolderStats, selectedSubject, subjectStats]);

  return (
    <div className="notes-page-container">
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* Header Block */}
        <div className="notes-header-block">
          <h1 className="notes-main-title">
            {selectedFolder
              ? selectedFolder.toUpperCase()
              : selectedSubject
              ? selectedSubject.toUpperCase()
              : 'COURSE NOTES ARCHIVE'}
          </h1>
          {selectedFolder && (
            <p className="notes-header-subtag">
              <FolderOpen size={14} style={{ color: 'var(--accent-orange)' }} />
              <span>Folder under <strong>{selectedSubject}</strong></span>
            </p>
          )}
        </div>

        {/* 1. ALL SUBJECTS DIRECTORY VIEW */}
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
                  const stats = subjectStats[subj] || { total: 0, theory: 0, lab: 0, suggestions: 0, foldersCount: 0 };
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
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {stats.foldersCount > 0 && (
                            <span className="subject-folder-count-badge">
                              <Folder size={12} />
                              {stats.foldersCount} {stats.foldersCount === 1 ? 'Folder' : 'Folders'}
                            </span>
                          )}
                          <span className="subject-total-badge">
                            {stats.total} {stats.total === 1 ? 'Resource' : 'Resources'}
                          </span>
                        </div>
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
          /* 2. SUBJECT DRILLDOWN VIEW (Root or Inside Folder) */
          <div className="subject-drilldown-view">
            
            {/* Navigation / Breadcrumb Bar */}
            <div className="subject-drilldown-nav">
              {selectedFolder ? (
                <button
                  onClick={handleBackToSubjectRoot}
                  className="cyber-btn-wire drilldown-back-btn"
                >
                  <ArrowLeft size={16} />
                  <span>Back to {selectedSubject}</span>
                </button>
              ) : (
                <button
                  onClick={handleBackToSubjects}
                  className="cyber-btn-wire drilldown-back-btn"
                >
                  <ArrowLeft size={16} />
                  <span>All Subjects</span>
                </button>
              )}

              <div className="subject-breadcrumb">
                <span 
                  onClick={handleBackToSubjects}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  Library
                </span>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                
                {selectedFolder ? (
                  <>
                    <span 
                      onClick={handleBackToSubjectRoot}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--accent-orange)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      {selectedSubject}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>/</span>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FolderOpen size={13} />
                      {selectedFolder}
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>
                    {selectedSubject}
                  </span>
                )}
              </div>
            </div>

            {/* Category Bifurcation Tabs */}
            <div className="category-tabs-bar">
              {[
                { key: 'All', label: 'All Materials', icon: Layers, count: activeTabCounts.all },
                { key: 'Theory', label: 'Theory Notes', icon: BookOpen, count: activeTabCounts.theory },
                { key: 'Lab', label: 'Lab Notes', icon: FlaskConical, count: activeTabCounts.lab },
                { key: 'Suggestions', label: 'Suggestions / PYQ', icon: HelpCircle, count: activeTabCounts.suggestions }
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

            {/* In-Subject / In-Folder Search Bar */}
            <div className="notes-search-wrapper" style={{ marginBottom: '2rem' }}>
              <div className="notes-search-box">
                <Search size={18} style={{ color: 'var(--accent-orange)', opacity: 0.8 }} />
                <input
                  type="text"
                  placeholder={
                    selectedFolder 
                      ? `Search in ${selectedFolder} folder...` 
                      : `Search ${selectedSubject} folders & notes...`
                  }
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

            {/* A. FOLDERS SECTION (Shown on Subject Root view when folders exist) */}
            {!selectedFolder && filteredFolders.length > 0 && selectedCategory === 'All' && (
              <div className="folders-section-block">
                <div className="section-divider-header">
                  <div className="section-title-wrap">
                    <FolderOpen size={18} style={{ color: 'var(--accent-orange)' }} />
                    <h3 className="section-title-text">
                      SUBJECT FOLDERS ({filteredFolders.length})
                    </h3>
                  </div>
                  <span className="section-hint-text">
                    Specific lab modules, assignments & organized study folders
                  </span>
                </div>

                <div className="subject-folders-grid">
                  {filteredFolders.map((f) => (
                    <div
                      key={f.id || f._id || f.name}
                      className="cyber-panel folder-card-item"
                      onClick={() => handleSelectFolder(f.name)}
                    >
                      <div className="folder-card-top">
                        <div className="folder-icon-glow-box">
                          <Folder size={22} />
                        </div>
                        <span className="folder-notes-badge">
                          {f.notesCount} {f.notesCount === 1 ? 'Resource' : 'Resources'}
                        </span>
                      </div>

                      <div className="folder-card-body">
                        <h4 className="folder-card-name">{f.name}</h4>
                        {f.description && (
                          <p className="folder-card-desc">{f.description}</p>
                        )}

                        <div className="folder-breakdown-row">
                          {f.labCount > 0 && (
                            <span className="folder-micro-pill lab">
                              Lab: {f.labCount}
                            </span>
                          )}
                          {f.theoryCount > 0 && (
                            <span className="folder-micro-pill theory">
                              Theory: {f.theoryCount}
                            </span>
                          )}
                          {f.suggestionsCount > 0 && (
                            <span className="folder-micro-pill suggestions">
                              Suggestions: {f.suggestionsCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="folder-card-footer">
                        <span className="folder-card-cta">Browse Folder</span>
                        <ArrowRight size={14} className="folder-arrow-icon" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B. NOTES LIST SECTION */}
            {loading ? (
              <div className="notes-loading-state">
                <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem', color: 'var(--accent-orange)' }} />
                <div>Loading notes...</div>
              </div>
            ) : displayedNotes.length === 0 ? (
              <div className="cyber-panel notes-empty-panel">
                <FileText size={46} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.6 }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {selectedFolder
                    ? `NO NOTES IN FOLDER "${selectedFolder.toUpperCase()}"`
                    : currentSubjectFolders.length > 0
                    ? 'ALL NOTES ARE ORGANIZED IN FOLDERS'
                    : 'NO NOTES IN THIS CATEGORY'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  {selectedFolder
                    ? `No notes match your filter inside ${selectedFolder}. Upload notes to this folder via admin panel.`
                    : currentSubjectFolders.length > 0 && selectedCategory === 'All'
                    ? 'The notes for this subject are filed under the folders above. Click any folder to inspect its contents.'
                    : `No ${selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} materials available for ${selectedSubject}.`}
                </p>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="cyber-btn-wire"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    View All {selectedFolder ? `in ${selectedFolder}` : selectedSubject} Notes
                  </button>
                )}
              </div>
            ) : (
              <div>
                {!selectedFolder && currentSubjectFolders.length > 0 && selectedCategory === 'All' && !searchTerm.trim() && (
                  <div className="section-divider-header" style={{ marginTop: '2.5rem' }}>
                    <div className="section-title-wrap">
                      <FileText size={18} style={{ color: 'var(--accent-orange)' }} />
                      <h3 className="section-title-text">
                        GENERAL & DIRECT NOTES ({displayedNotes.length})
                      </h3>
                    </div>
                    <span className="section-hint-text">
                      Notes stored directly under {selectedSubject}
                    </span>
                  </div>
                )}

                <div className="subject-notes-grid">
                  {displayedNotes.map(note => {
                    const isImage = getNoteFileType(note) === 'image';
                    const filesCount = note.files?.length || (note.fileUrl ? 1 : 0);
                    const resolvedCategory = resolveNoteCategory(note);
                    const catStyle = getCategoryStyle(resolvedCategory);
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
                            <span>{resolvedCategory}</span>
                          </div>

                          {/* Folder badge if note belongs to a folder and viewing all notes */}
                          {getNoteFolder(note, currentSubjectFolders) && !selectedFolder && (
                            <div 
                              className="note-folder-tag"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectFolder(getNoteFolder(note, currentSubjectFolders));
                              }}
                              title={`Filed in folder: ${getNoteFolder(note, currentSubjectFolders)}. Click to open folder.`}
                            >
                              <Folder size={11} />
                              <span>{getNoteFolder(note, currentSubjectFolders)}</span>
                            </div>
                          )}

                          {/* File type badge */}
                          <div className="note-file-type-badge">
                            {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                            <span>{isImage ? 'Image' : 'Document'} {filesCount > 1 ? `(${filesCount})` : ''}</span>
                          </div>
                        </div>

                        {/* Note Title */}
                        <h4 className="note-card-title">
                          {getDisplayNoteTitle(note)}
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
              </div>
            )}
          </div>
        )}

        {/* Preview Modal */}
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
                title={getDisplayNoteTitle(previewNote)}
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
          background-color: #090d12;
          background-image: 
            radial-gradient(circle at 15% 15%, rgba(251, 54, 64, 0.04) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.03) 0%, transparent 45%),
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px;
          padding: 6.5rem 1.5rem 4rem;
          box-sizing: border-box;
          font-family: var(--font-body);
        }

        .notes-header-block {
          text-align: center;
          margin-bottom: 2.2rem;
        }

        .notes-main-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          color: #ffffff;
          letter-spacing: 0.04em;
          margin: 0;
          text-transform: uppercase;
        }

        .notes-header-subtag {
          margin: 0.6rem 0 0;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-tech);
          font-size: 0.88rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.25rem 0.8rem;
          border-radius: 20px;
        }

        .notes-search-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }

        .notes-search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(18, 24, 32, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem 1.2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(10px);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .notes-search-box:focus-within {
          border-color: rgba(251, 54, 64, 0.6);
          box-shadow: 0 0 16px rgba(251, 54, 64, 0.15);
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
          background: rgba(18, 24, 32, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .subject-card-item:hover {
          transform: translateY(-4px);
          border-color: rgba(251, 54, 64, 0.45);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          background: rgba(24, 32, 44, 0.75);
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
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
        }

        .subject-folder-count-badge {
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.3);
          color: #facc15;
          padding: 0.2rem 0.55rem;
          border-radius: 20px;
          font-family: var(--font-tech);
          font-size: 0.72rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .subject-total-badge {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--text-secondary);
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-family: var(--font-tech);
          font-size: 0.75rem;
          font-weight: 600;
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
          border-top: 1px solid rgba(255, 255, 255, 0.08);
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.8rem;
        }

        .category-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(18, 24, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .category-tab-btn.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #ffffff;
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
          background: rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }

        /* Section Dividers */
        .section-divider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title-text {
          font-family: var(--font-cyber);
          font-size: 1.05rem;
          color: #ffffff;
          letter-spacing: 0.05em;
          margin: 0;
          text-transform: uppercase;
        }

        .section-hint-text {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-family: var(--font-tech);
        }

        /* Folders Grid */
        .folders-section-block {
          margin-bottom: 2.5rem;
        }

        .subject-folders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.2rem;
        }

        .folder-card-item {
          padding: 1.3rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.22s ease;
          background: rgba(18, 24, 32, 0.75);
          border: 1px solid rgba(234, 179, 8, 0.25);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
        }

        .folder-card-item:hover {
          transform: translateY(-3px);
          border-color: rgba(234, 179, 8, 0.65);
          box-shadow: 0 10px 28px rgba(234, 179, 8, 0.12);
          background: rgba(26, 34, 46, 0.85);
        }

        .folder-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .folder-icon-glow-box {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(234, 179, 8, 0.1);
          border: 1px solid rgba(234, 179, 8, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #facc15;
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.15);
        }

        .folder-notes-badge {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #facc15;
          padding: 0.2rem 0.6rem;
          border-radius: 14px;
          font-family: var(--font-tech);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .folder-card-name {
          font-family: var(--font-cyber);
          font-size: 1.15rem;
          color: #ffffff;
          margin: 0 0 0.4rem;
          line-height: 1.3;
          word-break: break-word;
        }

        .folder-card-desc {
          color: var(--text-muted);
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0 0 0.8rem;
        }

        .folder-breakdown-row {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.6rem;
        }

        .folder-micro-pill {
          font-size: 0.7rem;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-family: var(--font-tech);
        }

        .folder-micro-pill.lab {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .folder-micro-pill.theory {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10B981;
        }

        .folder-micro-pill.suggestions {
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #c084fc;
        }

        .folder-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin-top: 0.8rem;
        }

        .folder-card-cta {
          color: #facc15;
          font-family: var(--font-tech);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .folder-arrow-icon {
          color: #facc15;
          transition: transform 0.2s ease;
        }

        .folder-card-item:hover .folder-arrow-icon {
          transform: translateX(4px);
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
          background: rgba(18, 24, 32, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .note-card-modern:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          background: rgba(24, 32, 44, 0.75);
        }

        .note-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.9rem;
          flex-wrap: wrap;
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

        .note-folder-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.18rem 0.5rem;
          border-radius: 4px;
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.3);
          color: #facc15;
          font-family: var(--font-tech);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .note-folder-tag:hover {
          background: rgba(234, 179, 8, 0.22);
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

          .subject-folders-grid {
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
