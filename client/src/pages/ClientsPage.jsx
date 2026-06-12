import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ZodiacBadge from '../components/ZodiacBadge';
import ZodiacSelector from '../components/ZodiacSelector';
import { ZODIAC_SIGNS, getZodiacByName, getZodiacFromDOB } from '../utils/zodiac';
import { exportClientsCSV } from '../utils/csvExport';

const EMPTY_FORM = { name: '', email: '', phone: '', dateOfBirth: '', zodiacSign: '', address: '', notes: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zodiacFilter, setZodiacFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (zodiacFilter) params.zodiac = zodiacFilter;
      const { data } = await api.get('/clients', { params });
      setClients(data.clients);
      setTotal(data.total);
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [search, zodiacFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Auto-detect zodiac from DOB
  const handleDOBChange = (dob) => {
    const sign = getZodiacFromDOB(dob);
    const gemstone = sign ? getZodiacByName(sign)?.gemstone || '' : '';
    setForm(f => ({ ...f, dateOfBirth: dob, zodiacSign: sign || f.zodiacSign, suggestedGemstone: gemstone }));
  };

  const openCreate = () => { setEditClient(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditClient(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', dateOfBirth: c.dateOfBirth ? c.dateOfBirth.slice(0, 10) : '', zodiacSign: c.zodiacSign || '', address: c.address || '', notes: c.notes || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = { ...form, suggestedGemstone: form.zodiacSign ? getZodiacByName(form.zodiacSign)?.gemstone : '' };
      if (editClient) {
        const { data } = await api.put(`/clients/${editClient._id}`, payload);
        setClients(cs => cs.map(c => c._id === data._id ? data : c));
        toast.success('Client updated ✨');
      } else {
        const { data } = await api.post('/clients', payload);
        setClients(cs => [data, ...cs]);
        setTotal(t => t + 1);
        toast.success('Client added 🔮');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(cs => cs.filter(c => c._id !== id));
      setTotal(t => t - 1);
      toast.success('Client removed');
    } catch { toast.error('Delete failed'); }
  };

  const handleExportCSV = () => {
    if (clients.length === 0) return toast.error('No clients to export');
    exportClientsCSV(clients);
    toast.success(`Exported ${clients.length} clients to CSV 📊`);
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center" style={{ display: 'flex' }}>
        <div>
          <h1>👥 Clients</h1>
          <p>{total} total clients in your constellation</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            id="export-csv-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(124,58,237,0.4)' }}
          >
            📊 Export CSV
          </button>
          <button id="add-client-btn" className="btn btn-primary" onClick={openCreate}>+ Add Client</button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-bar">
        <div className="search-input-wrap" style={{ flex: 2 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={zodiacFilter} onChange={e => setZodiacFilter(e.target.value)}>
          <option value="">All Zodiac Signs</option>
          {ZODIAC_SIGNS.map(z => <option key={z.name} value={z.name}>{z.symbol} {z.name}</option>)}
        </select>
        {(search || zodiacFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setZodiacFilter(''); }}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-wrap">
          {loading ? <div className="spinner" /> : clients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌌</div>
              <h3>No clients yet</h3>
              <p>Add your first client to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Client</th><th>Contact</th><th>Zodiac</th><th>Date of Birth</th><th>Gemstone</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{c.name.charAt(0)}</div>
                        <div>
                          <Link to={`/clients/${c._id}`} style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>{c.name}</Link>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{c.email || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone || ''}</div>
                    </td>
                    <td><ZodiacBadge sign={c.zodiacSign} /></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{c.suggestedGemstone ? <span className="gemstone-badge">💎 {c.suggestedGemstone}</span> : '—'}</td>
                    <td>
                      <div className="action-row">
                        <Link to={`/clients/${c._id}`} className="btn btn-ghost btn-sm">View</Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Client Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editClient ? '✏️ Edit Client' : '✨ Add New Client'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Client name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="client@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => handleDOBChange(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="City, State" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Zodiac Sign</label>
            <ZodiacSelector value={form.zodiacSign} onChange={sign => {
              const gem = sign ? getZodiacByName(sign)?.gemstone || '' : '';
              setForm(f => ({ ...f, zodiacSign: sign, suggestedGemstone: gem }));
            }} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Any initial notes about this client..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
