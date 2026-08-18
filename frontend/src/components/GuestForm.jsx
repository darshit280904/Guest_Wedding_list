import React, { useState } from 'react';
import { UserPlus, Loader2, RotateCcw } from 'lucide-react';

const EMPTY_FORM = {
  firstName: '',
  fatherName: '',
  surname: '',
  mobileNumber: '',
  place: '',
};

export default function GuestForm({ lotId, onGuestAdded, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onGuestAdded({ ...form, lotId });
      setForm(EMPTY_FORM);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => setForm(EMPTY_FORM);

  return (
    <form onSubmit={handleSubmit} className="card animate-fadein">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <UserPlus size={18} color="#1a1000" />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Add New Guest</div>
          <div className="text-xs text-muted">All fields are optional</div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            className="form-input"
            placeholder="e.g. Rahul"
            value={form.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fatherName">Father Name</label>
          <input
            id="fatherName"
            name="fatherName"
            className="form-input"
            placeholder="e.g. Kumar"
            value={form.fatherName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="surname">Surname</label>
          <input
            id="surname"
            name="surname"
            className="form-input"
            placeholder="e.g. Sharma"
            value={form.surname}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="mobileNumber">Mobile Number</label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            className="form-input"
            placeholder="e.g. 9876543210"
            value={form.mobileNumber}
            onChange={handleChange}
            maxLength={15}
          />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label" htmlFor="place">Place / Address</label>
          <input
            id="place"
            name="place"
            className="form-input"
            placeholder="e.g. Mumbai, Maharashtra"
            value={form.place}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || loading}
        >
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} /> Adding...</>
          ) : (
            <><UserPlus size={15} /> Add Guest</>
          )}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleReset}
          disabled={submitting}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </form>
  );
}
