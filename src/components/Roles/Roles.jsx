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

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    location: '',
    shop: '',
    role_create: false,
    role_edit: false,
    role_delete: false,
    role_view: false,
    user_create: false,
    user_edit: false,
    user_delete: false,
    user_view: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  useEffect(() => {
    Promise.all([fetchRoles(), fetchCompanies()]).finally(() => setInitialLoad(false));
  }, []);

  const fetchRoles = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/roles/');
      // Sort by id descending so new roles appear at the top
      const sorted = res.data.sort((a, b) => b.id - a.id);
      setRoles(sorted);
    } catch (err) {
      console.error(err);
      showToast('Failed to load roles', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load companies', 'error');
    }
  };

  // Fetch locations when company changes (for the form modal)
  useEffect(() => {
    if (!formData.company) {
      setLocations([]);
      setFormData(prev => ({ ...prev, location: '', shop: '' }));
      return;
    }
    const selectedCompany = companies.find(c => c.id === parseInt(formData.company));
    if (!selectedCompany) return;
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.get(`/locations/?company=${selectedCompany.id}`);
        setLocations(res.data);
        if (res.data.length > 0 && !res.data.some(loc => loc.id === parseInt(formData.location))) {
          setFormData(prev => ({ ...prev, location: '', shop: '' }));
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, [formData.company, companies]);

  // Fetch shops when location changes (for the form modal)
  useEffect(() => {
    if (!formData.location) {
      setShops([]);
      setFormData(prev => ({ ...prev, shop: '' }));
      return;
    }
    const selectedLocation = locations.find(l => l.id === parseInt(formData.location));
    if (!selectedLocation) return;
    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const res = await api.get(`/shops/?location=${selectedLocation.id}`);
        setShops(res.data);
      } catch (err) {
        console.error('Failed to load shops', err);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, [formData.location, locations]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: formData.name,
      company: parseInt(formData.company),
      location: parseInt(formData.location),
      shop: parseInt(formData.shop),
      role_create: formData.role_create,
      role_edit: formData.role_edit,
      role_delete: formData.role_delete,
      role_view: formData.role_view,
      user_create: formData.user_create,
      user_edit: formData.user_edit,
      user_delete: formData.user_delete,
      user_view: formData.user_view,
    };
    try {
      if (editingId) {
        await api.put(`/roles/${editingId}/`, payload);
        showToast('Role updated successfully');
      } else {
        await api.post('/roles/', payload);
        showToast('Role created successfully');
      }
      fetchRoles();
      resetForm();
      setFormModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      company: '',
      location: '',
      shop: '',
      role_create: false,
      role_edit: false,
      role_delete: false,
      role_view: false,
      user_create: false,
      user_edit: false,
      user_delete: false,
      user_view: false,
    });
    setLocations([]);
    setShops([]);
    setFormModalOpen(true);
  };

  const openEditModal = async (role) => {
    setEditingId(role.id);
    setFormData({
      name: role.name,
      company: role.company,
      location: role.location,
      shop: role.shop,
      role_create: role.role_create,
      role_edit: role.role_edit,
      role_delete: role.role_delete,
      role_view: role.role_view,
      user_create: role.user_create,
      user_edit: role.user_edit,
      user_delete: role.user_delete,
      user_view: role.user_view,
    });
    if (role.company) {
      try {
        const res = await api.get(`/locations/?company=${role.company}`);
        setLocations(res.data);
      } catch (err) {
        console.error('Failed to load locations', err);
      }
      if (role.location) {
        try {
          const res = await api.get(`/shops/?location=${role.location}`);
          setShops(res.data);
        } catch (err) {
          console.error('Failed to load shops', err);
        }
      }
    }
    setFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/roles/${roleToDelete.id}/`);
      fetchRoles();
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      showToast('Role deleted successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete role', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openViewModal = (role) => {
    setSelectedRole(role);
    setViewModalOpen(true);
  };

  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      company: '',
      location: '',
      shop: '',
      role_create: false,
      role_edit: false,
      role_delete: false,
      role_view: false,
      user_create: false,
      user_edit: false,
      user_delete: false,
      user_view: false,
    });
    setLocations([]);
    setShops([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRoles = filteredRoles.length;
  const totalPages = Math.ceil(totalRoles / rowsPerPage);
  const paginatedRoles = filteredRoles.slice(
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

  if (initialLoad) {
    return (
      <div className="fade-in">
        <div className="skeleton h-8 w-48 mb-4 pulse"></div>
        <div className="skeleton h-4 w-64 mb-4 pulse"></div>
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

      {/* Header with title, description, and actions */}
      <div className="admin-header-section">
        <div className="header-info">
          <h2 className="page-title">Role Management</h2>
          <p className="page-description">Define roles and permissions ({totalRoles} total)</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-light icon-btn"
            onClick={fetchRoles}
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
          <button className="btn btn-primary" onClick={openCreateModal}>
            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '8px' }}>
              <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
            Create Role
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
            placeholder="Search role..."
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Roles Table Card */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-row-hover" style={{ minWidth: '700px' }}>
            <thead style={{ background: '#f9fafc' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>Role Name</th>
                <th style={{ padding: '16px 12px' }}>Users Count</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map(role => (
                  <tr key={role.id} className="table-row-hover">
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>{role.name}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span className="badge badge-light" style={{ fontSize: '0.85rem' }}>
                        {role.users_count || 0} users
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-icon-action"
                          onClick={() => openViewModal(role)}
                          title="View"
                        >
                          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon-action"
                          onClick={() => openEditModal(role)}
                          title="Edit"
                        >
                          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon-action delete"
                          onClick={() => openDeleteModal(role)}
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
                  <td colSpan="3" className="text-center py-5 text-muted">No roles found</td>
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
            <span className="text-muted">of {totalRoles} entries</span>
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

      {/* Create/Edit Role Modal (glass, scrollable) */}
      {formModalOpen && (
        <div className="modal-overlay" onClick={() => setFormModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Role' : 'Create New Role'}</h3>
              <button className="modal-close-btn" onClick={() => setFormModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Role Name */}
              <div className="input-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="name"
                  className="modal-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter role name"
                />
              </div>

              {/* Company */}
              <div className="input-group">
                <label>Company *</label>
                <select
                  name="company"
                  className="modal-input"
                  value={formData.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="input-group">
                <label>Location *</label>
                <select
                  name="location"
                  className="modal-input"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={!formData.company || loadingLocations}
                >
                  <option value="">
                    {!formData.company
                      ? 'Select a company first'
                      : loadingLocations
                      ? 'Loading locations...'
                      : 'Select location'}
                  </option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Shop */}
              <div className="input-group">
                <label>Shop *</label>
                <select
                  name="shop"
                  className="modal-input"
                  value={formData.shop}
                  onChange={handleChange}
                  required
                  disabled={!formData.location || loadingShops}
                >
                  <option value="">
                    {!formData.location
                      ? 'Select a location first'
                      : loadingShops
                      ? 'Loading shops...'
                      : 'Select shop'}
                  </option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div className="permissions-section mt-4">
                <h4 className="fw-bold mb-2">Role Management Permissions</h4>
                <div className="d-flex flex-wrap gap-4">
                  <label className="checkbox-label">
                    <input type="checkbox" name="role_create" checked={formData.role_create} onChange={handleChange} />
                    <span>Create</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="role_edit" checked={formData.role_edit} onChange={handleChange} />
                    <span>Edit</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="role_delete" checked={formData.role_delete} onChange={handleChange} />
                    <span>Delete</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="role_view" checked={formData.role_view} onChange={handleChange} />
                    <span>View</span>
                  </label>
                </div>

                <h4 className="fw-bold mb-2 mt-3">User Management Permissions</h4>
                <div className="d-flex flex-wrap gap-4">
                  <label className="checkbox-label">
                    <input type="checkbox" name="user_create" checked={formData.user_create} onChange={handleChange} />
                    <span>Create</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="user_edit" checked={formData.user_edit} onChange={handleChange} />
                    <span>Edit</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="user_delete" checked={formData.user_delete} onChange={handleChange} />
                    <span>Delete</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="user_view" checked={formData.user_view} onChange={handleChange} />
                    <span>View</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-light" onClick={() => setFormModalOpen(false)}>
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

      {/* View Role Modal (glass) */}
      {viewModalOpen && selectedRole && (
        <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Role Details</h3>
              <button className="modal-close-btn" onClick={() => setViewModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="d-flex align-center mb-4">
                <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                  {selectedRole.name ? selectedRole.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div style={{ marginLeft: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedRole.name}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>ID: {selectedRole.id}</p>
                </div>
              </div>

              <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-item">
                  <label className="text-muted small">Company</label>
                  <div className="fw-bold">{selectedRole.company_name || '-'}</div>
                </div>
                <div className="info-item">
                  <label className="text-muted small">Location</label>
                  <div className="fw-bold">{selectedRole.location_name || '-'}</div>
                </div>
                <div className="info-item">
                  <label className="text-muted small">Shop</label>
                  <div className="fw-bold">{selectedRole.shop_name || '-'}</div>
                </div>
                <div className="info-item">
                  <label className="text-muted small">Created</label>
                  <div className="fw-bold">{formatDate(selectedRole.created_at)}</div>
                </div>
                <div className="info-item">
                  <label className="text-muted small">Users with this role</label>
                  <div className="fw-bold">{selectedRole.users_count || 0}</div>
                </div>
              </div>

              <div className="permissions-section mt-4">
                <h4 className="fw-bold mb-2">Role Management Permissions</h4>
                <div className="d-flex flex-wrap gap-4">
                  <span className={`badge ${selectedRole.role_create ? 'badge-success' : 'badge-light'}`}>Create</span>
                  <span className={`badge ${selectedRole.role_edit ? 'badge-success' : 'badge-light'}`}>Edit</span>
                  <span className={`badge ${selectedRole.role_delete ? 'badge-success' : 'badge-light'}`}>Delete</span>
                  <span className={`badge ${selectedRole.role_view ? 'badge-success' : 'badge-light'}`}>View</span>
                </div>

                <h4 className="fw-bold mb-2 mt-3">User Management Permissions</h4>
                <div className="d-flex flex-wrap gap-4">
                  <span className={`badge ${selectedRole.user_create ? 'badge-success' : 'badge-light'}`}>Create</span>
                  <span className={`badge ${selectedRole.user_edit ? 'badge-success' : 'badge-light'}`}>Edit</span>
                  <span className={`badge ${selectedRole.user_delete ? 'badge-success' : 'badge-light'}`}>Delete</span>
                  <span className={`badge ${selectedRole.user_view ? 'badge-success' : 'badge-light'}`}>View</span>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-light" onClick={() => setViewModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (glass) */}
      {deleteModalOpen && roleToDelete && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the role <strong>“{roleToDelete.name}”</strong>? This action cannot be undone.
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

export default Roles;