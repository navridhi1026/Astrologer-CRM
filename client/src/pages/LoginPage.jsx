import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const warmingToastId = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Ping server on mount so Render wakes up before the user clicks Sign In
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show toast if server hasn't responded yet
      warmingToastId.current = toast.loading('⏳ Server is warming up, please wait a moment...', { duration: 30000 });
    }, 2000);

    api.get('/health')
      .catch(() => api.get('/')) // fallback to root
      .finally(() => {
        clearTimeout(timer);
        if (warmingToastId.current) {
          toast.dismiss(warmingToastId.current);
          warmingToastId.current = null;
        }
        setServerReady(true);
      });

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}! 🔮`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-glyph">🔮</span>
          <h1>AstroVault CRM</h1>
          <p>Sign in to your astrologer dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="login-email" className="form-input" type="email" placeholder="astrologer@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button id="login-btn" className="btn btn-primary w-full" type="submit" disabled={loading}
            style={{ justifyContent: 'center', padding: '14px' }}>
            {loading ? '✨ Signing in...' : '🔮 Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one →</Link>
        </div>
      </div>
    </div>
  );
}
