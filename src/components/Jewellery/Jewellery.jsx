import { useState, useEffect } from 'react';
import api from '../../api';

// Toast component (inline – can be moved to a separate file)
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

const Jewellery = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jewellery_id: '',
    design_number: '',
    collection_type: '',
    metal_type: '',
    category: '',
    sub_category: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const fetchItems = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/jewellery/');
      setItems(res.data);
    } catch (err) {
      showToast('Failed to load jewellery', 'error');
    } finally {
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    item.jewellery_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.design_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedItems = filteredItems.slice(
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
    setFormData({
      jewellery_id: '',
      design_number: '',
      collection_type: '',
      metal_type: '',
      category: '',
      sub_category: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      jewellery_id: item.jewellery_id,
      design_number: item.design_number,
      collection_type: item.collection_type,
      metal_type: item.metal_type,
      category: item.category,
      sub_category: item.sub_category,
      status: item.status,
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
        const response = await api.put(`/jewellery/${editingId}/`, formData);
        setItems(prev => prev.map(item => (item.id === editingId ? response.data : item)));
        showToast('Jewellery updated successfully');
      } else {
        const response = await api.post('/jewellery/', formData);
        setItems(prev => [response.data, ...prev]);
        showToast('Jewellery created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      showToast('Failed to save jewellery', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/jewellery/${itemToDelete.id}/`);
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      showToast('Jewellery deleted successfully');
    } catch (err) {
      showToast('Failed to delete jewellery', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle status (requires backend PATCH support)
  const toggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.patch(`/jewellery/${item.id}/`, { status: newStatus });
      setItems(prev => prev.map(i => (i.id === item.id ? response.data : i)));
      showToast(`Status changed to ${newStatus}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
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
          <h2 className="page-title">Jewellery Management</h2>
          <p className="page-description">Manage jewellery items ({totalItems} total)</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-light icon-btn"
            onClick={fetchItems}
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
            Create Jewellery
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
            placeholder="Search by jewellery ID or design number..."
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-row-hover" style={{ minWidth: '1100px' }}>
            <thead style={{ background: '#f9fafc' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>Jewellery ID</th>
                <th style={{ padding: '16px 12px' }}>Design Number</th>
                <th style={{ padding: '16px 12px' }}>Collection</th>
                <th style={{ padding: '16px 12px' }}>Metal</th>
                <th style={{ padding: '16px 12px' }}>Category</th>
                <th style={{ padding: '16px 12px' }}>Sub‑category</th>
                <th style={{ padding: '16px 12px' }}>Status</th>
                <th style={{ padding: '16px 12px' }}>Added By</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map(item => (
                  <tr key={item.id} className="table-row-hover">
                    <td style={{ padding: '16px 20px' }}>{item.jewellery_id}</td>
                    <td style={{ padding: '16px 12px' }}>{item.design_number}</td>
                    <td style={{ padding: '16px 12px' }}>{item.collection_type}</td>
                    <td style={{ padding: '16px 12px' }}>{item.metal_type}</td>
                    <td style={{ padding: '16px 12px' }}>{item.category}</td>
                    <td style={{ padding: '16px 12px' }}>{item.sub_category}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span
                        className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-light'} cursor-pointer`}
                        onClick={() => toggleStatus(item)}
                        title="Click to toggle status"
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>{item.added_by_username}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-icon-action"
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon-action delete"
                          onClick={() => openDeleteModal(item)}
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
                  <td colSpan="9" className="text-center py-5 text-muted">No jewellery found</td>
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
            <span className="text-muted">of {totalItems} entries</span>
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

      {/* Create/Edit Modal (glass, scrollable) */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Jewellery' : 'Create New Jewellery'}</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Jewellery ID *</label>
                <input
                  type="text"
                  name="jewellery_id"
                  className="modal-input"
                  value={formData.jewellery_id}
                  onChange={handleChange}
                  required
                  placeholder="e.g. J1001"
                />
              </div>
              <div className="input-group">
                <label>Design Number *</label>
                <input
                  type="text"
                  name="design_number"
                  className="modal-input"
                  value={formData.design_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g. D101"
                />
              </div>
              <div className="input-group">
                <label>Collection Type</label>
                <input
                  type="text"
                  name="collection_type"
                  className="modal-input"
                  value={formData.collection_type}
                  onChange={handleChange}
                  placeholder="e.g. Gold, Platinum"
                />
              </div>
              <div className="input-group">
                <label>Metal Type</label>
                <input
                  type="text"
                  name="metal_type"
                  className="modal-input"
                  value={formData.metal_type}
                  onChange={handleChange}
                  placeholder="e.g. Yellow Gold"
                />
              </div>
              <div className="input-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  className="modal-input"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Ring, Necklace"
                />
              </div>
              <div className="input-group">
                <label>Sub‑category</label>
                <input
                  type="text"
                  name="sub_category"
                  className="modal-input"
                  value={formData.sub_category}
                  onChange={handleChange}
                  placeholder="e.g. Engagement, Wedding"
                />
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
      {deleteModalOpen && itemToDelete && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete jewellery <strong>“{itemToDelete.jewellery_id}”</strong>? This action cannot be undone.
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

export default Jewellery;