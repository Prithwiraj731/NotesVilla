import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Layers, HelpCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        background: "rgba(0, 15, 8, 0.98)",
        color: "var(--text-secondary)",
        padding: "2.5rem 1.5rem 1.8rem",
        fontSize: "0.95rem",
        borderTop: "1px solid rgba(251, 54, 64, 0.12)",
        marginTop: "auto",
        fontFamily: "var(--font-tech)",
        zIndex: 99,
        boxSizing: "border-box"
      }}
    >
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        {/* Brand & Tagline */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <img 
              src="/logo.svg" 
              alt="NotesVilla Logo" 
              style={{
                height: '28px',
                width: '28px',
                objectFit: 'contain',
                borderRadius: '5px',
                filter: 'drop-shadow(0 0 5px rgba(251, 54, 64, 0.25))'
              }}
            />
            <div style={{
              fontFamily: 'var(--font-cyber)',
              fontSize: '1.2rem',
              fontWeight: '900',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ffffff'
            }}>
              NOTES<span style={{ color: 'var(--accent-orange)' }}>VILLA</span>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-body)',
                fontWeight: '800',
                color: 'var(--accent-orange)',
                background: 'rgba(251, 54, 64, 0.12)',
                border: '1px solid rgba(251, 54, 64, 0.3)',
                borderRadius: '4px',
                padding: '0.1rem 0.35rem',
                marginLeft: '0.35rem'
              }}>
                STUDY
              </span>
            </div>
          </div>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            margin: 0
          }}>
            Curated Academic Knowledge Repository for Engineering & Science Scholars.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <Link
            to="/notes"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-orange)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Notes Library
          </Link>
          <Link
            to="/routine"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-orange)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Class Routine
          </Link>
          <Link
            to="/syllabus"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-orange)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Course Syllabus
          </Link>
          <Link
            to="/practice"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-orange)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Practice Sets
          </Link>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div style={{
        maxWidth: "1280px",
        margin: "1.8rem auto 0",
        paddingTop: "1.2rem",
        borderTop: "1px solid rgba(251, 54, 64, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.85rem",
        color: "var(--text-muted)",
        flexWrap: "wrap",
        gap: "0.8rem"
      }}>
        <span>© {new Date().getFullYear()} NOTESVILLA. ALL RIGHTS RESERVED.</span>
        <span>ENGINEERED FOR HIGH-FIDELITY LEARNING</span>
      </div>
    </footer>
  );
}
