import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        background: "rgba(0, 15, 8, 0.95)",
        color: "var(--text-secondary)",
        textAlign: "center",
        padding: "1.5rem 0",
        fontSize: "0.95rem",
        borderTop: "1px solid rgba(251, 54, 64, 0.1)",
        marginTop: "auto", // Push to bottom in flex containers
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
        fontFamily: "var(--font-tech)",
        zIndex: 99,
        flexWrap: "wrap"
      }}
    >
      <small style={{ letterSpacing: '0.05em' }}>
        © {new Date().getFullYear()} NOTESVILLA.STUDY — FUTURISTIC ARCHIVE
      </small>
      
      {/* Small Admin Login Link */}
      <Link
        to="/admin/login"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          padding: "0.3rem 0.75rem",
          background: "rgba(251, 54, 64, 0.05)",
          border: "1px solid rgba(251, 54, 64, 0.2)",
          borderRadius: "4px",
          color: "var(--accent-orange)",
          fontSize: "0.8rem",
          textDecoration: "none",
          transition: "all 0.2s ease",
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: '700'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(251, 54, 64, 0.15)";
          e.currentTarget.style.borderColor = "var(--accent-orange)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(251, 54, 64, 0.05)";
          e.currentTarget.style.borderColor = "rgba(251, 54, 64, 0.2)";
        }}
      >
        <Shield size={12} />
        PORTAL
      </Link>
    </footer>
  );
}
