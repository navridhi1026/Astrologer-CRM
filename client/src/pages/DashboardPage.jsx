import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ZodiacBadge from '../components/ZodiacBadge';

const STAT_CARDS = [
  { key: 'totalClients', label: 'Total Clients', icon: '👥', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  { key: 'todayAppointments', label: "Today's Sessions", icon: '📅', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { key: 'pendingAppointments', label: 'Pending Sessions', icon: '⏳', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { key: 'monthlyAppointments', label: 'Monthly Completed', icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name} 🔮</h1>
        <p>Here's what's happening in your cosmic practice today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        {STAT_CARDS.map(c => (
          <div key={c.key} className="stat-card">
            <div className="stat-icon" style={{ background: c.bg }}>
              <span style={{ fontSize: 26 }}>{c.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-label">{c.label}</div>
              <div className="stat-value" style={{ color: c.color }}>{stats?.[c.key] ?? 0}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        {/* Upcoming Appointments */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-cinzel" style={{ fontSize: 16, color: 'var(--gold)' }}>📅 Upcoming Sessions</h3>
            <Link to="/appointments" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {stats?.upcomingAppointments?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📭</div>
              <p>No upcoming sessions</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.upcomingAppointments?.map(a => (
                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.client?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.title} · {a.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <ZodiacBadge sign={a.client?.zodiacSign} size="sm" />
                    <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 4 }}>
                      {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-cinzel" style={{ fontSize: 16, color: 'var(--gold)' }}>👥 Recent Clients</h3>
            <Link to="/clients" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {stats?.recentClients?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">👤</div>
              <p>No clients yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats?.recentClients?.map(c => (
                <Link to={`/clients/${c._id}`} key={c._id} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--card-border)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}>
                  <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{c.name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <ZodiacBadge sign={c.zodiacSign} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zodiac Distribution */}
      {stats?.zodiacDistribution?.length > 0 && (
        <div className="glass-card">
          <h3 className="font-cinzel mb-4" style={{ fontSize: 16, color: 'var(--gold)' }}>♈ Client Zodiac Distribution</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {stats.zodiacDistribution.map(z => (
              <div key={z._id} style={{ padding: '8px 16px', borderRadius: 999, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 13, fontWeight: 600 }}>
                {z._id || 'Unknown'} <span style={{ color: 'var(--gold)', marginLeft: 6 }}>{z.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
