import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getLot, getGuests, addGuest, bulkAddGuests,
  deleteGuest, updateGuest, exportPDF, exportWord, parseFile
} from '../api';
import GuestForm from '../components/GuestForm';
import GuestTable from '../components/GuestTable';
import toast from 'react-hot-toast';
import {
  FileText, FileDown, Search, Users, Upload,
  ChevronLeft, ChevronRight, X, Loader2, AlertTriangle, FileUp
} from 'lucide-react';

export default function Guests() {
  const { lotId } = useParams();
  const [lot, setLot] = useState(null);
  const [guests, setGuests] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('guests'); // 'guests' | 'add' | 'bulk'
  const [bulkText, setBulkText] = useState('');
  const [bulkImporting, setbulkImporting] = useState(false);
  const [fileParsing, setFileParsing] = useState(false);
  const [exporting, setExporting] = useState('');
  const LIMIT = 100;

  useEffect(() => {
    fetchLot();
  }, [lotId]);

  useEffect(() => {
    fetchGuests();
  }, [lotId, page, search]);

  const fetchLot = async () => {
    try {
      const res = await getLot(lotId);
      setLot(res.data);
    } catch { toast.error('Lot not found'); }
  };

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGuests(lotId, page, LIMIT, search);
      setGuests(res.data.guests);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load guests'); }
    finally { setLoading(false); }
  }, [lotId, page, search]);

  const handleAddGuest = async (data) => {
    try {
      await addGuest(data);
      toast.success('Guest added!');
      fetchGuests();
      fetchLot();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add guest');
      throw err;
    }
  };

  const handleUpdateGuest = async (id, data) => {
    await updateGuest(id, data);
    toast.success('Guest updated!');
    fetchGuests();
  };

  const handleDeleteGuest = async (id) => {
    try {
      await deleteGuest(id);
      toast.success('Guest removed');
      fetchGuests();
      fetchLot();
    } catch { toast.error('Failed to delete guest'); }
  };

  // ---- Bulk Import ----
  const parseBulkText = (text) => {
    const lines = text.trim().split('\n').filter(Boolean);
    return lines.map((line) => {
      const parts = line.split(',').map((s) => s.trim());
      return {
        firstName: parts[0] || '',
        fatherName: parts[1] || '',
        surname: parts[2] || '',
        mobileNumber: parts[3] || '',
        place: parts[4] || '',
      };
    });
  };

  const handleBulkImport = async () => {
    const parsed = parseBulkText(bulkText);
    if (parsed.length === 0) { toast.error('No data to import'); return; }
    if (parsed.length > 500) { toast.error('Maximum 500 guests per import'); return; }

    setbulkImporting(true);
    try {
      const res = await bulkAddGuests({ lotId, guests: parsed });
      toast.success(res.data.message);
      setBulkText('');
      setActiveTab('guests');
      fetchGuests();
      fetchLot();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk import failed');
    } finally {
      setbulkImporting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setFileParsing(true);
    const toastId = toast.loading('Extracting guest list from file...');

    try {
      const res = await parseFile(formData);
      if (res.data.text) {
        setBulkText(res.data.text);
        toast.success('Text extracted successfully! Review and edit below.', { id: toastId });
      } else {
        toast.error('No text could be extracted from the file.', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse file', { id: toastId });
    } finally {
      setFileParsing(false);
      // Clear input so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  // ---- Export ----
  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const res = await exportPDF(lotId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lot?.lotName || 'guests'}_guests.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    finally { setExporting(''); }
  };

  const handleExportWord = async () => {
    setExporting('word');
    try {
      const res = await exportWord(lotId);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lot?.lotName || 'guests'}_guests.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Word document downloaded!');
    } catch { toast.error('Word export failed'); }
    finally { setExporting(''); }
  };

  // ---- Search ----
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="animate-fadein">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/lots">Lots</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{lot?.lotName || 'Loading...'}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontFamily: 'Playfair Display, serif' }}>
            {lot?.lotName || '...'}
          </h1>
          {lot?.description && (
            <p className="page-subtitle">{lot.description}</p>
          )}
          {lot?.createdBy && (
            <p className="page-subtitle" style={{ marginTop: 2 }}>by {lot.createdBy}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="page-badge">
            <Users size={12} />
            {total} Guests
          </span>
          <button
            className="btn btn-pdf btn-sm"
            onClick={handleExportPDF}
            disabled={!!exporting || total === 0}
            id="export-pdf-btn"
          >
            {exporting === 'pdf' ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <FileText size={14} />}
            Download PDF
          </button>
          <button
            className="btn btn-word btn-sm"
            onClick={handleExportWord}
            disabled={!!exporting || total === 0}
            id="export-word-btn"
          >
            {exporting === 'word' ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <FileDown size={14} />}
            Download Word
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab${activeTab === 'guests' ? ' active' : ''}`} onClick={() => setActiveTab('guests')}>
          👥 Guest List
        </button>
        <button className={`tab${activeTab === 'add' ? ' active' : ''}`} onClick={() => setActiveTab('add')} id="add-guest-tab">
          ➕ Add Guest
        </button>
        <button className={`tab${activeTab === 'bulk' ? ' active' : ''}`} onClick={() => setActiveTab('bulk')} id="bulk-import-tab">
          📤 Bulk Import
        </button>
      </div>

      {/* Tab: Guest List */}
      {activeTab === 'guests' && (
        <>
          <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: 16 }}>
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                className="search-input"
                placeholder="Search by name, mobile, place..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="guest-search"
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            {search && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch}>
                <X size={14} /> Clear
              </button>
            )}
          </form>

          {search && (
            <div className="alert alert-info" style={{ marginBottom: 12 }}>
              Showing results for "<strong>{search}</strong>" — {total} found
            </div>
          )}

          <GuestTable
            guests={guests}
            onDelete={handleDeleteGuest}
            onUpdate={handleUpdateGuest}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total} guests
              </div>
              <div className="pagination-btns">
                <button
                  className="page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      className={`page-btn${page === p ? ' active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  className="page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Add Guest */}
      {activeTab === 'add' && (
        <GuestForm lotId={lotId} onGuestAdded={handleAddGuest} loading={loading} />
      )}

      {/* Tab: Bulk Import */}
      {activeTab === 'bulk' && (
        <div className="card animate-fadein">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Upload size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bulk Import Guests</div>
              <div className="text-xs text-muted">Add up to 500 guests at once</div>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <strong>Format:</strong> One guest per line.<br />
            <code style={{ fontSize: '0.78rem' }}>FirstName, FatherName, Surname, MobileNumber, Place</code><br />
            All fields are optional. Leave blank for empty values.
          </div>

          {/* Document File Uploader */}
          <div 
            style={{ 
              border: '2px dashed rgba(184, 134, 11, 0.25)', 
              borderRadius: 'var(--radius)', 
              padding: '24px', 
              textAlign: 'center', 
              marginBottom: '20px',
              background: 'rgba(184, 134, 11, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.25)'}
          >
            <div style={{
              width: 48, height: 48,
              background: 'rgba(184, 134, 11, 0.08)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 4
            }}>
              {fileParsing ? (
                <Loader2 size={22} className="animate-spin" style={{ color: 'var(--primary-dark)', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <FileUp size={22} style={{ color: 'var(--primary-dark)' }} />
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Import from Document
            </div>
            <div className="text-xs text-muted" style={{ maxWidth: '320px', lineHeight: 1.5 }}>
              Upload any PDF, Word (.docx), or Text (.txt) guest list. We will extract the names automatically.
            </div>
            
            <label className="btn btn-secondary btn-sm" style={{ marginTop: 8, cursor: 'pointer' }}>
              <Upload size={14} />
              Choose Document File
              <input 
                type="file" 
                accept=".pdf,.docx,.txt,.csv" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
                disabled={fileParsing}
              />
            </label>
          </div>

          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            <AlertTriangle size={14} /> Example Format:<br />
            <code style={{ fontSize: '0.78rem' }}>
              Rahul, Kumar, Sharma, 9876543210, Mumbai<br />
              Priya, Raj, Patel, 9123456789, Delhi<br />
              , , Gupta, , Pune
            </code>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Guest Data</label>
            <textarea
              className="form-input"
              id="bulk-import-textarea"
              style={{ minHeight: 220, resize: 'vertical', lineHeight: 1.7 }}
              placeholder={`Rahul, Kumar, Sharma, 9876543210, Mumbai\nPriya, Raj, Patel, 9123456789, Delhi\n...`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="text-xs text-muted" style={{ marginTop: 6 }}>
              {bulkText.trim().split('\n').filter(Boolean).length} rows entered
              {bulkText.trim().split('\n').filter(Boolean).length > 500 && (
                <span style={{ color: '#e74c3c', marginLeft: 8 }}>⚠ Maximum 500 rows</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleBulkImport}
              disabled={bulkImporting || !bulkText.trim()}
              id="bulk-import-btn"
            >
              {bulkImporting ? (
                <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Importing...</>
              ) : (
                <><Upload size={15} /> Import Guests</>
              )}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setBulkText('')}
              disabled={bulkImporting}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
