import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Layers,
  Terminal,
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-container">

        {/* Brand Logo & Tagline */}
        <div className="footer-brand">
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '0.5rem'
            }}
            aria-label="Knowledge Dock Home"
          >
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

          <Link
            to="/lab-setup"
            className="footer-nav-link"
          >
            <Terminal size={15} />
            <span>Lab Setup</span>
          </Link>

        </div>
      </div>

      {/* Copyright & Credits */}
      <div className="footer-bottom">

        <div>
          © {new Date().getFullYear()} Knowledge Dock. All rights reserved.
        </div>

        <div className="footer-credit">
          <span>Crafted with</span>

          <Heart
            size={13}
            className="footer-heart"
          />

          <span>for Students by</span>

          <a
            href="https://www.linkedin.com/in/prithwiraj-mazumdar-963086291/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-credit-link"
          >
            Prithwiraj Mazumdar
          </a>
        </div>

      </div>

      <style>{`

        /* ================================
           FOOTER ROOT
        ================================= */

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


        /* ================================
           MAIN FOOTER CONTAINER
        ================================= */

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;

          display: flex;
          justify-content: space-between;
          align-items: center;

          flex-wrap: wrap;
          gap: 1.5rem;
        }


        /* ================================
           LOGO
        ================================= */

        .footer-logo-img {
          height: 30px;
          width: auto;
          max-width: 160px;

          object-fit: contain;
          display: block;

          filter:
            drop-shadow(
              0 2px 6px rgba(251, 54, 64, 0.2)
            );
        }


        /* ================================
           DESCRIPTION
        ================================= */

        .footer-desc {
          color: var(--text-muted);

          font-size: 0.85rem;
          font-family: var(--font-body);

          margin: 0;
          max-width: 360px;

          line-height: 1.5;
        }


        /* ================================
           NAVIGATION
        ================================= */

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

          transition:
            color 0.2s ease;
        }


        .footer-nav-link:hover {
          color: var(--accent-orange);

          text-decoration: none;
        }


        /* ================================
           FOOTER BOTTOM
        ================================= */

        .footer-bottom {
          max-width: 1280px;

          margin: 1.8rem auto 0;

          padding-top: 1.2rem;

          border-top:
            1px solid rgba(251, 54, 64, 0.08);

          display: flex;

          justify-content: space-between;
          align-items: center;

          flex-wrap: wrap;

          gap: 0.8rem;

          font-size: 0.82rem;

          color: var(--text-muted);
        }


        /* ================================
           CREDIT SECTION
        ================================= */

        .footer-credit {
          display: flex;

          align-items: center;

          gap: 0.35rem;
        }


        /* ================================
           HEART ICON
        ================================= */

        .footer-heart {
          color: var(--accent-orange);

          fill: var(--accent-orange);

          flex-shrink: 0;
        }


        /* ================================
           LINKEDIN CREDIT LINK
        ================================= */

        .footer-credit-link,
        .footer-credit-link:visited,
        .footer-credit-link:hover,
        .footer-credit-link:active,
        .footer-credit-link:focus {
          color: inherit;

          text-decoration: none;
        }


        /* Keep it visually identical to
           surrounding footer text */

        .footer-credit-link {
          transition:
            color 0.2s ease;
        }


        /* Optional subtle hover effect */

        .footer-credit-link:hover {
          color: var(--text-secondary);

          text-decoration: none;
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 640px) {

          .footer-root {
            padding:
              2rem
              1.1rem
              1.5rem;
          }


          .footer-container {
            flex-direction: column;

            align-items: flex-start;

            gap: 1.25rem;
          }


          .footer-nav-links {
            gap:
              0.85rem
              1.2rem;

            width: 100%;
          }


          .footer-bottom {
            flex-direction: column;

            align-items: flex-start;

            gap: 0.5rem;

            margin-top: 1.4rem;

            padding-top: 1rem;
          }


          .footer-credit {
            flex-wrap: wrap;
          }

        }

      `}</style>
    </footer>
  );
}