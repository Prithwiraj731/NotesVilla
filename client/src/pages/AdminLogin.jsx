import React, { useState } from 'react';
import API, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin(){
  const [form, setForm] = useState({ username: '', password: '' });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
  const res = await API.post('/admin/login', form); // <-- /admin/login
      const { token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      nav('/admin/upload'); // or /dashboard
    } catch (err) {
      alert(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h3 style={{textAlign:'center', marginBottom:'1.5rem', fontWeight:'700', letterSpacing:'0.08em'}}>Admin Login</h3>
        <form onSubmit={submit} autoComplete="off">
          <input value={form.username} onChange={e=>setForm({...form, username: e.target.value})} placeholder="Username" required />
          <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Password" required />
          <button type="submit" className="animated-btn"><span>Sign in</span></button>
        </form>
      </div>
    </div>
  );
}
