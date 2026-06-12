import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ZodiacBadge from '../components/ZodiacBadge';

const TYPES = ['Birth Chart', 'Tarot Reading', 'Numerology', 'Vastu', 'Relationship', 'Career', 'General'];
const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
const STATUS_CLASS = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Cancelled: 'badge-cancelled', 'No Show': 'badge-noshow' };
const EMPTY_FORM = { clientId: '', title: '', date: '', duration: 60, type: 'General', status: 'Scheduled', fee: '', notes: '' };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const [apptRes, clientRes] = await Promise.all([
        api.get('/appointments', { params }),
        api.get('/clients', { params: { limit: 200 } }),
      ]);
      setAppointments(apptRes.data.appointments);
      setTotal(apptRes.data.total);
      setClients(clientRes.data.clients);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [filterStatus, filterDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditAppt(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (a) => {
    setEditAppt(a);
    const d = new Date(a.date);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ clientId: a.client?._id || '', title: a.title, date: local, duration: a.duration, type: a.type, status: a.status, fee: a.fee || '', notes: a.notes || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.clientId || !form.title || !form.date) return toast.error('Client, title and date are required');
    setSaving(true);
    try {
      const payload = { ...form, client: form.clientId };
      if (editAppt) {
        const { data } = await api.put(`/appointments/${editAppt._id}`, payload);
        setAppointments(as => as.map(a => a._id === data._id ? data : a));
        toast.success('Appointment updated ✨');
      } else {
        const { data } = await api.post('/appointments', payload);
        setAppointments(as => [data, ...as]);
        setTotal(t => t + 1);
        toast.success('Appointment scheduled 📅');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(as => as.filter(a => a._id !== id));
      setTotal(t => t - 1);
      toast.success('Appointment removed');
    } catch { toast.error('Delete failed'); }
  };

  const quickStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/appointments/${id}`, { status });
      setAppointments(as => as.map(a => a._id === id ? { ...a, status: data.status } : a));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center" style={{ display: 'flex' }}>
        <div>
          <h1>📅 Appointments</h1>
          <p>{total} total sessions scheduled</p>
        </div>
        <button id="add-appt-btn" className="btn btn-primary" onClick={openCreate}>+ Schedule Session</button>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <select className="form-select" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input className="form-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 180 }} />
        {(filterStatus || filterDate) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus(''); setFilterDate(''); }}>✕ Clear</button>
        )}
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? <div className="spinner" /> : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No appointments found</h3>
              <p>Schedule your first session</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Client</th><th>Session</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Fee</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{a.client?.name || '—'}</div>
                      <ZodiacBadge sign={a.client?.zodiacSign} size="sm" />
                    </td>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ fontWeight: 500 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.duration} min</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontSize: 13 }}>{a.type}</td>
                    <td><span className={`badge ${STATUS_CLASS[a.status] || ''}`}>{a.status}</span></td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{a.fee > 0 ? `₹${a.fee}` : '—'}</td>
                    <td>
                      <div className="action-row">
                        {a.status === 'Scheduled' && (
                          <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.3)' }}
                            onClick={() => quickStatus(a._id, 'Completed')}>✓ Done</button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editAppt ? '✏️ Edit Appointment' : '📅 Schedule Session'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Client *</label>
            <select className="form-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Select a client...</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.zodiacSign ? ` (${c.zodiacSign})` : ''}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Session Title *</label>
            <input className="form-input" placeholder="e.g. Birth Chart Reading" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input className="form-input" type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} min={15} max={480} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Fee (₹)</label>
            <input className="form-input" type="number" placeholder="0" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Pre-session notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
