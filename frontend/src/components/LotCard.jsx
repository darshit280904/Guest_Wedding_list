import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Trash2, Eye, MoreVertical } from 'lucide-react';

export default function LotCard({ lot, onDelete }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Delete lot "${lot.lotName}" and all its ${lot.guestCount || 0} guests?`)) {
      onDelete(lot._id);
    }
  };

  return (
    <div className="lot-card animate-fadein" onClick={() => navigate(`/lots/${lot._id}`)}>
      <div className="lot-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lot-card-title">{lot.lotName}</div>
          {lot.description && (
            <div className="lot-card-desc">{lot.description}</div>
          )}
          {lot.createdBy && (
            <div className="text-xs text-muted" style={{ marginTop: 4 }}>
              by {lot.createdBy}
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            title="Options"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9 }}
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
              />
              <div style={{
                position: 'absolute', right: 0, top: '100%',
                background: 'var(--bg-card2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                minWidth: 140,
                zIndex: 10,
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
              }}>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px',
                    background: 'none', border: 'none',
                    color: 'var(--text-primary)', fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,151,58,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/lots/${lot._id}`); }}
                >
                  <Eye size={14} /> View Guests
                </button>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px',
                    background: 'none', border: 'none',
                    color: '#e74c3c', fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  onClick={handleDelete}
                >
                  <Trash2 size={14} /> Delete Lot
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="lot-card-meta">
        <div className="lot-guest-count">
          <Users size={15} />
          <span><strong>{lot.guestCount || 0}</strong> Guests</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          <Calendar size={12} />
          {formatDate(lot.createdAt)}
        </div>
      </div>
    </div>
  );
}
