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
    <div className="syllabus-page-container">
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
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

          <p className="syllabus-subtitle">
            Modular unit breakdowns, core curriculum standards, and reference guides for your active academic semester.
          </p>
        </div>

        {/* Dynamic Subject Syllabus Grid or Clean Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem' }} />
            <div>Loading active course syllabus...</div>
          </div>
        ) : subjects.length > 0 ? (
          <div className="syllabus-grid">
            {subjects.map((subj, idx) => (
              <div
                key={idx}
                className="cyber-panel syllabus-card"
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
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(251, 54, 64, 0.1)',
                    border: '1px solid rgba(251, 54, 64, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-orange)',
                    marginBottom: '1rem'
                  }}>
                    <Layers size={20} />
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-cyber)',
                    fontSize: '1.2rem',
                    color: '#ffffff',
                    marginBottom: '0.5rem',
                    wordBreak: 'break-word'
                  }}>
                    {subj}
                  </h3>

                  <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.88rem',
                    lineHeight: '1.55',
                    marginBottom: '1.4rem'
                  }}>
                    Curriculum outline, date-wise lecture continuity notes, and topic problem sets for {subj}.
                  </p>
                </div>

                <div className="syllabus-card-actions">
                  <button
                    onClick={() => navigate(`/notes?subject=${encodeURIComponent(subj)}`)}
                    className="cyber-btn-orange"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    <BookOpen size={14} />
                    <span>View Notes</span>
                  </button>

                  <button
                    onClick={() => navigate(`/practice?subject=${encodeURIComponent(subj)}`)}
                    className="cyber-btn-wire"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    <FileText size={14} />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-panel syllabus-empty-panel">
            <Layers size={38} style={{ color: 'var(--accent-orange)', margin: '0 auto 0.85rem', opacity: 0.8 }} />
            
            <h3 style={{
              fontFamily: 'var(--font-cyber)',
              fontSize: '1.25rem',
              color: '#ffffff',
              marginBottom: '0.5rem',
              lineHeight: 1.3
            }}>
              4TH YEAR SYLLABUS REPOSITORY ACTIVE
            </h3>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              maxWidth: '520px',
              margin: '0 auto 1.8rem',
              lineHeight: '1.55'
            }}>
              No subjects uploaded yet. As soon as you upload your 4th-year subject notes and syllabus documents from the admin portal, they will automatically appear here.
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
        .syllabus-page-container {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 15%, rgba(251, 54, 64, 0.08) 0%, #000F08 75%);
          padding: 2.2rem 1.5rem;
          padding-top: 6.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .syllabus-page-container {
            padding: 1.2rem 1.1rem;
            padding-top: 5.2rem;
          }
        }

        .syllabus-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 768px) {
          .syllabus-header {
            margin-bottom: 1.8rem;
          }
        }

        .syllabus-title {
          font-family: var(--font-cyber);
          font-size: clamp(1.45rem, 5vw, 2.6rem);
          color: #ffffff;
          margin-bottom: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        .syllabus-subtitle {
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: clamp(0.85rem, 2vw, 1rem);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .syllabus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.4rem;
        }

        @media (max-width: 640px) {
          .syllabus-grid {
            gap: 1.1rem;
          }
        }

        .syllabus-card {
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
          .syllabus-card {
            padding: 1.25rem 1.1rem;
          }
        }

        .syllabus-card-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 440px) {
          .syllabus-card-actions {
            flex-direction: column;
          }
          .syllabus-card-actions button {
            width: 100%;
            justify-content: center;
          }
        }

        .syllabus-empty-panel {
          max-width: 680px;
          margin: 0 auto;
          border-radius: 10px;
          padding: 3rem 1.5rem;
          text-align: center;
          border: 1px dashed rgba(251, 54, 64, 0.3);
          background: rgba(0, 15, 8, 0.8);
        }

        @media (max-width: 640px) {
          .syllabus-empty-panel {
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
