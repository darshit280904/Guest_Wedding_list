import React, { useState } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { updateGuest } from '../api';
import toast from 'react-hot-toast';

export default function GuestTable({ guests, onDelete, onUpdate, loading }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (guest) => {
    setEditingId(guest._id);
    setEditForm({
      firstName: guest.firstName || '',
      fatherName: guest.fatherName || '',
      surname: guest.surname || '',
      mobileNumber: guest.mobileNumber || '',
      place: guest.place || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      await onUpdate(id, editForm);
      setEditingId(null);
      setEditForm({});
    } catch {
      toast.error('Failed to update guest');
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <span>Loading guests...</span>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="table-empty">
          <div className="table-empty-icon">👥</div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No guests yet</div>
          <div className="text-sm text-muted" style={{ marginTop: 6 }}>
            Add guests using the form above or bulk import
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper animate-fadein">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 50 }}>#</th>
            <th>First Name</th>
            <th>Father Name</th>
            <th>Surname</th>
            <th>Mobile</th>
            <th>Place</th>
            <th style={{ width: 90 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest, idx) => (
            <tr key={guest._id}>
              <td className="table-num">{guest.serialNumber || idx + 1}</td>
              {editingId === guest._id ? (
                <>
                  {['firstName', 'fatherName', 'surname', 'mobileNumber', 'place'].map((field) => (
                    <td key={field}>
                      <input
                        className="form-input"
                        style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                        value={editForm[field]}
                        onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                        placeholder={field}
                      />
                    </td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-primary btn-icon btn-sm"
                        title="Save"
                        onClick={() => saveEdit(guest._id)}
                      >
                        <Check size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Cancel"
                        onClick={cancelEdit}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{guest.firstName || <span className="text-muted">—</span>}</td>
                  <td>{guest.fatherName || <span className="text-muted">—</span>}</td>
                  <td>{guest.surname || <span className="text-muted">—</span>}</td>
                  <td>
                    {guest.mobileNumber ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {guest.mobileNumber}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{guest.place || <span className="text-muted">—</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Edit"
                        onClick={() => startEdit(guest)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this guest?')) onDelete(guest._id);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
