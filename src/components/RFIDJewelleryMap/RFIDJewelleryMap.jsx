import { useState, useEffect } from 'react';
import api from '../../api';

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
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/rfid-jewellery-map/'),
      api.get('/jewellery/'),
      api.get('/rfid/')
    ])
      .then(([mapsRes, jewRes, rfidRes]) => {
        setMaps(mapsRes.data);
        setJewelleryList(jewRes.data);
        setRfidList(rfidRes.data);
        setInitialLoad(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setInitialLoad(false);
      });
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
    setError('');
    try {
      if (editingId) {
        const response = await api.put(`/rfid-jewellery-map/${editingId}/`, formData);
        setMaps(prev => prev.map(m => (m.id === editingId ? response.data : m)));
        setModalOpen(false);
      } else {
        const response = await api.post('/rfid-jewellery-map/', formData);
        setMaps(prev => [response.data, ...prev]);
        setModalOpen(false);
      }
    } catch (err) {
      setError('Failed to save mapping');
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
    } catch (err) {
      setError('Failed to delete mapping');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (initialLoad) {
    return (
      <div className="fade-in">
        <div className="skeleton h-8 w-48 mb-4"></div>
        <div className="skeleton h-10 w-full mb-4"></div>
        <div className="admin-card">
          <div className="skeleton h-10 w-full mb-3"></div>
          <div className="skeleton h-10 w-full mb-3"></div>
          <div className="skeleton h-10 w-full mb-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap align-center justify-content-between mb-4">
        <div>
          <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
            RFID‑Jewellery Mapping
          </h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Manage mappings ({totalMaps} total)
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '8px' }}>
            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
          </svg>
          Create Mapping
        </button>
      </div>

      {error && <div className="modal-error mb-3">{error}</div>}

      {/* Search */}
      <div className="admin-card p-3 mb-4">
        <div className="search-input-wrapper" style={{ maxWidth: '300px' }}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="search-icon" height="1em" width="1em">
            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
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
          <table className="table table-row-hover" style={{ minWidth: '800px' }}>
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
                  <tr key={map.id} className="table-row-hover" style={{ borderBottom: '1px solid #eff2f5' }}>
                    <td style={{ padding: '16px 20px' }}>{map.jewellery_id_str}</td>
                    <td style={{ padding: '16px 12px' }}>{map.rfid_tag}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span className={`badge ${map.status === 'active' ? 'badge-success' : 'badge-light'}`}>
                        {map.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>{map.added_by_username}</td>
                    <td style={{ padding: '16px 12px' }}>{formatDate(map.created_at)}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-icon btn-light btn-sm"
                          onClick={() => openEdit(map)}
                          title="Edit"
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                          </svg>
                        </button>
                        <button
                          className="btn btn-icon btn-light-danger btn-sm"
                          onClick={() => openDeleteModal(map)}
                          title="Delete"
                          style={{ color: '#f1416c', background: '#ffe8ec' }}
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
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
        <div className="d-flex flex-wrap gap-3 align-center justify-content-between" style={{ padding: '20px 24px', borderTop: '1px solid #eff2f5' }}>
          <div className="d-flex align-center">
            <span className="text-muted" style={{ marginRight: '12px' }}>Show</span>
            <select
              className="form-control form-select-sm"
              style={{ width: '70px', padding: '6px 8px', borderRadius: '20px', borderColor: '#e2e8f0' }}
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-muted" style={{ marginLeft: '12px' }}>
              of {totalMaps} entries
            </span>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ padding: '8px 16px', borderRadius: '30px' }}
            >
              Previous
            </button>
            <span className="btn btn-sm btn-primary" style={{ padding: '8px 16px', borderRadius: '30px', background: '#3e97ff', color: '#fff' }}>
              {currentPage}
            </span>
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ padding: '8px 16px', borderRadius: '30px' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Mapping' : 'Create New Mapping'}</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Jewellery *</label>
                <select name="jewellery" className="login-input" value={formData.jewellery} onChange={handleChange} required>
                  <option value="">Select jewellery</option>
                  {jewelleryList.map(j => (
                    <option key={j.id} value={j.id}>{j.jewellery_id}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>RFID Tag *</label>
                <select name="rfid" className="login-input" value={formData.rfid} onChange={handleChange} required>
                  <option value="">Select RFID</option>
                  {rfidList.map(r => (
                    <option key={r.id} value={r.id}>{r.tag}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select name="status" className="login-input" value={formData.status} onChange={handleChange}>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && mapToDelete && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            <div className="modal-form">
              <p style={{ fontSize: '1rem', color: '#5e6278' }}>
                Are you sure you want to delete mapping <strong>“{mapToDelete.jewellery_id_str} – {mapToDelete.rfid_tag}”</strong>? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn btn-light" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{ backgroundColor: '#f1416c', color: '#fff', border: 'none' }}
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