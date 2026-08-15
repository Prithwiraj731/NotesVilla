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
        fontFamily: "var(--font-body)",
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
        {/* Brand Logo & Tagline */}
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '0.6rem' }} aria-label="NotesVilla Home">
            <img 
              src="/logo.svg" 
              alt="NotesVilla Logo" 
              style={{
                height: '32px',
                width: 'auto',
                maxWidth: '170px',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 2px 6px rgba(251, 54, 64, 0.2))'
              }}
            />
          </Link>
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
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <BookOpen size={15} />
            <span>Notes</span>
          </Link>

          <Link
            to="/routine"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Calendar size={15} />
            <span>Routine</span>
          </Link>

          <Link
            to="/syllabus"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Layers size={15} />
            <span>Syllabus</span>
          </Link>

          <Link
            to="/practice"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <HelpCircle size={15} />
            <span>Practice</span>
          </Link>
        </div>
      </div>

      {/* Copyright & Credits */}
      <div style={{
        maxWidth: "1280px",
        margin: "1.8rem auto 0",
        paddingTop: "1.2rem",
        borderTop: "1px solid rgba(251, 54, 64, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.8rem",
        fontSize: "0.82rem",
        color: "var(--text-muted)"
      }}>
        <div>
          © {new Date().getFullYear()} NotesVilla. All rights reserved. Built for Academic Excellence.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          Crafted with <Heart size={13} style={{ color: "var(--accent-orange)", fill: "var(--accent-orange)" }} /> for Students
        </div>
      </div>
    </footer>
  );
}
