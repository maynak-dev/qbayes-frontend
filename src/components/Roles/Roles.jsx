import { useState, useEffect } from 'react';
import api from '../../api';
import ViewRoleModal from '../Modals/ViewRoleModal';

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    Promise.all([fetchRoles(), fetchCompanies()]).finally(() => setInitialLoad(false));
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/user-roles/');
      setRoles(res.data);
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

  // Fetch locations when company changes
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

  // Fetch shops when location changes
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
        await api.put(`/user-roles/${editingId}/`, payload);
      } else {
        await api.post('/user-roles/', payload);
      }
      fetchRoles();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (role) => {
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/user-roles/${id}/`);
      fetchRoles();
    } catch (err) {
      console.error(err);
      setError('Failed to delete role');
    }
  };

  // This function opens the modal – no alert
  const handleView = (role) => {
    console.log('Opening view modal for role:', role);
    setSelectedRole(role);
    setViewModalOpen(true);
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

  if (initialLoad) {
    return (
      <div className="fade-in">
        <div className="skeleton h-8 w-48 mb-4"></div>
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="admin-card">
            <div className="skeleton h-6 w-32 mb-4"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full mb-3"></div>
            ))}
          </div>
          <div className="admin-card">
            <div className="skeleton h-6 w-32 mb-4"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full mb-3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Role Management
      </h2>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Form Card */}
        <div className="admin-card">
          <h3 className="card-title mb-3">{editingId ? 'Edit Role' : 'Create New Role'}</h3>
          {error && <div className="modal-error">{error}</div>}
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
              <button type="button" className="btn btn-light" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>

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
                        {/* Eye button – opens modal */}
                        <button
                          className="btn btn-icon btn-light btn-sm"
                          onClick={() => handleView(role)}
                          title="View"
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                          </svg>
                        </button>
                        {/* Edit button */}
                        <button
                          className="btn btn-icon btn-light btn-sm"
                          onClick={() => handleEdit(role)}
                          title="Edit"
                        >
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          className="btn btn-icon btn-light btn-sm"
                          onClick={() => handleDelete(role.id)}
                          title="Delete"
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
      </div>

      {/* View Role Modal */}
      <ViewRoleModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        role={selectedRole}
      />
    </div>
  );
};

export default Roles;
