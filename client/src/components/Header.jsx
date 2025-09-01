import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../services/api';
import { Menu, X, Home, LayoutDashboard } from 'lucide-react';

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
    { path: '/', label: 'Home', icon: Home, show: true },
    { path: '/notes', label: 'Notes', icon: LayoutDashboard, show: true },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        background: scrolled ? "rgba(10, 10, 10, 0.95)" : "rgba(18, 18, 18, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)" : "0 4px 24px 0 rgba(0, 0, 0, 0.18)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: scrolled ? "0.75rem 1.5rem" : "1rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "padding 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link 
            to="/" 
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img 
              src="/logo.svg" 
              alt="NotesVilla Logo" 
              style={{
                height: scrolled ? '40px' : '48px',
                width: scrolled ? '40px' : '48px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(139, 92, 246, 0.3))',
                transition: "all 0.3s ease",
              }} 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav style={{
          display: window.innerWidth >= 768 ? "flex" : "none",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          {navItems.filter(item => item.show).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                textDecoration: "none",
                color: location.pathname === item.path ? "#fff" : "#9ca3af",
                background: location.pathname === item.path 
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)" 
                  : "transparent",
                border: location.pathname === item.path 
                  ? "1px solid rgba(168, 85, 247, 0.3)" 
                  : "1px solid transparent",
                fontSize: "0.875rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.color = "#9ca3af";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}          
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: window.innerWidth < 768 ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
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
        background: "rgba(10, 10, 10, 0.98)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        transform: isMenuOpen ? "translateY(0)" : "translateY(-100%)",
        opacity: isMenuOpen ? 1 : 0,
        visibility: isMenuOpen ? "visible" : "hidden",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        display: window.innerWidth < 768 ? "block" : "none",
      }}>
        <nav style={{ padding: "1rem" }}>
          {navItems.filter(item => item.show).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                marginBottom: "0.5rem",
                borderRadius: "12px",
                textDecoration: "none",
                color: location.pathname === item.path ? "#fff" : "#9ca3af",
                background: location.pathname === item.path 
                  ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)" 
                  : "transparent",
                border: location.pathname === item.path 
                  ? "1px solid rgba(168, 85, 247, 0.2)" 
                  : "1px solid transparent",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}