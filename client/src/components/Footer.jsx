import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Layers, HelpCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-container">
        {/* Brand Logo & Tagline */}
        <div className="footer-brand">
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '0.5rem' }} aria-label="Knowledge Dock Home">
            <img 
              src="/logo.svg" 
              alt="Knowledge Dock Logo" 
              className="footer-logo-img"
            />
          </Link>
          <p className="footer-desc">
            Curated Academic Knowledge Repository for Engineering & Science Scholars.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="footer-nav-links">
          <Link
            to="/notes"
            className="footer-nav-link"
          >
            <BookOpen size={15} />
            <span>Notes</span>
          </Link>

          <Link
            to="/routine"
            className="footer-nav-link"
          >
            <Calendar size={15} />
            <span>Routine</span>
          </Link>

          <Link
            to="/syllabus"
            className="footer-nav-link"
          >
            <Layers size={15} />
            <span>Syllabus</span>
          </Link>
        </div>
      </div>

      {/* Copyright & Credits */}
      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} Knowledge Dock. All rights reserved.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          Crafted with <Heart size={13} style={{ color: "var(--accent-orange)", fill: "var(--accent-orange)" }} /> for Students
        </div>
      </div>

      <style>{`
        .footer-root {
          width: 100%;
          background: rgba(0, 15, 8, 0.98);
          color: var(--text-secondary);
          padding: 2.5rem 1.5rem 1.8rem;
          font-size: 0.95rem;
          border-top: 1px solid rgba(251, 54, 64, 0.12);
          margin-top: auto;
          font-family: var(--font-body);
          z-index: 99;
          box-sizing: border-box;
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .footer-logo-img {
          height: 30px;
          width: auto;
          max-width: 160px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 2px 6px rgba(251, 54, 64, 0.2));
        }

        .footer-desc {
          color: var(--text-muted);
          font-size: 0.85rem;
          font-family: var(--font-body);
          margin: 0;
          max-width: 360px;
          line-height: 1.5;
        }

        .footer-nav-links {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .footer-nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          padding: 0.4rem 0.2rem;
          transition: color 0.2s ease;
        }

        .footer-nav-link:hover {
          color: var(--accent-orange);
        }

        .footer-bottom {
          max-width: 1280px;
          margin: 1.8rem auto 0;
          padding-top: 1.2rem;
          border-top: 1px solid rgba(251, 54, 64, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.8rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .footer-root {
            padding: 2rem 1.1rem 1.5rem;
          }

          .footer-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
          }

          .footer-nav-links {
            gap: 0.85rem 1.2rem;
            width: 100%;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
            margin-top: 1.4rem;
            padding-top: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}
