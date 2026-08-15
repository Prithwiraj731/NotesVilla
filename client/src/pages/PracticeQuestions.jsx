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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 15%, rgba(251, 54, 64, 0.08) 0%, #000F08 75%)',
      padding: '2rem 1.5rem',
      paddingTop: '6.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(251, 54, 64, 0.08)',
            border: '1px solid rgba(251, 54, 64, 0.3)',
            borderRadius: '30px',
            padding: '0.4rem 1.2rem',
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-orange)' }} />
            <span style={{
              fontFamily: 'var(--font-body)',
              fontWeight: '700',
              color: '#ffffff',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Exam Readiness & Problem Sets
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-cyber)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#ffffff',
            marginBottom: '0.6rem',
            fontWeight: '900'
          }}>
            PRACTICE SETS & PYQS
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Subject problem sets, practice sheets, and previous year examination question papers.
          </p>
        </div>

        {/* Filter Toolbar */}
        {subjects.length > 0 && (
          <div style={{
            background: 'rgba(0, 15, 8, 0.9)',
            border: '1px solid rgba(251, 54, 64, 0.2)',
            borderRadius: '10px',
            padding: '1.2rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Subject Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setSelectedSubject('all')}
                style={{
                  background: selectedSubject === 'all' ? 'var(--accent-orange)' : 'rgba(251, 54, 64, 0.08)',
                  color: selectedSubject === 'all' ? '#000000' : 'var(--text-secondary)',
                  border: selectedSubject === 'all' ? '1px solid var(--accent-orange)' : '1px solid rgba(251, 54, 64, 0.2)',
                  borderRadius: '6px',
                  padding: '0.4rem 1rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: selectedSubject === 'all' ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
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
                    padding: '0.4rem 1rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: selectedSubject === subj ? '700' : '500',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 5, 2, 0.8)',
              border: '1px solid rgba(251, 54, 64, 0.25)',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              minWidth: '240px'
            }}>
              <Search size={15} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
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
                  fontSize: '0.88rem',
                  width: '100%'
                }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem' }} />
            <div>Loading practice resources...</div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="cyber-panel"
                style={{
                  borderRadius: '10px',
                  padding: '1.8rem',
                  border: '1px solid rgba(251, 54, 64, 0.2)',
                  background: 'rgba(0, 15, 8, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{
                      background: 'rgba(251, 54, 64, 0.12)',
                      border: '1px solid rgba(251, 54, 64, 0.3)',
                      color: 'var(--accent-orange)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      fontFamily: 'var(--font-body)'
                    }}>
                      {item.subjectName}
                    </span>

                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-cyber)',
                    fontSize: '1.1rem',
                    color: '#ffffff',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {item.title || item.filename}
                  </h3>

                  <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem'
                  }}>
                    {item.description || `Practice questions and study materials for ${item.subjectName}.`}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cyber-btn-orange"
                    style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Download size={14} />
                    <span>Download Paper</span>
                  </a>

                  <button
                    onClick={() => navigate(`/note/${item._id}`)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    <FileText size={14} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-panel" style={{
            maxWidth: '680px',
            margin: '0 auto',
            borderRadius: '10px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            border: '1px dashed rgba(251, 54, 64, 0.3)',
            background: 'rgba(0, 15, 8, 0.8)'
          }}>
            <HelpCircle size={42} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.8 }} />
            
            <h3 style={{
              fontFamily: 'var(--font-cyber)',
              fontSize: '1.35rem',
              color: '#ffffff',
              marginBottom: '0.5rem'
            }}>
              4TH YEAR PRACTICE REPOSITORY READY
            </h3>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              maxWidth: '520px',
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}>
              No practice sets uploaded yet. As soon as you upload your 4th-year subject question sets and model papers from the admin portal, they will automatically appear here.
            </p>

            <button
              onClick={() => navigate('/notes')}
              className="cyber-btn-orange"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            >
              <span>Explore Notes Library</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
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
