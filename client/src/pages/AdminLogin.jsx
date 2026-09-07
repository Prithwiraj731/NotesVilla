import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/admin/login', {
        username: form.username.trim(),
        password: form.password
      });

      const { token } = res.data;
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        nav('/admin/upload');
      } else {
        setError('Authentication failed: No token received.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.msg || err.response?.data?.error || err.message;
      setError(serverMsg || 'Invalid admin username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="cyber-panel admin-login-card">
        {/* Top Shield Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(251, 54, 64, 0.1)',
            border: '1px solid rgba(251, 54, 64, 0.3)',
            borderRadius: '50%',
            padding: '0.9rem',
            color: 'var(--accent-orange)',
            boxShadow: '0 0 20px rgba(251, 54, 64, 0.2)'
          }}>
            <Shield size={32} />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          textAlign: 'center',
          marginBottom: '0.4rem',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          fontSize: 'clamp(1.2rem, 3.5vw, 1.45rem)',
          letterSpacing: '0.06em',
          color: '#ffffff'
        }}>
          ADMIN SECURE ACCESS
        </h2>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.88rem',
          marginBottom: '1.8rem',
          lineHeight: '1.5'
        }}>
          Enter verified administrator credentials to unlock the notes management portal.
        </p>

        {/* Error Notification Banner */}
        {error && (
          <div style={{
            background: 'rgba(251, 54, 64, 0.1)',
            border: '1px solid rgba(251, 54, 64, 0.35)',
            borderRadius: '6px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            color: 'var(--accent-orange)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'shake 0.3s ease'
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Username Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '0.4rem'
            }}>
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type="text"
                className="search-input-with-icon"
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })} 
                placeholder="Enter username" 
                required 
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '0.4rem'
            }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="search-input-with-icon"
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                placeholder="Enter secure password" 
                required 
                style={{
                  width: '100%',
                  paddingRight: '2.8rem !important',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.92rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="cyber-btn-orange" 
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              borderRadius: '6px'
            }}
          >
            <KeyRound size={16} />
            <span>{loading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE ACCESS'}</span>
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
          <Link
            to="/"
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={14} />
            <span>Return to Public Library</span>
          </Link>
        </div>
      </div>

      <style>{`
        .admin-login-wrapper {
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(circle at 50% 25%, rgba(251, 54, 64, 0.12) 0%, #000F08 75%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          box-sizing: border-box;
        }

        @media (max-width: 480px) {
          .admin-login-wrapper {
            padding: 1.2rem 1rem;
          }
        }

        .admin-login-card {
          width: 100%;
          max-width: 420px;
          border-radius: 12px;
          padding: 2.5rem 2rem;
          border: 1px solid rgba(251, 54, 64, 0.25);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }

        @media (max-width: 480px) {
          .admin-login-card {
            padding: 1.8rem 1.25rem;
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
}
