import { useState, useEffect } from 'react';
import api from '../../api';

// Toast component (inline – you can move to a separate file later)
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

const RFIDJewelleryMap = () => {
  const [maps, setMaps] = useState([]);
  const [jewelleryList, setJewelleryList] = useState([]);
  const [rfidList, setRfidList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jewellery: '',
    rfid: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [mapsRes, jewRes, rfidRes] = await Promise.all([
        api.get('/rfid-jewellery-map/'),
        api.get('/jewellery/'),
        api.get('/rfid/')
      ]);
      setMaps(mapsRes.data);
      setJewelleryList(jewRes.data);
      setRfidList(rfidRes.data);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMaps = maps.filter(map =>
    map.jewellery_id_str?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    map.rfid_tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMaps = filteredMaps.length;
  const totalPages = Math.ceil(totalMaps / rowsPerPage);
  const paginatedMaps = filteredMaps.slice(
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

  const openCreate = () => {
    setEditingId(null);
    setFormData({ jewellery: '', rfid: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (map) => {
    setEditingId(map.id);
    setFormData({
      jewellery: map.jewellery,
      rfid: map.rfid,
      status: map.status,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const response = await api.put(`/rfid-jewellery-map/${editingId}/`, formData);
        setMaps(prev => prev.map(m => (m.id === editingId ? response.data : m)));
        showToast('Mapping updated successfully');
      } else {
        const response = await api.post('/rfid-jewellery-map/', formData);
        setMaps(prev => [response.data, ...prev]);
        showToast('Mapping created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      showToast('Failed to save mapping', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (map) => {
    setMapToDelete(map);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!mapToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/rfid-jewellery-map/${mapToDelete.id}/`);
      setMaps(prev => prev.filter(m => m.id !== mapToDelete.id));
      setDeleteModalOpen(false);
      setMapToDelete(null);
      showToast('Mapping deleted successfully');
    } catch (err) {
      showToast('Failed to delete mapping', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick status toggle
  const toggleStatus = async (map) => {
    const newStatus = map.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.patch(`/rfid-jewellery-map/${map.id}/`, { status: newStatus });
      setMaps(prev => prev.map(m => (m.id === map.id ? response.data : m)));
      showToast(`Status changed to ${newStatus}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Copy RFID tag to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('RFID tag copied to clipboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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

      {/* Header with title, description and actions */}
      <div className="admin-header-section">
        <div className="header-info">
          <h2 className="page-title">RFID‑Jewellery Mapping</h2>
          <p className="page-description">Manage mappings ({totalMaps} total)</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-light icon-btn"
            onClick={fetchData}
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
          <button className="btn btn-primary" onClick={openCreate}>
            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '8px' }}>
              <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
            Create Mapping
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
            placeholder="Search by jewellery ID or RFID tag..."
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-row-hover" style={{ minWidth: '900px' }}>
            <thead style={{ background: '#f9fafc' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>Jewellery ID</th>
                <th style={{ padding: '16px 12px' }}>RFID Tag</th>
                <th style={{ padding: '16px 12px' }}>Status</th>
                <th style={{ padding: '16px 12px' }}>Added By</th>
                <th style={{ padding: '16px 12px' }}>Created</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaps.length > 0 ? (
                paginatedMaps.map(map => (
                  <tr key={map.id} className="table-row-hover">
                    <td style={{ padding: '16px 20px' }}>{map.jewellery_id_str}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <div className="d-flex align-center gap-2">
                        <span>{map.rfid_tag}</span>
                        <button
                          className="btn-icon-copy"
                          onClick={() => copyToClipboard(map.rfid_tag)}
                          title="Copy RFID tag"
                        >
                          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="16" width="16">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span
                        className={`badge ${map.status === 'active' ? 'badge-success' : 'badge-light'} cursor-pointer`}
                        onClick={() => toggleStatus(map)}
                        title="Click to toggle status"
                      >
                        {map.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>{map.added_by_username}</td>
                    <td style={{ padding: '16px 12px' }}>{formatDate(map.created_at)}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-icon-action"
                          onClick={() => openEdit(map)}
                          title="Edit"
                        >
                          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon-action delete"
                          onClick={() => openDeleteModal(map)}
                          title="Delete"
                        >
                          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No mappings found</td>
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
            <span className="text-muted">of {totalMaps} entries</span>
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

      {/* Create/Edit Modal (glass) */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Mapping' : 'Create New Mapping'}</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Jewellery *</label>
                <select
                  name="jewellery"
                  className="modal-input"
                  value={formData.jewellery}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select jewellery</option>
                  {jewelleryList.map(j => (
                    <option key={j.id} value={j.id}>{j.jewellery_id}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>RFID Tag *</label>
                <select
                  name="rfid"
                  className="modal-input"
                  value={formData.rfid}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select RFID</option>
                  {rfidList.map(r => (
                    <option key={r.id} value={r.id}>{r.tag}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select
                  name="status"
                  className="modal-input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (glass) */}
      {deleteModalOpen && mapToDelete && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete mapping <strong>“{mapToDelete.jewellery_id_str} – {mapToDelete.rfid_tag}”</strong>? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDJewelleryMap;