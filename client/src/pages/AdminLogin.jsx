import React, { useState } from 'react';
import API, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/admin/login', form);
      const { token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      nav('/admin/upload');
    } catch (err) {
      alert(err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at 50% 30%, rgba(251, 54, 64, 0.08) 0%, #000F08 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box'
    }}>
      <div 
        className="cyber-panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '8px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Portal Shield icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(251, 54, 64, 0.1)',
            border: '1px solid rgba(251, 54, 64, 0.3)',
            borderRadius: '50%',
            padding: '1rem',
            color: 'var(--accent-orange)'
          }}>
            <Shield size={32} />
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          fontFamily: 'var(--font-cyber)',
          textTransform: 'uppercase',
          fontSize: '1.4rem',
          letterSpacing: '0.08em',
          color: '#ffffff'
        }}>
          Portal Access
        </h3>

        {/* Credentials Form */}
        <form onSubmit={submit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input 
            value={form.username} 
            onChange={e => setForm({ ...form, username: e.target.value })} 
            placeholder="ACCESS USERNAME" 
            required 
            style={{
              width: '100%',
              fontFamily: 'var(--font-tech)'
            }}
          />
          <input 
            type="password" 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })} 
            placeholder="ACCESS SECURE PASSWORD" 
            required 
            style={{
              width: '100%',
              fontFamily: 'var(--font-tech)'
            }}
          />
          
          <button 
            type="submit" 
            className="cyber-btn-orange" 
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '0.5rem',
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)'
            }}
          >
            <span>{loading ? 'AUTHORIZING...' : 'AUTHORIZE ACCESS'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
