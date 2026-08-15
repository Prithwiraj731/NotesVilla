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
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at 50% 25%, rgba(251, 54, 64, 0.12) 0%, #000F08 75%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      boxSizing: 'border-box'
    }}>
      <div 
        className="cyber-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(251, 54, 64, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Top Shield Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(251, 54, 64, 0.1)',
            border: '1px solid rgba(251, 54, 64, 0.3)',
            borderRadius: '50%',
            padding: '1rem',
            color: 'var(--accent-orange)',
            boxShadow: '0 0 20px rgba(251, 54, 64, 0.2)'
          }}>
            <Shield size={34} />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          textAlign: 'center',
          marginBottom: '0.4rem',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          fontSize: '1.4rem',
          letterSpacing: '0.06em',
          color: '#ffffff'
        }}>
          ADMIN SECURE ACCESS
        </h2>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          marginBottom: '2rem'
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
            fontSize: '0.88rem',
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
        <form onSubmit={submit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Username Input */}
          <div>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '0.45rem'
            }}>
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })} 
                placeholder="Enter username" 
                required 
                style={{
                  width: '100%',
                  paddingLeft: '2.8rem !important',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem'
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
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '0.45rem'
            }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                placeholder="Enter secure password" 
                required 
                style={{
                  width: '100%',
                  paddingLeft: '2.8rem !important',
                  paddingRight: '2.8rem !important',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem'
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
                  padding: '0.2rem',
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
              fontSize: '1rem',
              marginTop: '0.6rem',
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
    </div>
  );
}
