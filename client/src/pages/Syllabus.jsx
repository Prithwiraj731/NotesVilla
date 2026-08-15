import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  BookOpen, 
  FileText, 
  Layers, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function Syllabus() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notes/subjects');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSubjects(res.data.map(s => s.name || s));
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

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
              Academic Curriculum
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-cyber)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#ffffff',
            marginBottom: '0.6rem',
            fontWeight: '900'
          }}>
            COURSE SYLLABUS ARCHIVE
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Modular unit breakdowns, core curriculum standards, and reference guides for your active academic semester.
          </p>
        </div>

        {/* Dynamic Subject Syllabus Grid or Clean Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem' }} />
            <div>Loading active course syllabus...</div>
          </div>
        ) : subjects.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {subjects.map((subj, idx) => (
              <div
                key={idx}
                className="cyber-panel"
                style={{
                  borderRadius: '10px',
                  padding: '2rem',
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
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'rgba(251, 54, 64, 0.1)',
                    border: '1px solid rgba(251, 54, 64, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-orange)',
                    marginBottom: '1.2rem'
                  }}>
                    <Layers size={22} />
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-cyber)',
                    fontSize: '1.25rem',
                    color: '#ffffff',
                    marginBottom: '0.5rem'
                  }}>
                    {subj}
                  </h3>

                  <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    Curriculum outline, date-wise lecture continuity notes, and topic problem sets for {subj}.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/notes?subject=${encodeURIComponent(subj)}`)}
                    className="cyber-btn-orange"
                    style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
                  >
                    <BookOpen size={14} />
                    <span>View Notes</span>
                  </button>

                  <button
                    onClick={() => navigate(`/practice?subject=${encodeURIComponent(subj)}`)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
                  >
                    <FileText size={14} />
                    <span>Practice Questions</span>
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
            <Layers size={42} style={{ color: 'var(--accent-orange)', margin: '0 auto 1rem', opacity: 0.8 }} />
            
            <h3 style={{
              fontFamily: 'var(--font-cyber)',
              fontSize: '1.35rem',
              color: '#ffffff',
              marginBottom: '0.5rem'
            }}>
              4TH YEAR SYLLABUS REPOSITORY ACTIVE
            </h3>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              maxWidth: '520px',
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}>
              No subjects uploaded yet. As soon as you upload your 4th-year subject notes and syllabus documents from the admin portal, they will automatically appear here.
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
