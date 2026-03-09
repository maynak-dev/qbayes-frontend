import { useState, useEffect } from 'react';
import api from '../../api';

// Toast component (inline – can be moved to a shared file later)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
};

const RFIDScans = () => {
  const [scans, setScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const fetchScans = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/rfid-scans/');
      setScans(res.data);
    } catch (err) {
      showToast('Failed to load scans', 'error');
    } finally {
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  // Filter scans by RFID tag
  const filteredScans = scans.filter(scan =>
    scan.rfid_tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalScans = filteredScans.length;
  const totalPages = Math.ceil(totalScans / rowsPerPage);
  const paginatedScans = filteredScans.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (initialLoad) {
    return (
      <div className="fade-in">
        <div className="skeleton h-8 w-48 mb-4 pulse"></div>
        <div className="skeleton h-10 w-full mb-4 pulse"></div>
        <div className="admin-card">
          <div className="skeleton h-10 w-full mb-3 pulse"></div>
          <div className="skeleton h-10 w-full mb-3 pulse"></div>
          <div className="skeleton h-10 w-full mb-3 pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="admin-header-section">
        <div className="header-info">
          <h2 className="page-title">RFID Scans</h2>
          <p className="page-description">Real‑time scans from MQTT ({totalScans} total)</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-light icon-btn"
            onClick={fetchScans}
            disabled={refreshing}
            title="Refresh"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 24 24"
              height="1.2rem"
              width="1.2rem"
              className={refreshing ? 'spinner' : ''}
            >
              <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card p-3 mb-4">
        <div className="search-input-wrapper" style={{ maxWidth: '300px' }}>
          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className="search-icon" height="1em" width="1em">
            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
          </svg>
          <input
            className="form-control search-input"
            placeholder="Search by RFID tag..."
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-row-hover" style={{ minWidth: '800px' }}>
            <thead style={{ background: '#f9fafc' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>RFID Tag</th>
                <th style={{ padding: '16px 12px' }}>Linked RFID</th>
                <th style={{ padding: '16px 12px' }}>Payload (Preview)</th>
                <th style={{ padding: '16px 12px' }}>Scanned At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedScans.length > 0 ? (
                paginatedScans.map(scan => (
                  <tr key={scan.id} className="table-row-hover">
                    <td style={{ padding: '16px 20px' }}>
                      <strong>{scan.rfid_tag}</strong>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {scan.rfid ? (
                        <span className="badge badge-success">Linked</span>
                      ) : (
                        <span className="badge badge-light">Unlinked</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(scan.payload).substring(0, 50)}...
                    </td>
                    <td style={{ padding: '16px 12px' }}>{formatDateTime(scan.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">No scans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-footer">
          <div className="d-flex align-center">
            <span className="text-muted">Show</span>
            <select
              className="rows-select"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-muted">of {totalScans} entries</span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="pagination-current">{currentPage}</span>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFIDScans;