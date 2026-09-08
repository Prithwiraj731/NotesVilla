import React, { useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import DocViewer from '../components/DocViewer';
import { downloadFile } from '../utils/downloadUtils';
import { 
  Layers, 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  BookOpen,
  X
} from 'lucide-react';

export default function Syllabus() {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Preview modal state
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/syllabus');
        const items = res.data?.syllabi || [];
        setSyllabi(items);
        return;
      } catch (err) {
        if (err.response?.status === 404 || err.message?.includes('404')) {
          const notesRes = await API.get('/notes?limit=250');
          const notesList = Array.isArray(notesRes.data) ? notesRes.data : (notesRes.data?.notes || []);
          const syllabusNotes = notesList.filter(n => 
            n.category === 'Syllabus' || 
            /syllabus/i.test(n.title || '') || 
            /syllabus/i.test(n.filename || '')
          ).map(n => ({
            _id: n._id || n.id,
            id: n._id || n.id,
            subjectName: n.subjectName,
            title: n.title,
            description: n.description || '',
            fileUrl: n.fileUrl,
            filename: n.filename,
            fileType: n.fileType,
            uploadedBy: n.uploadedBy || 'admin',
            createdAt: n.createdAt
          }));
          setSyllabi(syllabusNotes);
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error('Error fetching syllabus archive:', err);
      setError('Failed to load syllabus documents.');
    } finally {
      setLoading(false);
    }
  };

  // Distinct subjects with syllabus
  const subjectsList = useMemo(() => {
    const set = new Set();
    syllabi.forEach(s => {
      if (s.subjectName) set.add(s.subjectName.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [syllabi]);

  // Filtered syllabi
  const filteredSyllabi = useMemo(() => {
    let list = syllabi;

    if (selectedSubject && selectedSubject !== 'All') {
      list = list.filter(s => s.subjectName?.toLowerCase() === selectedSubject.toLowerCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.title?.toLowerCase().includes(q) ||
        s.subjectName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [syllabi, selectedSubject, searchTerm]);

  const handleDownload = async (item) => {
    if (!item.fileUrl) return;
    await downloadFile(item.fileUrl, item.filename || `${item.title || 'syllabus'}.pdf`);
  };

  return (
    <div className="syllabus-page-container">
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        
        {/* Header Title */}
        <div className="syllabus-header">
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
              Academic Curriculum
            </span>
          </div>

          <h1 className="syllabus-title">
            COURSE SYLLABUS ARCHIVE
          </h1>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="syllabus-toolbar">
          {/* Search Box */}
          <div className="syllabus-search-box">
            <Search size={18} style={{ color: 'var(--accent-orange)', opacity: 0.8 }} />
            <input
              type="text"
              placeholder="Search syllabus by course or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="syllabus-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="syllabus-search-clear">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Subject Filter Pills */}
          {subjectsList.length > 1 && (
            <div className="syllabus-filter-pills">
              {subjectsList.map((subj, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubject(subj)}
                  className={`syllabus-pill-btn ${selectedSubject === subj ? 'active' : ''}`}
                >
                  {subj}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Syllabus Grid or Clean Empty State */}
        {loading ? (
          <div className="syllabus-loading-state">
            <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem', color: 'var(--accent-orange)' }} />
            <div>Loading verified course syllabus...</div>
          </div>
        ) : filteredSyllabi.length === 0 ? (
          <div className="cyber-panel syllabus-empty-panel">
            <Layers size={48} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-cyber)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {syllabi.length === 0 ? 'NO SYLLABUS UPLOADED YET' : 'NO MATCHING SYLLABUS'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
              {syllabi.length === 0
                ? 'Official syllabus documents will appear here once uploaded from the admin panel.'
                : `No syllabus found matching "${searchTerm || selectedSubject}".`}
            </p>
          </div>
        ) : (
          <div className="syllabus-grid">
            {filteredSyllabi.map((item) => (
              <div
                key={item._id || item.id}
                className="cyber-panel syllabus-card"
              >
                <div className="syllabus-card-top">
                  <div className="syllabus-icon-box">
                    <Layers size={20} />
                  </div>
                  <span className="syllabus-subject-badge">
                    {item.subjectName}
                  </span>
                </div>

                <h3 className="syllabus-card-title">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="syllabus-card-desc">
                    {item.description}
                  </p>
                )}

                <div className="syllabus-card-fileinfo">
                  <FileText size={13} style={{ color: 'var(--accent-orange)' }} />
                  <span>{item.filename}</span>
                </div>

                <div className="syllabus-card-actions">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="cyber-btn-orange"
                    style={{ flex: 1, padding: '0.55rem 0.8rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.55rem 0.8rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    title="Download Syllabus File"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Preview Modal */}
        {previewItem && (
          <div className="syllabus-modal-backdrop">
            <div className="syllabus-modal-dialog">
              <DocViewer
                files={[{
                  fileUrl: previewItem.fileUrl,
                  filename: previewItem.filename,
                  originalName: previewItem.filename || previewItem.title,
                  fileType: previewItem.fileType || 'document'
                }]}
                title={previewItem.title}
                onClose={() => setPreviewItem(null)}
              />
            </div>
          </div>
        )}

      </div>

      <style>{`
        .syllabus-page-container {
          min-height: 100vh;
          background: #000804;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(251, 54, 64, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
            linear-gradient(rgba(251, 54, 64, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 54, 64, 0.03) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 35px 35px, 35px 35px;
          padding: 6.5rem 1.5rem 4rem;
          box-sizing: border-box;
          font-family: var(--font-body);
        }

        .syllabus-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .syllabus-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.04em;
        }

        .syllabus-toolbar {
          max-width: 800px;
          margin: 0 auto 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          align-items: center;
        }

        .syllabus-search-box {
          width: 100%;
          max-width: 550px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 15, 8, 0.9);
          border: 1px solid rgba(251, 54, 64, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1.2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .syllabus-search-box:focus-within {
          border-color: var(--accent-orange);
          box-shadow: 0 0 15px rgba(251, 54, 64, 0.25);
        }

        .syllabus-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: var(--font-tech);
          font-size: 0.95rem;
        }

        .syllabus-search-input::placeholder {
          color: var(--text-muted);
        }

        .syllabus-search-clear {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .syllabus-filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .syllabus-pill-btn {
          background: rgba(0, 15, 8, 0.8);
          border: 1px solid rgba(251, 54, 64, 0.2);
          color: var(--text-secondary);
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-family: var(--font-tech);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .syllabus-pill-btn:hover {
          border-color: var(--accent-orange);
          color: #ffffff;
        }

        .syllabus-pill-btn.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000000;
          font-weight: 700;
        }

        .syllabus-loading-state,
        .syllabus-empty-panel {
          text-align: center;
          padding: 4rem 1.5rem;
          color: var(--text-muted);
        }

        .syllabus-empty-panel {
          border-radius: 8px;
        }

        .syllabus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .syllabus-card {
          padding: 1.6rem;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.25s ease;
        }

        .syllabus-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-orange);
          box-shadow: 0 10px 30px rgba(251, 54, 64, 0.2);
        }

        .syllabus-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .syllabus-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(251, 54, 64, 0.1);
          border: 1px solid rgba(251, 54, 64, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
        }

        .syllabus-subject-badge {
          background: rgba(251, 54, 64, 0.12);
          border: 1px solid rgba(251, 54, 64, 0.25);
          color: var(--accent-orange);
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-family: var(--font-tech);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .syllabus-card-title {
          font-family: var(--font-cyber);
          font-size: 1.25rem;
          color: #ffffff;
          margin: 0 0 0.6rem;
          line-height: 1.35;
          word-break: break-word;
        }

        .syllabus-card-desc {
          color: var(--text-secondary);
          font-size: 0.88rem;
          line-height: 1.55;
          margin: 0 0 1.2rem;
        }

        .syllabus-card-fileinfo {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-family: var(--font-tech);
          margin-bottom: 1.4rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .syllabus-card-actions {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(251, 54, 64, 0.12);
        }

        /* Modal Dialog */
        .syllabus-modal-backdrop {
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

        .syllabus-modal-dialog {
          width: 100%;
          max-width: 1050px;
          height: 85vh;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
        }

        @media (max-width: 768px) {
          .syllabus-page-container {
            padding: 5.5rem 1rem 3rem;
          }
          .syllabus-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
