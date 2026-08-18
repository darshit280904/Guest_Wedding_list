import React, { useEffect, useState } from 'react';
import { getLots, createLot, deleteLot } from '../api';
import LotCard from '../components/LotCard';
import { Plus, FolderOpen, X, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Lots() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ lotName: '', description: '', createdBy: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const res = await getLots();
      setLots(res.data);
    } catch (err) {
      toast.error('Failed to load lots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.lotName.trim()) { toast.error('Lot name is required'); return; }
    setCreating(true);
    try {
      await createLot(form);
      toast.success('Lot created successfully!');
      setShowModal(false);
      setForm({ lotName: '', description: '', createdBy: '' });
      fetchLots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lot');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLot(id);
      toast.success('Lot deleted');
      setLots((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error('Failed to delete lot');
    }
  };

  const filtered = lots.filter((l) =>
    l.lotName.toLowerCase().includes(search.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.createdBy || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadein">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest Lots</h1>
          <p className="page-subtitle">Manage all your marriage guest list batches</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="page-badge">
            <FolderOpen size={12} />
            {lots.length} Lots
          </span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="create-lot-btn">
            <Plus size={16} /> New Lot
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            className="search-input"
            placeholder="Search lots by name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="lot-search"
          />
        </div>
      </div>

      {/* Lots Grid */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <span>Loading lots...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {lots.length === 0 ? 'No lots created yet' : 'No lots found'}
          </div>
          <div className="text-sm text-muted" style={{ marginBottom: 20 }}>
            {lots.length === 0
              ? 'Create a lot to start adding your marriage guests'
              : 'Try a different search term'}
          </div>
          {lots.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Create First Lot
            </button>
          )}
        </div>
      ) : (
        <div className="lots-grid">
          {filtered.map((lot) => (
            <LotCard key={lot._id} lot={lot} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create Lot Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="modal-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                Create New Lot
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="divider" />

            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="lotNameInput">
                    Lot Name <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    id="lotNameInput"
                    className="form-input"
                    placeholder="e.g. Bride's Side Guests"
                    value={form.lotName}
                    onChange={(e) => setForm((p) => ({ ...p, lotName: e.target.value }))}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lotDescription">Description</label>
                  <input
                    id="lotDescription"
                    className="form-input"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lotCreatedBy">Created By</label>
                  <input
                    id="lotCreatedBy"
                    className="form-input"
                    placeholder="Your name (optional)"
                    value={form.createdBy}
                    onChange={(e) => setForm((p) => ({ ...p, createdBy: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={creating} id="confirm-create-lot">
                  {creating ? (
                    <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Creating...</>
                  ) : (
                    <><Plus size={15} /> Create Lot</>
                  )}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
