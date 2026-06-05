import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../services/api';
import { Menu, X, Home, BookOpen, Shield, LogOut } from 'lucide-react';

export default function Header() {
  const nav = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    nav('/');
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/notes', label: 'Notes', icon: BookOpen },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        background: scrolled ? "rgba(0, 15, 8, 0.95)" : "rgba(0, 15, 8, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 8px 32px 0 rgba(0, 0, 0, 0.5)" : "none",
        borderBottom: scrolled ? "1px solid rgba(251, 54, 64, 0.15)" : "1px solid rgba(251, 54, 64, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: scrolled ? "0.75rem 1.5rem" : "1.25rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s ease",
      }}>
        {/* Logo styled like INFINITEV.RETAIL */}
        <Link 
          to="/" 
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <div style={{
            fontFamily: 'var(--font-cyber)',
            fontSize: scrolled ? '1.25rem' : '1.5rem',
            fontWeight: '900',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}>
            <span style={{ color: '#ffffff' }}>NOTES</span>
            <span style={{ color: 'var(--accent-orange)', textShadow: '0 0 10px rgba(251, 54, 64, 0.5)' }}>VILLA</span>
            <span style={{ color: 'var(--text-muted)', fontSize: scrolled ? '0.7rem' : '0.8rem', marginLeft: '0.2rem', fontWeight: '500' }}>.STUDY</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: window.innerWidth >= 768 ? "flex" : "none",
          alignItems: "center",
          gap: "2rem",
        }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontFamily: 'var(--font-tech)',
                  fontSize: '1.1rem',
                  fontWeight: isActive ? '700' : '500',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  textShadow: isActive ? '0 0 8px rgba(251, 54, 64, 0.3)' : 'none',
                  transition: "all 0.2s ease",
                  padding: "0.25rem 0.5rem",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {item.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '2px',
                    backgroundColor: 'var(--accent-orange)',
                    boxShadow: '0 0 8px var(--accent-orange)'
                  }} />
                )}
              </Link>
            );
          })}          
        </nav>

        {/* Action Button (Add to cart wireframe box style) */}
        <div style={{ display: window.innerWidth >= 768 ? "flex" : "none", alignItems: "center" }}>
          {token ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link 
                to="/admin/upload" 
                className="cyber-btn-wire"
                style={{ textDecoration: 'none' }}
              >
                <Shield size={16} />
                Portal
              </Link>
              <button 
                onClick={logout}
                className="cyber-btn-wire"
                style={{ borderColor: 'rgba(251, 54, 64, 0.4)', color: 'var(--accent-orange)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 54, 64, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--accent-orange)';
                  e.currentTarget.style.color = 'var(--accent-orange)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(251, 54, 64, 0.4)';
                  e.currentTarget.style.color = 'var(--accent-orange)';
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/admin/login" 
              className="cyber-btn-wire"
              style={{ textDecoration: 'none' }}
            >
              <Shield size={16} />
              Portal Access
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: window.innerWidth < 768 ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "4px",
            border: "1px solid rgba(251, 54, 64, 0.3)",
            background: "rgba(0, 15, 8, 0.8)",
            color: "var(--text-primary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-orange)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(251, 54, 64, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.3)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div style={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        background: "rgba(0, 15, 8, 0.98)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(251, 54, 64, 0.15)",
        borderBottom: "1px solid rgba(251, 54, 64, 0.15)",
        transform: isMenuOpen ? "translateY(0)" : "translateY(-100%)",
        opacity: isMenuOpen ? 1 : 0,
        visibility: isMenuOpen ? "visible" : "hidden",
        transition: "all 0.3s ease",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
        display: window.innerWidth < 768 && isMenuOpen ? "block" : "none",
      }}>
        <nav style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1.2rem",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontFamily: "var(--font-tech)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: isActive ? "var(--accent-orange)" : "var(--text-secondary)",
                  background: isActive ? "rgba(251, 54, 64, 0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(251, 54, 64, 0.2)" : "1px solid transparent",
                  fontSize: "1.1rem",
                  fontWeight: isActive ? "700" : "500",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(251, 54, 64, 0.1)', margin: '0.5rem 0' }} />
          {token ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to="/admin/upload" 
                className="cyber-btn-wire"
                style={{ textDecoration: 'none', justifyContent: 'center', display: 'flex' }}
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield size={16} />
                Portal
              </Link>
              <button 
                onClick={logout}
                className="cyber-btn-wire"
                style={{ borderColor: 'rgba(251, 54, 64, 0.4)', color: 'var(--accent-orange)', justifyContent: 'center' }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/admin/login" 
              className="cyber-btn-wire"
              style={{ textDecoration: 'none', justifyContent: 'center', display: 'flex' }}
              onClick={() => setIsMenuOpen(false)}
            >
              <Shield size={16} />
              Portal Access
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}