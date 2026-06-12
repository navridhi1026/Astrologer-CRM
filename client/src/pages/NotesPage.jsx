import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ZodiacBadge from '../components/ZodiacBadge';

const EMPTY_FORM = { clientId: '', appointmentId: '', title: '', content: '', planetaryPositions: '', predictions: '', remedies: '', followUpDate: '', tags: '' };

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClient) params.clientId = filterClient;
      const [notesRes, clientsRes] = await Promise.all([
        api.get('/notes', { params }),
        api.get('/clients', { params: { limit: 200 } }),
      ]);
      setNotes(notesRes.data);
      setClients(clientsRes.data.clients);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, [filterClient]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadClientAppointments = async (clientId) => {
    if (!clientId) { setAppointments([]); return; }
    try {
      const { data } = await api.get('/appointments', { params: { clientId, limit: 50 } });
      setAppointments(data.appointments || []);
    } catch { setAppointments([]); }
  };

  const openCreate = () => { setEditNote(null); setForm(EMPTY_FORM); setAppointments([]); setShowModal(true); };
  const openEdit = (n) => {
    setEditNote(n);
    setForm({
      clientId: n.client?._id || '', appointmentId: n.appointment?._id || '',
      title: n.title, content: n.content, planetaryPositions: n.planetaryPositions || '',
      predictions: n.predictions || '', remedies: n.remedies || '',
      followUpDate: n.followUpDate ? n.followUpDate.slice(0, 10) : '',
      tags: (n.tags || []).join(', '),
    });
    loadClientAppointments(n.client?._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.clientId || !form.title || !form.content) return toast.error('Client, title and content are required');
    setSaving(true);
    try {
      const payload = {
        client: form.clientId, appointment: form.appointmentId || undefined,
        title: form.title, content: form.content,
        planetaryPositions: form.planetaryPositions, predictions: form.predictions,
        remedies: form.remedies, followUpDate: form.followUpDate || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editNote) {
        const { data } = await api.put(`/notes/${editNote._id}`, payload);
        setNotes(ns => ns.map(n => n._id === data._id ? data : n));
        toast.success('Note updated ✨');
      } else {
        const { data } = await api.post('/notes', payload);
        setNotes(ns => [data, ...ns]);
        toast.success('Note saved 📜');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(ns => ns.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center" style={{ display: 'flex' }}>
        <div>
          <h1>📜 Consultation Notes</h1>
          <p>{notes.length} notes recorded</p>
        </div>
        <button id="add-note-btn" className="btn btn-primary" onClick={openCreate}>+ New Note</button>
      </div>

      {/* Filter */}
      <div className="search-bar">
        <select className="form-select" style={{ width: 240 }} value={filterClient} onChange={e => setFilterClient(e.target.value)}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.zodiacSign ? ` (${c.zodiacSign})` : ''}</option>)}
        </select>
        {filterClient && <button className="btn btn-ghost btn-sm" onClick={() => setFilterClient('')}>✕ Clear</button>}
      </div>

      {loading ? <div className="spinner" /> : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No notes yet</h3>
          <p>Start recording your consultation insights</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notes.map(n => (
            <div key={n._id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(ex => ({ ...ex, [n._id]: !ex[n._id] }))}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{n.title}</span>
                    <ZodiacBadge sign={n.client?.zodiacSign} size="sm" />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    👤 {n.client?.name} {n.appointment && <> · 📅 {n.appointment.type} – {new Date(n.appointment.date).toLocaleDateString()}</>}
                    <span style={{ marginLeft: 12 }}>🕐 {new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="action-row" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(n)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n._id)}>Delete</button>
                </div>
              </div>

              {expanded[n._id] && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--card-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>CONSULTATION NOTES</div>
                    <div style={{ fontSize: 14, lineHeight: 1.7 }}>{n.content}</div></div>
                  {n.planetaryPositions && <div><div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>🪐 PLANETARY POSITIONS</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{n.planetaryPositions}</div></div>}
                  {n.predictions && <div style={{ padding: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}><div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>🔮 PREDICTIONS</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{n.predictions}</div></div>}
                  {n.remedies && <div style={{ padding: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10 }}><div style={{ fontSize: 12, color: 'var(--purple-light)', fontWeight: 700, marginBottom: 4 }}>💊 REMEDIES</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{n.remedies}</div></div>}
                  {n.followUpDate && <div style={{ fontSize: 13 }}>📌 Follow-up: <span style={{ color: 'var(--gold)' }}>{new Date(n.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                  {n.tags?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{n.tags.map(t => <span key={t} style={{ padding: '3px 10px', background: 'rgba(124,58,237,0.15)', borderRadius: 999, fontSize: 12, color: 'var(--purple-light)' }}>#{t}</span>)}</div>}
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>{expanded[n._id] ? '▲ Collapse' : '▼ Click to expand'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editNote ? '✏️ Edit Note' : '📜 New Consultation Note'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Client *</label>
            <select className="form-select" value={form.clientId} onChange={e => { setForm({ ...form, clientId: e.target.value, appointmentId: '' }); loadClientAppointments(e.target.value); }} required>
              <option value="">Select client...</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.zodiacSign ? ` (${c.zodiacSign})` : ''}</option>)}
            </select>
          </div>
          {appointments.length > 0 && (
            <div className="form-group">
              <label className="form-label">Linked Appointment</label>
              <select className="form-select" value={form.appointmentId} onChange={e => setForm({ ...form, appointmentId: e.target.value })}>
                <option value="">None</option>
                {appointments.map(a => <option key={a._id} value={a._id}>{a.title} – {new Date(a.date).toLocaleDateString()}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Notes *</label>
            <textarea className="form-textarea" placeholder="Key observations and discussion points..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} required />
          </div>
          <div className="form-group">
            <label className="form-label">🪐 Planetary Positions</label>
            <input className="form-input" placeholder="e.g. Saturn in 7th house, Jupiter transiting..." value={form.planetaryPositions} onChange={e => setForm({ ...form, planetaryPositions: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">🔮 Predictions</label>
            <textarea className="form-textarea" placeholder="Key predictions for this client..." value={form.predictions} onChange={e => setForm({ ...form, predictions: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">💊 Remedies</label>
            <textarea className="form-textarea" placeholder="Gemstones, mantras, fasting recommendations..." value={form.remedies} onChange={e => setForm({ ...form, remedies: e.target.value })} rows={3} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input className="form-input" type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="form-input" placeholder="marriage, career, health" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
