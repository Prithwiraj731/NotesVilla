import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Calendar, 
  Layers, 
  HelpCircle, 
  Search,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/notes', label: 'Notes Library', icon: BookOpen },
    { path: '/routine', label: 'Class Routine', icon: Calendar },
    { path: '/syllabus', label: 'Syllabus', icon: Layers },
    { path: '/practice', label: 'Practice Sets', icon: HelpCircle },
  ];

  return (
    <header className={`header-root ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        
        {/* =========================================
            BRAND LOGO
            ========================================= */}
        <Link to="/" className="brand-logo">
          <img 
            src="/logo.svg" 
            alt="NotesVilla Logo" 
            className="brand-logo-img"
          />
          <div className="brand-logo-text">
            <span className="logo-white">NOTES</span>
            <span className="logo-red">VILLA</span>
            <span className="logo-badge">STUDY</span>
          </div>
        </Link>

        {/* =========================================
            DESKTOP NAVIGATION
            ========================================= */}
        <nav className="desktop-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} className="nav-icon" />
                <span>{item.label}</span>
                {isActive && <span className="active-glow-dot" />}
              </Link>
            );
          })}
        </nav>

        {/* =========================================
            SEARCH / EXPLORE CTA BUTTON
            ========================================= */}
        <div className="header-actions">
          <Link to="/notes" className="header-search-btn">
            <Search size={14} />
            <span>Search Library</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-toggle-btn"
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* =========================================
          MOBILE DRAWER NAVIGATION
          ========================================= */}
      {isMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} style={{ color: isActive ? 'var(--accent-orange)' : 'var(--text-muted)' }} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="mobile-active-pill">Current</span>}
                </Link>
              );
            })}

            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(251, 54, 64, 0.12)' }}>
              <Link 
                to="/notes" 
                className="cyber-btn-orange" 
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                onClick={() => setIsMenuOpen(false)}
              >
                <Search size={15} />
                <span>Browse All Notes</span>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Scoped CSS styling for bulletproof layout & responsive behavior */}
      <style jsx>{`
        .header-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(0, 15, 8, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(251, 54, 64, 0.08);
          transition: all 0.25s ease-in-out;
        }

        .header-scrolled {
          background: rgba(0, 15, 8, 0.95);
          border-bottom: 1px solid rgba(251, 54, 64, 0.18);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }

        /* Brand Logo */
        .brand-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          white-space: nowrap;
          transition: transform 0.2s ease;
        }

        .brand-logo:hover {
          transform: scale(1.02);
        }

        .brand-logo-img {
          height: 32px;
          width: 32px;
          object-fit: contain;
          border-radius: 6px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 6px rgba(251, 54, 64, 0.3));
        }

        .brand-logo-text {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          font-family: var(--font-cyber);
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .logo-white {
          color: #ffffff;
        }

        .logo-red {
          color: var(--accent-orange);
          text-shadow: 0 0 12px rgba(251, 54, 64, 0.5);
        }

        .logo-badge {
          font-size: 0.65rem;
          font-family: var(--font-body);
          font-weight: 800;
          color: var(--accent-orange);
          background: rgba(251, 54, 64, 0.12);
          border: 1px solid rgba(251, 54, 64, 0.3);
          border-radius: 4px;
          padding: 0.15rem 0.4rem;
          margin-left: 0.35rem;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        /* Desktop Nav */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.4rem;
        }

        @media (min-width: 900px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          position: relative;
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 0.5rem 0.9rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #ffffff;
          background: rgba(251, 54, 64, 0.06);
        }

        .nav-link.active {
          color: #ffffff;
          font-weight: 700;
          background: rgba(251, 54, 64, 0.12);
          border: 1px solid rgba(251, 54, 64, 0.25);
        }

        .nav-icon {
          color: var(--text-muted);
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        .nav-link:hover .nav-icon,
        .nav-link.active .nav-icon {
          color: var(--accent-orange);
        }

        .active-glow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent-orange);
          box-shadow: 0 0 6px var(--accent-orange);
          margin-left: 0.2rem;
        }

        /* Header Right Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .header-search-btn {
          text-decoration: none;
          display: none;
          align-items: center;
          gap: 0.45rem;
          background: var(--accent-orange);
          color: #000000 !important;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0.55rem 1.15rem;
          border-radius: 6px;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 2px 10px rgba(251, 54, 64, 0.3);
        }

        @media (min-width: 520px) {
          .header-search-btn {
            display: inline-flex;
          }
        }

        .header-search-btn:hover {
          background: rgba(251, 54, 64, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(251, 54, 64, 0.45);
        }

        /* Mobile Menu Button */
        .mobile-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 6px;
          border: 1px solid rgba(251, 54, 64, 0.25);
          background: rgba(251, 54, 64, 0.05);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        @media (min-width: 900px) {
          .mobile-toggle-btn {
            display: none;
          }
        }

        .mobile-toggle-btn:hover {
          border-color: var(--accent-orange);
          background: rgba(251, 54, 64, 0.15);
          color: var(--accent-orange);
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: rgba(0, 15, 8, 0.98);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(251, 54, 64, 0.2);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
          animation: slideDown 0.25s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-nav-list {
          padding: 1.25rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .mobile-nav-item:hover {
          background: rgba(251, 54, 64, 0.06);
          color: #ffffff;
        }

        .mobile-nav-item.active {
          background: rgba(251, 54, 64, 0.12);
          border-color: rgba(251, 54, 64, 0.3);
          color: #ffffff;
          font-weight: 700;
        }

        .mobile-active-pill {
          font-size: 0.75rem;
          background: var(--accent-orange);
          color: #000000;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
      `}</style>
    </header>
  );
}