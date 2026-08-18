import React, { useEffect, useState } from 'react';
import { getLots } from '../api';
import { FolderOpen, Users, Heart, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getLots();
      setLots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalLots = lots.length;
  const totalGuests = lots.reduce((sum, l) => sum + (l.guestCount || 0), 0);
  const latestLot = lots[0];

  return (
    <div className="animate-fadein">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card2) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(200,151,58,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: '30%',
          width: 150, height: 150,
          background: 'radial-gradient(circle, rgba(139,26,26,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 50, height: 50,
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={24} color="#1a1000" fill="#1a1000" />
            </div>
            <div>
              <h1 className="page-title" style={{ marginBottom: 0 }}>Welcome to Guest List Manager</h1>
              <p className="page-subtitle">Manage your marriage guest lists with ease</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <Link to="/lots" className="btn btn-primary">
              <FolderOpen size={15} /> View All Lots
            </Link>
            <Link to="/lots" className="btn btn-secondary">
              <Users size={15} /> Manage Guests
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-gold">
            <FolderOpen size={22} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : totalLots}</div>
            <div className="stat-label">Total Lots</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : totalGuests}</div>
            <div className="stat-label">Total Guests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">
              {loading ? '...' : totalLots > 0 ? Math.round(totalGuests / totalLots) : 0}
            </div>
            <div className="stat-label">Avg Guests / Lot</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>
              {loading ? '...' : latestLot
                ? new Date(latestLot.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                : '—'}
            </div>
            <div className="stat-label">Latest Lot</div>
          </div>
        </div>
      </div>

      {/* Recent Lots */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', fontWeight: 700 }}>
            Recent Lots
          </h2>
          <Link to="/lots" className="btn btn-ghost btn-sm">View All</Link>
        </div>

        {loading ? (
          <div className="loading-center" style={{ padding: '30px' }}>
            <div className="spinner" />
          </div>
        ) : lots.length === 0 ? (
          <div className="table-empty" style={{ padding: '40px' }}>
            <div className="table-empty-icon">📋</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No lots yet</div>
            <div className="text-sm text-muted" style={{ marginTop: 6 }}>
              <Link to="/lots" className="text-gold">Create your first lot</Link> to get started
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Lot Name</th>
                  <th>Description</th>
                  <th>Guests</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {lots.slice(0, 8).map((lot, i) => (
                  <tr key={lot._id} onClick={() => window.location.href = `/lots/${lot._id}`} style={{ cursor: 'pointer' }}>
                    <td className="table-num">{i + 1}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lot.lotName}</span>
                    </td>
                    <td className="text-secondary text-sm">{lot.description || '—'}</td>
                    <td>
                      <span className="page-badge" style={{ fontSize: '0.75rem', padding: '2px 10px' }}>
                        {lot.guestCount || 0}
                      </span>
                    </td>
                    <td className="text-muted text-xs">
                      {new Date(lot.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
