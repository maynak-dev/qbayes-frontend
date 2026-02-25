import { useState, useEffect } from 'react';
import api from '../../api';

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
  const [error, setError] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetchRoles(), fetchCompanies()]).finally(() => setInitialLoad(false));
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles/');
      // Sort by id descending so new roles appear at the top
      const sorted = res.data.sort((a, b) => b.id - a.id);
      setRoles(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to load roles');
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load companies');
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
    setError('');
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
      } else {
        await api.post('/roles/', payload);
      }
      fetchRoles(); // refetch to get updated list (new roles at top)
      resetForm();
      setFormModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save role');
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
    } catch (err) {
      console.error(err);
      setError('Failed to delete role');
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

  if (initialLoad) {
    return (
      <div className="fade-in">
        <div className="skeleton h-8 w-48 mb-4"></div>
        <div className="admin-card">
          <div className="skeleton h-6 w-32 mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-10 w-full mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex align-center justify-content-between mb-4">
        <h2 className="card-title" style={{ fontSize: '1.5rem' }}>
          Role Management
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '6px' }}>
            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
          </svg>
          Create Role
        </button>
      </div>

      {error && <div className="modal-error mb-3">{error}</div>}

      {/* Roles List Card */}
      <div className="admin-card">
        <h3 className="card-title mb-3">Existing Roles</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Location</th>
                <th>Shop</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.company_name}</td>
                  <td>{role.location_name}</td>
                  <td>{role.shop_name}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {/* View button */}
                      <button
                        className="btn btn-icon btn-light btn-sm"
                        onClick={() => openViewModal(role)}
                        title="View"
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                        </svg>
                      </button>
                      {/* Edit button */}
                      <button
                        className="btn btn-icon btn-light btn-sm"
                        onClick={() => openEditModal(role)}
                        title="Edit"
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                        </svg>
                      </button>
                      {/* Delete button */}
                      <button
                        className="btn btn-icon btn-light-danger btn-sm"
                        onClick={() => openDeleteModal(role)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {formModalOpen && (
        <div className="modal-overlay" onClick={() => setFormModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Role' : 'Create New Role'}</h3>
              <button className="modal-close-btn" onClick={() => setFormModalOpen(false)}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Role Name */}
              <div className="input-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="name"
                  className="login-input"
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
                  className="login-input"
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
                  className="login-input"
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
                  className="login-input"
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
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="role_create" checked={formData.role_create} onChange={handleChange} />
                    Create
                  </label>
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="role_edit" checked={formData.role_edit} onChange={handleChange} />
                    Edit
                  </label>
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="role_delete" checked={formData.role_delete} onChange={handleChange} />
                    Delete
                  </label>
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="role_view" checked={formData.role_view} onChange={handleChange} />
                    View
                  </label>
                </div>

                <h4 className="fw-bold mb-2 mt-3">User Management Permissions</h4>
                <div className="d-flex flex-wrap gap-4">
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="user_create" checked={formData.user_create} onChange={handleChange} />
                    Create
                  </label>
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="user_edit" checked={formData.user_edit} onChange={handleChange} />
                    Edit
                  </label>
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="user_delete" checked={formData.user_delete} onChange={handleChange} />
                    Delete
                  </label>
                  <label className="d-flex align-center gap-2">
                    <input type="checkbox" name="user_view" checked={formData.user_view} onChange={handleChange} />
                    View
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

      {/* View Role Modal */}
      {viewModalOpen && selectedRole && (
        <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Role Details</h3>
              <button className="modal-close-btn" onClick={() => setViewModalOpen(false)}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            <div className="modal-form" style={{ padding: '24px' }}>
              <div className="d-flex align-center mb-4">
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: '#3e97ff20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#3e97ff',
                    marginRight: '15px',
                  }}
                >
                  {selectedRole.name ? selectedRole.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
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

      {/* Delete Role Modal */}
      {deleteModalOpen && roleToDelete && (
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
                Are you sure you want to delete the role <strong>“{roleToDelete.name}”</strong>? This action cannot be undone.
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

export default Roles;