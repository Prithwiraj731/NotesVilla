import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
export default function Footer(){
  return (
    <footer
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        background: "rgba(18,18,18,0.92)",
        color: "#bdbdbd",
        textAlign: "center",
        padding: "1rem 0",
        fontSize: "1rem",
        borderTop: "1px solid #232323",
        zIndex: 99,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem"
      }}
    >
      <small>© {new Date().getFullYear()} NotesVilla — Built for everyone</small>
      
      {/* Small Admin Login Button */}
      <Link
        to="/admin/login"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0.5rem",
          background: "rgba(168, 85, 247, 0.1)",
          border: "1px solid rgba(168, 85, 247, 0.2)",
          borderRadius: "0.375rem",
          color: "#a855f7",
          fontSize: "0.75rem",
          textDecoration: "none",
          transition: "all 0.2s ease",
          opacity: 0.7
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = "1";
          e.target.style.background = "rgba(168, 85, 247, 0.15)";
          e.target.style.borderColor = "rgba(168, 85, 247, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = "0.7";
          e.target.style.background = "rgba(168, 85, 247, 0.1)";
          e.target.style.borderColor = "rgba(168, 85, 247, 0.2)";
        }}
      >
        <Shield size={12} />
        Admin
      </Link>
    </footer>
  );
}
