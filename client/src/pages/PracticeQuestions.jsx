import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { 
  HelpCircle, 
  FileText, 
  Download, 
  Layers, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function PracticeQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(location.search);
    const subjParam = params.get('subject');
    if (subjParam) setSelectedSubject(subjParam);
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjRes, notesRes] = await Promise.all([
        API.get('/notes/subjects'),
        API.get('/notes?limit=100')
      ]);

      if (Array.isArray(subjRes.data)) {
        setSubjects(subjRes.data.map(s => s.name || s));
      }

      const notesData = Array.isArray(notesRes.data) ? notesRes.data : (notesRes.data.notes || []);
      setNotes(notesData);
    } catch (err) {
      console.error('Error loading practice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = notes.filter(item => {
    const matchesSubject = selectedSubject === 'all' || item.subjectName?.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="practice-page-container">
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div className="practice-header">
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
              Exam Readiness & Problem Sets
            </span>
          </div>

          <h1 className="practice-title">
            PRACTICE SETS & PYQS
          </h1>

          <p className="practice-subtitle">
            Subject problem sets, practice sheets, and previous year examination question papers.
          </p>
        </div>

        {/* Filter Toolbar */}
        {subjects.length > 0 && (
          <div className="practice-filter-bar">
            {/* Subject Filter Pills */}
            <div className="practice-filter-pills">
              <button
                onClick={() => setSelectedSubject('all')}
                style={{
                  background: selectedSubject === 'all' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.08)',
                  color: selectedSubject === 'all' ? '#000000' : 'var(--text-secondary)',
                  border: selectedSubject === 'all' ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.2)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.9rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: selectedSubject === 'all' ? '700' : '500',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                All Subjects
              </button>

              {subjects.map((subj, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubject(subj)}
                  style={{
                    background: selectedSubject === subj ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.08)',
                    color: selectedSubject === subj ? '#000000' : 'var(--text-secondary)',
                    border: selectedSubject === subj ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.2)',
                    borderRadius: '6px',
                    padding: '0.4rem 0.9rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: selectedSubject === subj ? '700' : '500',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="practice-search-box">
              <Search size={15} style={{ color: 'var(--text-muted)', marginRight: '0.5rem', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search practice materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  width: '100%',
                  padding: '0.2rem 0'
                }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem' }} />
            <div>Loading practice resources...</div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="practice-grid">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="cyber-panel practice-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(251, 54, 64, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{
                      background: 'rgba(251, 54, 64, 0.12)',
                      border: '1px solid rgba(251, 54, 64, 0.3)',
                      color: 'var(--accent-orange)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      fontFamily: 'var(--font-body)',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.subjectName}
                    </span>

                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-cyber)',
                    fontSize: '1.08rem',
                    color: '#ffffff',
                    marginBottom: '0.5rem',
                    lineHeight: '1.35',
                    wordBreak: 'break-word'
                  }}>
                    {item.title || item.filename}
                  </h3>

                  <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '1.4rem'
                  }}>
                    {item.description || `Practice questions and study materials for ${item.subjectName}.`}
                  </p>
                </div>

                <div className="practice-card-actions">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cyber-btn-orange"
                    style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                    <span>Download Paper</span>
                  </a>

                  <button
                    onClick={() => navigate(`/note/${item._id}`)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', justifyContent: 'center' }}
                  >
                    <FileText size={14} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-panel practice-empty-panel">
            <HelpCircle size={38} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.85rem', opacity: 0.8 }} />
            
            <h3 style={{
              fontFamily: 'var(--font-cyber)',
              fontSize: '1.25rem',
              color: '#ffffff',
              marginBottom: '0.5rem',
              lineHeight: 1.3
            }}>
              4TH YEAR PRACTICE REPOSITORY READY
            </h3>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              maxWidth: '520px',
              margin: '0 auto 1.8rem',
              lineHeight: '1.55'
            }}>
              No practice sets uploaded yet. As soon as you upload your 4th-year subject question sets and model papers from the admin portal, they will automatically appear here.
            </p>

            <button
              onClick={() => navigate('/notes')}
              className="cyber-btn-orange"
              style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem' }}
            >
              <span>Explore Notes Library</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .practice-page-container {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 15%, rgba(251, 54, 64, 0.08) 0%, #000F08 75%);
          padding: 2.2rem 1.5rem;
          padding-top: 6.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .practice-page-container {
            padding: 1.2rem 1.1rem;
            padding-top: 5.2rem;
          }
        }

        .practice-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 768px) {
          .practice-header {
            margin-bottom: 1.8rem;
          }
        }

        .practice-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.45rem, 5vw, 2.6rem);
          color: #ffffff;
          margin-bottom: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        .practice-subtitle {
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: clamp(0.85rem, 2vw, 1rem);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .practice-filter-bar {
          background: rgba(0, 15, 8, 0.9);
          border: 1px solid rgba(251, 54, 64, 0.2);
          border-radius: 10px;
          padding: 1.1rem 1.4rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.9rem;
        }

        @media (max-width: 768px) {
          .practice-filter-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 0.9rem 1rem;
            margin-bottom: 1.5rem;
          }
        }

        .practice-filter-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        @media (max-width: 600px) {
          .practice-filter-pills {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.4rem;
            -webkit-overflow-scrolling: touch;
          }
        }

        .practice-search-box {
          display: flex;
          align-items: center;
          background: rgba(0, 5, 2, 0.8);
          border: 1px solid rgba(251, 54, 64, 0.25);
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          min-width: 240px;
        }

        @media (max-width: 768px) {
          .practice-search-box {
            min-width: 100%;
            width: 100%;
          }
        }

        .practice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.4rem;
        }

        @media (max-width: 640px) {
          .practice-grid {
            gap: 1.1rem;
          }
        }

        .practice-card {
          border-radius: 10px;
          padding: 1.6rem;
          border: 1px solid rgba(251, 54, 64, 0.2);
          background: rgba(0, 15, 8, 0.9);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.25s ease;
        }

        @media (max-width: 640px) {
          .practice-card {
            padding: 1.25rem 1.1rem;
          }
        }

        .practice-card-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 440px) {
          .practice-card-actions {
            flex-direction: column;
          }
          .practice-card-actions button,
          .practice-card-actions a {
            width: 100%;
          }
        }

        .practice-empty-panel {
          max-width: 680px;
          margin: 0 auto;
          border-radius: 10px;
          padding: 3rem 1.5rem;
          textAlign: center;
          border: 1px dashed rgba(251, 54, 64, 0.3);
          background: rgba(0, 15, 8, 0.8);
        }

        @media (max-width: 640px) {
          .practice-empty-panel {
            padding: 2.2rem 1.2rem;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animate {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
