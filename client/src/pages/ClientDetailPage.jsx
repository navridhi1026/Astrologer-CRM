import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ZodiacBadge from '../components/ZodiacBadge';
import { getZodiacByName } from '../utils/zodiac';
import { downloadClientPDF } from '../utils/pdfReport';

const STATUS_CLASS = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Cancelled: 'badge-cancelled', 'No Show': 'badge-noshow' };

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/clients/${id}`),
      api.get('/appointments', { params: { clientId: id, limit: 50 } }),
      api.get('/notes', { params: { clientId: id } }),
    ]).then(([c, a, n]) => {
      setClient(c.data);
      setAppointments(a.data.appointments || []);
      setNotes(n.data || []);
    }).catch(() => toast.error('Failed to load client'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!client) return <div className="empty-state"><div className="empty-icon">❌</div><h3>Client not found</h3></div>;

  const zodiac = getZodiacByName(client.zodiacSign);

  const handleDownloadPDF = () => {
    try {
      downloadClientPDF(client, notes);
      toast.success('PDF report downloaded! 📄');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')}>← Back to Clients</button>
          <button
            id="download-pdf-btn"
            className="btn btn-primary btn-sm"
            onClick={handleDownloadPDF}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none' }}
          >
            📄 Download PDF Report
          </button>
        </div>
        <div className="profile-header">
          <div className="profile-avatar" style={{ background: zodiac ? zodiac.gradient : 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            {zodiac ? zodiac.symbol : client.name.charAt(0)}
          </div>
          <div className="profile-info">
            <h2>{client.name}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
              {client.zodiacSign && <ZodiacBadge sign={client.zodiacSign} />}
              {client.suggestedGemstone && <span className="gemstone-badge">💎 {client.suggestedGemstone}</span>}
              {zodiac && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🌍 {zodiac.element} · 🪐 {zodiac.rulingPlanet}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Client Info */}
        <div className="glass-card">
          <h3 className="font-cinzel mb-4" style={{ fontSize: 16, color: 'var(--gold)' }}>📋 Personal Details</h3>
          <div className="info-grid">
            <div className="info-item"><label>Email</label><span>{client.email || '—'}</span></div>
            <div className="info-item"><label>Phone</label><span>{client.phone || '—'}</span></div>
            <div className="info-item"><label>Date of Birth</label><span>{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
            <div className="info-item"><label>Address</label><span>{client.address || '—'}</span></div>
            <div className="info-item"><label>Zodiac Sign</label><span>{client.zodiacSign || '—'}</span></div>
            <div className="info-item"><label>Lucky Gemstone</label><span style={{ color: 'var(--gold)' }}>{client.suggestedGemstone ? `💎 ${client.suggestedGemstone}` : '—'}</span></div>
            {zodiac && <>
              <div className="info-item"><label>Element</label><span>{zodiac.element}</span></div>
              <div className="info-item"><label>Ruling Planet</label><span>🪐 {zodiac.rulingPlanet}</span></div>
              <div className="info-item"><label>Date Range</label><span>{zodiac.dateRange}</span></div>
              <div className="info-item"><label>Traits</label><span style={{ fontSize: 12 }}>{zodiac.traits.join(', ')}</span></div>
            </>}
          </div>
          {client.notes && (
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(124,58,237,0.08)', borderRadius: 10, borderLeft: '3px solid var(--purple)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>CLIENT NOTES</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{client.notes}</div>
            </div>
          )}
        </div>

        {/* Consultation History */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-cinzel" style={{ fontSize: 16, color: 'var(--gold)' }}>📜 Consultation History</h3>
            <Link to="/appointments" className="btn btn-ghost btn-sm">+ Add</Link>
          </div>
          {appointments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📭</div>
              <p>No appointments yet</p>
            </div>
          ) : (
            <div className="timeline">
              {appointments.map((a, i) => (
                <div key={a._id} className="timeline-item">
                  <div className="timeline-dot-line">
                    <div className="timeline-dot" style={{ background: a.status === 'Completed' ? 'var(--success)' : a.status === 'Cancelled' ? 'var(--danger)' : 'var(--purple)' }} />
                    {i < appointments.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--card-border)', marginTop: 4 }} />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="timeline-title">{a.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.type}</span>
                      <span className={`badge ${STATUS_CLASS[a.status] || ''}`} style={{ fontSize: 11 }}>{a.status}</span>
                      {a.fee > 0 && <span style={{ fontSize: 12, color: 'var(--gold)' }}>₹{a.fee}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {notes.length > 0 && (
        <div className="glass-card">
          <h3 className="font-cinzel mb-4" style={{ fontSize: 16, color: 'var(--gold)' }}>✍️ Consultation Notes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notes.map(n => (
              <div key={n._id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{n.content}</div>
                {n.predictions && <div style={{ marginTop: 8, fontSize: 13 }}><span style={{ color: 'var(--gold)' }}>🔮 Predictions: </span>{n.predictions}</div>}
                {n.remedies && <div style={{ marginTop: 4, fontSize: 13 }}><span style={{ color: 'var(--purple-light)' }}>💊 Remedies: </span>{n.remedies}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
